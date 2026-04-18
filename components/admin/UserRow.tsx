// components/admin/UserRow.tsx
'use client'
import { useState, useTransition } from 'react'
import { setUserRole, deleteUserDates } from '@/lib/admin-actions'

interface Props {
  user: {
    id:        string
    email:     string
    role:      string
    createdAt: Date
    dateCount: number
  }
}

export function UserRow({ user }: Props) {
  const [isPending, start] = useTransition()
  const [confirm,  setConfirm] = useState(false)

  const isAdmin = user.role === 'admin'

  function handleRoleToggle() {
    start(() => { setUserRole(user.id, isAdmin ? 'user' : 'admin') })
  }

  function handleDeleteDates() {
    if (!confirm) { setConfirm(true); return }
    start(() => { deleteUserDates(user.id) })
    setConfirm(false)
  }

  const joined = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Avatar + email */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-semibold flex-shrink-0"
            style={{ background: 'var(--surface-raised)', color: 'var(--accent)' }}
          >
            {user.email[0].toUpperCase()}
          </div>
          <span className="text-sm truncate max-w-[200px]">{user.email}</span>
        </div>
      </td>

      {/* Role badge */}
      <td className="px-4 py-3">
        <span
          className="px-2.5 py-1 rounded-full text-xs font-mono"
          style={{
            background: isAdmin ? 'rgba(108,99,255,0.15)' : 'var(--surface-raised)',
            color:      isAdmin ? 'var(--accent)' : 'var(--muted)',
          }}
        >
          {user.role}
        </span>
      </td>

      {/* Date count */}
      <td className="px-4 py-3 text-sm font-mono text-center" style={{ color: 'var(--muted)' }}>
        {user.dateCount}
      </td>

      {/* Joined */}
      <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--muted)' }}>
        {joined}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleRoleToggle}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all hover:opacity-80 disabled:opacity-40"
            style={{
              background: 'var(--surface-raised)',
              border:     '1px solid var(--border)',
              color:      'var(--muted)',
            }}
          >
            {isAdmin ? 'Remove admin' : 'Make admin'}
          </button>
          <button
            onClick={handleDeleteDates}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all hover:opacity-80 disabled:opacity-40"
            style={{
              background: confirm ? 'rgba(239,68,68,0.12)' : 'var(--surface-raised)',
              border:     `1px solid ${confirm ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
              color:      confirm ? 'var(--danger)' : 'var(--muted)',
            }}
          >
            {confirm ? 'Sure?' : 'Del dates'}
          </button>
        </div>
      </td>
    </tr>
  )
}
