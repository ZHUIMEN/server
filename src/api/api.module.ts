import { Module } from '@nestjs/common';
import { LoginModule } from '@src/api/login/login.module';
import { APP_PIPE, RouterModule } from '@nestjs/core';
import { PROJECT_PREFIX } from '@src/constants';
import { AccountModule } from '@src/api/account/account.module';
import { GlobalValidationPipe } from '@src/common/pipes/global-validation.pipe';

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
  providers: [
    {
      provide: APP_PIPE,
      useClass: GlobalValidationPipe,
    },
  ],
})
export class ApiModule {}
