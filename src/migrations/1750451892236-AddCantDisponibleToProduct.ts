import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCantDisponibleToProduct1750451892236 implements MigrationInterface {
    name = 'AddCantDisponibleToProduct1750451892236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "repair" ("id" SERIAL NOT NULL, "fechaTrabajo" date NOT NULL, "detalles" text NOT NULL, "materiales" text NOT NULL, "garantia" text NOT NULL, "client_id" integer, CONSTRAINT "PK_ff45c30ef282d3ffc3e3c2061c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "extra_revestimiento" ("id" SERIAL NOT NULL, "nombre" character varying NOT NULL, "valor" integer NOT NULL, "detalle" text NOT NULL, "revestimiento_id" integer, CONSTRAINT "PK_3c946b38707c2f2db036111415d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "revestimiento" ("id" SERIAL NOT NULL, "fechaPropuesta" date NOT NULL, "fechaTrabajo" date NOT NULL, "largoPiscina" double precision NOT NULL, "anchoPiscina" double precision NOT NULL, "profundidadMin" double precision NOT NULL, "profundidadMax" double precision NOT NULL, "profundidadAvg" double precision NOT NULL, "detalles" text NOT NULL, "garantia" text NOT NULL, "valor" integer NOT NULL, "client_id" integer, CONSTRAINT "PK_e5ccf4d541066e50e3b7220351f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product" ADD "cant_disponible" integer DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "valor_unitario"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "valor_unitario" integer DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "fecha_ingreso"`);
        await queryRunner.query(`ALTER TABLE "client" ADD "fecha_ingreso" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "client" ALTER COLUMN "tipo_piscina" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "valor_mantencion"`);
        await queryRunner.query(`ALTER TABLE "client" ADD "valor_mantencion" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "repair" ADD CONSTRAINT "FK_d0ee9e238b3e3120405937f6f26" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "extra_revestimiento" ADD CONSTRAINT "FK_39c34a72a70bb6c7c042229eb8f" FOREIGN KEY ("revestimiento_id") REFERENCES "revestimiento"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "revestimiento" ADD CONSTRAINT "FK_95c783f026e09cf304f7ff2a4d2" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "revestimiento" DROP CONSTRAINT "FK_95c783f026e09cf304f7ff2a4d2"`);
        await queryRunner.query(`ALTER TABLE "extra_revestimiento" DROP CONSTRAINT "FK_39c34a72a70bb6c7c042229eb8f"`);
        await queryRunner.query(`ALTER TABLE "repair" DROP CONSTRAINT "FK_d0ee9e238b3e3120405937f6f26"`);
        await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "valor_mantencion"`);
        await queryRunner.query(`ALTER TABLE "client" ADD "valor_mantencion" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "client" ALTER COLUMN "tipo_piscina" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "client" DROP COLUMN "fecha_ingreso"`);
        await queryRunner.query(`ALTER TABLE "client" ADD "fecha_ingreso" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "valor_unitario"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "valor_unitario" numeric NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "cant_disponible"`);
        await queryRunner.query(`DROP TABLE "revestimiento"`);
        await queryRunner.query(`DROP TABLE "extra_revestimiento"`);
        await queryRunner.query(`DROP TABLE "repair"`);
    }

}
