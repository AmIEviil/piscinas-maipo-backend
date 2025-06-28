import { DataSource } from 'typeorm';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { MaintenanceProduct } from '../maintenance/entities/maintenance-product.entity';
import { Client } from '../clients/entities/clients.entity';
import { Product } from '../products/entities/product.entity';
import { MaintenanceTemporality } from '../clients/entities/frecuency-maintenance';
import { Repair } from '../repairs/entities/repair.entity';

import * as dotenv from 'dotenv';
import { Revestimiento } from '../revestimientos/entities/revestimiento.entity';
import { ExtraRevestimiento } from '../revestimientos/entities/extra-revestimiento.entity';
import { ProductType } from '../products/entities/product-type';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  entities: [
    Maintenance,
    MaintenanceProduct,
    Client,
    Product,
    MaintenanceTemporality,
    Repair,
    Revestimiento,
    ExtraRevestimiento,
    ProductType,
  ],
});

async function seedMantenciones() {
  await AppDataSource.initialize();

  const maintenanceRepo = AppDataSource.getRepository(Maintenance);
  const maintenanceProductRepo =
    AppDataSource.getRepository(MaintenanceProduct);
  const clientRepo = AppDataSource.getRepository(Client);
  const productRepo = AppDataSource.getRepository(Product);

  const clientes = await clientRepo.find();
  const productos = await productRepo.find();

  if (!clientes.length || !productos.length) {
    console.error('❌ No hay clientes o productos para crear mantenciones.');
    await AppDataSource.destroy();
    return;
  }

  //   console.log('🧹 Limpiando registros de mantenciones');
  //   await maintenanceProductRepo.delete({});
  //   await maintenanceRepo.delete({});

  console.log('⌛ Insertando datos de mantenciones...');
  for (const cliente of clientes) {
    for (let i = 0; i < 4; i++) {
      const mantencion = await maintenanceRepo.save(
        maintenanceRepo.create({
          fechaMantencion: new Date(2025, i + 1, 10), // fechas distintas
          cantBidones: 1 + i,
          cantTabletas: 2,
          otros: 'Limpieza semanal',
          realizada: true,
          recibioPago: i % 2 === 0, // alterna pago/no pago
          client: cliente,
          valorMantencion: cliente.valor_mantencion,
        }),
      );

      await maintenanceProductRepo.save([
        {
          maintenance: mantencion,
          product: productos[i % productos.length],
          cantidad: 1 + (i % 3),
        },
        {
          maintenance: mantencion,
          product: productos[(i + 1) % productos.length],
          cantidad: 2,
        },
      ]);
    }
  }

  console.log('✅ Se crearon mantenciones para todos los clientes.');
  await AppDataSource.destroy();
}

seedMantenciones().catch((e) => {
  console.error('❌ Error en seed de mantenciones:', e);
  AppDataSource.destroy();
});
