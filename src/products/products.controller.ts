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
import { ROLES, ROLE_GROUPS } from '../auth/constants/roles';

@Controller('products')
@UseGuards(JwtAuthGuard)
// Los tecnicos necesitan consultar el catalogo para registrar los productos
// usados en una mantencion; la escritura sigue restringida por metodo.
@Roles(...ROLE_GROUPS.STAFF)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.getAllProducts();
  }

  @Get('filter')
  getProducts(
    @Query('nombre') nombre?: string,
    @Query('tipoId') tipoId?: string,
  ) {
    return this.productsService.findByFilters({ nombre, tipoId });
  }

  @Get('low-stock')
  getLowStockProducts() {
    return this.productsService.getLowStockProducts();
  }

  @Get('metrics')
  getMetrics() {
    return this.productsService.getProductMetrics();
  }

  @Get('types')
  getAllProductTypes() {
    return this.productsService.getAllProductTypes();
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Post('types')
  createProductType(@Body() productData: Partial<ProductType>) {
    return this.productsService.createProductType(productData);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Post()
  createProduct(@Body() productData: Partial<Product>) {
    return this.productsService.createProduct(productData);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Put(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() productData: Partial<Product>,
  ) {
    return this.productsService.updateProduct(id, productData);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Put('types/:id')
  updateProductType(
    @Param('id') id: string,
    @Body() productData: Partial<ProductType>,
  ) {
    return this.productsService.updateProductType(id, productData);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Delete('types/:id')
  deleteProductType(@Param('id') id: string) {
    return this.productsService.deleteProductType(id);
  }
}
