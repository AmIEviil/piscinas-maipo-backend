import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Client } from './clients/entities/clients.entity';
import { Product } from './products/entities/product.entity';
import { Maintenance } from './maintenance/entities/maintenance.entity';
import { MaintenanceProduct } from './maintenance/entities/maintenance-product.entity';
import { Revestimiento } from './revestimientos/entities/revestimiento.entity';
import { ExtraRevestimiento } from './revestimientos/entities/extra-revestimiento.entity';
import { Repair } from './repairs/entities/repair.entity';
import { ProductType } from './products/entities/product-type';
import { MaintenanceTemporality } from './clients/entities/frecuency-maintenance';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';
import { RoleUser } from './users/entities/role-user.entity';
import { RevestimientoImagen } from './revestimientos/entities/revestimiento-imagen.entity';
import { UploadedFiles } from './uploaded-files/entities/uploaded-files.entity';
import { ComprobantePago } from './pagos/entities/comprobante-pago.entity';
import { AccessAudit } from './audit/entities/access-audit.entity';
import { DeletionLog } from './arcop/entities/deletion-log.entity';
// El DataSource del CLI no compartia la lista de entidades del AppModule y le
// faltaban seis. Como ProductHistory es el lado inverso de Product#historial,
// TypeORM no lograba construir los metadatos y `yarn migration:run` abortaba
// antes de ejecutar ninguna migracion: hasta ahora el esquema lo creaba
// `synchronize: true`, asi que el fallo pasaba desapercibido. Las tablas
// access_audit y data_deletion_log si dependen de sus migraciones.
import { ProductHistory } from './products/entities/product-history';
import { Employee } from './empleados/entities/empleado.entity';
import { EmployeeNote } from './empleados/entities/employee_notes.entity';
import { MigrationAudit } from './migraciones/entities/migration-audit.entity';
import { Observaciones } from './observaciones/entity/observaciones.entity';
import { Vehicle } from './vehicles/entities/vehicle.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        }
      : false,
  entities: [
    Product,
    Client,
    Maintenance,
    MaintenanceProduct,
    Revestimiento,
    ExtraRevestimiento,
    Repair,
    ProductType,
    MaintenanceTemporality,
    User,
    Role,
    RoleUser,
    RevestimientoImagen,
    UploadedFiles,
    ComprobantePago,
    AccessAudit,
    DeletionLog,
    ProductHistory,
    Employee,
    EmployeeNote,
    MigrationAudit,
    Observaciones,
    Vehicle,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
});
