import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClientHistory1792340754064 implements MigrationInterface {
  name = 'CreateClientHistory1792340754064';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "client_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "client_id" uuid NOT NULL, "accion" character varying(20) NOT NULL, "campo" character varying(50), "valor_anterior" text, "valor_nuevo" text, "origen" character varying(20) NOT NULL, "usuario_id" uuid, "fecha" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_154c7f67387b1dafc549f0f2631" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9c525df72a20206dae6fec3f58" ON "client_history" ("client_id", "fecha") `,
    );
    await queryRunner.query(
      `ALTER TABLE "client_history" ADD CONSTRAINT "FK_c32f1244420c04dc1deb9ab5bcf" FOREIGN KEY ("client_id") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "client_history" ADD CONSTRAINT "FK_52d790abad9837589adedf3d47e" FOREIGN KEY ("usuario_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "client_history" DROP CONSTRAINT "FK_52d790abad9837589adedf3d47e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "client_history" DROP CONSTRAINT "FK_c32f1244420c04dc1deb9ab5bcf"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9c525df72a20206dae6fec3f58"`,
    );
    await queryRunner.query(`DROP TABLE "client_history"`);
  }
}
