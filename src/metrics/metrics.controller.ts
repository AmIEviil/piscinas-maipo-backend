import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('daily')
  async getDaily() {
    return this.metricsService.getDailyMetrics();
  }

  @Get('weekly')
  async getWeekly() {
    return this.metricsService.getWeeklyMetrics();
  }

  @Get('monthly')
  async getMonthly(@Query('from') from: string, @Query('to') to: string) {
    if (!from || !to) {
      return {
        error:
          'Debes proporcionar un rango de fechas. Ejemplo: /metrics/monthly?from=2025-06-01&to=2025-06-30',
      };
    }

    return this.metricsService.getMonthlyMetrics(from, to);
  }
}
