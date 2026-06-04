"use server";

import { prisma } from "@/lib/prisma";
import { budgetSchema, estimateSchema } from "@/lib/validations";
import { auth } from "@/auth";
import { BudgetStatus, EstimateStatus, Role } from "@prisma/client";
import { requireProjectAccess } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/app/actions/audit";
import { serializeData } from "@/lib/serialize";
import type { ActionResponse } from "@/lib/types/action-response";

export type { ActionResponse };

export async function getProjectFinancials(projectId: string): Promise<ActionResponse> {
    try {
        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);
        
        // Somente leitura — sem nenhum side effect de escrita no banco
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

<<<<<<< HEAD
        const totalHours = timeLogs.reduce((acc, log) => acc + log.duration, 0);
        const billableHours = timeLogs
            .filter(log => log.billable)
            .reduce((acc, log) => acc + log.duration, 0);
        
        const actualCostOfHours = timeLogs
            .filter(log => log.billable)
            .reduce((acc, log) => acc + (log.duration * Number(log.billRate || 0)), 0);
=======
        // Calcula horas e custos reais com base nos logs de tempo
        let totalHours = 0;
        let billableHours = 0;
        let actualCostOfHours = 0;

        for (let i = 0; i < timeLogs.length; i++) {
            const log = timeLogs[i];
            totalHours += log.duration;
            if (log.billable) {
                billableHours += log.duration;
                actualCostOfHours += log.duration * Number(log.billRate || 0);
            }
        }
>>>>>>> 591e5c1bacd201fb66f050286f617a29990bd5b0

        const totalBudgetVal = budget ? Number(budget.totalBudget) : Number(project.plannedCost || 0);
        const budgetSpent = actualCostOfHours;
        const spentPercentage = totalBudgetVal > 0 ? (budgetSpent / totalBudgetVal) * 100 : 0;
        const remainingAmount = totalBudgetVal - budgetSpent;

        // Status calculado localmente — sem atualizar o banco
        let currentBudgetStatus = budget?.status || BudgetStatus.DRAFT;
        if (totalBudgetVal > 0 && budgetSpent > totalBudgetVal) {
            currentBudgetStatus = BudgetStatus.EXCEEDED;
        } else if (totalBudgetVal > 0 && budgetSpent <= totalBudgetVal && currentBudgetStatus === BudgetStatus.EXCEEDED) {
            currentBudgetStatus = BudgetStatus.ACTIVE;
        }

        return {
            ok: true,
            success: true,
            data: serializeData({
                project: {
                    ...project,
                    plannedCost: project.plannedCost ? Number(project.plannedCost) : null,
                    actualCost: project.actualCost ? Number(project.actualCost) : null
                },
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
            })
        };
    } catch (error: any) {
        console.error("Failed to get financials:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao carregar dados financeiros." };
    }
}

/**
 * Sincroniza os campos calculados (actualCost, spentAmount, remainingAmount, status)
 * de volta para o banco. Deve ser chamado somente após escritas (criar/editar TimeLogs),
 * nunca em leituras do dashboard.
 */
export async function syncProjectFinancials(projectId: string): Promise<ActionResponse> {
    try {
        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);

        const [budget, estimate, timeLogs, project] = await Promise.all([
            prisma.budget.findUnique({ where: { projectId } }),
            prisma.estimate.findUnique({ where: { projectId } }),
            prisma.timeLog.findMany({ where: { projectId } }),
            prisma.project.findUnique({ where: { id: projectId }, select: { actualCost: true } }),
        ]);

        const totalHours = timeLogs.reduce((acc, log) => acc + log.duration, 0);
        const actualCostOfHours = timeLogs
            .filter(log => log.billable)
            .reduce((acc, log) => acc + (log.duration * Number(log.billRate || 0)), 0);

        const totalBudgetVal = budget ? Number(budget.totalBudget) : 0;
        const remainingAmount = totalBudgetVal - actualCostOfHours;

        await prisma.$transaction(async (tx) => {
            // Sincroniza actualCost no projeto
            if (Number(project?.actualCost || 0) !== actualCostOfHours) {
                await tx.project.update({
                    where: { id: projectId },
                    data: { actualCost: actualCostOfHours }
                });
            }

            // Sincroniza status e valores no Budget
            if (budget) {
                const newStatus =
                    totalBudgetVal > 0 && actualCostOfHours > totalBudgetVal
                        ? BudgetStatus.EXCEEDED
                        : totalBudgetVal > 0 && budget.status === BudgetStatus.EXCEEDED
                        ? BudgetStatus.ACTIVE
                        : budget.status;

                await tx.budget.update({
                    where: { id: budget.id },
                    data: {
                        status: newStatus,
                        spentAmount: actualCostOfHours,
                        remainingAmount: remainingAmount >= 0 ? remainingAmount : 0
                    }
                });
            }

            // Sincroniza actualHours e actualCost na Estimate
            if (estimate) {
                await tx.estimate.update({
                    where: { id: estimate.id },
                    data: { actualHours: totalHours, actualCost: actualCostOfHours }
                });
            }
        });

        return { ok: true, success: true, message: "Financeiros sincronizados com sucesso" };
    } catch (error: any) {
        console.error("Failed to sync financials:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao sincronizar dados financeiros." };
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
        let actualCostOfHours = 0;
        for (let i = 0; i < timeLogs.length; i++) {
            const log = timeLogs[i];
            if (log.billable) {
                actualCostOfHours += log.duration * Number(log.billRate || 0);
            }
        }

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
        return { ok: true, success: true, data: serializeData(budget), message: "Orçamento salvo com sucesso." };
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
        let totalHours = 0;
        let actualCostOfHours = 0;
        for (let i = 0; i < timeLogs.length; i++) {
            const log = timeLogs[i];
            totalHours += log.duration;
            if (log.billable) {
                actualCostOfHours += log.duration * Number(log.billRate || 0);
            }
        }

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
        return { ok: true, success: true, data: serializeData(estimate), message: "Estimativa salva com sucesso." };
    } catch (error: any) {
        console.error("Failed to save estimate:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao salvar estimativa." };
    }
}
