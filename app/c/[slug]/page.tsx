// app/c/[slug]/page.tsx — public themed countdown page
import { notFound }      from 'next/navigation'
import { getDb, schema } from '@/lib/db'
import { eq }            from 'drizzle-orm'
import { CountdownTimer } from '@/components/countdown/CountdownTimer'
import { ShareBar }       from '@/components/countdown/ShareBar'
import { OCCASION_ICONS, OCCASION_LABELS, OCCASION_ACCENTS } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

// ── Occasion theme configs ────────────────────────────────────────────────────

const THEMES: Record<string, { bg: string; glow: string; particle: string }> = {
  anniversary: {
    bg:       'radial-gradient(ellipse at 50% 0%, rgba(255,107,157,0.18) 0%, transparent 60%), #0A0C10',
    glow:     'rgba(255,107,157,0.15)',
    particle: '💍',
  },
  birthday: {
    bg:       'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.18) 0%, transparent 60%), #0A0C10',
    glow:     'rgba(245,158,11,0.15)',
    particle: '🎂',
  },
  valentine: {
    bg:       'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.18) 0%, transparent 60%), #0A0C10',
    glow:     'rgba(239,68,68,0.15)',
    particle: '💝',
  },
  graduation: {
    bg:       'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.18) 0%, transparent 60%), #0A0C10',
    glow:     'rgba(16,185,129,0.15)',
    particle: '🎓',
  },
  new_year: {
    bg:       'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.2) 0%, transparent 60%), #0A0C10',
    glow:     'rgba(108,99,255,0.18)',
    particle: '🎆',
  },
  first_date: {
    bg:       'radial-gradient(ellipse at 50% 0%, rgba(236,72,153,0.18) 0%, transparent 60%), #0A0C10',
    glow:     'rgba(236,72,153,0.15)',
    particle: '🌹',
  },
  promotion: {
    bg:       'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.18) 0%, transparent 60%), #0A0C10',
    glow:     'rgba(59,130,246,0.15)',
    particle: '🏆',
  },
  custom: {
    bg:       'radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.15) 0%, transparent 60%), #0A0C10',
    glow:     'rgba(108,99,255,0.12)',
    particle: '✨',
  },
}

// ── Resolve next event date (handles yearly recurrence) ───────────────────────

function resolveTargetDate(eventDate: Date, recurrence: string): Date {
  const target = new Date(eventDate)
  if (recurrence !== 'yearly') return target
  const now = new Date()
  target.setFullYear(now.getFullYear())
  if (target < now) target.setFullYear(now.getFullYear() + 1)
  return target
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const db = getDb()
  if (!db) return {}
  const [row] = await db
    .select({ title: schema.dates.title, occasion: schema.dates.occasion })
    .from(schema.dates)
    .where(eq(schema.dates.slug, params.slug))
    .limit(1)
  if (!row) return { title: 'Not found' }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memoriza.app'
  return {
    title:       row.title,
    description: `Counting down to ${row.title} — ${OCCASION_LABELS[row.occasion] ?? 'Special occasion'}`,
    openGraph: {
      title:       row.title,
      description: `Counting down to ${row.title}`,
      images:      [`${base}/api/og?slug=${params.slug}`],
    },
    twitter: {
      card:  'summary_large_image',
      title: row.title,
      images: [`${base}/api/og?slug=${params.slug}`],
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CountdownPage({ params }: Props) {
  const db = getDb()
  if (!db) notFound()

  const [row] = await db
    .select()
    .from(schema.dates)
    .where(eq(schema.dates.slug, params.slug))
    .limit(1)

  if (!row || !row.isActive) notFound()

  const theme      = THEMES[row.occasion] ?? THEMES.custom
  const accent     = OCCASION_ACCENTS[row.occasion] ?? '#6C63FF'
  const icon       = OCCASION_ICONS[row.occasion]   ?? '✨'
  const label      = OCCASION_LABELS[row.occasion]  ?? 'Custom'
  const targetDate = resolveTargetDate(new Date(row.eventDate), row.recurrence)
  const base       = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memoriza.app'
  const pageUrl    = `${base}/c/${row.slug}`

  // Format the human-readable date
  const dateStr = new Date(row.eventDate).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: theme.bg }}
    >
      {/* Top glow blob */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${theme.glow} 0%, transparent 70%)` }}
      />

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">

        {/* Occasion badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-mono uppercase tracking-widest animate-fade-in"
          style={{
            background: `${accent}15`,
            border:     `1px solid ${accent}35`,
            color:      accent,
          }}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </div>

        {/* Title */}
        <h1
          className="font-syne text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight max-w-2xl animate-slide-up"
          style={{ animationDelay: '0.05s', opacity: 0, animationFillMode: 'forwards' }}
        >
          {row.title}
        </h1>

        {/* Date string */}
        <p
          className="font-mono text-sm mb-12 animate-fade-in"
          style={{ color: 'rgba(255,255,255,0.4)', animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
        >
          {dateStr}{row.recurrence === 'yearly' ? ' · every year' : ''}
        </p>

        {/* Cover image */}
        {row.imageUrl && (
          <div
            className="mb-12 rounded-2xl overflow-hidden max-w-sm w-full animate-slide-up"
            style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards', border: `1px solid ${accent}25` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={row.imageUrl} alt={row.title} className="w-full h-52 object-cover" />
          </div>
        )}

        {/* Live countdown */}
        <div
          className="mb-14 animate-slide-up"
          style={{ animationDelay: '0.15s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <CountdownTimer targetDate={targetDate.toISOString()} accent={accent} />
        </div>

        {/* Share bar */}
        <div
          className="w-full animate-fade-in"
          style={{ animationDelay: '0.25s', opacity: 0, animationFillMode: 'forwards' }}
        >
          <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Share this page
          </p>
          <ShareBar url={pageUrl} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6">
        <a
          href="/"
          className="text-xs font-mono hover:opacity-70 transition-opacity"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Made with Memoriza
        </a>
      </footer>
    </div>
  )
}
