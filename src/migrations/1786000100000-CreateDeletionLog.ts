import { MigrationInterface, QueryRunner } from 'typeorm';

// Constancia del ejercicio del derecho de supresión (art. 6 Ley 21.719).
// Guarda metadatos de la operación, nunca los datos suprimidos.
export class CreateDeletionLog1786000100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "data_deletion_log" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "entity" character varying(50) NOT NULL,
        "record_id" character varying(100) NOT NULL,
        "motivo" character varying(50) NOT NULL,
        "referencia_solicitud" character varying(255),
        "ejecutado_por" uuid,
        "alcance" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_data_deletion_log" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_deletion_log_entity" ON "data_deletion_log" ("entity")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_deletion_log_created_at" ON "data_deletion_log" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "data_deletion_log"`);
  }
}
