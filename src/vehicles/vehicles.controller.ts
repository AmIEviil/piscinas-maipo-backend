import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';
import { FilterVehiclesDto } from './dto/filterVehicles.dto';
import { UploadedFiles } from '../uploaded-files/entities/uploaded-files.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES, ROLE_GROUPS } from '../auth/constants/roles';

@Controller('vehicles')
@Roles(...ROLE_GROUPS.MANAGEMENT)
export class VehiclesController {
  private readonly logger = new Logger(VehiclesController.name);

  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  findAll(@Query() filters?: FilterVehiclesDto): Promise<Vehicle[]> {
    this.logger.log('Obteniendo todos los vehículos');
    return this.vehiclesService.findAll(filters);
  }

  @Get(':placa')
  findOne(@Param('placa') placa: string): Promise<{
    vehicle: Vehicle | null;
    files: UploadedFiles[];
  }> {
    this.logger.log(`Obteniendo vehículo con placa: ${placa}`);
    return this.vehiclesService.findOne(placa);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Post()
  create(@Body() vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    this.logger.log('Creando nuevo vehículo');
    return this.vehiclesService.create(vehicleData);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Post(':placa')
  update(
    @Param('placa') placa: string,
    @Body() vehicleData: Partial<Vehicle>,
  ): Promise<Vehicle> {
    this.logger.log(`Actualizando vehículo con placa: ${placa}`);
    return this.vehiclesService.update(placa, vehicleData);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Delete(':placa')
  remove(@Param('placa') placa: string): Promise<void> {
    this.logger.log(`Eliminando vehículo con placa: ${placa}`);
    return this.vehiclesService.remove(placa);
  }
}
