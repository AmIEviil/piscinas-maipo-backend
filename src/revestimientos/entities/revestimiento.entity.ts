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

  @Column('float')
  areaPiscina: number;

  @Column('float')
  volumenPiscina: number;

  @Column()
  tipoRevestimiento: string;

  @Column('float')
  valorM2: number;

  @Column('int')
  costoManoObra: number;

  @Column('int')
  costoMateriales: number;

  @Column('int')
  costoTotal: number;

  @Column('int')
  valorTotal: number;

  @Column()
  estado: string;

  @Column({ nullable: true, type: 'text' })
  detalles: string;

  @Column({ nullable: true, type: 'text' })
  garantia: string;

  @Column({ nullable: true, type: 'date' })
  fechaInicio: Date;

  @Column({ nullable: true, type: 'date' })
  fechaTermino: Date;

  @OneToMany(() => ExtraRevestimiento, (e) => e.revestimiento, {
    cascade: true,
  })
  extras: ExtraRevestimiento[];
}
