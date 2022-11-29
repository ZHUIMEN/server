import { Global, Module } from '@nestjs/common';

import { RedisService } from './redis/redis.service';
import { ToolsService } from '@src/plugin/tools/tools.service';

@Global()
@Module({
  providers: [RedisService, ToolsService],
  exports: [RedisService, ToolsService],
})
export class PluginModule {}
