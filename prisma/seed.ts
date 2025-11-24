import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

const roleData = [
  { name: 'ADMIN' },
  { name: 'SALES' },
  { name: 'LEAD' },
];

async function main() {
  console.log('Start seeding roles...');
  
  for (const r of roleData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    console.log(`Created or updated role with ID: ${role.id} and Name: ${role.name}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
