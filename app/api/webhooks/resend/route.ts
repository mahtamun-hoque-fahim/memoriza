// app/api/webhooks/resend/route.ts
// Receives delivery status events from Resend and updates email_logs.
// Phase 3 will implement full signature verification + status updates.
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  // TODO Phase 3: verify Resend webhook signature, parse event,
  // update email_logs.status where resend_id matches.
  return NextResponse.json({ received: true })
}
