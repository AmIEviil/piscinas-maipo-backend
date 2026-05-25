import { Test, TestingModule } from '@nestjs/testing';
import { RepairsController } from './repairs.controller';
import { RepairsService } from './repairs.service';

const mockRepairsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByClientId: jest.fn(),
};

describe('RepairsController', () => {
  let controller: RepairsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepairsController],
      providers: [
        {
          provide: RepairsService,
          useValue: mockRepairsService,
        },
      ],
    }).compile();

    controller = module.get<RepairsController>(RepairsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
