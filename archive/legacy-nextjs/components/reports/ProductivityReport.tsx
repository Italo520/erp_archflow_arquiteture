"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Trophy, Clock, Medal } from "lucide-react";

interface ProductivityReportProps {
    data: {
        userRanking: {
            id: string;
            name: string;
            totalHours: number;
            billableHours: number;
            utilization: number;
        }[];
        billableVsNon: {
            billable: number;
            nonBillable: number;
        };
        totalHours: number;
        averageUtilization: number;
    };
    period: string;
}

const COLORS = ["hsl(var(--chart-1, 221 83% 53%))", "hsl(var(--muted-foreground))"];

function getRankBadge(index: number) {
    if (index === 0) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (index === 1) return <Medal className="h-4 w-4 text-gray-400" />;
    if (index === 2) return <Medal className="h-4 w-4 text-amber-700" />;
    return <span className="text-muted-foreground text-sm">{index + 1}º</span>;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{data.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {data.value.toFixed(1)}h ({(data.percent * 100).toFixed(1)}%)
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export function ProductivityReport({ data, period }: ProductivityReportProps) {
    const pieData = [
        { name: "Faturável", value: data.billableVsNon.billable },
        { name: "Não Faturável", value: data.billableVsNon.nonBillable },
    ];

    return (
        <div className="space-y-6 print:space-y-4">
            {/* Header for Print */}
            <div className="hidden print:block text-center mb-8">
                <h1 className="text-2xl font-bold">Relatório de Produtividade</h1>
                <p className="text-muted-foreground">Período: {period}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalHours.toFixed(1)}h</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            registradas no período
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Utilização</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.averageUtilization.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            média da equipe
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
                {/* Billable vs Non-billable Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Horas Faturáveis vs Não Faturáveis</CardTitle>
                        <CardDescription>Distribuição do tempo registrado</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {pieData.map((_, index) => (
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
                        </div>
                    </CardContent>
                </Card>

                {/* User Ranking Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ranking de Produtividade</CardTitle>
                        <CardDescription>Usuários mais produtivos no período</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead className="text-right">Horas</TableHead>
                                    <TableHead className="text-right">Utilização</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.userRanking.slice(0, 5).map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{getRankBadge(index)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-[9px]">
                                                        {user.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">{user.totalHours.toFixed(1)}h</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant={user.utilization >= 80 ? "default" : "secondary"}>
                                                {user.utilization.toFixed(0)}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
