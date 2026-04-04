// lib/db/index.ts
// Edge-compatible driver (works on Vercel Edge & Cloudflare Pages).
// For Node.js-only routes that need connection pooling, use lib/db/node.ts instead.

import { neon }   from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export function getDb() {
  if (!process.env.DATABASE_URL) {
    // Build-time stub — avoids crashing during `next build`
    return null as unknown as ReturnType<typeof buildDb>
  }
  return buildDb()
}

function buildDb() {
  const sql = neon(process.env.DATABASE_URL!)
  return drizzle(sql, { schema })
}

export type Db = ReturnType<typeof buildDb>
export { schema }
