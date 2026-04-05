// lib/validations.ts
import { z } from 'zod'

// ── Create ────────────────────────────────────────────────────────────────────
export const createCountdownSchema = z.object({
  name: z
    .string()
    .min(1, 'Event name is required')
    .max(80, 'Event name must be 80 characters or less')
    .trim(),

  emoji: z.string().max(8).optional().nullable(),

  eventDate: z
    .string()
    .min(1, 'Event date is required')
    .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid date')
    .refine((v) => new Date(v).getTime() > Date.now(), 'Event date must be in the future'),

  timezone: z.string().min(1).max(64),

  // Phase 3 additions
  creatorEmail: z
    .string()
    .email('Invalid email address')
    .max(254)
    .optional()
    .nullable(),

  coverImage: z.string().url().max(512).optional().nullable(),
})

export type CreateCountdownInput = z.infer<typeof createCountdownSchema>

// ── Edit ──────────────────────────────────────────────────────────────────────
export const editCountdownSchema = z.object({
  token: z.string().length(64, 'Invalid edit token'),

  name: z
    .string()
    .min(1, 'Event name is required')
    .max(80)
    .trim(),

  emoji:    z.string().max(8).optional().nullable(),
  timezone: z.string().min(1).max(64),

  eventDate: z
    .string()
    .min(1, 'Event date is required')
    .refine((v) => !isNaN(new Date(v).getTime()), 'Invalid date')
    .refine((v) => new Date(v).getTime() > Date.now(), 'Event date must be in the future'),

  coverImage: z.string().url().max(512).optional().nullable(),
})

export type EditCountdownInput = z.infer<typeof editCountdownSchema>

// ── Delete ────────────────────────────────────────────────────────────────────
export const deleteCountdownSchema = z.object({
  token: z.string().length(64, 'Invalid edit token'),
})
