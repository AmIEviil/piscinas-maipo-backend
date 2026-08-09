import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { AccessAudit, AuditAction } from './entities/access-audit.entity';
import { AUDIT_ENTITY_KEY } from './audit.decorator';

type AuditedRequest = Request & {
  user?: { id?: string; user_name?: string };
};

const ACTION_BY_METHOD: Record<string, AuditAction> = {
  GET: 'READ',
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(AccessAudit)
    private readonly auditRepo: Repository<AccessAudit>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const entity = this.reflector.getAllAndOverride<string>(AUDIT_ENTITY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!entity) return next.handle();

    const req = context.switchToHttp().getRequest<AuditedRequest>();
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        // Se registra despues de que la operacion tuvo exito y sin esperar la
        // escritura: un fallo al auditar no debe hacer fallar la peticion,
        // pero si debe quedar en el log del servidor.
        void this.record(entity, req, res.statusCode);
      }),
    );
  }

  private async record(
    entity: string,
    req: AuditedRequest,
    statusCode: number,
  ): Promise<void> {
    try {
      const params = req.params ?? {};
      const recordId =
        params.id ?? params.parentId ?? params.placa ?? params.fileId ?? null;

      await this.auditRepo.insert({
        user_id: req.user?.id ?? null,
        user_name: req.user?.user_name ?? null,
        action: ACTION_BY_METHOD[req.method] ?? 'READ',
        entity,
        record_id: recordId ? String(recordId).slice(0, 100) : null,
        method: req.method,
        // Solo la ruta: la query puede contener filtros con nombre o telefono.
        path: req.path.slice(0, 255),
        status_code: statusCode,
        ip: req.ip ?? null,
        user_agent: req.get('user-agent')?.slice(0, 255) ?? null,
      });
    } catch (error) {
      this.logger.error(
        `No se pudo registrar la auditoría de acceso (${entity})`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
