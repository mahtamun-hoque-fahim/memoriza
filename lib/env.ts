// lib/env.ts
// Called at the top of any server-side file that needs these vars.
// Throws early so you get a clear error instead of a silent undefined.

const required = ['DATABASE_URL', 'DATABASE_URL_UNPOOLED'] as const

export function validateEnv() {
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`[env] Missing required environment variable: ${key}`)
    }
  }
}
