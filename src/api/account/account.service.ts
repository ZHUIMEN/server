import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountEntity } from '@src/api/account/entities/account.entity';
import { Repository } from 'typeorm';
import { LoginHistoryEntity } from '@src/api/login/entities/login.history.entity';
import { UserException } from '@src/common/exceptions/user.exception.error';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ResultVo } from '@src/common/vo/result.vo';
import { ApiErrorCode } from '@src/enums/api-error-code.enum';
import { LoginService } from '@src/api/login/login.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly loginService: LoginService,
    @InjectPinoLogger(AccountService.name)
    private readonly logger: PinoLogger,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(LoginHistoryEntity)
    private readonly loginHistoryRepository: Repository<LoginHistoryEntity>
  ) {}

  /**
   * @Description: 创建账号
   * @param createAccountDto
   */
  async create(createAccountDto: CreateAccountDto) {
    // 1、查询是否有相同的用户名
    // 2、如果不存在则新建
    // 3、如果存在在抛出错误
    const accountResult = await this.accountRepository.findOne({
      where: [
        { username: createAccountDto.username },
        { mobile: createAccountDto.mobile },
        { email: createAccountDto.email },
      ],
    });
    this.logger.debug('accountResult%o', accountResult);
    if (accountResult?.id) {
      this.logger.info(`用户名/手机号码/邮箱已经存在，不能重复创建:${createAccountDto.username}`);
      throw new UserException(
        '用户名/手机号码/邮箱已经存在，不能重复创建',
        ApiErrorCode.PARAMS_INVAL,
        createAccountDto
      );
    }
    const accountEntity = this.accountRepository.create(createAccountDto);
    await this.accountRepository.save(accountEntity);
    return ResultVo.ok<boolean>(true, '创建成功');
  }

  /**
   * 查找用户是否存在
   * @param username
   */
  async findByUsername(username: string) {
    // 因为  AccountEntity select: false, 拿不到password,
    // const account = await this.accountRepository.findOne({
    //   where: { username },
    // });
    const account = await this.loginService.queryLoginBuilder
      .where('(account.username = :username)', { username })
      .getRawOne();

    return account;
  }

  /**
   * 通过id查找
   */
  async findByUserId(id: number) {
    return this.accountRepository.findOne({ where: { id } });
  }
}
