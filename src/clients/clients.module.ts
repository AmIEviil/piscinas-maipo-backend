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
import { MaintenanceTemporality } from './entities/frecuency-maintenance';
import { Observaciones } from 'observaciones/entity/observaciones.entity';
import { ObservacionesService } from 'observaciones/observaciones.service';

@Module({
  providers: [ClientsService, ObservacionesService],
  controllers: [ClientsController],
  imports: [
    TypeOrmModule.forFeature([
      Client,
      Maintenance,
      MaintenanceTemporality,
      MaintenanceProduct,
      Product,
      Repair,
      Revestimiento,
      Observaciones,
    ]),
  ],
})
export class ClientsModule {}
