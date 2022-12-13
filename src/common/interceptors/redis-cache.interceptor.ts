import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, of } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { RedisService } from '@src/plugin/redis/redis.service';
import { REDIS_CACHE_EX_DIFF_USER_KEY, REDIS_CACHE_EX_SECOND_KEY, REDIS_CACHE_KEY } from '@src/constants';
import { instanceToPlain } from 'class-transformer';

/**
 *
 * 可以参考另一种做法:https://github.com/Ka-de/whisper_api/blob/staging/src/redis-cache/redis-cache.interceptor.ts#L17
 *
 */

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector, private readonly redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<any> {
    const isCacheApi = this.reflector.getAllAndOverride(REDIS_CACHE_KEY, [context.getHandler(), context.getClass()]);
    if (isCacheApi) {
      console.log('走缓存');
      const redisEXSecond = this.reflector.getAllAndOverride(REDIS_CACHE_EX_SECOND_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      const isDiffUser = this.reflector.getAllAndOverride(REDIS_CACHE_EX_DIFF_USER_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      const request = context.switchToHttp().getRequest();
      let redisKey = this.redisCacheKey(request.method, request.url);

      // 如果有授权拦截的且需要区分用户的时候
      if (request.user && isDiffUser) {
        redisKey = this.redisCacheKey(request.method, request.url, `${request.user.userName}_${request.user.userId}`);
      }

      const redisData = await this.redisService.get(redisKey);

      if (redisData) {
        console.log('redis直接返回');
        return of(redisData);
      } else {
        console.log('走后端');
        return next.handle().pipe(
          map((data) => {
            this.redisService.set(redisKey, instanceToPlain(data), redisEXSecond);
            return data;
          })
        );
      }
    } else {
      console.log('不走缓存');
      return next.handle();
    }

    return next.handle();
  }

  /*
   * @Description: 自定义redis的key
   * @param {string} method 请求方式
   * @param {string} url url地址
   * @param {string} identity 身份
   * @return {*}
   */
  private redisCacheKey(method: string, url: string): string;
  private redisCacheKey(method: string, url: string, identity: string): string;
  private redisCacheKey(method: string, url: string, identity?: string): string {
    if (identity) {
      return `cache:${identity}_${method}:${url}`;
    } else {
      return `cache:${method}:${url}`;
    }
  }
}
