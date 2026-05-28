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

    // 1. Criar Usuários (Gerando pelo menos 20 usuários)
    console.log('Seeding 20 Users...')
    const passwordHash = await hash('password123', 10)
    const users: any[] = []

    const admin = await prisma.user.create({
        data: {
            fullName: 'Italo Sampaio',
            email: 'admin@archflow.local',
            passwordHash,
            role: 'OWNER'
        }
    })
    users.push(admin)

    const architect = await prisma.user.create({
        data: {
            fullName: 'Ana Arquiteta',
            email: 'ana@archflow.local',
            passwordHash,
            role: 'EDITOR'
        }
    })
    users.push(architect)

    // Mais 18 usuários de teste para somar 20 usuários
    for (let i = 1; i <= 18; i++) {
        const u = await prisma.user.create({
            data: {
                fullName: `Profissional Arch #${i}`,
                email: `profissional${i}@archflow.local`,
                passwordHash,
                role: i % 3 === 0 ? 'OWNER' : (i % 3 === 1 ? 'EDITOR' : 'VIEWER')
            }
        })
        users.push(u)
    }

    // 2. Dados Mestres: Clientes e Projetos (20 Clientes e 20 Projetos correspondentes)
    console.log('Seeding 20 Clients and Projects...')
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
        { name: 'Residência Alphaville', status: 'ACTIVE', category: 'RESIDENTIAL', spent: 350000 },
        { name: 'Edifício Corporate Tower', status: 'ACTIVE', category: 'COMMERCIAL', spent: 1200000 },
        { name: 'Restaurante Sabor & Arte', status: 'ACTIVE', category: 'COMMERCIAL', spent: 180000 },
        { name: 'Galpão Logística Norte', status: 'PROSPECT', category: 'INDUSTRIAL', spent: 0 },
        { name: 'Casa de Praia Vista Alegre', status: 'ACTIVE', category: 'RESIDENTIAL', spent: 400000 },
        { name: 'Estúdio Criativo Design', status: 'ACTIVE', category: 'COMMERCIAL', spent: 75000 },
        { name: 'Coworking Smart Hub', status: 'ACTIVE', category: 'COMMERCIAL', spent: 220000 },
        { name: 'Museu de Arte Moderna', status: 'ACTIVE', category: 'INSTITUTIONAL', spent: 950000 },
        { name: 'Consultório Odonto Prime', status: 'ACTIVE', category: 'COMMERCIAL', spent: 90000 },
        { name: 'Teatro Municipal Alpha', status: 'ACTIVE', category: 'INSTITUTIONAL', spent: 1100000 }
    ]

    for (let i = 0; i < clientsBatch.length; i++) {
        const cData = clientsBatch[i]
        const assignedUser = users[i % users.length]
        
        const client = await prisma.client.create({
            data: {
                name: cData.name,
                email: `contato@${cData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                status: cData.status as ClientStatus,
                category: cData.category as any,
                totalSpent: cData.spent,
                userId: assignedUser.id,
                document: `000000000${10 + i}`,
                phone: `(11) 9999-00${10 + i}`
            }
        })

        // Criar Projeto para cada cliente (20 projetos no total!)
        const project = await prisma.project.create({
            data: {
                name: `Reforma ${cData.name}`,
                status: 'PLANNING',
                ownerId: assignedUser.id,
                clientId: client.id,
                projectType: cData.category,
                plannedCost: 50000 + (i * 10000),
                actualCost: i % 3 === 0 ? (30000 + (i * 5000)) : 0,
                startDate: new Date(),
                deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // +60 dias
            }
        })

        // Associar o proprietário e o admin como membros (OWNER) do projeto
        await prisma.projectMember.create({
            data: {
                projectId: project.id,
                userId: assignedUser.id,
                role: 'OWNER'
            }
        })

        if (assignedUser.id !== admin.id) {
            await prisma.projectMember.create({
                data: {
                    projectId: project.id,
                    userId: admin.id,
                    role: 'OWNER'
                }
            })
        }

        // Criar as 4 colunas Kanban específicas e associadas a este projeto (80 no total!)
        const colPlanning = await prisma.projectKanbanColumn.create({
            data: { title: 'Planejamento', color: 'bg-blue-500', order: 0, projectId: project.id }
        })
        const colInProgress = await prisma.projectKanbanColumn.create({
            data: { title: 'Em Andamento', color: 'bg-emerald-500', order: 1, projectId: project.id }
        })
        const colOnHold = await prisma.projectKanbanColumn.create({
            data: { title: 'Pausado', color: 'bg-amber-500', order: 2, projectId: project.id }
        })
        const colCompleted = await prisma.projectKanbanColumn.create({
            data: { title: 'Concluído', color: 'bg-slate-500', order: 3, projectId: project.id }
        })

        const projectCols = [colPlanning, colInProgress, colOnHold, colCompleted]
        const chosenCol = projectCols[i % projectCols.length]

        // Atualizar o status real do projeto com o ID da coluna Kanban específica dele
        await prisma.project.update({
            where: { id: project.id },
            data: { status: chosenCol.id }
        })

        // 3. Detalhes do Projeto: Stages, Tasks, Budget, Estimates, TimeLogs, Deliverables
        // Como o loop roda 20 vezes, teremos 20 Budgets, 20 Estimates e 20 TimeLogs criados!
        await seedProjectDetails(project.id, admin.id, assignedUser.id)
    }

    // 5. Atividades do Dia (Agenda) para o Dashboard (20 Atividades no total!)
    console.log('Seeding 20 Agenda Activities...')
    const agendaTypes = ['MEETING', 'SITE_VISIT', 'DESIGN', 'CALL']
    for (let i = 0; i < 20; i++) {
        const start = new Date()
        start.setDate(start.getDate() + (i - 10)) // distribui em datas passadas e futuras
        start.setHours(9 + (i % 8), 0, 0, 0)

        await prisma.activity.create({
            data: {
                title: `Atividade Técnica #${i + 1}`,
                type: agendaTypes[i % agendaTypes.length] as ActivityType,
                startTime: start,
                endTime: new Date(start.getTime() + 60 * 60 * 1000),
                createdById: admin.id,
                status: 'SCHEDULED'
            }
        })
    }

    // 6. Notificações e Audit (20 Notificações e 20 AuditLogs!)
    console.log('Seeding 20 Notifications and Audit Logs...')
    for (let i = 0; i < 20; i++) {
        await prisma.notification.create({
            data: {
                userId: users[i % users.length].id,
                title: `Notificação Crítica #${i + 1}`,
                message: `Este é um alerta automático de depuração número ${i + 1} para auditoria.`,
                type: i % 2 === 0 ? 'INFO' : 'SYSTEM',
                relatedEntityId: admin.id,
                relatedEntityType: 'PROJECT'
            }
        })

        await prisma.auditLog.create({
            data: {
                userId: users[i % users.length].id,
                action: i % 3 === 0 ? 'CREATE' : (i % 3 === 1 ? 'UPDATE' : 'DELETE'),
                entityType: 'PROJECT',
                entityId: 'fake-id-' + i,
                ipAddress: '127.0.0.1'
            }
        })
    }

    console.log('Seeding finished successfully. Happy coding!')
}

