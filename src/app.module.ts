import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './db/mysql.modules';
import { UserModule } from './user/user.module';
import { LoggerModule } from 'nestjs-pino';
import { pinoHttpOption } from './common/logger/pino-http-option.config';
import pino from 'pino';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `config/env/${process.env.NODE_ENV}.env`,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          pinoHttp: pinoHttpOption(configService.get('NODE_ENV')),
          // renameContext: 'a',
        };
      },
    }),
    DatabaseModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
