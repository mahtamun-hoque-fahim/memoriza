'use client'
// components/countdown/CoverImageUploader.tsx

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface Props {
  value?:    string | null   // current Cloudinary URL
  onChange:  (url: string | null) => void
}

export function CoverImageUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [dragging,  setDragging]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(async (file: File) => {
    setError(null)
    setUploading(true)

    const form = new FormData()
    form.append('file', file)

    try {
      const res  = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Upload failed')
        return
      }
      onChange(data.url)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setUploading(false)
    }
  }, [onChange])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) upload(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  return (
    <div>
      <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
        Cover image <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span>
      </label>

      {value ? (
        // Preview
        <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <div className="relative w-full h-40">
            <Image src={value} alt="Cover image" fill style={{ objectFit: 'cover' }} />
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = '' }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(10,12,16,0.8)', color: '#F2F2F5', border: '1px solid rgba(255,255,255,0.15)' }}
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
      ) : (
        // Drop zone
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragging(false)}
          className="relative rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150 h-32 flex flex-col items-center justify-center gap-2"
          style={{
            borderColor:     dragging ? 'var(--accent)' : 'var(--border)',
            backgroundColor: dragging ? 'rgba(108,99,255,0.06)' : 'var(--surface)',
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Upload cover image"
        >
          {uploading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent)' }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>Uploading…</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span className="text-xs font-mono text-center px-4" style={{ color: 'var(--muted)' }}>
                Drop an image or click to browse<br />
                <span style={{ opacity: 0.6 }}>JPEG · PNG · WebP · GIF · max 5 MB</span>
              </span>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="sr-only"
            aria-hidden="true"
          />
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs" style={{ color: '#F87171' }}>{error}</p>
      )}
    </div>
  )
}
