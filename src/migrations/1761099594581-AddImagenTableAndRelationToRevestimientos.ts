import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImagenTableAndRelationToRevestimientos1761099594581 implements MigrationInterface {
    name = 'AddImagenTableAndRelationToRevestimientos1761099594581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "revestimiento_imagen" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "publicId" character varying NOT NULL, "revestimiento_id" integer, CONSTRAINT "PK_dae5838e03cde2f7f83e670ac96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "revestimiento_imagen" ADD CONSTRAINT "FK_1bdcf26e01f958e25eba492a9a1" FOREIGN KEY ("revestimiento_id") REFERENCES "revestimiento"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "revestimiento_imagen" DROP CONSTRAINT "FK_1bdcf26e01f958e25eba492a9a1"`);
        await queryRunner.query(`DROP TABLE "revestimiento_imagen"`);
    }

}
