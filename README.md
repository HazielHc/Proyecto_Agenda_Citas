# AgendaBarber

Sistema SaaS para gestion de citas de barberias. Incluye panel privado del negocio, agendado publico, cancelacion publica con validacion por telefono, autenticacion y persistencia con PostgreSQL mediante Prisma.

## Rutas

- `/` Panel operativo del negocio
- `/book` Pagina publica para agendar citas
- `/cancel` Pagina publica para cancelar citas
- `/register` Registro inicial de negocio

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

Para crear un negocio inicial por consola puedes definir temporalmente:

```env
SEED_BUSINESS_NAME="Nombre de la barberia"
SEED_ADMIN_EMAIL="admin@negocio.com"
SEED_ADMIN_PASSWORD="una-contrasena-segura"
```

## Desarrollo

```bash
npm install
npm run prisma:generate
npm run prisma:seed
npm run dev:api
npm run dev
```

## Produccion

1. Configura `DATABASE_URL` con Supabase/PostgreSQL.
2. Ejecuta `npx prisma db push` o migraciones Prisma.
3. Define un `JWT_SECRET` fuerte.
4. Levanta el backend Express en el servidor.
5. Despliega el frontend con `VITE_API_URL` apuntando al backend HTTPS.

Pendiente para completar todo el SRS V2: Socket.io, jobs con Redis/BullMQ, Baileys y Groq para WhatsApp/IA.
