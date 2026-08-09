import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Restringe un endpoint (o controlador) a los roles indicados.
// Sin @Roles => solo requiere JWT válido (guard global).
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
