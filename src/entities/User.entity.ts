import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user', { schema: 'cj_table' })
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'user_name', length: 255 })
  userName: string;

  @Column('varchar', { name: 'pass_word', length: 255 })
  passWord: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date | null;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date | null;

  @Column('int', { name: 'deleted', nullable: true, default: () => "'0'" })
  deleted: number | null;
}
