import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser1758426946899 implements MigrationInterface {
  name = 'UpdateUser1758426946899';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "user_name" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "first_name" text NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "last_name" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "last_login" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "session_closed_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "failed_attempts" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "user" ADD "blocked_until" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "user" ADD "refresh_token" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refresh_token"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "blocked_until"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "failed_attempts"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "session_closed_at"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_login"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isActive"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_name"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "name" character varying NOT NULL`,
    );
  }
}
