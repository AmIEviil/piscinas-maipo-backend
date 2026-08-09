import { NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, ObjectLiteral, Repository } from 'typeorm';
import { ArcopService } from './arcop.service';
import { Client } from '../clients/entities/clients.entity';
import { Employee } from '../empleados/entities/empleado.entity';
import { EmployeeNote } from '../empleados/entities/employee_notes.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { Repair } from '../repairs/entities/repair.entity';
import { Revestimiento } from '../revestimientos/entities/revestimiento.entity';
import { Observaciones } from '../observaciones/entity/observaciones.entity';
import { UploadedFiles } from '../uploaded-files/entities/uploaded-files.entity';
import { ComprobantePago } from '../pagos/entities/comprobante-pago.entity';
import { DeletionLog } from './entities/deletion-log.entity';

const repoWith = <T extends ObjectLiteral>(
  found: unknown,
  list: unknown[] = [],
) =>
  ({
    findOne: jest.fn().mockResolvedValue(found),
    findOneBy: jest.fn().mockResolvedValue(found),
    find: jest.fn().mockResolvedValue(list),
    count: jest.fn().mockResolvedValue(list.length),
    insert: jest.fn().mockResolvedValue(undefined),
  }) as unknown as Repository<T>;

const cliente = () =>
  ({
    id: '11111111-1111-1111-1111-111111111111',
    nombre: 'Ana Pérez',
    direccion: 'Calle 1',
    comuna: 'Buin',
    telefono: '+56900000000',
    email: 'ana@example.cl',
    tipo_piscina: 'Fibra',
    dia_mantencion: 'Lunes',
    valor_mantencion: 50000,
    isActive: true,
  }) as unknown as Client;

const empleado = () =>
  ({
    id: '22222222-2222-2222-2222-222222222222',
    nombre: 'Juan',
    apellido: 'Soto',
    rut: '12345678',
    dv: '9',
    email: 'juan@example.cl',
    telefono: '+56911111111',
    direccion: 'Calle 2',
    sueldo: 800000,
    tipoContrato: 'INDEFINIDO',
    estado: 'ACTIVO',
    grupo: 'A',
    notas: [{ id: 'n1', descripcion: 'nota' }],
  }) as unknown as Employee;

type Constancia = Record<string, unknown>;

type Deps = {
  /** Espía sobre `DeletionLog.insert`: recibe la constancia de supresión. */
  registrarConstancia: jest.Mock<Promise<void>, [Constancia]>;
  deleted: Array<{ entity: unknown; criteria: unknown }>;
  counts: Record<string, number>;
};

const constanciaRegistrada = (
  registrar: Deps['registrarConstancia'],
): Constancia => {
  expect(registrar).toHaveBeenCalled();
  return registrar.mock.calls[0][0];
};

const makeService = (
  overrides: {
    client?: Client | null;
    employee?: Employee | null;
    counts?: Record<string, number>;
  } = {},
): { service: ArcopService } & Deps => {
  const deleted: Array<{ entity: unknown; criteria: unknown }> = [];
  const constancias: Constancia[] = [];
  const counts = overrides.counts ?? {};

  const registrarConstancia: Deps['registrarConstancia'] = jest.fn(
    (constancia: Constancia) => {
      constancias.push(constancia);
      return Promise.resolve();
    },
  );
  const deletionLogRepo = {
    insert: registrarConstancia,
    find: jest.fn().mockResolvedValue([]),
  } as unknown as Repository<DeletionLog>;

  const manager = {
    count: jest.fn((entity: { name: string }) =>
      Promise.resolve(counts[entity.name] ?? 0),
    ),
    delete: jest.fn((entity: unknown, criteria: unknown) => {
      deleted.push({ entity, criteria });
      return Promise.resolve({ affected: 1 });
    }),
  } as unknown as EntityManager;

  const dataSource = {
    transaction: (cb: (m: EntityManager) => Promise<unknown>) => cb(manager),
  } as unknown as DataSource;

  const service = new ArcopService(
    repoWith<Client>(
      overrides.client === undefined ? cliente() : overrides.client,
    ),
    repoWith<Employee>(
      overrides.employee === undefined ? empleado() : overrides.employee,
    ),
    repoWith<EmployeeNote>(null),
    repoWith<Maintenance>(null),
    repoWith<Repair>(null),
    repoWith<Revestimiento>(null),
    repoWith<Observaciones>(null),
    repoWith<UploadedFiles>(null),
    repoWith<ComprobantePago>(null),
    deletionLogRepo,
    dataSource,
  );

  return { service, registrarConstancia, deleted, counts };
};

