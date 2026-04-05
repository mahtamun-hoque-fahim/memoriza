// lib/email.ts
// Sends transactional emails via Resend.
// Gracefully no-ops if RESEND_API_KEY is not set (development / Phase 1 deploys).

interface SendEditLinkOptions {
  to:        string
  eventName: string
  editUrl:   string
  slug:      string
}

export async function sendEditLink({
  to,
  eventName,
  editUrl,
  slug,
}: SendEditLinkOptions): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[email] RESEND_API_KEY not set — skipping email send')
      console.info('[email] Edit URL would be:', editUrl)
    }
    return { ok: true } // Graceful no-op in dev
  }

  const baseUrl    = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memoriza.vercel.app'
  const countdownUrl = `${baseUrl}/c/${slug}`

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Memoriza edit link</title>
</head>
<body style="margin:0;padding:0;background:#0A0C10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0C10;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#131720;border:1px solid #1E2433;border-radius:16px;overflow:hidden;max-width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #1E2433;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:28px;height:28px;background:#6C63FF;border-radius:8px;display:inline-block;"></div>
                <span style="font-size:16px;font-weight:600;color:#F2F2F5;letter-spacing:0.02em;">Memoriza</span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;font-family:monospace;">Your countdown</p>
              <h1 style="margin:0 0 24px;font-size:24px;font-weight:700;color:#F2F2F5;line-height:1.2;">${eventName}</h1>

              <p style="margin:0 0 24px;font-size:15px;color:#9CA3AF;line-height:1.6;">
                Here&apos;s your private edit link. Use it to update the event name, date, or delete the countdown at any time.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#6C63FF;border-radius:10px;">
                    <a href="${editUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
                      Edit or delete countdown →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Secondary link -->
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">View countdown:</p>
              <a href="${countdownUrl}" style="font-size:13px;color:#6C63FF;text-decoration:none;font-family:monospace;">${countdownUrl}</a>

              <!-- Divider -->
              <div style="margin:32px 0;height:1px;background:#1E2433;"></div>

              <!-- Warning -->
              <p style="margin:0;font-size:12px;color:#4B5563;line-height:1.6;">
                ⚠️ Keep this email private. Anyone with the edit link can modify or delete your countdown.
                If you didn&apos;t create this countdown, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #1E2433;">
              <p style="margin:0;font-size:12px;color:#4B5563;">
                Sent by <a href="${baseUrl}" style="color:#6B7280;text-decoration:none;">Memoriza</a> · No account required
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    process.env.RESEND_FROM_EMAIL ?? 'Memoriza <noreply@memoriza.vercel.app>',
        to:      [to],
        subject: `Your edit link for "${eventName}" — Memoriza`,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error('[email] Resend error:', res.status, body)
      return { ok: false, error: 'Failed to send email' }
    }

    return { ok: true }
  } catch (err) {
    console.error('[email] Network error sending via Resend:', err)
    return { ok: false, error: 'Email send failed' }
  }
}
