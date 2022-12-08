import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
  Req,
  CacheKey,
  CacheTTL,
  SetMetadata,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiBasicAuth, ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RedisCacheApi } from '@src/common/decorators';

@Controller('account')
@ApiBearerAuth()
@ApiTags('用户模块')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('create')
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  /**
   *  通过用户名字查找 查找用户信息 缓存（60）
   */
  @Post('find')
  checkAccount(@Body() username) {
    console.log(username);
    return this.accountService.findByUsername(username.username);
  }

  @ApiOperation({ summary: '获取用户信息 缓存（60）' })
  @Get('user-info')
  @RedisCacheApi({ exSecond: 60, isDiffUser: true })
  userInfo(@Req() req) {
    return this.accountService.findByUserId(req.user.userId);
  }
}
