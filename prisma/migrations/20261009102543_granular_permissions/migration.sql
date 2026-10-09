-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MemberRole" ADD VALUE 'ADMIN';
ALTER TYPE "MemberRole" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Existing editors keep exactly what they could do before.
UPDATE "memberships"
SET "permissions" = ARRAY['brandkits:manage','footage:upload','footage:edit','footage:delete','videos:manage','ai:use','render:start']
WHERE "role" = 'EDITOR';

UPDATE "invitations"
SET "permissions" = ARRAY['brandkits:manage','footage:upload','footage:edit','footage:delete','videos:manage','ai:use','render:start']
WHERE "role" = 'EDITOR';
