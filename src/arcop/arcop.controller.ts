import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ArcopService } from './arcop.service';
import { SupresionDto } from './dto/supresion.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE_GROUPS } from '../auth/constants/roles';
import { Audit } from '../audit/audit.decorator';

type AuthenticatedRequest = Request & {
  user?: { id?: string };
};

/**
 * Derechos de los titulares (arts. 4 a 9 Ley 21.719).
 *
 * Restringido a Superadmin: son operaciones sobre la totalidad de los datos de
 * una persona y, en el caso de la supresion, irreversibles. Toda llamada queda
 * en `access_audit`, y cada supresion deja ademas una constancia propia en
 * `data_deletion_log`.
 */
@Controller('arcop')
@Roles(...ROLE_GROUPS.SUPER_ONLY)
@Audit('ARCOP')
export class ArcopController {
  constructor(private readonly arcopService: ArcopService) {}

  /** Acceso y portabilidad (arts. 5 y 9). */
  @Get('cliente/:id/exportar')
  exportarCliente(@Param('id', ParseUUIDPipe) id: string) {
    return this.arcopService.exportarCliente(id);
  }

  @Get('empleado/:id/exportar')
  exportarEmpleado(@Param('id', ParseUUIDPipe) id: string) {
    return this.arcopService.exportarEmpleado(id);
  }

  /** Supresion (art. 6). Irreversible. */
  @Delete('cliente/:id')
  suprimirCliente(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SupresionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.arcopService.suprimirCliente(id, dto, req.user?.id ?? null);
  }

  @Delete('empleado/:id')
  suprimirEmpleado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SupresionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.arcopService.suprimirEmpleado(id, dto, req.user?.id ?? null);
  }

  /** Evidencia de las supresiones realizadas. */
  @Get('supresiones')
  historialSupresiones(@Query('entity') entity?: string) {
    return this.arcopService.historialSupresiones(entity);
  }
}
