import { ApiProperty } from '@nestjs/swagger';

export class QueryVo {
  @ApiProperty()
  id?: number;
  @ApiProperty()
  createdAt?: Date;
  @ApiProperty()
  updatedAt?: Date;
}
