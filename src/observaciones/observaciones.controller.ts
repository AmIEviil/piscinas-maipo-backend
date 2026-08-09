import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ROLE_GROUPS } from '../auth/constants/roles';

@Controller('observaciones')
@UseGuards(JwtAuthGuard)
@Roles(...ROLE_GROUPS.STAFF)
export class ObservacionesController {
  // Controlador vacío por ahora
}
