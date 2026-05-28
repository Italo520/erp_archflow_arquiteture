"use server";

import { prisma } from "@/lib/prisma";
import { budgetSchema, estimateSchema } from "@/lib/validations";
import { auth } from "@/auth";
import { BudgetStatus, EstimateStatus, Role } from "@prisma/client";
import { requireProjectAccess } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/app/actions/audit";

export interface ActionResponse<T = any> {
  ok: boolean;
  success?: boolean; // Retrocompatibilidade
  message?: string;
  data?: T;
  error?: string | any;
  errors?: Record<string, string[]> | string;
}

export async function getProjectFinancials(projectId: string): Promise<ActionResponse> {
    try {
        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);
        
        // Busca orçamentos, estimativas e time logs
        const [project, budget, estimate, timeLogs] = await Promise.all([
            prisma.project.findUnique({
                where: { id: projectId },
                select: { id: true, name: true, plannedCost: true, actualCost: true }
            }),
            prisma.budget.findUnique({ where: { projectId } }),
            prisma.estimate.findUnique({ where: { projectId } }),
            prisma.timeLog.findMany({
                where: { projectId },
                include: { user: { select: { fullName: true } } }
            })
        ]);

        if (!project) {
            return { ok: false, success: false, error: "NotFound", message: "Projeto não encontrado" };
        }

        // Calcula horas e custos reais com base nos logs de tempo
        const totalHours = timeLogs.reduce((acc, log) => acc + log.duration, 0);
        const billableHours = timeLogs
            .filter(log => log.billable)
            .reduce((acc, log) => acc + log.duration, 0);
        
        const actualCostOfHours = timeLogs
            .filter(log => log.billable)
            .reduce((acc, log) => acc + (log.duration * Number(log.billRate || 0)), 0);

        let budgetSpent = actualCostOfHours;
        let totalBudgetVal = budget ? Number(budget.totalBudget) : Number(project.plannedCost || 0);

        let spentPercentage = totalBudgetVal > 0 ? (budgetSpent / totalBudgetVal) * 100 : 0;
        let remainingAmount = totalBudgetVal - budgetSpent;

        // Se o orçamento foi estourado, atualiza o status para EXCEEDED
        let currentBudgetStatus = budget?.status || BudgetStatus.DRAFT;
        if (totalBudgetVal > 0 && budgetSpent > totalBudgetVal && currentBudgetStatus !== BudgetStatus.EXCEEDED) {
            currentBudgetStatus = BudgetStatus.EXCEEDED;
            await prisma.budget.update({
                where: { projectId },
                data: { status: BudgetStatus.EXCEEDED }
            });
        } else if (totalBudgetVal > 0 && budgetSpent <= totalBudgetVal && currentBudgetStatus === BudgetStatus.EXCEEDED) {
            currentBudgetStatus = BudgetStatus.ACTIVE;
            await prisma.budget.update({
                where: { projectId },
                data: { status: BudgetStatus.ACTIVE }
            });
        }

        // Sincroniza custos reais no projeto se diferirem substancialmente
        if (Number(project.actualCost || 0) !== actualCostOfHours) {
            await prisma.project.update({
                where: { id: projectId },
                data: { actualCost: actualCostOfHours }
            });
        }

        // Sincroniza spentAmount e remainingAmount no Budget
        if (budget && (Number(budget.spentAmount) !== budgetSpent || Number(budget.remainingAmount) !== remainingAmount)) {
            await prisma.budget.update({
                where: { id: budget.id },
                data: {
                    spentAmount: budgetSpent,
                    remainingAmount: remainingAmount >= 0 ? remainingAmount : 0
                }
            });
        }

        // Sincroniza actualHours e actualCost na Estimate
        if (estimate && (estimate.actualHours !== totalHours || Number(estimate.actualCost || 0) !== actualCostOfHours)) {
            await prisma.estimate.update({
                where: { id: estimate.id },
                data: {
                    actualHours: totalHours,
                    actualCost: actualCostOfHours
                }
            });
        }

        return {
            ok: true,
            success: true,
            data: {
                project,
                budget: budget ? {
                    ...budget,
                    totalBudget: Number(budget.totalBudget),
                    spentAmount: budgetSpent,
                    remainingAmount: remainingAmount,
                    status: currentBudgetStatus
                } : null,
                estimate: estimate ? {
                    ...estimate,
                    estimatedHours: Number(estimate.estimatedHours || 0),
                    estimatedCost: Number(estimate.estimatedCost || 0),
                    actualHours: Number(estimate.actualHours || 0),
                    actualCost: Number(estimate.actualCost || 0)
                } : null,
                metrics: {
                    totalHours,
                    billableHours,
                    nonBillableHours: totalHours - billableHours,
                    actualCostOfHours,
                    spentPercentage,
                    isWarning: spentPercentage >= 80 && spentPercentage < 100,
                    isCritical: spentPercentage >= 100
                },
                timeLogs
            }
        };
    } catch (error: any) {
        console.error("Failed to get financials:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao carregar dados financeiros." };
    }
}

