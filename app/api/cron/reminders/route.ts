// app/api/cron/reminders/route.ts
// Runs daily at 08:00 UTC via Vercel cron (vercel.json).
// Also callable manually with the correct CRON_SECRET for testing.

import { NextResponse }     from 'next/server'
import { processReminders } from '@/lib/reminder'

export const runtime = 'nodejs'
export const maxDuration = 60  // Vercel Pro: up to 300s, Hobby: 60s

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processReminders()
    console.log('[cron/reminders]', result)
    return NextResponse.json({ ok: true, ...result })
  } catch (err: any) {
    console.error('[cron/reminders] fatal:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
