import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigureAccountDto } from './dto/configure-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { ROLES, ROLE_GROUPS } from './constants/roles';

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 900_000, limit: 5 } })
  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Public()
  @Throttle({ default: { ttl: 900_000, limit: 5 } })
  @Post('request-password-reset')
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.user_name, dto.email);
  }

  @Public()
  @Throttle({ default: { ttl: 900_000, limit: 5 } })
  @Patch('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Public()
  @Throttle({ default: { ttl: 900_000, limit: 5 } })
  @Post('refreshToken')
  async refresh(@Body('refreshToken') token: string) {
    return this.authService.refreshToken(token);
  }

  // Protected routes below (require valid JWT)

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  // Publica a proposito: la autorizacion es el token de activacion enviado
  // por correo (validado contra el :id dentro del service), no una sesion
  // previa. La cuenta que se esta activando todavia no tiene contrasena, asi
  // que su titular no puede tener una sesion iniciada.
  @Public()
  @Throttle({ default: { ttl: 900_000, limit: 5 } })
  @Patch('configure/:id')
  async configureAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfigureAccountDto,
  ) {
    return this.authService.configureAccount(id, dto);
  }

  // Autoservicio: cualquier miembro del personal cierra su propia sesion. La
  // verificacion de propiedad esta abajo.
  // La fecha de cierre la fija el servidor; el `logout_at` que enviaba el
  // cliente se ignora.
  @Roles(...ROLE_GROUPS.STAFF)
  @Patch('setLogout/:id')
  async setSessionClosedAt(
    @Param('id', ParseUUIDPipe) userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    // Un usuario solo puede registrar el cierre de su propia sesion.
    if (req.user?.id !== userId) {
      throw new ForbiddenException('No tiene permisos para esta acción');
    }
    return this.authService.setSessionClosedAt(userId);
  }
}
