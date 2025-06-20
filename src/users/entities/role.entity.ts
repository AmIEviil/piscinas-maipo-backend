import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToOne,
  Column,
} from 'typeorm';
import { User } from './user.entity';

@Entity('role_users')
export class RoleUser {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.roleUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  nombre: string;
}
