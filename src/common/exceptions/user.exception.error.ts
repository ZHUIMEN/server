import { HttpException, HttpStatus } from '@nestjs/common';

export class UserException extends HttpException {
  public static message = '系统错误';
  public static code = 9999;

  constructor(msg?: string | Record<string, any>, code?: number, ...oth: any[]) {
    super(
      { code: code ?? UserException.code, message: msg ?? UserException.message, ...oth },
      HttpStatus.OK
    );
  }
}
