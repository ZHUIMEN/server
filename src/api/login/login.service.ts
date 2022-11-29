import { Injectable } from '@nestjs/common';
import { LoginVo } from '@src/api/login/vo/login.vo';
import { LoginDto } from '@src/api/login/dto/login.dto';
import type { Request } from 'express';
import { ResultVo } from '@src/common/vo/result.vo';
import { ToolsService } from '@src/plugin/tools/tools.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from '@src/api/account/entities/account.entity';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { isEmail, isMobilePhone } from 'class-validator';
import { StatusEnum } from '@src/enums';
import { UserException } from '@src/common/exceptions/user.exception.error';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';
import { AccountTokenEntity } from '@src/api/login/entities/account.token.entity';

type findAccountType = Omit<AccountEntity, 'created_at' | 'updated_at'>;

@Injectable()
export class LoginService {
  private dataSource: DataSource;

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    public readonly toolsService: ToolsService,
    private readonly accountTokenRepository: Repository<AccountTokenEntity>,
    @InjectPinoLogger(LoginService.name)
    private readonly logger: PinoLogger
  ) {}

  async login(loginDto: LoginDto, request: Request) {
    const ipAddress = this.toolsService.getReqIP(request);
    const { username, password } = loginDto;

    this.logger.debug('ip地址%s', ipAddress);
    const queryBuilder = this.queryLoginBuilder;
    let accountEntity: findAccountType | null | undefined;

    let usernameRep = username;

    // 根据手机号码查询
    if (isMobilePhone(username, 'zh-CN')) {
      accountEntity = await queryBuilder
        .where('(account.mobile = :mobile)', { mobile: username })
        .getRawOne();
      usernameRep = '';
    } else if (isEmail(username)) {
      // 根据邮箱查询
      accountEntity = await queryBuilder
        .where('(account.email = :email)', { email: username })
        .getRawOne();
      usernameRep = '';
    } else {
      // 用户名查询
      accountEntity = await queryBuilder
        .where('(account.username = :username)', { username })
        .getRawOne();
    }
    // 如果当前状态为禁止的时候直接返回
    if (accountEntity?.status === StatusEnum.FORBIDDEN) {
      throw new UserException('当前账号为禁用状态，请联系管理员', ApiErrorCode.ACCOUNT_INVAL);
    }
    if (accountEntity?.id && this.toolsService.checkPassword(password, accountEntity.password)) {
      // 生成token存储到token表中并且返回给前端
      try {
        await this.cacheTokenAndLoginInfo(accountEntity, token, ipAddress);
        return {
          token,
          id: accountEntity.id,
          username: usernameRep
            ? usernameRep
            : accountEntity.username.startsWith('_')
            ? ''
            : accountEntity.username,
          email: isEmail(accountEntity.email) ? accountEntity.email : '',
          mobile: isMobilePhone(accountEntity.mobile, 'zh-CN') ? accountEntity.mobile : '',
          isSuper: accountEntity.isSuper,
        };
      } catch (error: any) {
        throw new HttpException(error.message, HttpStatus.OK);
      }
    }

    return {} as LoginVo;
  }

  /**
   * @Description: 内部拼装sql
   * @private
   */
  private get queryLoginBuilder(): SelectQueryBuilder<findAccountType> {
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

  private async cacheTokenAndLoginInfo(
    accountEntity: findAccountType,
    token: string,
    ipAddress: string
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); // 开启事物
    // 根据id查询到地址
    const ipAddressResult: IPAddress = await this.ipToAddressService.getAddress(ipAddress);
    try {
      await this.redisService.set(token, accountEntity);
      // 登录历史表中插入数据
      const loginHistoryEntity = queryRunner.manager.create<LoginHistoryEntity>(
        LoginHistoryEntity,
        {
          accountId: accountEntity.id,
          loginTime: new Date(),
          loginIp: ipAddress,
          nation: ipAddressResult.nation,
          province: ipAddressResult.province,
          city: ipAddressResult.city,
          district: ipAddressResult.district,
          adcode: ipAddressResult.adcode,
        }
      );
      await queryRunner.manager.save<LoginHistoryEntity>(loginHistoryEntity);
      // 更新账号token表
      const accountTokenEntity: Pick<AccountTokenEntity, 'token' | 'id'> | null =
        await this.accountTokenRepository.findOne({
          where: { accountId: accountEntity.id },
          select: ['token', 'id'],
        });
      const tokenExpire: number = this.configService.get('tokenExpire') ?? 1;
      if (accountTokenEntity) {
        // 存在就更新，否则就创建
        this.redisService.del(accountTokenEntity.token);
        await queryRunner.manager.update<AccountTokenEntity>(
          AccountTokenEntity,
          {
            id: accountTokenEntity.id,
          },
          {
            // 设置token失效时间
            expireTime: moment().add(tokenExpire, 'day').format('YYYY-MM-DD HH:mm:ss'),
            token,
          }
        );
      } else {
        const accountCreateResult: AccountTokenEntity =
          queryRunner.manager.create<AccountTokenEntity>(AccountTokenEntity, {
            accountId: accountEntity.id,
            token: token,
            expireTime: moment().add(tokenExpire, 'day').format('YYYY-MM-DD HH:mm:ss'),
          });
        await queryRunner.manager.save<AccountTokenEntity>(accountCreateResult);
      }
      await queryRunner.commitTransaction(); // 提交事务
    } catch (err) {
      await queryRunner.rollbackTransaction(); // 回滚操作
      this.loggerService.error('存储账号token到redis中失败', LoggerService.name);
      throw new HttpException('账号密码错误', HttpStatus.OK);
    } finally {
      // 最后你需要释放一个手动实例化的queryRunner
      await queryRunner.release();
    }
  }
}
