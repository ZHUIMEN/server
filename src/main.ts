import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/exceptions/base.exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import {
  VersioningType,
  VERSION_NEUTRAL,
  INestApplication,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { initDoc } from './doc/swagger';

async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(AppModule, {
    cors: false, // 关闭cors
    logger: false, // 关闭内置logger
  });

  // logger
  app.useLogger(app.get(Logger));

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<string>('PORT');
  //全局前缀
  app.setGlobalPrefix('/api');

  //   TODO 接口版本化管理
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [VERSION_NEUTRAL, '1', '2'],
  });

  //全局过滤器
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // swagger 注意顺序
  initDoc(app);
  await app.listen(port);
  return app;
}
bootstrap().then((e: INestApplication) => {
  console.log('port: ', process.env.PORT);

  e.get(Logger);
});
