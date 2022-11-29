import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import NodeAuth from 'simp-node-auth';

@Injectable()
export class ToolsService {
  private nodeAuth: NodeAuth;
  constructor() {
    this.nodeAuth = new NodeAuth();
  }

  /**
   * @Description: 创建一个生成uuid的方法
   * @return {*}
   */
  public get uuidToken(): string {
    return uuidv4().replace(/-/g, '');
  }

  /**
   * @Description: 获取当前ip地址
   * @param {Request} req
   * @return {*}
   */
  getReqIP(req: Request): string {
    const currentIp =
      ((req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress)?.replace(
        '::ffff:',
        ''
      ) ?? '';
    // 处理代理后的多个ip地址,只拿第一个ip
    if (currentIp.split(',').length) {
      return currentIp.split(',').shift()!;
    } else {
      return currentIp;
    }
  }

  /**
   * @Description: 密码加密的方法
   * @param {string} password 密码
   * @return {*}
   */
  makePassword(password: string): string {
    return this.nodeAuth.makePassword(password);
  }

  /**
   * @Description: 校验密码
   * @param {string} password 未加密的密码
   * @param {string} sqlPassword 加密后的密码
   * @return {*}
   */
  checkPassword(password: string, sqlPassword: string): boolean {
    return this.nodeAuth.checkPassword(password, sqlPassword);
  }
}
