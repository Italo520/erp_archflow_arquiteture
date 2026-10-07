"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface User {
    id: string;
    name: string;
}

interface UserFilterProps {
    users: User[];
    className?: string;
}

export function UserFilter({ users, className }: UserFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>(() => {
        const usersParam = searchParams.get("users");
        return usersParam ? usersParam.split(",") : [];
    });

    const updateURL = useCallback((ids: string[]) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (ids.length > 0) {
            current.set("users", ids.join(","));
        } else {
            current.delete("users");
        }

        const search = current.toString();
        router.push(`${pathname}${search ? `?${search}` : ""}`);
    }, [pathname, router, searchParams]);

    const handleSelect = (userId: string) => {
        const newSelected = selected.includes(userId)
            ? selected.filter((id) => id !== userId)
            : [...selected, userId];

        setSelected(newSelected);
        updateURL(newSelected);
    };

    const handleRemove = (userId: string) => {
        const newSelected = selected.filter((id) => id !== userId);
        setSelected(newSelected);
        updateURL(newSelected);
    };

    const handleClearAll = () => {
        setSelected([]);
        updateURL([]);
    };

    const selectedUsers = users.filter((u) => selected.includes(u.id));

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[200px] justify-between"
                    >
                        {selected.length > 0
                            ? `${selected.length} usuário${selected.length > 1 ? "s" : ""}`
                            : "Filtrar por usuário"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Buscar usuário..." />
                        <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                            {users.map((user) => (
                                <CommandItem
                                    key={user.id}
                                    value={user.name}
                                    onSelect={() => handleSelect(user.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected.includes(user.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <Avatar className="h-5 w-5 mr-2">
                                        <AvatarFallback className="text-[9px]">
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {user.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {selectedUsers.map((user) => (
                        <Badge key={user.id} variant="secondary" className="text-xs">
                            {user.name}
                            <button
                                className="ml-1 hover:text-destructive"
                                onClick={() => handleRemove(user.id)}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                    {selectedUsers.length > 1 && (
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
