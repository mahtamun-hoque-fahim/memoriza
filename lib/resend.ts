// lib/resend.ts — thin wrapper for sending app emails via Resend REST API
const RESEND_API = 'https://api.resend.com/emails'

interface SendEmailOptions {
  to:      string
  subject: string
  html:    string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const res = await fetch(RESEND_API, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to:   [to],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error: ${err}`)
  }

  const data = await res.json() as { id: string }
  return data.id
}
