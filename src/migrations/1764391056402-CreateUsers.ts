import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1764391056402 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO "user" (
        email, password, user_name, first_name, last_name, "isActive", last_login, session_closed_at, failed_attempts, blocked_until, refresh_token
        ) VALUES
          ('leylayom2@gmail.com', '$2a$12$YQwWJk8URIpqblP6wKOP6.4v.Z1cGUqRUzCWlGhlX6Qz18YtfeBzy', 'leylayom', 'Liliana', 'Otarola', true, NULL, NULL, 0, NULL, NULL)
    `);

    await queryRunner.query(`
        INSERT INTO "role_users" (user_id, role_id) VALUES
          (
            (SELECT id FROM "user" WHERE email = 'leylayom2@gmail.com'),
            (SELECT id FROM "roles" WHERE nombre = 'Admin')
          )
    `);

    await queryRunner.query(`
        INSERT INTO "user" (
        email, password, user_name, first_name, last_name, "isActive", last_login, session_closed_at, failed_attempts, blocked_until, refresh_token
        ) VALUES
          ('piscinaselmaipo@gmail.com', '$2a$12$YQwWJk8URIpqblP6wKOP6.4v.Z1cGUqRUzCWlGhlX6Qz18YtfeBzy', 'carloscaro', 'Carlos', 'Caro', true, NULL, NULL, 0, NULL, NULL)
    `);

    await queryRunner.query(`
        INSERT INTO "role_users" (user_id, role_id) VALUES
          (
            (SELECT id FROM "user" WHERE email = 'piscinaselmaipo@gmail.com'),
            (SELECT id FROM "roles" WHERE nombre = 'Admin')
          )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DELETE FROM "role_users" WHERE user_id = (SELECT id FROM "user" WHERE email = 'leylayom2@gmail.com')
      `);
    await queryRunner.query(`
        DELETE FROM "user" WHERE email = "leylayom2@gmail.com"
    `);

    await queryRunner.query(`
        DELETE FROM "role_users" WHERE user_id = (SELECT id FROM "user" WHERE email = 'piscinaselmaipo@gmail.com')
    `);

    await queryRunner.query(`
        DELETE FROM "user" WHERE email = "piscinaselmaipo@gmail.com"
    `);
  }
}
