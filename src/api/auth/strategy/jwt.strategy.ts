import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { jwtConstants } from '@src/constants';
import { AccountService } from '@src/api/account/account.service';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { AuthService } from '@src/api/auth/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private moduleRef: ModuleRef) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: any) {
    const contextId = ContextIdFactory.getByRequest(request);
    // 现在 authService 是一个 request-scoped provider
    const authService = await this.moduleRef.resolve<AuthService>(AuthService, contextId);

    const existUser = await authService.validateJwt(payload.sub);

    if (!existUser) {
      throw new UnauthorizedException();
    }

    return { ...payload, id: payload.sub };
  }
}
