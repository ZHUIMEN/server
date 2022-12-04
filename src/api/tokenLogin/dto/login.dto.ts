import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// import { IsUserName } from '@src/validators';

export class LoginDto {
  // @IsUserName()
  @ApiProperty({
    description: '用户名字',
  })
  @IsString({ message: '用户名必须为字符类型' })
  @IsNotEmpty({ message: '用户名不能为空' })
  readonly username!: string;

  @ApiProperty({
    description: '密码',
  })
  @IsString({ message: '密码必须为字符串类型' })
  @IsNotEmpty({ message: '密码不能为空' })
  readonly password!: string;
}
