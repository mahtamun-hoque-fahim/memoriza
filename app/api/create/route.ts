// app/api/create/route.ts
import { NextRequest, NextResponse }         from 'next/server'
import { auth }                              from '@clerk/nextjs/server'
import { eq, and, isNull, count }            from 'drizzle-orm'
import { getDb, schema }                     from '@/lib/db'
import { createCountdownSchema }             from '@/lib/validations'
import { generateSlug, hashIp, generateEditToken } from '@/lib/utils'
import { checkRateLimit }                    from '@/lib/ratelimit'
import { sendEditLink }                      from '@/lib/email'

const MAX_PER_IP        = 10   // anonymous limit
const MAX_PER_USER      = 50   // authenticated limit
const MAX_SLUG_ATTEMPTS = 5

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    // ── Auth (optional) ────────────────────────────────────────────────
    const { userId } = auth()

    // ── Parse & validate ───────────────────────────────────────────────
    let body: unknown
    try { body = await req.json() } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = createCountdownSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { name, emoji, eventDate, timezone, creatorEmail, coverImage, customSlug, remindersEnabled } = parsed.data

    // ── Custom slug validation (auth users only) ────────────────────────
    if (customSlug && !userId) {
      return NextResponse.json(
        { error: 'Sign in to use a custom slug' },
        { status: 401 }
      )
    }

    if (customSlug) {
      // Check uniqueness
      const existing = await (async () => {
        const db = getDb()
        if (!db) return []
        return db.select({ id: schema.countdowns.id })
          .from(schema.countdowns)
          .where(eq(schema.countdowns.slug, customSlug))
          .limit(1)
      })()
      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'This custom slug is already taken. Try another.' },
          { status: 409 }
        )
      }
    }

    // ── IP identification ──────────────────────────────────────────────
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      '0.0.0.0'

    // ── Rate limit (anon only — auth users get higher limit from DB) ───
    if (!userId) {
      const rl = await checkRateLimit(ip)
      if (!rl.allowed) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a few minutes before trying again.' },
          {
            status: 429,
            headers: {
              'Retry-After':           String(Math.ceil((rl.reset - Date.now()) / 1000)),
              'X-RateLimit-Remaining': '0',
            },
          }
        )
      }
    }

    const ipHash = hashIp(ip)
    const db     = getDb()
    if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

    // ── Per-user / per-IP active countdown limit ───────────────────────
    if (userId) {
      const [{ value: userCount }] = await db
        .select({ value: count() })
        .from(schema.countdowns)
        .where(and(eq(schema.countdowns.userId, userId), isNull(schema.countdowns.deletedAt)))

      if (Number(userCount) >= MAX_PER_USER) {
        return NextResponse.json(
          { error: `You've reached the limit of ${MAX_PER_USER} active countdowns.`, code: 'LIMIT_REACHED' },
          { status: 429 }
        )
      }
    } else {
      const [{ value: ipCount }] = await db
        .select({ value: count() })
        .from(schema.countdowns)
        .where(and(eq(schema.countdowns.ipHash, ipHash), isNull(schema.countdowns.deletedAt)))

      if (Number(ipCount) >= MAX_PER_IP) {
        return NextResponse.json(
          { error: `You've reached the limit of ${MAX_PER_IP} active countdowns. Sign in for a higher limit.`, code: 'LIMIT_REACHED' },
          { status: 429 }
        )
      }
    }

    // ── Convert to UTC ─────────────────────────────────────────────────
    const { fromZonedTime } = await import('date-fns-tz')
    const eventDateUtc = fromZonedTime(new Date(eventDate), timezone)

    if (eventDateUtc.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Event date must be in the future' }, { status: 400 })
    }

    // ── Slug: custom or auto-generated ────────────────────────────────
    let slug = customSlug ?? ''
    if (!slug) {
      for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
        const candidate = generateSlug(10)
        const existing  = await db
          .select({ id: schema.countdowns.id })
          .from(schema.countdowns)
          .where(eq(schema.countdowns.slug, candidate))
          .limit(1)
        if (existing.length === 0) { slug = candidate; break }
      }
    }

    if (!slug) {
      return NextResponse.json({ error: 'Failed to generate a unique link. Please try again.' }, { status: 500 })
    }

    // ── Edit token (always generate — needed for anon edit flow) ──────
    const editToken = generateEditToken()

    // ── Insert ─────────────────────────────────────────────────────────
    await db.insert(schema.countdowns).values({
      slug,
      customSlug:       customSlug ?? null,
      name:             name.trim(),
      emoji:            emoji ?? null,
      timezone,
      eventDate:        eventDateUtc,
      coverImage:       coverImage ?? null,
      userId:           userId ?? null,
      creatorEmail:     creatorEmail ?? null,
      editToken,
      remindersEnabled: remindersEnabled ?? false,
      ipHash,
    })

    // ── Send edit email (non-blocking) ─────────────────────────────────
    const emailTarget = creatorEmail
    if (emailTarget && editToken) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memoriza.vercel.app'
      sendEditLink({
        to: emailTarget, eventName: name.trim(),
        editUrl: `${baseUrl}/c/${slug}/edit?token=${editToken}`, slug,
      }).catch((err) => console.error('[create] Email error:', err))
    }

    return NextResponse.json({ slug }, { status: 201 })
  } catch (err) {
    console.error('[api/create]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
