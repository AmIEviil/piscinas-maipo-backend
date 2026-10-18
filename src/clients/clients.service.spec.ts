import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/clients.entity';
import { MaintenanceTemporality } from './entities/frecuency-maintenance';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { ObservacionesService } from '../observaciones/observaciones.service';
import { ClientHistoryService } from './history/client-history.service';
import { aClaveFecha } from './utils/dias.utils';

/** Gestor de entidades falso: registra los UPDATE que se le piden. */
const crearManagerFalso = () => {
  const updates: Array<{
    entidad: unknown;
    criterio: unknown;
    datos: unknown;
  }> = [];
  return {
    updates,
    find: jest.fn().mockResolvedValue([]),
    update: jest.fn((entidad: unknown, criterio: unknown, datos: unknown) => {
      updates.push({ entidad, criterio, datos });
      return Promise.resolve({ affected: 1 });
    }),
  };
};

describe('ClientsService.bulkUpdate', () => {
  let service: ClientsService;
  let manager: ReturnType<typeof crearManagerFalso>;
  let clientRepo: {
    find: jest.Mock;
    findOneBy: jest.Mock;
    merge: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    manager: { transaction: jest.Mock };
  };
  let temporalidadRepo: { findOneBy: jest.Mock; find: jest.Mock };

  const idsClientes = [
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
  ];

  beforeEach(async () => {
    manager = crearManagerFalso();
    clientRepo = {
      find: jest
        .fn()
        .mockResolvedValue(idsClientes.map((id) => ({ id }) as Client)),
      findOneBy: jest.fn(),
      merge: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      manager: {
        transaction: jest.fn((cb: (m: unknown) => Promise<unknown>) =>
          cb(manager),
        ),
      },
    };
    temporalidadRepo = {
      findOneBy: jest.fn().mockResolvedValue({ id: 'f1', nombre: 'Semanal' }),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: getRepositoryToken(Client), useValue: clientRepo },
        {
          provide: getRepositoryToken(MaintenanceTemporality),
          useValue: temporalidadRepo,
        },
        {
          provide: ObservacionesService,
          useValue: { createObservacion: jest.fn() },
        },
        {
          provide: ClientHistoryService,
          useValue: {
            registrarCambios: jest.fn(),
            registrarCreacion: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('actualiza el campo de todos los clientes en una sola sentencia', async () => {
    const resultado = await service.bulkUpdate(
      { ids: idsClientes, campo: 'ruta', valor: 'B' },
      'user-1',
    );

    expect(manager.updates).toHaveLength(1);
    expect(manager.updates[0].datos).toEqual({ ruta: 'B' });
    expect(resultado.clientesActualizados).toBe(2);
    expect(resultado.mantencionesReprogramadas).toBe(0);
  });

  it('guarda null cuando la ruta se deja vacia', async () => {
    await service.bulkUpdate(
      { ids: idsClientes, campo: 'ruta', valor: '' },
      'user-1',
    );

    expect(manager.updates[0].datos).toEqual({ ruta: null });
  });

  it('rechaza un dia de mantencion que no existe', async () => {
    await expect(
      service.bulkUpdate(
        { ids: idsClientes, campo: 'dia_mantencion', valor: 'Feriado' },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.updates).toHaveLength(0);
  });

  it('rechaza una periodicidad inexistente', async () => {
    temporalidadRepo.findOneBy.mockResolvedValue(null);

    await expect(
      service.bulkUpdate(
        {
          ids: idsClientes,
          campo: 'frecuencia_mantencion_id',
          valor: '33333333-3333-3333-3333-333333333333',
        },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(manager.updates).toHaveLength(0);
  });

  it('no escribe nada si alguno de los ids no existe', async () => {
    clientRepo.find.mockResolvedValue([{ id: idsClientes[0] } as Client]);

    await expect(
      service.bulkUpdate(
        { ids: idsClientes, campo: 'ruta', valor: 'A' },
        'user-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(manager.updates).toHaveLength(0);
  });

  it('mueve al nuevo dia las mantenciones futuras sin realizar', async () => {
    // Una semana por delante para que la fecha sea futura corra el test el dia
    // que corra: se toma el lunes de esa semana y se pide mover a viernes.
    const hoy = new Date();
    const lunesProximo = new Date(hoy);
    lunesProximo.setUTCDate(
      lunesProximo.getUTCDate() + ((8 - lunesProximo.getUTCDay()) % 7 || 7),
    );
    const fechaFutura = aClaveFecha(lunesProximo);

    manager.find.mockResolvedValue([
      { id: 'm1', fechaMantencion: fechaFutura },
    ]);

    const resultado = await service.bulkUpdate(
      { ids: idsClientes, campo: 'dia_mantencion', valor: 'Viernes' },
      'user-1',
    );

    expect(resultado.mantencionesReprogramadas).toBe(1);

    const updateMantencion = manager.updates.find(
      (registro) => registro.entidad === Maintenance,
    );
    const esperada = aClaveFecha(
      new Date(lunesProximo.getTime() + 4 * 24 * 60 * 60 * 1000),
    );
    expect(updateMantencion?.datos).toEqual({ fechaMantencion: esperada });
  });
});

describe('ClientsService historial', () => {
  let service: ClientsService;
  let manager: {
    findOneBy: jest.Mock;
    save: jest.Mock;
  };
  let clientRepo: {
    create: jest.Mock;
    merge: jest.Mock;
    manager: { transaction: jest.Mock };
  };
  let historial: { registrarCambios: jest.Mock; registrarCreacion: jest.Mock };
  let observaciones: { createObservacion: jest.Mock };

  const id = '11111111-1111-1111-1111-111111111111';
  const userId = '22222222-2222-2222-2222-222222222222';

  beforeEach(async () => {
    manager = {
      findOneBy: jest.fn(),
      save: jest.fn((_entidad: unknown, entidad: unknown) =>
        Promise.resolve(entidad),
      ),
    };
    clientRepo = {
      create: jest.fn((datos: object) => ({ ...datos })),
      merge: jest.fn(
        (destino: object, ...origen: object[]) =>
          Object.assign(destino, ...origen) as object,
      ),
      manager: {
        transaction: jest.fn((cb: (m: unknown) => Promise<unknown>) =>
          cb(manager),
        ),
      },
    };
    historial = {
      registrarCambios: jest.fn().mockResolvedValue(0),
      registrarCreacion: jest.fn().mockResolvedValue(undefined),
    };
    observaciones = { createObservacion: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        { provide: getRepositoryToken(Client), useValue: clientRepo },
        {
          provide: getRepositoryToken(MaintenanceTemporality),
          useValue: { findOneBy: jest.fn(), find: jest.fn() },
        },
        { provide: ObservacionesService, useValue: observaciones },
        { provide: ClientHistoryService, useValue: historial },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
  });

  it('update registra solo los campos que cambiaron, con origen ficha y el userId', async () => {
    manager.findOneBy
      .mockResolvedValueOnce({ id, direccion: 'A', valor_mantencion: 23500 })
      .mockResolvedValueOnce({ id, direccion: 'B', valor_mantencion: 23500 });

    const resultado = await service.update(
      id,
      { direccion: 'B', valor_mantencion: 23500 } as never,
      userId,
    );

    expect(historial.registrarCambios).toHaveBeenCalledWith(
      manager,
      id,
      [{ campo: 'direccion', valorAnterior: 'A', valorNuevo: 'B' }],
      'ficha',
      userId,
    );
    expect(resultado).toMatchObject({ id, direccion: 'B' });
  });

  it('updateCampo con observacion no registra historial', async () => {
    manager.findOneBy.mockResolvedValue({ id, direccion: 'A' });

    await service.updateCampo(
      id,
      [{ campo: 'observacion', valor: 'texto' }] as never,
      userId,
    );

    expect(observaciones.createObservacion).toHaveBeenCalledTimes(1);
    // La observacion no es un campo auditado: el diff sale vacio.
    expect(historial.registrarCambios).toHaveBeenCalledWith(
      manager,
      id,
      [],
      'ficha',
      userId,
    );
  });

  it('updateCampo aplica todos los campos en una sola transaccion', async () => {
    manager.findOneBy
      .mockResolvedValueOnce({ id, direccion: 'A', ruta: 'R1' })
      .mockResolvedValueOnce({ id, direccion: 'B', ruta: 'R2' });

    const resultado = await service.updateCampo(
      id,
      [
        { campo: 'direccion', valor: 'B' },
        { campo: 'ruta', valor: 'R2' },
      ] as never,
      userId,
    );

    expect(clientRepo.manager.transaction).toHaveBeenCalledTimes(1);
    expect(resultado).toEqual({ camposActualizados: 2 });
    expect(historial.registrarCambios).toHaveBeenCalledTimes(1);
    const llamada = historial.registrarCambios.mock.calls[0] as unknown[];
    const cambios = llamada[2] as Array<{
      campo: string;
    }>;
    expect(cambios.map((c) => c.campo)).toEqual(['direccion', 'ruta']);
  });

  it('createClient registra la creacion con el userId', async () => {
    manager.save.mockImplementation((_entidad: unknown, entidad: object) =>
      Promise.resolve({ ...entidad, id }),
    );

    const creado = await service.createClient(
      { nombre: 'Cliente', observacion: 'nota' } as never,
      userId,
    );

    expect(creado.id).toBe(id);
    expect(historial.registrarCreacion).toHaveBeenCalledWith(
      manager,
      id,
      userId,
    );
    expect(observaciones.createObservacion).toHaveBeenCalledWith(
      expect.objectContaining({ registro_id: id, detalle: 'nota' }),
    );
  });
});
