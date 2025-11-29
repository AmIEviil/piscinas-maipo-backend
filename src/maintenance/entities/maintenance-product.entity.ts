import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { Maintenance } from './maintenance.entity';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class MaintenanceProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Maintenance, (m) => m.productos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'maintenance_id' })
  maintenance: Maintenance;

  @ManyToOne(() => Product, (p) => p.mantenimientos, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' })
  cantidad: number;
}
