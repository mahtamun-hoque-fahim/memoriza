# DESIGN_GUIDE.md — Memoriza

> **Rule:** Update this file with every UI/design change. This is the single source of truth.

---

## Brand & Identity

- **App name:** Memoriza
- **Tagline:** Never forget what matters most.
- **Voice:** Warm, celebratory, personal. Not corporate, not cold.

---

## Color System

| Token              | Hex       | CSS Var            | Usage                              |
|--------------------|-----------|--------------------|------------------------------------|
| Background         | `#0A0C10` | `--bg`             | Page background                    |
| Surface            | `#131720` | `--surface`        | Cards, inputs, containers          |
| Surface raised     | `#1A2030` | `--surface-raised` | Hover cards, nested containers     |
| Border             | `#1E2433` | `--border`         | All borders and dividers           |
| Accent             | `#6C63FF` | `--accent`         | CTA buttons, highlights, links     |
| Accent dim         | `#3D3880` | `--accent-dim`     | Hover on accent elements           |
| Text primary       | `#F2F2F5` | `--text`           | Primary text                       |
| Text muted         | `#6B7280` | `--muted`          | Labels, captions, secondary text   |
| Success            | `#10B981` | `--success`        | Delivered badge, active state      |
| Warning            | `#F59E0B` | `--warning`        | Reminder pending state             |
| Danger             | `#EF4444` | `--danger`         | Delete actions, errors             |

**Theme:** Dark-only. No light mode.

---

## Typography

| Role             | Font                | Size / Weight      | Usage                               |
|------------------|---------------------|--------------------|-------------------------------------|
| Countdown digits | Instrument Serif    | 80–120px / 400     | Hero countdown numbers              |
| Headings / H1    | Syne                | 22–48px / 600–700  | Page headings, event titles         |
| UI / body        | DM Sans             | 14–16px / 400      | Form labels, paragraphs, dashboard  |
| Mono labels      | JetBrains Mono      | 11–12px / 400      | DAYS, HRS, unit labels, badges      |

---

## Occasion Themes (countdown page)

Each occasion controls: background tint, accent color override, emoji/icon, animation style.

| Occasion      | Accent color | Background tint         | Icon  |
|---------------|-------------|-------------------------|-------|
| anniversary   | `#FF6B9D`   | rose/pink tint          | 💍    |
| birthday      | `#F59E0B`   | warm amber tint         | 🎂    |
| valentine     | `#EF4444`   | red tint                | 💝    |
| graduation    | `#10B981`   | green tint              | 🎓    |
| new_year      | `#6C63FF`   | purple (default)        | 🎆    |
| first_date    | `#EC4899`   | pink tint               | 🌹    |
| promotion     | `#3B82F6`   | blue tint               | 🏆    |
| custom        | `#6C63FF`   | purple (default)        | ✨    |

---

## Component Patterns

### Inputs
- Background: `--surface`
- Border: `--border` → focus: `--accent/60` ring
- Border-radius: `rounded-xl` (12px)
- Padding: `px-4 py-3`

### Buttons (primary)
- Background: `--accent` → hover: `--accent-dim`
- Text: white, Syne, font-semibold
- Border-radius: `rounded-xl`
- Disabled: `opacity-40`

### Cards
- Background: `--surface`
- Border: `1px solid --border`
- Border-radius: `rounded-2xl`
- Padding: `p-6`

### Badges
- `rounded-full px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider`
- Colors: success/warning/danger/accent at 15% opacity with matching text

---

## Layout

- Max content width: `max-w-5xl` (dashboard), `max-w-lg` (forms), `max-w-3xl` (countdown page)
- Navbar height: `56px` → body has `pt-14`
- Spacing scale: 4, 8, 12, 16, 24, 32, 48px

---

## Email Templates

- Background: `#0A0C10`
- Card: `#131720` with `1px solid #1E2433` border, `border-radius: 16px`
- Accent: `#6C63FF`
- Max width: `560px`
- Font: system-ui / -apple-system stack

---

## Change Log

| Date       | Change                         | Author |
|------------|--------------------------------|--------|
| 2026-04-13 | Initial design system for v2   | Fahim  |
| 2026-04-13 | Phase 2: DateForm, DateCard, CountdownTimer, ShareBar, themed countdown page | Fahim  |
| 2026-04-13 | Phase 3: Email templates, reminder cron, Resend webhook, email history tab | Fahim  |
| 2026-04-13 | Phase 4: Admin dashboard (overview, users, dates, emails), SEO (sitemap, robots) | Fahim  |
