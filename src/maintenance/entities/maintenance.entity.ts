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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'fecha_mantencion', type: 'date' })
  fechaMantencion: Date;

  @Column({ name: 'cant_bidones', type: 'int' })
  cantBidones: number;

  @Column({ name: 'cant_tabletas', type: 'int' })
  cantTabletas: number;

  @Column('text', { nullable: true })
  otros: string;

  @Column({ type: 'boolean' })
  realizada: boolean;

  @Column({ name: 'recibio_pago', type: 'boolean' })
  recibioPago: boolean;

  @Column({ name: 'valor_mantencion', type: 'int' })
  valorMantencion: number;

  @ManyToOne(() => Client, (c) => c.mantenciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @OneToMany(() => MaintenanceProduct, (mp) => mp.maintenance, {
    cascade: true,
  })
  productos: MaintenanceProduct[];
}
