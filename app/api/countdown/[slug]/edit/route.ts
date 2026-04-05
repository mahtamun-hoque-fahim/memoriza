// app/api/countdown/[slug]/edit/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { eq, and, isNull }           from 'drizzle-orm'
import { getDb, schema }             from '@/lib/db'
import { editCountdownSchema }       from '@/lib/validations'

export const runtime = 'nodejs'

export async function PATCH(
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

  const parsed = editCountdownSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const { token, name, emoji, timezone, eventDate, coverImage } = parsed.data

  const db = getDb()
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  // Verify slug + token match (timing-safe enough for this use case)
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

  // Convert eventDate to UTC
  const { fromZonedTime } = await import('date-fns-tz')
  const eventDateUtc = fromZonedTime(new Date(eventDate), timezone)

  if (eventDateUtc.getTime() <= Date.now()) {
    return NextResponse.json({ error: 'Event date must be in the future' }, { status: 400 })
  }

  await db
    .update(schema.countdowns)
    .set({
      name:       name.trim(),
      emoji:      emoji ?? null,
      timezone,
      eventDate:  eventDateUtc,
      coverImage: coverImage ?? null,
    })
    .where(eq(schema.countdowns.slug, slug))

  return NextResponse.json({ ok: true, slug })
}
