import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/clients.entity';

@Controller('clients')
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
  ) {
    return this.clientService.findByFilters({
      nombre,
      direccion,
      comuna,
      dia,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Client> {
    return this.clientService.findOne(+id);
  }

  @Post('create')
  create(@Body() client: Partial<Client>): Promise<Client> {
    return this.clientService.createClient(client);
  }

  @Put('update/:id')
  update(
    @Param('id') id: string,
    @Body() client: Partial<Client>,
  ): Promise<Client> {
    return this.clientService.update(+id, client);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string): Promise<void> {
    return this.clientService.remove(+id);
  }
}
