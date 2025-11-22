import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const email = 'superadmin@crm.com';
  const newPlain = 'PasswordTest123';
  const hashed = await bcrypt.hash(newPlain, 10);
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashed }
  });
  console.log('Password reset for user id:', user.id);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });