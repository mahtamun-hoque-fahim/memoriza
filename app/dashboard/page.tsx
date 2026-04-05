// app/dashboard/page.tsx
import { auth }          from '@clerk/nextjs/server'
import { redirect }      from 'next/navigation'
import { eq, and, isNull, desc } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import type { Metadata }   from 'next'

export const metadata: Metadata = {
  title:  'Dashboard — Memoriza',
  robots: { index: false },
}

export default async function DashboardPage() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const db   = getDb()
  const rows = db ? await db
    .select()
    .from(schema.countdowns)
    .where(and(eq(schema.countdowns.userId, userId), isNull(schema.countdowns.deletedAt)))
    .orderBy(desc(schema.countdowns.createdAt)) : []

  // Serialise dates to ISO strings for client component
  const countdowns = rows.map((r) => ({
    id:               r.id,
    slug:             r.slug,
    customSlug:       r.customSlug,
    name:             r.name,
    emoji:            r.emoji,
    eventDate:        r.eventDate.toISOString(),
    timezone:         r.timezone,
    coverImage:       r.coverImage,
    viewCount:        r.viewCount,
    remindersEnabled: r.remindersEnabled,
    createdAt:        r.createdAt.toISOString(),
  }))

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
            Your account
          </p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="font-syne text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text)' }}>
              Dashboard
            </h1>
            <a href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-syne font-semibold text-sm text-white transition-all duration-150 hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)' }}>
              + New countdown
            </a>
          </div>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
            {countdowns.length} of 50 countdowns used
          </p>
        </div>

        <DashboardClient countdowns={countdowns} />
      </div>
    </main>
  )
}
