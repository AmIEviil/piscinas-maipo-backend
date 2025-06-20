import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
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

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Client> {
    return this.clientService.findOne(+id);
  }

  @Post()
  create(@Body() client: Partial<Client>): Promise<Client> {
    return this.clientService.createClient(client);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() client: Partial<Client>,
  ): Promise<Client> {
    return this.clientService.update(+id, client);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.clientService.remove(+id);
  }
}
