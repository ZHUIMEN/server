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
   * 查找用户信息
   */
  @Post('find')
  // @UseGuards(AuthGuard('jwt'))
  checkAccount(@Body() username) {
    console.log(username);
    return this.accountService.findByUsername(username.username);
  }
  @SetMetadata('redis', '20')
  @ApiOperation({ summary: '获取用户信息' })
  @Get('user-info')
  userInfo(@Req() req) {
    return this.accountService.findByUserId(req.user.userId);
  }
}
