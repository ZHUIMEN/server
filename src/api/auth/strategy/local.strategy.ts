import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { Injectable } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AuthService } from '@src/api/auth/auth.service';
import { AccountEntity } from '@src/api/account/entities/account.entity';
import { UserException } from '@src/common/exceptions/user.exception.error';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private moduleRef: ModuleRef,
    @InjectPinoLogger(LocalStrategy.name)
    private readonly logger: PinoLogger
  ) {
    super({ passReqToCallback: true });
  }

  async validate(request: Request, username: string, password: string): Promise<Partial<AccountEntity>> {
    const contextId = ContextIdFactory.getByRequest(request);
    // 现在 authService 是一个 request-scoped provider
    const authService = await this.moduleRef.resolve<AuthService>(AuthService, contextId);

    const user = await authService.validateUser(username, password);

    if (!user) {
      this.logger.error('无法登录');
      // throw new UnauthorizedException();
      throw new UserException('账号密码不存在', ApiErrorCode.NOT_ACCOUNT_INVAL);
    }

    return user;
  }
}
