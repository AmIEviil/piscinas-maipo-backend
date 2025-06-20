import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MaintenanceProduct } from './maintenance-product.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ name: 'valor_unitario', type: 'decimal' })
  valorUnitario: number;

  @OneToMany(() => MaintenanceProduct, (mp) => mp.product)
  mantenimientos: MaintenanceProduct[];
}
