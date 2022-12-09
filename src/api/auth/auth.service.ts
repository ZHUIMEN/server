import { Injectable } from '@nestjs/common';
import { AccountService } from '@src/api/account/account.service';
import { AccountEntity } from '@src/api/account/entities/account.entity';
import { ToolsService } from '@src/plugin/tools/tools.service';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@src/plugin/redis/redis.service';
import { Request } from 'express';
import { FindAccountType } from '@src/types';
import { ChainableCommander } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import moment = require('moment');
@Injectable()
export class AuthService {
  constructor(
    private readonly toolsService: ToolsService,
    private accountService: AccountService,
    private redisService: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(username: string, password: string): Promise<null | Partial<AccountEntity>> {
    const existUser = await this.accountService.findByUsername(username);

    if (!existUser) {
      return null;
    }
    //使用封装的密码加密
    // const isMatch = await bcrypt.compare(password, existUser.password);
    const isMatch = this.toolsService.checkPassword(password, existUser.password);
    if (!isMatch) {
      return null;
    }

    const { password: ignorePass, ...restUser } = existUser;
    return restUser;
  }

  /**
   *
   * 查询数据库
   * 验证toke中的的userid 是否存当前的用户 并返回用户信息
   * @param userId
   */
  public async checkDBValidateJwt(userId: number) {
    console.log('userId%o', userId);
    return await this.accountService.findByUserId(userId);
  }

  /**
   * 生成jwt
   * @param userId
   * @param userName
   */
  public createJwt(userId: number, userName: string) {
    return this.jwtService.sign({ userId, userName });
  }

  /**
   * 重置token
   */
  public resetToken(
    ttl: ChainableCommander | number,
    accountEntity: FindAccountType<AccountEntity>,
    token: string,
    request: Request
  ) {
    // return this.redisService.exists(key);
    const oneHalf = parseInt(this.configService.get('TOKEN_EXPIRE')) / 2; //>> 1;
    if (oneHalf <= 0) return;
    // 时间还有一半时重置
    if (ttl <= moment.duration(oneHalf, 'days').asSeconds()) {
      const ipAddress = this.toolsService.getReqIP(request);
      this.accountService.cacheTokenAndLoginInfo(accountEntity, token, ipAddress);
    }
  }

  /**
   * 查看 redis中的token 是否快过期 如果key已经过期，则返回-2；如果key不存在，则返回-1
   */
  public checkTokenTtl(key: string) {
    return this.redisService.exists(key);
  }

  /**
   * 查询redis里的这里对应key的值
   */
  public getRedisKeyToValue(key: string) {
    return this.redisService.get(key);
  }
}
