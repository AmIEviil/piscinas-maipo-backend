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
import { RevestimientoImagen } from './revestimiento-imagen.entity';

@Entity()
export class Revestimiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, (c) => c.revestimientos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'date' })
  fechaPropuesta: Date;

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

  @Column('float')
  costoManoObra: number;

  @Column('float')
  costoMateriales: number;

  @Column('float')
  costoTotal: number;

  @Column({ nullable: true, type: 'float' })
  porcentajeGanancia: number;

  @Column('float')
  valorTotal: number;

  @Column({ nullable: true, type: 'text', default: 'Pendiente' })
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

  @OneToMany(() => RevestimientoImagen, (img) => img.revestimiento, {
    cascade: true,
  })
  imagenes: RevestimientoImagen[];
}
