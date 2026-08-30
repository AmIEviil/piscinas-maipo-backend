import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddComprobantePagoMantenciones1787940009163
  implements MigrationInterface
{
  name = 'AddComprobantePagoMantenciones1787940009163';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "comprobante_pago_mantenciones" ("comprobante_pago_id" uuid NOT NULL, "maintenance_id" uuid NOT NULL, CONSTRAINT "PK_c0421baf015e74786f4dbdd0b17" PRIMARY KEY ("comprobante_pago_id", "maintenance_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_98093e2c66ed143b54317c41e5" ON "comprobante_pago_mantenciones" ("comprobante_pago_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d718ab08705074a760abcf8303" ON "comprobante_pago_mantenciones" ("maintenance_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "comprobante_pago_mantenciones" ADD CONSTRAINT "FK_98093e2c66ed143b54317c41e5a" FOREIGN KEY ("comprobante_pago_id") REFERENCES "comprobante_pago"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "comprobante_pago_mantenciones" ADD CONSTRAINT "FK_d718ab08705074a760abcf83032" FOREIGN KEY ("maintenance_id") REFERENCES "maintenance"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comprobante_pago_mantenciones" DROP CONSTRAINT "FK_d718ab08705074a760abcf83032"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comprobante_pago_mantenciones" DROP CONSTRAINT "FK_98093e2c66ed143b54317c41e5a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d718ab08705074a760abcf8303"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_98093e2c66ed143b54317c41e5"`,
    );
    await queryRunner.query(`DROP TABLE "comprobante_pago_mantenciones"`);
  }
}
