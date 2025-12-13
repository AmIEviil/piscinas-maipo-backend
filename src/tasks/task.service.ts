import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CronExpression } from '@nestjs/schedule';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor() {}

  @Cron(CronExpression.EVERY_2_HOURS)
  handleCronEvery2Hours() {
    try {
      this.logger.log(`✅ Ejecutando tarea cada 2 horas`);
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