describe('ArcopService — acceso y portabilidad', () => {
  it('exporta los datos del cliente en formato estructurado', async () => {
    const { service } = makeService();

    const result = await service.exportarCliente(cliente().id);

    expect(result.tipo_titular).toBe('cliente');
    expect(result.datos_identificacion.nombre).toBe('Ana Pérez');
    expect(result).toHaveProperty('mantenciones');
    expect(result).toHaveProperty('reparaciones');
    expect(result).toHaveProperty('revestimientos');
    expect(result).toHaveProperty('observaciones');
    expect(result).toHaveProperty('archivos_adjuntos');
    expect(result).toHaveProperty('comprobantes_pago');
  });

  it('exporta el RUT del trabajador con dígito verificador', async () => {
    const { service } = makeService();

    const result = await service.exportarEmpleado(empleado().id);

    expect(result.datos_identificacion.rut).toBe('12345678-9');
    expect(result.datos_laborales.sueldo).toBe(800000);
    expect(result.notas).toHaveLength(1);
  });

  it('falla si el titular no existe', async () => {
    const { service } = makeService({ client: null });
    await expect(service.exportarCliente(cliente().id)).rejects.toThrow(
      NotFoundException,
    );
  });
});

describe('ArcopService — supresión', () => {
  it('borra también lo que no cae por cascada', async () => {
    const { service, deleted } = makeService();

    await service.suprimirCliente(
      cliente().id,
      { motivo: 'solicitud_titular' },
      'admin-1',
    );

    // Observaciones, archivos y comprobantes se enlazan por un id suelto, sin
    // clave foránea: si no se borran explícitamente quedan huérfanos.
    const entidades = deleted.map((d) => (d.entity as { name: string }).name);
    expect(entidades).toEqual(
      expect.arrayContaining([
        'Observaciones',
        'UploadedFiles',
        'ComprobantePago',
        'Client',
      ]),
    );
  });

  it('deja constancia con el alcance y quién la ejecutó', async () => {
    const { service, registrarConstancia } = makeService({
      counts: {
        Maintenance: 12,
        Repair: 2,
        Revestimiento: 1,
        Observaciones: 5,
      },
    });

    await service.suprimirCliente(
      cliente().id,
      { motivo: 'solicitud_titular', referencia_solicitud: 'TICKET-42' },
      'admin-1',
    );

    const insert = constanciaRegistrada(registrarConstancia);

    expect(insert).toMatchObject({
      entity: 'Client',
      record_id: cliente().id,
      motivo: 'solicitud_titular',
      referencia_solicitud: 'TICKET-42',
      ejecutado_por: 'admin-1',
    });
    expect(insert.alcance).toMatchObject({
      mantenciones: 12,
      reparaciones: 2,
      revestimientos: 1,
      observaciones: 5,
    });
  });

  // La constancia acredita la supresión; no debe conservar lo suprimido.
  it('la constancia no guarda datos personales del titular', async () => {
    const { service, registrarConstancia } = makeService();

    await service.suprimirCliente(
      cliente().id,
      { motivo: 'solicitud_titular' },
      'admin-1',
    );

    const insert = constanciaRegistrada(registrarConstancia);
    const serializado = JSON.stringify(insert);

    for (const dato of [
      'Ana Pérez',
      'Calle 1',
      'ana@example.cl',
      '+56900000000',
    ]) {
      expect(serializado).not.toContain(dato);
    }
  });

  it('avisa cuando quedan archivos por eliminar en el proveedor externo', async () => {
    const { service } = makeService({
      counts: { UploadedFiles: 3 },
    });

    const result = await service.suprimirCliente(
      cliente().id,
      { motivo: 'solicitud_titular' },
      'admin-1',
    );

    expect(result.requiere_accion_manual).toContain('Google Drive');
  });

  it('no avisa cuando no hay archivos asociados', async () => {
    const { service } = makeService();

    const result = await service.suprimirCliente(
      cliente().id,
      { motivo: 'fin_plazo_conservacion' },
      'admin-1',
    );

    expect(result.requiere_accion_manual).toBeNull();
  });

  it('registra la supresión de un trabajador con el número de notas', async () => {
    const { service, registrarConstancia } = makeService({
      counts: { EmployeeNote: 4 },
    });

    await service.suprimirEmpleado(
      empleado().id,
      { motivo: 'solicitud_titular' },
      'admin-1',
    );

    const insert = constanciaRegistrada(registrarConstancia);
    expect(insert.entity).toBe('Employee');
    expect(insert.alcance).toMatchObject({ notas: 4 });
  });

  it('no deja constancia si el titular no existía', async () => {
    const { service, registrarConstancia } = makeService({ employee: null });

    await expect(
      service.suprimirEmpleado(
        empleado().id,
        { motivo: 'solicitud_titular' },
        'admin-1',
      ),
    ).rejects.toThrow(NotFoundException);

    expect(registrarConstancia).not.toHaveBeenCalled();
  });
});
