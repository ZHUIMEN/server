import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { LoginHistoryEntity } from '../login/entities/login.history.entity';
import { AccountEntity } from './entities/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountTokenEntity } from '@src/api/login/entities/account.token.entity';
@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity, LoginHistoryEntity, AccountTokenEntity])],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
