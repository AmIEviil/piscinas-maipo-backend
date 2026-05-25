import { Test, TestingModule } from '@nestjs/testing';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';

const mockMaintenanceService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  createMaintenance: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findByClientId: jest.fn(),
  findGroupedByMonth: jest.fn(),
};

describe('MaintenanceController', () => {
  let controller: MaintenanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaintenanceController],
      providers: [
        {
          provide: MaintenanceService,
          useValue: mockMaintenanceService,
        },
      ],
    }).compile();

    controller = module.get<MaintenanceController>(MaintenanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
