import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

import { VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { initDoc } from './doc/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<string>('PORT');
  // swagger
  initDoc(app);
  //   TODO 接口版本化管理
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: [VERSION_NEUTRAL, '1', '2'],
  });
  //全局前缀
  app.setGlobalPrefix('/api');
  console.log('port: ', port);
  await app.listen(port);
}
bootstrap();
