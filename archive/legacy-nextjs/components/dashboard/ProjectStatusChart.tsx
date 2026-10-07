"use client";

import { Chart } from "./Chart";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface StatusData {
    status: string;
    count: number;
    label?: string;
}

interface ProjectStatusChartProps {
    data: StatusData[];
    loading?: boolean;
    error?: boolean;
}

// Map status to readable labels and colors
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    ON_TRACK: { label: "No Prazo", color: "hsl(var(--chart-2, 160 84% 39%))" },
    AT_RISK: { label: "Em Risco", color: "hsl(var(--chart-3, 38 92% 50%))" },
    DELAYED: { label: "Atrasado", color: "hsl(var(--destructive, 0 84% 60%))" },
    COMPLETED: { label: "Concluído", color: "hsl(var(--chart-1, 221 83% 53%))" },
    ARCHIVED: { label: "Arquivado", color: "hsl(var(--muted-foreground))" },
    // Fallback for custom statuses
    DEFAULT: { label: "Outro", color: "hsl(var(--muted-foreground))" },
};

const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.DEFAULT;
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const config = getStatusConfig(data.status);
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: config.color }}
                    />
                    <span className="text-sm font-medium">{config.label}</span>
                    <span className="text-sm text-muted-foreground">
                        {data.count} projeto{data.count !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export function ProjectStatusChart({ data, loading, error }: ProjectStatusChartProps) {
    // Add labels to data
    const formattedData = data.map(item => ({
        ...item,
        label: getStatusConfig(item.status).label,
    }));

    return (
        <Chart
            title="Status dos Projetos"
            description="Distribuição por status atual"
            loading={loading}
            error={error}
        >
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={formattedData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                >
                    <XAxis
                        type="number"
                        stroke="currentColor"
                        className="text-muted-foreground"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        type="category"
                        dataKey="label"
                        stroke="currentColor"
                        className="text-muted-foreground"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={80}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar
                        dataKey="count"
                        radius={[0, 4, 4, 0]}
                        maxBarSize={30}
                    >
                        {formattedData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getStatusConfig(entry.status).color}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Chart>
    );
}
