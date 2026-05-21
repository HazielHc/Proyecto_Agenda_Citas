import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import { prisma } from './prisma';
import {
  AuthSession,
  hashPassword,
  signToken,
  verifyPassword,
  verifyToken
} from './auth';
import { dbStatusToUi, getServiceById, services, splitDateTime, toScheduledAt, uiStatusToDb } from './mappers';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      session?: AuthSession;
    }
  }
}

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  try {
    req.session = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.role !== 'administrador') {
    return res.status(403).json({ error: 'Administrator role is required' });
  }
  return next();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toUiAppointment(appointment: any) {
  const { date, time } = splitDateTime(appointment.scheduledAt);
  const service = services.find((item) => item.name === appointment.service) ?? services[0];

  return {
    id: String(appointment.id),
    clientName: appointment.client.firstName,
    clientLastName: appointment.client.lastName,
    phone: appointment.client.phone,
    serviceId: service.id,
    date,
    time,
    barber: appointment.barber
      ? `${appointment.barber.firstName} ${appointment.barber.lastName}`.trim()
      : 'Sin asignar',
    status: dbStatusToUi[appointment.status] ?? 'Agendada',
    elapsedTime: appointment.startedAt
      ? Math.max(0, Math.floor((Date.now() - new Date(appointment.startedAt).getTime()) / 1000))
      : undefined,
    pricePaid: appointment.pricePaid ? Number(appointment.pricePaid) : undefined
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'AgendaBarber API' });
});

app.get('/api/services', (_req, res) => {
  res.json({ services });
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { businessName, email, password, plan = 'profesional', ownerFirstName = 'Propietario', ownerLastName = '' } = req.body;
    if (!businessName || !email || !password) {
      return res.status(400).json({ error: 'businessName, email and password are required' });
    }

    const passwordHash = await hashPassword(password);
    const normalizedEmail = normalizeEmail(email);
    const business = await prisma.business.create({
      data: {
        name: businessName,
        email: normalizedEmail,
        passwordHash,
        plan,
        barbers: {
          create: {
            firstName: ownerFirstName,
            lastName: ownerLastName,
            role: 'administrador',
            email: normalizedEmail,
            passwordHash
          }
        }
      },
      include: { barbers: true }
    });

    const owner = business.barbers[0];
    const token = signToken({
      barberId: owner.id,
      businessId: business.id,
      email: owner.email,
      role: owner.role,
      name: `${owner.firstName} ${owner.lastName}`.trim(),
      businessName: business.name
    });

    return res.status(201).json({ token, user: verifyToken(token) });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(String(req.body.email || ''));
    const password = String(req.body.password || '');
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const barber = await prisma.barber.findFirst({
      where: { email, active: true },
      include: { business: true }
    });

    if (!barber || !(await verifyPassword(password, barber.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({
      barberId: barber.id,
      businessId: barber.businessId,
      email: barber.email,
      role: barber.role,
      name: `${barber.firstName} ${barber.lastName}`.trim(),
      businessName: barber.business.name
    });

    return res.json({ token, user: verifyToken(token) });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: req.session });
});

app.get('/api/appointments', requireAuth, async (req, res, next) => {
  try {
    const date = typeof req.query.date === 'string' ? req.query.date : undefined;
    const where: any = { businessId: req.session!.businessId };

    if (date) {
      where.scheduledAt = {
        gte: new Date(`${date}T00:00:00.000Z`),
        lt: new Date(`${date}T23:59:59.999Z`)
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { client: true, barber: true },
      orderBy: { scheduledAt: 'asc' }
    });

    return res.json({ appointments: appointments.map(toUiAppointment) });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/appointments', requireAuth, async (req, res, next) => {
  try {
    const {
      clientName,
      clientLastName,
      phone,
      serviceId,
      date,
      time,
      channel = 'web',
      status = 'Agendada'
    } = req.body;

    if (!clientName || !clientLastName || !phone || !serviceId || !date || !time) {
      return res.status(400).json({ error: 'Missing appointment fields' });
    }

    const service = getServiceById(serviceId);
    const scheduledAt = toScheduledAt(date, time);

    const appointment = await prisma.$transaction(async (tx) => {
      const overlap = await tx.appointment.findFirst({
        where: {
          businessId: req.session!.businessId,
          scheduledAt,
          status: { notIn: ['cancelada', 'no_asistio'] }
        }
      });

      if (overlap) {
        throw Object.assign(new Error('Time slot is already reserved'), { statusCode: 409 });
      }

      const client = await tx.client.upsert({
        where: {
          businessId_phone: {
            businessId: req.session!.businessId,
            phone
          }
        },
        create: {
          businessId: req.session!.businessId,
          firstName: clientName,
          lastName: clientLastName,
          phone
        },
        update: {
          firstName: clientName,
          lastName: clientLastName
        }
      });

      return tx.appointment.create({
        data: {
          businessId: req.session!.businessId,
          clientId: client.id,
          barberId: req.session!.barberId,
          service: service.name,
          scheduledAt,
          durationMin: service.duration,
          status: uiStatusToDb[status] ?? 'agendada',
          channel,
          pricePaid: service.price
        },
        include: { client: true, barber: true }
      });
    });

    return res.status(201).json({ appointment: toUiAppointment(appointment) });
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/appointments/:id/status', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const nextStatus = uiStatusToDb[req.body.status as keyof typeof uiStatusToDb];
    if (!id || !nextStatus) {
      return res.status(400).json({ error: 'Valid appointment id and status are required' });
    }

    const data: any = { status: nextStatus };
    const now = new Date();
    if (nextStatus === 'llegada') data.arrivedAt = now;
    if (nextStatus === 'en_servicio') data.startedAt = now;
    if (nextStatus === 'completada') data.finishedAt = now;

    const existing = await prisma.appointment.findFirst({
      where: { id, businessId: req.session!.businessId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data,
      include: { client: true, barber: true }
    });

    return res.json({ appointment: toUiAppointment(appointment) });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/clients', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      where: { businessId: req.session!.businessId },
      include: {
        appointments: {
          include: { client: true, barber: true },
          orderBy: { scheduledAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      clients: clients.map((client) => ({
        id: client.id,
        clientName: client.firstName,
        clientLastName: client.lastName,
        phone: client.phone,
        totalAppointments: client.appointments.length,
        history: client.appointments.map(toUiAppointment)
      }))
    });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/reports/summary', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const businessId = req.session!.businessId;
    const appointments = await prisma.appointment.findMany({
      where: { businessId },
      include: { client: true, barber: true }
    });

    const byStatus = appointments.reduce<Record<string, number>>((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {});

    const servicesCount = appointments.reduce<Record<string, number>>((acc, appointment) => {
      if (appointment.status === 'completada') {
        acc[appointment.service] = (acc[appointment.service] || 0) + 1;
      }
      return acc;
    }, {});

    return res.json({
      totals: {
        booked: appointments.length,
        completed: byStatus.completada || 0,
        canceled: byStatus.cancelada || 0,
        noShow: byStatus.no_asistio || 0
      },
      popularServices: Object.entries(servicesCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      appointments: appointments.map(toUiAppointment)
    });
  } catch (error) {
    return next(error);
  }
});

app.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = error.statusCode || 500;
  const message = status === 500 ? 'Unexpected server error' : error.message;
  if (status === 500) {
    console.error(error);
  }
  res.status(status).json({ error: message });
});

app.listen(port, () => {
  console.log(`AgendaBarber API listening on http://localhost:${port}/api`);
});
