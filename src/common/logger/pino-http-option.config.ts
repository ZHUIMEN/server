// pino-http 配置
// https://github.com/pinojs/pino-http
import { IncomingMessage } from 'http';
import { Options } from 'pino-http';
import { DestinationStream, multistream, StreamEntry } from 'pino';
import { getStream } from 'file-stream-rotator';
import { LEVEL_LIST } from '@src/constants';
import { FileStreamRotatorOptions } from 'file-stream-rotator/lib/types';

/**
 * ===
 *
 * %s 字符串(整数、小数也可以打印)
 * %d 整数
 * %f 小数
 * %o 对象
 * %c 后面字符串的样式
 *
 * ===
 * @param envDevMode
 */
export function pinoHttpOption(
  envDevMode = 'development',
  options: Partial<Exclude<FileStreamRotatorOptions, 'filename'>> & Pick<FileStreamRotatorOptions, 'filename'>
): [Options, DestinationStream] {
  const { filename, ...other } = options;
  //https://juejin.cn/post/7107155976997830670
  const streams = LEVEL_LIST.map((e) => {
    return {
      level: `${e}`,
      stream: getStream({
        ...other,
        filename: `${filename}/${e}.log`,
      }),
    };
  }) as StreamEntry[];
  return [
    {
      // destination: streams,
      customAttributeKeys: {
        req: '请求信息',
        res: '响应信息',
        err: '错误信息',
        responseTime: '响应时间(ms)',
      },
      // enabled: false,
      level: 'debug', //envDevMode !== 'production' ? 'debug' : 'info',
      customLogLevel(req: IncomingMessage, res: { statusCode: number }, err: any) {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn';
        } else if (res.statusCode >= 500 || err) {
          return 'error';
        }
        return 'info';
      },
      serializers: {
        req(req: {
          httpVersion: any;
          raw: { httpVersion: any; params: any; query: any; body: any };
          params: any;
          query: any;
          body: any;
        }) {
          req.httpVersion = req.raw.httpVersion;
          req.params = req.raw.params;
          req.query = req.raw.query;
          req.body = req.raw.body;
          return req;
        },
        err(err: { params: any; raw: { params: any; query: any; body: any }; query: any; body: any }) {
          err.params = err.raw?.params;
          err.query = err.raw?.query;
          err.body = err.raw?.body;
          return err;
        },
      },
      transport:
        envDevMode !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true, // 带颜色输出
                // levelFirst: true,
                // 转换时间格式
                translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
              },
            }
          : null,
    },
    multistream(streams),
  ];
}
