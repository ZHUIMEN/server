/**
 * 响应拦截
 */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';

interface Response<T> {
  data: T;
}

@Injectable()
// eslint-disable-next-line prettier/prettier
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        return {
          data,
          code: 200,
          message: 'ok',
          success: true,
        };
      })
    );
  }
}
