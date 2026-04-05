'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
    AlertTriangle, 
    Calendar, 
    User, 
    ChevronDown, 
    Minus,
    CheckCircle
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export function TaskCard({ task, onClick }) {
    const { 
        attributes, 
        listeners, 
        setNodeRef, 
        transform, 
        transition,
        isDragging 
    } = useSortable({
        id: task.id,
        data: { type: 'Task', task }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    const metadata = task.metadata && typeof task.metadata === 'object' ? task.metadata : {};

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 border-2 border-dashed border-primary rounded-xl h-[100px] mb-3 bg-primary/5 transition-all duration-300"
            />
        );
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="group relative bg-white dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-slate-800/60 overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 flex flex-col cursor-grab active:cursor-grabbing mb-3"
        >
            {/* Top Priority Bar */}
            <div className={`h-1 w-full absolute top-0 left-0 ${
                task.priority === 'HIGH' ? 'bg-destructive' : 
                task.priority === 'MEDIUM' ? 'bg-orange-500' : 'bg-primary'
            }`} />

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="p-3.5 flex flex-col flex-1 gap-2.5 relative z-10">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="text-[13px] font-display font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-primary transition-colors">
                        {task.title}
                    </h4>
                </div>

                {/* Tags / Priority Row */}
                <div className="flex flex-wrap items-center gap-1.5">
                    {task.priority && (
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${
                            task.priority === 'HIGH' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                            task.priority === 'MEDIUM' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20' :
                            'bg-primary/10 text-primary border border-primary/20'
                        }`}>
                            {task.priority === 'HIGH' ? <AlertTriangle className="h-2.5 w-2.5" /> : 
                             task.priority === 'MEDIUM' ? <Minus className="h-2.5 w-2.5" /> : 
                             <ChevronDown className="h-2.5 w-2.5" />}
                            {task.priority === 'HIGH' ? 'Alta' : task.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                        </span>
                    )}

                    {metadata.area && (
                        <span className="text-[10px] font-body font-semibold px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800/60 rounded-[4px] text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                            {metadata.area}m²
                        </span>
                    )}
                </div>

                {/* Footer: Assignee & Date */}
                <div className="mt-1.5 pt-2.5 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {task.assignee ? (
                            <div className="flex items-center gap-1.5" title={task.assignee.fullName}>
                                <div className="w-5 h-5 rounded-[6px] bg-primary/20 text-[#0F172A] dark:text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
                                    {task.assignee.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                </div>
                                <span className="text-[10px] font-body font-medium text-slate-500 dark:text-slate-400 truncate max-w-[70px]">
                                    {task.assignee.fullName.split(' ')[0]}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-slate-300" />
                                <span className="text-[10px] text-slate-300 italic font-body">Livre</span>
                            </div>
                        )}
                    </div>

                    {task.dueDate && (
                        <div className={`flex items-center gap-1 text-[10px] font-body font-bold px-1.5 py-0.5 rounded-[4px] ${
                            new Date(task.dueDate) < new Date() ? 'bg-destructive/10 text-destructive' : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500'
                        }`}>
                            <Calendar className="h-2.5 w-2.5" />
                            {format(new Date(task.dueDate), "dd/MM", { locale: ptBR })}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
