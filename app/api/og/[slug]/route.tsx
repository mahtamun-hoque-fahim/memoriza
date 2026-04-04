// app/api/og/[slug]/route.tsx
// Generates a dynamic OG image for each countdown.
// Shown as the rich preview when the link is shared on WhatsApp, Telegram, Twitter, etc.

import { ImageResponse } from '@vercel/og'
import { NextRequest }   from 'next/server'
import { eq, and, isNull } from 'drizzle-orm'
import { getDb, schema }   from '@/lib/db'

export const runtime = 'edge'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params

  // Fetch countdown data
  let name      = 'Countdown'
  let emoji     = '⏳'
  let daysLeft  = 0
  let finished  = false

  try {
    const db = getDb()
    if (db) {
      const rows = await db
        .select()
        .from(schema.countdowns)
        .where(and(eq(schema.countdowns.slug, slug), isNull(schema.countdowns.deletedAt)))
        .limit(1)

      if (rows[0]) {
        const row  = rows[0]
        name       = row.name
        emoji      = row.emoji ?? '⏳'
        const diff = row.eventDate.getTime() - Date.now()
        daysLeft   = Math.max(0, Math.floor(diff / 86_400_000))
        finished   = diff <= 0
      }
    }
  } catch {
    // Silently fall back to defaults
  }

  const label  = finished
    ? "It's here!"
    : daysLeft === 0
    ? 'Less than a day!'
    : `${daysLeft} day${daysLeft === 1 ? '' : 's'} to go`

  return new ImageResponse(
    (
      <div
        style={{
          width:           '1200px',
          height:          '630px',
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          justifyContent:  'center',
          backgroundColor: '#0A0C10',
          fontFamily:      'sans-serif',
          position:        'relative',
          overflow:        'hidden',
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position:        'absolute',
            inset:           0,
            backgroundImage: 'linear-gradient(rgba(108,99,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.06) 1px, transparent 1px)',
            backgroundSize:  '48px 48px',
          }}
        />

        {/* Top glow */}
        <div
          style={{
            position:   'absolute',
            top:        '-100px',
            left:       '50%',
            transform:  'translateX(-50%)',
            width:      '800px',
            height:     '400px',
            background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.20) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:            '24px',
            position:       'relative',
            zIndex:         1,
            padding:        '0 80px',
            textAlign:      'center',
          }}
        >
          {/* Emoji */}
          <div style={{ fontSize: '80px', lineHeight: 1 }}>{emoji}</div>

          {/* Event name */}
          <div
            style={{
              fontSize:    '52px',
              fontWeight:  700,
              color:       '#F2F2F5',
              lineHeight:  1.1,
              maxWidth:    '900px',
              overflow:    'hidden',
              display:     '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {name}
          </div>

          {/* Days badge */}
          <div
            style={{
              display:         'flex',
              alignItems:      'center',
              gap:             '10px',
              backgroundColor: finished ? 'rgba(108,99,255,0.25)' : 'rgba(108,99,255,0.15)',
              border:          '1px solid rgba(108,99,255,0.4)',
              borderRadius:    '100px',
              padding:         '12px 32px',
            }}
          >
            {!finished && (
              <div
                style={{
                  width:           '8px',
                  height:          '8px',
                  borderRadius:    '50%',
                  backgroundColor: '#6C63FF',
                }}
              />
            )}
            <div
              style={{
                fontSize:    '22px',
                fontWeight:  500,
                color:       '#A89EFF',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </div>
          </div>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position:  'absolute',
            bottom:    '32px',
            display:   'flex',
            alignItems: 'center',
            gap:        '8px',
          }}
        >
          <div style={{ fontSize: '16px', color: '#6B7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            memoriza.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
    }
  )
}
