// app/api/upload/route.ts
// Receives a file via multipart form data, uploads to Cloudinary, returns the CDN URL.
// Cloudinary credentials required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

import { NextRequest, NextResponse } from 'next/server'
import { createHash }                from 'crypto'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Image upload is not configured' },
      { status: 503 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 5 MB.' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF.' },
      { status: 400 }
    )
  }

  // Build signed Cloudinary upload request
  const timestamp = Math.floor(Date.now() / 1000)
  const folder    = 'memoriza/covers'
  const params    = `folder=${folder}&timestamp=${timestamp}`
  const signature = createHash('sha1')
    .update(params + apiSecret)
    .digest('hex')

  const uploadForm = new FormData()
  uploadForm.append('file',      file)
  uploadForm.append('folder',    folder)
  uploadForm.append('timestamp', String(timestamp))
  uploadForm.append('api_key',   apiKey)
  uploadForm.append('signature', signature)
  // Auto-optimize: strip exif, serve WebP where supported
  uploadForm.append('quality',   'auto')
  uploadForm.append('fetch_format', 'auto')

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadForm }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[upload] Cloudinary error:', err)
      return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
    }

    const data = await res.json() as { secure_url: string; public_id: string }
    return NextResponse.json({ url: data.secure_url, publicId: data.public_id })
  } catch (err) {
    console.error('[upload] Network error:', err)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
