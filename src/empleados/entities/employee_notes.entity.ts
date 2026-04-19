import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Employee } from './empleado.entity';

@Entity('employee_notes')
export class EmployeeNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee, (employee) => employee.notas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column()
  descripcion: string;

  @Column({ nullable: true })
  value: string;

  @Column({ nullable: true })
  tipo: string;

  @CreateDateColumn()
  fechaCreacion: Date;
}
