import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser31758429005448 implements MigrationInterface {
  name = 'UpdateUser31758429005448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombre" text NOT NULL, CONSTRAINT "UQ_a5be7aa67e759e347b1c6464e10" UNIQUE ("nombre"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "role_users" DROP COLUMN "nombre"`);
    await queryRunner.query(`ALTER TABLE "role_users" ADD "role_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "role_users" DROP CONSTRAINT "PK_6b4286b64efea084922d1c709bd"`,
    );
    await queryRunner.query(`ALTER TABLE "role_users" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "role_users" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_users" ADD CONSTRAINT "PK_6b4286b64efea084922d1c709bd" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_users" ADD CONSTRAINT "FK_790a8ca58c37fd1f31944ae65e2" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_users" DROP CONSTRAINT "FK_790a8ca58c37fd1f31944ae65e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_users" DROP CONSTRAINT "PK_6b4286b64efea084922d1c709bd"`,
    );
    await queryRunner.query(`ALTER TABLE "role_users" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "role_users" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_users" ADD CONSTRAINT "PK_6b4286b64efea084922d1c709bd" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "role_users" DROP COLUMN "role_id"`);
    await queryRunner.query(
      `ALTER TABLE "role_users" ADD "nombre" text NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
