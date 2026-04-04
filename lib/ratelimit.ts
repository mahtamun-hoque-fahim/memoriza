// lib/ratelimit.ts
// Uses Upstash Redis for distributed rate limiting on the /api/create endpoint.
// Gracefully degrades to "allow" if UPSTASH env vars are not set
// (so the app works without Redis during development / before Phase 2 deploy).

import { Ratelimit } from '@upstash/ratelimit'
import { Redis }     from '@upstash/redis'

let ratelimiter: Ratelimit | null = null

function getRateLimiter(): Ratelimit | null {
  if (ratelimiter) return ratelimiter

  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // Not configured — skip rate limiting (logs a warning in dev)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[ratelimit] UPSTASH_REDIS_REST_URL / TOKEN not set — rate limiting disabled')
    }
    return null
  }

  ratelimiter = new Ratelimit({
    redis:     Redis.fromEnv(),
    // 5 creation attempts per 10 minutes per IP — prevents burst abuse
    limiter:   Ratelimit.slidingWindow(5, '10 m'),
    analytics: true,
    prefix:    'memoriza:create',
  })

  return ratelimiter
}

export interface RateLimitResult {
  allowed:   boolean
  remaining: number
  reset:     number // Unix timestamp (ms) when the window resets
}

/**
 * Check if a given IP is allowed to call /api/create.
 * Returns { allowed: true } if Upstash is not configured (graceful degradation).
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const limiter = getRateLimiter()

  if (!limiter) {
    return { allowed: true, remaining: 99, reset: 0 }
  }

  try {
    const { success, remaining, reset } = await limiter.limit(ip)
    return { allowed: success, remaining, reset }
  } catch (err) {
    // If Redis is down, fail open (don't block users)
    console.error('[ratelimit] Upstash error — failing open:', err)
    return { allowed: true, remaining: 0, reset: 0 }
  }
}
