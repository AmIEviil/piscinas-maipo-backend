import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { createHash, timingSafeEqual } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
// import { LoginUserDto } from './dto/login-user.dto';
// import { ConfigureAccountDto } from './dto/configure-user.dto';
// import { SetupProfileDto } from './dto/setup-profile.dto';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { RoleUser } from '../users/entities/role-user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ConfigureAccountDto } from './dto/configure-user.dto';
import {
  JWT_AUDIENCE,
  JWT_ISSUER,
  JwtPayload,
  TOKEN_TYPE,
  TokenType,
} from './constants/token-types';

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
    private mailService: MailService,
  ) {}

  private static readonly ACCESS_TTL = '12h';
  private static readonly REFRESH_TTL = '7d';
  private static readonly ACTIVATION_TTL = '24h';
  private static readonly PWD_RESET_TTL = '15m';

  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly MAX_BLOCK_MINUTES = 30;

  // Hash señuelo para igualar el tiempo de respuesta cuando el usuario no existe
  // (evita enumeración por timing). Se calcula una sola vez al iniciar.
  private readonly dummyHash = bcrypt.hashSync('dummy-timing-guard', 10);

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

    const activationToken = this.signToken(
      user,
      TOKEN_TYPE.ACTIVATION,
      AuthService.ACTIVATION_TTL,
    );

    void this.mailService.sendAccountActivation({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      activationToken,
    });

    // El token de activacion NO se devuelve en la respuesta HTTP: viaja solo
    // por correo al titular de la cuenta. Devolverlo permitia a quien crea el
    // usuario quedarse con una credencial de esa cuenta.
    return {
      message: 'Usuario creado. Debe activar su cuenta.',
      userId: user.id,
    };
  }

  // Toda falla de autenticacion responde exactamente esto. Antes las
  // respuestas distinguian 'invalid_password_format' (solo para usuarios
  // existentes), 'inactive_account' y 'blocked_until' con la fecha exacta, lo
  // que permitia enumerar cuentas validas.
  private invalidCredentials(): never {
    throw new UnauthorizedException({
      statusCode: 401,
      message: 'Usuario o contraseña incorrecta',
      error: 'Unauthorized',
    });
  }

  // Bloqueo con retroceso exponencial en vez de 12 horas fijas. El bloqueo
  // fijo permitia a un tercero que conociera un nombre de usuario dejar la
  // cuenta fuera de servicio medio dia con cinco peticiones. El retroceso
  // frena la fuerza bruta sin convertirse en una denegacion de servicio.
  private blockDurationMinutes(failedAttempts: number): number {
    const over = failedAttempts - AuthService.MAX_FAILED_ATTEMPTS;
    return Math.min(2 ** Math.max(over, 0), AuthService.MAX_BLOCK_MINUTES);
  }

  private async registerFailedAttempt(user: User): Promise<never> {
    user.failed_attempts += 1;

    if (user.failed_attempts >= AuthService.MAX_FAILED_ATTEMPTS) {
      const unblockAt = new Date();
      unblockAt.setMinutes(
        unblockAt.getMinutes() +
          this.blockDurationMinutes(user.failed_attempts),
      );
      user.blocked_until = unblockAt;
    }

    await this.userRepository.save(user);
    this.invalidCredentials();
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

    if (!user) {
      // Comparar contra un hash señuelo iguala el tiempo de respuesta para no
      // revelar por temporización que el usuario no existe.
      bcrypt.compareSync(password, this.dummyHash);
      this.invalidCredentials();
    }

    const now = new Date();

    // Cuenta inactiva o bloqueada: misma respuesta que credenciales
    // incorrectas. Se comprueba antes de verificar la contraseña para no
    // gastar bcrypt en cuentas que no pueden entrar.
    if (!user.isActive) this.invalidCredentials();
    if (user.blocked_until && user.blocked_until > now) {
      this.invalidCredentials();
    }

    const isValidPassword =
      user.password && bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      await this.registerFailedAttempt(user);
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

    const { accessToken, refreshToken } = this.issueSessionTokens({
      id: user.id,
      email: user.email,
    });

    user.refresh_token = this.hashRefreshToken(refreshToken);
    await this.userRepository.save(user);

    // Minimizacion: se devuelve solo lo que la interfaz usa. Antes se hacia
    // `...user`, que incluia failed_attempts, blocked_until, session_closed_at
    // y last_login, datos de control interno que el cliente no necesita y que
    // terminaban almacenados en el navegador.
    return {
      id: user.id,
      user_name: user.user_name,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      isActive: user.isActive,
      roleUser: user.roleUser,
      accessToken,
      refreshToken,
    };
  }

  async configureAccount(userId: string, dto: ConfigureAccountDto) {
    const { user_name, password, token } = dto;

    // La activacion se autoriza con el token de activacion enviado por correo,
    // no con la sesion de quien llama. Antes bastaba cualquier JWT valido y el
    // :id no se contrastaba con el usuario autenticado, de modo que cualquier
    // usuario podia apropiarse de una cuenta pendiente de activar (incluida
    // una cuenta Admin).
    const payload = this.verifyTokenOfType(token, TOKEN_TYPE.ACTIVATION);
    if (payload.id !== userId) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // El token se emite contra un email concreto: si el email de la cuenta
    // cambio despues de emitirlo, el token deja de ser valido.
    if (user.email !== payload.email) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Un solo uso: una vez configurada, la cuenta ya tiene user_name.
    if (user.user_name)
      throw new BadRequestException('La cuenta ya fue configurada');

    const exists = await this.userRepository.findOneBy({ user_name });
    if (exists) throw new BadRequestException('Nombre de usuario en uso');

    user.user_name = user_name;
    user.password = bcrypt.hashSync(password, 10);
    user.isActive = true;

    const { accessToken, refreshToken } = this.issueSessionTokens({
      id: user.id,
      email: user.email,
    });
    user.refresh_token = this.hashRefreshToken(refreshToken);

    await this.userRepository.save(user);

    // Ni la contrasena ni el hash del refresh token salen en la respuesta.
    delete user.password;
    delete user.refresh_token;

    return {
      message: 'Cuenta activada correctamente',
      token: accessToken,
      refreshToken,
      user,
    };
  }

  async requestPasswordReset(user_name: string, email: string) {
    const user = await this.userRepository.findOne({
      where: { user_name },
      select: {
        id: true,
        first_name: true,
        email: true,
        user_name: true,
        blocked_until: true,
      },
    });

    // Solo enviamos el correo si la cuenta existe y el email coincide, pero
    // SIEMPRE devolvemos la misma respuesta para no revelar existencia ni
    // estado (bloqueo) de la cuenta. Anti-enumeración (#2).
    if (user && user.email === email) {
      const token = this.signToken(
        { id: user.id, email: user.email },
        TOKEN_TYPE.PWD_RESET,
        AuthService.PWD_RESET_TTL,
      );

      void this.mailService.sendPasswordReset({
        first_name: user.first_name,
        email: user.email,
        resetToken: token,
      });
    }

    return { message: 'email_sended' };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = this.verifyTokenOfType(token, TOKEN_TYPE.PWD_RESET);

    const user = await this.userRepository.findOneBy({ email: payload.email });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.password = bcrypt.hashSync(newPassword, 10);
    user.failed_attempts = 0;
    user.blocked_until = null;
    // Cambiar la contraseña invalida las sesiones abiertas: si la cuenta
    // estaba comprometida, el atacante pierde el acceso en ese momento y no
    // dentro de 12 horas.
    user.session_closed_at = new Date();

    const { accessToken, refreshToken } = this.issueSessionTokens({
      id: user.id,
      email: user.email,
    });
    user.refresh_token = this.hashRefreshToken(refreshToken);

    await this.userRepository.save(user);

    // Se omitia solo `password`: el objeto seguia llevando `refresh_token`,
    // es decir el hash almacenado de la sesion, hacia el cliente.
    delete user.password;
    delete user.refresh_token;

    return {
      message: 'Contraseña actualizada exitosamente',
      token: accessToken,
      refreshToken,
      user,
    };
  }

  // La marca de cierre la pone el servidor, no el cliente. Con la fecha
  // tomada del cuerpo, un cliente podia enviar una fecha pasada para que sus
  // tokens siguieran siendo validos pese al cierre de sesion.
  async setSessionClosedAt(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.session_closed_at = new Date();
    // Cerrar sesion tambien invalida el refresh token: si no, seguiria
    // sirviendo para pedir tokens de acceso nuevos durante 7 dias.
    user.refresh_token = null as unknown as undefined;

    await this.userRepository.save(user);
    return {
      message: 'Fecha de cierre de sesión guardada con éxito',
    };
  }

  async refreshToken(token: string) {
    // Solo se acepta un token de tipo refresh: un access token robado ya no
    // sirve para prolongar la sesion.
    const payload = this.verifyTokenOfType(token, TOKEN_TYPE.REFRESH);

    const user = await this.userRepository.findOneBy({ id: payload.id });
    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Un token que ya no coincide con el almacenado es uno que se rotó antes:
    // o llegó reutilizado, o hay una copia en circulación. En ambos casos se
    // invalida la familia completa y se obliga a iniciar sesión de nuevo.
    if (!this.refreshTokenMatches(token, user.refresh_token)) {
      user.refresh_token = null as unknown as undefined;
      user.session_closed_at = new Date();
      await this.userRepository.save(user);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Rotacion: cada refresh consume el token y entrega uno nuevo, de modo que
    // uno robado sirve una sola vez y su uso delata la copia.
    const { accessToken, refreshToken } = this.issueSessionTokens({
      id: user.id,
      email: user.email,
    });
    user.refresh_token = this.hashRefreshToken(refreshToken);
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }

  // Todo JWT emitido por la aplicacion lleva el claim `typ`. Sin el, un
  // refresh token o un token de activacion son indistinguibles de un token de
  // acceso porque comparten secreto y payload.
  private signToken(
    user: { id: string; email: string },
    typ: TokenType,
    expiresIn: string,
  ): string {
    return this.jwtService.sign(
      { id: user.id, email: user.email, typ },
      { expiresIn, issuer: JWT_ISSUER, audience: JWT_AUDIENCE },
    );
  }

  // El refresh token NO se guarda con bcrypt.
  //
  // bcrypt trunca su entrada a 72 bytes. Un JWT mide bastante mas, y dos
  // refresh tokens del mismo usuario comparten cabecera e inicio del payload:
  // sus primeros 72 bytes son identicos. Con bcrypt, un refresh token ya
  // rotado seguia validando contra el hash del nuevo, de modo que la
  // comparacion no distinguia un token de otro y la deteccion de reutilizacion
  // no podia funcionar.
  //
  // Un JWT firmado es de alta entropia, asi que SHA-256 es suficiente: no
  // hace falta una funcion lenta, que es lo que aporta bcrypt frente a
  // contrasenas adivinables.
  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private refreshTokenMatches(token: string, stored: string): boolean {
    const provided = Buffer.from(this.hashRefreshToken(token), 'hex');
    let saved: Buffer;
    try {
      saved = Buffer.from(stored, 'hex');
    } catch {
      return false;
    }
    if (provided.length !== saved.length) return false;
    return timingSafeEqual(provided, saved);
  }

  private issueSessionTokens(user: { id: string; email: string }) {
    return {
      accessToken: this.signToken(
        user,
        TOKEN_TYPE.ACCESS,
        AuthService.ACCESS_TTL,
      ),
      refreshToken: this.signToken(
        user,
        TOKEN_TYPE.REFRESH,
        AuthService.REFRESH_TTL,
      ),
    };
  }

  // Verifica un token de un tipo concreto. Rechaza cualquier otro tipo aunque
  // la firma y la expiracion sean validas.
  private verifyTokenOfType(token: string, typ: TokenType): JwtPayload {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    if (payload.typ !== typ) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return payload;
  }
}
