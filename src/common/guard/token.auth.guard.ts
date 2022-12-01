import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RedisService } from '@src/plugin/redis/redis.service';
import { getUrlQuery } from '@src/utils';
import { UserException } from '@src/common/exceptions/user.exception.error';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';

@Injectable()
export class TokenAuthGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token =
      context.switchToRpc().getData().headers.token ||
      context.switchToHttp().getRequest().body.token ||
      getUrlQuery(request.url, 'token');

    console.debug('当前token----');

    if (token) {
      // 如果传递了token的话就要从redis中查询是否有该token
      const result = await this.redisService.get(token);
      if (result) {
        // 这里我们知道result数据类型就是我们定义的直接断言
        request.user = result;
        return true;
      } else {
        throw new UserException('你传递token错误', ApiErrorCode.TOKEN_INVAL);
      }
    } else {
      throw new UserException('请传递token', ApiErrorCode.TOKEN_INVAL);
    }
    return false;
  }
}
