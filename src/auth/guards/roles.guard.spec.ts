import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { RoleUser } from '../../users/entities/role-user.entity';
import { RolesGuard } from './roles.guard';
import { ROLES } from '../constants/roles';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Contexto de ejecución falso con un user opcional.
const ctx = (user?: { id: string }) =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

const makeGuard = (
  opts: {
    required?: string[];
    roleNames?: string[];
    isPublic?: boolean;
  } = {},
) => {
  const reflector = {
    getAllAndOverride: (key: string) => {
      if (key === IS_PUBLIC_KEY) return opts.isPublic;
      if (key === ROLES_KEY) return opts.required;
      return undefined;
    },
  } as unknown as Reflector;
  const repo = {
    find: () =>
      Promise.resolve(
        (opts.roleNames ?? []).map((nombre) => ({ role: { nombre } })),
      ),
  } as unknown as Repository<RoleUser>;
  return new RolesGuard(reflector, repo);
};

describe('RolesGuard', () => {
  it('permite si el rol del usuario está en la lista', async () => {
    const guard = makeGuard({
      required: [ROLES.ADMIN],
      roleNames: [ROLES.ADMIN],
    });
    await expect(guard.canActivate(ctx({ id: '1' }))).resolves.toBe(true);
  });

  it('rechaza si el rol no está permitido', async () => {
    const guard = makeGuard({
      required: [ROLES.SUPER_ADMIN],
      roleNames: [ROLES.TEC],
    });
    await expect(guard.canActivate(ctx({ id: '1' }))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rechaza si no hay usuario autenticado', async () => {
    const guard = makeGuard({ required: [ROLES.ADMIN] });
    await expect(guard.canActivate(ctx(undefined))).rejects.toThrow(
      ForbiddenException,
    );
  });

  // Fallo cerrado: un endpoint nuevo al que se le olvide el @Roles queda
  // denegado en vez de quedar abierto a cualquier usuario autenticado.
  it('rechaza si el endpoint no declara @Roles', async () => {
    const guard = makeGuard({ roleNames: [ROLES.SUPER_ADMIN] });
    await expect(guard.canActivate(ctx({ id: '1' }))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rechaza si @Roles está declarado pero vacío', async () => {
    const guard = makeGuard({ required: [], roleNames: [ROLES.SUPER_ADMIN] });
    await expect(guard.canActivate(ctx({ id: '1' }))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('permite las rutas @Public() sin usuario', async () => {
    const guard = makeGuard({ isPublic: true });
    await expect(guard.canActivate(ctx(undefined))).resolves.toBe(true);
  });

  // Con findOne, un usuario con varias filas en role_user obtenía un rol
  // efectivo indeterminado según el orden que devolviera la base de datos.
  it('permite si cualquiera de los roles del usuario está autorizado', async () => {
    const guard = makeGuard({
      required: [ROLES.ADMIN],
      roleNames: [ROLES.TEC, ROLES.ADMIN],
    });
    await expect(guard.canActivate(ctx({ id: '1' }))).resolves.toBe(true);
  });
});
