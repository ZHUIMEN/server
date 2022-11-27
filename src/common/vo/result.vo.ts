import { ApiProperty } from '@nestjs/swagger';

export class ResultVo<T> {
  constructor(code = 200, success = true, message?: string, data?: any) {
    this.code = code;
    this.message = message || 'ok';
    this.data = data || null;
    this.success = success;
  }

  @ApiProperty({ type: 'number', default: 200 })
  code: number;

  @ApiProperty({ type: 'string', default: 'ok' })
  message?: string;

  @ApiProperty({ type: 'boolean', default: true })
  success?: boolean;

  @ApiProperty()
  data?: T;

  static ok<T>(data?: T, message?: string): ResultVo<T> {
    return new ResultVo<T>(200, true, message, data);
  }

  static fail<T>(code: number, message?: string, data?: T): ResultVo<T> {
    return new ResultVo<T>(code || 500, false, message || 'fail', data);
  }
}
