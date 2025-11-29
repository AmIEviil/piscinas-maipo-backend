import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'users/entities/user.entity';

@Entity('migration_audit')
export class MigrationAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  migration_name: string;

  @Column()
  action: 'EXECUTE' | 'REVERT';

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @CreateDateColumn()
  executed_at: Date;

  @Column({ default: true })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  error_message: string;
}
