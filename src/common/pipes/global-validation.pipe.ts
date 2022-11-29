import { ArgumentMetadata, HttpStatus, Injectable, Logger, PipeTransform } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApiException } from '@src/common/exceptions/api.exception.error';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';

@Injectable()
export class GlobalValidationPipe implements PipeTransform<any> {
  // value 就是传入的实际数据
  // metatype 就是元数据,其实就是装饰器添加那些 type 为在那个装饰器中使用的‘名字‘ data 为装饰器的参数
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    Logger.debug(
      '装饰器添加:%o,当前的type：%s ,当前的参数%o',
      metadata,
      metadata.type,
      metadata.data
    );
    // 如果没有传入验证规则，则不验证，直接返回数据
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    // 将对象转换为 Class 来验证,plainToInstance(metatype, value)已经被废弃了
    const object = plainToInstance(metatype, value);

    // 同步阻塞,返回校验结果
    const errors = await validate(object);
    Logger.log('GlobalValidationPipe中错误%o', errors);
    if (errors.length > 0) {
      // 遍历全部的错误信息,返回给前端
      // const errorMessage = errors.map((item) => {
      //   return {
      //     currentValue: item.value === undefined ? '' : item.value,
      //     [item.property]: _.values(item.constraints)[0],
      //   };
      // });
      Logger.debug('error%o', errors);
      //获取第一个错误并且返回
      // const msg = _.values(errors[0].constraints)[0];
      const msg = Object.values(errors[0].constraints)[0];
      // 统一抛出异常
      // 抛出这个异常,逻辑就会交付nest的错误拦截去了
      // 要拦截这个错误做处理,可以从filters入手
      // throw new HttpException({ message: msg,code }, HttpStatus.OK);
      throw new ApiException(msg, ApiErrorCode.PARAMS_INVAL, HttpStatus.OK);
    }
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
