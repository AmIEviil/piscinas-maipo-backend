import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MaintenanceProduct } from '../../maintenance/entities/maintenance-product.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true, type: 'int', default: 0 })
  valor_unitario: number;

  @Column({ nullable: true, type: 'int', default: 0 })
  cant_disponible: number;

  @OneToMany(() => MaintenanceProduct, (mp) => mp.product)
  mantenimientos: MaintenanceProduct[];
}
