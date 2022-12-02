import { Request, Response } from 'express';

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { UserException } from '@src/common/exceptions/user.exception.error';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';
import { ApiException } from '@src/common/exceptions/api.exception.error';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    let resultMessage = exception.message;
    let resultCode = ApiErrorCode.ERROR; // 自定义code
    let resultParams = {}; // 其他错误参数
    try {
      // 自定义错误 不够优雅 但是够用了
      if (exception instanceof UserException) {
        const { code, message, ...oth } = exception.getResponse() as {
          code: number;
          message: string;
        };
        this.logger.debug('其他参数:%o', oth);
        resultMessage = message;
        resultCode = code;
        resultParams = Object.values(oth);
      } else if (exception instanceof ApiException) {
        resultCode = exception.getErrorCode();
        resultMessage = exception.getErrorMessage();
      } else {
        console.error('程序错误====', resultMessage);
        const { code, message, ...oth } = JSON.parse(resultMessage);
        resultMessage = resultMessage;
        resultCode = code;
        resultParams = Object.values(oth);
      }
    } catch (e) {
      this.logger.log('未拦截到自定义错误，导致解析错误：', e);
    }
    const errorResponse = {
      status,
      message: resultMessage,
      code: resultCode, // 自定义code
      params: Array.isArray(resultParams) ? resultParams : exception.stack,
      path: request.url, // 错误的url地址
      method: request.method, // 请求方式
      timestamp: new Date().toLocaleDateString(), // 错误的时间
    };
    this.logger.verbose('error');
    // 打印日志
    this.logger.error(
      `【${new Date().toISOString()}】${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'HttpExceptionFilter'
    );

    // 设置返回的状态码、请求头、发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
  }
}
