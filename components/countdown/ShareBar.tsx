'use client'
// components/countdown/ShareBar.tsx

import { useState } from 'react'

interface Props {
  slug:      string
  eventName: string
}

export function ShareBar({ slug, eventName }: Props) {
  const [copied, setCopied] = useState(false)
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/c/${slug}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function nativeShare() {
    if (!navigator.share) return
    try {
      await navigator.share({
        title: `Countdown: ${eventName}`,
        text:  `Check the countdown to ${eventName}!`,
        url,
      })
    } catch {
      // User cancelled share — no-op
    }
  }

  const canShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
      {/* URL pill */}
      <div className="flex items-center gap-0 flex-1 w-full bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
        <span className="flex-1 px-4 py-3 text-sm text-brand-muted font-mono truncate">
          {url.replace('https://', '')}
        </span>
        <button
          onClick={copyLink}
          className="
            px-4 py-3 border-l border-brand-border text-sm font-medium
            transition-colors duration-150 whitespace-nowrap
            text-brand-accent hover:bg-brand-accent/10
          "
          aria-label="Copy link"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>

      {/* Native share (mobile) */}
      {canShare && (
        <button
          onClick={nativeShare}
          className="
            flex items-center gap-2 px-4 py-3 rounded-xl border border-brand-border
            text-sm text-brand-muted hover:text-brand-text hover:border-brand-accent/40
            transition-colors duration-150 whitespace-nowrap
          "
          aria-label="Share"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
          Share
        </button>
      )}
    </div>
  )
}
