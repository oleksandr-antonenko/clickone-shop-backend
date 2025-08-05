-- Fix permissions table structure
-- Drop the table if it exists
DROP TABLE IF EXISTS "permissions" CASCADE;

-- Create the permissions table with correct structure
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
);

-- Create indexes
CREATE INDEX "IDX_permissions_adminId" ON "permissions" ("adminId");

-- Add foreign key constraint
ALTER TABLE "permissions" 
ADD CONSTRAINT "FK_permissions_admin" 
FOREIGN KEY ("adminId") 
REFERENCES "admins"("id") 
ON DELETE CASCADE; 