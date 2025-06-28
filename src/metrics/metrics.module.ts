import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '@clients/entities/clients.entity';
import { Maintenance } from 'maintenance/entities/maintenance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Maintenance])],
  providers: [MetricsService],
  controllers: [MetricsController],
})
export class MetricsModule {}
