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
import { RevestimientosService } from './revestimientos.service';
import { FilterRevestimientosDto } from './dto/FilterRevestimientos.dto';
import { IRevestimientoCreate } from './dto/CreateRevestimiento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES, ROLE_GROUPS } from '../auth/constants/roles';

@Controller('revestimiento')
@UseGuards(JwtAuthGuard)
@Roles(...ROLE_GROUPS.STAFF)
export class RevestimientosController {
  constructor(private readonly revestimientosService: RevestimientosService) {}

  @Get()
  findAllRevestimientos(@Query() filters: FilterRevestimientosDto) {
    return this.revestimientosService.findByFilter(filters);
  }

  @Get(':id')
  findOneRevestimiento(@Param('id') id: string) {
    return this.revestimientosService.findOne(id);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Post()
  createRevestimiento(@Body() data: Partial<IRevestimientoCreate>) {
    return this.revestimientosService.createRevestimiento(data);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Put(':id')
  updateRevestimiento(
    @Param('id') id: string,
    @Body() data: Partial<IRevestimientoCreate>,
  ) {
    return this.revestimientosService.updateRevestimiento(id, data);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC)
  @Delete(':id')
  deleteRevestimiento(@Param('id') id: string) {
    return this.revestimientosService.deleteRevestimiento(id);
  }
}
