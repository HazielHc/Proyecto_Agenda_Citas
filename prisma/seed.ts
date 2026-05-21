import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/server/auth';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hashPassword('admin12345');
  const barberPassword = await hashPassword('barbero12345');

  const business = await prisma.business.upsert({
    where: { email: 'admin@barberia.com' },
    create: {
      name: 'Barberia El Navajero',
      email: 'admin@barberia.com',
      passwordHash: adminPassword,
      plan: 'profesional',
      barbers: {
        create: [
          {
            firstName: 'Carlos',
            lastName: 'Mendoza',
            role: 'administrador',
            email: 'admin@barberia.com',
            passwordHash: adminPassword
          },
          {
            firstName: 'Hector',
            lastName: 'Ruiz',
            role: 'barbero',
            email: 'barbero@barberia.com',
            passwordHash: barberPassword
          }
        ]
      }
    },
    update: {}
  });

  const admin = await prisma.barber.findFirstOrThrow({
    where: { businessId: business.id, email: 'admin@barberia.com' }
  });

  const clients = [
    ['Alejandro', 'Torres', '5512345678', 'Corte y barba', '2026-05-20T09:00:00.000Z', 'confirmada', 250],
    ['Ivan', 'Garcia', '5598765432', 'Corte de cabello', '2026-05-20T10:00:00.000Z', 'llegada', 180],
    ['Miguel Angel', 'Reyes', '5545678901', 'Afeitado clasico', '2026-05-20T11:00:00.000Z', 'en_servicio', 200],
    ['Jorge', 'Herrera', '5533445566', 'Perfilado de barba', '2026-05-20T13:00:00.000Z', 'completada', 150]
  ] as const;

  for (const [firstName, lastName, phone, service, scheduledAt, status, pricePaid] of clients) {
    const client = await prisma.client.upsert({
      where: { businessId_phone: { businessId: business.id, phone } },
      create: { businessId: business.id, firstName, lastName, phone },
      update: { firstName, lastName }
    });

    const existing = await prisma.appointment.findFirst({
      where: { businessId: business.id, clientId: client.id, scheduledAt: new Date(scheduledAt) }
    });

    if (!existing) {
      await prisma.appointment.create({
        data: {
          businessId: business.id,
          clientId: client.id,
          barberId: admin.id,
          service,
          scheduledAt: new Date(scheduledAt),
          durationMin: service === 'Corte y barba' ? 45 : service === 'Perfilado de barba' ? 20 : 30,
          status,
          channel: 'manual',
          pricePaid
        }
      });
    }
  }
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
