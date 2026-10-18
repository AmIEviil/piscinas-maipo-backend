import * as fs from 'fs';
import * as path from 'path';
import { METHOD_METADATA } from '@nestjs/common/constants';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ROLES } from './roles.constants';
import { AppController } from '../../app.controller';
import { AuthController } from '../auth.controller';
import { ClientsController } from '../../clients/clients.controller';
import { CloudinaryController } from '../../cloudinary/cloudinary.controller';
import { EmpleadosController } from '../../empleados/empleados.controller';
import { GoogleDriveController } from '../../google-drive/google-drive.controller';
import { MaintenanceController } from '../../maintenance/maintenance.controller';
import { MetricsController } from '../../metrics/metrics.controller';
import { MigracionesController } from '../../migraciones/migraciones.controller';
import { ObservacionesController } from '../../observaciones/observaciones.controller';
import { PagosController } from '../../pagos/pagos.controller';
import { PdfController } from '../../pdf/pdf.controller';
import { ProductsController } from '../../products/products.controller';
import { RepairsController } from '../../repairs/repairs.controller';
import { RevestimientosController } from '../../revestimientos/revestimientos.controller';
import { UploadedFilesController } from '../../uploaded-files/uploaded-files.controller';
import { UsersController } from '../../users/users.controller';
import { VehiclesController } from '../../vehicles/vehicles.controller';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type Ctrl = Function;

const fnDe = (c: Ctrl, m: string): object =>
  (c.prototype as Record<string, object>)[m];

const CONTROLLERS: Ctrl[] = [
  AppController,
  AuthController,
  ClientsController,
  CloudinaryController,
  EmpleadosController,
  GoogleDriveController,
  MaintenanceController,
  MetricsController,
  MigracionesController,
  ObservacionesController,
  PagosController,
  PdfController,
  ProductsController,
  RepairsController,
  RevestimientosController,
  UploadedFilesController,
  UsersController,
  VehiclesController,
];

function archivosController(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(dir, e.name);
    if (e.isDirectory()) return archivosController(ruta);
    return e.name.endsWith('.controller.ts') ? [ruta] : [];
  });
}

const metodosConRuta = (c: Ctrl): string[] =>
  Object.getOwnPropertyNames(c.prototype as object).filter(
    (m) =>
      m !== 'constructor' &&
      Reflect.getMetadata(METHOD_METADATA, fnDe(c, m)) !== undefined,
  );

// Roles efectivos: el metodo pisa a la clase (igual que RolesGuard)
const rolesEfectivos = (c: Ctrl, metodo: string): string[] =>
  (Reflect.getMetadata(ROLES_KEY, fnDe(c, metodo)) ??
    Reflect.getMetadata(ROLES_KEY, c) ??
    []) as string[];

describe('cobertura de roles en controllers', () => {
  it('el array CONTROLLERS incluye todos los *.controller.ts de src', () => {
    const archivos = archivosController(path.join(__dirname, '..', '..'));
    expect(archivos).toHaveLength(CONTROLLERS.length);
  });

  it('toda ruta es @Public o tiene @Roles en metodo o clase', () => {
    const sinProteger: string[] = [];
    for (const c of CONTROLLERS) {
      for (const m of metodosConRuta(c)) {
        const fn = fnDe(c, m);
        const ok = Boolean(
          Reflect.getMetadata(IS_PUBLIC_KEY, fn) ||
            Reflect.getMetadata(ROLES_KEY, fn) ||
            Reflect.getMetadata(ROLES_KEY, c),
        );
        if (!ok) sinProteger.push(`${c.name}.${m} no tiene @Roles ni @Public`);
      }
    }
    expect(sinProteger).toEqual([]);
  });

  it.each([
    [ProductsController, 'findAll'],
    [ProductsController, 'getProducts'],
    [ProductsController, 'getLowStockProducts'],
    [ProductsController, 'getMetrics'],
    [ProductsController, 'getAllProductTypes'],
    [ProductsController, 'updateProduct'],
    [MetricsController, 'getDaily'],
    [MaintenanceController, 'create'],
    [MaintenanceController, 'update'],
    [PagosController, 'findByParentId'],
    [UploadedFilesController, 'getFilesByParentId'],
    [ClientsController, 'create'],
    [ClientsController, 'update'],
    [RepairsController, 'findAllRepairs'],
    [RepairsController, 'findOneRepair'],
  ])('%p.%s permite Tecnico', (ctrl, metodo) => {
    expect(rolesEfectivos(ctrl as Ctrl, metodo)).toContain(ROLES.TECNICO);
  });

  it.each([
    [UsersController, 'remove'],
    [AuthController, 'create'],
    [MigracionesController, 'executeMigration'],
    [PagosController, 'deleteComprobantePago'],
    [PagosController, 'createComprobantePago'],
    [MaintenanceController, 'remove'],
    [ProductsController, 'createProduct'],
    [ClientsController, 'bulkUpdate'],
    [ClientsController, 'bulkValorMantencion'],
    [ClientsController, 'findHistorial'],
    [RepairsController, 'createRepair'],
    [RepairsController, 'deleteRepair'],
  ])('%p.%s NO permite Tecnico', (ctrl, metodo) => {
    const roles = rolesEfectivos(ctrl as Ctrl, metodo);
    expect(roles.length).toBeGreaterThan(0);
    expect(roles).not.toContain(ROLES.TECNICO);
  });
});
