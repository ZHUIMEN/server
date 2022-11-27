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
        path: PROJECT_PREFIX, // 指定项目名称
        module: LoginModule,
      },
      {
        path: PROJECT_PREFIX, // 指定项目名称
        module: AccountModule,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
