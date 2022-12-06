import { Injectable } from '@nestjs/common';
import { AccountService } from '@src/api/account/account.service';
import { AccountEntity } from '@src/api/account/entities/account.entity';
import { ToolsService } from '@src/plugin/tools/tools.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly toolsService: ToolsService,
    private accountService: AccountService,
    private jwtService: JwtService
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

  public async validateJwt(userId: number) {
    return await this.accountService.findByUserId(userId);
  }

  public createJwt(id) {
    return this.jwtService.sign({ userId: id });
  }
}
