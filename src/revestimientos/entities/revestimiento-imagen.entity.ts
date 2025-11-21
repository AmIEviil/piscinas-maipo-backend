import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Revestimiento } from './revestimiento.entity';

@Entity()
export class RevestimientoImagen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string; // secure_url de Cloudinary

  @Column()
  public_id: string; // ID de Cloudinary para eliminar o actualizar

  @ManyToOne(() => Revestimiento, (r) => r.imagenes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'revestimiento_id' })
  revestimiento: Revestimiento;
}
