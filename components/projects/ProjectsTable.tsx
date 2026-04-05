"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, Edit, Copy, Trash2, Eye, Archive } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DuplicateProjectModal from "./DuplicateProjectModal";
import { useState, useMemo } from "react";
import { deleteProject } from "@/app/actions/project";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Project {
    id: string;
    name: string;
    projectType?: string;
    status: string;
    client?: { name: string };
    owner?: { fullName: string };
    phases: any[];
    deliveryDate?: string | Date; // Legacy
    estimatedEndDate?: string | Date; // New
    actualEndDate?: string | Date;
    plannedCost?: number;
    actualCost?: number;
    [key: string]: any;
}

// Logic to derive Health Status
function getProjectHealth(project: Project): 'ON_TRACK' | 'DELAYED' | 'COMPLETED' | 'AT_RISK' {
    if (project.status === 'COMPLETED') return 'COMPLETED';

    // Check Date Delays
    const deadline = project.estimatedEndDate || project.deliveryDate;
    if (deadline && new Date(deadline) < new Date()) {
        return 'DELAYED';
    }

    // Check Budget Risks (if we had budget data populated)
    // if (project.actualCost > project.plannedCost) return 'AT_RISK';

    return 'ON_TRACK';
}

function HealthBadge({ status }: { status: string }) {
    switch (status) {
        case 'ON_TRACK':
            return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">On Track</Badge>;
        case 'DELAYED':
            return <Badge variant="destructive">Atrasado</Badge>;
        case 'AT_RISK':
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Em Risco</Badge>;
        case 'COMPLETED':
            return <Badge variant="secondary">Concluído</Badge>;
        default:
            return null;
    }
}

export default function ProjectsTable({ projects }: { projects: Project[] }) {
    const [projectToDuplicate, setProjectToDuplicate] = useState<Project | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Filter Logic client-side (Hybrid approach: server filters broadly, client refines or sorts)
    // Note: ProjectFilters typically pushes to URL, and Server Component fetches filtered types.
    // Here we handle Sorting client-side.
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const filteredAndSortedProjects = useMemo(() => {
        let items = [...projects];

        // Apply URL Filters client-side if needed (e.g. Health derived status is easier to filter here if API doesn't support it yet)
        const healthFilter = searchParams.get("health");
        if (healthFilter && healthFilter !== "ALL") {
            items = items.filter(p => getProjectHealth(p) === healthFilter);
        }

        // Sorting
        if (sortConfig) {
            items.sort((a, b) => {
                const aValue = sortConfig.key.includes('.')
                    ? sortConfig.key.split('.').reduce((o, i) => o?.[i], a)
                    : a[sortConfig.key];
                const bValue = sortConfig.key.includes('.')
                    ? sortConfig.key.split('.').reduce((o, i) => o?.[i], b)
                    : b[sortConfig.key];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [projects, sortConfig, searchParams]);


    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    async function handleDelete(id: string) {
        if (!confirm("Tem certeza que deseja excluir este projeto?")) return;
        await deleteProject(id);
        router.refresh();
    }

    return (
        <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/40">
                    <TableRow>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('name')}>
                            Projeto {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('client.name')}>
                            Cliente {sortConfig?.key === 'client.name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('owner.fullName')}>
                            Responsável
                        </TableHead>
                        <TableHead>Fase Atual</TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('status')}>
                            Status
                        </TableHead>
                        <TableHead>Saúde</TableHead>
                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('estimatedEndDate')}>
                            Entrega
                        </TableHead>
                        <TableHead className="w-[100px]">Progresso</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAndSortedProjects.map((project) => {
                        // Calculate metrics
                        const phases = (project.phases as any[]) || [];
                        const completed = phases.filter((p) => p.status === "COMPLETED").length;
                        const total = phases.length;
                        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                        // Determine Current Phase
                        const currentPhase = phases.find(p => p.status === 'IN_PROGRESS') || phases.find(p => p.status === 'PENDING') || phases[phases.length - 1];
                        const health = getProjectHealth(project);
                        const deadline = project.estimatedEndDate || project.deliveryDate;

                        return (
                            <TableRow key={project.id} className="hover:bg-muted/5">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <Link href={`/projects/${project.id}`} className="hover:underline text-base font-semibold text-primary">
                                            {project.name}
                                        </Link>
                                        <span className="text-xs text-muted-foreground">{project.projectType || "TBD"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{project.client?.name || <span className="text-muted-foreground italic">Sem cliente</span>}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {/* Placeholder for Avatar if avail */}
                                        <div className="w-5 h-5 rounded-full bg-primary/10 text-[10px] flex items-center justify-center font-bold text-primary">
                                            {project.owner?.fullName?.charAt(0) || "?"}
                                        </div>
                                        <span className="text-sm">{project.owner?.fullName?.split(' ')[0] || "N/A"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-medium">{currentPhase?.name || "-"}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="uppercase text-[10px]">
                                        {project.status === "IN_PROGRESS" ? "Em Andamento" :
                                            project.status === "COMPLETED" ? "Concluído" :
                                                project.status === "PLANNING" ? "Planejamento" : project.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <HealthBadge status={health} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-xs">
                                        {deadline ? (
                                            <>
                                                <span className="font-medium">{format(new Date(deadline), "bd 'de' MMM", { locale: ptBR })}</span>
                                                <span className="text-muted-foreground">{new Date(deadline).getFullYear()}</span>
                                            </>
                                        ) : "-"}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2" title={`${progress}% Completo`}>
                                        <Progress value={progress} className="w-[60px] h-2" />
                                        <span className="text-xs text-muted-foreground font-medium">{progress}%</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/projects/${project.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" /> Detalhes
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/projects/${project.id}/edit`}>
                                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setProjectToDuplicate(project)}>
                                                <Copy className="mr-2 h-4 w-4" /> Duplicar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => alert("Compartilhar - Em breve")}>
                                                <MoreHorizontal className="mr-2 h-4 w-4" /> Compartilhar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => alert("Relatório - Em breve")}>
                                                <MoreHorizontal className="mr-2 h-4 w-4" /> Relatório
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Archive className="mr-2 h-4 w-4" /> Arquivar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(project.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {filteredAndSortedProjects.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-2">
                                    <Archive className="h-8 w-8 opacity-20" />
                                    <p>Nenhum projeto encontrado com os filtros atuais.</p>
                                    <Button variant="link" onClick={() => router.push('/projects')}>Limpar filtros</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Duplicate Modal */}
            {projectToDuplicate && (
                <DuplicateProjectModal
                    project={projectToDuplicate}
                    isOpen={!!projectToDuplicate}
                    onClose={() => setProjectToDuplicate(null)}
                />
            )}
        </div>
    );
}
