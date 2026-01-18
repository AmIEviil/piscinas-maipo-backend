import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('text')
  fileId: string;

  @Column({ type: 'uuid', nullable: false })
  parentId: string;
}
