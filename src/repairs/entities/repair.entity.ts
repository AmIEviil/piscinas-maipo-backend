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

  @Column({ name: 'fecha_ingreso', type: 'date' })
  fecha_ingreso: Date;

  @Column({ name: 'fecha_trabajo', type: 'date' })
  fecha_trabajo: Date;

  @Column('text')
  detalles: string;

  @Column('text')
  materiales: string;

  @Column({ name: 'costo_reparacion', type: 'int' })
  costo_reparacion: number;

  @Column({ name: 'valor_reparacion', type: 'int' })
  valor_reparacion: number;

  @Column({ type: 'text', default: 'pendiente' })
  estado: string;

  @Column('text')
  garantia: string;
}
