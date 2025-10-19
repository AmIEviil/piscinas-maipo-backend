import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser21758427178314 implements MigrationInterface {
  name = 'UpdateUser21758427178314';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_users" DROP CONSTRAINT "FK_1dc3ce23874f906d8306186671a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_users" DROP CONSTRAINT "REL_1dc3ce23874f906d8306186671"`,
    );
    await queryRunner.query(`ALTER TABLE "role_users" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "role_users" ADD "user_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "role_users" ADD CONSTRAINT "UQ_1dc3ce23874f906d8306186671a" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_users" ADD CONSTRAINT "FK_1dc3ce23874f906d8306186671a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_users" DROP CONSTRAINT "FK_1dc3ce23874f906d8306186671a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "PK_cace4a159ff9f2512dd42373760"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "user" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_users" DROP CONSTRAINT "UQ_1dc3ce23874f906d8306186671a"`,
    );
    await queryRunner.query(`ALTER TABLE "role_users" DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE "role_users" ADD "user_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "role_users" ADD CONSTRAINT "REL_1dc3ce23874f906d8306186671" UNIQUE ("user_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_users" ADD CONSTRAINT "FK_1dc3ce23874f906d8306186671a" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
