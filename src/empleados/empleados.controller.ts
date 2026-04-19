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
import { EmpleadosService } from './empleados.service';
import { FiltersEmployeesDto } from './dto/FiltersEmployees.dto';
import { Employee } from './entities/empleado.entity';

@Controller('empleados')
export class EmpleadosController {
  private readonly logger = new Logger(EmpleadosController.name);

  constructor(private readonly empleadosService: EmpleadosService) {}

  @Get()
  findAll(@Query() filters?: FiltersEmployeesDto): Promise<Employee[]> {
    return this.empleadosService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`Obteniendo empleado con id: ${id}`);
    return this.empleadosService.findOne(id);
  }

  @Post()
  create(@Body() empleadoData: Partial<Employee>): Promise<Employee> {
    return this.empleadosService.createEmployee(empleadoData);
  }

  @Post(':id')
  update(@Param('id') id: string, @Body() empleadoData: Employee) {
    this.logger.log(`Actualizando empleado con id: ${id}`);
    return this.empleadosService.update(id, empleadoData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.empleadosService.remove(id);
  }
}
