import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { Maintenance } from './entities/maintenance.entity';
import {
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
} from './dto/CreateMaintenanceDto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES, ROLE_GROUPS } from '../auth/constants/roles';

@Controller('maintenances')
@UseGuards(JwtAuthGuard)
// Lectura: personal de operaciones. Los @Roles de cada metodo restringen
// ademas la escritura. RolesGuard deniega por defecto, asi que sin este
// decorador el controlador completo queda cerrado.
@Roles(...ROLE_GROUPS.STAFF)
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

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Post()
  create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenanceService.createMaintenance(dto);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Put(':id')
  update(@Param('id') id: string, @Body() maintenance: UpdateMaintenanceDto) {
    return this.maintenanceService.update(id, maintenance);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.maintenanceService.remove(id);
  }

  @Get('client/:id')
  findByClientId(@Param('id') id: string) {
    return this.maintenanceService.findGroupedByMonth(id);
  }
}
