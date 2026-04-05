// app/api/dashboard/route.ts
import { NextResponse }  from 'next/server'
import { auth }          from '@/lib/auth'
import { eq, and, isNull, desc } from 'drizzle-orm'
import { getDb, schema } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  const userId  = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  const rows = await db
    .select({
      id:               schema.countdowns.id,
      slug:             schema.countdowns.slug,
      customSlug:       schema.countdowns.customSlug,
      name:             schema.countdowns.name,
      emoji:            schema.countdowns.emoji,
      eventDate:        schema.countdowns.eventDate,
      timezone:         schema.countdowns.timezone,
      coverImage:       schema.countdowns.coverImage,
      viewCount:        schema.countdowns.viewCount,
      remindersEnabled: schema.countdowns.remindersEnabled,
      remindersSent:    schema.countdowns.remindersSent,
      createdAt:        schema.countdowns.createdAt,
    })
    .from(schema.countdowns)
    .where(and(eq(schema.countdowns.userId, userId), isNull(schema.countdowns.deletedAt)))
    .orderBy(desc(schema.countdowns.createdAt))

  return NextResponse.json({ countdowns: rows })
}
