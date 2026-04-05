import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const columns = await prisma.projectKanbanColumn.findMany()
    console.log('COLUMNS IN DB:', JSON.stringify(columns, null, 2))
    
    const projects = await prisma.project.findMany({
        select: { id: true, name: true, status: true }
    })
    console.log('PROJECTS IN DB:', JSON.stringify(projects, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
