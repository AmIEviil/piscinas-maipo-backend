import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/clients.entity';
import { ExtraRevestimiento } from './extra-revestimiento.entity';

@Entity()
export class Revestimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Client, (c) => c.revestimientos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'date' })
  fechaPropuesta: Date;

  @Column({ type: 'date' })
  fechaTrabajo: Date;

  @Column('float')
  largoPiscina: number;

  @Column('float')
  anchoPiscina: number;

  @Column('float')
  profundidadMin: number;

  @Column('float')
  profundidadMax: number;

  @Column('float')
  profundidadAvg: number;

  @Column('text')
  detalles: string;

  @Column('text')
  garantia: string;

  @Column('int')
  valor: number;

  @OneToMany(() => ExtraRevestimiento, (e) => e.revestimiento, {
    cascade: true,
  })
  extras: ExtraRevestimiento[];
}
