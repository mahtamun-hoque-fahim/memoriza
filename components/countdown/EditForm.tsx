'use client'
// components/countdown/EditForm.tsx
// Phase 4: supports isAuthed mode (uses /api/dashboard/[slug]) and
//          token mode (uses /api/countdown/[slug]/edit)

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import { COMMON_TIMEZONES, toDatetimeLocalString } from '@/lib/utils'
import { CoverImageUploader }      from './CoverImageUploader'

const EMOJI_OPTIONS = ['🎂','🎉','🚀','💍','🎓','🏖️','🎄','💼','🎮','❤️','🌟','🎯']

interface Props {
  slug:              string
  token:             string     // empty string when isAuthed = true
  isAuthed:          boolean    // true = auth user, use /api/dashboard route
  initialName:       string
  initialEmoji:      string
  initialDate:       string     // ISO UTC
  initialTimezone:   string
  initialCoverImage: string | null
  initialCustomSlug: string
  initialReminders:  boolean
}

export function EditForm({
  slug, token, isAuthed,
  initialName, initialEmoji, initialDate, initialTimezone,
  initialCoverImage, initialCustomSlug, initialReminders,
}: Props) {
  const router = useRouter()
  const [savePending,   startSave]   = useTransition()
  const [deletePending, startDelete] = useTransition()

  const [name,         setName]        = useState(initialName)
  const [emoji,        setEmoji]       = useState(initialEmoji)
  const [timezone,     setTimezone]    = useState(initialTimezone)
  const [coverImage,   setCoverImage]  = useState<string | null>(initialCoverImage)
  const [customSlug,   setCustomSlug]  = useState(initialCustomSlug)
  const [reminders,    setReminders]   = useState(initialReminders)
  const [charLeft,     setCharLeft]    = useState(80 - initialName.length)
  const [date,         setDate]        = useState(
    () => toDatetimeLocalString(new Date(initialDate), initialTimezone)
  )
  const [error,              setError]              = useState<string | null>(null)
  const [showDeleteConfirm,  setShowDeleteConfirm]  = useState(false)

  const minDate = new Date(Date.now() + 60_000).toISOString().slice(0, 16)

  const inputStyle: React.CSSProperties = {
    width: '100%', backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: '12px',
    padding: '12px 16px', color: 'var(--text)', fontSize: '14px',
    outline: 'none', transition: 'border-color 0.15s',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px',
    fontFamily: 'var(--font-jetbrains-mono)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '8px',
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startSave(async () => {
      try {
        const endpoint = isAuthed
          ? `/api/dashboard/${slug}`
          : `/api/countdown/${slug}/edit`

        const body = isAuthed
          ? { name, emoji: emoji || null, eventDate: date, timezone, coverImage, customSlug: customSlug || null, remindersEnabled: reminders }
          : { token, name, emoji: emoji || null, eventDate: date, timezone, coverImage, remindersEnabled: reminders }

        const res  = await fetch(endpoint, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Save failed'); return }

        // If slug changed (custom slug set), redirect to new URL
        const newSlug = data.slug ?? slug
        router.push(`/c/${newSlug}?updated=1`)
      } catch {
        setError('Network error. Please try again.')
      }
    })
  }

  async function handleDelete() {
    startDelete(async () => {
      try {
        const endpoint = isAuthed
          ? `/api/dashboard/${slug}`
          : `/api/countdown/${slug}/delete`

        const res = await fetch(endpoint, {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body:    isAuthed ? undefined : JSON.stringify({ token }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Delete failed'); return }
        router.push(isAuthed ? '/dashboard?deleted=1' : '/?deleted=1')
      } catch {
        setError('Network error. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Emoji */}
      <div>
        <span style={labelStyle}>Emoji</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {EMOJI_OPTIONS.map((e) => (
            <button key={e} type="button" onClick={() => setEmoji(emoji === e ? '' : e)}
              style={{
                fontSize: '20px', width: '38px', height: '38px', borderRadius: '10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${emoji === e ? 'var(--accent)' : 'var(--border)'}`,
                backgroundColor: emoji === e ? 'rgba(108,99,255,0.12)' : 'var(--bg)',
                transition: 'all 0.15s',
              }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={labelStyle}>Event name *</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-jetbrains-mono)', color: charLeft < 10 ? '#F87171' : 'var(--muted)' }}>{charLeft}</span>
        </div>
        <input type="text" value={name} required maxLength={80}
          onChange={(e) => { setName(e.target.value.slice(0, 80)); setCharLeft(80 - e.target.value.length) }}
          style={inputStyle} />
      </div>

      {/* Cover image */}
      <CoverImageUploader value={coverImage} onChange={setCoverImage} />

      {/* Date */}
      <div>
        <span style={labelStyle}>Date & time *</span>
        <input type="datetime-local" value={date} min={minDate} required
          onChange={(e) => setDate(e.target.value)}
          style={{ ...inputStyle, colorScheme: 'dark' }} />
      </div>

      {/* Timezone */}
      <div>
        <span style={labelStyle}>Timezone *</span>
        <select value={timezone} required onChange={(e) => setTimezone(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}>
          {!COMMON_TIMEZONES.find((tz) => tz.value === timezone) && (
            <option value={timezone}>{timezone}</option>
          )}
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      {/* Custom slug — auth users only */}
      {isAuthed && (
        <div>
          <span style={labelStyle}>Custom slug (optional)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
            <span style={{ padding: '12px 12px', color: 'var(--muted)', fontSize: '13px', fontFamily: 'var(--font-jetbrains-mono)', borderRight: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
              /c/
            </span>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 64))}
              placeholder="my-event"
              style={{ ...inputStyle, border: 'none', borderRadius: 0, flex: 1 }}
            />
          </div>
          <p style={{ marginTop: '5px', fontSize: '11px', color: 'var(--muted)' }}>
            Lowercase letters, numbers, and hyphens only.
          </p>
        </div>
      )}

      {/* Reminders */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
        <div style={{ position: 'relative', width: '36px', height: '20px', flexShrink: 0 }}>
          <input type="checkbox" checked={reminders} onChange={(e) => setReminders(e.target.checked)}
            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', margin: 0 }} />
          <div style={{
            width: '36px', height: '20px', borderRadius: '10px', transition: 'background 0.2s',
            backgroundColor: reminders ? 'var(--accent)' : 'var(--border)',
          }} />
          <div style={{
            position: 'absolute', top: '2px', left: reminders ? '18px' : '2px',
            width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff',
            transition: 'left 0.2s', pointerEvents: 'none',
          }} />
        </div>
        <div>
          <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>Email reminders</span>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
            Get notified 7 days, 1 day, and on the day of the event.
          </p>
        </div>
      </label>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 16px' }}>
          <p style={{ color: '#F87171', fontSize: '13px' }}>{error}</p>
        </div>
      )}

      {/* Save */}
      <button type="submit" disabled={savePending || !name || !date}
        style={{
          width: '100%', padding: '14px',
          backgroundColor: 'var(--accent)', color: '#fff',
          fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '15px',
          borderRadius: '12px', border: 'none',
          cursor: savePending || !name || !date ? 'not-allowed' : 'pointer',
          opacity: savePending || !name || !date ? 0.4 : 1,
          transition: 'all 0.2s',
        }}>
        {savePending ? 'Saving…' : '✓ Save changes'}
      </button>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '4px 0' }} />

      {/* Delete */}
      {!showDeleteConfirm ? (
        <button type="button" onClick={() => setShowDeleteConfirm(true)}
          style={{
            width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#F87171',
            fontFamily: 'var(--font-mono)', fontSize: '13px',
            border: '1px solid rgba(248,113,113,0.25)', borderRadius: '12px',
            cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em',
          }}>
          Delete this countdown
        </button>
      ) : (
        <div style={{ border: '1px solid rgba(248,113,113,0.3)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text)', textAlign: 'center', lineHeight: 1.5 }}>
            Are you sure? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={() => setShowDeleteConfirm(false)}
              style={{ flex: 1, padding: '10px', backgroundColor: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>
              Cancel
            </button>
            <button type="button" onClick={handleDelete} disabled={deletePending}
              style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              {deletePending ? 'Deleting…' : 'Yes, delete'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
