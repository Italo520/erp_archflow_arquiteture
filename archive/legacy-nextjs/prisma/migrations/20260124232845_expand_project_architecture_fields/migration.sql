-- CreateEnum
CREATE TYPE "ArchitecturalStyle" AS ENUM ('MODERNISTA', 'CLASSICO', 'CONTEMPORANEO', 'ORGANICO', 'MINIMALISTA', 'INDUSTRIAL', 'RUSTICO', 'OTHER');

-- CreateEnum
CREATE TYPE "ConstructionType" AS ENUM ('ALVENARIA', 'STEEL_FRAME', 'CONCRETO_ARMADO', 'MADEIRA', 'HIBRIDA', 'DRYWALL', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectVisibility" AS ENUM ('PRIVATE', 'TEAM', 'CLIENT', 'PUBLIC');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "actual_cost" DECIMAL(12,2),
ADD COLUMN     "actual_end_date" TIMESTAMP(3),
ADD COLUMN     "architectural_style" "ArchitecturalStyle",
ADD COLUMN     "attached_documents" JSONB,
ADD COLUMN     "construction_type" "ConstructionType",
ADD COLUMN     "environmental_license_required" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estimated_end_date" TIMESTAMP(3),
ADD COLUMN     "has_basement" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_garage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "landscaping_area" DOUBLE PRECISION,
ADD COLUMN     "number_of_floors" INTEGER,
ADD COLUMN     "number_of_rooms" INTEGER,
ADD COLUMN     "parking_spots" INTEGER,
ADD COLUMN     "phases" JSONB,
ADD COLUMN     "planned_cost" DECIMAL(12,2),
ADD COLUMN     "project_tags" TEXT[],
ADD COLUMN     "visibility" "ProjectVisibility" NOT NULL DEFAULT 'TEAM';
