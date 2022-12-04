import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { LoginHistoryEntity } from '../login/entities/login.history.entity';
import { AccountEntity } from './entities/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginModule } from '@src/api/login/login.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccountEntity, LoginHistoryEntity]), LoginModule],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
