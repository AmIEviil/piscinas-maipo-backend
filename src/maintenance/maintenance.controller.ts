import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { Maintenance } from './entities/maintenance.entity';
import { CreateMaintenanceDto } from './dto/CreateMaintenanceDto';

@Controller('maintenances')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  finAll(): Promise<Maintenance[]> {
    return this.maintenanceService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Maintenance> {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenanceService.createMaintenance(dto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() maintenance: Partial<Maintenance>,
  ): Promise<Maintenance> {
    return this.maintenanceService.update(id, maintenance);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.maintenanceService.remove(id);
  }

  @Get('client/:id')
  findByClientId(@Param('id') id: string) {
    return this.maintenanceService.findByClientId(id);
  }
}
