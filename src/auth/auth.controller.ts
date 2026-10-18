import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigureAccountDto } from './dto/configure-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { ROLES } from './roles/roles.constants';
import { assertSelfOrSuperadmin } from './roles/roles.utils';
import type { AuthenticatedRequest } from '../types/authenticated-request';

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

  @Roles(ROLES.SUPER_ADMIN)
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  // Cada usuario solo modifica su propia cuenta (salvo Superadmin)
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
  @Patch('configure/:id')
  async configureAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfigureAccountDto,
    @Req() req: AuthenticatedRequest,
  ) {
    assertSelfOrSuperadmin(req.user, id);
    return this.authService.configureAccount(id, dto);
  }

  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TECNICO)
  @Patch('setLogout/:id')
  async setSessionClosedAt(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body('logout_at') logout_at: string,
    @Req() req: AuthenticatedRequest,
  ) {
    assertSelfOrSuperadmin(req.user, userId);
    return this.authService.setSessionClosedAt(userId, logout_at);
  }
}
