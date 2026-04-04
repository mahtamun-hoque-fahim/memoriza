// lib/validations.ts
import { z } from 'zod'

export const createCountdownSchema = z.object({
  name: z
    .string()
    .min(1, 'Event name is required')
    .max(80, 'Event name must be 80 characters or less')
    .trim(),

  emoji: z
    .string()
    .max(8, 'Emoji too long')
    .optional()
    .nullable(),

  // ISO 8601 string from datetime-local input
  eventDate: z
    .string()
    .min(1, 'Event date is required')
    .refine((val) => {
      const d = new Date(val)
      return !isNaN(d.getTime())
    }, 'Invalid date format')
    .refine((val) => {
      return new Date(val).getTime() > Date.now()
    }, 'Event date must be in the future'),

  timezone: z
    .string()
    .min(1, 'Timezone is required')
    .max(64, 'Invalid timezone'),
})

export type CreateCountdownInput = z.infer<typeof createCountdownSchema>
