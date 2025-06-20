import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Maintenance } from './maintenance.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ name: 'dia_mantencion' })
  diaMantencion: string;

  @Column('decimal', { name: 'valor_mantencion' })
  valorMantencion: number;

  @OneToMany(() => Maintenance, (m) => m.client)
  mantenciones: Maintenance[];
}
