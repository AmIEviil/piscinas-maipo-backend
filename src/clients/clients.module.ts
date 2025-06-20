import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './entities/clients.entity';
import { Maintenance } from './entities/maintenance.entity';
import { MaintenanceProduct } from './entities/maintenance-product.entity';
import { Product } from './entities/product.entity';

@Module({
  providers: [ClientsService],
  controllers: [ClientsController],
  imports: [
    TypeOrmModule.forFeature([
      Client,
      Maintenance,
      MaintenanceProduct,
      Product,
    ]),
  ],
})
export class ClientsModule {}
