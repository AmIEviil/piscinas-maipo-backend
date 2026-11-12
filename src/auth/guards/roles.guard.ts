import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolNombre } from '../roles/roles.constants';
import { rolDeUsuario } from '../roles/roles.utils';
import { AuthenticatedRequest } from '../../types/authenticated-request';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      targets,
    );
    if (isPublic) return true;

    // El metodo gana sobre la clase; sin @Roles basta con estar autenticado
    const roles = this.reflector.getAllAndOverride<RolNombre[]>(
      ROLES_KEY,
      targets,
    );
    if (!roles || roles.length === 0) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const rol = rolDeUsuario(request.user);

    if (!rol || !roles.includes(rol)) {
      throw new ForbiddenException('No tienes permisos para esta accion');
    }
    return true;
  }
}
