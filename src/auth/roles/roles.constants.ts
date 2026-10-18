// Nombres exactos de los roles guardados en la tabla roles
export const ROLES = {
  SUPER_ADMIN: 'Superadmin',
  ADMIN: 'Admin',
  TECNICO: 'Tecnico',
  CLIENTE: 'Cliente',
} as const;

export type RolNombre = (typeof ROLES)[keyof typeof ROLES];
