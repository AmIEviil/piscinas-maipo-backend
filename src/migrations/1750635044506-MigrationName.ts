import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationName1750635044506 implements MigrationInterface {
    name = 'MigrationName1750635044506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product_type" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, CONSTRAINT "PK_e0843930fbb8854fe36ca39dae1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product" ADD "id_tipo" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_a2c7ef99e143e29c0b3daf08e71" FOREIGN KEY ("id_tipo") REFERENCES "product_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_a2c7ef99e143e29c0b3daf08e71"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "id_tipo"`);
        await queryRunner.query(`DROP TABLE "product_type"`);
    }

}
