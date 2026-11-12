import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoles1763087367490 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // En produccion los tres roles ya existen pero esta migracion nunca quedo
    // registrada en `migrations`; ON CONFLICT la deja como no-op ahi para que
    // migrationsRun no choque con el UNIQUE de `nombre` y bloquee el arranque.
    await queryRunner.query(
      `INSERT INTO "roles" ("nombre") VALUES ('Admin'), ('Cliente'), ('Tecnico') ON CONFLICT ("nombre") DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "roles" WHERE "nombre" = 'Admin'`);
    await queryRunner.query(`DELETE FROM "roles" WHERE "nombre" = 'Cliente'`);
    await queryRunner.query(`DELETE FROM "roles" WHERE "nombre" = 'Tecnico'`);
  }
}
