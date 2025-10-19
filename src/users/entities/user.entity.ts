import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoleUser } from './role-user.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  user_name: string;

  @Column('text')
  first_name: string;

  @Column('text')
  last_name: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text', { nullable: true })
  email: string;

  @Column('text', {
    select: false,
    nullable: true,
  })
  password?: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login?: Date;

  @Column({ type: 'timestamp', nullable: true })
  session_closed_at?: Date;

  @Column('int', { default: 0 })
  failed_attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  blocked_until: Date | null;

  @Column('text', { nullable: true })
  refresh_token?: string;

  @OneToOne(() => RoleUser, (roleUser) => roleUser.user, {
    cascade: true,
    eager: true,
  })
  roleUser: RoleUser;
}
