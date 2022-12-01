import { Injectable } from '@nestjs/common';

// import { JwtService } from '@nestjs/jwt';

// import { User } from '../user/entities/user.entity';
// import { jwtConstants } from './constants';
import { AccountService } from '@src/api/account/account.service';
import { AccountEntity } from '@src/api/account/entities/account.entity';
import { ToolsService } from '@src/plugin/tools/tools.service';
import { SharedEntity } from '@src/common/entities/base.entity';

@Injectable()
export class AuthService {
  constructor(
    public readonly toolsService: ToolsService,
    private userService: AccountService // private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<null | Partial<AccountEntity>> {
    const existUser = await this.userService.findByUsername(username);

    if (!existUser) {
      return null;
    }

    // const isMatch = await bcrypt.compare(password, existUser.password);
    const isMatch = this.toolsService.checkPassword(password, existUser.password);
    if (!isMatch) {
      return null;
    }

    const { password: ignorePass, ...restUser } = existUser;
    return restUser;
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
