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
  pgEnum,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

// ── Enums ─────────────────────────────────────────────────────────────────────

export const occasionEnum = pgEnum('occasion', [
  'anniversary',
  'birthday',
  'valentine',
  'graduation',
  'new_year',
  'first_date',
  'promotion',
  'custom',
])

export const recurrenceEnum = pgEnum('recurrence', ['once', 'yearly'])

export const emailTypeEnum = pgEnum('email_type', [
  'confirmation',
  'reminder',
  'day_of',
])

export const emailStatusEnum = pgEnum('email_status', [
  'queued',
  'sent',
  'delivered',
  'bounced',
  'failed',
])

export const recipientTypeEnum = pgEnum('recipient_type', ['owner', 'recipient'])

// ── Auth.js required tables ───────────────────────────────────────────────────
// These match exactly what @auth/drizzle-adapter expects.

export const users = pgTable('users', {
  id:            text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:          text('name'),
  email:         text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image:         text('image'),
  role:          text('role').notNull().default('user'), // 'user' | 'admin'
  createdAt:     timestamp('created_at').defaultNow().notNull(),
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

// ── dates ─────────────────────────────────────────────────────────────────────

export const dates = pgTable('dates', {
  id:     uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),

  // Public share key
  slug: varchar('slug', { length: 16 }).notNull().unique(),

  // Event details
  title:     varchar('title',     { length: 80  }).notNull(),
  occasion:  occasionEnum('occasion').notNull().default('custom'),
  eventDate: timestamp('event_date', { withTimezone: true }).notNull(),
  recurrence: recurrenceEnum('recurrence').notNull().default('yearly'),

  // Recipient
  recipientName:  varchar('recipient_name',  { length: 80  }),
  recipientEmail: varchar('recipient_email', { length: 254 }),

  // Reminder config
  reminderDays: integer('reminder_days').notNull().default(7), // 3 | 7 | 14

  // Media
  imageUrl:      varchar('image_url',       { length: 512 }),
  imagePublicId: varchar('image_public_id', { length: 256 }),

  // Status
  isActive: boolean('is_active').notNull().default(true),

  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdx:    index('idx_dates_user_id').on(t.userId),
  slugIdx:    index('idx_dates_slug').on(t.slug),
  dateIdx:    index('idx_dates_event_date').on(t.eventDate),
}))

// ── email_logs ────────────────────────────────────────────────────────────────

export const emailLogs = pgTable('email_logs', {
  id:             uuid('id').primaryKey().defaultRandom(),
  dateId:         uuid('date_id').notNull().references(() => dates.id, { onDelete: 'cascade' }),
  recipientType:  recipientTypeEnum('recipient_type').notNull(),
  recipientEmail: varchar('recipient_email', { length: 254 }).notNull(),
  type:           emailTypeEnum('type').notNull(),
  resendId:       varchar('resend_id', { length: 64 }),
  status:         emailStatusEnum('status').notNull().default('queued'),
  sentAt:         timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  dateIdx: index('idx_email_logs_date_id').on(t.dateId),
}))

// ── Inferred types ────────────────────────────────────────────────────────────

export type User      = InferSelectModel<typeof users>
export type Date_     = InferSelectModel<typeof dates>
export type NewDate_  = InferInsertModel<typeof dates>
export type EmailLog  = InferSelectModel<typeof emailLogs>
