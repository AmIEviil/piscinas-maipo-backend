import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoles1763087367490 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "roles" ("nombre") VALUES ('Admin')`);
    await queryRunner.query(
      `INSERT INTO "roles" ("nombre") VALUES ('Cliente')`,
    );
    await queryRunner.query(
      `INSERT INTO "roles" ("nombre") VALUES ('Tecnico')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "roles" WHERE "nombre" = 'Admin'`);
    await queryRunner.query(`DELETE FROM "roles" WHERE "nombre" = 'Cliente'`);
    await queryRunner.query(`DELETE FROM "roles" WHERE "nombre" = 'Tecnico'`);
  }
}
