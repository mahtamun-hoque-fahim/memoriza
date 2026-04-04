import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema:  './lib/db/schema.ts',
  out:     './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Always use the UNPOOLED direct connection for migrations
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
})
