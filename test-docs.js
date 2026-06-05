// test-docs.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const docs = await prisma.deliverable.findMany({
            select: { id: true, name: true, deletedAt: true, metadata: true }
        });
        console.log("TOTAL DOCS:", docs.length);
        console.log(JSON.stringify(docs, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
