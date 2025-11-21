import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Revestimiento } from './revestimiento.entity';

@Entity()
export class ExtraRevestimiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Revestimiento, (r) => r.extras, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'revestimiento_id' })
  revestimiento: Revestimiento;

  @Column()
  nombre: string;

  @Column('int')
  valor: number;

  @Column('text')
  detalle: string;
}
