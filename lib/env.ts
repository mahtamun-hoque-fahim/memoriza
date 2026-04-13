// lib/env.ts — fail fast if required env vars are missing
const required = [
  'DATABASE_URL',
  'DATABASE_URL_UNPOOLED',
  'NEXTAUTH_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'NEXT_PUBLIC_BASE_URL',
  'CRON_SECRET',
]

export function validateEnv() {
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`)
  }
}
