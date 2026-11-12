import { ForbiddenException } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { ROLES, RolNombre } from './roles.constants';

export function rolDeUsuario(user: User | undefined): RolNombre | null {
  return (user?.roleUser?.role?.nombre as RolNombre | undefined) ?? null;
}

// Para rutas donde cada usuario solo puede tocar su propio registro
export function assertSelfOrSuperadmin(
  user: User | undefined,
  id: string,
): void {
  if (user?.id === id) return;
  if (rolDeUsuario(user) === ROLES.SUPER_ADMIN) return;
  throw new ForbiddenException('No tienes permisos para esta accion');
}
