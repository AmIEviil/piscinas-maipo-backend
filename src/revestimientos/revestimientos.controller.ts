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

@Controller('revestimiento')
@UseGuards(JwtAuthGuard)
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

  @Post()
  createRevestimiento(@Body() data: Partial<IRevestimientoCreate>) {
    return this.revestimientosService.createRevestimiento(data);
  }

  @Put(':id')
  updateRevestimiento(
    @Param('id') id: string,
    @Body() data: Partial<IRevestimientoCreate>,
  ) {
    return this.revestimientosService.updateRevestimiento(id, data);
  }

  @Delete(':id')
  deleteRevestimiento(@Param('id') id: string) {
    return this.revestimientosService.deleteRevestimiento(id);
  }
}
