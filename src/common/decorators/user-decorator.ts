import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/***
 * 获取用户的id，配合jwt 把用户的id存在req中
 * @example xxxFun(@User('id') id: string){
 *    log(id)
 * }
 */
export const User = createParamDecorator((data: any, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  const value = data ? request.user[data] : request.user;
  return value;
});
