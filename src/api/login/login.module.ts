import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { AccountTokenEntity } from '@src/api/login/entities/account.token.entity';
import { AccountEntity } from '@src/api/account/entities/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity, AccountTokenEntity])],
  controllers: [LoginController],
  providers: [LoginService],
  exports: [LoginService],
})
export class LoginModule {}
