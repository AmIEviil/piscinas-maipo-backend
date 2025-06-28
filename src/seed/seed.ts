import { DataSource } from 'typeorm';
import { Client } from '../clients/entities/clients.entity';
import { Product } from '../products/entities/product.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { MaintenanceProduct } from '../maintenance/entities/maintenance-product.entity';
import { Repair } from '../repairs/entities/repair.entity';
import { Revestimiento } from '../revestimientos/entities/revestimiento.entity';
import { ExtraRevestimiento } from '../revestimientos/entities/extra-revestimiento.entity';
import { ProductType } from '../products/entities/product-type';
import { MaintenanceTemporality } from '../clients/entities/frecuency-maintenance';

import * as dotenv from 'dotenv';
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
    Client,
    Product,
    Maintenance,
    MaintenanceProduct,
    Repair,
    Revestimiento,
    ExtraRevestimiento,
    ProductType,
    MaintenanceTemporality,
  ],
});

async function seed() {
  await AppDataSource.initialize();

  const clientRepo = AppDataSource.getRepository(Client);
  const productRepo = AppDataSource.getRepository(Product);
  const maintenanceRepo = AppDataSource.getRepository(Maintenance);
  const maintenanceProductRepo =
    AppDataSource.getRepository(MaintenanceProduct);
  const repairRepo = AppDataSource.getRepository(Repair);
  const revestimientoRepo = AppDataSource.getRepository(Revestimiento);
  const extraRevestimientoRepo =
    AppDataSource.getRepository(ExtraRevestimiento);
  const productTypeRepo = AppDataSource.getRepository(ProductType);
  const maintenanceFrecuencyRepo = AppDataSource.getRepository(
    MaintenanceTemporality,
  );

  console.log('⏳ Insertando datos de prueba...');

  // Crear tipos de productos
  const tiposProducto = await productTypeRepo.save([
    { nombre: 'Liquido' },
    { nombre: 'Tableta' },
    { nombre: 'Granulado' },
    { nombre: 'Otros' },
  ]);

  // Crear productos para cada tipo
  const productos = await Promise.all(
    tiposProducto.map((tipo) => {
      const nombre =
        tipo.nombre === 'Otros'
          ? 'Sube PH'
          : `Cloro ${tipo.nombre} ${tipo.nombre === 'Liquido' ? '1LT' : tipo.nombre === 'Granulado' ? '1KG' : ''}`;
      return productRepo.save(
        productRepo.create({
          tipo,
          nombre,
          valor_unitario: 4000 + Math.floor(Math.random() * 2000),
          cant_disponible: 50 + Math.floor(Math.random() * 30),
        }),
      );
    }),
  );

  await maintenanceFrecuencyRepo.save(
    maintenanceFrecuencyRepo.create([
      { nombre: 'Semanal' },
      { nombre: 'Quincenal' },
      { nombre: 'Mensual' },
    ]),
  );

  // Crear 5 clientes
  for (let i = 1; i <= 5; i++) {
    const cliente = await clientRepo.save(
      clientRepo.create({
        nombre: `Cliente ${i}`,
        direccion: `Calle Falsa ${i * 100}`,
        comuna: 'Ñuñoa',
        telefono: `91234567${i}`,
        email: `cliente${i}@mail.com`,
        fecha_ingreso: new Date(2025, 6 - i, 23), // Ej: Junio, Mayo, etc.
        tipo_piscina: i % 2 === 0 ? 'Fibra' : 'Hormigón',
        dia_mantencion: 'Miércoles',
        valor_mantencion: 25000 + i * 1000,
      }),
    );

    // Mantención
    const mantencion = await maintenanceRepo.save(
      maintenanceRepo.create({
        fechaMantencion: new Date(),
        cantBidones: 1,
        cantTabletas: 2,
        otros: 'Mantención mensual',
        realizada: true,
        recibioPago: true,
        client: cliente,
        valorMantencion: cliente.valor_mantencion,
      }),
    );

    await maintenanceProductRepo.save([
      {
        maintenance: mantencion,
        product: productos[0],
        cantidad: 1,
      },
      {
        maintenance: mantencion,
        product: productos[1],
        cantidad: 2,
      },
    ]);

    // Reparación
    await repairRepo.save(
      repairRepo.create({
        client: cliente,
        fechaTrabajo: new Date(2025, 5, 15),
        detalles: 'Cambio de filtro',
        materiales: 'Filtro nuevo, PVC',
        garantia: '3 meses',
      }),
    );

    // Revestimiento
    const revestimiento = await revestimientoRepo.save(
      revestimientoRepo.create({
        client: cliente,
        fechaPropuesta: new Date(2025, 3, 1),
        fechaTrabajo: new Date(2025, 3, 10),
        largoPiscina: 7 + i,
        anchoPiscina: 3 + i,
        profundidadMin: 1.2,
        profundidadMax: 2.0,
        profundidadAvg: 1.6,
        detalles: `Revestimiento azul cliente ${i}`,
        garantia: '5 años',
        valor: 3000000 + i * 100000,
      }),
    );

    await extraRevestimientoRepo.save(
      extraRevestimientoRepo.create({
        revestimiento: revestimiento,
        nombre: 'Extra trabajo',
        valor: 100000 + i * 10000,
        detalle: 'Trabajo adicional',
      }),
    );
  }

  console.log('✅ Seed ejecutado con éxito.');
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error('❌ Error en seed:', e);
  AppDataSource.destroy();
});
