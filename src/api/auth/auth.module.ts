import { Global, Module } from '@nestjs/common';
import { AuthService } from '@src/api/auth/auth.service';
import { AccountModule } from '@src/api/account/account.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '@src/api/auth/strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '@src/constants';
import { JwtStrategy } from '@src/api/auth/strategy/jwt.strategy';
@Module({
  imports: [
    AccountModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: `${jwtConstants.expiresIn}m` },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
