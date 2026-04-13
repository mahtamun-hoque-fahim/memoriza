// app/api/cron/reminders/route.ts
// Runs daily at 08:00 UTC via Vercel cron (vercel.json)
// Finds dates due for reminders and sends emails to owner + recipient.
// Phase 3 will flesh this out fully.
import { NextResponse } from 'next/server'

export const runtime = 'nodejs' // needs DB + email, not Edge

export async function GET(req: Request) {
  // Verify request is from Vercel cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO Phase 3: query dates where event_date - reminder_days = TODAY
  // and no reminder email was sent today, then send via Resend.

  return NextResponse.json({ ok: true, processed: 0, message: 'Phase 3 pending' })
}
