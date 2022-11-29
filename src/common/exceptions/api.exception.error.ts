import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';

/**
 * api 错误处理
 * @example
 *  if(isNaN(id) || typeof id !== 'number' || id <= 0) {
 *     throw new ApiException('用户ID无效', ApiErrorCode.USER_ID_INVALID, HttpStatus.BAD_REQUEST);
 *  }
 */
export class ApiException extends HttpException {
  private errorMessage: string;
  private errorCode: ApiErrorCode;

  constructor(errorMessage: string, errorCode: ApiErrorCode, statusCode: HttpStatus) {
    super(errorMessage, statusCode);

    this.errorMessage = errorMessage;
    this.errorCode = errorCode;
  }

  public getErrorCode(): ApiErrorCode {
    return this.errorCode;
  }

  public getErrorMessage(): string {
    return this.errorMessage;
  }
}
