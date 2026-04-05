// app/api/dashboard/[slug]/route.ts
import { NextRequest, NextResponse }  from 'next/server'
import { auth }                       from '@clerk/nextjs/server'
import { eq, and, isNull }            from 'drizzle-orm'
import { getDb, schema }              from '@/lib/db'
import { dashboardEditSchema }        from '@/lib/validations'

export const runtime = 'nodejs'

// ── PATCH — edit a countdown (auth, no token required) ───────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = params
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = dashboardEditSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  const { name, emoji, timezone, eventDate, coverImage, customSlug, remindersEnabled } = parsed.data

  const db = getDb()
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  // Verify ownership
  const rows = await db.select({ id: schema.countdowns.id })
    .from(schema.countdowns)
    .where(and(
      eq(schema.countdowns.slug, slug),
      eq(schema.countdowns.userId, userId),
      isNull(schema.countdowns.deletedAt)
    ))
    .limit(1)

  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Check custom slug uniqueness (if changed)
  if (customSlug) {
    const conflict = await db.select({ id: schema.countdowns.id })
      .from(schema.countdowns)
      .where(and(eq(schema.countdowns.slug, customSlug), isNull(schema.countdowns.deletedAt)))
      .limit(1)

    if (conflict.length > 0 && conflict[0].id !== rows[0].id) {
      return NextResponse.json({ error: 'This custom slug is already taken.' }, { status: 409 })
    }
  }

  const { fromZonedTime } = await import('date-fns-tz')
  const eventDateUtc = fromZonedTime(new Date(eventDate), timezone)
  if (eventDateUtc.getTime() <= Date.now()) {
    return NextResponse.json({ error: 'Event date must be in the future' }, { status: 400 })
  }

  await db.update(schema.countdowns)
    .set({
      name:             name.trim(),
      emoji:            emoji ?? null,
      timezone,
      eventDate:        eventDateUtc,
      coverImage:       coverImage ?? null,
      customSlug:       customSlug ?? null,
      // If custom slug set, make it the primary slug too
      ...(customSlug ? { slug: customSlug } : {}),
      remindersEnabled: remindersEnabled ?? false,
    })
    .where(eq(schema.countdowns.slug, slug))

  // Return the new slug in case it changed
  const newSlug = customSlug ?? slug
  return NextResponse.json({ ok: true, slug: newSlug })
}

// ── DELETE — soft-delete (auth, no token required) ────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = params
  const db = getDb()
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  const rows = await db.select({ id: schema.countdowns.id })
    .from(schema.countdowns)
    .where(and(
      eq(schema.countdowns.slug, slug),
      eq(schema.countdowns.userId, userId),
      isNull(schema.countdowns.deletedAt)
    ))
    .limit(1)

  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.update(schema.countdowns)
    .set({ deletedAt: new Date() })
    .where(eq(schema.countdowns.slug, slug))

  return NextResponse.json({ ok: true })
}
