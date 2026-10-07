"use client";

import { Chart } from "./Chart";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface ProjectData {
    name: string;
    value: number;
}

interface TimeByProjectChartProps {
    data: ProjectData[];
    loading?: boolean;
    error?: boolean;
}

// Theme-aware colors using CSS variables where possible, with fallbacks
const COLORS = [
    'hsl(var(--chart-1, 221 83% 53%))',
    'hsl(var(--chart-2, 160 84% 39%))',
    'hsl(var(--chart-3, 38 92% 50%))',
    'hsl(var(--chart-4, 280 65% 60%))',
    'hsl(var(--chart-5, 340 75% 55%))',
    'hsl(var(--muted-foreground))',
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const total = data.payload.total || 0;
        const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{data.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {data.value.toFixed(1)}h ({percentage}%)
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export function TimeByProjectChart({ data, loading, error }: TimeByProjectChartProps) {
    // Group data: Top 5 + Others
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    const top5 = sortedData.slice(0, 5);
    const others = sortedData.slice(5);

    const othersTotal = others.reduce((sum, item) => sum + item.value, 0);
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const chartData = othersTotal > 0
        ? [...top5, { name: "Outros", value: othersTotal }]
        : top5;

    // Add total to each item for tooltip percentage calculation
    const chartDataWithTotal = chartData.map(item => ({ ...item, total }));

    return (
        <Chart
            title="Tempo por Projeto"
            description="Distribuição de horas nos projetos"
            loading={loading}
            error={error}
        >
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartDataWithTotal}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                    >
                        {chartDataWithTotal.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                className="stroke-background stroke-2"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                            <span className="text-xs text-muted-foreground">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </Chart>
    );
}
