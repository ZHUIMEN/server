import { HttpException, HttpStatus } from '@nestjs/common';

export class UserException extends HttpException {
  public message = '系统错误';
  public code = 9999;

  constructor(message?: string, code?: number) {
    // this.message = message;
    super({ code: code, message: message }, HttpStatus.OK);
  }
}
