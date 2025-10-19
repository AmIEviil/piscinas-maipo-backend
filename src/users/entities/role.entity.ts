import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RoleUser } from './role-user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  nombre: string;

  @OneToMany(() => RoleUser, (roleUser) => roleUser.role)
  roleUsers: RoleUser[];
}
