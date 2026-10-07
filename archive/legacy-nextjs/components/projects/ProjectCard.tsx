"use client";

import Image from "next/image";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    MoreVertical,
    Calendar,
    Users,
    Layers,
    ExternalLink,
    Copy,
    Trash,
    Edit
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProjectCardProps {
    project: any;
    onDelete?: (id: string) => void;
    onDuplicate?: (project: any) => void;
}

export function ProjectCard({ project, onDelete, onDuplicate }: ProjectCardProps) {
    const progress = project.progress ?? 0;
    const statusMap: Record<string, { label: string, color: string }> = {
        PLANNING: { label: "Planejamento", color: "bg-blue-100 text-blue-700" },
        IN_PROGRESS: { label: "Em Andamento", color: "bg-emerald-100 text-emerald-700" },
        COMPLETED: { label: "Concluído", color: "bg-slate-100 text-slate-700" },
        ON_HOLD: { label: "Pausado", color: "bg-amber-100 text-amber-700" },
    };

    const status = statusMap[project.status] || statusMap.PLANNING;

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-primary/5">
            <CardHeader className="p-0 relative">
                <div className="aspect-video w-full bg-muted rounded-t-xl overflow-hidden relative">
                    {project.thumbnailUrl ? (
                        <Image
                            src={project.thumbnailUrl}
                            alt={project.name}
                            fill
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                            <Layers className="h-12 w-12 text-primary/20" />
                        </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link href={`/projects/${project.id}`} className="flex items-center">
                                        <ExternalLink className="mr-2 h-4 w-4" /> Ver Detalhes
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href={`/projects/${project.id}/edit`} className="flex items-center">
                                        <Edit className="mr-2 h-4 w-4" /> Editar
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onDuplicate?.(project)}>
                                    <Copy className="mr-2 h-4 w-4" /> Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => onDelete?.(project.id)}
                                >
                                    <Trash className="mr-2 h-4 w-4" /> Excluir
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Badge className={`absolute top-3 left-3 border-none ${status.color}`}>
                        {status.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-5">
                <div className="space-y-3">
                    <div>
                        <Link href={`/projects/${project.id}`}>
                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                {project.name}
                            </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {project.client?.name || "Sem cliente vinculado"}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground py-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {project.startDate ? format(new Date(project.startDate), "MMM yyyy", { locale: ptBR }) : "N/D"}
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5" />
                            {project.architects?.length || 0} Membros
                        </div>
                    </div>

                    <div className="space-y-2 pt-1">
                        <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            <span>Progresso</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
