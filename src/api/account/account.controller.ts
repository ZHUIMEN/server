import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('account')
@ApiTags('用户模块')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('create')
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  // @ApiBody({
  //   schema: {
  //     username: {
  //       type: string,
  //     },
  //   },
  // })
  @Post('find')
  // @UseGuards(AuthGuard('jwt'))
  checkAccount(@Body() username) {
    console.log(username);
    return this.accountService.findByUsername(username.username);
  }
}
