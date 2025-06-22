import { Test, TestingModule } from '@nestjs/testing';
import { RepairsController } from './repairs.controller';

describe('RepairsController', () => {
  let controller: RepairsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepairsController],
    }).compile();

    controller = module.get<RepairsController>(RepairsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
