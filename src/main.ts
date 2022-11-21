import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/exceptions/base.exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { initDoc } from './doc/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  console.log('port: ', port);
  // swagger 注意顺序
  initDoc(app);
  await app.listen(port);
}
bootstrap();
