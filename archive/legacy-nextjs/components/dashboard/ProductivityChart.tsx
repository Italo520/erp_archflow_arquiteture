"use client";

import { Chart } from "./Chart";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface ProductivityData {
    date: string;
    normal: number;
    overtime: number;
}

interface ProductivityChartProps {
    data: ProductivityData[];
    loading?: boolean;
    error?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
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
                            <span className="font-medium">{entry.value.toFixed(1)}h</span>
                        </div>
                    ))}
                    <div className="border-t pt-1 mt-1 flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-medium">{total.toFixed(1)}h</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export function ProductivityChart({ data, loading, error }: ProductivityChartProps) {
    // Format dates (yyyy-MM-dd -> DD/MM)
    const formattedData = data.map(d => ({
        ...d,
        date: d.date.includes('-')
            ? d.date.split('-').slice(1).reverse().join('/')
            : d.date
    }));

    return (
        <Chart
            title="Produtividade Semanal"
            description="Horas trabalhadas nos últimos 7 dias"
            loading={loading}
            error={error}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis
                        dataKey="date"
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
                        tickFormatter={(value) => `${value}h`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(value) => (
                            <span className="text-xs text-muted-foreground">{value}</span>
                        )}
                    />
                    <Bar
                        dataKey="normal"
                        name="Horas Normais"
                        stackId="a"
                        fill="hsl(var(--primary))"
                        radius={[0, 0, 0, 0]}
                    />
                    <Bar
                        dataKey="overtime"
                        name="Horas Extras"
                        stackId="a"
                        fill="hsl(var(--chart-3, 38 92% 50%))"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Chart>
    );
}
