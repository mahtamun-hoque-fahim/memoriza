'use client'
// components/countdown/CreateForm.tsx — Phase 3: adds email + cover image

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import { createCountdownSchema }   from '@/lib/validations'
import { COMMON_TIMEZONES }        from '@/lib/utils'
import { CoverImageUploader }      from './CoverImageUploader'

const EMOJI_OPTIONS = ['🎂','🎉','🚀','💍','🎓','🏖️','🎄','💼','🎮','❤️','🌟','🎯']

export function CreateForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [name,         setName]         = useState('')
  const [emoji,        setEmoji]        = useState('')
  const [date,         setDate]         = useState('')
  const [timezone,     setTimezone]     = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
  )
  const [email,        setEmail]        = useState('')
  const [coverImage,   setCoverImage]   = useState<string | null>(null)
  const [error,        setError]        = useState<string | null>(null)
  const [charLeft,     setCharLeft]     = useState(80)

  const minDate = new Date(Date.now() + 60_000).toISOString().slice(0, 16)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.slice(0, 80)
    setName(val)
    setCharLeft(80 - val.length)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const result = createCountdownSchema.safeParse({
      name, emoji: emoji || null, eventDate: date, timezone,
      creatorEmail: email || null, coverImage: coverImage || null,
    })
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? 'Please check your inputs')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/create', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            name, emoji: emoji || null, eventDate: date, timezone,
            creatorEmail: email || null, coverImage: coverImage || null,
          }),
        })

        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return }
        router.push(`/c/${data.slug}?new=1`)
      } catch {
        setError('Network error. Please check your connection and try again.')
      }
    })
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontFamily: 'var(--font-jetbrains-mono)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: 'var(--muted)',
    marginBottom: '8px',
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Emoji picker */}
      <div>
        <span style={labelStyle}>Pick an emoji (optional)</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e} type="button"
              onClick={() => setEmoji(emoji === e ? '' : e)}
              style={{
                fontSize: '22px', width: '40px', height: '40px',
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${emoji === e ? 'var(--accent)' : 'var(--border)'}`,
                backgroundColor: emoji === e ? 'rgba(108,99,255,0.12)' : 'var(--surface)',
                transform: emoji === e ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.15s', cursor: 'pointer',
              }}
              aria-label={`Select ${e}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Event name */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={labelStyle}>Event name *</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-jetbrains-mono)', color: charLeft < 10 ? '#F87171' : 'var(--muted)' }}>
            {charLeft}
          </span>
        </div>
        <input
          type="text" value={name} onChange={handleNameChange}
          placeholder="My Birthday 🎂" required maxLength={80}
          style={inputStyle}
        />
      </div>

      {/* Cover image */}
      <CoverImageUploader value={coverImage} onChange={setCoverImage} />

      {/* Date & time */}
      <div>
        <label style={labelStyle} htmlFor="date">Date & time *</label>
        <input
          id="date" type="datetime-local" value={date} min={minDate}
          onChange={(e) => setDate(e.target.value)} required
          style={{ ...inputStyle, colorScheme: 'dark' }}
        />
      </div>

      {/* Timezone */}
      <div>
        <label style={labelStyle} htmlFor="timezone">Timezone *</label>
        <select
          id="timezone" value={timezone}
          onChange={(e) => setTimezone(e.target.value)} required
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          {!COMMON_TIMEZONES.find((tz) => tz.value === timezone) && (
            <option value={timezone}>{timezone} (detected)</option>
          )}
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      {/* Email — optional, for edit link */}
      <div>
        <label style={labelStyle} htmlFor="email">
          Your email <span style={{ opacity: 0.5, textTransform: 'none', letterSpacing: 0 }}>— optional, to get an edit link</span>
        </label>
        <input
          id="email" type="email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={inputStyle}
        />
        {email && (
          <p style={{ marginTop: '6px', fontSize: '11px', color: 'var(--muted)' }}>
            We'll send a private link to edit or delete this countdown. We don't store your email anywhere else.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 16px' }}>
          <p style={{ color: '#F87171', fontSize: '13px', lineHeight: 1.6 }}>{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit" disabled={pending || !name || !date}
        className="animate-pulse-glow"
        style={{
          width: '100%', padding: '16px',
          backgroundColor: 'var(--accent)',
          color: '#fff',
          fontFamily: 'var(--font-syne)',
          fontWeight: 600, fontSize: '15px',
          borderRadius: '12px', border: 'none',
          cursor: pending || !name || !date ? 'not-allowed' : 'pointer',
          opacity: pending || !name || !date ? 0.4 : 1,
          transition: 'all 0.2s',
        }}
      >
        {pending ? 'Creating…' : '→ Create countdown'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-jetbrains-mono)' }}>
        Free · No account needed · Up to 10 countdowns per device
      </p>
    </form>
  )
}
