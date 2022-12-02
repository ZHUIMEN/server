import { Module } from '@nestjs/common';
import { LoginModule } from '@src/api/login/login.module';
import { APP_PIPE, RouterModule } from '@nestjs/core';
import { PROJECT_PREFIX } from '@src/constants';
import { AccountModule } from '@src/api/account/account.module';
import { GlobalValidationPipe } from '@src/common/pipes/global-validation.pipe';
import { PluginModule } from '@src/plugin/plugin.module';
import { RedisService } from '@src/plugin/redis/redis.service';
import { AuthModule } from '@src/api/auth/auth.module';
import { ToolsService } from '@src/plugin/tools/tools.service';
import { AccountService } from '@src/api/account/account.service';

@Module({
  imports: [
    LoginModule,
    AccountModule,
    PluginModule,
    AuthModule,
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
    RedisService,
    ToolsService,
    // AccountService,
  ],
})
export class ApiModule {}
