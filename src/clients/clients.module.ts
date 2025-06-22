import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './entities/clients.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { MaintenanceProduct } from '../maintenance/entities/maintenance-product.entity';
import { Product } from '../products/entities/product.entity';
import { Repair } from '../repairs/entities/repair.entity';
import { Revestimiento } from '../revestimientos/entities/revestimiento.entity';

@Module({
  providers: [ClientsService],
  controllers: [ClientsController],
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
export class ClientsModule {}
