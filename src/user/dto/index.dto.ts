import { IsInt, IsNumberString, IsOptional, IsString, Max, Min } from 'class-validator';

export class UserDto {
  @IsString({
    message: '请输入字符串',
  })
  readonly userName: string;
  @IsString({
    message: '请输入字符串',
  })
  readonly passWord: string;
}
