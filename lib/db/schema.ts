// lib/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  smallint,
  index,
} from 'drizzle-orm/pg-core'

export const countdowns = pgTable(
  'countdowns',
  {
    // Primary key
    id: uuid('id').primaryKey().defaultRandom(),

    // Public identifier — used in shareable URLs (/c/[slug])
    slug: varchar('slug', { length: 16 }).notNull().unique(),

    // Event details
    name:     varchar('name',     { length: 80  }).notNull(),
    emoji:    varchar('emoji',    { length: 8   }),          // optional leading emoji
    timezone: varchar('timezone', { length: 64  }).notNull(), // IANA timezone string

    // The actual target moment (stored as UTC)
    eventDate: timestamp('event_date', { withTimezone: true }).notNull(),

    // Rate-limiting: hash of creator's IP — max 10 active countdowns per IP
    // We store a hash, never the raw IP.
    ipHash: varchar('ip_hash', { length: 64 }).notNull(),

    // Soft-delete for cleanup jobs (null = active)
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    // Housekeeping
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx:    index('idx_countdowns_slug').on(table.slug),
    ipHashIdx:  index('idx_countdowns_ip_hash').on(table.ipHash),
    eventDateIdx: index('idx_countdowns_event_date').on(table.eventDate),
  })
)

// ── Drizzle inferred types ────────────────────────────────────────────────────
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type Countdown    = InferSelectModel<typeof countdowns>
export type NewCountdown = InferInsertModel<typeof countdowns>
