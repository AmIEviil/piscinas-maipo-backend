import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RevestimientosService } from './revestimientos.service';
import { Revestimiento } from './entities/revestimiento.entity';
import { ExtraRevestimiento } from './entities/extra-revestimiento.entity';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

describe('RevestimientosService', () => {
  let service: RevestimientosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevestimientosService,
        {
          provide: getRepositoryToken(Revestimiento),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ExtraRevestimiento),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RevestimientosService>(RevestimientosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateRevestimiento', () => {
    const existente = () =>
      ({ id: 'r1', estado: 'Pendiente', client: { id: 'c1' } }) as never;

    const armar = (encontrado: unknown) => {
      const repo = {
        findOneBy: jest.fn().mockResolvedValue(encontrado),
        merge: jest.fn((destino: object, origen: object) =>
          Object.assign(destino, origen),
        ),
        save: jest.fn((entidad: unknown) => Promise.resolve(entidad)),
      };
      const extraRepo = {
        delete: jest.fn().mockResolvedValue({ affected: 2 }),
        create: jest.fn((datos: unknown) => datos),
      };
      const manager = {
        getRepository: jest.fn((entidad: unknown) =>
          entidad === ExtraRevestimiento ? extraRepo : repo,
        ),
      };
      const principal = module.get<{ manager: unknown }>(
        getRepositoryToken(Revestimiento),
      );
      principal.manager = {
        transaction: jest.fn((fn: (m: unknown) => unknown) => fn(manager)),
      };
      return { repo, extraRepo };
    };

    let module: TestingModule;

    beforeEach(async () => {
      module = await Test.createTestingModule({
        providers: [
          RevestimientosService,
          {
            provide: getRepositoryToken(Revestimiento),
            useFactory: mockRepository,
          },
          {
            provide: getRepositoryToken(ExtraRevestimiento),
            useFactory: mockRepository,
          },
        ],
      }).compile();
      service = module.get<RevestimientosService>(RevestimientosService);
    });

    it('traduce clienteId a la relacion client', async () => {
      armar(existente());
      const res = await service.updateRevestimiento('r1', {
        clienteId: 'c2',
        estado: 'Aprobado',
      });
      expect(res.client).toEqual({ id: 'c2' });
      expect(res.estado).toBe('Aprobado');
      expect(res).not.toHaveProperty('clienteId');
    });

    it('reemplaza los extras cuando vienen en el cuerpo', async () => {
      const { extraRepo } = armar(existente());
      const res = await service.updateRevestimiento('r1', {
        extras: [{ nombre: 'Foco', valor: 1000, detalle: 'LED' }],
      });
      expect(extraRepo.delete).toHaveBeenCalledWith({
        revestimiento: { id: 'r1' },
      });
      expect(res.extras).toEqual([
        { nombre: 'Foco', valor: 1000, detalle: 'LED' },
      ]);
    });

    it('no toca los extras ni las imagenes si no vienen extras', async () => {
      const { extraRepo } = armar(existente());
      const res = await service.updateRevestimiento('r1', {
        imagenes: [{ url: 'u', public_id: 'p' }],
      });
      expect(extraRepo.delete).not.toHaveBeenCalled();
      expect(res).not.toHaveProperty('imagenes');
    });

    it('lanza NotFound si no existe', async () => {
      armar(null);
      await expect(
        service.updateRevestimiento('nope', { estado: 'x' }),
      ).rejects.toThrow('no existe');
    });
  });
});
