import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Deja utilizable la periodicidad de visitas.
 *
 * La tabla `maintenance_temporality` y el FK `client.frecuencia_mantencion_id`
 * ya existian, pero las tres filas se habian insertado a mano contra la base
 * de produccion: no habia ninguna migracion que las creara, asi que un entorno
 * nuevo levantaba con la tabla vacia y `CreateClients1764208773461` fallaba con
 * violacion de FK. Los uuid son los mismos que ya estan en produccion para que
 * esta migracion sea un no-op ahi.
 */
export class SeedFrecuenciasMantencion1788470000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO maintenance_temporality (id, nombre) VALUES
        ('9e317a26-2a75-4983-b92f-cb7e6f8c79a2', 'Semanal'),
        ('c82a8019-9c38-48b8-aa1d-58156cdf6cf6', 'Quincenal'),
        ('3ec75250-af6e-4eef-a2e9-ef78baf2a828', 'Mensual')
      ON CONFLICT (id) DO NOTHING;
    `);

    await queryRunner.query(`
      UPDATE client
      SET frecuencia_mantencion_id = '9e317a26-2a75-4983-b92f-cb7e6f8c79a2'
      WHERE frecuencia_mantencion_id IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Las filas no se borran: hay clientes apuntando a ellas por FK, y el
    // valor por defecto asignado arriba es indistinguible del que ya tenian
    // los clientes existentes.
    await queryRunner.query(`SELECT 1;`);
  }
}
