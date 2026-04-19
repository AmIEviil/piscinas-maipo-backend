import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmployeeNote } from './employee_notes.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ unique: true, nullable: false })
  rut: string;

  @Column()
  dv: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  telefono: string;

  @Column()
  direccion: string;

  @Column({ type: 'date' })
  fechaInicioContrato: Date;

  @Column({ type: 'date', nullable: true })
  fechaFinContrato: Date;

  @Column()
  sueldo: number;

  @Column()
  tipoContrato: string;

  @Column({ default: 'ACTIVO' })
  estado: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  grupo: string;

  @OneToMany(() => EmployeeNote, (note) => note.employee)
  notas: EmployeeNote[];
}
