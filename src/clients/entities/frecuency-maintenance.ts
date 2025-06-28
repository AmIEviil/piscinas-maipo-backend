import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Client } from './clients.entity';

@Entity()
export class MaintenanceTemporality {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @OneToMany(() => Client, (client) => client.frequencia_mantencion)
  clientes: Client[];
}
