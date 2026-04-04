// app/c/[slug]/page.tsx
import type { Metadata }        from 'next'
import { notFound }             from 'next/navigation'
import { eq, and, isNull }      from 'drizzle-orm'
import { getDb, schema }        from '@/lib/db'
import { CountdownTimer }       from '@/components/countdown/CountdownTimer'
import { ShareBar }             from '@/components/countdown/ShareBar'
import Link                     from 'next/link'

interface Props {
  params:      { slug: string }
  searchParams: { new?: string }
}

// ── Dynamic OG metadata per countdown ────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const countdown = await fetchCountdown(params.slug)
  if (!countdown) return { title: 'Countdown not found' }

  const name = countdown.emoji
    ? `${countdown.emoji} ${countdown.name}`
    : countdown.name

  const baseUrl    = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memoriza.vercel.app'
  const ogImageUrl = `${baseUrl}/api/og/${countdown.slug}`

  return {
    title:       `${name} — Memoriza`,
    description: `Counting down to ${countdown.name}. Share the anticipation!`,
    openGraph: {
      title:       `${name} — Memoriza`,
      description: `Counting down to ${countdown.name}. Share the anticipation!`,
      type:        'website',
      images:      [{ url: ogImageUrl, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       `${name} — Memoriza`,
      description: `Counting down to ${countdown.name}. Share the anticipation!`,
      images:      [ogImageUrl],
    },
  }
}

// ── Data fetcher (server-only) ────────────────────────────────────────────────
async function fetchCountdown(slug: string) {
  if (!slug || slug.length > 16) return null

  const db = getDb()
  if (!db) return null

  const rows = await db
    .select()
    .from(schema.countdowns)
    .where(
      and(
        eq(schema.countdowns.slug, slug),
        isNull(schema.countdowns.deletedAt)
      )
    )
    .limit(1)

  return rows[0] ?? null
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function CountdownPage({ params, searchParams }: Props) {
  const countdown = await fetchCountdown(params.slug)
  if (!countdown) notFound()

  const isNew = searchParams.new === '1'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">

      {/* ── Background decoration ─────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.10) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-12">

        {/* ── "Just created" banner ────────────────────────────────────── */}
        {isNew && (
          <div className="flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/30 rounded-full px-5 py-2 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
            <span className="font-mono text-xs text-brand-accent uppercase tracking-widest">
              Your countdown is live — share it below
            </span>
          </div>
        )}

        {/* ── Live countdown timer ──────────────────────────────────────── */}
        <CountdownTimer
          targetDate={countdown.eventDate.toISOString()}
          eventName={countdown.name}
          emoji={countdown.emoji}
        />

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="w-full max-w-xs h-px bg-brand-border" />

        {/* ── Share bar ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 w-full animate-fade-in" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
          <p className="font-mono text-xs text-brand-muted uppercase tracking-widest">
            Share this countdown
          </p>
          <ShareBar slug={countdown.slug} eventName={countdown.name} />
        </div>

        {/* ── Back home ─────────────────────────────────────────────────── */}
        <Link
          href="/"
          className="font-mono text-xs text-brand-muted hover:text-brand-text transition-colors duration-150 underline underline-offset-4"
        >
          ← Create another countdown
        </Link>

      </div>
    </main>
  )
}
