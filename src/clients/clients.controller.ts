import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/clients.entity';
import { CreateClientDto } from './dto/CreateClient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateCampoDto } from './dto/Campos.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientService: ClientsService) {}

  @Get()
  findAll(): Promise<Client[]> {
    return this.clientService.findAll();
  }

  @Get('filter')
  getClients(
    @Query('nombre') nombre?: string,
    @Query('direccion') direccion?: string,
    @Query('comuna') comuna?: string,
    @Query('dia') dia?: string,
    @Query('ruta') ruta?: string,
    @Query('isActive') isActive?: boolean,
    @Query('orderBy') orderBy?: string,
    @Query('orderDirection') orderDirection?: 'ASC' | 'DESC',
  ) {
    return this.clientService.findByFilters({
      nombre,
      direccion,
      comuna,
      dia,
      ruta,
      isActive,
      orderBy,
      orderDirection,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): any {
    return this.clientService.findOne(id);
  }

  @Post('create')
  create(@Body() client: CreateClientDto): Promise<Client> {
    return this.clientService.createClient(client);
  }

  @Put('update/:id')
  update(
    @Param('id') id: string,
    @Body() client: Partial<Client>,
  ): Promise<Client> {
    return this.clientService.update(id, client);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string): Promise<void> {
    return this.clientService.remove(id);
  }

  @Put('update-campos/:id')
  updateCampo(@Param('id') id: string, @Body() dto: UpdateCampoDto[]) {
    return this.clientService.updateCampo(id, dto);
  }
}
