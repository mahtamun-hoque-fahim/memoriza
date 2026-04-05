// app/api/create/route.ts
import { NextRequest, NextResponse }                from 'next/server'
import { auth }                                     from '@/lib/auth'
import { eq, and, isNull, count }                   from 'drizzle-orm'
import { getDb, schema }                            from '@/lib/db'
import { createCountdownSchema }                    from '@/lib/validations'
import { generateSlug, hashIp, generateEditToken }  from '@/lib/utils'
import { checkRateLimit }                           from '@/lib/ratelimit'
import { sendEditLink }                             from '@/lib/email'

const MAX_PER_IP    = 10
const MAX_PER_USER  = 50
const MAX_SLUG_TRIES = 5

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId  = session?.user?.id ?? null

    let body: unknown
    try { body = await req.json() } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = createCountdownSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
    }

    const { name, emoji, eventDate, timezone, creatorEmail, coverImage, customSlug, remindersEnabled } = parsed.data

    if (customSlug && !userId) {
      return NextResponse.json({ error: 'Sign in to use a custom slug' }, { status: 401 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            ?? req.headers.get('x-real-ip')
            ?? '0.0.0.0'

    // Upstash rate limit (anon only)
    if (!userId) {
      const rl = await checkRateLimit(ip)
      if (!rl.allowed) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a few minutes.' },
          { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) } }
        )
      }
    }

    const ipHash = hashIp(ip)
    const db     = getDb()
    if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

    // Custom slug uniqueness
    if (customSlug) {
      const existing = await db.select({ id: schema.countdowns.id })
        .from(schema.countdowns).where(eq(schema.countdowns.slug, customSlug)).limit(1)
      if (existing.length > 0) {
        return NextResponse.json({ error: 'This custom slug is already taken.' }, { status: 409 })
      }
    }

    // Active countdown limit
    if (userId) {
      const [{ value: n }] = await db.select({ value: count() }).from(schema.countdowns)
        .where(and(eq(schema.countdowns.userId, userId), isNull(schema.countdowns.deletedAt)))
      if (Number(n) >= MAX_PER_USER) {
        return NextResponse.json({ error: `Limit of ${MAX_PER_USER} countdowns reached.`, code: 'LIMIT_REACHED' }, { status: 429 })
      }
    } else {
      const [{ value: n }] = await db.select({ value: count() }).from(schema.countdowns)
        .where(and(eq(schema.countdowns.ipHash, ipHash), isNull(schema.countdowns.deletedAt)))
      if (Number(n) >= MAX_PER_IP) {
        return NextResponse.json({ error: `Limit of ${MAX_PER_IP} countdowns reached. Sign in for more.`, code: 'LIMIT_REACHED' }, { status: 429 })
      }
    }

    const { fromZonedTime } = await import('date-fns-tz')
    const eventDateUtc = fromZonedTime(new Date(eventDate), timezone)
    if (eventDateUtc.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Event date must be in the future' }, { status: 400 })
    }

    // Slug
    let slug = customSlug ?? ''
    if (!slug) {
      for (let i = 0; i < MAX_SLUG_TRIES; i++) {
        const c = generateSlug(10)
        const e = await db.select({ id: schema.countdowns.id }).from(schema.countdowns)
          .where(eq(schema.countdowns.slug, c)).limit(1)
        if (e.length === 0) { slug = c; break }
      }
    }
    if (!slug) return NextResponse.json({ error: 'Failed to generate slug. Please try again.' }, { status: 500 })

    const editToken = generateEditToken()

    await db.insert(schema.countdowns).values({
      slug,
      customSlug:       customSlug ?? null,
      name:             name.trim(),
      emoji:            emoji ?? null,
      timezone,
      eventDate:        eventDateUtc,
      coverImage:       coverImage ?? null,
      userId,
      creatorEmail:     creatorEmail ?? null,
      editToken,
      remindersEnabled: remindersEnabled ?? false,
      ipHash,
    })

    if (creatorEmail) {
      const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memoriza.vercel.app'
      sendEditLink({ to: creatorEmail, eventName: name.trim(), editUrl: `${base}/c/${slug}/edit?token=${editToken}`, slug })
        .catch((e) => console.error('[create] email error:', e))
    }

    return NextResponse.json({ slug }, { status: 201 })
  } catch (err) {
    console.error('[api/create]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
