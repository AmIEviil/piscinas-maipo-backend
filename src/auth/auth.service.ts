/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
// import { LoginUserDto } from './dto/login-user.dto';
// import { ConfigureAccountDto } from './dto/configure-user.dto';
// import { MailService } from 'src/email/email.service';
// import { SetupProfileDto } from './dto/setup-profile.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { RoleUser } from '../users/entities/role-user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigureAccountDto } from './dto/configure-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(RoleUser)
    private readonly roleUserRepository: Repository<RoleUser>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private jwtService: JwtService,
    // private mailService: MailService,
  ) {}

  passwordRegex = /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*/;

  async createUser(createUserDto: CreateUserDto) {
    const { roleId, ...userData } = createUserDto;

    const role = await this.roleRepository.findOneBy({ id: roleId });

    if (!role) throw new BadRequestException('Rol no válido');

    const user = this.userRepository.create({
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      isActive: userData.isActive ?? true,
    });

    await this.userRepository.save(user);

    const roleUser = this.roleUserRepository.create({ user, role });
    await this.roleUserRepository.save(roleUser);

    const activationToken = this.getJwtToken({ email: user.email });

    // await this.mailService.sendActivationEmail(
    //   user.email,
    //   user.id,
    //   user.nombre,
    //   user.language as 'es' | 'en',
    // );

    return {
      message: 'Usuario creado. Debe activar su cuenta.',
      userId: user.id,
      activationToken,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, user_name } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { user_name },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        user_name: true,
        password: true,
        failed_attempts: true,
        blocked_until: true,
        isActive: true,
        email: true,
        last_login: true,
        refresh_token: true,
      },
    });

    let mensaje = 'Usuario o contraseña incorrecta';
    let response: {
      mensaje: string;
      remaining_attempts: number;
      blocked_until: Date | null;
    } = {
      mensaje,
      remaining_attempts: 5,
      blocked_until: null,
    };

    if (!user) {
      mensaje = 'Usuario no existe';
      response = {
        mensaje: mensaje,
        remaining_attempts: 5,
        blocked_until: null,
      };
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Usuario no existe',
        error: 'Unauthorized',
        details: response,
      });
    }

    if (!this.passwordRegex.test(password) || password.length < 6) {
      user.failed_attempts += 1;

      if (user.failed_attempts >= 5) {
        const unblockAt = new Date();
        unblockAt.setHours(unblockAt.getHours() + 12);
        user.blocked_until = unblockAt;
      }

      await this.userRepository.save(user);

      const remaining = Math.max(5 - user.failed_attempts, 0);
      const mensaje =
        remaining <= 5 && remaining > 1
          ? 'incorrect_password_plural'
          : remaining === 1
            ? 'incorrect_password'
            : 'blocked_account';

      throw new UnauthorizedException({
        statusCode: 401,
        message: 'invalid_password_format',
        error: 'Unauthorized',
        details: {
          mensaje,
          remaining_attempts: remaining,
          blocked_until: user.blocked_until,
        },
      });
    }

    const now = new Date();

    if (!user.isActive) {
      mensaje = 'inactive_account';
      response = {
        mensaje: mensaje,
        remaining_attempts: 5,
        blocked_until: null,
      };
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'inactive_account',
        error: 'Unauthorized',
        details: response,
      });
    }

    if (user.blocked_until && user.blocked_until > now) {
      mensaje = 'blocked_until';
      response = {
        mensaje: mensaje,
        remaining_attempts: 5,
        blocked_until: user.blocked_until,
      };
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Cuenta bloqueada hasta ' + user.blocked_until.toISOString(),
        error: 'Unauthorized',
        details: response,
      });
    }

    const isValidPassword =
      user.password && bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      user.failed_attempts += 1;

      if (user.failed_attempts >= 5) {
        const unblockAt = new Date();
        unblockAt.setHours(unblockAt.getHours() + 12);
        user.blocked_until = unblockAt;
      }

      await this.userRepository.save(user);

      const remaining = Math.max(5 - user.failed_attempts, 0);
      mensaje =
        remaining <= 5 && remaining > 1
          ? 'Contraseña incorrecta, quedan ' + remaining + ' intentos'
          : remaining === 1
            ? 'Contraseña incorrecta, queda 1 intento'
            : 'Cuenta bloqueada por múltiples intentos fallidos';

      response = {
        mensaje: mensaje,
        remaining_attempts: remaining,
        blocked_until: user.blocked_until,
      };
      throw new UnauthorizedException({
        statusCode: 401,
        message: response.mensaje,
        error: 'Unauthorized',
        details: response,
      });
    }

    user.failed_attempts = 0;
    user.blocked_until = null;
    user.last_login = new Date();
    await this.userRepository.save(user);

    delete user.password;

    if (!user.email) {
      return {
        requires_email: true,
        message: 'need_email',
        user: {
          id: user.id,
          user_name: user.user_name,
        },
      };
    }

    const payload = { email: user.email, id: user.id };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '12h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    user.refresh_token = bcrypt.hashSync(refreshToken, 10);
    await this.userRepository.save(user);

    return {
      ...user,
      accessToken,
      refreshToken,
    };
  }

  async configureAccount(userId: string, dto: ConfigureAccountDto) {
    const { user_name, password } = dto;

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.user_name)
      throw new BadRequestException('La cuenta ya fue configurada');

    const exists = await this.userRepository.findOneBy({ user_name });
    if (exists) throw new BadRequestException('Nombre de usuario en uso');

    user.user_name = user_name;
    user.password = bcrypt.hashSync(password, 10);
    user.isActive = true;

    await this.userRepository.save(user);

    return {
      message: 'Cuenta activada correctamente',
      token: this.getJwtToken({ email: user.email, id: user.id }),
      refreshToken: user.refresh_token,
      user: user,
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException('error_mail');
    }

    if (user.blocked_until) {
      return { message: 'user_blocked' };
    }

    // const token = this.jwtService.sign(
    //   { email: user.email },
    //   { expiresIn: '15m' },
    // );

    // await this.mailService.sendResetPasswordEmail(
    //   user.email,
    //   token,
    //   user.nombre,
    // );

    return { message: 'email_sended' };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { email: string };

    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const user = await this.userRepository.findOneBy({ email: payload.email });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.password = bcrypt.hashSync(newPassword, 10);
    user.failed_attempts = 0;
    user.blocked_until = null;
    await this.userRepository.save(user);

    const sessionToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });

    return {
      message: 'Contraseña actualizada exitosamente',
      token: sessionToken,
      user: user,
    };
  }

  async setSessionClosedAt(userId: string, logout_at: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.session_closed_at = new Date(logout_at); // <-- Campo correcto

    await this.userRepository.save(user);
    return {
      message: 'Fecha de cierre de sesión guardada con éxito',
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);

      const user = await this.userRepository.findOneBy({ id: payload.id });
      if (!user || !user.refresh_token) throw new UnauthorizedException();

      // Validar que el refreshToken entregado coincide con el que guardamos
      const isValid = bcrypt.compareSync(token, user.refresh_token);
      if (!isValid) throw new UnauthorizedException();

      // Generamos nuevo access token
      const newAccessToken = this.jwtService.sign(
        { email: user.email, id: user.id },
        { expiresIn: '12h' },
      );

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  private getJwtToken(payload: { id?: string; email?: string }) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
