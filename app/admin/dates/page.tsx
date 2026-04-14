// app/admin/dates/page.tsx — all dates across all users
import { getDb, schema }  from '@/lib/db'
import { eq, desc }       from 'drizzle-orm'
import { DateAdminRow }   from '@/components/admin/DateAdminRow'
import type { Metadata }  from 'next'

export const metadata: Metadata = { title: 'Admin — Dates', robots: { index: false } }

export default async function AdminDatesPage() {
  const db = getDb()
  if (!db) return <p className="p-8" style={{ color: 'var(--muted)' }}>DB unavailable.</p>

  const rows = await db
    .select({
      id:             schema.dates.id,
      slug:           schema.dates.slug,
      title:          schema.dates.title,
      occasion:       schema.dates.occasion,
      eventDate:      schema.dates.eventDate,
      recurrence:     schema.dates.recurrence,
      isActive:       schema.dates.isActive,
      recipientEmail: schema.dates.recipientEmail,
      createdAt:      schema.dates.createdAt,
      ownerEmail:     schema.users.email,
    })
    .from(schema.dates)
    .innerJoin(schema.users, eq(schema.dates.userId, schema.users.id))
    .orderBy(desc(schema.dates.createdAt))

  return (
    <main className="px-4 sm:px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-syne text-2xl font-bold">Dates</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {rows.length} total date{rows.length !== 1 ? 's' : ''} across all users
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
                  {['Date', 'Owner', 'Event date', 'Status', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider"
                      style={{ color: 'var(--muted)', background: 'var(--surface-raised)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
                      No dates yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <DateAdminRow
                      key={row.id}
                      date={{
                        ...row,
                        eventDate: new Date(row.eventDate),
                        createdAt: new Date(row.createdAt),
                      }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
