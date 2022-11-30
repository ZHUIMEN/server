import { Global, Module } from '@nestjs/common';

import { RedisService } from './redis/redis.service';
import { ToolsService } from '@src/plugin/tools/tools.service';
import { IpToAddressService } from '@src/plugin/ip-to-address/ip-to-address.service';

@Global()
@Module({
  providers: [RedisService, ToolsService, IpToAddressService],
  exports: [RedisService, ToolsService, IpToAddressService],
})
export class PluginModule {}
