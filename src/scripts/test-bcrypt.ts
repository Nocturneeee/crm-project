import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const email = 'superadmin@crm.com';
  const user = await prisma.user.findUnique({ where: { email } });
  console.log('Found user:', !!user);
  if (!user) return;

  const hash = user.password ?? '';
  console.log('Stored hash (raw):', JSON.stringify(hash));
  console.log('Hash length:', hash.length);

  const plain = 'PasswordTest123';
  const result = await bcrypt.compare(plain, hash);
  console.log('bcrypt.compare result:', result);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });