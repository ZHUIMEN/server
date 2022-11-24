import { Request, Response } from 'express';

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { IsJSON } from 'class-validator';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const now = new Date().toISOString();
    let resultMessage = exception.message;
    console.log('==========exception==========================');
    console.log(resultMessage);
    console.log(exception.getResponse());
    console.log('====================================');
    let resultCode = 1;
    let resultParams = {};
    try {
      if (typeof resultMessage !== 'string') {
        const { code, message, ...oth } = JSON.parse(resultMessage);
        resultMessage = message;
        resultCode = code;
        resultParams = oth;
      } else {
        const { code, message } = exception.getResponse() as {
          code: number;
          message: string;
        };
        resultMessage = message;
        resultCode = code;
      }
    } catch (e) {
      this.logger.log('错误解析错误', e);
    }

    this.logger.log(exception, '错误提示');

    const errorResponse = {
      status,
      message: resultMessage,
      code: resultCode, // 自定义code
      params: resultParams,
      path: request.url, // 错误的url地址
      method: request.method, // 请求方式
      timestamp: new Date().toLocaleDateString(), // 错误的时间
    };

    // 打印日志
    this.logger.error(
      `【${now}】${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      'HttpExceptionFilter',
    );

    // 设置返回的状态码、请求头、发送错误信息
    response.status(status);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send(errorResponse);
  }
}
