// components/dashboard/DateCard.tsx
'use client'
import Link                from 'next/link'
import { useState }        from 'react'
import { deleteDate }      from '@/lib/actions'
import { OCCASION_ICONS, OCCASION_LABELS, OCCASION_ACCENTS } from '@/lib/utils'
import type { Date_ }      from '@/lib/db/schema'

interface Props { date: Date_ }

function daysUntil(eventDate: Date, recurrence: string): number {
  const now     = new Date()
  const target  = new Date(eventDate)

  if (recurrence === 'yearly') {
    target.setFullYear(now.getFullYear())
    if (target < now) target.setFullYear(now.getFullYear() + 1)
  }

  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function DateCard({ date }: Props) {
  const [deleting, setDeleting] = useState(false)
  const [confirm,  setConfirm]  = useState(false)

  const days   = daysUntil(new Date(date.eventDate), date.recurrence)
  const icon   = OCCASION_ICONS[date.occasion]   ?? '✨'
  const label  = OCCASION_LABELS[date.occasion]  ?? 'Custom'
  const accent = OCCASION_ACCENTS[date.occasion] ?? '#6C63FF'

  const daysLabel = days === 0 ? 'Today! 🎉' : days === 1 ? 'Tomorrow' : `${days} days`
  const urgency   = days <= 3 ? 'var(--danger)' : days <= 7 ? 'var(--warning)' : 'var(--success)'

  async function handleDelete() {
    if (!confirm) { setConfirm(true); return }
    setDeleting(true)
    await deleteDate(date.id)
  }

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all hover:scale-[1.01]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Occasion icon bubble */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
          >
            {icon}
          </div>
          <div>
            <p className="font-syne font-semibold text-base leading-tight">{date.title}</p>
            <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--muted)' }}>{label}</p>
          </div>
        </div>

        {/* Days badge */}
        <div
          className="px-3 py-1 rounded-full text-xs font-mono font-semibold flex-shrink-0"
          style={{ background: `${urgency}18`, color: urgency, border: `1px solid ${urgency}30` }}
        >
          {daysLabel}
        </div>
      </div>

      {/* Cover image */}
      {date.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={date.imageUrl} alt={date.title} className="w-full h-28 object-cover rounded-xl" />
      )}

      {/* Meta row */}
      <div className="flex flex-wrap gap-2">
        {date.recipientEmail && (
          <span className="px-2.5 py-1 rounded-full text-xs font-mono" style={{ background: 'var(--surface-raised)', color: 'var(--muted)' }}>
            ✉ {date.recipientName ?? date.recipientEmail}
          </span>
        )}
        <span className="px-2.5 py-1 rounded-full text-xs font-mono" style={{ background: 'var(--surface-raised)', color: 'var(--muted)' }}>
          {date.recurrence === 'yearly' ? '↻ yearly' : '1× only'}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-mono" style={{ background: 'var(--surface-raised)', color: 'var(--muted)' }}>
          🔔 {date.reminderDays}d before
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Link
          href={`/c/${date.slug}`}
          target="_blank"
          className="flex-1 py-2 rounded-xl text-xs font-mono text-center transition-all hover:opacity-80"
          style={{ background: 'var(--surface-raised)', color: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          ↗ View page
        </Link>
        <Link
          href={`/dashboard/edit/${date.id}`}
          className="flex-1 py-2 rounded-xl text-xs font-mono text-center transition-all hover:opacity-80"
          style={{ background: 'var(--surface-raised)', color: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          ✎ Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-xl text-xs font-mono transition-all hover:opacity-80 disabled:opacity-40"
          style={{
            background: confirm ? 'rgba(239,68,68,0.15)' : 'var(--surface-raised)',
            color:      confirm ? 'var(--danger)' : 'var(--muted)',
            border:     `1px solid ${confirm ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
          }}
        >
          {deleting ? '…' : confirm ? 'Sure?' : '✕'}
        </button>
      </div>
    </div>
  )
}
