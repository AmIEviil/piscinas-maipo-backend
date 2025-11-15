// import {
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Injectable,
// } from '@nestjs/common';

// @Injectable()
// export class MigrationAccessGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest();
//     const user = request.user;

//     if (!user) {
//       throw new ForbiddenException('No autorizado');
//     }
//     console.log('Usuario en MigrationAccessGuard:', user);
//     console.log('Usuario en MigrationAccessGuard:', user.roleUser);

//     const hasRole = user.roleUser.role.nombre === 'Soporte';
//     const inArea = user.roleUser.area.nombre === 'Kabeli';

//     if (!hasRole || !inArea) {
//       throw new ForbiddenException(
//         'Acceso denegado: se requiere rol Soporte y área Kabeli',
//       );
//     }

//     return true;
//   }
// }
