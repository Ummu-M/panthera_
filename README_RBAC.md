RBAC Implementation Notes

Overview:
- Prisma + Neon PostgreSQL
- Next.js App Router
- NextAuth (Google) with Prisma Adapter
- Roles stored in `Role` model; each `User` has exactly one role via `roleId`.

Setup:
1. Set env vars:
   - `DATABASE_URL` (Neon Postgres)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `ADMIN_EMAIL` (optional)

2. Install dependencies:

```bash
npm install
```

3. Run Prisma migrate and seed:

```bash
npx prisma generate
npx prisma db push
npm run seed
```

Notes:
- Middleware rewrites unauthorized requests to `/(auth)/access-denied`.
- `middleware.ts` contains a `rolePermissions` map that should be expanded per route.
- Add UI components in `app/components` and pages under `app/`.
