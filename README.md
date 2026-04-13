# Memoriza

Smart date reminders. Never forget what matters most.

## Stack

- **Framework:** Next.js 14 App Router + TypeScript
- **Styling:** Tailwind CSS (dark-only)
- **Database:** Neon (PostgreSQL) + Drizzle ORM
- **Auth:** Auth.js v5 + Resend magic links
- **Email:** Resend
- **Media:** Cloudinary
- **Rate limiting:** Upstash Redis
- **Deploy:** Vercel

## Local setup

```bash
cp .env.example .env.local
# fill in .env.local values

npm install
npm run db:push      # push schema to Neon
npm run dev
```

## DB commands

```bash
npm run db:generate  # generate migration after schema change
npm run db:push      # push directly (dev)
npm run db:migrate   # run migrations (production)
npm run db:studio    # Drizzle Studio GUI
```

## Deploy

Push to `main` → Vercel auto-deploys.

Add all `.env.example` vars to the Vercel dashboard before first deploy.

## Cron

`/api/cron/reminders` runs daily at 08:00 UTC (configured in `vercel.json`).
Protected by `CRON_SECRET` bearer token.

## Design

See `DESIGN_GUIDE.md` — update it with every UI/design change.
