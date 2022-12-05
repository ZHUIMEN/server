import { Global, Module } from '@nestjs/common';
import { AuthService } from '@src/api/auth/auth.service';
import { AccountModule } from '@src/api/account/account.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '@src/api/auth/strategy/local.strategy';
import { JwtModule } from '@nestjs/jwt';

import { JwtStrategy } from '@src/api/auth/strategy/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    AccountModule,
    PassportModule,
    ConfigModule,
    // https://github.com/nestjs/jwt/blob/master/README.md
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET'),
        signOptions: { expiresIn: `${configService.get<number>('EXPIRES_IN')} days` },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
