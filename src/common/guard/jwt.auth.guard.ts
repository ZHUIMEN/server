import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@src/constants';
import { UserException } from '@src/common/exceptions/user.exception.error';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 自定义用户身份验证逻辑 取符合isPublicKey的注解
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // skip
    if (isPublic) return true;
    const isJwt = super.canActivate(context);
    return isJwt;
  }

  handleRequest(err, user) {
    // 处理 info
    console.info('res', err, user);
    if (err || !user) {
      // throw err || new UnauthorizedException();
      throw new UserException('登录超时,请重新登录', ApiErrorCode.ACCOUNT_INVAL, err);
    }
    return user;
  }
}
