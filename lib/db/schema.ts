// lib/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
  index,
} from 'drizzle-orm/pg-core'

export const countdowns = pgTable(
  'countdowns',
  {
    // ── Identity ────────────────────────────────────────────────────────
    id:   uuid('id').primaryKey().defaultRandom(),

    // Public share slug — used in /c/[slug]
    // Phase 4: can be custom (e.g. "fahims-wedding") or auto-generated (10 chars)
    slug: varchar('slug', { length: 64 }).notNull().unique(),

    // Phase 4: custom slug chosen by user (null = auto-generated)
    customSlug: varchar('custom_slug', { length: 64 }).unique(),

    // ── Event details ───────────────────────────────────────────────────
    name:     varchar('name',     { length: 80 }).notNull(),
    emoji:    varchar('emoji',    { length: 8  }),
    timezone: varchar('timezone', { length: 64 }).notNull(),
    eventDate: timestamp('event_date', { withTimezone: true }).notNull(),

    // Phase 3: Cloudinary CDN URL
    coverImage: varchar('cover_image', { length: 512 }),

    // ── Auth ────────────────────────────────────────────────────────────
    // Phase 4: Clerk user ID (null = anonymous / IP-based)
    userId: varchar('user_id', { length: 64 }),

    // Phase 3: creator email + edit token (kept for anonymous users)
    creatorEmail: varchar('creator_email', { length: 254 }),
    editToken:    varchar('edit_token',    { length: 64  }),

    // ── Reminders ───────────────────────────────────────────────────────
    // Phase 4: whether to send reminder emails
    remindersEnabled: boolean('reminders_enabled').default(false).notNull(),
    // Track which reminders have been sent (comma-separated: "7d,1d,day")
    remindersSent: varchar('reminders_sent', { length: 32 }).default('').notNull(),

    // ── Stats ───────────────────────────────────────────────────────────
    viewCount: integer('view_count').default(0).notNull(),

    // ── Rate limiting ───────────────────────────────────────────────────
    // Hash of creator IP — used for anon rate limiting only
    ipHash: varchar('ip_hash', { length: 64 }).notNull(),

    // ── Housekeeping ────────────────────────────────────────────────────
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx:        index('idx_countdowns_slug').on(table.slug),
    customSlugIdx:  index('idx_countdowns_custom_slug').on(table.customSlug),
    userIdIdx:      index('idx_countdowns_user_id').on(table.userId),
    ipHashIdx:      index('idx_countdowns_ip_hash').on(table.ipHash),
    eventDateIdx:   index('idx_countdowns_event_date').on(table.eventDate),
    editTokenIdx:   index('idx_countdowns_edit_token').on(table.editToken),
  })
)

// ── Drizzle inferred types ────────────────────────────────────────────────────
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type Countdown    = InferSelectModel<typeof countdowns>
export type NewCountdown = InferInsertModel<typeof countdowns>
