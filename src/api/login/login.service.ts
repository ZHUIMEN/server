import { Injectable } from '@nestjs/common';
import { LoginVo } from '@src/api/login/vo/login.vo';
import { LoginDto } from '@src/api/login/dto/login.dto';
import type { Request } from 'express';
import { ResultVo } from '@src/common/vo/result.vo';

@Injectable()
export class LoginService {
  async login(loginDto: LoginDto, request: Request) {
    return {} as LoginVo;
  }
}
