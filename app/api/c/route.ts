// app/api/c/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { eq, and, isNull }           from 'drizzle-orm'
import { getDb, schema }             from '@/lib/db'

export const runtime = 'edge'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params

  if (!slug || slug.length > 16) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const db = getDb()
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  const rows = await db
    .select()
    .from(schema.countdowns)
    .where(
      and(
        eq(schema.countdowns.slug, slug),
        isNull(schema.countdowns.deletedAt)
      )
    )
    .limit(1)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const row = rows[0]

  return NextResponse.json({
    slug:      row.slug,
    name:      row.name,
    emoji:     row.emoji,
    timezone:  row.timezone,
    eventDate: row.eventDate.toISOString(),
    createdAt: row.createdAt.toISOString(),
  })
}
