"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface Project {
    id: string;
    name: string;
}

interface ProjectFilterProps {
    projects: Project[];
    className?: string;
}

export function ProjectFilter({ projects, className }: ProjectFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>(() => {
        const projectsParam = searchParams.get("projects");
        return projectsParam ? projectsParam.split(",") : [];
    });

    const updateURL = useCallback((ids: string[]) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (ids.length > 0) {
            current.set("projects", ids.join(","));
        } else {
            current.delete("projects");
        }

        const search = current.toString();
        router.push(`${pathname}${search ? `?${search}` : ""}`);
    }, [pathname, router, searchParams]);

    const selectedSet = useMemo(() => new Set(selected), [selected]);

    const handleSelect = (projectId: string) => {
        const newSelected = selectedSet.has(projectId)
            ? selected.filter((id) => id !== projectId)
            : [...selected, projectId];

        setSelected(newSelected);
        updateURL(newSelected);
    };

    const handleRemove = (projectId: string) => {
        const newSelected = selected.filter((id) => id !== projectId);
        setSelected(newSelected);
        updateURL(newSelected);
    };

    const handleClearAll = () => {
        setSelected([]);
        updateURL([]);
    };

    const selectedProjects = projects.filter((p) => selectedSet.has(p.id));

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[220px] justify-between"
                    >
                        {selected.length > 0
                            ? `${selected.length} projeto${selected.length > 1 ? "s" : ""}`
                            : "Filtrar por projeto"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-0">
                    <Command>
                        <CommandInput placeholder="Buscar projeto..." />
                        <CommandEmpty>Nenhum projeto encontrado.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                            {projects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    value={project.name}
                                    onSelect={() => handleSelect(project.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedSet.has(project.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {project.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            {selectedProjects.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {selectedProjects.map((project) => (
                        <Badge key={project.id} variant="secondary" className="text-xs">
                            {project.name}
                            <button
                                className="ml-1 hover:text-destructive"
                                onClick={() => handleRemove(project.id)}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    {selectedProjects.length > 1 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 px-2 text-xs"
                            onClick={handleClearAll}
                        >
                            Limpar
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
