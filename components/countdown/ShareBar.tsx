// components/countdown/ShareBar.tsx
'use client'
import { useState } from 'react'

interface Props { url: string }

export function ShareBar({ url }: Props) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="flex items-center gap-2 max-w-sm mx-auto">
      <input
        readOnly
        value={url}
        className="flex-1 px-3 py-2 rounded-xl text-xs font-mono outline-none truncate"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border:     '1px solid rgba(255,255,255,0.12)',
          color:      'rgba(255,255,255,0.6)',
        }}
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
      <button
        onClick={copy}
        className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-white transition-all hover:opacity-90 flex-shrink-0"
        style={{ background: copied ? 'var(--success)' : 'rgba(255,255,255,0.15)' }}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}
