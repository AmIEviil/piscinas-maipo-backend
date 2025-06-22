import { Test, TestingModule } from '@nestjs/testing';
import { RevestimientosService } from './revestimientos.service';

describe('RevestimientosService', () => {
  let service: RevestimientosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RevestimientosService],
    }).compile();

    service = module.get<RevestimientosService>(RevestimientosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
