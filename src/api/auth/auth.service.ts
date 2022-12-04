import { Injectable } from '@nestjs/common';
// import { User } from '../user/entities/user.entity';
// import { jwtConstants } from './constants';
import { AccountService } from '@src/api/account/account.service';
import { AccountEntity } from '@src/api/account/entities/account.entity';
import { ToolsService } from '@src/plugin/tools/tools.service';
import { SharedEntity } from '@src/common/entities/base.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly toolsService: ToolsService,
    private accountService: AccountService,
    private jwtService: JwtService
  ) {
    console.log('ToolsService', ToolsService.name);
    console.log('AccountService', AccountService.name);
    console.log('JwtService', JwtService.name);
  }

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

  public async validateJwt(sub: number) {
    return await this.accountService.findByUserId(sub);
  }

  public createJwt(sub) {
    return this.jwtService.sign(sub);
  }

  // async login(user: User) {
  //   const { password, ...restUser } = user;
  //
  //   const payload = { ...restUser, sub: user.id };
  //
  //   return {
  //     token: this.jwtService.sign(payload),
  //     user: restUser,
  //     expiresIn: jwtConstants.expiresIn,
  //   };
  // }
}
