import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPermissionsTable1700000000000 implements MigrationInterface {
  name = 'FixPermissionsTable1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('permissions');
    
    if (tableExists) {
      await queryRunner.query(`DROP TABLE "permissions" CASCADE`);
    }
    
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "adminId" uuid NOT NULL,
        "resource" "public"."ResourceType" NOT NULL,
        "actions" "public"."PermissionAction" NOT NULL,
        "granted" boolean NOT NULL DEFAULT false,
        "notes" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_permissions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_permissions_admin_resource_action" UNIQUE ("adminId", "resource", "actions")
      )
    `);
    
    await queryRunner.query(`CREATE INDEX "IDX_permissions_adminId" ON "permissions" ("adminId")`);
    
    await queryRunner.query(`
      ALTER TABLE "permissions" 
      ADD CONSTRAINT "FK_permissions_admin" 
      FOREIGN KEY ("adminId") 
      REFERENCES "admins"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "permissions" CASCADE`);
  }
} 