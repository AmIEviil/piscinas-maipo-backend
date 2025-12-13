import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './entities/product-type';
import { Product } from './entities/product.entity';
import { ProductHistory } from './entities/product-history';

@Module({
  providers: [ProductsService],
  controllers: [ProductsController],
  imports: [TypeOrmModule.forFeature([Product, ProductType, ProductHistory])],
  exports: [ProductsService],
})
export class ProductsModule {}
