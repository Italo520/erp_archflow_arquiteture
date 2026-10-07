"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfQuarter, endOfQuarter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

type PeriodPreset = "today" | "week" | "month" | "quarter" | "custom";

interface PeriodSelectorProps {
    className?: string;
}

const presets: { value: PeriodPreset; label: string }[] = [
    { value: "today", label: "Hoje" },
    { value: "week", label: "Esta Semana" },
    { value: "month", label: "Este Mês" },
    { value: "quarter", label: "Trimestre" },
    { value: "custom", label: "Personalizado" },
];

function getPresetDates(preset: PeriodPreset): { from: Date; to: Date } {
    const now = new Date();
    switch (preset) {
        case "today":
            return { from: startOfDay(now), to: endOfDay(now) };
        case "week":
            return { from: startOfWeek(now, { weekStartsOn: 0 }), to: endOfWeek(now, { weekStartsOn: 0 }) };
        case "month":
            return { from: startOfMonth(now), to: endOfMonth(now) };
        case "quarter":
            return { from: startOfQuarter(now), to: endOfQuarter(now) };
        default:
            return { from: startOfMonth(now), to: endOfMonth(now) };
    }
}

export function PeriodSelector({ className }: PeriodSelectorProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentPreset = (searchParams.get("period") as PeriodPreset) || "month";
    const customFrom = searchParams.get("from");
    const customTo = searchParams.get("to");

    const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
        if (currentPreset === "custom" && customFrom && customTo) {
            return { from: new Date(customFrom), to: new Date(customTo) };
        }
        return getPresetDates(currentPreset);
    });

    const updateURL = useCallback((params: Record<string, string | null>) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));

        Object.entries(params).forEach(([key, value]) => {
            if (value === null) {
                current.delete(key);
            } else {
                current.set(key, value);
            }
        });

        const search = current.toString();
        router.push(`${pathname}${search ? `?${search}` : ""}`);
    }, [pathname, router, searchParams]);

    const handlePresetChange = (value: PeriodPreset) => {
        if (value === "custom") {
            updateURL({ period: "custom" });
        } else {
            const dates = getPresetDates(value);
            setDateRange(dates);
            updateURL({
                period: value,
                from: null,
                to: null,
            });
        }
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setDateRange(range);
        if (range?.from && range?.to) {
            updateURL({
                period: "custom",
                from: format(range.from, "yyyy-MM-dd"),
                to: format(range.to, "yyyy-MM-dd"),
            });
        }
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Select value={currentPreset} onValueChange={(v) => handlePresetChange(v as PeriodPreset)}>
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                    {presets.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                            {preset.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {currentPreset === "custom" && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[260px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                                        {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                                    </>
                                ) : (
                                    format(dateRange.from, "dd/MM/yy", { locale: ptBR })
                                )
                            ) : (
                                <span>Selecione o período</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={handleDateRangeChange}
                            numberOfMonths={2}
                            locale={ptBR}
                        />
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}
