import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';

/**
 * 自定义错误处理
 * @example
 *  throw new UserException()
 *  throw new UserException('错误处理', 9999)
 *  throw new UserException('用户名/手机号码/邮箱已经存在，不能重复创建', 9999, { name: 222,test: '22290',})
 */
export class UserException extends HttpException {
  private static message = '系统错误';
  private static code = ApiErrorCode.ERROR;

  constructor(msg?: string | Record<string, any>, code?: ApiErrorCode | HttpStatus, ...oth: any[]) {
    super({ code: code ?? UserException.code, message: msg ?? UserException.message, ...oth }, HttpStatus.OK);
  }
}
