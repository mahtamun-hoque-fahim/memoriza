// components/emails/ReminderEmail.ts — HTML email templates (plain TS, no JSX)
// All templates return raw HTML strings — no React Email dependency needed.

import { OCCASION_ICONS, OCCASION_LABELS, OCCASION_ACCENTS } from '@/lib/utils'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memoriza.app'

// ── Shared shell ──────────────────────────────────────────────────────────────

function shell(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Memoriza</title>
</head>
<body style="margin:0;padding:0;background:#0A0C10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
        style="background:#131720;border:1px solid #1E2433;border-radius:16px;overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:24px 36px;border-bottom:1px solid #1E2433;">
            <a href="${BASE_URL}" style="font-size:18px;font-weight:700;color:#F2F2F5;text-decoration:none;letter-spacing:-0.3px;">
              Memoriza
            </a>
          </td>
        </tr>

        <!-- Body -->
        ${content}

        <!-- Footer -->
        <tr>
          <td style="padding:20px 36px;border-top:1px solid #1E2433;">
            <p style="margin:0;font-size:12px;color:#4B5563;line-height:1.6;">
              Sent by <a href="${BASE_URL}" style="color:#6B7280;text-decoration:none;">Memoriza</a>.
              You're receiving this because a reminder was set up for this date.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Shared CTA button ─────────────────────────────────────────────────────────

function ctaButton(href: string, text: string, accent = '#6C63FF') {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr>
      <td style="background:${accent};border-radius:10px;">
        <a href="${href}"
          style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
          ${text} →
        </a>
      </td>
    </tr>
  </table>`
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface DateInfo {
  title:          string
  occasion:       string
  eventDate:      Date
  slug:           string
  recipientName:  string | null
  recurrence:     string
}

// ── confirmationEmail ─────────────────────────────────────────────────────────

export function confirmationEmail(date: DateInfo): { subject: string; html: string } {
  const icon   = OCCASION_ICONS[date.occasion]   ?? '✨'
  const label  = OCCASION_LABELS[date.occasion]  ?? 'Special occasion'
  const accent = OCCASION_ACCENTS[date.occasion] ?? '#6C63FF'
  const pageUrl = `${BASE_URL}/c/${date.slug}`

  const dateStr = new Date(date.eventDate).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const subject = `${icon} "${date.title}" is saved — we'll remind you!`

  const html = shell(`
    <tr>
      <td style="padding:32px 36px;">
        <!-- Occasion badge -->
        <div style="display:inline-block;padding:5px 14px;border-radius:999px;
          background:${accent}20;border:1px solid ${accent}40;
          font-size:12px;color:${accent};font-family:monospace;
          text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;">
          ${icon} ${label}
        </div>

        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F2F2F5;line-height:1.3;">
          ${date.title}
        </h1>
        <p style="margin:0 0 24px;font-size:14px;color:#9CA3AF;">
          ${dateStr}${date.recurrence === 'yearly' ? ' · repeats every year' : ''}
        </p>

        <p style="margin:0 0 8px;font-size:15px;color:#D1D5DB;line-height:1.7;">
          Your date is saved. We'll send you a reminder
          ${date.recipientName ? `and <strong style="color:#F2F2F5;">${date.recipientName}</strong>` : ''}
          before it arrives — so you'll never forget.
        </p>

        ${ctaButton(pageUrl, 'View countdown page', accent)}

        <div style="margin-top:28px;padding:16px;background:#0A0C10;border-radius:10px;border:1px solid #1E2433;">
          <p style="margin:0;font-size:12px;color:#6B7280;">
            Shareable link:<br/>
            <a href="${pageUrl}" style="color:${accent};word-break:break-all;">${pageUrl}</a>
          </p>
        </div>
      </td>
    </tr>
  `)

  return { subject, html }
}

// ── reminderEmail (owner) ─────────────────────────────────────────────────────

export function reminderOwnerEmail(date: DateInfo, daysLeft: number): { subject: string; html: string } {
  const icon    = OCCASION_ICONS[date.occasion]   ?? '✨'
  const label   = OCCASION_LABELS[date.occasion]  ?? 'Special occasion'
  const accent  = OCCASION_ACCENTS[date.occasion] ?? '#6C63FF'
  const pageUrl = `${BASE_URL}/c/${date.slug}`

  const dateStr = new Date(date.eventDate).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  const urgencyText = daysLeft === 0
    ? "It's today!"
    : daysLeft === 1
    ? "It's tomorrow!"
    : `${daysLeft} days to go`

  const subject = daysLeft === 0
    ? `${icon} Today is "${date.title}"! 🎉`
    : daysLeft === 1
    ? `${icon} Tomorrow: "${date.title}"`
    : `${icon} ${daysLeft} days until "${date.title}"`

  const html = shell(`
    <tr>
      <td style="padding:32px 36px;">
        <div style="display:inline-block;padding:5px 14px;border-radius:999px;
          background:${accent}20;border:1px solid ${accent}40;
          font-size:12px;color:${accent};font-family:monospace;
          text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;">
          ${icon} ${label}
        </div>

        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F2F2F5;line-height:1.3;">
          ${urgencyText}
        </h1>
        <p style="margin:0 0 8px;font-size:14px;color:#9CA3AF;">${dateStr}</p>

        <p style="margin:0 0 4px;font-size:24px;font-weight:700;color:${accent};">
          ${date.title}
        </p>
        ${date.recipientName
          ? `<p style="margin:8px 0 0;font-size:15px;color:#D1D5DB;">Don't forget — <strong style="color:#F2F2F5;">${date.recipientName}</strong> is counting on you.</p>`
          : ''}

        ${ctaButton(pageUrl, 'View countdown page', accent)}
      </td>
    </tr>
  `)

  return { subject, html }
}

// ── reminderEmail (recipient) ─────────────────────────────────────────────────

export function reminderRecipientEmail(
  date: DateInfo,
  daysLeft: number,
  ownerEmail: string,
): { subject: string; html: string } {
  const icon    = OCCASION_ICONS[date.occasion]   ?? '✨'
  const label   = OCCASION_LABELS[date.occasion]  ?? 'Special occasion'
  const accent  = OCCASION_ACCENTS[date.occasion] ?? '#6C63FF'
  const pageUrl = `${BASE_URL}/c/${date.slug}`

  const greeting = date.recipientName ? `Hi ${date.recipientName},` : 'Hello,'

  const subject = daysLeft === 0
    ? `${icon} Today is your special day!`
    : daysLeft === 1
    ? `${icon} Tomorrow is your special day!`
    : `${icon} Your special day is in ${daysLeft} days`

  const html = shell(`
    <tr>
      <td style="padding:32px 36px;">
        <div style="display:inline-block;padding:5px 14px;border-radius:999px;
          background:${accent}20;border:1px solid ${accent}40;
          font-size:12px;color:${accent};font-family:monospace;
          text-transform:uppercase;letter-spacing:0.08em;margin-bottom:20px;">
          ${icon} ${label}
        </div>

        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#F2F2F5;line-height:1.3;">
          ${greeting}
        </h1>

        <p style="margin:0 0 16px;font-size:15px;color:#D1D5DB;line-height:1.7;">
          Someone special set up a Memoriza reminder for <strong style="color:#F2F2F5;">${date.title}</strong>${
            daysLeft === 0
              ? " — and today is the day!"
              : daysLeft === 1
              ? " — and it's tomorrow!"
              : `, coming up in <strong style="color:${accent};">${daysLeft} days</strong>.`
          }
        </p>

        <p style="margin:0 0 0;font-size:14px;color:#6B7280;">
          They want to make sure this moment is celebrated. ❤️
        </p>

        ${ctaButton(pageUrl, 'See your countdown page', accent)}
      </td>
    </tr>
  `)

  return { subject, html }
}
