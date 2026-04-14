// app/(user)/dashboard/emails/page.tsx — email history for the current user
import { auth }          from '@/lib/auth'
import { redirect }      from 'next/navigation'
import { getDb, schema } from '@/lib/db'
import { eq, desc, inArray } from 'drizzle-orm'
import Link              from 'next/link'
import { OCCASION_ICONS, OCCASION_LABELS } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Email history', robots: { index: false } }

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  queued:    { bg: 'rgba(108,99,255,0.12)', color: '#6C63FF', label: 'Queued'    },
  sent:      { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Sent'      },
  delivered: { bg: 'rgba(16,185,129,0.12)', color: '#10B981', label: 'Delivered' },
  bounced:   { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444', label: 'Bounced'   },
  failed:    { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444', label: 'Failed'    },
}

const TYPE_LABELS: Record<string, string> = {
  confirmation: 'Confirmation',
  reminder:     'Reminder',
  day_of:       'Day-of',
}

export default async function EmailHistoryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const db = getDb()
  if (!db) return <p style={{ color: 'var(--muted)' }}>DB unavailable.</p>

  // Get all dates owned by this user
  const userDates = await db
    .select({ id: schema.dates.id, title: schema.dates.title, occasion: schema.dates.occasion, slug: schema.dates.slug })
    .from(schema.dates)
    .where(eq(schema.dates.userId, session.user.id))

  if (userDates.length === 0) {
    return (
      <main className="min-h-screen px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link href="/dashboard" className="text-xs font-mono hover:opacity-70" style={{ color: 'var(--muted)' }}>
              ← Back to dashboard
            </Link>
            <h1 className="font-syne text-3xl font-bold mt-4">Email history</h1>
          </div>
          <p style={{ color: 'var(--muted)' }}>No dates saved yet.</p>
        </div>
      </main>
    )
  }

  const dateIds = userDates.map((d) => d.id)
  const dateMap = Object.fromEntries(userDates.map((d) => [d.id, d]))

  // Fetch all email logs for those dates
  const logs = await db
    .select()
    .from(schema.emailLogs)
    .where(inArray(schema.emailLogs.dateId, dateIds))
    .orderBy(desc(schema.emailLogs.sentAt))

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-xs font-mono hover:opacity-70 transition-opacity" style={{ color: 'var(--muted)' }}>
            ← Back to dashboard
          </Link>
          <h1 className="font-syne text-3xl font-bold mt-4">Email history</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            {logs.length} email{logs.length !== 1 ? 's' : ''} sent across all your dates
          </p>
        </div>

        {logs.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="text-4xl mb-3">📭</div>
            <p className="font-syne font-semibold mb-1">No emails sent yet</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Emails appear here after your first reminder is sent.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {logs.map((log, i) => {
              const date    = dateMap[log.dateId]
              const status  = STATUS_STYLES[log.status] ?? STATUS_STYLES.sent
              const sentAt  = new Date(log.sentAt).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
              })

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 px-5 py-4"
                  style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--surface-raised)' }}
                  >
                    {date ? (OCCASION_ICONS[date.occasion] ?? '✨') : '✉️'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {date?.title ?? 'Unknown date'}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                        {TYPE_LABELS[log.type] ?? log.type}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--border)' }}>·</span>
                      <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                        to {log.recipientType === 'owner' ? 'you' : log.recipientEmail}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--border)' }}>·</span>
                      <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                        {sentAt}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-mono font-semibold"
                    style={{ background: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
