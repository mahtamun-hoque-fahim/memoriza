// app/api/countdown/[slug]/delete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { eq, and, isNull }           from 'drizzle-orm'
import { getDb, schema }             from '@/lib/db'
import { deleteCountdownSchema }     from '@/lib/validations'

export const runtime = 'nodejs'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  if (!slug || slug.length > 16) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = deleteCountdownSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  const { token } = parsed.data

  const db = getDb()
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  const rows = await db
    .select({ id: schema.countdowns.id, editToken: schema.countdowns.editToken })
    .from(schema.countdowns)
    .where(and(eq(schema.countdowns.slug, slug), isNull(schema.countdowns.deletedAt)))
    .limit(1)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Countdown not found' }, { status: 404 })
  }

  if (rows[0].editToken !== token) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 })
  }

  // Soft-delete — preserves row for analytics, cleaned up by cron in Phase 4
  await db
    .update(schema.countdowns)
    .set({ deletedAt: new Date() })
    .where(eq(schema.countdowns.slug, slug))

  return NextResponse.json({ ok: true })
}
