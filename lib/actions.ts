// lib/actions.ts — Server Actions for dates CRUD
'use server'

import { auth }             from '@/lib/auth'
import { getDb, schema }    from '@/lib/db'
import { eq, and }          from 'drizzle-orm'
import { generateSlug }     from '@/lib/utils'
import { revalidatePath }   from 'next/cache'
import { redirect }         from 'next/navigation'
import { z }                from 'zod'
import { sendEmail }        from '@/lib/resend'
import { confirmationEmail } from '@/components/emails/ReminderEmail'

// ── Validation schema ─────────────────────────────────────────────────────────

const DateSchema = z.object({
  title:          z.string().min(1).max(80),
  occasion:       z.enum(['anniversary','birthday','valentine','graduation','new_year','first_date','promotion','custom']),
  eventDate:      z.string().min(1),
  recurrence:     z.enum(['once','yearly']),
  recipientName:  z.string().max(80).optional(),
  recipientEmail: z.string().email().optional().or(z.literal('')),
  reminderDays:   z.coerce.number().int().refine((v) => [3,7,14].includes(v)),
  imageUrl:       z.string().url().optional().or(z.literal('')),
  imagePublicId:  z.string().optional().or(z.literal('')),
})

// ── createDate ────────────────────────────────────────────────────────────────

export async function createDate(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) return { error: 'Unauthenticated' }

  const raw = {
    title:          formData.get('title'),
    occasion:       formData.get('occasion'),
    eventDate:      formData.get('eventDate'),
    recurrence:     formData.get('recurrence'),
    recipientName:  formData.get('recipientName'),
    recipientEmail: formData.get('recipientEmail'),
    reminderDays:   formData.get('reminderDays'),
    imageUrl:       formData.get('imageUrl'),
    imagePublicId:  formData.get('imagePublicId'),
  }

  const parsed = DateSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Invalid data', issues: parsed.error.flatten() }

  const data = parsed.data
  const slug = generateSlug()
  const db   = getDb()
  if (!db) return { error: 'DB unavailable' }

  const [newDate] = await db.insert(schema.dates).values({
    userId:         session.user.id,
    slug,
    title:          data.title,
    occasion:       data.occasion,
    eventDate:      new Date(data.eventDate),
    recurrence:     data.recurrence,
    recipientName:  data.recipientName  || null,
    recipientEmail: data.recipientEmail || null,
    reminderDays:   data.reminderDays,
    imageUrl:       data.imageUrl       || null,
    imagePublicId:  data.imagePublicId  || null,
  }).returning()

  // ── Send confirmation email to owner (fire-and-forget, don't block redirect) ─
  try {
    const { subject, html } = confirmationEmail({
      title:         newDate.title,
      occasion:      newDate.occasion,
      eventDate:     new Date(newDate.eventDate),
      slug:          newDate.slug,
      recipientName: newDate.recipientName,
      recurrence:    newDate.recurrence,
    })

    const resendId = await sendEmail({ to: session.user.email, subject, html })

    await db.insert(schema.emailLogs).values({
      dateId:         newDate.id,
      recipientType:  'owner',
      recipientEmail: session.user.email,
      type:           'confirmation',
      resendId,
      status:         'sent',
    })
  } catch (err) {
    // Email failure shouldn't block the user — log and continue
    console.error('[createDate] confirmation email failed:', err)
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// ── updateDate ────────────────────────────────────────────────────────────────

export async function updateDate(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthenticated' }

  const raw = {
    title:          formData.get('title'),
    occasion:       formData.get('occasion'),
    eventDate:      formData.get('eventDate'),
    recurrence:     formData.get('recurrence'),
    recipientName:  formData.get('recipientName'),
    recipientEmail: formData.get('recipientEmail'),
    reminderDays:   formData.get('reminderDays'),
    imageUrl:       formData.get('imageUrl'),
    imagePublicId:  formData.get('imagePublicId'),
  }

  const parsed = DateSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Invalid data', issues: parsed.error.flatten() }

  const data = parsed.data
  const db   = getDb()
  if (!db) return { error: 'DB unavailable' }

  await db
    .update(schema.dates)
    .set({
      title:          data.title,
      occasion:       data.occasion,
      eventDate:      new Date(data.eventDate),
      recurrence:     data.recurrence,
      recipientName:  data.recipientName  || null,
      recipientEmail: data.recipientEmail || null,
      reminderDays:   data.reminderDays,
      imageUrl:       data.imageUrl       || null,
      imagePublicId:  data.imagePublicId  || null,
      updatedAt:      new Date(),
    })
    .where(and(eq(schema.dates.id, id), eq(schema.dates.userId, session.user.id)))

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// ── deleteDate ────────────────────────────────────────────────────────────────

export async function deleteDate(id: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthenticated' }

  const db = getDb()
  if (!db) return { error: 'DB unavailable' }

  await db
    .delete(schema.dates)
    .where(and(eq(schema.dates.id, id), eq(schema.dates.userId, session.user.id)))

  revalidatePath('/dashboard')
  return { ok: true }
}
