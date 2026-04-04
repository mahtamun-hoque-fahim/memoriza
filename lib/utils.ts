// lib/utils.ts
import { createHash } from 'crypto'

// ── Slug ─────────────────────────────────────────────────────────────────────
// nanoid is ESM-only; import dynamically or use this tiny alternative
// that runs in both Edge and Node without dynamic import issues.
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function generateSlug(length = 10): string {
  let result = ''
  // Use crypto.getRandomValues when available (Edge + browser), otherwise Node crypto
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(length))
    for (const b of bytes) result += CHARS[b % CHARS.length]
  } else {
    // Node.js fallback
    const { randomBytes } = require('crypto')
    const bytes: Buffer = randomBytes(length)
    for (const b of bytes) result += CHARS[b % CHARS.length]
  }
  return result
}

// ── IP hashing ───────────────────────────────────────────────────────────────
// Never store raw IPs. SHA-256 one-way hash is enough for rate-limiting.
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_SALT ?? 'countdown-salt')).digest('hex')
}

// ── Class names helper ───────────────────────────────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ── Format countdown segments ─────────────────────────────────────────────────
export function padTwo(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0')
}

// ── Parse seconds into D/H/M/S ───────────────────────────────────────────────
export interface TimeLeft {
  days:    number
  hours:   number
  minutes: number
  seconds: number
  total:   number // total seconds remaining
}

export function getTimeLeft(targetDate: Date): TimeLeft {
  const total = Math.max(0, Math.floor((targetDate.getTime() - Date.now()) / 1000))
  const days    = Math.floor(total / 86400)
  const hours   = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return { days, hours, minutes, seconds, total }
}

// ── Common IANA timezone list for the picker ──────────────────────────────────
export const COMMON_TIMEZONES = [
  { label: 'Dhaka (GMT+6)',          value: 'Asia/Dhaka'          },
  { label: 'Kolkata (GMT+5:30)',      value: 'Asia/Kolkata'        },
  { label: 'Karachi (GMT+5)',         value: 'Asia/Karachi'        },
  { label: 'Dubai (GMT+4)',           value: 'Asia/Dubai'          },
  { label: 'Istanbul (GMT+3)',        value: 'Europe/Istanbul'     },
  { label: 'Moscow (GMT+3)',          value: 'Europe/Moscow'       },
  { label: 'Riyadh (GMT+3)',          value: 'Asia/Riyadh'         },
  { label: 'Paris / Berlin (GMT+2)', value: 'Europe/Paris'        },
  { label: 'London (GMT+1/0)',       value: 'Europe/London'       },
  { label: 'UTC (GMT+0)',            value: 'UTC'                 },
  { label: 'New York (GMT-5/-4)',    value: 'America/New_York'    },
  { label: 'Chicago (GMT-6/-5)',     value: 'America/Chicago'     },
  { label: 'Denver (GMT-7/-6)',      value: 'America/Denver'      },
  { label: 'Los Angeles (GMT-8/-7)', value: 'America/Los_Angeles' },
  { label: 'Toronto (GMT-5/-4)',     value: 'America/Toronto'     },
  { label: 'São Paulo (GMT-3)',       value: 'America/Sao_Paulo'   },
  { label: 'Singapore (GMT+8)',       value: 'Asia/Singapore'      },
  { label: 'Tokyo (GMT+9)',           value: 'Asia/Tokyo'          },
  { label: 'Sydney (GMT+10/+11)',    value: 'Australia/Sydney'    },
]
