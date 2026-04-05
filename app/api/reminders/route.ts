// app/api/reminders/route.ts
// Called by Vercel Cron daily at 08:00 UTC.
// Finds countdowns with reminders enabled and sends emails at:
//   7 days before, 1 day before, and on the day of the event.

import { NextRequest, NextResponse }        from 'next/server'
import { and, isNull, eq, gte, lte, sql }   from 'drizzle-orm'
import { getDb, schema }                    from '@/lib/db'

export const runtime = 'nodejs'

// Vercel cron secret — set CRON_SECRET in env, Vercel passes it as Authorization header
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // dev: allow without secret
  return req.headers.get('authorization') === `Bearer ${secret}`
}

interface ReminderPayload {
  to:        string
  eventName: string
  eventDate: Date
  slug:      string
  timing:    '7d' | '1d' | 'day'
}

async function sendReminderEmail({ to, eventName, eventDate, slug, timing }: ReminderPayload) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const baseUrl      = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memoriza.vercel.app'
  const countdownUrl = `${baseUrl}/c/${slug}`

  const timingLabel = timing === '7d'  ? 'in 7 days'
                    : timing === '1d'  ? 'tomorrow'
                    : 'today!'

  const subject = timing === 'day'
    ? `🎉 Today is the day — ${eventName}`
    : `⏳ ${eventName} is ${timingLabel} — Memoriza`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0A0C10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#131720;border:1px solid #1E2433;border-radius:16px;overflow:hidden;max-width:100%;">
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid #1E2433;">
            <div style="width:28px;height:28px;background:#6C63FF;border-radius:8px;display:inline-block;"></div>
            <span style="font-size:16px;font-weight:600;color:#F2F2F5;margin-left:10px;vertical-align:top;line-height:28px;">Memoriza</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 8px;font-size:13px;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;font-family:monospace;">
              ${timing === 'day' ? "It's happening now" : `Coming up ${timingLabel}`}
            </p>
            <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#F2F2F5;line-height:1.2;">${eventName}</h1>
            <p style="margin:0 0 28px;font-size:15px;color:#9CA3AF;line-height:1.6;">
              ${timing === 'day'
                ? "Today's the day! Your countdown has reached zero."
                : `Your event is coming up ${timingLabel}. Don't forget to share the countdown with everyone involved.`
              }
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#6C63FF;border-radius:10px;">
                  <a href="${countdownUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                    View countdown →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #1E2433;">
            <p style="margin:0;font-size:12px;color:#4B5563;">
              You're receiving this because you enabled reminders for this countdown.
              <a href="${baseUrl}/c/${slug}/edit" style="color:#6C63FF;text-decoration:none;margin-left:4px;">Manage settings</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:    process.env.RESEND_FROM_EMAIL ?? 'Memoriza <noreply@memoriza.vercel.app>',
      to:      [to],
      subject,
      html,
    }),
  })
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDb()
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  const now       = new Date()
  const in7d      = new Date(now.getTime() + 7  * 24 * 3600 * 1000)
  const in1d      = new Date(now.getTime() + 1  * 24 * 3600 * 1000)
  const todayEnd  = new Date(now.getTime() + 24 * 3600 * 1000)

  // Fetch all active countdowns with reminders enabled that have an email
  const rows = await db
    .select()
    .from(schema.countdowns)
    .where(
      and(
        isNull(schema.countdowns.deletedAt),
        eq(schema.countdowns.remindersEnabled, true),
        sql`${schema.countdowns.creatorEmail} IS NOT NULL`,
        // Only fetch events that haven't happened yet
        gte(schema.countdowns.eventDate, now)
      )
    )

  let sent = 0

  for (const row of rows) {
    if (!row.creatorEmail) continue

    const eventTime    = row.eventDate.getTime()
    const alreadySent  = (row.remindersSent ?? '').split(',').filter(Boolean)

    const timings: Array<'7d' | '1d' | 'day'> = []

    // 7 days: event within 7d+1h window, not yet sent
    if (
      eventTime <= in7d.getTime() + 3600_000 &&
      eventTime > in1d.getTime() &&
      !alreadySent.includes('7d')
    ) timings.push('7d')

    // 1 day: event within 1d+1h window, not yet sent
    if (
      eventTime <= in1d.getTime() + 3600_000 &&
      eventTime > todayEnd.getTime() &&
      !alreadySent.includes('1d')
    ) timings.push('1d')

    // Day-of: event today, not yet sent
    if (
      eventTime <= todayEnd.getTime() &&
      eventTime > now.getTime() &&
      !alreadySent.includes('day')
    ) timings.push('day')

    for (const timing of timings) {
      try {
        await sendReminderEmail({
          to:        row.creatorEmail,
          eventName: row.name,
          eventDate: row.eventDate,
          slug:      row.slug,
          timing,
        })

        // Mark as sent
        const newSent = [...alreadySent, timing].join(',')
        await db.update(schema.countdowns)
          .set({ remindersSent: newSent })
          .where(eq(schema.countdowns.id, row.id))

        sent++
      } catch (err) {
        console.error(`[reminders] Failed for ${row.slug} (${timing}):`, err)
      }
    }
  }

  return NextResponse.json({ ok: true, sent, checked: rows.length })
}
