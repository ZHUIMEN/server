import { Injectable } from '@nestjs/common';
import { LoginDto } from '@src/api/login/dto/login.dto';
import type { Request } from 'express';
import { ToolsService } from '@src/plugin/tools/tools.service';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from '@src/api/account/entities/account.entity';
import { isEmail, isMobilePhone } from 'class-validator';
import { StatusEnum } from '@src/enums';
import { UserException } from '@src/common/exceptions/user.exception.error';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';
import { LoginVo } from '@src/api/login/vo/login.vo';
import { AuthService } from '@src/api/auth/auth.service';
import { FindAccountType } from '@src/types';
import { AccountService } from '@src/api/account/account.service';

@Injectable()
export class LoginService {
  constructor(
    @InjectPinoLogger(LoginService.name)
    private readonly logger: PinoLogger,
    public readonly toolsService: ToolsService,
    public readonly accountService: AccountService,
    private readonly authService: AuthService
  ) {}

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
      const token = this.authService.createJwt(accountEntity.id, accountEntity.username);
      try {
        await this.accountService.cacheTokenAndLoginInfo(accountEntity, token, ipAddress);
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
        throw new UserException(error.message, null, error);
      }
    } else {
      this.logger.error('账号密码登录错误');
      throw new UserException('账号密码不正确', ApiErrorCode.PASSWORD_INVAL);
    }
  }
}
