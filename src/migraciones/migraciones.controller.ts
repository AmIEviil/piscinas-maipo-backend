import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { MigracionesService } from './migraciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE_GROUPS } from '../auth/constants/roles';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
  };
};

// Operaciones sobre el esquema de la base de datos que contiene los datos
// personales. Restringido a Superadmin, en linea con la matriz del frontend
// (`constant/routes.ts`: Migraciones -> [SUPER_ADMIN]).
//
// Se retiraron `execute-all` y `revert-last`: ejecutaban o revertian el lote
// completo de migraciones con una sola peticion sin nombrar el objetivo, no
// los usaba el frontend, y un revert en lote puede eliminar tablas enteras.
// Las operaciones en lote van por CLI en el despliegue (`yarn migration:run`).
@Controller('migrations')
@UseGuards(JwtAuthGuard)
@Roles(...ROLE_GROUPS.SUPER_ONLY)
export class MigracionesController {
  constructor(private readonly migrationService: MigracionesService) {}

  // El actor de la auditoria se toma del token, nunca de la URL: antes el
  // `userId` era un parametro de ruta y quien llamaba podia atribuir la
  // operacion a cualquier otro usuario.
  private actorId(req: AuthenticatedRequest): string {
    const id = req.user?.id;
    if (!id) throw new ForbiddenException('No autorizado');
    return id;
  }

  @Get()
  async listMigrations(@Query('order') order: 'asc' | 'desc' = 'asc') {
    return this.migrationService.getMigrationsStatus(order);
  }

  @Post('execute/:migrationName')
  async executeMigration(
    @Param('migrationName') migrationName: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.migrationService.executeMigration(
      migrationName,
      this.actorId(req),
    );
  }

  @Post('revert/:migrationName')
  async revertMigration(
    @Param('migrationName') migrationName: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.migrationService.revertMigration(
      migrationName,
      this.actorId(req),
    );
  }

  @Get('history')
  async getMigrationHistory(@Query('migration') migrationName?: string) {
    return this.migrationService.getMigrationHistory(migrationName);
  }
}
