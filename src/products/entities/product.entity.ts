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
import { ProductHistory } from './product-history';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductType, { nullable: false })
  @JoinColumn({ name: 'id_tipo' })
  tipo: ProductType;

  @Column()
  nombre: string;

  @Column({ nullable: true, type: 'int', default: 0 })
  valor_unitario: number;

  @Column({ nullable: true, type: 'int', default: 0 })
  cant_disponible: number;

  @OneToMany(() => ProductHistory, (history) => history.product)
  historial: ProductHistory[];

  @OneToMany(() => MaintenanceProduct, (mp) => mp.product)
  mantenimientos: MaintenanceProduct[];
}
