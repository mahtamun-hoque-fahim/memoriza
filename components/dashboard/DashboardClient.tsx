'use client'
// components/dashboard/DashboardClient.tsx

import { useState, useTransition } from 'react'
import Link                        from 'next/link'
import { useRouter }               from 'next/navigation'
import { getTimeLeft }             from '@/lib/utils'

interface CountdownItem {
  id:               string
  slug:             string
  customSlug:       string | null | undefined
  name:             string
  emoji:            string | null | undefined
  eventDate:        string
  timezone:         string
  coverImage:       string | null | undefined
  viewCount:        number
  remindersEnabled: boolean
  createdAt:        string
}

interface Props {
  countdowns: CountdownItem[]
}

export function DashboardClient({ countdowns: initial }: Props) {
  const router = useRouter()
  const [items, setItems]         = useState(initial)
  const [deletingSlug, setDeleting] = useState<string | null>(null)
  const [pending, startTransition]  = useTransition()
  const [error, setError]           = useState<string | null>(null)

  async function handleDelete(slug: string) {
    if (deletingSlug !== slug) { setDeleting(slug); return } // first click = confirm
    setError(null)

    startTransition(async () => {
      const res = await fetch(`/api/dashboard/${slug}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Delete failed')
        setDeleting(null)
        return
      }
      setItems((prev) => prev.filter((c) => c.slug !== slug))
      setDeleting(null)
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center rounded-2xl border"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="text-5xl">⏳</div>
        <p className="font-syne text-lg font-semibold" style={{ color: 'var(--text)' }}>No countdowns yet</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Create your first countdown to see it here.</p>
        <Link href="/"
          className="mt-2 px-5 py-2.5 rounded-xl font-syne font-semibold text-sm text-white"
          style={{ backgroundColor: 'var(--accent)' }}>
          → Create one now
        </Link>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((c) => {
          const target   = new Date(c.eventDate)
          const timeLeft = getTimeLeft(target)
          const expired  = timeLeft.total === 0
          const shareUrl = `/c/${c.customSlug ?? c.slug}`
          const isConfirming = deletingSlug === c.slug

          return (
            <div key={c.id}
              className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors duration-150"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>

              {/* Cover thumbnail */}
              {c.coverImage && (
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ border: '1px solid var(--border)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.coverImage} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {c.emoji && <span>{c.emoji}</span>}
                  <span className="font-syne font-semibold truncate" style={{ color: 'var(--text)' }}>{c.name}</span>
                  {expired && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(108,99,255,0.12)', color: 'var(--accent)' }}>
                      ended
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  {/* Countdown */}
                  {!expired ? (
                    <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m left
                    </span>
                  ) : (
                    <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                      {new Date(c.eventDate).toLocaleDateString()}
                    </span>
                  )}

                  {/* Views */}
                  <span className="font-mono text-xs flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    {c.viewCount.toLocaleString()}
                  </span>

                  {/* Custom slug badge */}
                  {c.customSlug && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(108,99,255,0.08)', color: 'var(--accent)', border: '1px solid rgba(108,99,255,0.2)' }}>
                      /{c.customSlug}
                    </span>
                  )}

                  {/* Reminders */}
                  {c.remindersEnabled && (
                    <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>🔔 reminders on</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* View */}
                <Link href={shareUrl}
                  className="px-3 py-2 rounded-lg text-xs font-mono transition-colors duration-150"
                  style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}
                  target="_blank">
                  View ↗
                </Link>

                {/* Edit */}
                <Link href={`/c/${c.slug}/edit`}
                  className="px-3 py-2 rounded-lg text-xs font-mono transition-colors duration-150"
                  style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                  Edit
                </Link>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(c.slug)}
                  disabled={pending}
                  className="px-3 py-2 rounded-lg text-xs font-mono transition-all duration-150"
                  style={{
                    backgroundColor: isConfirming ? 'rgba(239,68,68,0.12)' : 'var(--bg)',
                    border:          isConfirming ? '1px solid rgba(239,68,68,0.35)' : '1px solid var(--border)',
                    color:           isConfirming ? '#F87171' : 'var(--muted)',
                  }}>
                  {isConfirming ? 'Confirm?' : 'Delete'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
