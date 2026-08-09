// Nombres de rol tal como existen en la tabla `roles` (columna nombre).
export const ROLES = {
  SUPER_ADMIN: 'Superadmin',
  ADMIN: 'Admin',
  TEC: 'Tecnico',
  CLIENT: 'Cliente',
} as const;

// Agrupaciones usadas en los controladores. RolesGuard deniega por defecto:
// todo controlador debe declarar explicitamente uno de estos grupos.
//
// El rol CLIENT no aparece en ningun grupo a proposito. Existe sembrado en la
// tabla `roles` pero no tiene ninguna vista asignada en el frontend
// (`constant/routes.ts` nunca lo incluye en `canAccess`). Antes, al no exigir
// rol, un usuario Cliente podia leer el listado completo de clientes,
// mantenciones, reparaciones y archivos. Dar acceso por titular a un cliente
// requiere primero una relacion User -> Client que hoy no existe en el modelo.
export const ROLE_GROUPS = {
  /** Operacion diaria: incluye a los tecnicos en terreno. */
  STAFF: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEC],
  /** Gestion: datos de personas, dinero y documentos. */
  MANAGEMENT: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  /** Operaciones sobre el esquema o la configuracion del sistema. */
  SUPER_ONLY: [ROLES.SUPER_ADMIN],
} as const;
