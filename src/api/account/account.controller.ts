import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('account')
@ApiTags('用户模块')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('create')
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  @ApiQuery({
    name: 'username',
  })
  checkAccount(@Query('username') username) {
    return this.accountService.findByUsername(username);
  }
}
