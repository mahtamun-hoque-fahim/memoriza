# DESIGN_GUIDE.md — Countdown App

> **Rule:** Update this file with every UI/design change. This is the single source of truth.

---

## Brand & Identity

- **App name:** Countdown
- **Tagline:** Share the moment
- **Voice:** Minimal, celebratory, friendly. No corporate tone.

---

## Color System

| Token            | Hex       | Usage                              |
|------------------|-----------|------------------------------------|
| `brand-bg`       | `#0A0C10` | Page background                    |
| `brand-surface`  | `#131720` | Cards, inputs, form containers     |
| `brand-border`   | `#1E2433` | All borders and dividers           |
| `brand-accent`   | `#6C63FF` | CTA buttons, highlights, links     |
| `brand-accent-dim` | `#3D3880` | Hover states, dimmed accent      |
| `brand-text`     | `#F2F2F5` | Primary text                       |
| `brand-muted`    | `#6B7280` | Labels, captions, secondary text   |

**Theme:** Dark-first. No light mode in Phase 1.

---

## Typography

| Role             | Font                 | Size / Weight          | Usage                          |
|------------------|----------------------|------------------------|--------------------------------|
| Countdown digits | Instrument Serif     | 80–120px / 400         | The hero — days/hours/min/sec  |
| Event name / H1  | Syne                 | 22–48px / 600–700      | Page headings, event titles    |
| UI / body        | DM Sans              | 14–16px / 400          | Form labels, paragraphs        |
| Labels / mono    | JetBrains Mono       | 11–12px / 400          | DAYS, HRS, MIN, SEC labels     |

---

## Component Patterns

### Inputs
- Background: `brand-surface`
- Border: `brand-border` → hover: `brand-accent/40`
- Border-radius: `rounded-xl` (12px)
- Padding: `px-4 py-3`
- Focus ring: 2px solid `rgba(108,99,255,0.6)`

### Buttons (primary)
- Background: `brand-accent` → hover: `brand-accent/90`
- Text: white, Syne, font-semibold
- Border-radius: `rounded-xl`
- Hover: slight scale-up (`scale-[1.01]`)
- Disabled: `opacity-40`

### Cards / containers
- Background: `brand-surface`
- Border: `brand-border`
- Border-radius: `rounded-2xl` (16px)
- Padding: `p-6 sm:p-8`

### Countdown segments
- Font: Instrument Serif (serif variable)
- Sizes: `text-5xl sm:text-7xl md:text-8xl lg:text-9xl`
- Tick animation: `tick-glow` keyframe (accent → lighter → text color, 0.4s)
- Labels: JetBrains Mono, 9–11px, uppercase, `tracking-[0.2em]`, `text-brand-muted`

---

## Animations

| Name          | Duration | Trigger                      |
|---------------|----------|------------------------------|
| `slide-up`    | 0.5s     | Page load, form card entry   |
| `fade-in`     | 0.4s     | Share bar, footer hints      |
| `tick-glow`   | 0.4s     | Every second tick on digits  |
| `pulse-glow`  | 3s loop  | CTA button idle state        |

---

## Rate Limiting

- **Limit:** 10 active countdowns per IP address (hashed with SHA-256 + `IP_SALT`)
- **Error code:** `LIMIT_REACHED` (HTTP 429)
- **User message:** "You've reached the limit of 10 active countdowns. Delete one to create a new one."
- No Clerk auth in Phase 1. Limit is IP-based only.

---

## URL Structure

| Path              | Component       | Notes                              |
|-------------------|-----------------|------------------------------------|
| `/`               | HomePage        | Creation form                      |
| `/c/[slug]`       | CountdownPage   | Live countdown, SSR + client timer |
| `/api/create`     | Route Handler   | POST, Node.js runtime              |
| `/api/c/[slug]`   | Route Handler   | GET, Edge runtime                  |

---

## Phase Log

### Phase 1 (current)
- Core creation + countdown display
- IP-based 10-event limit (SHA-256 hashed)
- Copy-to-clipboard share bar
- Web Share API (mobile)
- Finished state with confetti
- 404 page for unknown slugs
- SSR data fetch + client-side live timer
- Dark theme only

### Phase 2 (current)
- Dynamic OG images via `@vercel/og` at `/api/og/[slug]` (1200×630, shows emoji + event name + days left)
- Twitter card `summary_large_image` meta tags on countdown pages
- CSS flip animation on digit change (`.flip-card.is-flipping`, 0.18s ease-in/out)
- Light mode support — CSS variables on `:root` / `html:not(.dark)`, toggled by ThemeProvider
- ThemeToggle component (sun/moon icon) — persists to `localStorage`
- Persistent Navbar with logo + theme toggle + "New" link
- Upstash Redis rate limiting on `/api/create` (5 req / 10 min / IP, graceful degradation if not configured)
- `suppressHydrationWarning` on `<html>` to prevent theme flash warning

### Phase 3 (planned)
- Email-based edit/delete token
- Custom emoji / cover image (Cloudinary)
- QR code generation
- View counters

### Phase 3 (current)
- Email capture (optional) at creation → Resend sends private edit link (graceful no-op without `RESEND_API_KEY`)
- Edit page `/c/[slug]/edit?token=...` — server validates 64-char token, pre-fills form
- `EditForm` client component — save + delete with confirmation, token in request body
- Soft-delete on delete — `deleted_at` timestamp, row preserved for analytics
- Cover image: `CoverImageUploader` — drag-and-drop, click-to-browse, 5 MB limit, Cloudinary signed upload
- Cover image displayed as hero on countdown page (`next/image`, Cloudinary CDN)
- QR code: `QRCode` component — popover with `api.qrserver.com`, Download PNG button
- View counter: `ViewCounter` fires fire-and-forget `POST /api/countdown/[slug]/view` on mount
- `/api/countdown/[slug]/edit`   — PATCH, Node.js runtime, token-validated
- `/api/countdown/[slug]/delete` — DELETE, Node.js runtime, token-validated  
- `/api/countdown/[slug]/view`   — POST, Edge runtime, SQL atomic increment
- `/api/upload`                  — POST, Node.js runtime, Cloudinary signed upload
- `lib/email.ts`                 — Resend email via `fetch`, branded HTML template
- Schema: added `cover_image`, `creator_email`, `edit_token`, `view_count` columns
- Edit links exposed on countdown page only when `editToken` exists in DB row

### Phase 4 (planned)
- Clerk auth — dashboard of all your countdowns
- Custom slugs (e.g. `/c/fahims-wedding`)
- Reminder emails at 7d / 1d / day-of via Resend + Vercel cron
- Cleanup cron — hard-delete soft-deleted rows older than 1 year
