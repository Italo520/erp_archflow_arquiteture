-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "address" TEXT,
ADD COLUMN     "delivery_date" TIMESTAMP(3),
ADD COLUMN     "project_type" TEXT,
ADD COLUMN     "start_date" TIMESTAMP(3),
ADD COLUMN     "total_area" DOUBLE PRECISION;
