-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "approvalStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;
