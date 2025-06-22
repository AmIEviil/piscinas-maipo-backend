import { Test, TestingModule } from '@nestjs/testing';
import { RevestimientosController } from './revestimientos.controller';

describe('RevestimientosController', () => {
  let controller: RevestimientosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RevestimientosController],
    }).compile();

    controller = module.get<RevestimientosController>(RevestimientosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
