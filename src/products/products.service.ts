import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductType } from './entities/product-type';
import { FilterProductDto } from './dto/FilterProduct.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductType)
    private productTypeRepository: Repository<ProductType>,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['tipo'] });
  }

  async findByFilters(filters: FilterProductDto): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product');
    if (filters.nombre) {
      query.andWhere('product.nombre ILIKE :nombre', {
        nombre: `%${filters.nombre}%`,
      });
    }
    if (filters.tipoId) {
      query.andWhere('product.tipoId = :tipoId', { tipoId: filters.tipoId });
    }
    return query.getMany();
  }

  async getAllProductTypes(): Promise<ProductType[]> {
    const productTypes = await this.productTypeRepository.find();
    return productTypes;
  }

  async getProductMetrics() {
    const products = await this.productRepository.find({
      relations: ['tipo', 'mantenimientos'],
    });

    const metricsMap = new Map<
      string,
      { disponibles: number; usados: number }
    >();

    for (const product of products) {
      const tipo = product.tipo?.nombre ?? 'Sin tipo';

      const disponibles = product.cant_disponible ?? 0;

      const usados =
        product.mantenimientos?.reduce(
          (sum, m) => sum + (m.cantidad ?? 0),
          0,
        ) ?? 0;

      if (!metricsMap.has(tipo)) {
        metricsMap.set(tipo, { disponibles: 0, usados: 0 });
      }

      const current = metricsMap.get(tipo)!;
      current.disponibles += disponibles;
      current.usados += usados;
    }

    return Array.from(metricsMap.entries()).map(([tipo, data]) => ({
      tipo,
      disponibles: data.disponibles,
      usados: data.usados,
      porcentaje_utilizado:
        data.usados + data.disponibles > 0
          ? Math.round((data.usados / (data.usados + data.disponibles)) * 100)
          : 0,
    }));
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const newProduct = this.productRepository.create(productData);
    return this.productRepository.save(newProduct);
  }

  async createProductType(
    productData: Partial<ProductType>,
  ): Promise<ProductType> {
    const newProductType = this.productTypeRepository.create(productData);
    return this.productTypeRepository.save(newProductType);
  }

  async updateProduct(
    id: string,
    productData: Partial<Product>,
  ): Promise<Product> {
    await this.productRepository.update(id, productData);
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async updateProductType(
    id: string,
    productData: Partial<ProductType>,
  ): Promise<ProductType> {
    await this.productTypeRepository.update(id, productData);
    const productType = await this.productTypeRepository.findOne({
      where: { id },
    });
    if (!productType) {
      throw new NotFoundException(`ProductType with id ${id} not found`);
    }
    return productType;
  }

  async deleteProduct(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
  }

  async deleteProductType(id: string): Promise<void> {
    const result = await this.productTypeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ProductType with id ${id} not found`);
    }
  }
}
