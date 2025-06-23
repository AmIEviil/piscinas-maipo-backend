import { DataSource } from 'typeorm';
import { Client } from './clients/entities/clients.entity';
import { Product } from './products/entities/product.entity';
import { Maintenance } from './maintenance/entities/maintenance.entity';
import { MaintenanceProduct } from './maintenance/entities/maintenance-product.entity';
import { Revestimiento } from './revestimientos/entities/revestimiento.entity';
import { ExtraRevestimiento } from './revestimientos/entities/extra-revestimiento.entity';
import { Repair } from './repairs/entities/repair.entity';
import { ProductType } from './products/entities/product-type';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  entities: [
    Product,
    Client,
    Maintenance,
    MaintenanceProduct,
    Revestimiento,
    ExtraRevestimiento,
    Repair,
    ProductType,
  ],
  migrations: ['src/migrations/*.ts'],
});
