"use client";

import { Chart } from "./Chart";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface RevenueData {
    month: string;
    realized: number;
    planned: number;
}

interface RevenueChartProps {
    data: RevenueData[];
    loading?: boolean;
    error?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-3 shadow-sm">
                <p className="text-sm font-medium mb-2">{label}</p>
                <div className="flex flex-col gap-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-muted-foreground">{entry.name}:</span>
                            <span className="font-medium">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    notation: 'compact'
                                }).format(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export function RevenueChart({ data, loading, error }: RevenueChartProps) {
    return (
        <Chart
            title="Receita Mensal"
            description="Comparativo planejado vs realizado"
            loading={loading}
            error={error}
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis
                        dataKey="month"
                        stroke="currentColor"
                        className="text-muted-foreground"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="currentColor"
                        className="text-muted-foreground"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                            new Intl.NumberFormat('pt-BR', {
                                notation: 'compact',
                                compactDisplay: 'short'
                            }).format(value)
                        }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => (
                            <span className="text-xs text-muted-foreground">{value}</span>
                        )}
                    />
                    <Line
                        type="monotone"
                        dataKey="planned"
                        name="Planejado"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={{ r: 4, className: "fill-muted-foreground" }}
                    />
                    <Line
                        type="monotone"
                        dataKey="realized"
                        name="Realizado"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, className: "fill-primary" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Chart>
    );
}
