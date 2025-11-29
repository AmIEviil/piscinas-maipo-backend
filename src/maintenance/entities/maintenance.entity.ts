import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/clients.entity';
import { MaintenanceProduct } from './maintenance-product.entity';

@Entity()
export class Maintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'fecha_mantencion', type: 'date' })
  fechaMantencion: Date;

  @Column({ type: 'boolean' })
  realizada: boolean;

  @Column({ name: 'recibio_pago', type: 'boolean' })
  recibioPago: boolean;

  @Column({ name: 'valor_mantencion', type: 'int' })
  valor_mantencion: number;

  @ManyToOne(() => Client, (c) => c.mantenciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones: string;

  @OneToMany(() => MaintenanceProduct, (mp) => mp.maintenance, {
    cascade: true,
  })
  productos: MaintenanceProduct[];
}
