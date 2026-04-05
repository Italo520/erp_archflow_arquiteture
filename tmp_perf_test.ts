import { prisma } from './lib/prisma';

async function testPerformance() {
    console.time('Prisma Init & Query');
    try {
        await prisma.user.count();
        console.timeEnd('Prisma Init & Query');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testPerformance();
