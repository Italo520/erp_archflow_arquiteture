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
import { TrendingUp, TrendingDown, Users, DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

interface BusinessReportProps {
    data: {
        totalRevenue: number;
        previousRevenue: number;
        profitMargin: number;
        previousMargin: number;
        newClients: number;
        previousNewClients: number;
        monthlyPerformance: {
            month: string;
            revenue: number;
            expenses: number;
            profit: number;
        }[];
    };
    period: string;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
    const diff = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    const isPositive = diff >= 0;

    return (
        <div className={cn(
            "flex items-center gap-1 text-xs",
            isPositive ? "text-green-600" : "text-red-600"
        )}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{isPositive ? "+" : ""}{diff.toFixed(1)}%</span>
        </div>
    );
}

export function BusinessReport({ data, period }: BusinessReportProps) {
    return (
        <div className="space-y-6 print:space-y-4">
            {/* Header for Print */}
            <div className="hidden print:block text-center mb-8">
                <h1 className="text-2xl font-bold">Relatório de Negócio</h1>
                <p className="text-muted-foreground">Período: {period}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
                        <TrendIndicator current={data.totalRevenue} previous={data.previousRevenue} />
                        <p className="text-xs text-muted-foreground mt-1">vs período anterior</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.profitMargin.toFixed(1)}%</div>
                        <TrendIndicator current={data.profitMargin} previous={data.previousMargin} />
                        <p className="text-xs text-muted-foreground mt-1">vs período anterior</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.newClients}</div>
                        <TrendIndicator current={data.newClients} previous={data.previousNewClients} />
                        <p className="text-xs text-muted-foreground mt-1">no período</p>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Desempenho Mensal</CardTitle>
                    <CardDescription>Resumo financeiro por mês</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mês</TableHead>
                                <TableHead className="text-right">Receita</TableHead>
                                <TableHead className="text-right">Despesas</TableHead>
                                <TableHead className="text-right">Lucro</TableHead>
                                <TableHead className="text-right">Margem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.monthlyPerformance.map((row) => {
                                const margin = row.revenue > 0 ? (row.profit / row.revenue) * 100 : 0;
                                return (
                                    <TableRow key={row.month}>
                                        <TableCell className="font-medium">{row.month}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {formatCurrency(row.expenses)}
                                        </TableCell>
                                        <TableCell className={cn(
                                            "text-right font-medium",
                                            row.profit >= 0 ? "text-green-600" : "text-red-600"
                                        )}>
                                            {formatCurrency(row.profit)}
                                        </TableCell>
                                        <TableCell className="text-right">{margin.toFixed(1)}%</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
