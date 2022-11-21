import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpException,
  Version,
  VERSION_NEUTRAL,
  Inject,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from 'src/entities/User.entity';
import { UserDto } from './dto/index.dto';
import { UserService } from './user.service';

// const testFunc = (e) => {
//   throw new HttpException('Forbidden', HttpStatus.FOUND);
// };
@ApiTags('用户信息')
@Controller('user')
export class UserController {
  @Inject('cjServer')
  private readonly cjServer: string[];
  constructor(private readonly userServer: UserService) {}

  @Get('userinfo')
  @Version([VERSION_NEUTRAL])
  userinfo(
    @Query(
      'id',
      // new ParseIntPipe({
      //   errorHttpStatusCode: 501,
      //   // exceptionFactory: testFunc,
      // }),
    )
    id?: number,
  ) {
    console.log(id);
    if (id == 1) {
      return this.userServer.findTestAll();
    }
    return this.userServer.findAll();
  }

  @Post('create_user')
  @ApiOperation({
    summary: '返回角色信息',
  })
  createUser(@Body() userDto: UserDto) {
    return this.userServer.creadUser(userDto);
  }

  @Get('/get_admin')
  @ApiOperation({
    summary: '获取超级管理员',
  })
  getAdmin() {
    return this.cjServer;
  }
}
