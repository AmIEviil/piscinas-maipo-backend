import { Module } from '@nestjs/common';
import { TasksService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductsModule } from '../products/products.module';
import { PagosModule } from '../pagos/pagos.module';
import { UsersModule } from '../users/users.module';
import { MaintenanceModule } from '../maintenance/maintenance.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ProductsModule,
    PagosModule,
    UsersModule,
    MaintenanceModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
