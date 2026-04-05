'use client'
// components/countdown/EditForm.tsx

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import { COMMON_TIMEZONES, toDatetimeLocalString } from '@/lib/utils'
import { CoverImageUploader }      from './CoverImageUploader'

const EMOJI_OPTIONS = ['🎂','🎉','🚀','💍','🎓','🏖️','🎄','💼','🎮','❤️','🌟','🎯']

interface Props {
  slug:              string
  token:             string
  initialName:       string
  initialEmoji:      string
  initialDate:       string  // ISO UTC string
  initialTimezone:   string
  initialCoverImage: string | null
}

export function EditForm({
  slug, token, initialName, initialEmoji,
  initialDate, initialTimezone, initialCoverImage,
}: Props) {
  const router = useRouter()
  const [savePending,   startSave]   = useTransition()
  const [deletePending, startDelete] = useTransition()

  const [name,       setName]       = useState(initialName)
  const [emoji,      setEmoji]      = useState(initialEmoji)
  const [timezone,   setTimezone]   = useState(initialTimezone)
  const [coverImage, setCoverImage] = useState<string | null>(initialCoverImage)
  const [charLeft,   setCharLeft]   = useState(80 - initialName.length)

  // Convert stored UTC date back to the creator's timezone for the input
  const [date, setDate] = useState(
    () => toDatetimeLocalString(new Date(initialDate), initialTimezone)
  )

  const [error,        setError]       = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const minDate = new Date(Date.now() + 60_000).toISOString().slice(0, 16)

  const inputStyle = {
    width: '100%', backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: '12px',
    padding: '12px 16px', color: 'var(--text)', fontSize: '14px',
    outline: 'none', transition: 'border-color 0.15s',
  }
  const labelStyle = {
    display: 'block', fontSize: '11px',
    fontFamily: 'var(--font-jetbrains-mono)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '8px',
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startSave(async () => {
      try {
        const res = await fetch(`/api/countdown/${slug}/edit`, {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ token, name, emoji: emoji || null, eventDate: date, timezone, coverImage }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Save failed'); return }
        router.push(`/c/${slug}?updated=1`)
      } catch {
        setError('Network error. Please try again.')
      }
    })
  }

  async function handleDelete() {
    startDelete(async () => {
      try {
        const res = await fetch(`/api/countdown/${slug}/delete`, {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ token }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Delete failed'); return }
        router.push('/?deleted=1')
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
                fontSize: '20px', width: '38px', height: '38px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
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
        <label style={labelStyle}>Date & time *</label>
        <input type="datetime-local" value={date} min={minDate} required
          onChange={(e) => setDate(e.target.value)}
          style={{ ...inputStyle, colorScheme: 'dark' }} />
      </div>

      {/* Timezone */}
      <div>
        <label style={labelStyle}>Timezone *</label>
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
            width: '100%', padding: '12px',
            backgroundColor: 'transparent', color: '#F87171',
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
