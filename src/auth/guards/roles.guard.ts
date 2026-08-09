import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleUser } from '../../users/entities/role-user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

interface RequestWithUser {
  user?: { id?: string };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(RoleUser)
    private readonly roleUserRepo: Repository<RoleUser>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Las rutas @Public() no pasan por el guard de JWT, asi que tampoco tienen
    // usuario contra el que evaluar roles.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Denegar por defecto. Antes, un endpoint sin @Roles quedaba abierto a
    // cualquier usuario autenticado, incluido el rol Cliente: asi es como
    // quedaron expuestos los listados completos de clientes, mantenciones,
    // reparaciones y archivos. Ahora un endpoint nuevo sin @Roles falla
    // cerrado y el descuido se detecta en la primera peticion, no en una
    // auditoria.
    if (!required || required.length === 0) {
      throw new ForbiddenException('No tiene permisos para esta acción');
    }

    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('No autorizado');

    // Se evaluan todos los roles del usuario: con findOne, un usuario con mas
    // de una fila en role_user obtenia un rol efectivo indeterminado.
    const roleUsers = await this.roleUserRepo.find({
      where: { user: { id: userId } },
    });
    const roleNames = roleUsers
      .map((ru) => ru.role?.nombre)
      .filter((nombre): nombre is string => Boolean(nombre));

    if (!roleNames.some((nombre) => required.includes(nombre))) {
      throw new ForbiddenException('No tiene permisos para esta acción');
    }
    return true;
  }
}
