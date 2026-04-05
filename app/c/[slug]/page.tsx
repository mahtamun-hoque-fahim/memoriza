// app/c/[slug]/page.tsx
import type { Metadata }        from 'next'
import { notFound }             from 'next/navigation'
import { eq, and, isNull }      from 'drizzle-orm'
import { getDb, schema }        from '@/lib/db'
import { CountdownTimer }       from '@/components/countdown/CountdownTimer'
import { ShareBar }             from '@/components/countdown/ShareBar'
import { ViewCounter }          from '@/components/countdown/ViewCounter'
import { QRCode }               from '@/components/countdown/QRCode'
import Link                     from 'next/link'
import Image                    from 'next/image'

interface Props {
  params:       { slug: string }
  searchParams: { new?: string; updated?: string }
}

// ── Dynamic OG metadata ───────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const countdown = await fetchCountdown(params.slug)
  if (!countdown) return { title: 'Countdown not found' }

  const name       = countdown.emoji ? `${countdown.emoji} ${countdown.name}` : countdown.name
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

// ── Data fetcher ──────────────────────────────────────────────────────────────
async function fetchCountdown(slug: string) {
  if (!slug || slug.length > 16) return null
  const db = getDb()
  if (!db) return null

  const rows = await db
    .select()
    .from(schema.countdowns)
    .where(and(eq(schema.countdowns.slug, slug), isNull(schema.countdowns.deletedAt)))
    .limit(1)

  return rows[0] ?? null
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CountdownPage({ params, searchParams }: Props) {
  const countdown = await fetchCountdown(params.slug)
  if (!countdown) notFound()

  const isNew     = searchParams.new     === '1'
  const isUpdated = searchParams.updated === '1'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.10) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-10">

        {/* Banner: new or updated */}
        {(isNew || isUpdated) && (
          <div className="flex items-center gap-2 rounded-full px-5 py-2 animate-fade-in"
            style={{ backgroundColor: 'rgba(108,99,255,0.10)', border: '1px solid rgba(108,99,255,0.30)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              {isNew ? 'Your countdown is live — share it below' : 'Changes saved successfully'}
            </span>
          </div>
        )}

        {/* Cover image */}
        {countdown.coverImage && (
          <div className="w-full rounded-2xl overflow-hidden animate-fade-in" style={{ border: '1px solid var(--border)', maxHeight: '240px' }}>
            <div className="relative w-full h-48 sm:h-60">
              <Image
                src={countdown.coverImage}
                alt={`Cover image for ${countdown.name}`}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
          </div>
        )}

        {/* Live countdown timer */}
        <CountdownTimer
          targetDate={countdown.eventDate.toISOString()}
          eventName={countdown.name}
          emoji={countdown.emoji}
        />

        {/* View counter */}
        <ViewCounter slug={countdown.slug} initialCount={countdown.viewCount} />

        {/* Divider */}
        <div className="w-full max-w-xs h-px" style={{ backgroundColor: 'var(--border)' }} />

        {/* Share section */}
        <div className="flex flex-col items-center gap-3 w-full animate-fade-in"
          style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
          <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Share this countdown
          </p>
          <ShareBar slug={countdown.slug} eventName={countdown.name} />

          {/* QR Code button */}
          <QRCode slug={countdown.slug} />
        </div>

        {/* Footer links */}
        <div className="flex items-center gap-6 flex-wrap justify-center">
          <Link href="/" className="font-mono text-xs underline underline-offset-4 transition-colors duration-150"
            style={{ color: 'var(--muted)' }}>
            ← Create another
          </Link>
          {countdown.editToken && (
            <span className="font-mono text-xs" style={{ color: 'var(--border)' }}>·</span>
          )}
          {countdown.editToken && (
            <Link
              href={`/c/${countdown.slug}/edit?token=${countdown.editToken}`}
              className="font-mono text-xs underline underline-offset-4 transition-colors duration-150"
              style={{ color: 'var(--muted)' }}
            >
              Edit / Delete ↗
            </Link>
          )}
        </div>

      </div>
    </main>
  )
}
