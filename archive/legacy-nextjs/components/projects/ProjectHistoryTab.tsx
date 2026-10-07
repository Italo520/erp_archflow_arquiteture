"use client";

import {
    Clock,
    PlusCircle,
    FileUp,
    CheckCircle,
    MessageSquare,
    Settings,
    User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock history if not present in schema yet
const MOCK_HISTORY = [
    {
        id: 1,
        type: 'CREATE',
        user: 'Sócio Diretor',
        description: 'Projeto criado e orçamento inicial definido.',
    },
    {
        id: 2,
        type: 'PHASE_COMPLETE',
        user: 'Arquiteto Responsável',
        description: 'Fase "Estudo Preliminar" marcada como concluída.',
        date: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 3,
        type: 'UPLOAD',
        user: 'Equipe de Design',
        description: 'Upload de 3 novos renders conceituais.',
        date: new Date(Date.now() - 172800000).toISOString()
    }
];

export default function ProjectHistoryTab({ project }: { project: any }) {
    const history = project.history || MOCK_HISTORY.map(event => {
        if (event.id === 1) {
            return { ...event, date: project.createdAt || new Date().toISOString() };
        }
        return event;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'CREATE': return <PlusCircle className="h-4 w-4 text-green-500" />;
            case 'PHASE_COMPLETE': return <CheckCircle className="h-4 w-4 text-primary" />;
            case 'UPLOAD': return <FileUp className="h-4 w-4 text-blue-500" />;
            case 'COMMENT': return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
            default: return <Settings className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto py-4">
            <div className="flex items-center gap-2 mb-8">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Log de Atividades</h3>
            </div>

            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
                {history.map((event: any, index: number) => (
                    <div key={event.id} className="relative flex items-start gap-6 group">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm z-10 group-hover:border-primary/50 transition-colors">
                            {getIcon(event.type)}
                        </div>

                        <div className="flex flex-col gap-1 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{event.user}</span>
                                <span className="text-[10px] text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(event.date).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                {event.description}
                            </p>
                            <div className="mt-2 flex gap-2">
                                <Badge variant="outline" className="text-[10px] bg-muted/30">
                                    {event.type}
                                </Badge>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="text-center pt-8">
                    <p className="text-xs text-muted-foreground italic">
                        Fim do histórico visível.
                    </p>
                </div>
            </div>
        </div>
    );
}
