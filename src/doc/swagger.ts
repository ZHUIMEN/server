import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ResultVo } from '@src/common/vo/result.vo';

/**
 * // !TODO https://blog.csdn.net/crper/article/details/109599676
 * @param app
 */
export const initDoc = (app) => {
  const config = new DocumentBuilder()
    .setTitle('项目接口文档')
    .setDescription('学习')
    .setVersion('1')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ResultVo],
  });
  SwaggerModule.setup('apiDoc', app, document, {
    swaggerOptions: {
      explorer: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
  });
};
