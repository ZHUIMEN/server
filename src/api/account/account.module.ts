import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { LoginHistoryEntity } from '../login/entities/login.history.entity';
import { AccountEntity } from './entities/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity, LoginHistoryEntity])],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
