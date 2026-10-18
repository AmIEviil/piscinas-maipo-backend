import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLES } from '../auth/roles/roles.constants';

@Controller('observaciones')
@Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
@UseGuards(JwtAuthGuard)
export class ObservacionesController {
  // Controlador vacío por ahora
}
