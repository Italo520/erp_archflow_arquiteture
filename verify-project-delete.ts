import { prisma } from './lib/prisma';

async function main() {
  const projectId = 'fad93357-0ab5-4454-b7ca-b0599151b827';
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });
  console.log('--- PROJECT IN DATABASE ---');
  if (project) {
    console.log(`ID: ${project.id}`);
    console.log(`Name: ${project.name}`);
    console.log(`DeletedAt: ${project.deletedAt}`);
  } else {
    console.log('Project not found in database at all (not even soft-deleted)!');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
