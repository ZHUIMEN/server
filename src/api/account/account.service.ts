import { Inject, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from '@src/api/account/entities/account.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { LoginHistoryEntity } from '@src/api/login/entities/login.history.entity';
import { UserException } from '@src/common/exceptions/user.exception.error';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ResultVo } from '@src/common/vo/result.vo';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';
import { FindAccountType } from '@src/types';
import { IPAddress, IpToAddressService } from '@src/plugin/ip-to-address/ip-to-address.service';
import { AccountTokenEntity } from '@src/api/login/entities/account.token.entity';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@src/plugin/redis/redis.service';
import moment = require('moment');

@Injectable()
export class AccountService {
  constructor(
    @InjectPinoLogger(AccountService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(LoginHistoryEntity)
    private readonly loginHistoryRepository: Repository<LoginHistoryEntity>,
    @InjectRepository(AccountTokenEntity)
    private readonly accountTokenRepository: Repository<AccountTokenEntity>,
    private readonly dataSource: DataSource,
    public readonly ipToAddressService: IpToAddressService,
    public readonly configService: ConfigService,
    public readonly redisService: RedisService
  ) {}

  /**
   * @Description: 创建账号
   * @param createAccountDto
   */
  async create(createAccountDto: CreateAccountDto) {
    // 1、查询是否有相同的用户名
    // 2、如果不存在则新建
    // 3、如果存在在抛出错误
    const accountResult = await this.accountRepository.findOne({
      where: [
        { username: createAccountDto.username },
        { mobile: createAccountDto.mobile },
        { email: createAccountDto.email },
      ],
    });
    this.logger.debug('accountResult%o', accountResult);
    if (accountResult?.id) {
      this.logger.info(`用户名/手机号码/邮箱已经存在，不能重复创建:${createAccountDto.username}`);
      throw new UserException(
        '用户名/手机号码/邮箱已经存在，不能重复创建',
        ApiErrorCode.PARAMS_INVAL,
        createAccountDto
      );
    }
    const accountEntity = this.accountRepository.create(createAccountDto);
    await this.accountRepository.save(accountEntity);
    return ResultVo.ok<boolean>(true, '创建成功');
  }

  /**
   * 查找用户是否存在 认证使用
   * @param username
   */
  async findByUsername(username: string) {
    // 因为  AccountEntity select: false, 拿不到password,
    // const account = await this.accountRepository.findOne({
    //   where: { username },
    // });
    const account = await this.queryLoginBuilder.where('(account.username = :username)', { username }).getRawOne();

    return account;
  }

  /**
   * @Description: 内部拼装sql
   * @private
   */
  public get queryLoginBuilder(): SelectQueryBuilder<FindAccountType<AccountEntity>> {
    return this.accountRepository
      .createQueryBuilder('account')
      .select('account.id', 'id')
      .addSelect('account.username', 'username')
      .addSelect('account.mobile', 'mobile')
      .addSelect('account.email', 'email')
      .addSelect('account.status', 'status')
      .addSelect('account.isSuper', 'isSuper')
      .addSelect('account.password', 'password');
  }

  /**
   * 通过id查找
   */
  async findByUserId(userid: number): Promise<AccountEntity> {
    // NOTE 这里有坑 当where 的查询条件是underfund 时 回放数据库里的第一条数据
    if (userid || !isNaN(userid)) {
      return await this.accountRepository.findOne({ where: { id: userid } });
    } else {
      throw new UserException('用户信息错误，尝试重新登录');
    }
    return null;
  }

  /**
   * @Description: 将token存储到redis中和数据库中
   * @param {findAccountType} accountEntity
   * @param {string} token
   * @param {string} ipAddress
   * @return {*}
   */

  public async cacheTokenAndLoginInfo(
    accountEntity: FindAccountType<AccountEntity>,
    token: string,
    ipAddress: string
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); // 开启事物
    // 根据id查询到地址
    // const ipAddressResult: IPAddress = await this.ipToAddressService.getAddress(ipAddress);
    try {
      const tokenExpire: number = this.configService.get('TOKEN_EXPIRE') ?? 1;
      console.log(moment.duration(tokenExpire, 'days').asSeconds());

      await this.redisService.set(token, accountEntity, moment.duration(tokenExpire, 'days').asSeconds());

      // 登录历史表中插入数据
      const loginHistoryEntity = queryRunner.manager.create<LoginHistoryEntity>(LoginHistoryEntity, {
        accountId: accountEntity.id,
        loginTime: new Date(),
        loginIp: ipAddress,
        // nation: ipAddressResult.nation,
        // province: ipAddressResult.province,
        // city: ipAddressResult.city,
        // district: ipAddressResult.district,
        // adcode: ipAddressResult.adcode,
      });
      await queryRunner.manager.save<LoginHistoryEntity>(loginHistoryEntity);
      // 更新账号token表
      const accountTokenEntity: Pick<AccountTokenEntity, 'token' | 'id'> | null =
        await this.accountTokenRepository.findOne({
          where: { accountId: accountEntity.id },
          select: ['token', 'id'],
        });

      // 存在就更新，否则就创建
      if (accountTokenEntity) {
        // 删除老的redis里的token
        this.redisService.del(accountTokenEntity.token);
        await queryRunner.manager.update<AccountTokenEntity>(
          AccountTokenEntity,
          {
            id: accountTokenEntity.id,
          },
          {
            // 设置token失效时间
            expireTime: moment().add(tokenExpire, 'days').format('YYYY-MM-DD HH:mm:ss'),
            token,
          }
        );
      } else {
        const accountCreateResult: AccountTokenEntity = queryRunner.manager.create<AccountTokenEntity>(
          AccountTokenEntity,
          {
            accountId: accountEntity.id,
            token: token,
            expireTime: moment().add(tokenExpire, 'days').format('YYYY-MM-DD HH:mm:ss'),
          }
        );
        await queryRunner.manager.save<AccountTokenEntity>(accountCreateResult);
      }
      // 提交事务
      await queryRunner.commitTransaction();
    } catch (err) {
      // 回滚操作
      this.logger.error('存储账号token到redis中失败 %o', err);
      await queryRunner.rollbackTransaction();
      throw new UserException('账号密码错误', ApiErrorCode.PASSWORD_INVAL, err);
    } finally {
      // 最后你需要释放一个手动实例化的queryRunner
      await queryRunner.release();
    }
  }
}
