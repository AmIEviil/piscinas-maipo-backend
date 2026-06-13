import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStockMinimoToProduct1781385571974
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "stock_minimo" integer DEFAULT 5`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN IF EXISTS "stock_minimo"`,
    );
  }
}
