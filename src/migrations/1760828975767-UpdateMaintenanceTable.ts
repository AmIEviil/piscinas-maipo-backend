import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMaintenanceTable1760828975767 implements MigrationInterface {
  name = 'UpdateMaintenanceTable1760828975767';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "maintenance" ALTER COLUMN "cant_bidones" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "maintenance" ALTER COLUMN "cant_bidones" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "maintenance" ALTER COLUMN "cant_tabletas" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "maintenance" ALTER COLUMN "cant_tabletas" SET DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "maintenance" ALTER COLUMN "cant_tabletas" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "maintenance" ALTER COLUMN "cant_tabletas" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "maintenance" ALTER COLUMN "cant_bidones" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "maintenance" ALTER COLUMN "cant_bidones" SET NOT NULL`,
    );
  }
}
