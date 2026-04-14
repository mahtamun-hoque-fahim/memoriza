// app/api/og/route.tsx — themed dynamic OG image
import { ImageResponse } from '@vercel/og'
import { getDb, schema } from '@/lib/db'
import { eq }            from 'drizzle-orm'
import { OCCASION_ICONS, OCCASION_LABELS, OCCASION_ACCENTS } from '@/lib/utils'

export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug') ?? ''

  let title   = 'Memoriza'
  let icon    = '📅'
  let label   = 'Special occasion'
  let accent  = '#6C63FF'

  try {
    const db = getDb()
    if (db && slug) {
      const [row] = await db
        .select({ title: schema.dates.title, occasion: schema.dates.occasion })
        .from(schema.dates)
        .where(eq(schema.dates.slug, slug))
        .limit(1)
      if (row) {
        title  = row.title
        icon   = OCCASION_ICONS[row.occasion]  ?? '✨'
        label  = OCCASION_LABELS[row.occasion] ?? 'Custom'
        accent = OCCASION_ACCENTS[row.occasion] ?? '#6C63FF'
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
          position: 'relative',
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          transform: 'translateX(-50%)',
          width: 800, height: 400,
          background: `radial-gradient(ellipse at center, ${accent}22 0%, transparent 70%)`,
        }} />

        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />

        {/* Card */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 24, zIndex: 1,
        }}>
          {/* Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 20px', borderRadius: 999,
            background: `${accent}20`, border: `1px solid ${accent}40`,
            fontSize: 20, color: accent, fontFamily: 'monospace',
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <span>{icon}</span>
            <span>{label}</span>
          </div>

          {/* Title */}
          <div style={{
            fontSize: title.length > 30 ? 52 : 64,
            fontWeight: 700, color: '#F2F2F5',
            textAlign: 'center', maxWidth: 900,
            padding: '0 40px', lineHeight: 1.15,
            fontFamily: 'system-ui, sans-serif',
          }}>
            {title}
          </div>

          {/* Branding */}
          <div style={{
            fontSize: 22, color: 'rgba(255,255,255,0.3)',
            fontFamily: 'monospace', letterSpacing: '0.05em',
          }}>
            memoriza.app
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
