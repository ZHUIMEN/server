import { MongooseModule } from '@nestjs/mongoose';
import { Module, ValueProvider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from 'src/entities/Test.entity';
import { User as Users } from 'src/entities/User.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Cat, CatSchema } from '@src/schema/cat.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Test]),
    MongooseModule.forFeature([{ name: Cat.name, schema: CatSchema }]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'cjServer',
      useValue: ['cui', 'jian'],
    } as ValueProvider<string[]>,
  ],
})
export class UserModule {}
