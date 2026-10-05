import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { BarChart3, Download, FileText, TrendingUp, Users, Clock, DollarSign, Filter } from "lucide-react";

export function ReportsView() {
  const [period, setPeriod] = useState("month");

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios Gerenciais</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Análise consolidada de produtividade, custos e desempenho operacional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="size-4" />
            Exportar CSV
          </Button>
          <Button size="sm" className="gap-2">
            <FileText className="size-4" />
            Gerar PDF Oficial
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-11 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <DollarSign className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Faturamento Acumulado</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">R$ 284.500,00</h3>
              <span className="text-[11px] text-emerald-500 font-medium">↑ +14% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Projetos em Andamento</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">12 Ativos</h3>
              <span className="text-[11px] text-muted-foreground">92% no prazo</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Horas Apontadas</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">348h 45m</h3>
              <span className="text-[11px] text-muted-foreground">84% faturáveis</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-11 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Clientes Atendidos</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">18 Clientes</h3>
              <span className="text-[11px] text-emerald-500 font-medium">100% satisfeitos</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Produtividade por Projeto */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Detalhamento Financeiro por Projeto</CardTitle>
            <CardDescription className="text-xs">
              Valores orçados vs custos realizados e margem líquida por contrato.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-8 px-2 rounded-lg border border-input bg-background text-xs"
            >
              <option value="month">Este Mês</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Ano</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Projeto</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Fase Atual</th>
                  <th className="py-2.5 px-3 text-right">Orçamento Previsto</th>
                  <th className="py-2.5 px-3 text-right">Custo Realizado</th>
                  <th className="py-2.5 px-3 text-right">Margem</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    name: "Residencial Alphaville Villa 4",
                    client: "Roberto Silva",
                    phase: "Executivo",
                    planned: 85000,
                    actual: 42000,
                    margin: "+50.5%",
                    status: "healthy",
                  },
                  {
                    name: "Edifício Horizonte",
                    client: "Construtora Metrópole",
                    phase: "Compatibilização",
                    planned: 120000,
                    actual: 98000,
                    margin: "+18.3%",
                    status: "attention",
                  },
                  {
                    name: "Casa Jardins",
                    client: "Beatriz Almeida",
                    phase: "Concluído",
                    planned: 45000,
                    actual: 39000,
                    margin: "+13.3%",
                    status: "healthy",
                  },
                  {
                    name: "Loft Industrial Pinheiros",
                    client: "Thiago Ramos",
                    phase: "Estudo Preliminar",
                    planned: 35000,
                    actual: 12000,
                    margin: "+65.7%",
                    status: "healthy",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground">{row.name}</td>
                    <td className="py-3 px-3 text-muted-foreground">{row.client}</td>
                    <td className="py-3 px-3 text-muted-foreground">{row.phase}</td>
                    <td className="py-3 px-3 text-right font-mono font-medium">
                      R$ {row.planned.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                      R$ {row.actual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-500">
                      {row.margin}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={row.status === "healthy" ? "success" : "warning"}>
                        {row.status === "healthy" ? "Dentro do Orçamento" : "Atenção a Custos"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
