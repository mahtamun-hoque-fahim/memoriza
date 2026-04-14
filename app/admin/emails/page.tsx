// app/admin/emails/page.tsx — global email log
import { getDb, schema }  from '@/lib/db'
import { eq, desc }       from 'drizzle-orm'
import { OCCASION_ICONS } from '@/lib/utils'
import type { Metadata }  from 'next'

export const metadata: Metadata = { title: 'Admin — Emails', robots: { index: false } }

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  queued:    { bg: 'rgba(108,99,255,0.12)', color: '#6C63FF' },
  sent:      { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  delivered: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
  bounced:   { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444' },
  failed:    { bg: 'rgba(239,68,68,0.12)',  color: '#EF4444' },
}

const TYPE_LABELS: Record<string, string> = {
  confirmation: 'Confirm',
  reminder:     'Reminder',
  day_of:       'Day-of',
}

export default async function AdminEmailsPage() {
  const db = getDb()
  if (!db) return <p className="p-8" style={{ color: 'var(--muted)' }}>DB unavailable.</p>

  const logs = await db
    .select({
      id:             schema.emailLogs.id,
      recipientType:  schema.emailLogs.recipientType,
      recipientEmail: schema.emailLogs.recipientEmail,
      type:           schema.emailLogs.type,
      status:         schema.emailLogs.status,
      resendId:       schema.emailLogs.resendId,
      sentAt:         schema.emailLogs.sentAt,
      dateTitle:      schema.dates.title,
      dateOccasion:   schema.dates.occasion,
      ownerEmail:     schema.users.email,
    })
    .from(schema.emailLogs)
    .innerJoin(schema.dates, eq(schema.emailLogs.dateId, schema.dates.id))
    .innerJoin(schema.users, eq(schema.dates.userId,     schema.users.id))
    .orderBy(desc(schema.emailLogs.sentAt))
    .limit(200)

  return (
    <main className="px-4 sm:px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-syne text-2xl font-bold">Emails</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Last {logs.length} email{logs.length !== 1 ? 's' : ''} · newest first
          </p>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Date', 'To', 'Type', 'Status', 'Sent at', 'Resend ID'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider whitespace-nowrap"
                      style={{ color: 'var(--muted)', background: 'var(--surface-raised)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
                      No emails sent yet.
                    </td>
                  </tr>
                ) : logs.map((log, i) => {
                  const status = STATUS_STYLES[log.status] ?? STATUS_STYLES.sent
                  const sentAt = new Date(log.sentAt).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })

                  return (
                    <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      {/* Date */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{OCCASION_ICONS[log.dateOccasion] ?? '✨'}</span>
                          <span className="text-sm truncate max-w-[140px]">{log.dateTitle}</span>
                        </div>
                        <p className="text-xs mt-0.5 truncate max-w-[140px]" style={{ color: 'var(--muted)' }}>
                          {log.ownerEmail}
                        </p>
                      </td>

                      {/* To */}
                      <td className="px-4 py-3">
                        <p className="text-xs truncate max-w-[160px]" style={{ color: 'var(--muted)' }}>
                          {log.recipientEmail}
                        </p>
                        <span
                          className="text-xs font-mono"
                          style={{ color: log.recipientType === 'owner' ? 'var(--accent)' : 'var(--success)' }}
                        >
                          {log.recipientType}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                          {TYPE_LABELS[log.type] ?? log.type}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-mono capitalize"
                          style={{ background: status.bg, color: status.color }}
                        >
                          {log.status}
                        </span>
                      </td>

                      {/* Sent at */}
                      <td className="px-4 py-3 text-xs font-mono whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                        {sentAt}
                      </td>

                      {/* Resend ID */}
                      <td className="px-4 py-3">
                        {log.resendId ? (
                          <span className="text-xs font-mono opacity-50 truncate max-w-[100px] block" title={log.resendId}>
                            {log.resendId.slice(0, 12)}…
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--border)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
