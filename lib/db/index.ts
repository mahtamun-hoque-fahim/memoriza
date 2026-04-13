// lib/db/index.ts — Edge-compatible Neon driver (works on Vercel & Cloudflare)
import { neon }     from '@neondatabase/serverless'
import { drizzle }  from 'drizzle-orm/neon-http'
import * as schema  from './schema'

export { schema }

export function getDb() {
  if (!process.env.DATABASE_URL) return null as any
  return drizzle(neon(process.env.DATABASE_URL), { schema })
}
