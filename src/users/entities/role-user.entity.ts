import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('role_users')
export class RoleUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.roleUser, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
