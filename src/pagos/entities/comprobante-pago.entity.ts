import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Maintenance } from '../../maintenance/entities/maintenance.entity';

@Entity('comprobante_pago')
export class ComprobantePago {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  tipo: string;

  @Column('text')
  nombre: string;

  @Column('text')
  fecha_emision: string;

  @Column({ name: 'monto', type: 'int', nullable: true })
  monto: number;

  @Column({ type: 'text', nullable: true })
  fileId: string;

  @Column({ type: 'uuid', nullable: false })
  parentId: string;

  /**
   * Visitas que cubre este pago. Muchos a muchos: un pago puede cubrir varias
   * visitas, y no obliga a tocar la tabla de mantenciones.
   */
  @ManyToMany(() => Maintenance, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'comprobante_pago_mantenciones',
    joinColumn: { name: 'comprobante_pago_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'maintenance_id', referencedColumnName: 'id' },
  })
  mantenciones: Maintenance[];
}
