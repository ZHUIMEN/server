import { Module } from '@nestjs/common';
import { AuthService } from '@src/api/auth/auth.service';
import { AccountModule } from '@src/api/account/account.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '@src/api/auth/strategy/local.strategy';

@Module({
  imports: [AccountModule, PassportModule],
  providers: [AuthService, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
