import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/server/auth';

const prisma = new PrismaClient();

async function main() {
  const businessName = process.env.SEED_BUSINESS_NAME;
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!businessName || !adminEmail || !adminPassword) {
    console.log('No seed values provided. Skipping initial business creation.');
    return;
  }

  const passwordHash = await hashPassword(adminPassword);
  await prisma.business.upsert({
    where: { email: adminEmail.toLowerCase() },
    create: {
      name: businessName,
      email: adminEmail.toLowerCase(),
      passwordHash,
      plan: 'profesional',
      barbers: {
        create: {
          firstName: 'Administrador',
          lastName: '',
          role: 'administrador',
          email: adminEmail.toLowerCase(),
          passwordHash
        }
      }
    },
    update: {}
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
