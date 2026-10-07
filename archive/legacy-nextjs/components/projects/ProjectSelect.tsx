"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ProjectSelectProps {
    projects: any[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function ProjectSelect({
    projects,
    value,
    onValueChange,
    placeholder = "Selecionar projeto...",
    className
}: ProjectSelectProps) {
    const [open, setOpen] = React.useState(false);

    const selectedProject = projects.find((project) => project.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    <div className="flex items-center gap-2 truncate">
                        <Layers className="h-4 w-4 shrink-0 opacity-50" />
                        {selectedProject ? selectedProject.name : placeholder}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command className="w-full">
                    <CommandInput placeholder="Buscar projeto..." />
                    <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {projects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    value={project.name}
                                    onSelect={() => {
                                        onValueChange(project.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === project.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{project.name}</span>
                                        {project.client?.name && (
                                            <span className="text-[10px] text-muted-foreground">
                                                {project.client.name}
                                            </span>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
