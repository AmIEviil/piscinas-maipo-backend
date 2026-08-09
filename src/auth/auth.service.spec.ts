import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'node:crypto';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { RoleUser } from '../users/entities/role-user.entity';
import { MailService } from '../mail/mail.service';
import {
  JWT_AUDIENCE,
  JWT_ISSUER,
  TOKEN_TYPE,
  TokenType,
} from './constants/token-types';

const jwtService = new JwtService({ secret: 'test-secret' });

const sign = (payload: Record<string, unknown>, expiresIn = '1h') =>
  jwtService.sign(payload, {
    expiresIn,
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });

// Un token firmado con el mismo secreto pero emitido por otro sistema.
const signForeign = (payload: Record<string, unknown>) =>
  jwtService.sign(payload, { expiresIn: '1h' });

const pendingUser = () =>
  ({
    id: 'u1',
    email: 'a@b.cl',
    user_name: null,
    first_name: 'A',
    last_name: 'B',
    isActive: false,
    failed_attempts: 0,
    blocked_until: null,
  }) as unknown as User;

const makeService = (user: User | null) => {
  const saved: User[] = [];
  const userRepository = {
    findOneBy: jest.fn(({ id, user_name }: Partial<User>) => {
      // La busqueda por user_name se usa para detectar nombres en uso.
      if (user_name !== undefined) return Promise.resolve(null);
      if (user && id === user.id) return Promise.resolve(user);
      return Promise.resolve(null);
    }),
    save: jest.fn((u: User) => {
      saved.push(u);
      return Promise.resolve(u);
    }),
  } as unknown as Repository<User>;

  const service = new AuthService(
    userRepository,
    {} as Repository<RoleUser>,
    {} as Repository<Role>,
    jwtService,
    { sendAccountActivation: jest.fn() } as unknown as MailService,
  );

  return { service, saved };
};

const activationToken = (id: string, email: string) =>
  sign({ id, email, typ: TOKEN_TYPE.ACTIVATION });

const dto = (token: string) => ({
  token,
  user_name: 'nuevo_user',
  password: 'Abcdef1',
});

