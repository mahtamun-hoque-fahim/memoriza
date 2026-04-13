// app/api/upload/route.ts — Cloudinary signed upload
// Returns a signed upload preset so the client can upload directly to Cloudinary.
// Phase 2 will wire this to the date form.
import { auth }         from '@/lib/auth'
import { NextResponse } from 'next/server'
import crypto           from 'crypto'

export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const timestamp = Math.floor(Date.now() / 1000)
  const folder    = `memoriza/${session.user.id}`
  const toSign    = `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`
  const signature = crypto.createHash('sha1').update(toSign).digest('hex')

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey:    process.env.CLOUDINARY_API_KEY,
  })
}
