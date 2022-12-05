import { Injectable } from '@nestjs/common';
import { LoginDto } from '@src/api/login/dto/login.dto';
import type { Request } from 'express';
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
import { IPAddress, IpToAddressService } from '@src/plugin/ip-to-address/ip-to-address.service';
import { RedisService } from '@src/plugin/redis/redis.service';
import { LoginHistoryEntity } from '@src/api/login/entities/login.history.entity';
import { ConfigService } from '@nestjs/config';
// import moment from 'moment';
import moment = require('moment');
import { LoginVo } from '@src/api/login/vo/login.vo';
import { AuthService } from '@src/api/auth/auth.service';
import { FindAccountType } from '@src/types';
import { AccountService } from '@src/api/account/account.service';

@Injectable()
export class LoginService {
  constructor(
    @InjectPinoLogger(LoginService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(AccountTokenEntity)
    private readonly accountTokenRepository: Repository<AccountTokenEntity>,
    public readonly toolsService: ToolsService,
    public readonly ipToAddressService: IpToAddressService,
    public readonly redisService: RedisService,
    public readonly accountService: AccountService,
    public readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly authService: AuthService
  ) {
    // console.log(this.authService);
  }

  async login(loginDto: LoginDto, request: Request): Promise<LoginVo> {
    const ipAddress = this.toolsService.getReqIP(request);
    const { username, password } = loginDto;

    this.logger.debug('ip地址%s', ipAddress);
    const queryBuilder = this.accountService.queryLoginBuilder;
    this.logger.debug('sql%s', queryBuilder.getSql());
    let accountEntity: FindAccountType<AccountEntity> | null | undefined;

    let usernameRep = username;

    // 根据手机号码查询
    if (isMobilePhone(username, 'zh-CN')) {
      accountEntity = await queryBuilder.where('(account.mobile = :mobile)', { mobile: username }).getRawOne();
      usernameRep = '';
    } else if (isEmail(username)) {
      // 根据邮箱查询
      accountEntity = await queryBuilder.where('(account.email = :email)', { email: username }).getRawOne();
      usernameRep = '';
    } else {
      // 用户名查询
      accountEntity = await queryBuilder.where('(account.username = :username)', { username }).getRawOne();
    }
    // 如果当前状态为禁止的时候直接返回
    if (accountEntity?.status === StatusEnum.FORBIDDEN) {
      throw new UserException('当前账号为禁用状态，请联系管理员', ApiErrorCode.ACCOUNT_INVAL);
    }
    if (accountEntity?.id && this.toolsService.checkPassword(password, accountEntity.password)) {
      // 生成token存储到token表中并且返回给前端
      // const token = this.toolsService.uuidToken;
      const token = this.authService.createJwt(accountEntity.id);
      try {
        await this.cacheTokenAndLoginInfo(accountEntity, token, ipAddress);
        // console.log('accountEntity', accountEntity);
        return {
          token,
          id: accountEntity.id,
          username: usernameRep ? usernameRep : accountEntity.username.startsWith('_') ? '' : accountEntity.username,
          email: isEmail(accountEntity.email) ? accountEntity.email : '',
          mobile: isMobilePhone(accountEntity.mobile, 'zh-CN') ? accountEntity.mobile : '',
          isSuper: accountEntity.isSuper,
          // isSuperStr: accountEntity.isSuperStr(), // todo isSuperStr
        };
      } catch (error: any) {
        throw new UserException(error.message);
      }
    } else {
      this.logger.error('账号密码登录错误');
      throw new UserException('账号密码不正确', ApiErrorCode.PASSWORD_INVAL);
    }
  }

  /**
   * @Description: 将token存储到redis中和数据库中
   * @param {findAccountType} accountEntity
   * @param {string} token
   * @param {string} ipAddress
   * @return {*}
   */

  private async cacheTokenAndLoginInfo(
    accountEntity: FindAccountType<AccountEntity>,
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
      const loginHistoryEntity = queryRunner.manager.create<LoginHistoryEntity>(LoginHistoryEntity, {
        accountId: accountEntity.id,
        loginTime: new Date(),
        loginIp: ipAddress,
        nation: ipAddressResult.nation,
        province: ipAddressResult.province,
        city: ipAddressResult.city,
        district: ipAddressResult.district,
        adcode: ipAddressResult.adcode,
      });
      await queryRunner.manager.save<LoginHistoryEntity>(loginHistoryEntity);
      // 更新账号token表
      const accountTokenEntity: Pick<AccountTokenEntity, 'token' | 'id'> | null =
        await this.accountTokenRepository.findOne({
          where: { accountId: accountEntity.id },
          select: ['token', 'id'],
        });
      const tokenExpire: number = this.configService.get('TOKEN_EXPIRE') ?? 1;

      // 存在就更新，否则就创建
      if (accountTokenEntity) {
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
      throw new UserException('账号密码错误', ApiErrorCode.PASSWORD_INVAL);
    } finally {
      // 最后你需要释放一个手动实例化的queryRunner
      await queryRunner.release();
    }
  }
}
