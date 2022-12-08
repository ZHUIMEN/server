import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { AccountModule } from '@src/api/account/account.module';
import { AuthModule } from '@src/api/auth/auth.module';

@Module({
  imports: [AccountModule, AuthModule],
  controllers: [LoginController],
  providers: [LoginService],
  exports: [LoginService],
})
export class LoginModule {}
