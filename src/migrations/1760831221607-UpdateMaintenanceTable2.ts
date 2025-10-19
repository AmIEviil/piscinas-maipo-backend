import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMaintenanceTable21760831221607 implements MigrationInterface {
    name = 'UpdateMaintenanceTable21760831221607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenance" DROP COLUMN "cant_bidones"`);
        await queryRunner.query(`ALTER TABLE "maintenance" DROP COLUMN "cant_tabletas"`);
        await queryRunner.query(`ALTER TABLE "maintenance" DROP COLUMN "otros"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "maintenance" ADD "otros" text`);
        await queryRunner.query(`ALTER TABLE "maintenance" ADD "cant_tabletas" integer DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "maintenance" ADD "cant_bidones" integer DEFAULT '0'`);
    }

}
