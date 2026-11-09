# Panthera Rover Crew Portal

A Next.js portal for the Kenyatta University Panthera Rover Crew. The app provides a public landing page, Google sign-in, membership registration, role-based access control, member profiles, events, gallery management, and administrator tools.

## Features

- Google authentication with NextAuth
- Prisma ORM with PostgreSQL/Supabase
- Membership registration and approval workflow
- Role-based access control for crew leadership roles
- Member dashboard and profile management
- Leadership member directory with clickable approved-member tags and badge progress
- Event creation and management
- Photo gallery management
- Administrator member management
- Optional browser push notifications for members and crew broadcasts for authorized admins
- Member-managed badge progress with a read-only RSL progress view
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
   EMAIL_SERVER="smtps://username:password@smtp.example.com:465"
   EMAIL_FROM="Panthera Rover Crew <login@example.com>"
   VAPID_PUBLIC_KEY="your-web-push-public-key"
   VAPID_PRIVATE_KEY="your-web-push-private-key"
   VAPID_SUBJECT="mailto:kupantherascouts@gmail.com"
   ```

   `DATABASE_URL` uses Supabase's IPv4 shared transaction pooler. `DIRECT_URL` uses the session-mode pooler for Prisma migration commands. Keep `.env` private and never commit credentials.

   Passwordless email sign-in is enabled when both `EMAIL_SERVER` and `EMAIL_FROM` are configured. Use the SMTP connection URL and sender address from your mail provider, and URL-encode special characters in the SMTP username or password. Email sign-in sends a six-digit code that expires after 10 minutes and allows up to five verification attempts.

   Generate a VAPID key pair with `npx web-push generate-vapid-keys`. Set these three variables in the local `.env` and add the same names to your hosting provider's environment settings:

   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` (a contact URI, for example `mailto:crew@example.com`)

   Keep the private key secret; never commit real key values. Push notifications require HTTPS in production; localhost is allowed for development.

   If `/api/push/public-key` responds with `503`, configure all three VAPID variables and restart the app. Members must enable notifications on each device, and admins can only reach devices with a saved subscription. Once enabled, use **Send test notification** in the member dashboard's Profile tab to verify delivery to that device.

3. Generate the Prisma client and apply the schema:

   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db execute --schema prisma\schema.prisma --file prisma\backfill-badge-progress.sql
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
- `/admin/notifications` - Send a browser push notification to opted-in devices
- `/admin/users` - Member administration
- `/admin/members` - Read-only directory of approved members and their badge progress for crew leadership
- `/access-denied` - Unauthorized access page
- `/privacy` - Privacy policy
- `/terms` - Terms of service

API endpoints are available under `/api`, including authentication, registration, profile, events, gallery, administrator members, and leadership member details.

The crew member directory is available to system administrators, the secretary, the Rover Scout Leader, the Crew Leader, and the Assistant Crew Leader. Only approved members appear; selecting a member loads their details and badge progress.

Crew applications require a full name, valid email address, phone number, student/registration number, school/faculty, course/programme, and year of study before submission. System administrator accounts are kept separate from student member lists and counts.

Members set badge progress to Not started, In progress, or Completed and can attach PDF, Word, JPEG, PNG, or WebP evidence up to 10 MB from the Badges tab on `/dashboard`. The RSL's `/admin/badges` page is read-only. The schema adds `progressStatus` and `updatedAt` without removing the legacy review fields or records; after `prisma db push`, run the one-time backfill command above to map old approved rows to Completed. Members enable or disable push notifications from the Profile tab on `/dashboard`. Authorized admins can broadcast a title, message, and internal destination from `/admin/notifications`. Delivery only targets devices that opted in; expired browser subscriptions are removed automatically.

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

Annual crew role assignments can be made by the `SYSTEM_ADMIN` or `RSL` after the crew confirms its appointments. On `/admin/users`, either selects a role on an approved member's row; reassigning a leadership role moves it from the previous holder. Secretaries can review applications but cannot assign roles. System administrator accounts cannot be assigned as student leadership members.

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
