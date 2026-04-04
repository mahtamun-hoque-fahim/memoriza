'use client'
// components/countdown/CountdownTimer.tsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { getTimeLeft, padTwo, type TimeLeft }        from '@/lib/utils'

interface Props {
  targetDate: string // ISO UTC string from server
  eventName:  string
  emoji?:     string | null
}

interface SegmentProps {
  value:    string
  label:    string
  prevVal?: string
}

// Individual digit column with tick animation
function Segment({ value, label, prevVal }: SegmentProps) {
  const changed = prevVal !== undefined && prevVal !== value
  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3 min-w-0">
      <div
        className={`
          relative font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl
          leading-none tracking-tight text-brand-text tabular-nums
          ${changed ? 'tick-animate' : ''}
        `}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </div>
      <span className="font-mono text-[9px] sm:text-[11px] uppercase tracking-[0.2em] text-brand-muted select-none">
        {label}
      </span>
    </div>
  )
}

// Colon separator
function Colon() {
  return (
    <div className="font-serif text-4xl sm:text-6xl md:text-7xl text-brand-border pb-6 select-none leading-none">
      :
    </div>
  )
}

export function CountdownTimer({ targetDate, eventName, emoji }: Props) {
  const target     = new Date(targetDate)
  const [time, setTime]       = useState<TimeLeft>(() => getTimeLeft(target))
  const [finished, setFinished] = useState(false)
  const prevRef    = useRef<TimeLeft | null>(null)

  const tick = useCallback(() => {
    const t = getTimeLeft(target)
    if (t.total === 0) {
      setFinished(true)
      setTime(t)
      return
    }
    prevRef.current = time
    setTime(t)
  }, [target])

  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])

  // Finished state — fire confetti dynamically
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
        <div className="text-7xl sm:text-8xl" role="img" aria-label="celebration">🎉</div>
        <div>
          <p className="font-syne text-2xl sm:text-3xl font-semibold text-brand-text mb-2">
            It&apos;s here!
          </p>
          <p className="text-brand-muted text-lg">{eventName} has arrived.</p>
        </div>
        <div className="w-24 h-1 rounded-full bg-brand-accent/40" />
        <p className="text-brand-muted text-sm">Share this moment with your friends ↗</p>
      </div>
    )
  }

  const prev = prevRef.current
  const dd   = padTwo(time.days)
  const hh   = padTwo(time.hours)
  const mm   = padTwo(time.minutes)
  const ss   = padTwo(time.seconds)

  const pdd  = prev ? padTwo(prev.days)    : dd
  const phh  = prev ? padTwo(prev.hours)   : hh
  const pmm  = prev ? padTwo(prev.minutes) : mm
  const pss  = prev ? padTwo(prev.seconds) : ss

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* Event title */}
      <div className="text-center space-y-1 animate-slide-up">
        {emoji && <div className="text-4xl sm:text-5xl mb-2">{emoji}</div>}
        <h1 className="font-syne text-xl sm:text-2xl md:text-3xl font-semibold text-brand-text">
          {eventName}
        </h1>
        <p className="font-mono text-xs text-brand-muted uppercase tracking-widest">
          Countdown in progress
        </p>
      </div>

      {/* Timer segments */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 w-full animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
        <Segment value={dd} label={time.days === 1 ? 'day' : 'days'} prevVal={pdd} />
        <Colon />
        <Segment value={hh} label="hrs"  prevVal={phh} />
        <Colon />
        <Segment value={mm} label="min"  prevVal={pmm} />
        <Colon />
        <Segment value={ss} label="sec"  prevVal={pss} />
      </div>

      {/* Subtle progress hint */}
      <p
        className="font-mono text-xs text-brand-muted animate-fade-in"
        style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}
      >
        {time.days > 0
          ? `${time.days} day${time.days === 1 ? '' : 's'} remaining`
          : 'Less than a day to go!'}
      </p>
    </div>
  )
}
