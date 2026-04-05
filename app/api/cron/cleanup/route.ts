// app/api/cron/cleanup/route.ts
// Vercel Cron: runs weekly (Sunday 03:00 UTC).
// Hard-deletes rows that were soft-deleted more than 1 year ago.

import { NextRequest, NextResponse } from 'next/server'
import { and, lte, isNotNull, sql }  from 'drizzle-orm'
import { getDb, schema }             from '@/lib/db'

export const runtime = 'nodejs'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  const oneYearAgo = new Date(Date.now() - 365 * 24 * 3600 * 1000)

  // Use sql tag for the delete since Drizzle's delete().where() returns the deleted rows
  const result = await db
    .delete(schema.countdowns)
    .where(
      and(
        isNotNull(schema.countdowns.deletedAt),
        lte(schema.countdowns.deletedAt, oneYearAgo)
      )
    )

  console.info(`[cron/cleanup] Hard-deleted old rows before ${oneYearAgo.toISOString()}`)

  return NextResponse.json({ ok: true, cutoff: oneYearAgo.toISOString() })
}
