// app/(user)/dashboard/page.tsx
import { auth }         from '@/lib/auth'
import { redirect }     from 'next/navigation'
import { getDb, schema } from '@/lib/db'
import { eq, desc }     from 'drizzle-orm'
import { DateCard }     from '@/components/dashboard/DateCard'
import Link             from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false },
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const db   = getDb()
  const rows = db
    ? await db
        .select()
        .from(schema.dates)
        .where(eq(schema.dates.userId, session.user.id))
        .orderBy(desc(schema.dates.createdAt))
    : []

  return (
    <main className="min-h-screen px-4 py-12">
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>
              {session.user.email}
            </p>
            <h1 className="font-syne text-3xl sm:text-4xl font-bold">Dashboard</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
              {rows.length} date{rows.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-syne font-semibold text-sm text-white hover:opacity-90 transition-all"
            style={{ background: 'var(--accent)' }}
          >
            + Add date
          </Link>
        </div>

        {/* Empty state */}
        {rows.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="text-5xl mb-4">📅</div>
            <p className="font-syne font-semibold text-lg mb-2">No dates yet</p>
            <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
              Add your first important date and we'll remind you before it arrives.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-syne font-semibold text-sm text-white hover:opacity-90 transition-all"
              style={{ background: 'var(--accent)' }}
            >
              Add a date →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((date) => (
              <DateCard key={date.id} date={date} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
