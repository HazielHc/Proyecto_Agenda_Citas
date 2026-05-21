# AgendaBarber

Prototipo migrando hacia el MVP V2 descrito en el SRS: SaaS multi-tenant para barberias con agenda web, dashboard operativo y base preparada para WhatsApp/IA.

## Requisitos

- Node.js
- PostgreSQL compatible con Supabase

## Variables de entorno

Copia `.env.example` a `.env` y ajusta:

```env
VITE_API_URL="http://localhost:4000/api"
PORT="4000"
DATABASE_URL="postgresql://usuario:password@host:5432/agendabarber?schema=public"
JWT_SECRET="change-this-secret-before-deploy"
JWT_EXPIRES_IN_SECONDS="28800"
```

## Desarrollo

```bash
npm install
npm run prisma:generate
npm run prisma:seed
npm run dev:api
npm run dev
```

Credenciales demo del seed:

- Administrador: `admin@barberia.com` / `admin12345`
- Barbero: `barbero@barberia.com` / `barbero12345`

## Estado SRS

Implementado como primera base V2:

- Modelo Prisma multi-tenant con negocios, barberos, clientes, citas y lista de espera.
- API Express inicial con autenticacion por token, registro/login, citas, clientes y reportes base.
- Frontend conectado al API para login, carga de citas, creacion y cambio de estado.

Pendiente para completar V2:

- Socket.io para tiempo real.
- BullMQ/Upstash para recordatorios, tolerancia y jobs.
- Baileys + Groq para WhatsApp e IA.
- Migraciones/deploy Supabase y Oracle/Vercel.
