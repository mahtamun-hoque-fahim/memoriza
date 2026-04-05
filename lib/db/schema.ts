// lib/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
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
    name:     varchar('name',     { length: 80 }).notNull(),
    emoji:    varchar('emoji',    { length: 8  }),
    timezone: varchar('timezone', { length: 64 }).notNull(),

    // The actual target moment (stored as UTC)
    eventDate: timestamp('event_date', { withTimezone: true }).notNull(),

    // Phase 3: optional Cloudinary CDN URL for cover image
    coverImage: varchar('cover_image', { length: 512 }),

    // Phase 3: creator email — used only to send the edit link, never displayed
    creatorEmail: varchar('creator_email', { length: 254 }),

    // Phase 3: edit/delete token (SHA-256 hex, 64 chars)
    // Sent to creator email. Anyone with the token can edit or delete.
    editToken: varchar('edit_token', { length: 64 }),

    // Phase 3: view counter — incremented on every page visit
    viewCount: integer('view_count').default(0).notNull(),

    // Rate-limiting: SHA-256 hash of creator IP + salt
    ipHash: varchar('ip_hash', { length: 64 }).notNull(),

    // Soft-delete (null = active)
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    // Housekeeping
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx:      index('idx_countdowns_slug').on(table.slug),
    ipHashIdx:    index('idx_countdowns_ip_hash').on(table.ipHash),
    eventDateIdx: index('idx_countdowns_event_date').on(table.eventDate),
    editTokenIdx: index('idx_countdowns_edit_token').on(table.editToken),
  })
)

// ── Drizzle inferred types ────────────────────────────────────────────────────
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type Countdown    = InferSelectModel<typeof countdowns>
export type NewCountdown = InferInsertModel<typeof countdowns>
