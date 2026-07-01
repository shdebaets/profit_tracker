# Profit Tracker

Track products, purchase batches, and sales, and see profit/margin/inventory
value on a dashboard with charts. Phase 1 of a larger multi-feature site
(future phases: J1G profile generator, Cross Lister, VCC Creator).

Stack: Next.js (App Router, TypeScript) + Tailwind + shadcn/ui + Recharts,
Prisma 7 (with the `@prisma/adapter-pg` driver adapter) against Postgres,
Auth.js v5 (credentials + bcrypt + JWT sessions).

## Local development

### 1. Database

This project expects a Postgres database. For local dev, a project-scoped
Postgres cluster was created under `.devdb/` (gitignored, not shared with any
other Postgres install on this machine) and is not started automatically —
start it before running the app:

```bash
export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"
pg_ctl -D .devdb/data -o "-p 5433 -k /tmp" -l .devdb/log start
```

Stop it with:

```bash
pg_ctl -D .devdb/data stop
```

`.env` already points `DATABASE_URL`/`DIRECT_URL` at `localhost:5433`. If you'd
rather use a different Postgres (local or hosted, e.g. Neon), just update
those two values.

### 2. Install and run

```bash
npm install
npx prisma migrate dev   # applies the schema, only needed after schema changes
npm run dev
```

Open http://localhost:3000 — it redirects to `/signup` or `/dashboard`
depending on whether you're logged in.

### Useful commands

- `npm run build` — production build (also type-checks)
- `npx eslint .` — lint
- `npx prisma studio` — browse the local database

## Data model

`User` → `Product` → `ProductBatch` (a purchase lot: quantity + unit cost) and
`Sale` (quantity + sale price). Cost basis is a moving weighted average across
a product's batches; each `Sale` snapshots that average cost at the moment
it's recorded (`unitCostAtSaleCents`), so profit on past sales never shifts
retroactively when a new batch is added later. See `lib/analytics.ts` for the
calculations and `prisma/schema.prisma` for the schema.

## Deploying

Intended target is Vercel + a serverless Postgres (Neon, or Vercel's own
Postgres storage tab, which is Neon under the hood):

1. Provision a Postgres database and grab both a pooled connection string
   (`DATABASE_URL`) and a direct/unpooled one (`DIRECT_URL`).
2. Set `DATABASE_URL`, `DIRECT_URL`, and `AUTH_SECRET` (generate with
   `npx auth secret`) as environment variables on the Vercel project.
3. Run `npx prisma migrate deploy` against the production database (e.g. as
   part of the build step) before or during first deploy.
4. Deploy the repo to Vercel as a standard Next.js app.
