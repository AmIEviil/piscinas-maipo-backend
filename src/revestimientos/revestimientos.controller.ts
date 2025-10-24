import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RevestimientosService } from './revestimientos.service';
import { FilterRevestimientosDto } from './dto/FilterRevestimientos.dto';
import { IRevestimientoCreate } from './dto/CreateRevestimiento.dto';

@Controller('revestimiento')
export class RevestimientosController {
  constructor(private readonly revestimientosService: RevestimientosService) {}

  @Get()
  findAllRevestimientos(@Query() filters: FilterRevestimientosDto) {
    return this.revestimientosService.findByFilter(filters);
  }

  @Get(':id')
  findOneRevestimiento(@Param('id') id: number) {
    return this.revestimientosService.findOne(id);
  }

  @Post()
  createRevestimiento(@Body() data: Partial<IRevestimientoCreate>) {
    return this.revestimientosService.createRevestimiento(data);
  }

  @Put(':id')
  updateRevestimiento(
    @Param('id') id: number,
    @Body() data: Partial<IRevestimientoCreate>,
  ) {
    return this.revestimientosService.updateRevestimiento(id, data);
  }

  @Delete(':id')
  deleteRevestimiento(@Param('id') id: number) {
    return this.revestimientosService.deleteRevestimiento(id);
  }
}
