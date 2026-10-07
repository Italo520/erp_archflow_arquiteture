"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  PieChart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Info,
  ShieldAlert,
} from "lucide-react";
import {
  getProjectFinancials,
  saveBudget,
  saveEstimate,
} from "@/app/actions/finance";
import { downloadReport } from "@/app/actions/reports";

export default function ProjectFinancialTab({
  project,
  metrics: initialMetrics,
}: {
  project: any;
  metrics: any;
}) {
  const [financialData, setFinancialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos formulários de edição
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetVal, setNewBudgetVal] = useState("");

  const [isEditingEstimate, setIsEditingEstimate] = useState(false);
  const [newEstHours, setNewEstHours] = useState("");
  const [newEstCost, setNewEstCost] = useState("");
  const [newEstNotes, setNewEstNotes] = useState("");

  const [exportingFormat, setExportingFormat] = useState<
    "pdf" | "excel" | null
  >(null);

  const fetchFinancials = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getProjectFinancials(project.id);
      if (res.ok && res.data) {
        setFinancialData(res.data);
        setNewBudgetVal(res.data.budget?.totalBudget?.toString() || "");
        setNewEstHours(res.data.estimate?.estimatedHours?.toString() || "");
        setNewEstCost(res.data.estimate?.estimatedCost?.toString() || "");
        setNewEstNotes(res.data.estimate?.notes || "");
      }
    } catch (e) {
      console.error("Failed to load financials:", e);
    } finally {
      setIsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    fetchFinancials();
  }, [fetchFinancials]);

  async function handleSaveBudget() {
    const val = Number(newBudgetVal);
    if (isNaN(val) || val <= 0) {
      alert("Por favor, digite um valor de orçamento válido maior que zero.");
      return;
    }

    try {
      const res = await saveBudget(project.id, { totalBudget: val });
      if (res.ok) {
        setIsEditingBudget(false);
        await fetchFinancials();
      } else {
        alert("Erro ao salvar orçamento: " + res.message);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveEstimate() {
    const hrs = Number(newEstHours);
    const cst = Number(newEstCost);

    if (isNaN(hrs) || hrs <= 0 || isNaN(cst) || cst <= 0) {
      alert(
        "Por favor, preencha valores válidos maiores que zero para horas e custos estimados.",
      );
      return;
    }

    try {
      const res = await saveEstimate(project.id, {
        estimatedHours: hrs,
        estimatedCost: cst,
        notes: newEstNotes,
      });
      if (res.ok) {
        setIsEditingEstimate(false);
        await fetchFinancials();
      } else {
        alert("Erro ao salvar estimativa: " + res.message);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleExport(format: "pdf" | "excel") {
    setExportingFormat(format);
    try {
      const res = await downloadReport(
        { period: "month", projectIds: [project.id] },
        "business",
        format,
      );

      if (res.success && res.data) {
        const mimeType =
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        const linkSource = `data:${mimeType};base64,${res.data}`;
        const downloadLink = document.createElement("a");
        downloadLink.href = linkSource;
        downloadLink.download =
          res.filename ||
          `relatorio-financeiro-${project.name}.${format === "pdf" ? "pdf" : "xlsx"}`;
        downloadLink.click();
      } else {
        alert(
          "Não foi possível exportar o relatório: " +
            (res.error || "Erro desconhecido."),
        );
      }
    } catch (e: any) {
      console.error(e);
      alert("Erro durante a exportação: " + e.message);
    } finally {
      setExportingFormat(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Clock className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">
          Carregando painel financeiro em tempo real...
        </p>
      </div>
    );
  }

  const { budget, estimate, metrics, timeLogs = [] } = financialData || {};

  const totalBudget = budget?.totalBudget || Number(project.plannedCost) || 0;
  const spentAmount = metrics?.actualCostOfHours || 0;
  const remainingAmount = totalBudget - spentAmount;
  const spentPercentage = metrics?.spentPercentage || 0;

  const estimatedHours = estimate?.estimatedHours || 0;
  const estimatedCost = estimate?.estimatedCost || 0;
  const actualHours = metrics?.totalHours || 0;

  // Definição das cores da barra de progresso baseadas no estouro de verba
  let progressColor = "bg-emerald-500";
  let progressTextColor = "text-emerald-600 dark:text-emerald-400";
  let progressBg = "bg-emerald-100/50 dark:bg-emerald-950/20";

  if (metrics?.isWarning) {
    progressColor = "bg-amber-500";
    progressTextColor = "text-amber-600 dark:text-amber-400";
    progressBg = "bg-amber-100/50 dark:bg-amber-950/20";
  } else if (metrics?.isCritical) {
    progressColor = "bg-rose-500";
    progressTextColor = "text-destructive";
    progressBg = "bg-rose-100/50 dark:bg-rose-950/20";
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header de Ações Financeiras */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Fluxo de Custos Operacionais
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visão consolidada de estimativas, verbas alocadas e desvios de horas
            de trabalho.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Botões de Configuração */}
          <Dialog open={isEditingBudget} onOpenChange={setIsEditingBudget}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl text-xs font-bold gap-1 border-primary/20 text-primary hover:bg-primary/5"
              >
                <Plus className="h-3.5 w-3.5" />
                {totalBudget > 0 ? "Editar Orçamento" : "Definir Orçamento"}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-border">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">
                  Definir Orçamento Operacional
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Insira a verba máxima aprovada pelo cliente para o projeto.
                  Este valor servirá de teto de custos para as horas faturáveis
                  dos arquitetos.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-2">
                <label className="text-xs font-bold text-muted-foreground block">
                  Verba Total do Orçamento (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                    R$
                  </span>
                  <Input
                    type="number"
                    placeholder="15000"
                    value={newBudgetVal}
                    onChange={(e) => setNewBudgetVal(e.target.value)}
                    className="pl-9 rounded-xl border-border font-bold"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsEditingBudget(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="rounded-xl bg-primary hover:bg-primary/95 text-background-dark font-bold px-5"
                  onClick={handleSaveBudget}
                >
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditingEstimate} onOpenChange={setIsEditingEstimate}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl text-xs font-bold gap-1 border-primary/20 text-primary hover:bg-primary/5"
              >
                <Plus className="h-3.5 w-3.5" />
                {estimatedHours > 0
                  ? "Editar Estimativa"
                  : "Definir Estimativa"}
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-border">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">
                  Definir Estimativa Técnica
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Projete a quantidade de esforço em horas e o custo operacional
                  previsto de mão de obra antes do início efetivo das sprints.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">
                      Horas Estimadas (h)
                    </label>
                    <Input
                      type="number"
                      placeholder="80"
                      value={newEstHours}
                      onChange={(e) => setNewEstHours(e.target.value)}
                      className="rounded-xl border-border font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">
                      Custo Estimado (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                        R$
                      </span>
                      <Input
                        type="number"
                        placeholder="8000"
                        value={newEstCost}
                        onChange={(e) => setNewEstCost(e.target.value)}
                        className="pl-9 rounded-xl border-border font-semibold"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">
                    Notas de Planejamento
                  </label>
                  <Input
                    placeholder="ex: Projeto estrutural complexo necessitando esforço extra na concepção"
                    value={newEstNotes}
                    onChange={(e) => setNewEstNotes(e.target.value)}
                    className="rounded-xl border-border"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setIsEditingEstimate(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="rounded-xl bg-primary hover:bg-primary/95 text-background-dark font-bold px-5"
                  onClick={handleSaveEstimate}
                >
                  Salvar Estimativa
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Botões de Exportação Base64 */}
          <Button
            onClick={() => handleExport("pdf")}
            disabled={exportingFormat !== null}
            variant="secondary"
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            {exportingFormat === "pdf" ? "Exportando..." : "Exportar PDF"}
          </Button>

          <Button
            onClick={() => handleExport("excel")}
            disabled={exportingFormat !== null}
            variant="secondary"
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            {exportingFormat === "excel" ? "Exportando..." : "Exportar XLSX"}
          </Button>
        </div>
      </div>

      {/* Alertas de Estouros e Avisos de Risco */}
      {metrics?.isCritical && (
        <Card className="border-2 border-destructive/30 bg-destructive/10 rounded-2xl overflow-hidden animate-in zoom-in duration-300">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-10 w-10 bg-destructive/20 text-destructive rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-destructive">
                  Limite de Orçamento Excedido
                </h4>
                <Badge
                  variant="destructive"
                  className="bg-rose-600 font-bold uppercase text-[9px]"
                >
                  EXCEEDED
                </Badge>
              </div>
              <p className="text-xs text-destructive/80 mt-1">
                O custo real com mão de obra faturável atingiu{" "}
                <strong className="text-destructive">
                  R${" "}
                  {spentAmount.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </strong>
                , superando em{" "}
                <strong className="text-destructive">
                  {spentPercentage.toFixed(0)}%
                </strong>{" "}
                o total orçado aprovado pelo cliente de R${" "}
                {totalBudget.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
                . Novas alocações de esforço precisam ser auditadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {metrics?.isWarning && (
        <Card className="border-2 border-amber-500/30 bg-amber-500/10 rounded-2xl overflow-hidden animate-in zoom-in duration-300">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-10 w-10 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-500">
                Atenção: Margem Orçamentária sob Risco
              </h4>
              <p className="text-xs text-amber-500/80 mt-1">
                O consumo do orçamento atingiu{" "}
                <strong className="text-amber-500">
                  {spentPercentage.toFixed(1)}%
                </strong>{" "}
                da verba disponível. Faltam apenas R${" "}
                {remainingAmount.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                para atingir o limite orçado. Apropriação de horas futuras pode
                impactar as margens de lucro estimadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de Cards Financeiros */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Orçamento Aprovado
            </CardTitle>
            <Wallet className="h-4.5 w-4.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              R${" "}
              {totalBudget.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="flex items-center text-[10px] text-muted-foreground mt-1 gap-1">
              {budget?.status ? (
                <Badge className="bg-muted border-none font-bold rounded-md px-1.5 py-0 text-muted-foreground uppercase text-[9px]">
                  {budget.status}
                </Badge>
              ) : (
                <span>Definido no cadastro do projeto</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Custo Real (Mão de Obra)
            </CardTitle>
            <ArrowDownRight className="h-4.5 w-4.5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-destructive">
              R${" "}
              {spentAmount.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Soma de {actualHours.toFixed(1)}h apropriadas no Time-Tracking
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Saldo Restante
            </CardTitle>
            {remainingAmount >= 0 ? (
              <ArrowUpRight className="h-4.5 w-4.5 text-emerald-500" />
            ) : (
              <ArrowDownRight className="h-4.5 w-4.5 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-black ${remainingAmount >= 0 ? "text-foreground" : "text-destructive"}`}
            >
              R${" "}
              {remainingAmount.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Saldo restante da verba do contrato
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Custo Estimado Inicial
            </CardTitle>
            <CreditCard className="h-4.5 w-4.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              R${" "}
              {estimatedCost.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Projeção original de esforço: {estimatedHours}h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Execução Orçamentária e Gráficos de barra */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Consumo da Verba Aprovada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">
                  Progresso do Orçamento Gasto
                </span>
                <span className={progressTextColor}>
                  {spentPercentage.toFixed(1)}%
                </span>
              </div>
              <div
                className={`h-2.5 w-full ${progressBg} rounded-full overflow-hidden`}
              >
                <div
                  className={`h-full ${progressColor} transition-all duration-300 rounded-full`}
                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                />
              </div>
            </div>

            {estimate && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">
                    Progresso de Esforço em Horas (Real vs. Estimado)
                  </span>
                  <span>
                    {estimatedHours > 0
                      ? ((actualHours / estimatedHours) * 100).toFixed(0)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min((actualHours / (estimatedHours || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-bold">
                  Desvio vs. Estimativa (Custo)
                </p>
                <p
                  className={`text-sm font-bold ${spentAmount - estimatedCost > 0 ? "text-destructive" : "text-emerald-500"}`}
                >
                  R${" "}
                  {(spentAmount - estimatedCost).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-bold">
                  Desvio vs. Estimativa (Horas)
                </p>
                <p
                  className={`text-sm font-bold ${actualHours - estimatedHours > 0 ? "text-destructive" : "text-emerald-500"}`}
                >
                  {(actualHours - estimatedHours).toFixed(1)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Distribuição Operacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col justify-center items-center h-[145px] text-center px-4 relative">
              <PieChart className="h-10 w-10 text-muted-foreground mb-2" />
              {estimate?.notes ? (
                <p className="text-xs font-medium text-muted-foreground italic max-w-[280px]">
                  " {estimate.notes} "
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Defina estimativas e notas de escopo para organizar a verba do
                  projeto de forma profissional.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Logs de Esforço Detalhada */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Histórico de Alocações Financeiras (Time Logs)
          </h4>
          <span className="text-xs text-muted-foreground">
            {timeLogs.length} logs de esforço registrados
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border">
                <TableHead className="font-bold text-xs uppercase text-muted-foreground">
                  Data
                </TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground">
                  Colaborador
                </TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground">
                  Categoria
                </TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground">
                  Tipo
                </TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground text-center">
                  Horas
                </TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground text-right">
                  Taxa
                </TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground text-right">
                  Custo Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeLogs.map((log: any) => {
                const cost = Number(log.duration) * Number(log.billRate || 0);
                return (
                  <TableRow
                    key={log.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 border-b border-border"
                  >
                    <TableCell className="font-medium text-xs text-muted-foreground">
                      {new Date(log.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground text-xs">
                      {log.user?.fullName || "Profissional"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.category}
                    </TableCell>
                    <TableCell className="text-xs">
                      {log.billable ? (
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-none font-bold text-[9px]">
                          Faturável
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground border-border font-bold text-[9px]"
                        >
                          Não Faturável
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center font-bold text-xs">
                      {Number(log.duration).toFixed(1)}h
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold text-muted-foreground">
                      R${" "}
                      {Number(log.billRate || 0).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-xs font-black text-foreground">
                      R${" "}
                      {cost.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
              {timeLogs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-xs text-muted-foreground"
                  >
                    Nenhum time log alocado a este projeto até o momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
