import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MaintenanceProduct } from '../../maintenance/entities/maintenance-product.entity';
import { ProductType } from './product-type';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductType, { nullable: false })
  @JoinColumn({ name: 'id_tipo' })
  tipo: ProductType;

  @Column()
  nombre: string;

  @Column({ nullable: true, type: 'int', default: 0 })
  valor_unitario: number;

  @Column({ nullable: true, type: 'int', default: 0 })
  cant_disponible: number;

  @OneToMany(() => MaintenanceProduct, (mp) => mp.product)
  mantenimientos: MaintenanceProduct[];
}
