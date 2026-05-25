import { Module } from '@nestjs/common';
import { TasksService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ScheduleModule.forRoot(), ProductsModule],
  providers: [TasksService],
})
export class TasksModule {}
