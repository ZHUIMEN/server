import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LoginService } from './login.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '@src/api/login/dto/login.dto';
import { LoginVo } from '@src/api/login/vo/login.vo';
import type { Request } from 'express';
import { ApiResult } from '@src/common/decorators/apiResult.decorator';
import { AuthGuard } from '@src/common/guard/auth.guard';

@ApiTags('登录')
// @UseGuards(AuthGuard)
@Controller('login')
// @ApiExtraModels(LoginVo)
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post()
  @ApiOperation({
    summary: '登录login',
  })
  // !TODO swagger返回的类型和函数返回的类型是不匹配的
  @ApiResult(LoginVo, false, false)
  async login(@Body() loginDto: LoginDto, @Req() request: Request): Promise<LoginVo> {
    return await this.loginService.login(loginDto, request);
  }
}
