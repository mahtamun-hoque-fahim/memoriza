// lib/admin-actions.ts — Server Actions for admin user management
'use server'

import { auth }          from '@/lib/auth'
import { getDb, schema } from '@/lib/db'
import { eq }            from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const session = await auth()
  if (session?.user?.role !== 'admin') throw new Error('Forbidden')
  return session
}

// ── setUserRole ───────────────────────────────────────────────────────────────

export async function setUserRole(userId: string, role: 'user' | 'admin') {
  await assertAdmin()
  const db = getDb()
  if (!db) return { error: 'DB unavailable' }

  await db.update(schema.users).set({ role }).where(eq(schema.users.id, userId))
  revalidatePath('/admin/users')
  return { ok: true }
}

// ── deleteUserDates ───────────────────────────────────────────────────────────

export async function deleteUserDates(userId: string) {
  await assertAdmin()
  const db = getDb()
  if (!db) return { error: 'DB unavailable' }

  await db.delete(schema.dates).where(eq(schema.dates.userId, userId))
  revalidatePath('/admin/users')
  revalidatePath('/admin/dates')
  return { ok: true }
}

// ── deleteDate (admin) ────────────────────────────────────────────────────────

export async function adminDeleteDate(dateId: string) {
  await assertAdmin()
  const db = getDb()
  if (!db) return { error: 'DB unavailable' }

  await db.delete(schema.dates).where(eq(schema.dates.id, dateId))
  revalidatePath('/admin/dates')
  return { ok: true }
}

// ── toggleDateActive ──────────────────────────────────────────────────────────

export async function toggleDateActive(dateId: string, isActive: boolean) {
  await assertAdmin()
  const db = getDb()
  if (!db) return { error: 'DB unavailable' }

  await db.update(schema.dates).set({ isActive }).where(eq(schema.dates.id, dateId))
  revalidatePath('/admin/dates')
  return { ok: true }
}
