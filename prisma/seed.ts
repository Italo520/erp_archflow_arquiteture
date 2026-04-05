import { PrismaClient, Role, ClientStatus, Priority, ActivityType, ActivityStatus, DeliverableType, DeliverableStatus, TimeLogCategory, EstimateStatus, BudgetStatus } from '@prisma/client'
import { hash } from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Configuração do Adapter para compatibilidade com Supabase/PG
const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Start seeding Pro Max (Architecture ERP)...')

    // 0. Limpeza total na ordem correta das dependências
    console.log('Cleaning up database...')
    const models = [
        'auditLog', 'notification', 'timeLog', 'deliverable', 'activity',
        'task', 'stage', 'budget', 'estimate', 'projectMember',
        'project', 'client', 'projectKanbanColumn', 'user'
    ]

    for (const model of models) {
        await (prisma as any)[model].deleteMany()
    }

    // 1. Criar Usuários
    console.log('Seeding Users...')
    const passwordHash = await hash('password123', 10)

    const admin = await prisma.user.create({
        data: {
            fullName: 'Italo Sampaio',
            email: 'admin@archflow.local',
            passwordHash,
            role: 'OWNER'
        }
    })

    const architect = await prisma.user.create({
        data: {
            fullName: 'Ana Arquiteta',
            email: 'ana@archflow.local',
            passwordHash,
            role: 'EDITOR'
        }
    })

    // 2. Colunas do Kanban de Projetos
    console.log('Seeding Project Kanban Columns...')
    const columns = [
        { id: 'PLANNING', title: 'Planejamento', color: 'bg-blue-500', order: 0 },
        { id: 'IN_PROGRESS', title: 'Em Andamento', color: 'bg-emerald-500', order: 1 },
        { id: 'ON_HOLD', title: 'Pausado', color: 'bg-amber-500', order: 2 },
        { id: 'COMPLETED', title: 'Concluído', color: 'bg-slate-500', order: 3 }
    ]

    const columnIds = columns.map(c => c.id)
    for (const col of columns) {
        await prisma.projectKanbanColumn.create({ data: col })
    }

    // 3. Dados Mestres: Clientes e Projetos
    console.log('Seeding Clients and Projects...')
    const clientsBatch = [
        { name: 'Sampaio & Filhos', status: 'ACTIVE', category: 'COMMERCIAL', spent: 150000 },
        { name: 'Tech Park Offices', status: 'PROSPECT', category: 'INDUSTRIAL', spent: 0 },
        { name: 'Hotel Vista Mar', status: 'ACTIVE', category: 'COMMERCIAL', spent: 850000 },
        { name: 'Loja Conceito Nike', status: 'BLOCKED', category: 'COMMERCIAL', spent: 45000 },
        { name: 'Residência K', status: 'ACTIVE', category: 'RESIDENTIAL', spent: 120000 },
        { name: 'Urbanização Recanto', status: 'PROSPECT', category: 'RESIDENTIAL', spent: 0 },
        { name: 'Centro Cultural ABC', status: 'ACTIVE', category: 'INSTITUTIONAL', spent: 300000 },
        { name: 'Clínica Sorriso', status: 'ACTIVE', category: 'COMMERCIAL', spent: 65000 },
        { name: 'Escola Pequeno Aprendiz', status: 'ACTIVE', category: 'INSTITUTIONAL', spent: 500000 },
        { name: 'Academia FitMax', status: 'INACTIVE', category: 'COMMERCIAL', spent: 25000 },
    ]

    for (let i = 0; i < clientsBatch.length; i++) {
        const cData = clientsBatch[i]
        const client = await prisma.client.create({
            data: {
                name: cData.name,
                email: `contato@${cData.name.toLowerCase().replace(/ /g, '')}.com`,
                status: cData.status as ClientStatus,
                category: cData.category as any,
                totalSpent: cData.spent,
                userId: i % 2 === 0 ? admin.id : architect.id,
                document: `0000000001${i}`,
                phone: `(11) 9999-000${i}`
            }
        })

        // Criar Projeto para cada cliente
        const project = await prisma.project.create({
            data: {
                name: `Reforma ${cData.name}`,
                status: columnIds[i % columnIds.length],
                ownerId: i % 2 === 0 ? admin.id : architect.id,
                clientId: client.id,
                projectType: cData.category,
                plannedCost: 50000 + (i * 10000),
                actualCost: i % 3 === 0 ? (30000 + (i * 5000)) : 0,
                startDate: new Date(),
                deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // +60 dias
            }
        })

        // 4. Detalhes do Projeto: Stages, Tasks, Budget, TimeLogs
        await seedProjectDetails(project.id, admin.id, architect.id)
    }

    // 5. Atividades do Dia (Agenda) para o Dashboard
    console.log('Seeding Agenda (Activities)...')
    const agenda = [
        { title: 'Reunião de Briefing - Residência K', type: 'MEETING', offset: 0 },
        { title: 'Visita Técnica - Alpha HQ', type: 'SITE_VISIT', offset: 120 },
        { title: 'Revisão de Plantas', type: 'DESIGN', offset: 240 },
        { title: 'Call de Aprovação', type: 'CALL', offset: 360 }
    ]

    for (let i = 0; i < agenda.length; i++) {
        const start = new Date()
        start.setHours(9, 0, 0, 0)
        start.setMinutes(start.getMinutes() + agenda[i].offset)

        await prisma.activity.create({
            data: {
                title: agenda[i].title,
                type: agenda[i].type as ActivityType,
                startTime: start,
                endTime: new Date(start.getTime() + 60 * 60 * 1000),
                createdById: admin.id,
                status: 'SCHEDULED'
            }
        })
    }

    // 6. Notificações e Audit
    console.log('Seeding Notifications and Audit Logs...')
    for (let i = 0; i < 10; i++) {
        await prisma.notification.create({
            data: {
                userId: admin.id,
                title: `Notificação ${i}`,
                message: `Isso é um alerta de teste número ${i} para o sistema.`,
                type: 'INFO',
                relatedEntityId: admin.id,
                relatedEntityType: 'PROJECT'
            }
        })

        await prisma.auditLog.create({
            data: {
                userId: admin.id,
                action: 'CREATE',
                entityType: 'PROJECT',
                entityId: 'fake-id-' + i,
                ipAddress: '127.0.0.1'
            }
        })
    }

    console.log('Seeding finished successfully. Happy coding!')
}

