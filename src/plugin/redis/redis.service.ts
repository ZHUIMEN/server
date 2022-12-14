import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis, { ClientContext, Result } from 'ioredis';

import { ObjectType } from '@src/types';
import { isObject } from '@src/utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit {
  public redisClient!: Redis;

  constructor(private readonly configService: ConfigService) {}

  // 模块加载的时候就缓存创建redis句柄
  onModuleInit() {
    if (!this.redisClient) {
      this.getClient();
    }
  }
  private getClient() {
    // TODO 提到类的上层；
    this.redisClient = new Redis({
      keyPrefix: 'test:',
      port: Number(this.configService.get('REDIS_PORT')), // Redis port
      host: this.configService.get('REDIS_HOST'), // redisDb Redis host
      username: this.configService.get('REDIS_USERNAME'), // needs Redis >= 6
      password: this.configService.get('REDIS_PASSWORD'), // 密码
      db: Number(this.configService.get('REDIS_DB')), // redis是几个数据库的，使用第一个
    });
  }

  /**
   * @Description: 设置值到redis中
   * @param {string} key
   * @param {any} value
   * @param {number} second 过期时间秒
   * @return {*}
   */
  public async set(key: string, value: unknown): Promise<Result<'OK', ClientContext>>;
  public async set(key: string, value: unknown, second: number): Promise<Result<'OK', ClientContext>>;
  public async set(key: string, value: any, second?: number): Promise<Result<'OK', ClientContext>> {
    value = isObject(value) ? JSON.stringify(value) : value;
    if (!second) {
      return await this.redisClient.set(key, value);
    } else {
      return await this.redisClient.set(key, value, 'EX', second);
    }
  }

  /**
   * @Description: 设置自动 +1
   * @param {string} key
   * @return {*}
   */
  public async incr(key: string): Promise<Result<number, ClientContext>> {
    return await this.redisClient.incr(key);
  }

  /**
   * @Description: 设置获取redis缓存中的值
   * @param key {String}
   */
  public async get(key: string): Promise<Result<string | null, ClientContext>> {
    try {
      const data = await this.redisClient.get(key);
      if (data) {
        return JSON.parse(data);
      } else {
        return null;
      }
    } catch (e) {
      return await this.redisClient.get(key);
    }
  }

  /**

   * @Description: 根据key删除redis缓存数据
   * @param {string} key
   * @return {*}
   */
  public async del(key: string): Promise<Result<number, ClientContext>> {
    return await this.redisClient.del(key);
  }

  async hset(key: string, field: ObjectType): Promise<Result<number, ClientContext>> {
    return await this.redisClient.hset(key, field);
  }

  /**
   * @Description: 获取单一个值
   * @param {string} key
   * @param {string} field
   * @return {*}
   */
  async hget(key: string, field: string): Promise<Result<string | null, ClientContext>> {
    return await this.redisClient.hget(key, field);
  }

  /**
   * @Description: 获取全部的hget的
   * @param {string} key
   * @return {*}
   */
  async hgetall(key: string): Promise<Result<Record<string, string>, ClientContext>> {
    return await this.redisClient.hgetall(key);
  }

  /**
   * @Description: 清空redis的缓存
   * @return {*}
   */
  public async flushall(): Promise<Result<'OK', ClientContext>> {
    return await this.redisClient.flushall();
  }

  /**
   * @Description:返回一个布尔值，如果key存在，则返回true，如果key不存在，则返回false
   * @param Key
   */
  public async exists(Key: string): Promise<Result<number, ClientContext>> {
    return await this.redisClient.exists(Key);
  }

  /**
   * 设置已有的key的过期时间
   * @Description: 接受两个参数，第一个参数是要重置过期时间的key，第二个参数是过期时间（单位为秒）
   * @param key
   */
  public async setExpire(key: string, second: number): Promise<Result<number, ClientContext>> {
    return await this.redisClient.expire(key, second);
  }

  /**
   * 返回一个数字，表示key还有多长时间过期（单位为秒）。如果key已经过期，则返回-2；如果key不存在，则返回-1
   * @param key
   */
  public async getTtl(key: string): Promise<Result<number, ClientContext>> {
    return this.redisClient.ttl(key);
  }
}
