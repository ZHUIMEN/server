import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './db/mysql.modules';
import { MongoModule } from './db/mongo.modules';
import { UserModule } from './user/user.module';
import { LoggerModule } from 'nestjs-pino';
import { pinoHttpOption } from './common/logger/pino-http-option.config';
import { HelmetMiddleware } from '@nest-middlewares/helmet';
import { ApiModule } from '@src/api/api.module';
import path from 'path';
import { createDirIfNotExists } from '@src/utils';

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
        const logDirectory = path.resolve(__dirname, configService.get('LOG_FILENAME') ?? './logs');
        await createDirIfNotExists(logDirectory);
        return {
          pinoHttp: pinoHttpOption(configService.get('NODE_ENV'), {
            filename: logDirectory,
            size: configService.get('LOG_SIZE') ?? '50k',
            frequency: configService.get('LOG_FREQUENCT') ?? 'daily',
            verbose: false,
            max_logs: configService.get('LOG_MAX_LOGS') ?? '10d',
          }),
          //    renameContext: 'a',
        };
      },
    }),
    DatabaseModule,
    MongoModule,
    UserModule,
    ApiModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HelmetMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
