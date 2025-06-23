import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;
  @OneToMany(() => Product, (product) => product.tipo)
  productos: Product[];
}
