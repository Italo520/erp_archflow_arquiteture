"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Search,
    Filter,
    Clock,
    AlertCircle,
    CheckCircle2,
    MoreVertical,
    Calendar
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

export default function ProjectTasksTab({ project }: { project: any }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    // Static data for now, would come from database
    const tasks = project.tasks || [];

    const filteredTasks = tasks.filter((task: any) => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || task.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getPriorityBadge = (priority: string) => {
        switch (priority.toUpperCase()) {
            case 'URGENT':
                return <Badge variant="destructive" className="bg-red-600">Urgente</Badge>;
            case 'HIGH':
                return <Badge variant="destructive">Alta</Badge>;
            case 'MEDIUM':
                return <Badge variant="secondary" className="bg-yellow-500 text-white">Média</Badge>;
            case 'LOW':
                return <Badge variant="outline" className="text-green-600 border-green-600">Baixa</Badge>;
            default:
                return <Badge variant="outline">{priority}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toUpperCase()) {
            case 'COMPLETED':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'IN_PROGRESS':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'PENDING':
                return <AlertCircle className="h-4 w-4 text-yellow-500" />;
            default:
                return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar tarefas..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Status</SelectItem>
                            <SelectItem value="PENDING">Pendente</SelectItem>
                            <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                            <SelectItem value="COMPLETED">Concluída</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="LOW">Baixa</SelectItem>
                            <SelectItem value="MEDIUM">Média</SelectItem>
                            <SelectItem value="HIGH">Alta</SelectItem>
                            <SelectItem value="URGENT">Urgente</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Tarefa
                </Button>
            </div>

            <div className="grid gap-4">
                {filteredTasks.map((task: any) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="mt-1">
                                        {getStatusIcon(task.status)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                                                {task.title}
                                            </h4>
                                            {getPriorityBadge(task.priority || 'MEDIUM')}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {task.description || "Sem descrição"}
                                        </p>
                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>Prazo: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Sem prazo"}</span>
                                            </div>
                                            {task.assignee && (
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                        {task.assignee.fullName.charAt(0)}
                                                    </div>
                                                    <span>{task.assignee.fullName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                        <DropdownMenuItem>Mudar Status</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredTasks.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/5">
                        <div className="bg-muted/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">Nenhuma tarefa encontrada</h3>
                        <p className="text-sm text-muted-foreground">Tente ajustar seus filtros ou busque por outro termo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
