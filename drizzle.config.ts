import { defineConfig } from 'drizzle-kit'
import * as dotenv from 'dotenv'

// drizzle-kit doesn't load .env.local automatically — load it manually
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

export default defineConfig({
  schema:  './lib/db/schema.ts',
  out:     './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
})
