import { Test, TestingModule } from '@nestjs/testing';
import { RepairsService } from './repairs.service';

describe('RepairsService', () => {
  let service: RepairsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RepairsService],
    }).compile();

    service = module.get<RepairsService>(RepairsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
