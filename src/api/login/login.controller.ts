import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LoginService } from './login.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '@src/api/login/dto/login.dto';
import { LoginVo } from '@src/api/login/vo/login.vo';
import type { Request } from 'express';
import { LocalAuthGuard } from '@src/common/guard/local.auth.guard';
import { ApiResult, SkipJwtAuth } from '@src/common/decorators';

@ApiTags('登录')
// @UseGuards(TokenAuthGuard)
@Controller('login')
// @ApiExtraModels(LoginVo) 属于额外的类型
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @UseGuards(LocalAuthGuard)
  @SkipJwtAuth()
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
