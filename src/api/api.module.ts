import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { LoginModule } from '@src/api/login/login.module';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE, RouterModule } from '@nestjs/core';
import { PROJECT_PREFIX } from '@src/constants';
import { AccountModule } from '@src/api/account/account.module';
import { GlobalValidationPipe } from '@src/common/pipes/global-validation.pipe';
import { PluginModule } from '@src/plugin/plugin.module';

import { AuthModule } from '@src/api/auth/auth.module';

import { JwtAuthGuard } from '@src/common/guard/jwt.auth.guard';
import { LoginService } from '@src/api/login/login.service';
import { AccountService } from '@src/api/account/account.service';
import { AuthService } from '@src/api/auth/auth.service';

@Module({
  imports: [
    AuthModule,
    LoginModule,
    AccountModule,
    PluginModule,
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
  providers: [
    {
      provide: APP_PIPE,
      useClass: GlobalValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class ApiModule {}
