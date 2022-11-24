/**
 * 响应拦截
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { instanceToPlain } from 'class-transformer';
interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // console.log('====================================');
        // console.log(instanceToPlain(data));
        // console.log('====================================');
        // console.log(data);
        // console.log('====================================');
        // console.log('====================================');
        return {
          data,
          code: 200,
          status: 0,
          extra: {},
          message: 'success',
          success: true,
        };
      }),
    );
  }
}
