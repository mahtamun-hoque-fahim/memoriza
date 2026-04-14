// lib/reminder.ts — core reminder sending logic (used by cron + manual trigger)
// Idempotent: checks email_logs before sending to prevent double-sends.

import { getDb, schema }        from '@/lib/db'
import { sendEmail }            from '@/lib/resend'
import { reminderOwnerEmail, reminderRecipientEmail } from '@/components/emails/ReminderEmail'
import { and, eq, sql, isNotNull } from 'drizzle-orm'

// ── Resolve next occurrence for yearly dates ──────────────────────────────────

function nextOccurrence(eventDate: Date, recurrence: string): Date {
  const d = new Date(eventDate)
  if (recurrence !== 'yearly') return d

  const now = new Date()
  d.setFullYear(now.getFullYear())
  // If this year's date has already passed by more than a day, use next year
  if (d.getTime() < now.getTime() - 86_400_000) {
    d.setFullYear(now.getFullYear() + 1)
  }
  return d
}

// ── Days until a date (floored to whole days, UTC) ────────────────────────────

function daysUntil(target: Date): number {
  const now      = new Date()
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const tgtUtc   = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())
  return Math.round((tgtUtc - todayUtc) / 86_400_000)
}

// ── Already sent today? ───────────────────────────────────────────────────────

async function alreadySentToday(
  db: ReturnType<typeof getDb>,
  dateId: string,
  recipientEmail: string,
  type: 'reminder' | 'day_of',
): Promise<boolean> {
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const rows = await db
    .select({ id: schema.emailLogs.id })
    .from(schema.emailLogs)
    .where(
      and(
        eq(schema.emailLogs.dateId,         dateId),
        eq(schema.emailLogs.recipientEmail, recipientEmail),
        eq(schema.emailLogs.type,           type),
        sql`${schema.emailLogs.sentAt} >= ${todayStart.toISOString()}`,
      )
    )
    .limit(1)

  return rows.length > 0
}

// ── Log + send ────────────────────────────────────────────────────────────────

async function logAndSend(
  db: ReturnType<typeof getDb>,
  dateId:        string,
  recipientType: 'owner' | 'recipient',
  recipientEmail: string,
  type:          'reminder' | 'day_of',
  subject:       string,
  html:          string,
): Promise<void> {
  // Insert log row first (idempotency guard above handles duplicates)
  const [logRow] = await db
    .insert(schema.emailLogs)
    .values({ dateId, recipientType, recipientEmail, type, status: 'queued' })
    .returning({ id: schema.emailLogs.id })

  try {
    const resendId = await sendEmail({ to: recipientEmail, subject, html })
    await db
      .update(schema.emailLogs)
      .set({ status: 'sent', resendId })
      .where(eq(schema.emailLogs.id, logRow.id))
  } catch (err) {
    await db
      .update(schema.emailLogs)
      .set({ status: 'failed' })
      .where(eq(schema.emailLogs.id, logRow.id))
    throw err
  }
}

// ── processReminders ─────────────────────────────────────────────────────────
// Called by the cron route. Returns counts for logging.

export async function processReminders(): Promise<{ processed: number; sent: number; errors: number }> {
  const db = getDb()
  if (!db) throw new Error('DB unavailable')

  // Fetch all active dates that have a user email
  const rows = await db
    .select({
      id:             schema.dates.id,
      title:          schema.dates.title,
      occasion:       schema.dates.occasion,
      eventDate:      schema.dates.eventDate,
      recurrence:     schema.dates.recurrence,
      slug:           schema.dates.slug,
      reminderDays:   schema.dates.reminderDays,
      recipientName:  schema.dates.recipientName,
      recipientEmail: schema.dates.recipientEmail,
      ownerEmail:     schema.users.email,
    })
    .from(schema.dates)
    .innerJoin(schema.users, eq(schema.dates.userId, schema.users.id))
    .where(eq(schema.dates.isActive, true))

  let processed = 0
  let sent      = 0
  let errors    = 0

  for (const row of rows) {
    try {
      const next  = nextOccurrence(new Date(row.eventDate), row.recurrence)
      const days  = daysUntil(next)
      const type: 'reminder' | 'day_of' = days === 0 ? 'day_of' : 'reminder'

      // Only send on day-of or exactly on the configured reminder window
      if (days !== 0 && days !== row.reminderDays) continue

      const dateInfo = {
        title:         row.title,
        occasion:      row.occasion,
        eventDate:     next,
        slug:          row.slug,
        recipientName: row.recipientName,
        recurrence:    row.recurrence,
      }

      processed++

      // ── Owner email ───────────────────────────────────────────────────────
      if (!(await alreadySentToday(db, row.id, row.ownerEmail, type))) {
        const { subject, html } = reminderOwnerEmail(dateInfo, days)
        await logAndSend(db, row.id, 'owner', row.ownerEmail, type, subject, html)
        sent++
      }

      // ── Recipient email ───────────────────────────────────────────────────
      if (row.recipientEmail && !(await alreadySentToday(db, row.id, row.recipientEmail, type))) {
        const { subject, html } = reminderRecipientEmail(dateInfo, days, row.ownerEmail)
        await logAndSend(db, row.id, 'recipient', row.recipientEmail, type, subject, html)
        sent++
      }
    } catch (err) {
      errors++
      console.error(`[reminders] error for date ${row.id}:`, err)
    }
  }

  return { processed, sent, errors }
}
