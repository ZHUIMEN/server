import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { AuthService } from '@src/api/auth/auth.service';
import { UserException } from '@src/common/exceptions/user.exception.error';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 *  参考:https://github.com/quangmanhlam/core-api/blob/e92150abbcabebd90b5fed5954e8e087f75551db/src/modules/auth/strategies/jwt.strategy.ts
 *  认证方式：https://blog.csdn.net/qq_31032141/article/details/122395730
 */
const versionOneCompatibility = () => {
  const Field = 'token',
    authScheme = 'Bearer';
  return function (request) {
    //新版的有着方法 type没有提示
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const authHeaderExtractor = ExtractJwt.versionOneCompatibility({
      // Authorization : Authorization： Bearer xxxx
      authScheme: authScheme,
      // Body {token: xxxx}
      tokenBodyField: Field,
      // query url?token=xxxx
      tokenQueryParameterName: Field,
    });
    let token = authHeaderExtractor(request);

    if (!token) {
      const headerExtractor = ExtractJwt.fromHeader(Field);
      token = headerExtractor(request);
    }
    return token;
  };
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  //private moduleRef: ModuleRef,
  constructor(
    private configModule: ConfigService,
    private moduleRef: ModuleRef // private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: versionOneCompatibility(),
      ignoreExpiration: false,
      secretOrKey: configModule.get<string>('SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request, payload: any) {
    const contextId = ContextIdFactory.getByRequest(request);
    // 现在 authService 是一个 request-scoped provider
    const authService = await this.moduleRef.resolve<AuthService>(AuthService, contextId);
    //
    const existUser = await authService.validateJwt(payload.sub);

    if (!existUser) {
      throw new UserException('请传递token', ApiErrorCode.TOKEN_INVAL);
    }

    return { ...payload, userId: payload.userId };
  }
}
