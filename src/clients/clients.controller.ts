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
  ParseArrayPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { ClientsService } from './clients.service';
import { Client } from './entities/clients.entity';
import { CreateClientDto } from './dto/CreateClient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateCampoDto } from './dto/Campos.dto';
import { UpdateClientDto } from './dto/UpdateClient.dto';
import { FilterClientsDto } from './dto/FilterClients.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES, ROLE_GROUPS } from '../auth/constants/roles';
import { Audit } from '../audit/audit.decorator';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
  };
};

@Controller('clients')
@UseGuards(JwtAuthGuard)
// Lectura: personal de operaciones (los tecnicos ven la cartera para su ruta).
// Escritura: solo gestion, restringida por metodo mas abajo.
@Roles(...ROLE_GROUPS.STAFF)
@Audit('Client')
export class ClientsController {
  constructor(private readonly clientService: ClientsService) {}

  @Get()
  findAll(): Promise<Client[]> {
    return this.clientService.findAll();
  }

  // El DTO se recibe completo (no parametro a parametro) para que el
  // ValidationPipe global lo valide: orderBy/orderDirection se interpolan en
  // la consulta y sin validacion permiten inyeccion SQL.
  @Get('filter')
  getClients(@Query() filters: FilterClientsDto) {
    return this.clientService.findByFilters(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string): any {
    return this.clientService.findOne(id);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Post('create')
  create(@Body() client: CreateClientDto): Promise<Client> {
    return this.clientService.createClient(client);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Put('update/:id')
  update(
    @Param('id') id: string,
    @Body() client: UpdateClientDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Client> {
    const userId = req.user?.id ?? 'Unknown';
    return this.clientService.update(id, client, userId);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Delete('delete/:id')
  remove(@Param('id') id: string): Promise<void> {
    return this.clientService.remove(id);
  }

  // Con un cuerpo de tipo array, el metatipo en runtime es Array y el
  // ValidationPipe global omite la validacion de los elementos: el
  // @IsIn(ALLOWED_CAMPOS) de UpdateCampoDto nunca se ejecutaba y
  // `merge(existing, {[campo]: valor})` permitia escribir cualquier columna de
  // Client. ParseArrayPipe valida elemento por elemento.
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Put('update-campos/:id')
  updateCampo(
    @Param('id') id: string,
    @Body(
      new ParseArrayPipe({
        items: UpdateCampoDto,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: UpdateCampoDto[],
    @Req() req: AuthenticatedRequest,
  ) {
    return this.clientService.updateCampo(id, dto, req.user?.id ?? 'Unknown');
  }
}
