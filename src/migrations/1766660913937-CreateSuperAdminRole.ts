import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSuperAdminRole1766660913937 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO roles (nombre)
            VALUES ('Superadmin')
    `);

    await queryRunner.query(`
            update role_users 
            set role_id = (select id from public."roles" where nombre = 'Superadmin')
            where user_id = (select id from public."user" where email like 'gcarootarola@gmail.com')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM public."roles" 
            WHERE nombre = 'Superadmin'
    `);
    await queryRunner.query(`
            update role_users 
            set role_id = (select id from public."roles" where nombre = 'Admin')
            where user_id = (select id from public."user" where email = 'gcarootarola@gmail.com')
    `);
  }
}
