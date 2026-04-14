// components/countdown/CountdownTimer.tsx — client-side live countdown
'use client'
import { useEffect, useState } from 'react'

interface Props {
  targetDate: string  // ISO string
  accent:     string  // hex colour for the numbers
}

interface TimeLeft {
  days:    number
  hours:   number
  minutes: number
  seconds: number
  passed:  boolean
}

function compute(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true }
  const s = Math.floor(diff / 1000)
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    passed:  false,
  }
}

function pad(n: number) { return String(n).padStart(2, '0') }

export function CountdownTimer({ targetDate, accent }: Props) {
  const target = new Date(targetDate)
  const [time, setTime] = useState<TimeLeft>(compute(target))

  useEffect(() => {
    const id = setInterval(() => setTime(compute(target)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (time.passed) {
    return (
      <div className="text-center">
        <p className="font-syne text-4xl sm:text-5xl font-bold" style={{ color: accent }}>
          🎉 Today!
        </p>
      </div>
    )
  }

  const units = [
    { value: time.days,    label: 'days'    },
    { value: time.hours,   label: 'hours'   },
    { value: time.minutes, label: 'min'     },
    { value: time.seconds, label: 'sec'     },
  ]

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6">
      {units.map(({ value, label }, i) => (
        <div key={label} className="flex items-end gap-3 sm:gap-6">
          {i > 0 && (
            <span
              className="font-serif text-4xl sm:text-6xl font-normal mb-2 opacity-30 select-none"
              style={{ color: accent }}
            >:
            </span>
          )}
          <div className="flex flex-col items-center">
            <span
              className="font-serif text-5xl sm:text-7xl lg:text-8xl tabular-nums leading-none"
              style={{ color: accent }}
            >
              {label === 'days' ? String(value) : pad(value)}
            </span>
            <span className="font-mono text-xs uppercase tracking-widest mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
