import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductType } from './entities/product-type';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/roles/roles.constants';

@Controller('products')
@Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
  @Get()
  findAll() {
    return this.productsService.getAllProducts();
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
  @Get('filter')
  getProducts(
    @Query('nombre') nombre?: string,
    @Query('tipoId') tipoId?: string,
  ) {
    return this.productsService.findByFilters({ nombre, tipoId });
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
  @Get('low-stock')
  getLowStockProducts() {
    return this.productsService.getLowStockProducts();
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
  @Get('metrics')
  getMetrics() {
    return this.productsService.getProductMetrics();
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
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

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
  @Put(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() productData: Partial<Product>,
  ) {
    return this.productsService.updateProduct(id, productData);
  }

  @Put('types/:id')
  updateProductType(
    @Param('id') id: string,
    @Body() productData: Partial<ProductType>,
  ) {
    return this.productsService.updateProductType(id, productData);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Delete('types/:id')
  deleteProductType(@Param('id') id: string) {
    return this.productsService.deleteProductType(id);
  }
}
