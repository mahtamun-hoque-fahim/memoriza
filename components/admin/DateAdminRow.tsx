// components/admin/DateAdminRow.tsx
'use client'
import Link                from 'next/link'
import { useState, useTransition } from 'react'
import { adminDeleteDate, toggleDateActive } from '@/lib/admin-actions'
import { OCCASION_ICONS, OCCASION_LABELS }   from '@/lib/utils'

interface Props {
  date: {
    id:             string
    slug:           string
    title:          string
    occasion:       string
    eventDate:      Date
    recurrence:     string
    isActive:       boolean
    ownerEmail:     string
    recipientEmail: string | null
    createdAt:      Date
  }
}

export function DateAdminRow({ date }: Props) {
  const [isPending, start] = useTransition()
  const [confirm,  setConfirm] = useState(false)

  function handleDelete() {
    if (!confirm) { setConfirm(true); return }
    start(() => { adminDeleteDate(date.id) })
  }

  function handleToggle() {
    start(() => { toggleDateActive(date.id, !date.isActive) })
  }

  const eventStr = new Date(date.eventDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Icon + title */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base flex-shrink-0">{OCCASION_ICONS[date.occasion] ?? '✨'}</span>
          <div>
            <p className="text-sm font-medium truncate max-w-[160px]">{date.title}</p>
            <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
              {OCCASION_LABELS[date.occasion] ?? date.occasion}
            </p>
          </div>
        </div>
      </td>

      {/* Owner */}
      <td className="px-4 py-3 text-xs truncate max-w-[140px]" style={{ color: 'var(--muted)' }}>
        {date.ownerEmail}
      </td>

      {/* Event date */}
      <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--muted)' }}>
        {eventStr}
        <span className="ml-1 opacity-50">{date.recurrence === 'yearly' ? '↻' : '1×'}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-mono"
          style={{
            background: date.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)',
            color:      date.isActive ? 'var(--success)'        : 'var(--muted)',
          }}
        >
          {date.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end flex-wrap">
          <Link
            href={`/c/${date.slug}`}
            target="_blank"
            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all hover:opacity-80"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            ↗ View
          </Link>
          <button
            onClick={handleToggle}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all hover:opacity-80 disabled:opacity-40"
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            {date.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all hover:opacity-80 disabled:opacity-40"
            style={{
              background: confirm ? 'rgba(239,68,68,0.12)' : 'var(--surface-raised)',
              border:     `1px solid ${confirm ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
              color:      confirm ? 'var(--danger)' : 'var(--muted)',
            }}
          >
            {confirm ? 'Sure?' : '✕'}
          </button>
        </div>
      </td>
    </tr>
  )
}
