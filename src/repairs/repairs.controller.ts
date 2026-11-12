import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RepairsService } from './repairs.service';
import { CreateRepairDto, FilterRepairDto } from './dto/FilterRepair.dto';
import { Repair } from './entities/repair.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/roles/roles.constants';

@Controller('repairs')
@Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
@UseGuards(JwtAuthGuard)
export class RepairsController {
  constructor(private readonly repairsService: RepairsService) {}

  // Tecnico ve las reparaciones desde el modal del cliente (solo lectura)
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
  @Get()
  async findAllRepairs(@Query() filters: FilterRepairDto) {
    return this.repairsService.findAllRepairs(filters);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
  @Get(':id')
  async findOneRepair(@Param('id') id: string) {
    return this.repairsService.findOne(id);
  }

  @Post()
  async createRepair(@Body() data: CreateRepairDto) {
    return this.repairsService.createRepair(data);
  }

  @Put(':id')
  async updateRepair(@Param('id') id: string, @Body() data: Partial<Repair>) {
    return this.repairsService.updateRepair(id, data);
  }

  @Delete(':id')
  async deleteRepair(@Param('id') id: string) {
    return this.repairsService.deleteRepair(id);
  }
}