export async function saveBudget(projectId: string, data: { totalBudget: number, breakdown?: any }): Promise<ActionResponse> {
    try {
        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);
        
        const existingProject = await prisma.project.findUnique({ where: { id: projectId } });
        if (!existingProject) {
            return { ok: false, success: false, error: "NotFound", message: "Projeto não encontrado" };
        }

        // Busca logs do projeto para calcular custo inicial gasto
        const timeLogs = await prisma.timeLog.findMany({ where: { projectId } });
        const actualCostOfHours = timeLogs
            .filter(log => log.billable)
            .reduce((acc, log) => acc + (log.duration * Number(log.billRate || 0)), 0);

        const remaining = data.totalBudget - actualCostOfHours;
        const status = actualCostOfHours > data.totalBudget ? BudgetStatus.EXCEEDED : (actualCostOfHours > 0 ? BudgetStatus.ACTIVE : BudgetStatus.DRAFT);

        const budget = await prisma.budget.upsert({
            where: { projectId },
            create: {
                projectId,
                totalBudget: data.totalBudget,
                spentAmount: actualCostOfHours,
                remainingAmount: remaining >= 0 ? remaining : 0,
                budgetBreakdown: data.breakdown || {},
                status
            },
            update: {
                totalBudget: data.totalBudget,
                spentAmount: actualCostOfHours,
                remainingAmount: remaining >= 0 ? remaining : 0,
                budgetBreakdown: data.breakdown || {},
                status
            }
        });

        // Sincroniza plannedCost no Project
        await prisma.project.update({
            where: { id: projectId },
            data: { plannedCost: data.totalBudget }
        });

        await logAudit({
            action: 'UPDATE',
            entityType: 'Budget',
            entityId: budget.id,
            projectId: projectId,
            changes: { new: budget }
        });

        revalidatePath(`/dashboard/projects/${projectId}`);
        return { ok: true, success: true, data: budget, message: "Orçamento salvo com sucesso." };
    } catch (error: any) {
        console.error("Failed to save budget:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao salvar orçamento." };
    }
}

export async function saveEstimate(
    projectId: string, 
    data: { estimatedHours: number, estimatedCost: number, notes?: string }
): Promise<ActionResponse> {
    try {
        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);
        
        const existingProject = await prisma.project.findUnique({ where: { id: projectId } });
        if (!existingProject) {
            return { ok: false, success: false, error: "NotFound", message: "Projeto não encontrado" };
        }

        // Calcula reais acumulados
        const timeLogs = await prisma.timeLog.findMany({ where: { projectId } });
        const totalHours = timeLogs.reduce((acc, log) => acc + log.duration, 0);
        const actualCostOfHours = timeLogs
            .filter(log => log.billable)
            .reduce((acc, log) => acc + (log.duration * Number(log.billRate || 0)), 0);

        const estimate = await prisma.estimate.upsert({
            where: { projectId },
            create: {
                projectId,
                estimatedHours: data.estimatedHours,
                estimatedCost: data.estimatedCost,
                actualHours: totalHours,
                actualCost: actualCostOfHours,
                notes: data.notes || "",
                status: EstimateStatus.IN_PROGRESS
            },
            update: {
                estimatedHours: data.estimatedHours,
                estimatedCost: data.estimatedCost,
                actualHours: totalHours,
                actualCost: actualCostOfHours,
                notes: data.notes || "",
                status: EstimateStatus.IN_PROGRESS
            }
        });

        await logAudit({
            action: 'UPDATE',
            entityType: 'Estimate',
            entityId: estimate.id,
            projectId: projectId,
            changes: { new: estimate }
        });

        revalidatePath(`/dashboard/projects/${projectId}`);
        return { ok: true, success: true, data: estimate, message: "Estimativa salva com sucesso." };
    } catch (error: any) {
        console.error("Failed to save estimate:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao salvar estimativa." };
    }
}
