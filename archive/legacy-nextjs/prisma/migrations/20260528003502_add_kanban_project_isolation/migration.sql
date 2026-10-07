/*
  Warnings:

  - Added the required column `project_id` to the `project_kanban_columns` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project_kanban_columns" ADD COLUMN     "project_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "project_kanban_columns_project_id_idx" ON "project_kanban_columns"("project_id");

-- AddForeignKey
ALTER TABLE "project_kanban_columns" ADD CONSTRAINT "project_kanban_columns_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
