"use client"

import * as React from "react"
import {
    Calendar,
    CheckCircle2,
    Clock,
    AlertTriangle,
    TrendingUp,
    DollarSign,
    Users,
    Building2,
    Home,
    LayoutGrid,
    Maximize2
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface ProjectOverviewProps {
    project: any
}

interface TimelineEvent {
    id: string
    title: string
    date: Date
    status: "completed" | "current" | "upcoming"
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
    // Extracting data with safe fallbacks
    const name = project.name || "Sem nome"
    const address = project.address || "Localização não definida"
    const startDate = project.startDate ? new Date(project.startDate) : new Date()
    const deliveryDate = project.deliveryDate ? new Date(project.deliveryDate) :
        project.estimatedEndDate ? new Date(project.estimatedEndDate) : null
    const status = project.status || "PLANNING"
    const budget = project.plannedCost ? Number(project.plannedCost) : 0

    // Timeline mapping from project.phases
    const timeline: TimelineEvent[] = (project.phases as any[] || []).map((p, i) => ({
        id: `phase-${i}`,
        title: p.name,
        date: p.startDate ? new Date(p.startDate) : new Date(),
        status: p.status === 'COMPLETED' ? 'completed' : p.status === 'IN_PROGRESS' ? 'current' : 'upcoming'
    }))

    const progress = timeline.length > 0
        ? Math.round((timeline.filter(e => e.status === 'completed').length / timeline.length) * 100)
        : 0

    const rawTeam = [
        ...(project.owner ? [{ id: project.owner.id, name: project.owner.fullName, role: "Proprietário", avatar: project.owner.avatar }] : []),
        ...(project.members || []).map((m: any) => ({
            id: m.user.id,
            name: m.user.fullName,
            role: m.role,
            avatar: m.user.avatar
        }))
    ]

    const team = Array.from(new Map(rawTeam.map(item => [item.id, item])).values());

    // Health calculation
    const calculateHealth = () => {
        if (project.status === "COMPLETED") return "ON_TRACK";
        const today = new Date();
        if (deliveryDate && deliveryDate < today) return "DELAYED";

        if (deliveryDate) {
            const diffTime = deliveryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 30 && progress < 70) return "AT_RISK";
        }

        return "ON_TRACK";
    }

    const health = calculateHealth()

    // Helper for Status Badge
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PLANNING: "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300",
            IN_PROGRESS: "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300",
            ON_HOLD: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300",
            COMPLETED: "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
            CANCELLED: "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300",
        }
        const labels: Record<string, string> = {
            PLANNING: "Planejamento",
            IN_PROGRESS: "Em Andamento",
            ON_HOLD: "Suspenso",
            COMPLETED: "Concluído",
            CANCELLED: "Cancelado",
        }
        return (
            <Badge className={styles[status] || ""}>
                {labels[status] || status}
            </Badge>
        )
    }

    const getHealthBadge = (health: string) => {
        const styles: Record<string, string> = {
            ON_TRACK: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
            AT_RISK: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
            DELAYED: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
        }
        const labels: Record<string, string> = {
            ON_TRACK: "No Prazo",
            AT_RISK: "Em Risco",
            DELAYED: "Atrasado",
        }
        return (
            <Badge variant="outline" className={styles[health] || ""}>
                {labels[health] || health}
            </Badge>
        )
    }

    return (
        <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Progresso</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress}%</div>
                        <Progress value={progress} className="mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saúde</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            {getHealthBadge(health)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Entrega: {deliveryDate ? format(deliveryDate, "dd/MM/yyyy") : "N/A"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Investimento</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Valor planejado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Equipe</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex -space-x-2">
                            {team.map((m) => (
                                <Avatar key={m.id} className="border-2 border-background h-8 w-8">
                                    <AvatarImage src={m.avatar || undefined} />
                                    <AvatarFallback>{m.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{team.length} membros</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Details */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Linha do Tempo</CardTitle>
                        <CardDescription>Fluxo de fases do projeto</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {timeline.length > 0 ? timeline.map((event, i) => (
                                <div key={event.id} className="flex items-start gap-4 relative">
                                    {i < timeline.length - 1 && (
                                        <div className="absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-muted" />
                                    )}
                                    <div className={`mt-1 h-3 w-3 rounded-full border-2 z-10 ${event.status === 'completed' ? 'bg-primary border-primary' :
                                            event.status === 'current' ? 'bg-amber-500 border-amber-500 animate-pulse' :
                                                'bg-background border-muted'
                                        }`} />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{event.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(event.date, "dd 'de' MMMM", { locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-sm text-muted-foreground italic py-4">Nenhuma fase registrada.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Technical Specs */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Detalhes Técnicos</CardTitle>
                        <CardDescription>Especificações do imóvel</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <LayoutGrid className="h-4 w-4" />
                                    <span>Tipo</span>
                                </div>
                                <span className="text-sm font-medium">{project.projectType || "N/A"}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Maximize2 className="h-4 w-4" />
                                    <span>Área Total</span>
                                </div>
                                <span className="text-sm font-medium">{project.totalArea || 0} m²</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Home className="h-4 w-4" />
                                    <span>Estilo</span>
                                </div>
                                <Badge variant="secondary" className="capitalize">
                                    {project.architecturalStyle?.toLowerCase() || "N/A"}
                                </Badge>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Building2 className="h-4 w-4" />
                                    <span>Construção</span>
                                </div>
                                <span className="text-sm font-medium capitalize">{project.constructionType?.toLowerCase() || "N/A"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