describe('AuthService.configureAccount', () => {
  it('activa la cuenta con un token de activacion valido', async () => {
    const user = pendingUser();
    const { service } = makeService(user);

    const result = await service.configureAccount(
      'u1',
      dto(activationToken('u1', 'a@b.cl')),
    );

    expect(result.token).toBeDefined();
    expect(user.user_name).toBe('nuevo_user');
    expect(user.isActive).toBe(true);
  });

  // El defecto original: el endpoint solo exigia un JWT valido cualquiera y no
  // contrastaba el :id, de modo que cualquier usuario autenticado podia
  // apropiarse de una cuenta pendiente de activacion, incluida una Admin.
  it('rechaza un token emitido para otro usuario', async () => {
    const { service } = makeService(pendingUser());

    await expect(
      service.configureAccount('u1', dto(activationToken('otro', 'x@y.cl'))),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza si el email del token no coincide con el de la cuenta', async () => {
    const { service } = makeService(pendingUser());

    await expect(
      service.configureAccount('u1', dto(activationToken('u1', 'otro@b.cl'))),
    ).rejects.toThrow(UnauthorizedException);
  });

  it.each<TokenType>([
    TOKEN_TYPE.ACCESS,
    TOKEN_TYPE.REFRESH,
    TOKEN_TYPE.PWD_RESET,
  ])('rechaza un token de tipo %s', async (typ) => {
    const { service } = makeService(pendingUser());
    const token = sign({ id: 'u1', email: 'a@b.cl', typ });

    await expect(service.configureAccount('u1', dto(token))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza un token expirado', async () => {
    const { service } = makeService(pendingUser());
    const token = sign(
      { id: 'u1', email: 'a@b.cl', typ: TOKEN_TYPE.ACTIVATION },
      '-1s',
    );

    await expect(service.configureAccount('u1', dto(token))).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('no permite reutilizar el token en una cuenta ya configurada', async () => {
    const user = { ...pendingUser(), user_name: 'ya_configurado' } as User;
    const { service } = makeService(user);

    await expect(
      service.configureAccount('u1', dto(activationToken('u1', 'a@b.cl'))),
    ).rejects.toThrow(BadRequestException);
  });

  it('no devuelve la contrasena ni el hash del refresh token', async () => {
    const { service } = makeService(pendingUser());

    const result = await service.configureAccount(
      'u1',
      dto(activationToken('u1', 'a@b.cl')),
    );

    expect(result.user).not.toHaveProperty('password');
    expect(result.user).not.toHaveProperty('refresh_token');
    // El refreshToken entregado debe ser el JWT, nunca el hash almacenado.
    expect(result.refreshToken.split('.')).toHaveLength(3);
  });
});

describe('AuthService.configureAccount (issuer/audience)', () => {
  it('rechaza un token válido emitido por otro emisor', async () => {
    const { service } = makeService(pendingUser());
    const token = signForeign({
      id: 'u1',
      email: 'a@b.cl',
      typ: TOKEN_TYPE.ACTIVATION,
    });

    await expect(service.configureAccount('u1', dto(token))).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

describe('AuthService.refreshToken', () => {
  const sha256 = (value: string) =>
    createHash('sha256').update(value).digest('hex');

  const withRefresh = (token: string) =>
    ({
      ...pendingUser(),
      refresh_token: sha256(token),
    }) as User;

  it('rechaza un access token usado como refresh token', async () => {
    const { service } = makeService(withRefresh('x'));
    const token = sign({ id: 'u1', email: 'a@b.cl', typ: TOKEN_TYPE.ACCESS });

    await expect(service.refreshToken(token)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rota el refresh token en cada uso', async () => {
    const token = sign({ id: 'u1', email: 'a@b.cl', typ: TOKEN_TYPE.REFRESH });
    const user = withRefresh(token);
    const { service } = makeService(user);

    const result = await service.refreshToken(token);

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken).not.toBe(token);
    // El hash almacenado ya no corresponde al token consumido. Con bcrypt esto
    // fallaba: trunca a 72 bytes y dos JWT del mismo usuario comparten ese
    // prefijo, así que el token viejo seguía validando.
    expect(user.refresh_token).not.toBe(sha256(token));
    expect(user.refresh_token).toBe(sha256(result.refreshToken));
  });

  // Un refresh que ya no coincide con el almacenado indica una copia en
  // circulación: se invalida la familia entera en vez de solo rechazar.
  it('invalida la sesión completa al detectar reutilización', async () => {
    const stale = sign({ id: 'u1', email: 'a@b.cl', typ: TOKEN_TYPE.REFRESH });
    const user = withRefresh('otro-token-ya-rotado');
    const { service } = makeService(user);

    await expect(service.refreshToken(stale)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(user.refresh_token).toBeNull();
    expect(user.session_closed_at).toBeInstanceOf(Date);
  });
});

describe('AuthService.login (no enumeración de cuentas)', () => {
  const mensaje = (err: unknown) =>
    (err as { response: { message: string } }).response.message;

  const loginUser = (over: Partial<User> = {}) =>
    ({
      id: 'u1',
      email: 'a@b.cl',
      user_name: 'juan',
      first_name: 'A',
      last_name: 'B',
      isActive: true,
      failed_attempts: 0,
      blocked_until: null,
      password: bcrypt.hashSync('ClaveCorrecta1!', 10),
      ...over,
    }) as User;

  const makeLoginService = (user: User | null) => {
    const userRepository = {
      findOne: jest.fn().mockResolvedValue(user),
      findOneBy: jest.fn().mockResolvedValue(user),
      save: jest.fn((u: User) => Promise.resolve(u)),
    } as unknown as Repository<User>;

    return new AuthService(
      userRepository,
      {} as Repository<RoleUser>,
      {} as Repository<Role>,
      jwtService,
      {} as unknown as MailService,
    );
  };

  const attempt = async (user: User | null, password = 'loQueSea') => {
    const service = makeLoginService(user);
    try {
      await service.login({ user_name: 'juan', password });
      throw new Error('debió fallar');
    } catch (err) {
      return mensaje(err);
    }
  };

  // Los cuatro escenarios deben ser indistinguibles desde fuera. Antes,
  // 'invalid_password_format' solo aparecía para usuarios existentes, e
  // 'inactive_account' y 'blocked_until' confirmaban la cuenta.
  it('devuelve el mismo mensaje para usuario inexistente, contraseña mala, cuenta inactiva y cuenta bloqueada', async () => {
    const futuro = new Date(Date.now() + 60_000);
    const mensajes = await Promise.all([
      attempt(null),
      attempt(loginUser(), 'ClaveIncorrecta1!'),
      attempt(loginUser({ isActive: false })),
      attempt(loginUser({ blocked_until: futuro })),
      // Contraseña con formato inválido: antes revelaba la cuenta.
      attempt(loginUser(), 'abc'),
    ]);

    expect(new Set(mensajes).size).toBe(1);
    expect(mensajes[0]).toBe('Usuario o contraseña incorrecta');
  });

  it('no bloquea 12 horas: el primer bloqueo es de un minuto', async () => {
    const user = loginUser({ failed_attempts: 4 });
    const service = makeLoginService(user);

    await expect(
      service.login({ user_name: 'juan', password: 'ClaveIncorrecta1!' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(user.failed_attempts).toBe(5);
    const minutos = (user.blocked_until!.getTime() - Date.now()) / 60_000;
    expect(minutos).toBeGreaterThan(0);
    expect(minutos).toBeLessThanOrEqual(1);
  });
});
