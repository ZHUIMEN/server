import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   isGlobal: true,
    //   envFilePath: `config/env/${process.env.NODE_ENV}.env`,
    // }),
    // TypeOrmModule.forRoot({
    //   type: process.env.DATABASE_TYPE as 'mysql',
    //   host: process.env.DATABASE_HOST,
    //   port: Number(process.env.DATABASE_PORT),
    //   username: process.env.DATABASE_USER,
    //   password: process.env.DATABASE_PWD,
    //   database: process.env.DATABASE_DB,
    //   autoLoadEntities: Boolean(process.env.DATABASE_DROPSCHEMA),
    //   synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE),
    // }),

    // 1.7.7 动态的加载配置模块   https://www.happyy.vip/archives/nestjs%E5%AD%A6%E4%B9%A0%E4%B8%89
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: process.env.DATABASE_TYPE as 'mysql',
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PWD,
        database: process.env.DATABASE_DB,
        autoLoadEntities: Boolean(process.env.DATABASE_DROPSCHEMA),
        synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE),
        logging: false,
        timezone: '+08:00', // 东八区
        cache: {
          duration: 60000, // 1分钟的缓存
        },
        extra: {
          poolMax: 32,
          poolMin: 16,
          queueTimeout: 60000,
          pollPingInterval: 60, // 每隔60秒连接
          pollTimeout: 60, // 连接有效60秒
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
