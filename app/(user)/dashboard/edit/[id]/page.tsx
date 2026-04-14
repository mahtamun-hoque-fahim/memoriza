// app/(user)/dashboard/edit/[id]/page.tsx
import { auth }          from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { getDb, schema } from '@/lib/db'
import { and, eq }       from 'drizzle-orm'
import { DateForm }      from '@/components/countdown/DateForm'
import Link              from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Edit date' }

interface Props { params: { id: string } }

export default async function EditDatePage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in')

  const db = getDb()
  if (!db) notFound()

  const [row] = await db
    .select()
    .from(schema.dates)
    .where(and(eq(schema.dates.id, params.id), eq(schema.dates.userId, session.user.id)))
    .limit(1)

  if (!row) notFound()

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />
      <div className="relative z-10 max-w-lg mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-xs font-mono hover:opacity-70 transition-opacity" style={{ color: 'var(--muted)' }}>
            ← Back to dashboard
          </Link>
          <h1 className="font-syne text-3xl font-bold mt-4">Edit date</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            The shareable link stays the same after editing.
          </p>
        </div>
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <DateForm mode="edit" existing={row} />
        </div>
      </div>
    </main>
  )
}
