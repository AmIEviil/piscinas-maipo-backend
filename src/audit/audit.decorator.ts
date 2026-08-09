import { SetMetadata } from '@nestjs/common';

export const AUDIT_ENTITY_KEY = 'auditEntity';

/**
 * Marca un controlador (o un metodo) como manipulador de datos personales.
 * El AuditInterceptor solo registra las rutas asi marcadas: la auditoria es
 * explicita para que se pueda revisar que esta cubierto y que no.
 *
 * @param entity Tipo de dato personal afectado (Client, Employee, User, ...).
 */
export const Audit = (entity: string) => SetMetadata(AUDIT_ENTITY_KEY, entity);
