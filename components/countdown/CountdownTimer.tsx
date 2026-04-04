'use client'
// components/countdown/CountdownTimer.tsx
// Phase 2: CSS flip animation on digit change + confetti on finish.

import { useState, useEffect, useCallback, useRef } from 'react'
import { getTimeLeft, padTwo, type TimeLeft }        from '@/lib/utils'

interface Props {
  targetDate: string
  eventName:  string
  emoji?:     string | null
}

// ── Flip digit card ───────────────────────────────────────────────────────────
// Renders two overlapping spans: the current value (flips out) and the
// incoming value (flips in). JS toggles .is-flipping on the wrapper.
function FlipDigit({ value, prevValue }: { value: string; prevValue: string }) {
  const ref     = useRef<HTMLDivElement>(null)
  const changed = value !== prevValue

  useEffect(() => {
    if (!changed || !ref.current) return
    const el = ref.current
    el.classList.remove('is-flipping')
    // Force reflow so the animation restarts cleanly
    void el.offsetHeight
    el.classList.add('is-flipping')
    const id = setTimeout(() => el.classList.remove('is-flipping'), 400)
    return () => clearTimeout(id)
  }, [value, changed])

  return (
    <div
      ref={ref}
      className="flip-card font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] tabular-nums leading-none"
      style={{ color: 'var(--text)', minWidth: '1.1ch' }}
    >
      <span className="flip-top">{prevValue}</span>
      <span
        className="flip-bottom"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: changed ? 0 : 1,
        }}
      >
        {value}
      </span>
    </div>
  )
}

// ── Segment (digit + label) ───────────────────────────────────────────────────
function Segment({ value, label, prevValue }: { value: string; label: string; prevValue: string }) {
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <div style={{ position: 'relative' }}>
        <FlipDigit value={value} prevValue={prevValue} />
      </div>
      <span
        className="font-mono text-[9px] sm:text-[11px] uppercase tracking-[0.2em] select-none"
        style={{ color: 'var(--muted)' }}
      >
        {label}
      </span>
    </div>
  )
}

function Colon() {
  return (
    <div
      className="font-serif text-4xl sm:text-6xl md:text-7xl pb-6 select-none leading-none"
      style={{ color: 'var(--border)' }}
    >
      :
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function CountdownTimer({ targetDate, eventName, emoji }: Props) {
  const target = new Date(targetDate)

  const [time,     setTime]     = useState<TimeLeft>(() => getTimeLeft(target))
  const [prev,     setPrev]     = useState<TimeLeft | null>(null)
  const [finished, setFinished] = useState(false)

  const tick = useCallback(() => {
    const t = getTimeLeft(target)
    if (t.total === 0) { setFinished(true); setTime(t); return }
    setPrev(p => p ?? t)
    setTime(old => { setPrev(old); return t })
  }, [target])

  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])

  useEffect(() => {
    if (!finished) return
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 180, spread: 100, origin: { y: 0.5 }, colors: ['#6C63FF', '#A89EFF', '#F2F2F5'] })
      setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.4 } }), 400)
    })
  }, [finished])

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-6 text-center animate-fade-in">
        <div className="text-7xl sm:text-8xl">🎉</div>
        <div>
          <p className="font-syne text-2xl sm:text-3xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
            It&apos;s here!
          </p>
          <p className="text-lg" style={{ color: 'var(--muted)' }}>{eventName} has arrived.</p>
        </div>
        <div className="w-24 h-1 rounded-full" style={{ background: 'var(--accent)', opacity: 0.4 }} />
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Share this moment with your friends ↗</p>
      </div>
    )
  }

  const dd = padTwo(time.days)
  const hh = padTwo(time.hours)
  const mm = padTwo(time.minutes)
  const ss = padTwo(time.seconds)

  const pdd = prev ? padTwo(prev.days)    : dd
  const phh = prev ? padTwo(prev.hours)   : hh
  const pmm = prev ? padTwo(prev.minutes) : mm
  const pss = prev ? padTwo(prev.seconds) : ss

  return (
    <div className="flex flex-col items-center gap-8 w-full">

      {/* Event title */}
      <div className="text-center space-y-1 animate-slide-up">
        {emoji && <div className="text-4xl sm:text-5xl mb-2">{emoji}</div>}
        <h1 className="font-syne text-xl sm:text-2xl md:text-3xl font-semibold" style={{ color: 'var(--text)' }}>
          {eventName}
        </h1>
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          Countdown in progress
        </p>
      </div>

      {/* Timer */}
      <div
        className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 w-full animate-slide-up"
        style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
      >
        <Segment value={dd} label={time.days === 1 ? 'day' : 'days'} prevValue={pdd} />
        <Colon />
        <Segment value={hh} label="hrs"  prevValue={phh} />
        <Colon />
        <Segment value={mm} label="min"  prevValue={pmm} />
        <Colon />
        <Segment value={ss} label="sec"  prevValue={pss} />
      </div>

      {/* Hint */}
      <p
        className="font-mono text-xs animate-fade-in"
        style={{ color: 'var(--muted)', animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}
      >
        {time.days > 0
          ? `${time.days} day${time.days === 1 ? '' : 's'} remaining`
          : 'Less than a day to go!'}
      </p>
    </div>
  )
}
