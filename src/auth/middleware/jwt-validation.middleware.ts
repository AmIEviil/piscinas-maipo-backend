/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtValidationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Use originalUrl instead of path to get the full route
    const routePath = req.originalUrl.split('?')[0]; // Remove query parameters

    // Skip validation for public routes
    if (this.isPublicRoute(routePath)) {
      return next();
    }

    // Skip validation for health check and other system endpoints
    if (this.isSystemRoute(routePath)) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'No token provided',
        error: 'Unauthorized',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify the JWT token
      const payload = this.jwtService.verify(token);

      // Extract user information from token
      const { email } = payload;

      if (!email) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'Invalid token payload',
          error: 'Unauthorized',
        });
      }

      // Look up user in database with role information
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['roleUser', 'roleUser.role', 'roleUser.area'],
      });

      if (!user) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'User not found',
          error: 'Unauthorized',
        });
      }

      if (!user.isActive) {
        throw new UnauthorizedException({
          statusCode: 401,
          message: 'User account is not active',
          error: 'Unauthorized',
        });
      }

      // Add user information to request object including role
      req['user'] = {
        id: user.id,
        email: user.email,
        user_name: user.user_name,
        isActive: user.isActive,
        nombre: user.user_name,
        role: user.roleUser?.role?.nombre || null,
      };

      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid or expired token',
        error: 'Unauthorized',
      });
    }
  }

  private isPublicRoute(path: string): boolean {
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/request-password-reset',
      '/api/auth/refreshToken',
      '/api/auth/reset-password',
      '/api/auth/setLogout/:id',
      '/api/auth/configure/:id',
      '/api/auth/verify-reset-token',
    ];

    const normalize = (p: string) =>
      (p.split('?')[0].replace(/\/+$/, '') || '/').replace(
        /^\/api\/v\d+\//,
        '/api/',
      );

    const routeToRegex = (route: string) => {
      const r = route.replace(/\/+$/, '').replace(/:[^/]+/g, '[^/]+');
      return new RegExp(`^${r}(?:/)?$`);
    };

    const p = normalize(path);
    return publicRoutes.some((route) => routeToRegex(route).test(p));
  }

  private isSystemRoute(path: string): boolean {
    const systemRoutes = ['/api/health', '/api/status', '/favicon.ico'];

    return systemRoutes.some((route) => path.startsWith(route));
  }
}
