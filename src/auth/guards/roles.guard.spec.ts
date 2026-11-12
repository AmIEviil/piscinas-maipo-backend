import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES } from '../roles/roles.constants';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Contexto falso: handler/clase reales con metadata definida via Reflect
function crearContexto(opts: {
  user?: unknown;
  handlerMeta?: Record<string, unknown>;
  claseMeta?: Record<string, unknown>;
}): ExecutionContext {
  const handler = () => undefined;
  class Controlador {}
  Object.entries(opts.handlerMeta ?? {}).forEach(([k, v]) =>
    Reflect.defineMetadata(k, v, handler),
  );
  Object.entries(opts.claseMeta ?? {}).forEach(([k, v]) =>
    Reflect.defineMetadata(k, v, Controlador),
  );
  return {
    getHandler: () => handler,
    getClass: () => Controlador,
    switchToHttp: () => ({ getRequest: () => ({ user: opts.user }) }),
  } as unknown as ExecutionContext;
}

const usuarioConRol = (nombre: string) => ({
  id: 'u1',
  roleUser: { role: { nombre } },
});

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('deja pasar rutas @Public aunque tengan @Roles', () => {
    const ctx = crearContexto({
      handlerMeta: { [IS_PUBLIC_KEY]: true, [ROLES_KEY]: [ROLES.SUPER_ADMIN] },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('deja pasar rutas sin metadata @Roles', () => {
    const ctx = crearContexto({ user: usuarioConRol(ROLES.TECNICO) });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('deja pasar si el rol del usuario esta en la lista', () => {
    const ctx = crearContexto({
      user: usuarioConRol(ROLES.ADMIN),
      handlerMeta: { [ROLES_KEY]: [ROLES.SUPER_ADMIN, ROLES.ADMIN] },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('responde 403 si el rol no esta en la lista', () => {
    const ctx = crearContexto({
      user: usuarioConRol(ROLES.TECNICO),
      handlerMeta: { [ROLES_KEY]: [ROLES.SUPER_ADMIN] },
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('responde 403 si el usuario no tiene rol', () => {
    const ctx = crearContexto({
      user: { id: 'u1', roleUser: undefined },
      handlerMeta: { [ROLES_KEY]: [ROLES.SUPER_ADMIN] },
    });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('el @Roles del metodo gana sobre el de la clase', () => {
    const ctx = crearContexto({
      user: usuarioConRol(ROLES.TECNICO),
      claseMeta: { [ROLES_KEY]: [ROLES.SUPER_ADMIN] },
      handlerMeta: { [ROLES_KEY]: [ROLES.TECNICO] },
    });
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
