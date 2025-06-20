import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

import { RoleUser } from './role.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  email: string;

  @Column('text', {
    select: false,
    nullable: true,
  })
  password: string;

  @OneToOne(() => RoleUser, (roleUser) => roleUser.user, {
    cascade: true,
    eager: true,
  })
  roleUser: RoleUser;
}
