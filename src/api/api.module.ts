import { Module } from '@nestjs/common';
import { LoginModule } from '@src/api/login/login.module';
import { RouterModule } from '@nestjs/core';
import { PROJECT_PREFIX } from '@src/constants';
import { AccountModule } from '@src/api/account/account.module';

@Module({
  imports: [
    LoginModule,
    AccountModule,
    RouterModule.register([
      {
        path: PROJECT_PREFIX,
        module: LoginModule, // 登录
      },
      {
        path: PROJECT_PREFIX,
        module: AccountModule, // 用户模块
      },
    ]),
  ],

  controllers: [],
  providers: [],
})
export class ApiModule {}
