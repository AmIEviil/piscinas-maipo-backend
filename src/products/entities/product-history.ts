import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product_history')
export class ProductHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  product_id: string;

  @Column('int')
  precio_anterior: number;

  @Column('int')
  precio_nuevo: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_cambio: Date;
}
