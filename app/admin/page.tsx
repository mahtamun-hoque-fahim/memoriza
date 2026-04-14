// app/admin/page.tsx — admin overview with stats
import { getDb, schema } from '@/lib/db'
import { sql, count }    from 'drizzle-orm'
import { StatCard }      from '@/components/admin/StatCard'
import { OCCASION_LABELS, OCCASION_ICONS } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Overview', robots: { index: false } }

export default async function AdminOverviewPage() {
  const db = getDb()
  if (!db) return <p className="p-8" style={{ color: 'var(--muted)' }}>DB unavailable.</p>

  const [
    [{ userCount }],
    [{ dateCount }],
    [{ emailCount }],
    [{ activeCount }],
  ] = await Promise.all([
    db.select({ userCount:   count() }).from(schema.users),
    db.select({ dateCount:   count() }).from(schema.dates),
    db.select({ emailCount:  count() }).from(schema.emailLogs),
    db.select({ activeCount: count() }).from(schema.dates).where(sql`is_active = true`),
  ])

  // Occasion breakdown
  const occasionRows = await db
    .select({ occasion: schema.dates.occasion, cnt: count() })
    .from(schema.dates)
    .groupBy(schema.dates.occasion)
    .orderBy(sql`count(*) desc`)

  // Email status breakdown
  const emailStatusRows = await db
    .select({ status: schema.emailLogs.status, cnt: count() })
    .from(schema.emailLogs)
    .groupBy(schema.emailLogs.status)
    .orderBy(sql`count(*) desc`)

  // Recent signups (last 5)
  const recentUsers = await db
    .select({ id: schema.users.id, email: schema.users.email, role: schema.users.role, createdAt: schema.users.createdAt })
    .from(schema.users)
    .orderBy(sql`created_at desc`)
    .limit(5)

  const STATUS_COLORS: Record<string, string> = {
    delivered: 'var(--success)',
    sent:      'var(--warning)',
    queued:    'var(--accent)',
    bounced:   'var(--danger)',
    failed:    'var(--danger)',
  }

  return (
    <main className="px-4 sm:px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="font-syne text-2xl font-bold">Overview</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard label="Total users"   value={userCount}  />
          <StatCard label="Total dates"   value={dateCount}  sub={`${activeCount} active`} />
          <StatCard label="Emails sent"   value={emailCount} />
          <StatCard label="Active dates"  value={activeCount} accent="var(--success)" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Occasion breakdown */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>By occasion</p>
            </div>
            {occasionRows.length === 0
              ? <p className="px-5 py-4 text-sm" style={{ color: 'var(--muted)' }}>No dates yet.</p>
              : occasionRows.map((row, i) => (
                <div
                  key={row.occasion}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: i < occasionRows.length - 1 ? `1px solid var(--border)` : 'none' }}
                >
                  <span className="text-base">{OCCASION_ICONS[row.occasion] ?? '✨'}</span>
                  <span className="flex-1 text-sm">{OCCASION_LABELS[row.occasion] ?? row.occasion}</span>
                  <span className="font-mono text-sm font-semibold" style={{ color: 'var(--accent)' }}>{row.cnt}</span>
                </div>
              ))
            }
          </div>

          {/* Email status breakdown */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Email delivery</p>
            </div>
            {emailStatusRows.length === 0
              ? <p className="px-5 py-4 text-sm" style={{ color: 'var(--muted)' }}>No emails yet.</p>
              : emailStatusRows.map((row, i) => (
                <div
                  key={row.status}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: i < emailStatusRows.length - 1 ? `1px solid var(--border)` : 'none' }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: STATUS_COLORS[row.status] ?? 'var(--muted)' }}
                  />
                  <span className="flex-1 text-sm capitalize">{row.status}</span>
                  <span className="font-mono text-sm font-semibold">{row.cnt}</span>
                </div>
              ))
            }
          </div>

          {/* Recent signups */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Recent signups</p>
            </div>
            {recentUsers.length === 0
              ? <p className="px-5 py-4 text-sm" style={{ color: 'var(--muted)' }}>No users yet.</p>
              : recentUsers.map((u, i) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-5 py-3"
                  style={{ borderBottom: i < recentUsers.length - 1 ? `1px solid var(--border)` : 'none' }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold flex-shrink-0"
                    style={{ background: 'var(--surface-raised)', color: 'var(--accent)' }}
                  >
                    {u.email[0].toUpperCase()}
                  </div>
                  <span className="flex-1 text-xs truncate" style={{ color: 'var(--muted)' }}>{u.email}</span>
                  {u.role === 'admin' && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--accent)' }}>
                      admin
                    </span>
                  )}
                </div>
              ))
            }
          </div>

        </div>
      </div>
    </main>
  )
}
