// app/api/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { eq, and, isNull, count }    from 'drizzle-orm'
import { getDb, schema }             from '@/lib/db'
import { createCountdownSchema }     from '@/lib/validations'
import { generateSlug, hashIp, generateEditToken } from '@/lib/utils'
import { checkRateLimit }            from '@/lib/ratelimit'
import { sendEditLink }              from '@/lib/email'

const MAX_PER_IP       = 10
const MAX_SLUG_ATTEMPTS = 5

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
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

    const { name, emoji, eventDate, timezone, creatorEmail, coverImage } = parsed.data

    // ── Identify caller ────────────────────────────────────────────────
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      '0.0.0.0'

    // ── Upstash rate limit: 5 requests per 10 min per IP ──────────────
    const rl = await checkRateLimit(ip)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before trying again.' },
        {
          status:  429,
          headers: {
            'Retry-After':           String(Math.ceil((rl.reset - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    const ipHash = hashIp(ip)

    // ── DB ─────────────────────────────────────────────────────────────
    const db = getDb()
    if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

    // ── Enforce 10-per-IP limit ────────────────────────────────────────
    const [{ value: activeCount }] = await db
      .select({ value: count() })
      .from(schema.countdowns)
      .where(and(eq(schema.countdowns.ipHash, ipHash), isNull(schema.countdowns.deletedAt)))

    if (Number(activeCount) >= MAX_PER_IP) {
      return NextResponse.json(
        {
          error: `You've reached the limit of ${MAX_PER_IP} active countdowns. Delete one to create a new one.`,
          code:  'LIMIT_REACHED',
        },
        { status: 429 }
      )
    }

    // ── Convert to UTC ─────────────────────────────────────────────────
    const { fromZonedTime } = await import('date-fns-tz')
    const eventDateUtc = fromZonedTime(new Date(eventDate), timezone)

    if (eventDateUtc.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'Event date must be in the future' }, { status: 400 })
    }

    // ── Generate unique slug ───────────────────────────────────────────
    let slug = ''
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const candidate = generateSlug(10)
      const existing  = await db
        .select({ id: schema.countdowns.id })
        .from(schema.countdowns)
        .where(eq(schema.countdowns.slug, candidate))
        .limit(1)
      if (existing.length === 0) { slug = candidate; break }
    }
    if (!slug) {
      return NextResponse.json({ error: 'Failed to generate a unique link. Please try again.' }, { status: 500 })
    }

    // ── Generate edit token if email provided ──────────────────────────
    const editToken = creatorEmail ? generateEditToken() : null

    // ── Insert ─────────────────────────────────────────────────────────
    await db.insert(schema.countdowns).values({
      slug,
      name:         name.trim(),
      emoji:        emoji ?? null,
      timezone,
      eventDate:    eventDateUtc,
      coverImage:   coverImage ?? null,
      creatorEmail: creatorEmail ?? null,
      editToken:    editToken ?? null,
      ipHash,
    })

    // ── Send edit link email ───────────────────────────────────────────
    if (creatorEmail && editToken) {
      const baseUrl  = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memoriza.vercel.app'
      const editUrl  = `${baseUrl}/c/${slug}/edit?token=${editToken}`
      // Non-blocking — don't fail the whole request if email fails
      sendEditLink({ to: creatorEmail, eventName: name.trim(), editUrl, slug })
        .catch((err) => console.error('[create] Failed to send edit email:', err))
    }

    return NextResponse.json({ slug }, { status: 201 })
  } catch (err) {
    console.error('[api/create]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
