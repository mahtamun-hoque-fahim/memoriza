// lib/db/index.ts — Edge-compatible Neon driver (works on Vercel & Cloudflare)
import { neon }    from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export { schema }

type Db = ReturnType<typeof drizzle<typeof schema>>

let _db: Db | null = null

export function getDb(): Db | null {
  if (!process.env.DATABASE_URL) return null
  if (!_db) _db = drizzle(neon(process.env.DATABASE_URL), { schema })
  return _db
}
