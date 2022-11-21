import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { Test } from 'src/entities/Test.entity';
import { Repository } from 'typeorm';
import { UserDto } from './dto/index.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Test)
    private readonly TestRepository: Repository<Test>,
  ) {}
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
  async creadUser(user: UserDto) {
    console.log(user);
    return this.usersRepository.insert(user);
  }
  async findTestAll(): Promise<Test[]> {
    return this.TestRepository.find();
  }
}
