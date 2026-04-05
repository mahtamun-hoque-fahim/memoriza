'use client'
// components/countdown/ViewCounter.tsx
// Fires a fire-and-forget POST to increment the view count on mount.
// Displays the count passed from the server (SSR value).

import { useEffect } from 'react'

interface Props {
  slug:       string
  initialCount: number
}

export function ViewCounter({ slug, initialCount }: Props) {
  useEffect(() => {
    // Non-blocking — don't await, don't show errors to user
    fetch(`/api/countdown/${slug}/view`, { method: 'POST' }).catch(() => {})
  }, [slug])

  if (initialCount < 2) return null // don't show until at least 2 views

  return (
    <div className="flex items-center gap-1.5" aria-label={`${initialCount} views`}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
        {initialCount.toLocaleString()} {initialCount === 1 ? 'view' : 'views'}
      </span>
    </div>
  )
}
