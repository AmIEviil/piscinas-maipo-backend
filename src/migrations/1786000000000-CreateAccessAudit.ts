import { MigrationInterface, QueryRunner } from 'typeorm';

// Registro de accesos a datos personales (Ley 21.719, principio de
// responsabilidad: hay que poder acreditar quien accedio a que y cuando).
export class CreateAccessAudit1786000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Las tablas existentes se crearon con `synchronize`, que usa
    // uuid_generate_v4(); la extension puede no estar declarada en ninguna
    // migracion previa.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "access_audit" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "user_name" character varying(50),
        "action" character varying(50) NOT NULL,
        "entity" character varying(50) NOT NULL,
        "record_id" character varying(100),
        "method" character varying(10) NOT NULL,
        "path" character varying(255) NOT NULL,
        "status_code" integer NOT NULL,
        "ip" character varying(64),
        "user_agent" character varying(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_access_audit" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_access_audit_user_id" ON "access_audit" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_access_audit_entity" ON "access_audit" ("entity")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_access_audit_created_at" ON "access_audit" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "access_audit"`);
  }
}
