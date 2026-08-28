import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PagosService } from './pagos.service';
import { ComprobantePago } from './entities/comprobante-pago.entity';
import { Maintenance } from '../maintenance/entities/maintenance.entity';
import { GoogleDriveService } from '../google-drive/google-drive.service';
import { UploadedFilesService } from '../uploaded-files/uploaded-files.service';

/** Gestor de entidades falso que registra lo que se le pidio guardar. */
const crearManagerFalso = () => {
  const guardado: unknown[] = [];
  const manager = {
    guardado,
    findBy: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn((entidad: unknown) => {
      guardado.push(entidad);
      return Promise.resolve(entidad);
    }),
    create: jest.fn((_entidad: unknown, datos: unknown) => datos),
    remove: jest.fn(),
  };
  return manager;
};

const mockComprobanteRepo = (
  manager: ReturnType<typeof crearManagerFalso>,
) => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn((datos: unknown) => datos),
  save: jest.fn((datos: unknown) => Promise.resolve(datos)),
  delete: jest.fn(),
  manager: {
    transaction: jest.fn((cb: (m: unknown) => Promise<unknown>) => cb(manager)),
  },
});

describe('PagosService', () => {
  let service: PagosService;
  let manager: ReturnType<typeof crearManagerFalso>;
  let comprobanteRepo: ReturnType<typeof mockComprobanteRepo>;

  beforeEach(async () => {
    manager = crearManagerFalso();
    comprobanteRepo = mockComprobanteRepo(manager);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: getRepositoryToken(ComprobantePago),
          useValue: comprobanteRepo,
        },
        {
          provide: getRepositoryToken(Maintenance),
          useValue: { findBy: jest.fn() },
        },
        {
          provide: GoogleDriveService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            generateViewLink: jest.fn(),
          },
        },
        {
          provide: UploadedFilesService,
          useValue: { findByDriveId: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
  });

  describe('createComprobantePago', () => {
    it('marca como pagadas las mantenciones que cubre el pago', async () => {
      const mantenciones = [
        { id: 'm1', recibioPago: false },
        { id: 'm2', recibioPago: false },
      ];
      manager.findBy.mockResolvedValue(mantenciones);

      await service.createComprobantePago({
        tipo: 'comprobante_mantencion',
        nombre: 'Pago agosto',
        fecha_emision: '2026-08-12',
        monto: 90000,
        parentId: 'cliente-1',
        mantencionIds: ['m1', 'm2'],
      });

      expect(mantenciones[0].recibioPago).toBe(true);
      expect(mantenciones[1].recibioPago).toBe(true);
      expect(manager.save).toHaveBeenCalledWith(mantenciones);

      // El comprobante en si tambien debe crearse y guardarse a traves del
      // manager transaccional -- no del repositorio no-transaccional -- para
      // que quede atado a la misma transaccion que marco las visitas.
      expect(manager.create).toHaveBeenCalledWith(
        ComprobantePago,
        expect.objectContaining({ mantenciones }),
      );
      expect(manager.save).toHaveBeenCalledWith(
        expect.objectContaining({ mantenciones }),
      );
      expect(comprobanteRepo.save).not.toHaveBeenCalled();
    });

    it('no toca ninguna mantencion cuando el pago no cubre visitas', async () => {
      await service.createComprobantePago({
        tipo: 'comprobante_mantencion',
        nombre: 'Pago suelto',
        fecha_emision: '2026-08-12',
        monto: 10000,
        parentId: 'cliente-1',
      });

      expect(manager.findBy).not.toHaveBeenCalled();

      // Aunque no haya visitas que cubrir, el comprobante se sigue creando
      // dentro de la transaccion, no via el repositorio no-transaccional.
      expect(manager.create).toHaveBeenCalledWith(
        ComprobantePago,
        expect.objectContaining({ mantenciones: [] }),
      );
      expect(comprobanteRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteComprobantePago', () => {
    it('devuelve a no pagadas las visitas que cubria el comprobante', async () => {
      const mantenciones = [
        { id: 'm1', recibioPago: true },
        { id: 'm2', recibioPago: true },
      ];
      manager.findOne.mockResolvedValue({
        id: 'c1',
        fileId: 'drive-1',
        mantenciones,
      });
      // Tambien se stubea el repositorio no-transaccional con el mismo
      // comprobante: asi, si la implementacion regresara a usar
      // findOneBy en vez del manager, el codigo bajo prueba llegaria
      // hasta el final en lugar de cortar antes en el throw de "not
      // found", y la aserciones de mas abajo serian las que fallen.
      comprobanteRepo.findOneBy.mockResolvedValue({
        id: 'c1',
        fileId: 'drive-1',
        mantenciones,
      });

      await service.deleteComprobantePago('c1');

      expect(mantenciones[0].recibioPago).toBe(false);
      expect(mantenciones[1].recibioPago).toBe(false);
      expect(manager.save).toHaveBeenCalledWith(mantenciones);
      expect(manager.remove).toHaveBeenCalled();
    });

    it('no toca ninguna mantencion cuando el comprobante no cubria visitas', async () => {
      manager.findOne.mockResolvedValue({
        id: 'c1',
        fileId: 'drive-1',
        mantenciones: [],
      });

      await service.deleteComprobantePago('c1');

      expect(manager.save).not.toHaveBeenCalled();
      expect(manager.remove).toHaveBeenCalled();
    });

    it('lanza un error y no toca nada si el comprobante no existe', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(service.deleteComprobantePago('c-inexistente')).rejects.toThrow(
        'ComprobantePago with id c-inexistente not found',
      );

      expect(manager.save).not.toHaveBeenCalled();
      expect(manager.remove).not.toHaveBeenCalled();
    });
  });

  describe('findByParentId', () => {
    it('agrupa por mes e incluye las visitas que cubre cada pago', async () => {
      comprobanteRepo.find.mockResolvedValue([
        {
          id: 'c1',
          tipo: 'comprobante_mantencion',
          nombre: 'Pago agosto',
          fecha_emision: '2026-08-12',
          monto: 90000,
          parentId: 'cliente-1',
          fileId: 'drive-1',
          mantenciones: [
            { id: 'm1', fechaMantencion: '2026-08-05' },
            { id: 'm2', fechaMantencion: '2026-08-12' },
          ],
        },
      ]);

      const resultado = await service.findByParentId('cliente-1');

      expect(Object.keys(resultado)).toEqual(['2026-08']);
      expect(resultado['2026-08'][0].mantenciones).toEqual([
        { id: 'm1', fechaMantencion: '2026-08-05' },
        { id: 'm2', fechaMantencion: '2026-08-12' },
      ]);
      expect(resultado['2026-08'][0].monto).toBe(90000);

      // El mock de find() devuelve mockResolvedValue sin importar los
      // argumentos, asi que si no se pide explicitamente la relacion aqui,
      // una regresion que la borre del `find()` real seguiria pasando el
      // test sin que nada lo note.
      expect(comprobanteRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ relations: { mantenciones: true } }),
      );
    });
  });
});
