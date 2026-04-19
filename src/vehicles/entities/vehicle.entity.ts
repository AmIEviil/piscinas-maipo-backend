import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  placa: string;

  @Column()
  marca: string;

  @Column()
  modelo: string;

  @Column({ type: 'int' })
  anio: number;

  @Column()
  color: string;

  @Column()
  ultima_mantencion: Date;

  @Column({ type: 'int' })
  kilometraje: number;

  @Column({ nullable: true })
  tipo_combustible: string;

  @Column({ nullable: true })
  chofer_asignado: string;

  @Column({ nullable: true })
  copiloto_asignado: string;

  @Column({ name: 'isActive', default: true })
  isActive: boolean;
}
