import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';

@Controller('observaciones')
@UseGuards(JwtAuthGuard)
export class ObservacionesController {
  // Controlador vacío por ahora
}
