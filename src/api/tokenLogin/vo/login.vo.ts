import { QueryVo } from '@src/common/vo/query.vo';
import { ApiProperty } from '@nestjs/swagger';

export class LoginVo extends QueryVo {
  @ApiProperty()
  mobile?: string; // 账号绑定的手机号码
  @ApiProperty()
  email?: string; // 账号绑定的邮箱
  @ApiProperty()
  username?: string; // 用户名
  @ApiProperty()
  isSuper?: number; // 是否为超级管理员：1表示是,0表示不是
  @ApiProperty()
  isSuperStr?: string; // 是否为超级管理员的翻译
  @ApiProperty()
  token?: string; // 登录的token
}
