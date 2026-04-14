// components/countdown/DateForm.tsx — shared create/edit form
'use client'
import { useRef, useState, useTransition } from 'react'
import { createDate, updateDate }           from '@/lib/actions'
import { OCCASION_LABELS, OCCASION_ICONS }  from '@/lib/utils'
import type { Date_ } from '@/lib/db/schema'

interface Props {
  mode:     'create' | 'edit'
  existing?: Date_
}

const OCCASIONS = Object.keys(OCCASION_LABELS) as Array<keyof typeof OCCASION_LABELS>
const REMINDER_OPTIONS = [
  { value: 3,  label: '3 days before'  },
  { value: 7,  label: '7 days before'  },
  { value: 14, label: '14 days before' },
]

const inputCls = `
  w-full px-4 py-3 rounded-xl text-sm transition-all outline-none
  bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]
  focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20
  placeholder:text-[var(--muted)]
`.trim()

const labelCls = 'block text-xs font-mono uppercase tracking-wider mb-2 text-[var(--muted)]'

export function DateForm({ mode, existing }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]   = useState<string | null>(null)
  const [imageUrl, setImageUrl]     = useState(existing?.imageUrl ?? '')
  const [imagePublicId, setImagePublicId] = useState(existing?.imagePublicId ?? '')
  const [uploading, setUploading]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Format existing date to YYYY-MM-DD for input[type=date]
  const defaultDate = existing?.eventDate
    ? new Date(existing.eventDate).toISOString().slice(0, 10)
    : ''

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      // Get signed upload params from our API
      const sigRes = await fetch('/api/upload')
      if (!sigRes.ok) throw new Error('Failed to get upload signature')
      const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json()

      const fd = new FormData()
      fd.append('file',      file)
      fd.append('signature', signature)
      fd.append('timestamp', String(timestamp))
      fd.append('folder',    folder)
      fd.append('api_key',   apiKey)

      const upRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST', body: fd,
      })
      if (!upRes.ok) throw new Error('Cloudinary upload failed')
      const upData = await upRes.json()
      setImageUrl(upData.secure_url)
      setImagePublicId(upData.public_id)
    } catch (err: any) {
      setError(err.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('imageUrl',      imageUrl)
    fd.set('imagePublicId', imagePublicId)

    startTransition(async () => {
      const result = mode === 'create'
        ? await createDate(fd)
        : await updateDate(existing!.id, fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Title */}
      <div>
        <label className={labelCls}>Event title</label>
        <input
          name="title"
          type="text"
          required
          maxLength={80}
          defaultValue={existing?.title}
          placeholder="Our Anniversary"
          className={inputCls}
        />
      </div>

      {/* Occasion */}
      <div>
        <label className={labelCls}>Occasion</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {OCCASIONS.map((occ) => (
            <label key={occ} className="cursor-pointer">
              <input
                type="radio"
                name="occasion"
                value={occ}
                defaultChecked={(existing?.occasion ?? 'custom') === occ}
                className="sr-only peer"
              />
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition-all
                peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)]/10 peer-checked:text-[var(--text)]
                border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
              >
                <span className="text-base">{OCCASION_ICONS[occ]}</span>
                <span className="font-mono text-xs">{OCCASION_LABELS[occ]}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Event date + Recurrence */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Date</label>
          <input
            name="eventDate"
            type="date"
            required
            defaultValue={defaultDate}
            className={inputCls}
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <div>
          <label className={labelCls}>Repeats</label>
          <select name="recurrence" defaultValue={existing?.recurrence ?? 'yearly'} className={inputCls}>
            <option value="yearly">Every year</option>
            <option value="once">One time only</option>
          </select>
        </div>
      </div>

      {/* Recipient */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
          Recipient (optional)
        </p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          We'll also send a reminder email to the person you're celebrating.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Their name</label>
            <input
              name="recipientName"
              type="text"
              maxLength={80}
              defaultValue={existing?.recipientName ?? ''}
              placeholder="Sarah"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Their email</label>
            <input
              name="recipientEmail"
              type="email"
              maxLength={254}
              defaultValue={existing?.recipientEmail ?? ''}
              placeholder="sarah@example.com"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Reminder days */}
      <div>
        <label className={labelCls}>Send reminders</label>
        <div className="flex gap-2">
          {REMINDER_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="reminderDays"
                value={value}
                defaultChecked={(existing?.reminderDays ?? 7) === value}
                className="sr-only peer"
              />
              <div className="text-center px-3 py-2.5 rounded-xl text-xs font-mono border transition-all
                peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)]/10 peer-checked:text-[var(--text)]
                border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
              >
                {label}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Cover image */}
      <div>
        <label className={labelCls}>Cover photo (optional)</label>
        {imageUrl ? (
          <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Cover" className="w-full h-40 object-cover" />
            <button
              type="button"
              onClick={() => { setImageUrl(''); setImagePublicId('') }}
              className="absolute top-2 right-2 px-3 py-1 rounded-lg text-xs font-mono text-white"
              style={{ background: 'rgba(0,0,0,0.7)' }}
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full py-8 rounded-xl text-sm border-2 border-dashed transition-all hover:opacity-80 disabled:opacity-40"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            {uploading ? 'Uploading…' : '+ Upload a photo'}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending || uploading}
        className="w-full py-3.5 rounded-xl font-syne font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: 'var(--accent)' }}
      >
        {isPending ? 'Saving…' : mode === 'create' ? 'Save date →' : 'Update date →'}
      </button>
    </form>
  )
}