async function seedProjectDetails(projectId: string, adminId: string, architectId: string) {
    // Stages
    const phases = [
        { name: 'Levantamento', tasks: ['Medição In Loco', 'Fotos do Terreno', 'Entrevista Briefing'] },
        { name: 'Estudo Preliminar', tasks: ['Layout 2D', 'Conceito Criativo', 'Aprovação Estudo'] },
        { name: 'Projeto Executivo', tasks: ['Detalhamento Gesso', 'Planta Hidráulica', 'Executivo Marcenaria'] }
    ]

    for (let i = 0; i < phases.length; i++) {
        const stage = await prisma.stage.create({
            data: { name: phases[i].name, order: i, projectId }
        })

        for (let j = 0; j < phases[i].tasks.length; j++) {
            const task = await prisma.task.create({
                data: {
                    title: phases[i].tasks[j],
                    projectId,
                    stageId: stage.id,
                    priority: j === 0 ? 'HIGH' : 'MEDIUM',
                    assigneeId: architectId,
                    dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000)
                }
            })

            // Deliverables
            if (j === 1) {
                await prisma.deliverable.create({
                    data: {
                        name: `Desenho ${phases[i].tasks[j]}.pdf`,
                        type: 'PDF',
                        fileUrl: 'https://example.com/file.pdf',
                        projectId,
                        taskId: task.id,
                        createdById: architectId,
                        status: 'APPROVED'
                    }
                })
            }
        }
    }

    // Budget
    await prisma.budget.create({
        data: {
            projectId,
            totalBudget: 150000,
            spentAmount: 45000,
            remainingAmount: 105000,
            status: 'ACTIVE'
        }
    })

    // Estimate
    await prisma.estimate.create({
        data: {
            projectId,
            estimatedHours: 120,
            estimatedCost: 12000,
            status: 'APPROVED'
        }
    })

    // TimeLogs
    await prisma.timeLog.create({
        data: {
            projectId,
            userId: architectId,
            duration: 4.5,
            category: 'DESIGN',
            date: new Date(),
            description: 'Trabalho no layout executivo'
        }
    })
}

main().catch(e => {
    console.error(e)
    process.exit(1)
}).finally(async () => {
    await prisma.$disconnect()
})
