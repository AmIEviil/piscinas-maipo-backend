import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Control de gobernanza automatizado.
 *
 * Las revisiones manuales de "ningún controlador sin @Roles" se olvidan. Este
 * test recorre el código y falla si aparece un controlador que no declara
 * quién puede llamarlo, o uno que toca datos personales y no queda auditado.
 *
 * RolesGuard ya deniega por defecto, así que un olvido no abre un agujero:
 * devuelve 403. Pero eso se descubre en producción, con el endpoint caído.
 * Aquí se descubre antes de mezclar el cambio.
 */

const SRC = join(__dirname, '..');

const listarArchivos = (dir: string): string[] =>
  readdirSync(dir).flatMap((entrada) => {
    const ruta = join(dir, entrada);
    return statSync(ruta).isDirectory() ? listarArchivos(ruta) : [ruta];
  });

const controladores = listarArchivos(SRC)
  .filter((f) => f.endsWith('.controller.ts') && !f.endsWith('.spec.ts'))
  .map((ruta) => ({
    ruta,
    nombre: ruta.slice(SRC.length + 1).replace(/\\/g, '/'),
    fuente: readFileSync(ruta, 'utf8'),
  }));

/**
 * Controladores cuyas rutas manipulan datos personales y por tanto deben
 * declarar @Audit. Ampliar esta lista al añadir un dominio con datos de
 * personas.
 */
const CON_DATOS_PERSONALES = [
  'clients/clients.controller.ts',
  'empleados/empleados.controller.ts',
  'users/users.controller.ts',
  'pagos/pagos.controller.ts',
  'uploaded-files/uploaded-files.controller.ts',
  'google-drive/google-drive.controller.ts',
  'pdf/pdf.controller.ts',
  'arcop/arcop.controller.ts',
];

describe('Cobertura de control de acceso en los controladores', () => {
  it('encuentra los controladores del proyecto', () => {
    expect(controladores.length).toBeGreaterThan(10);
  });

  it.each(controladores.map((c) => [c.nombre, c] as const))(
    '%s declara @Roles o marca sus rutas como @Public',
    (_nombre, controlador) => {
      const declaraRoles = /@Roles\(/.test(controlador.fuente);
      const declaraPublic = /@Public\(\)/.test(controlador.fuente);

      expect(declaraRoles || declaraPublic).toBe(true);
    },
  );

  it.each(CON_DATOS_PERSONALES)(
    '%s registra los accesos con @Audit',
    (ruta) => {
      const controlador = controladores.find((c) => c.nombre === ruta);

      // Si el archivo se renombró o se movió, hay que actualizar la lista: es
      // preferible que falle a que deje de comprobarse en silencio.
      expect(controlador).toBeDefined();
      expect(/@Audit\(/.test(controlador!.fuente)).toBe(true);
    },
  );

  // El rol Cliente no tiene ninguna vista asignada en el frontend
  // (`constant/routes.ts` nunca lo incluye en canAccess) y no existe relación
  // User -> Client que permita acotar por titular. Concederlo en un endpoint
  // daría acceso a la cartera completa, no a los datos propios.
  it.each(controladores.map((c) => [c.nombre, c] as const))(
    '%s no concede acceso al rol Cliente',
    (_nombre, controlador) => {
      expect(controlador.fuente).not.toMatch(/ROLES\.CLIENT\b/);
    },
  );
});
