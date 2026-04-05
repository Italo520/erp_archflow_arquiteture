"use client";

import React, { useMemo, useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
    DragStartEvent,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateProjectStatus, deleteKanbanColumn, createKanbanColumn, updateKanbanColumn } from '@/app/actions/kanban';
import { deleteProject } from '@/app/actions/project';
import { 
    MoreVertical, 
    Plus, 
    Trash2, 
    Edit, 
    GripVertical,
    LayoutDashboard,
    Search
} from 'lucide-react';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger, 
    DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type KanbanProject = {
    id: string;
    name: string;
    status: string;
    client?: { name: string };
    owner?: { fullName: string };
};

type KanbanColumnData = {
    id: string;
    title: string;
    color?: string;
    order: number;
};

export default function ProjectKanban({ 
    projects: initialProjects, 
    columns: initialColumns 
}: { 
    projects: KanbanProject[], 
    columns: KanbanColumnData[] 
}) {
    const router = useRouter();
    const [projects, setProjects] = useState(initialProjects);
    const [columns, setColumns] = useState(initialColumns);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');

    useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

    useEffect(() => {
        setColumns(initialColumns);
    }, [initialColumns]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    // Group projects by status
    const groupedProjects = useMemo(() => {
        const groups: Record<string, KanbanProject[]> = {};
        columns.forEach(col => groups[col.id] = []);
        projects.forEach(project => {
            const status = project.status || (columns.length > 0 ? columns[0].id : '');
            if (groups[status]) {
                groups[status].push(project);
            } else if (columns.length > 0) {
                // Fallback to first column if status is invalid
                groups[columns[0].id].push(project);
            }
        });
        return groups;
    }, [projects, columns]);

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);
        
        if (over) {
            const projectId = active.id as string;
            let overId = over.id as string;

            // Find destination column id
            // If overId matches a project.id, we need to find its column
            const overProject = projects.find(p => p.id === overId);
            const newStatusId = overProject ? overProject.status : overId;

            const activeProject = projects.find(p => p.id === projectId);
            
            // Only update if status actually changed or dropped on a different target
            if (activeProject && newStatusId && (activeProject.status !== newStatusId || activeId !== overId)) {
                console.log(`DRAG END: Moving project ${projectId} to ${newStatusId}`);
                
                // Optimistic update
                const oldProjects = [...projects];
                setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatusId } : p));

                const result = await updateProjectStatus(projectId, newStatusId);
                if (result.error) {
                    setProjects(oldProjects);
                    toast.error("Erro ao mover projeto: " + result.error);
                } else {
                    toast.success("Projeto movido!");
                    router.refresh();
                }
            }
        }
    }

    const handleCreateColumn = async () => {
        if (!newColumnTitle.trim()) return;
        const result = await createKanbanColumn(newColumnTitle);
        if (result.success) {
            setNewColumnTitle('');
            setIsCreatingColumn(false);
            toast.success("Coluna criada!");
            router.refresh();
        } else {
            toast.error("Erro ao criar coluna");
        }
    };

    const handleDeleteColumn = async (id: string) => {
        if (confirm("Deseja realmente excluir esta coluna? Projetos serão movidos para a primeira coluna.")) {
            const result = await deleteKanbanColumn(id);
            if (result.success) {
                toast.success("Coluna excluída!");
                router.refresh();
            } else {
                toast.error("Erro ao excluir coluna");
            }
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (confirm("Deseja deletar este projeto?")) {
            const result = await deleteProject(id);
            if (result.success) {
                toast.success("Projeto deletado!");
                router.refresh();
            } else {
                toast.error("Erro ao deletar projeto");
            }
        }
    };

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCorners}
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-[calc(100vh-250px)] gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        projects={groupedProjects[col.id] || []}
                        color={col.color}
                        onDelete={() => handleDeleteColumn(col.id)}
                    />
                ))}

                {/* Add Column Button */}
                <div className="min-w-[320px] h-full flex flex-col justify-start">
                    {isCreatingColumn ? (
                        <Card className="bg-muted/50 border-dashed border-2 p-4">
                            <Input 
                                autoFocus
                                placeholder="Título da coluna..." 
                                value={newColumnTitle}
                                onChange={(e) => setNewColumnTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateColumn()}
                                className="mb-2"
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleCreateColumn}>Salvar</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsCreatingColumn(false)}>Cancelar</Button>
                            </div>
                        </Card>
                    ) : (
                        <Button 
                            variant="ghost" 
                            className="bg-muted/30 border-dashed border-2 h-14 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary transition-all"
                            onClick={() => setIsCreatingColumn(true)}
                        >
                            <Plus className="h-5 w-5" />
                            Adicionar Coluna
                        </Button>
                    )}
                </div>
            </div>
            
            <DragOverlay>
                {activeId ? (
                    <div className="opacity-80 rotate-3 scale-105 transition-transform">
                        <ProjectCard 
                            project={projects.find(p => p.id === activeId)!} 
                            isOverlay
                            onDelete={() => {}}
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

function KanbanColumn({ id, title: initialTitle, projects, color, onDelete }: { 
    id: string, 
    title: string, 
    projects: KanbanProject[], 
    color?: string,
    onDelete: () => void
}) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);

    const handleUpdateTitle = async () => {
        if (!title.trim() || title === initialTitle) {
            setIsEditing(false);
            return;
        }
        const result = await updateKanbanColumn(id, { title });
        if (result.success) {
            setIsEditing(false);
            toast.success("Título atualizado");
            router.refresh();
        } else {
            toast.error("Erro ao atualizar título");
            setTitle(initialTitle);
        }
    };

    return (
        <div 
            ref={setNodeRef} 
            className={`flex h-full w-80 min-w-[320px] flex-col rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 p-4 transition-colors ${isOver ? 'ring-2 ring-primary bg-slate-100 dark:bg-slate-800' : ''}`}
        >
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                    <div className={`w-2 h-2 rounded-full ${color || 'bg-slate-400'}`} />
                    {isEditing ? (
                        <Input 
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleUpdateTitle}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                            className="h-7 py-0 px-2 text-xs font-bold uppercase"
                        />
                    ) : (
                        <h3 
                            className="font-bold text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => setIsEditing(true)}
                        >
                            {title}
                        </h3>
                    )}
                    <Badge variant="secondary" className="ml-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full h-5 min-w-[20px] flex items-center justify-center border-none">
                        {projects.length}
                    </Badge>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="text-destructive flex items-center gap-2" onClick={onDelete}>
                            <Trash2 className="h-4 w-4" /> Excluir Coluna
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1 scrollbar-thin">
                {projects.length === 0 && !isOver && (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center text-center opacity-40">
                        <LayoutDashboard className="h-8 w-8 mb-2" />
                        <span className="text-xs font-medium">Nenhum projeto</span>
                    </div>
                )}
                {projects.map((project) => (
                    <DraggableProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    );
}

function DraggableProjectCard({ project }: { project: KanbanProject }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: project.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
    } : undefined;

    if (isDragging) {
        return (
            <div 
                ref={setNodeRef} 
                style={style} 
                className="opacity-20 border-2 border-primary rounded-xl h-32 bg-primary/5" 
            />
        );
    }

    return (
        <div ref={setNodeRef} style={style}>
            <ProjectCard 
                project={project} 
                dragHandleProps={{...listeners, ...attributes}} 
            />
        </div>
    );
}

function ProjectCard({ 
    project, 
    dragHandleProps, 
    isOverlay = false,
    onDelete 
}: { 
    project: KanbanProject, 
    dragHandleProps?: any,
    isOverlay?: boolean,
    onDelete?: () => void
}) {
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm(`Deseja realmente excluir o projeto "${project.name}"?`)) {
            const result = await deleteProject(project.id);
            if (result.success) {
                toast.success("Projeto excluído");
                router.refresh();
            } else {
                toast.error("Erro ao excluir");
            }
        }
    };

    return (
        <Card className={`group relative bg-white dark:bg-surface-dark border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isOverlay ? 'shadow-xl rotate-1' : ''}`}>
            {/* Header / Drag Handle */}
            <div 
                className="absolute left-0 top-0 bottom-0 w-3 bg-slate-200 dark:bg-slate-800 group-hover:bg-primary/20 transition-all cursor-grab active:cursor-grabbing flex items-center justify-center"
                {...dragHandleProps}
            >
                <GripVertical className="h-3 w-3 text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            
            <CardHeader className="p-4 pl-7 pb-2 space-y-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-primary transition-colors pr-6">
                        {project.name}
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/projects/${project.id}/edit`} className="flex items-center gap-2">
                                    <Edit className="h-4 w-4" /> Editar Projeto
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive flex items-center gap-2" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" /> Deletar Projeto
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                {project.client && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        {project.client.name}
                    </div>
                )}
            </CardHeader>
            
            <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    {project.owner && (
                        <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-[10px] flex items-center justify-center font-black text-white shadow-sm" title={`Dono: ${project.owner.fullName}`}>
                                {project.owner.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 capitalize truncate max-w-[80px]">
                                {project.owner.fullName.split(' ')[0]}
                            </span>
                        </div>
                    )}
                    <Link 
                        href={`/projects/${project.id}`} 
                        className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                        Ver Detalhes
                        <Plus className="h-2.5 w-2.5 rotate-45" />
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
