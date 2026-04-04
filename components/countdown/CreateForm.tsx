'use client'
// components/countdown/CreateForm.tsx

import { useState, useTransition, useRef } from 'react'
import { useRouter }                        from 'next/navigation'
import { createCountdownSchema }            from '@/lib/validations'
import { COMMON_TIMEZONES }                 from '@/lib/utils'

const EMOJI_OPTIONS = ['🎂', '🎉', '🚀', '💍', '🎓', '🏖️', '🎄', '💼', '🎮', '❤️', '🌟', '🎯']

export function CreateForm() {
  const router      = useRouter()
  const [pending, startTransition] = useTransition()

  const [name,     setName]     = useState('')
  const [emoji,    setEmoji]    = useState('')
  const [date,     setDate]     = useState('')
  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
  )
  const [error,    setError]    = useState<string | null>(null)
  const [charLeft, setCharLeft] = useState(80)

  // Minimum datetime for the picker — now + 1 minute
  const minDate = new Date(Date.now() + 60_000)
    .toISOString()
    .slice(0, 16)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.slice(0, 80)
    setName(val)
    setCharLeft(80 - val.length)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Client-side validation first
    const result = createCountdownSchema.safeParse({ name, emoji: emoji || null, eventDate: date, timezone })
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? 'Please check your inputs')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/create', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ name, emoji: emoji || null, eventDate: date, timezone }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Something went wrong. Please try again.')
          return
        }

        router.push(`/c/${data.slug}?new=1`)
      } catch {
        setError('Network error. Please check your connection and try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-5">

      {/* ── Emoji picker ─────────────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-brand-muted mb-2">
          Pick an emoji (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(emoji === e ? '' : e)}
              className={`
                text-2xl w-10 h-10 rounded-lg border transition-all duration-150 flex items-center justify-center
                ${emoji === e
                  ? 'border-brand-accent bg-brand-accent/10 scale-110'
                  : 'border-brand-border bg-brand-surface hover:border-brand-accent/50 hover:scale-105'
                }
              `}
              aria-label={`Select emoji ${e}`}
            >
              {e}
            </button>
          ))}
          {emoji && !EMOJI_OPTIONS.includes(emoji) && (
            <span className="text-2xl w-10 h-10 rounded-lg border border-brand-accent bg-brand-accent/10 flex items-center justify-center">
              {emoji}
            </span>
          )}
        </div>
      </div>

      {/* ── Event name ───────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="name" className="block text-xs font-mono uppercase tracking-widest text-brand-muted">
            Event name *
          </label>
          <span className={`text-xs font-mono ${charLeft < 10 ? 'text-red-400' : 'text-brand-muted'}`}>
            {charLeft}
          </span>
        </div>
        <input
          id="name"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="My Birthday 🎂"
          required
          maxLength={80}
          className="
            w-full bg-brand-surface border border-brand-border rounded-xl
            px-4 py-3 text-brand-text placeholder:text-brand-muted
            transition-colors duration-150
            hover:border-brand-accent/40
          "
        />
      </div>

      {/* ── Date & time ──────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="date" className="block text-xs font-mono uppercase tracking-widest text-brand-muted mb-2">
          Date & time *
        </label>
        <input
          id="date"
          type="datetime-local"
          value={date}
          min={minDate}
          onChange={(e) => setDate(e.target.value)}
          required
          className="
            w-full bg-brand-surface border border-brand-border rounded-xl
            px-4 py-3 text-brand-text
            transition-colors duration-150
            hover:border-brand-accent/40
            [color-scheme:dark]
          "
        />
      </div>

      {/* ── Timezone ─────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="timezone" className="block text-xs font-mono uppercase tracking-widest text-brand-muted mb-2">
          Timezone *
        </label>
        <select
          id="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          required
          className="
            w-full bg-brand-surface border border-brand-border rounded-xl
            px-4 py-3 text-brand-text
            transition-colors duration-150
            hover:border-brand-accent/40
            cursor-pointer
          "
        >
          {/* Show detected timezone first if not in list */}
          {!COMMON_TIMEZONES.find((tz) => tz.value === timezone) && (
            <option value={timezone}>{timezone} (detected)</option>
          )}
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <span className="text-red-400 text-sm leading-relaxed">{error}</span>
        </div>
      )}

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={pending || !name || !date}
        className="
          w-full bg-brand-accent text-white font-syne font-semibold
          py-4 rounded-xl text-base
          transition-all duration-200
          hover:bg-brand-accent/90 hover:scale-[1.01]
          active:scale-[0.99]
          disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
          animate-pulse-glow
        "
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Creating…
          </span>
        ) : (
          '→ Create countdown'
        )}
      </button>

      <p className="text-center text-xs text-brand-muted">
        Free · No account needed · Up to 10 countdowns per device
      </p>
    </form>
  )
}
