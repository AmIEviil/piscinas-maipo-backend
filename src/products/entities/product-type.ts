import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombre: string;
  @OneToMany(() => Product, (product) => product.tipo)
  productos: Product[];
}
