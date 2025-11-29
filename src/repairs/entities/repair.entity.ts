import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/clients.entity';

@Entity()
export class Repair {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, (c) => c.reparaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'date' })
  fechaTrabajo: Date;

  @Column('text')
  detalles: string;

  @Column('text')
  materiales: string;

  @Column('text')
  garantia: string;
}
