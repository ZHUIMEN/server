import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { AuthService } from '@src/api/auth/auth.service';
import { UserException } from '@src/common/exceptions/user.exception.error';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountEntity } from '@src/api/account/entities/account.entity';
import { FindAccountType } from '@src/types';

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

  /**
   * 重写了PassportStrategy('jwt')里的方法 返回值会直接发在request.user里的
   * 当进入控制守卫时调用 canActivate 内部会走对用的策略模式，从而调用validate 然后吧jwt 转成json 当参数返回回来
   *  其中没不要用redis 可以直接验证 jwt中的的userid 是否存在数据库中从而判断 也可结合jwt的过期时间来阻断:
   * import * as jwt from 'jsonwebtoken';
   *
   * const token = '...';
   * const secret = '...';
   *
   * try {
   *   const decoded = jwt.verify(token, secret);
   *   const { exp } = decoded;
   *   const now = Date.now() / 1000;
   *   if (now > exp) {
   *     // JWT已过期，拒绝请求
   *   } else {
   *     // JWT有效，继续处理请求
   *   }
   * } catch (err) {
   *   // JWT无效，拒绝请求
   * }
   * @param request
   * @param payload
   */
  async validate(request, payload: any) {
    const contextId = ContextIdFactory.getByRequest(request);
    // 现在 authService 是一个 request-scoped provider
    const authService = await this.moduleRef.resolve<AuthService>(AuthService, contextId);
    const token = versionOneCompatibility()(request);

    /**判断是否存在*/
    const exists = await authService.checkToken(token);
    if (exists <= 0) {
      throw new UserException('token 已过期', ApiErrorCode.TOKEN_INVAL);
    }

    const cacheUser = (await authService.getRedisKeyToValue(token)) as FindAccountType<AccountEntity> | any;
    if (cacheUser?.id !== payload.userId || cacheUser?.username !== payload.userName) {
      throw new UserException('token 不正确', ApiErrorCode.TOKEN_INVAL);
    }

    /** 过时的： 这里不需要查询数据验证，可以同上redis里取值*/
    // const existUser = await authService.checkDBValidateJwt(payload.userId);
    // console.log('existUser %o', existUser);
    // if (!existUser) {
    //   throw new UserException('token 已过期', ApiErrorCode.TOKEN_INVAL);
    // }
    /**如果token小于3天,即在倒数第3天时 请求，重置过期时间 */

    authService.resetToken(cacheUser, token, request);

    return { ...payload, userId: payload.userId, userName: payload.userName };
  }
}
