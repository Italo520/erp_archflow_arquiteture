import { prisma } from './lib/prisma';

async function main() {
  const projectId = 'c495f031-f5a0-4bb7-8923-b24b31364e45';
  const stages = await prisma.stage.findMany({
    where: { projectId },
    orderBy: { order: 'asc' }
  });
  console.log('--- ALL STAGES FOR PROJECT ---');
  console.log(JSON.stringify(stages, null, 2));

  const tasks = await prisma.task.findMany({
    where: { projectId }
  });
  console.log('--- ALL TASKS FOR PROJECT ---');
  console.log(JSON.stringify(tasks, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
