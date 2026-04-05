// lib/validations.ts
import { z } from 'zod'

// ── Shared helpers ────────────────────────────────────────────────────────────
const futureDate = z
  .string()
  .min(1, 'Event date is required')
  .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid date format')
  .refine((v) => new Date(v).getTime() > Date.now(), 'Event date must be in the future')

// Custom slug: lowercase letters, numbers, hyphens only, 3-64 chars
const customSlugSchema = z
  .string()
  .min(3, 'Custom slug must be at least 3 characters')
  .max(64, 'Custom slug must be 64 characters or less')
  .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')
  .optional()
  .nullable()

// ── Create ────────────────────────────────────────────────────────────────────
export const createCountdownSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(80).trim(),
  emoji:           z.string().max(8).optional().nullable(),
  eventDate:       futureDate,
  timezone:        z.string().min(1).max(64),
  creatorEmail:    z.string().email('Invalid email').max(254).optional().nullable(),
  coverImage:      z.string().url().max(512).optional().nullable(),
  customSlug:      customSlugSchema,
  remindersEnabled: z.boolean().optional().nullable(),
})

export type CreateCountdownInput = z.infer<typeof createCountdownSchema>

// ── Edit ──────────────────────────────────────────────────────────────────────
export const editCountdownSchema = z.object({
  token:       z.string().length(64, 'Invalid edit token'),
  name:        z.string().min(1, 'Event name is required').max(80).trim(),
  emoji:       z.string().max(8).optional().nullable(),
  timezone:    z.string().min(1).max(64),
  eventDate:   futureDate,
  coverImage:  z.string().url().max(512).optional().nullable(),
  remindersEnabled: z.boolean().optional().nullable(),
})

export type EditCountdownInput = z.infer<typeof editCountdownSchema>

// ── Delete ────────────────────────────────────────────────────────────────────
export const deleteCountdownSchema = z.object({
  token: z.string().length(64, 'Invalid edit token'),
})

// ── Dashboard update (auth users — no token needed) ───────────────────────────
export const dashboardEditSchema = z.object({
  name:        z.string().min(1, 'Event name is required').max(80).trim(),
  emoji:       z.string().max(8).optional().nullable(),
  timezone:    z.string().min(1).max(64),
  eventDate:   futureDate,
  coverImage:  z.string().url().max(512).optional().nullable(),
  customSlug:  customSlugSchema,
  remindersEnabled: z.boolean().optional().nullable(),
})

export type DashboardEditInput = z.infer<typeof dashboardEditSchema>
