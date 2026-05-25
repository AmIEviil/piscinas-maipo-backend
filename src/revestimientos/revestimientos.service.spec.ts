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
});
