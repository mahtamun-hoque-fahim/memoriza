// app/api/og/route.tsx — dynamic OG image via @vercel/og
// Phase 2 will render a full themed card. For now returns a basic image.
import { ImageResponse } from '@vercel/og'
import { getDb, schema } from '@/lib/db'
import { eq }            from 'drizzle-orm'
import { OCCASION_ICONS } from '@/lib/utils'

export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug') ?? ''

  let title = 'Memoriza'
  let icon  = '📅'

  try {
    const db = getDb()
    if (db && slug) {
      const [row] = await db
        .select({ title: schema.dates.title, occasion: schema.dates.occasion })
        .from(schema.dates)
        .where(eq(schema.dates.slug, slug))
        .limit(1)
      if (row) {
        title = row.title
        icon  = OCCASION_ICONS[row.occasion] ?? '✨'
      }
    }
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0A0C10',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 24 }}>{icon}</div>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#F2F2F5', textAlign: 'center', maxWidth: 900, padding: '0 40px' }}>
          {title}
        </div>
        <div style={{ fontSize: 24, color: '#6B7280', marginTop: 16 }}>memoriza.app</div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
