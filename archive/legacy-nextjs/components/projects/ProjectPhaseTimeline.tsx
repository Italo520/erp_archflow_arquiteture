"use client";

import { cn } from "@/lib/utils";
import { Check, Circle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjectPhase {
    id: string;
    name: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

interface ProjectPhaseTimelineProps {
    phases: ProjectPhase[];
    className?: string;
}

export function ProjectPhaseTimeline({ phases, className }: ProjectPhaseTimelineProps) {
    if (!phases.length) return null;

    return (
        <TooltipProvider>
            <div className={cn("flex items-center w-full py-4", className)}>
                {phases.map((phase, index) => {
                    const isLast = index === phases.length - 1;
                    const isCompleted = phase.status === "COMPLETED";
                    const isInProgress = phase.status === "IN_PROGRESS";

                    return (
                        <div key={phase.id} className={cn("flex items-center", isLast ? "" : "flex-1")}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="relative flex flex-col items-center">
                                        <div
                                            className={cn(
                                                "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 bg-background",
                                                isCompleted ? "border-emerald-500 bg-emerald-50 text-emerald-600" :
                                                    isInProgress ? "border-primary bg-primary/5 text-primary animate-pulse" :
                                                        "border-muted text-muted-foreground"
                                            )}
                                        >
                                            {isCompleted ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <span className="text-[10px] font-bold">{index + 1}</span>
                                            )}
                                        </div>
                                        <span
                                            className={cn(
                                                "absolute -bottom-6 text-[10px] font-medium whitespace-nowrap hidden md:block transition-colors",
                                                isInProgress ? "text-primary" : isCompleted ? "text-emerald-600" : "text-muted-foreground"
                                            )}
                                        >
                                            {phase.name}
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs font-semibold">{phase.name}</p>
                                    <p className="text-[10px] opacity-70">
                                        Status: {phase.status === "COMPLETED" ? "Concluído" : phase.status === "IN_PROGRESS" ? "Em Andamento" : "Pendente"}
                                    </p>
                                </TooltipContent>
                            </Tooltip>

                            {!isLast && (
                                <div
                                    className={cn(
                                        "h-0.5 w-full mx-1 transition-colors duration-500",
                                        isCompleted ? "bg-emerald-500" : "bg-muted"
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}
