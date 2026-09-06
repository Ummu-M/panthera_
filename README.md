# Panthera Rover Crew Portal

A Next.js portal for the Kenyatta University Panthera Rover Crew. The app provides a public landing page, Google sign-in, membership registration, role-based access control, member profiles, events, gallery management, and administrator tools.

## Features

- Google authentication with NextAuth
- Prisma ORM with PostgreSQL/Supabase
- Membership registration and approval workflow
- Role-based access control for crew leadership roles
- Member dashboard and profile management
- Event creation and management
- Photo gallery management
- Administrator member management
- Responsive App Router interface

## Tech Stack

- Next.js 16
- React 18
- TypeScript
- NextAuth
- Prisma 5
- PostgreSQL, including Supabase
- Lucide React and React Icons

## Requirements

- Node.js 18 or newer
- npm
- A PostgreSQL database
- Google OAuth credentials for sign-in

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
   NEXTAUTH_SECRET="replace-with-a-long-random-secret"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ADMIN_EMAIL="admin@example.com"
   ```

   `DATABASE_URL` uses Supabase's IPv4 shared transaction pooler. `DIRECT_URL` uses the session-mode pooler for Prisma migration commands. Keep `.env` private and never commit credentials.

3. Generate the Prisma client and apply the schema:

   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run the project linter |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:push` | Apply the Prisma schema to the database |
| `npm run seed` | Seed roles and the configured admin user |
| `npm run server` | Start the legacy Node server in `server/index.js` |

## Main Routes

- `/` - Public landing page, sign-in, and membership registration
- `/dashboard` - Authenticated member dashboard
- `/profile` - Member profile
- `/admin` - Administrator dashboard
- `/admin/users` - Member administration
- `/access-denied` - Unauthorized access page
- `/privacy` - Privacy policy
- `/terms` - Terms of service

API endpoints are available under `/api`, including authentication, registration, profile, events, gallery, and administrator members.

## Roles and Access

Roles are stored in the Prisma `Role` model and connected to users through `User.roleId`. Available seeded roles include:

- `SYSTEM_ADMIN`
- `MEMBER`
- `SECRETARY`
- `OG`
- `TREASURER`
- `QUARTERMASTER`
- `DISCIPLINARIAN`
- `CREW_LEADER`
- `ASSISTANT_CREW_LEADER`

Route access is enforced by `middleware.ts`. Users without permission are redirected to `/access-denied`.

## Database Models

The Prisma schema includes authentication models required by NextAuth plus application models for:

- Roles and users
- OAuth accounts and sessions
- Verification tokens
- Events
- Photos
- Payments

The schema is defined in `prisma/schema.prisma`, and the seed data is in `prisma/seed.ts`.

## Project Structure

```text
app/         Next.js App Router pages and components
lib/         Shared Prisma and theme helpers
pages/api/   API routes
prisma/      Prisma schema and seed script
public/      Static assets and service worker
server/      Legacy Node server entry points
```

## Deployment Notes

Before deploying:

1. Configure all required environment variables in the hosting provider.
2. Make sure the PostgreSQL database is reachable from the deployment environment.
3. Run `prisma generate` during installation or build.
4. Apply the schema with `prisma db push` or your chosen migration workflow.
5. Configure the Google OAuth callback URL for the deployed domain.

For production, use a strong `NEXTAUTH_SECRET` and restrict `ADMIN_EMAIL` to the intended administrator account.
