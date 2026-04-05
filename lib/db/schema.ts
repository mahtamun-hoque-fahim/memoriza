// lib/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
  text,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

// ── Auth.js required tables ───────────────────────────────────────────────────
// These match exactly what @auth/drizzle-adapter expects.

export const users = pgTable('users', {
  id:            text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:          text('name'),
  email:         text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image:         text('image'),
})

export const accounts = pgTable('accounts', {
  userId:            text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:              text('type').$type<AdapterAccountType>().notNull(),
  provider:          text('provider').notNull(),
  providerAccountId: text('provider_account_id').notNull(),
  refresh_token:     text('refresh_token'),
  access_token:      text('access_token'),
  expires_at:        integer('expires_at'),
  token_type:        text('token_type'),
  scope:             text('scope'),
  id_token:          text('id_token'),
  session_state:     text('session_state'),
}, (t) => ({
  pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
}))

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId:       text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires:      timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token:      text('token').notNull(),
  expires:    timestamp('expires', { mode: 'date' }).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.identifier, t.token] }),
}))

// ── App table ─────────────────────────────────────────────────────────────────
export const countdowns = pgTable(
  'countdowns',
  {
    id:   uuid('id').primaryKey().defaultRandom(),

    // Share slug — auto-generated (10 chars) or custom set by auth user
    slug:       varchar('slug',        { length: 64 }).notNull().unique(),
    customSlug: varchar('custom_slug', { length: 64 }).unique(),

    // Event details
    name:      varchar('name',     { length: 80 }).notNull(),
    emoji:     varchar('emoji',    { length: 8  }),
    timezone:  varchar('timezone', { length: 64 }).notNull(),
    eventDate: timestamp('event_date', { withTimezone: true }).notNull(),

    // Cover image (Cloudinary CDN URL)
    coverImage: varchar('cover_image', { length: 512 }),

    // Auth — references users.id (null = anonymous)
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),

    // Anonymous edit token + creator email
    creatorEmail: varchar('creator_email', { length: 254 }),
    editToken:    varchar('edit_token',    { length: 64  }),

    // Reminders
    remindersEnabled: boolean('reminders_enabled').default(false).notNull(),
    remindersSent:    varchar('reminders_sent', { length: 32 }).default('').notNull(),

    // Stats
    viewCount: integer('view_count').default(0).notNull(),

    // Rate limiting (anon only)
    ipHash: varchar('ip_hash', { length: 64 }).notNull(),

    // Housekeeping
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugIdx:       index('idx_countdowns_slug').on(t.slug),
    customSlugIdx: index('idx_countdowns_custom_slug').on(t.customSlug),
    userIdIdx:     index('idx_countdowns_user_id').on(t.userId),
    ipHashIdx:     index('idx_countdowns_ip_hash').on(t.ipHash),
    eventDateIdx:  index('idx_countdowns_event_date').on(t.eventDate),
    editTokenIdx:  index('idx_countdowns_edit_token').on(t.editToken),
  })
)

// ── Drizzle inferred types ────────────────────────────────────────────────────
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type User         = InferSelectModel<typeof users>
export type Countdown    = InferSelectModel<typeof countdowns>
export type NewCountdown = InferInsertModel<typeof countdowns>
