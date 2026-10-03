import React from "react";
import { getProjectById } from "@/app/actions/project";
import { notFound } from "next/navigation";
import ProjectInspectionsTab from "@/components/projects/ProjectInspectionsTab";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ProjectInspectionsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return notFound();
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Link
            href={`/projects/${project.id}`}
            className="text-xs text-gray-500 hover:text-gray-900 mb-1 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar para o Projeto ({project.name})</span>
          </Link>
          <h1 className="text-2xl font-bold text-[#152026]">
            Vistorias Técnicas & Punch List
          </h1>
          <p className="text-xs text-gray-500">
            {project.name} {project.clientName ? `• Cliente: ${project.clientName}` : ""}
          </p>
        </div>
      </header>

      <div className="flex-1">
        <ProjectInspectionsTab project={project} />
      </div>
    </div>
  );
}
