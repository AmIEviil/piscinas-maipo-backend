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
import { ROLES, ROLE_GROUPS } from '../auth/constants/roles';

@Controller('repairs')
@UseGuards(JwtAuthGuard)
@Roles(...ROLE_GROUPS.STAFF)
export class RepairsController {
  constructor(private readonly repairsService: RepairsService) {}

  @Get()
  async findAllRepairs(@Query() filters: FilterRepairDto) {
    return this.repairsService.findAllRepairs(filters);
  }

  @Get(':id')
  async findOneRepair(@Param('id') id: string) {
    return this.repairsService.findOne(id);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Post()
  async createRepair(@Body() data: CreateRepairDto) {
    return this.repairsService.createRepair(data);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Put(':id')
  async updateRepair(@Param('id') id: string, @Body() data: Partial<Repair>) {
    return this.repairsService.updateRepair(id, data);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Delete(':id')
  async deleteRepair(@Param('id') id: string) {
    return this.repairsService.deleteRepair(id);
  }
}
