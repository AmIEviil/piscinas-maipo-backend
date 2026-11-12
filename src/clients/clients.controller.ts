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
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/clients.entity';
import { CreateClientDto } from './dto/CreateClient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateCampoDto } from './dto/Campos.dto';
import { UpdateClientDto } from './dto/UpdateClient.dto';
import { BulkUpdateClientsDto } from './dto/BulkUpdateClients.dto';
import { BulkValorMantencionDto } from './dto/BulkValorMantencion.dto';
import { ClientHistoryService } from './history/client-history.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/roles/roles.constants';
import type { AuthenticatedRequest } from '../types/authenticated-request';

@Controller('clients')
@Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(
    private readonly clientService: ClientsService,
    private readonly historyService: ClientHistoryService,
  ) {}

  @Get()
  findAll(): Promise<Client[]> {
    return this.clientService.findAll();
  }

  @Get('filter')
  getClients(
    @Query('nombre') nombre?: string,
    @Query('direccion') direccion?: string,
    @Query('telefono') telefono?: string,
    @Query('comuna') comuna?: string,
    @Query('dia') dia?: string,
    @Query('ruta') ruta?: string,
    @Query('frecuencia') frecuencia?: string,
    @Query('isActive') isActive?: boolean,
    @Query('orderBy') orderBy?: string,
    @Query('orderDirection') orderDirection?: 'ASC' | 'DESC',
  ) {
    return this.clientService.findByFilters({
      nombre,
      direccion,
      telefono,
      comuna,
      dia,
      ruta,
      frecuencia,
      isActive,
      orderBy,
      orderDirection,
    });
  }

  /**
   * Periodicidades disponibles.
   *
   * Declarada antes de `@Get(':id')` a proposito: Nest resuelve las rutas en
   * orden de declaracion, y puesta despues, `:id` se tragaria "frecuencias"
   * como si fuera un uuid.
   */
  @Get('frecuencias')
  findFrecuencias() {
    return this.clientService.findFrecuencias();
  }

  /**
   * Historial de cambios de un cliente. Declarada antes de `:id` por
   * costumbre del archivo, aunque no compiten: tiene un segmento extra.
   */
  @Get(':id/historial')
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  findHistorial(@Param('id', ParseUUIDPipe) id: string) {
    return this.historyService.findByClient(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): any {
    return this.clientService.findOne(id);
  }

  @Post('create')
  create(
    @Body() client: CreateClientDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Client> {
    const userId = req.user?.id ?? 'Unknown';
    return this.clientService.createClient(client, userId);
  }

  @Put('update/:id')
  update(
    @Param('id') id: string,
    @Body() client: UpdateClientDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Client> {
    const userId = req.user?.id ?? 'Unknown';
    return this.clientService.update(id, client, userId);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string): Promise<void> {
    return this.clientService.remove(id);
  }

  /**
   * Cambio masivo de dia, ruta o periodicidad para varios clientes.
   *
   * Va antes de las rutas con parametro por costumbre del archivo, aunque en
   * este caso no compiten: 'bulk-update' es un segmento fijo y no lo captura
   * ningun ':id'.
   */
  @Put('bulk-update')
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  bulkUpdate(
    @Body() dto: BulkUpdateClientsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id ?? 'Unknown';
    return this.clientService.bulkUpdate(dto, userId);
  }

  /** Cambio masivo del valor de mantencion, un valor por cliente. */
  @Put('bulk-valor-mantencion')
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  bulkValorMantencion(
    @Body() dto: BulkValorMantencionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id ?? 'Unknown';
    return this.clientService.bulkUpdateValorMantencion(dto, userId);
  }

  @Put('update-campos/:id')
  updateCampo(
    @Param('id') id: string,
    @Body() dto: UpdateCampoDto[],
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id ?? 'Unknown';
    return this.clientService.updateCampo(id, dto, userId);
  }
}
