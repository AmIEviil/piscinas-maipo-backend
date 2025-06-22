import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { Client } from '../clients/entities/clients.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { MaintenanceProduct } from '../maintenance/entities/maintenance-product.entity';
import { Product } from '../products/entities/product.entity';
import { Repair } from '@repairs/entities/repair.entity';
import { Revestimiento } from '@revestimientos/entities/revestimiento.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [MaintenanceService],
  controllers: [MaintenanceController],
  imports: [
    TypeOrmModule.forFeature([
      Client,
      Maintenance,
      MaintenanceProduct,
      Product,
      Repair,
      Revestimiento,
    ]),
  ],
})
export class MaintenanceModule {}
