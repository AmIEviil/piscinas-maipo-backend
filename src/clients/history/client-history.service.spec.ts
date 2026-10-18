import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClientHistoryService } from './client-history.service';
import { ClientHistory } from '../entities/client-history.entity';
import { Client } from '../entities/clients.entity';
import type { EntityManager } from 'typeorm';

const CLIENT_ID = '11111111-1111-1111-1111-111111111111';
const USER_ID = '22222222-2222-2222-2222-222222222222';

describe('ClientHistoryService', () => {
  let service: ClientHistoryService;
  let historyRepo: { find: jest.Mock };
  let clientRepo: { existsBy: jest.Mock };
  let manager: { create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    historyRepo = { find: jest.fn().mockResolvedValue([]) };
    clientRepo = { existsBy: jest.fn().mockResolvedValue(true) };
    manager = {
      create: jest.fn((_entidad: unknown, datos: object) => ({ ...datos })),
      save: jest.fn((_entidad: unknown, filas: unknown) =>
        Promise.resolve(filas),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientHistoryService,
        { provide: getRepositoryToken(ClientHistory), useValue: historyRepo },
        { provide: getRepositoryToken(Client), useValue: clientRepo },
      ],
    }).compile();

    service = module.get(ClientHistoryService);
  });

  const comoManager = () => manager as unknown as EntityManager;

  it('registrarCambios guarda una fila por cambio con usuario null si no es uuid', async () => {
    const total = await service.registrarCambios(
      comoManager(),
      CLIENT_ID,
      [
        { campo: 'direccion', valorAnterior: 'A', valorNuevo: 'B' },
        { campo: 'ruta', valorAnterior: null, valorNuevo: 'R1' },
      ],
      'ficha',
      'Unknown',
    );

    expect(total).toBe(2);
    expect(manager.save).toHaveBeenCalledTimes(1);
    const llamada = manager.save.mock.calls[0] as unknown[];
    const filas = llamada[1] as Array<Record<string, unknown>>;
    expect(filas).toHaveLength(2);
    for (const fila of filas) {
      expect(fila.usuarioId).toBeNull();
      expect(fila.accion).toBe('modificado');
      expect(fila.origen).toBe('ficha');
      expect(fila.clientId).toBe(CLIENT_ID);
    }
    expect(filas[0]).toMatchObject({
      campo: 'direccion',
      valorAnterior: 'A',
      valorNuevo: 'B',
    });
  });

  it('registrarCambios no escribe si no hay cambios', async () => {
    const total = await service.registrarCambios(
      comoManager(),
      CLIENT_ID,
      [],
      'ficha',
      USER_ID,
    );

    expect(total).toBe(0);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('registrarCreacion guarda accion creado / origen creacion', async () => {
    await service.registrarCreacion(comoManager(), CLIENT_ID, USER_ID);

    expect(manager.save).toHaveBeenCalledTimes(1);
    const llamada = manager.save.mock.calls[0] as unknown[];
    const fila = llamada[1] as Record<string, unknown>;
    expect(fila).toMatchObject({
      clientId: CLIENT_ID,
      accion: 'creado',
      origen: 'creacion',
      campo: null,
      valorAnterior: null,
      valorNuevo: null,
      usuarioId: USER_ID,
    });
  });

  it('findByClient lanza 404 si el cliente no existe', async () => {
    clientRepo.existsBy.mockResolvedValue(false);

    await expect(service.findByClient(CLIENT_ID)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(historyRepo.find).not.toHaveBeenCalled();
  });

  it('findByClient arma usuario como "Nombre Apellido" y null sin usuario', async () => {
    const fecha = new Date('2026-03-05T12:00:00Z');
    historyRepo.find.mockResolvedValue([
      {
        id: 'h1',
        accion: 'modificado',
        campo: 'ruta',
        valorAnterior: 'A',
        valorNuevo: 'B',
        origen: 'ficha',
        usuario: { first_name: 'Ana', last_name: 'Perez' },
        fecha,
      },
      {
        id: 'h2',
        accion: 'creado',
        campo: null,
        valorAnterior: null,
        valorNuevo: null,
        origen: 'creacion',
        usuario: null,
        fecha,
      },
    ]);

    const resultado = await service.findByClient(CLIENT_ID);

    expect(historyRepo.find).toHaveBeenCalledWith({
      where: { clientId: CLIENT_ID },
      relations: { usuario: true },
      order: { fecha: 'DESC' },
    });
    expect(resultado[0].usuario).toBe('Ana Perez');
    expect(resultado[1].usuario).toBeNull();
    expect(resultado[0].fecha).toBe(fecha.toISOString());
  });
});
