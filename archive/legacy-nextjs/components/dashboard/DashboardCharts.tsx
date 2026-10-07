"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

interface DashboardChartsProps {
    productivityData: {
        date: string;
        hours: number;
    }[];
    projectDistribution: {
        status: string;
        count: number;
    }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function DashboardCharts({ productivityData, projectDistribution }: DashboardChartsProps) {
    // Format dates for better display if needed (DD/MM)
    const formattedProductivity = productivityData.map(d => ({
        ...d,
        date: d.date.split('-').slice(1).reverse().join('/') // yyyy-MM-dd -> dd/MM
    }));

    return (
        <Card className="col-span-1 min-h-[400px]">
            <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
                <CardDescription>Acompanhamento de produtividade e projetos</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <Tabs defaultValue="productivity" className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="productivity">Produtividade</TabsTrigger>
                            <TabsTrigger value="projects">Status de Projetos</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="productivity" className="h-[300px]">
                        <ResponsiveContainer width="99%" height={300}>
                            <BarChart data={formattedProductivity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}h`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="hours"
                                    fill="currentColor"
                                    radius={[4, 4, 0, 0]}
                                    className="fill-primary"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="projects" className="h-[300px]">
                        <ResponsiveContainer width="99%" height={300}>
                            <PieChart>
                                <Pie
                                    data={projectDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {projectDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
