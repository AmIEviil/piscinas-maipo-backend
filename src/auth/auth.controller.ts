import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigureAccountDto } from './dto/configure-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Patch('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Patch('configure/:id')
  async configureAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ConfigureAccountDto,
  ) {
    return this.authService.configureAccount(id, dto);
  }

  @Patch('setLogout/:id')
  async setSessionClosedAt(
    @Param('id') userId: string,
    @Body('logout_at') logout_at: string,
  ) {
    return this.authService.setSessionClosedAt(userId, logout_at);
  }

  @Post('refreshToken')
  async refresh(@Body('refreshToken') token: string) {
    return this.authService.refreshToken(token);
  }
}
