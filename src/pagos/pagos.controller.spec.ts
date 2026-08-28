import { Test, TestingModule } from '@nestjs/testing';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { CreateComprobantePagoDto } from './dto/comprobante-pago.dto';

const mockPagosService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  createComprobantePago: jest.fn(),
  findByParentId: jest.fn(),
  deleteComprobantePago: jest.fn(),
};

describe('PagosController', () => {
  let controller: PagosController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PagosController],
      providers: [
        {
          provide: PagosService,
          useValue: mockPagosService,
        },
      ],
    }).compile();

    controller = module.get<PagosController>(PagosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createComprobantePago', () => {
    const dtoBase = {
      tipo: 'comprobante_mantencion',
      nombre: 'Pago agosto',
      fecha_emision: '2026-08-12',
      monto: 90000,
      parentId: 'cliente-1',
    };

    it('conserva los ids cuando FormData envia varias visitas como arreglo', async () => {
      mockPagosService.createComprobantePago.mockResolvedValue({});

      const dto: CreateComprobantePagoDto = {
        ...dtoBase,
        mantencionIds: ['m1', 'm2'],
      };

      await controller.createComprobantePago(dto, undefined);

      expect(mockPagosService.createComprobantePago).toHaveBeenCalledWith(
        expect.objectContaining({ mantencionIds: ['m1', 'm2'] }),
        undefined,
      );
    });

    it('envuelve en un arreglo cuando FormData envia una sola visita como string suelto', async () => {
      mockPagosService.createComprobantePago.mockResolvedValue({});

      // FormData entrega un campo repetido como string suelto cuando solo
      // hay un valor: el DTO lo tipa como string[], pero en runtime llega
      // como string a secas.
      const dto = {
        ...dtoBase,
        mantencionIds: 'm1' as unknown as string[],
      } as CreateComprobantePagoDto;

      await controller.createComprobantePago(dto, undefined);

      expect(mockPagosService.createComprobantePago).toHaveBeenCalledWith(
        expect.objectContaining({ mantencionIds: ['m1'] }),
        undefined,
      );
    });

    it('normaliza a arreglo vacio cuando no llega mantencionIds', async () => {
      mockPagosService.createComprobantePago.mockResolvedValue({});

      const dto: CreateComprobantePagoDto = { ...dtoBase };

      await controller.createComprobantePago(dto, undefined);

      expect(mockPagosService.createComprobantePago).toHaveBeenCalledWith(
        expect.objectContaining({ mantencionIds: [] }),
        undefined,
      );
    });
  });
});
