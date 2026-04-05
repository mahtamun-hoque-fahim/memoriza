// app/c/[slug]/edit/page.tsx
import { notFound, redirect } from 'next/navigation'
import { eq, and, isNull }    from 'drizzle-orm'
import { getDb, schema }      from '@/lib/db'
import { EditForm }           from '@/components/countdown/EditForm'
import type { Metadata }      from 'next'

interface Props {
  params:       { slug: string }
  searchParams: { token?: string }
}

export const metadata: Metadata = {
  title: 'Edit countdown — Memoriza',
  robots: { index: false }, // don't index edit pages
}

async function fetchCountdownWithToken(slug: string, token: string) {
  if (!slug || slug.length > 16 || !token || token.length !== 64) return null

  const db = getDb()
  if (!db) return null

  const rows = await db
    .select()
    .from(schema.countdowns)
    .where(and(eq(schema.countdowns.slug, slug), isNull(schema.countdowns.deletedAt)))
    .limit(1)

  const row = rows[0]
  if (!row) return null
  if (row.editToken !== token) return null // wrong token — treat as not found

  return row
}

export default async function EditPage({ params, searchParams }: Props) {
  const token = searchParams.token ?? ''

  if (!token || token.length !== 64) {
    // No token at all — redirect to countdown page
    redirect(`/c/${params.slug}`)
  }

  const countdown = await fetchCountdownWithToken(params.slug, token)
  if (!countdown) notFound()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
            Editing
          </p>
          <h1 className="font-syne text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text)' }}>
            {countdown.emoji && <span className="mr-2">{countdown.emoji}</span>}
            {countdown.name}
          </h1>
        </div>

        {/* Edit form card */}
        <div className="rounded-2xl border p-6 sm:p-8 animate-slide-up"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          <EditForm
            slug={countdown.slug}
            token={token}
            initialName={countdown.name}
            initialEmoji={countdown.emoji ?? ''}
            initialDate={countdown.eventDate.toISOString()}
            initialTimezone={countdown.timezone}
            initialCoverImage={countdown.coverImage ?? null}
          />
        </div>
      </div>
    </main>
  )
}
