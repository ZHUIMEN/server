import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { LoginService } from './login.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '@src/api/login/dto/login.dto';
import { LoginVo } from '@src/api/login/vo/login.vo';
import type { Request } from 'express';
import { ApiResult } from '@src/common/decorators/apiResult.decorator';
import { TokenAuthGuard } from '@src/common/guard/token.auth.guard';
import { User } from '@src/common/decorators/user.decorator';

@ApiTags('登录')
// @UseGuards(TokenAuthGuard)
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

  @ApiOperation({
    summary: '用户信息',
  })
  @Get()
  async userinfo(@User('name') name: LoginDto) {
    console.log('name', name);
    return {};
  }
}
