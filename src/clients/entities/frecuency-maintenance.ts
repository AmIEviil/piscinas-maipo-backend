import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Client } from './clients.entity';

@Entity()
export class MaintenanceTemporality {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @OneToMany(() => Client, (client) => client.frecuencia_mantencion)
  clientes: Client[];
}
