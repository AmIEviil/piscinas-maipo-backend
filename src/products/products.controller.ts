import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductType } from './entities/product-type';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.getAllProducts();
  }

  @Get('filter')
  getProducts(
    @Query('nombre') nombre?: string,
    @Query('tipoId') tipoId?: number,
  ) {
    return this.productsService.findByFilters({ nombre, tipoId });
  }

  @Get('metrics')
  getMetrics() {
    return this.productsService.getProductMetrics();
  }

  @Get('types')
  getAllProductTypes() {
    return this.productsService.getAllProductTypes();
  }

  @Post('types')
  createProductType(@Body() productData: Partial<ProductType>) {
    return this.productsService.createProductType(productData);
  }

  @Post()
  createProduct(@Body() productData: Partial<Product>) {
    return this.productsService.createProduct(productData);
  }

  @Put(':id')
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() productData: Partial<Product>,
  ) {
    return this.productsService.updateProduct(id, productData);
  }

  @Put('types/:id')
  updateProductType(
    @Param('id', ParseIntPipe) id: number,
    @Body() productData: Partial<ProductType>,
  ) {
    return this.productsService.updateProductType(id, productData);
  }

  @Delete(':id')
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }

  @Delete('types/:id')
  deleteProductType(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProductType(id);
  }
}
