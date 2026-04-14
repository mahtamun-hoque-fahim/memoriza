// app/api/webhooks/resend/route.ts
// Receives delivery status events from Resend and updates email_logs.
// Resend signs each webhook with HMAC-SHA256 using RESEND_WEBHOOK_SECRET.

import { NextResponse } from 'next/server'
import { getDb, schema } from '@/lib/db'
import { eq }           from 'drizzle-orm'
import crypto           from 'crypto'

export const runtime = 'nodejs'

// Resend event type → our email_status
const STATUS_MAP: Record<string, string> = {
  'email.sent':      'sent',
  'email.delivered': 'delivered',
  'email.bounced':   'bounced',
  'email.complained':'bounced',  // treat complaints as bounced
}

export async function POST(req: Request) {
  const rawBody  = await req.text()
  const secret   = process.env.RESEND_WEBHOOK_SECRET

  // Verify signature if secret is configured
  if (secret) {
    const sig  = req.headers.get('svix-signature') ?? ''
    const msgId = req.headers.get('svix-id') ?? ''
    const ts   = req.headers.get('svix-timestamp') ?? ''

    const toSign  = `${msgId}.${ts}.${rawBody}`
    const secrets = secret.startsWith('whsec_')
      ? [Buffer.from(secret.slice(6), 'base64')]
      : [Buffer.from(secret)]

    const valid = secrets.some((s) => {
      const computed = crypto.createHmac('sha256', s).update(toSign).digest('base64')
      return sig.split(' ').some((part) => part.split(',')[1] === computed)
    })

    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let event: { type: string; data: { email_id?: string } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const newStatus = STATUS_MAP[event.type]
  const resendId  = event.data?.email_id

  if (newStatus && resendId) {
    const db = getDb()
    if (db) {
      await db
        .update(schema.emailLogs)
        .set({ status: newStatus as any })
        .where(eq(schema.emailLogs.resendId, resendId))
    }
  }

  return NextResponse.json({ received: true })
}
