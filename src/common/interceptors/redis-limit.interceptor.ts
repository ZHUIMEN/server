import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';

import {
  REDIS_LIMIT_RANGE_SECOND_KEY,
  REDIS_LIMIT_KEY,
  REDIS_LIMIT_MAX_REQUEST_KEY,
  REDIS_CACHE_KEY,
} from '@src/constants';
import { RedisService } from '@src/plugin/redis/redis.service';
import { ToolsService } from '@src/plugin/tools/tools.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RedisLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
    private readonly toolsService: ToolsService,
    private reflector: Reflector
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    console.log('限流拦截器');
    // 是否需要限流
    const isLimitApi = this.reflector.getAllAndOverride(REDIS_LIMIT_KEY, [context.getHandler(), context.getClass()]);
    if (isLimitApi) {
      console.log('走限流操作');
      const request = context.switchToHttp().getRequest();
      const currentIp = this.toolsService.getReqIP(request);
      const redisKey = `redis_limit_ip_${currentIp}`;
      // 限流时间范围内
      const redisRangeSecond = this.reflector.getAllAndOverride(REDIS_LIMIT_RANGE_SECOND_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      // 限流时间范围内最大访问次数
      const redisMaxRequest = this.reflector.getAllAndOverride(REDIS_LIMIT_MAX_REQUEST_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      const currentCount = await this.redisService.get(redisKey);
      if (currentCount) {
        // 先判断是否达到上线了
        if (currentCount >= redisMaxRequest) {
          throw new HttpException('访问过于频繁', HttpStatus.TOO_MANY_REQUESTS);
        }
        await this.redisService.incr(redisKey);
        return next.handle();
      } else {
        await this.redisService.set(redisKey, 1, redisRangeSecond);
        return next.handle();
      }
    } else {
      return next.handle();
    }
  }
}
