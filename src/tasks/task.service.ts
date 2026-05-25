import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductsService } from '../products/products.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly productsService: ProductsService) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCronEvery2Hours() {
    try {
      this.logger.log(`✅ Ejecutando tarea cada 2 horas`);
      const lowStockProducts = await this.productsService.getLowStockProducts();
      if (lowStockProducts.length > 0) {
        const names = lowStockProducts
          .map((p) => `${p.nombre} (${p.cant_disponible} disp.)`)
          .join(', ');
        this.logger.warn(`⚠️ Productos con stock bajo: ${names}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          '❌ Error al ejecutar tarea cada 2 horas:',
          error.message,
        );
      } else {
        this.logger.error(
          '❌ Error al ejecutar tarea cada 2 horas:',
          String(error),
        );
      }
    }
  }
}
