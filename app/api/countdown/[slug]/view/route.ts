// app/api/countdown/[slug]/view/route.ts
// Called once per page load from the countdown page (client-side, fire-and-forget).
// Uses sql increment to avoid read-modify-write race conditions.

import { NextRequest, NextResponse } from 'next/server'
import { eq, and, isNull, sql }      from 'drizzle-orm'
import { getDb, schema }             from '@/lib/db'

export const runtime = 'edge'

export async function POST(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  if (!slug || slug.length > 16) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  const db = getDb()
  if (!db) return NextResponse.json({ ok: false }, { status: 503 })

  try {
    await db
      .update(schema.countdowns)
      .set({ viewCount: sql`${schema.countdowns.viewCount} + 1` })
      .where(
        and(
          eq(schema.countdowns.slug, slug),
          isNull(schema.countdowns.deletedAt)
        )
      )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[view]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