async function seedProjectDetails(projectId: string, adminId: string, architectId: string) {
    // Stages (3 Stages por projeto = 60 no total!)
    const phases = [
        { name: 'Levantamento', tasks: ['Medição In Loco', 'Fotos do Terreno', 'Entrevista Briefing'] },
        { name: 'Estudo Preliminar', tasks: ['Layout 2D', 'Conceito Criativo', 'Aprovação Estudo'] },
        { name: 'Projeto Executivo', tasks: ['Detalhamento Gesso', 'Planta Hidráulica', 'Executivo Marcenaria'] }
    ]

    for (let i = 0; i < phases.length; i++) {
        const stage = await prisma.stage.create({
            data: { name: phases[i].name, order: i, projectId }
        })

        // Tasks (9 Tasks por projeto = 180 no total!)
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

            // Deliverables (3 Deliverables por projeto = 60 no total!)
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

    // Budget (1 Budget por projeto = 20 no total!)
    await prisma.budget.create({
        data: {
            projectId,
            totalBudget: 150000,
            spentAmount: 45000,
            remainingAmount: 105000,
            status: 'ACTIVE'
        }
    })

    // Estimate (1 Estimate por projeto = 20 no total!)
    await prisma.estimate.create({
        data: {
            projectId,
            estimatedHours: 120,
            estimatedCost: 12000,
            status: 'APPROVED'
        }
    })

    // TimeLogs (1 TimeLog por projeto = 20 no total!)
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
