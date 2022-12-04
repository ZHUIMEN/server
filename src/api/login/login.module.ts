import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { AccountTokenEntity } from '@src/api/login/entities/account.token.entity';
import { AccountEntity } from '@src/api/account/entities/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '@src/api/account/account.module';
import { AuthModule } from '@src/api/auth/auth.module';

@Module({
  imports: [AccountModule, AuthModule, TypeOrmModule.forFeature([AccountTokenEntity])],
  controllers: [LoginController],
  providers: [LoginService],
  exports: [LoginService],
})
export class LoginModule {}
