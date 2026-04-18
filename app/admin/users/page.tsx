// app/admin/users/page.tsx
import { getDb, schema } from '@/lib/db'
import { sql, count }     from 'drizzle-orm'
import { UserRow }       from '@/components/admin/UserRow'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — Users', robots: { index: false } }

export default async function AdminUsersPage() {
  const db = getDb()
  if (!db) return <p className="p-8" style={{ color: 'var(--muted)' }}>DB unavailable.</p>

  // Users with their date count
  const users = await db
    .select({
      id:        schema.users.id,
      email:     schema.users.email,
      role:      schema.users.role,
      createdAt: schema.users.createdAt,
      dateCount: sql<number>`(
        select count(*) from dates where dates.user_id = users.id
      )`.mapWith(Number),
    })
    .from(schema.users)
    .orderBy(sql`created_at desc`)

  return (
    <main className="px-4 sm:px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-syne text-2xl font-bold">Users</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {users.length} total user{users.length !== 1 ? 's' : ''}
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
                  {['User', 'Role', 'Dates', 'Joined', 'Actions'].map((h) => (
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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
                      No users yet.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => <UserRow key={u.id} user={u} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
