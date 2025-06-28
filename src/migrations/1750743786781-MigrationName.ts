import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationName1750743786781 implements MigrationInterface {
    name = 'MigrationName1750743786781'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "maintenance_temporality" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, CONSTRAINT "PK_364d1f9499d0efa2d3599526f26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "maintenance" ADD "valor_mantencion" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "client" ADD "frequencia_mantencion_id" integer`);
        await queryRunner.query(`ALTER TABLE "client" ADD CONSTRAINT "FK_6381ca7335410db607218548991" FOREIGN KEY ("frequencia_mantencion_id") REFERENCES "maintenance_temporality"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client" DROP CONSTRAINT "FK_6381ca7335410db607218548991"`);
        await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "frequencia_mantencion_id"`);
        await queryRunner.query(`ALTER TABLE "maintenance" DROP COLUMN "valor_mantencion"`);
        await queryRunner.query(`DROP TABLE "maintenance_temporality"`);
    }

}
