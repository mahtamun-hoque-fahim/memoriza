'use client'
// components/countdown/QRCode.tsx
// Generates a QR code for the countdown URL using the free QR API from qrserver.com
// — no npm package needed, just an <img> with a URL. Works on all devices.

import { useState } from 'react'
import Image        from 'next/image'

interface Props {
  slug: string
}

export function QRCode({ slug }: Props) {
  const [open, setOpen] = useState(false)

  const countdownUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://memoriza.vercel.app'}/c/${slug}`
  const qrUrl        = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&color=F2F2F5&bgcolor=131720&data=${encodeURIComponent(countdownUrl)}&qzone=2&margin=0`

  async function downloadQR() {
    try {
      const res  = await fetch(qrUrl)
      const blob = await res.blob()
      const a    = document.createElement('a')
      a.href     = URL.createObjectURL(blob)
      a.download = `memoriza-${slug}.png`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      window.open(qrUrl, '_blank')
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors duration-150 text-sm"
        style={{
          borderColor:     'var(--border)',
          color:           'var(--muted)',
          backgroundColor: 'var(--surface)',
        }}
        aria-label="Show QR code"
      >
        {/* QR icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3"  y="3"  width="7" height="7"/>
          <rect x="14" y="3"  width="7" height="7"/>
          <rect x="3"  y="14" width="7" height="7"/>
          <path d="M14 14h.01M14 18h.01M18 14h.01M18 18h.01M18 22h.01M22 14h.01M22 18h.01"/>
        </svg>
        QR Code
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-3 right-0 rounded-2xl border p-4 flex flex-col items-center gap-3 z-20 shadow-xl"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor:     'var(--border)',
            minWidth:        '220px',
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-md text-xs"
            style={{ color: 'var(--muted)', backgroundColor: 'var(--bg)' }}
            aria-label="Close QR code"
          >
            ✕
          </button>

          <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
            Scan to open
          </p>

          {/* QR image */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="QR code for this countdown"
              width={200}
              height={200}
              style={{ display: 'block' }}
            />
          </div>

          {/* Download */}
          <button
            type="button"
            onClick={downloadQR}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-colors duration-150"
            style={{
              backgroundColor: 'rgba(108,99,255,0.12)',
              color:           'var(--accent)',
              border:          '1px solid rgba(108,99,255,0.25)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download PNG
          </button>
        </div>
      )}
    </div>
  )
}
