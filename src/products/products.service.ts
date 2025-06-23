import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productRepository.find();
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
}
