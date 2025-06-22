import { DataSource } from 'typeorm';
import { Client } from '../clients/entities/clients.entity';
import { Product } from '../products/entities/product.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { MaintenanceProduct } from '../maintenance/entities/maintenance-product.entity';
import { Repair } from '../repairs/entities/repair.entity';
import { Revestimiento } from '../revestimientos/entities/revestimiento.entity';
import { ExtraRevestimiento } from '../revestimientos/entities/extra-revestimiento.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Holitas.01',
  database: 'piscinasElMaipo',
  synchronize: false,
  entities: [
    Client,
    Product,
    Maintenance,
    MaintenanceProduct,
    Repair,
    Revestimiento,
    ExtraRevestimiento,
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

  console.log('⏳ Insertando datos de prueba...');

  // Cliente
  const cliente = await clientRepo.save(
    clientRepo.create({
      nombre: 'Carlos Ramírez',
      direccion: 'Camino del Bosque 456',
      comuna: 'La Reina',
      telefono: '987654321',
      email: 'carlos@example.com',
      fecha_ingreso: new Date('2023-11-15'),
      tipo_piscina: 'Hormigón',
      dia_mantencion: 'Martes',
      valor_mantencion: 30000,
    }),
  );

  // Productos
  const productos = await productRepo.save([
    productRepo.create({
      nombre: 'Tabletas',
      valor_unitario: 3000,
      cant_disponible: 50,
    }),
    productRepo.create({
      nombre: 'Cloro Granulado 1KG',
      valor_unitario: 5500,
      cant_disponible: 30,
    }),
  ]);

  // Mantención
  const mantencion = await maintenanceRepo.save(
    maintenanceRepo.create({
      fechaMantencion: new Date(),
      cantBidones: 1,
      cantTabletas: 2,
      otros: 'Limpieza general',
      realizada: true,
      recibioPago: false,
      client: cliente,
    }),
  );

  // Productos usados en mantención
  await maintenanceProductRepo.save([
    maintenanceProductRepo.create({
      maintenance: mantencion,
      product: productos[0],
      cantidad: 3,
    }),
    maintenanceProductRepo.create({
      maintenance: mantencion,
      product: productos[1],
      cantidad: 1,
    }),
  ]);

  // Reparación
  await repairRepo.save(
    repairRepo.create({
      client: cliente,
      fechaTrabajo: new Date('2024-05-20'),
      detalles: 'Reparación de bomba de filtrado',
      materiales: 'Bomba 1HP, PVC',
      garantia: '6 meses',
    }),
  );

  // Revestimiento
  const revestimiento = await revestimientoRepo.save(
    revestimientoRepo.create({
      client: cliente,
      fechaPropuesta: new Date('2024-10-01'),
      fechaTrabajo: new Date('2024-10-15'),
      largoPiscina: 8,
      anchoPiscina: 4,
      profundidadMin: 1.2,
      profundidadMax: 2.0,
      profundidadAvg: 1.6,
      detalles: 'Revestimiento con fibra de vidrio azul',
      garantia: '10 años',
      valor: 3500000,
    }),
  );

  // Extra del revestimiento
  await extraRevestimientoRepo.save(
    extraRevestimientoRepo.create({
      revestimiento: revestimiento,
      nombre: 'Desmonte de árbol',
      valor: 120000,
      detalle: 'Remoción de árbol que interfería con la piscina',
    }),
  );

  console.log('✅ Datos insertados con éxito.');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Error durante el seed:', err);
  AppDataSource.destroy();
});
