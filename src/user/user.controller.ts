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
  // Logger,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { UserException } from 'src/common/exceptions/user.exception.error';
import { User } from 'src/entities/User.entity';
import { UserDto } from './dto/index.dto';
import { UserService } from './user.service';

@ApiTags('用户信息')
@Controller('user')
export class UserController {
  @Inject('cjServer')
  private readonly cjServer: string[];

  // private readonly loggers = new Logger(UserController.name);
  constructor(
    @InjectPinoLogger(UserController.name)
    private readonly logger: PinoLogger,
    private readonly userServer: UserService
  ) {}

  @Get('userinfo')
  @Version([VERSION_NEUTRAL])
  userinfo(
    @Query(
      'id'
      // new ParseIntPipe({
      //   errorHttpStatusCode: 501,
      //   // exceptionFactory: testFunc,
      // }),
    )
    id?: number
  ) {
    if (id == 1) {
      // this.logger.info('test');
      // throw new UserException();
      throw new UserException('用户名/手机号码/邮箱已经存在，不能重复创建', 9999, {
        name: 222,
        test: '22290',
      });
      // return this.userServer.findTestAll();
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
