import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Maintenance } from '../../maintenance/entities/maintenance.entity';
import { Repair } from '../../repairs/entities/repair.entity';
import { Revestimiento } from '../../revestimientos/entities/revestimiento.entity';
import { MaintenanceTemporality } from './frecuency-maintenance';

@Entity()
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  direccion: string;

  @Column()
  comuna: string;

  @Column()
  telefono: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true, type: 'date' })
  fecha_ingreso: Date;

  @Column()
  tipo_piscina: string;

  @Column({ name: 'dia_mantencion' })
  dia_mantencion: string;

  @Column({ name: 'valor_mantencion', type: 'int' })
  valor_mantencion: number;

  @Column({ name: 'isActive', default: true })
  isActive: boolean;

  @ManyToOne(() => MaintenanceTemporality, (t) => t.clientes, { eager: true })
  @JoinColumn({ name: 'frecuencia_mantencion_id' })
  frecuencia_mantencion: MaintenanceTemporality;

  @OneToMany(() => Maintenance, (m) => m.client)
  mantenciones: Maintenance[];

  @OneToMany(() => Repair, (r) => r.client)
  reparaciones: Repair[];

  @OneToMany(() => Revestimiento, (r) => r.client)
  revestimientos: Revestimiento[];
}
