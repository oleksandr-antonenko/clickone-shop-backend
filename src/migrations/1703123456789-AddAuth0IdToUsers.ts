import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAuth0IdToUsers1703123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'auth0Id',
        type: 'varchar',
        isNullable: true,
        isUnique: true,
      }),
    );

    await queryRunner.query(
      'CREATE INDEX "IDX_users_auth0Id" ON "users" ("auth0Id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_users_auth0Id');
    await queryRunner.dropColumn('users', 'auth0Id');
  }
} 
 