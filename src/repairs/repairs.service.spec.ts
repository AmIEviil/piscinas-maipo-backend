import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RepairsService } from './repairs.service';
import { Repair } from './entities/repair.entity';

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
});

describe('RepairsService', () => {
  let service: RepairsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairsService,
        { provide: getRepositoryToken(Repair), useFactory: mockRepository },
      ],
    }).compile();

    service = module.get<RepairsService>(RepairsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
