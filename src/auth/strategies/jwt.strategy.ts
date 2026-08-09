import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import {
  JWT_AUDIENCE,
  JWT_ISSUER,
  JwtPayload,
  TOKEN_TYPE,
} from '../constants/token-types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    super({
      secretOrKey: jwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  }

  // `iat` viene en segundos y `session_closed_at` con milisegundos: sin
  // tolerancia, un token emitido en el mismo instante en que se marca el
  // cierre (restablecer contraseña emite tokens y cierra sesiones a la vez)
  // se rechazaria a si mismo por el redondeo.
  private static readonly CLOCK_SKEW_MS = 2000;

  async validate(payload: JwtPayload): Promise<User> {
    // Solo los tokens de acceso autentican peticiones. Refresh, activacion y
    // restablecimiento de contrasena se firman con el mismo secreto y deben
    // ser rechazados aqui: cada uno se verifica en su propio flujo.
    if (payload.typ !== TOKEN_TYPE.ACCESS) {
      throw new UnauthorizedException('token not valid');
    }

    const { email } = payload;
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new UnauthorizedException('token not valid');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User not active');
    }

    // Cierre de sesion efectivo en el servidor. Antes `session_closed_at` se
    // guardaba pero nunca se consultaba: tras "cerrar sesion" el token seguia
    // siendo valido hasta 12 horas y bastaba conservarlo para volver a entrar.
    if (user.session_closed_at && payload.iat) {
      const issuedAtMs = payload.iat * 1000 + JwtStrategy.CLOCK_SKEW_MS;
      if (issuedAtMs < user.session_closed_at.getTime()) {
        throw new UnauthorizedException('token not valid');
      }
    }

    const userWithId = {
      ...user,
      id: user.id,
    };

    return userWithId;
  }
}
