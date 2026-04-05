// app/c/[slug]/edit/page.tsx
// Supports two access modes:
//   1. Token-based (?token=...) — for anonymous creators who received the email
//   2. Clerk auth — signed-in users who own the countdown (no token needed)

import { notFound, redirect } from 'next/navigation'
import { auth }               from '@/lib/auth'
import { eq, and, isNull }    from 'drizzle-orm'
import { getDb, schema }      from '@/lib/db'
import { EditForm }           from '@/components/countdown/EditForm'
import type { Metadata }      from 'next'

interface Props {
  params:       { slug: string }
  searchParams: { token?: string }
}

export const metadata: Metadata = {
  title:  'Edit countdown — Memoriza',
  robots: { index: false },
}

async function fetchForEdit(slug: string, token: string | undefined, userId: string | null) {
  if (!slug || slug.length > 64) return null

  const db = getDb()
  if (!db) return null

  const rows = await db
    .select()
    .from(schema.countdowns)
    .where(and(eq(schema.countdowns.slug, slug), isNull(schema.countdowns.deletedAt)))
    .limit(1)

  const row = rows[0]
  if (!row) return null

  // Mode 1: signed-in user owns this countdown
  if (userId && row.userId === userId) return { row, authed: true }

  // Mode 2: valid token provided
  if (token && token.length === 64 && row.editToken === token) return { row, authed: false }

  // No valid access
  return null
}

export default async function EditPage({ params, searchParams }: Props) {
  const session = await auth()
  const userId  = session?.user?.id ?? null
  const token      = searchParams.token

  if (!userId && (!token || token.length !== 64)) {
    redirect(`/c/${params.slug}`)
  }

  const result = await fetchForEdit(params.slug, token, userId ?? null)
  if (!result) notFound()

  const { row } = result

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-center mb-10 animate-slide-up">
          <p className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>
            Editing
          </p>
          <h1 className="font-syne text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text)' }}>
            {row.emoji && <span className="mr-2">{row.emoji}</span>}
            {row.name}
          </h1>
        </div>

        <div className="rounded-2xl border p-6 sm:p-8 animate-slide-up"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          <EditForm
            slug={row.slug}
            token={row.editToken ?? ''}
            isAuthed={!!userId && row.userId === userId}
            initialName={row.name}
            initialEmoji={row.emoji ?? ''}
            initialDate={row.eventDate.toISOString()}
            initialTimezone={row.timezone}
            initialCoverImage={row.coverImage ?? null}
            initialCustomSlug={row.customSlug ?? ''}
            initialReminders={row.remindersEnabled}
          />
        </div>
      </div>
    </main>
  )
}
