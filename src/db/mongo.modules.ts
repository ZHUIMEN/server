import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

//连接Mongo数据库
@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/cj_table')],
})
export class MongoModule {}
