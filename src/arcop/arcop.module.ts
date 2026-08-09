import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArcopController } from './arcop.controller';
import { ArcopService } from './arcop.service';
import { DeletionLog } from './entities/deletion-log.entity';
import { Client } from '../clients/entities/clients.entity';
import { Employee } from '../empleados/entities/empleado.entity';
import { EmployeeNote } from '../empleados/entities/employee_notes.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { Repair } from '../repairs/entities/repair.entity';
import { Revestimiento } from '../revestimientos/entities/revestimiento.entity';
import { Observaciones } from '../observaciones/entity/observaciones.entity';
import { UploadedFiles } from '../uploaded-files/entities/uploaded-files.entity';
import { ComprobantePago } from '../pagos/entities/comprobante-pago.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeletionLog,
      Client,
      Employee,
      EmployeeNote,
      Maintenance,
      Repair,
      Revestimiento,
      Observaciones,
      UploadedFiles,
      ComprobantePago,
    ]),
  ],
  controllers: [ArcopController],
  providers: [ArcopService],
})
export class ArcopModule {}
