import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: number;
    trendLabel?: string;
    intent?: "positive" | "negative" | "neutral";
    subtitle?: string;
}

export function KPICard({
    title,
    value,
    icon: Icon,
    trend,
    trendLabel,
    intent = "neutral",
    subtitle,
}: KPICardProps) {
    const isPositive = trend !== undefined && trend > 0;
    const isNegative = trend !== undefined && trend < 0;

    // Determine color based on intent
    let trendColor = "text-muted-foreground";
    let TrendIcon = Minus;

    if (intent === "positive") {
        trendColor = isPositive
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400";
        TrendIcon = isPositive ? TrendingUp : TrendingDown;
    } else if (intent === "negative") {
        trendColor = isPositive
            ? "text-red-600 dark:text-red-400"
            : "text-green-600 dark:text-green-400";
        TrendIcon = isPositive ? TrendingUp : TrendingDown;
    }

    return (
        <div className={cn(
            "group relative rounded-xl border border-border bg-card p-5",
            "shadow-card hover:shadow-card-hover",
            "transition-all duration-200 ease-smooth",
            "hover:-translate-y-0.5",
            "animate-slide-up",
        )}>
            {/* Glow decoration */}
            <div className="absolute inset-0 rounded-xl bg-primary/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <p className="text-sm font-medium text-muted-foreground leading-none">
                        {title}
                    </p>
                    {/* Icon container */}
                    <div className="size-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-primary/15 group-hover:border-primary/25">
                        <Icon className="size-4 text-primary" />
                    </div>
                </div>

                {/* Value */}
                <div className="mb-1">
                    <span className="text-2xl font-bold text-foreground tracking-tight font-display">
                        {value}
                    </span>
                </div>

                {/* Subtitle */}
                {subtitle && (
                    <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
                )}

                {/* Trend */}
                {(trend !== undefined || trendLabel) && (
                    <div className="flex items-center gap-1.5 mt-2">
                        {trend !== undefined && (
                            <div className={cn("flex items-center gap-0.5", trendColor)}>
                                <TrendIcon className="size-3" />
                                <span className={cn("text-xs font-semibold", trendColor)}>
                                    {trend > 0 ? "+" : ""}{trend}%
                                </span>
                            </div>
                        )}
                        {trendLabel && (
                            <span className="text-xs text-muted-foreground">{trendLabel}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
