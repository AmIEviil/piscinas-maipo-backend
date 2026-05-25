import { Test, TestingModule } from '@nestjs/testing';
import { RevestimientosController } from './revestimientos.controller';
import { RevestimientosService } from './revestimientos.service';

const mockRevestimientosService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByClientId: jest.fn(),
};

describe('RevestimientosController', () => {
  let controller: RevestimientosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RevestimientosController],
      providers: [
        {
          provide: RevestimientosService,
          useValue: mockRevestimientosService,
        },
      ],
    }).compile();

    controller = module.get<RevestimientosController>(RevestimientosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
