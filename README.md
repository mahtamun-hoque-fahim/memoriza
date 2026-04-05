# Countdown App

> Create a beautiful shareable countdown to any event. Birthdays, launches, anniversaries — anything worth the wait.

**Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · Neon (PostgreSQL) · Drizzle ORM · Vercel

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo-url>
cd countdown-app
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your values:
- `DATABASE_URL` — Neon pooled connection string (from Neon dashboard)
- `DATABASE_URL_UNPOOLED` — Neon direct connection string (for migrations)
- `NEXT_PUBLIC_BASE_URL` — your public URL (e.g. `https://countdown.vercel.app`)
- `IP_SALT` — any random secret string (used to hash IPs before storage)

### 3. Run database migrations

```bash
npx drizzle-kit push
```

> Use `push` for development. Use `migrate` for production (generates SQL files first with `generate`).

### 4. Start dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── page.tsx              ← Homepage (creation form)
├── layout.tsx            ← Root layout (fonts, dark class)
├── globals.css           ← Base styles, animations
├── not-found.tsx         ← Custom 404
├── c/[slug]/
│   ├── page.tsx          ← Countdown display (SSR + client timer)
│   └── loading.tsx       ← Skeleton loader
└── api/
    ├── create/route.ts   ← POST — create countdown (Node.js runtime)
    └── c/route.ts        ← GET — fetch countdown data (Edge runtime)

components/countdown/
├── CreateForm.tsx         ← Client form with validation
├── CountdownTimer.tsx     ← Live client-side timer
└── ShareBar.tsx           ← Copy link + Web Share API

lib/
├── db/
│   ├── index.ts          ← Edge-compatible Neon driver (neon-http)
│   └── schema.ts         ← Drizzle schema + inferred types
├── env.ts                ← Env var validation
├── utils.ts              ← Slug generator, IP hasher, time helpers
└── validations.ts        ← Zod schemas (shared client + server)

drizzle/                  ← Generated migration files
drizzle.config.ts
DESIGN_GUIDE.md           ← Design system reference (update on every UI change)
```

---

## Database Schema

```sql
CREATE TABLE countdowns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(16) UNIQUE NOT NULL,
  name        VARCHAR(80) NOT NULL,
  emoji       VARCHAR(8),
  timezone    VARCHAR(64) NOT NULL,
  event_date  TIMESTAMPTZ NOT NULL,
  ip_hash     VARCHAR(64) NOT NULL,   -- SHA-256 of IP + salt
  deleted_at  TIMESTAMPTZ,            -- soft delete
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_countdowns_slug       ON countdowns(slug);
CREATE INDEX idx_countdowns_ip_hash    ON countdowns(ip_hash);
CREATE INDEX idx_countdowns_event_date ON countdowns(event_date);
```

---

## Rate Limiting

- **10 active countdowns per IP** (enforced server-side)
- IPs are never stored raw — hashed with SHA-256 + `IP_SALT`
- Returns HTTP 429 with `code: "LIMIT_REACHED"` when exceeded

---

## Deploy to Vercel

1. Push to GitHub
2. Import repo in Vercel dashboard
3. Add all env vars (Production + Preview environments)
4. Deploy — Vercel auto-detects Next.js

**Required env vars in Vercel dashboard:**
- `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`
- `NEXT_PUBLIC_BASE_URL` (set to your Vercel URL)
- `IP_SALT`
- `UPSTASH_REDIS_REST_URL` *(Phase 2 — optional, rate limiting degrades gracefully without it)*
- `UPSTASH_REDIS_REST_TOKEN` *(Phase 2 — optional)*

---

## Available Scripts

| Command              | Description                              |
|----------------------|------------------------------------------|
| `npm run dev`        | Start development server                 |
| `npm run build`      | Build for production                     |
| `npm run lint`       | Run ESLint                               |
| `npm run db:push`    | Push schema changes to DB (dev)          |
| `npm run db:generate`| Generate migration SQL files             |
| `npm run db:migrate` | Run migrations against production DB     |
| `npm run db:studio`  | Open Drizzle Studio (DB GUI)             |

---

## Phase Roadmap

- **Phase 1** ✅ — Core create + display + share + 10/IP limit
- **Phase 2** ✅ — OG images, flip animation, Upstash rate limiting, light/dark mode
- **Phase 3** — Edit/delete via email token, cover images, QR codes
- **Phase 4** — Clerk auth, dashboard, custom slugs, reminders

---

## Phase 4 — Auth, Dashboard, Custom Slugs, Reminders

### New env vars required

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Cron protection
CRON_SECRET=any-random-secret
```

### New routes

| Route | Method | Auth | Description |
|---|---|---|---|
| `/dashboard` | GET | Clerk | User's countdown list |
| `/sign-in` | GET | — | Clerk sign-in page |
| `/sign-up` | GET | — | Clerk sign-up page |
| `/api/dashboard` | GET | Clerk | Returns user's countdowns |
| `/api/dashboard/[slug]` | PATCH | Clerk | Edit owned countdown |
| `/api/dashboard/[slug]` | DELETE | Clerk | Delete owned countdown |
| `/api/reminders` | POST | CRON_SECRET | Send reminder emails |
| `/api/cron/cleanup` | POST | CRON_SECRET | Hard-delete old rows |

### Cron jobs (vercel.json)

| Endpoint | Schedule | Purpose |
|---|---|---|
| `/api/reminders` | Daily 08:00 UTC | 7d / 1d / day-of reminder emails |
| `/api/cron/cleanup` | Sunday 03:00 UTC | Hard-delete rows soft-deleted > 1 year |

### Limits

| User type | Countdowns |
|---|---|
| Anonymous (IP-based) | 10 |
| Signed-in (Clerk) | 50 |
