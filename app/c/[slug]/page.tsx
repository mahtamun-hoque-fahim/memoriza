// app/c/[slug]/page.tsx — public countdown page (Phase 2)
import { notFound }  from 'next/navigation'
import { getDb, schema } from '@/lib/db'
import { eq }        from 'drizzle-orm'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const db  = getDb()
  if (!db) return {}
  const [row] = await db.select().from(schema.dates).where(eq(schema.dates.slug, params.slug)).limit(1)
  if (!row) return { title: 'Not found' }
  return {
    title:       row.title,
    description: `Counting down to ${row.title}`,
    openGraph: {
      images: [`/api/og?slug=${params.slug}`],
    },
  }
}

export default async function CountdownPage({ params }: Props) {
  const db  = getDb()
  if (!db) notFound()

  const [row] = await db.select().from(schema.dates).where(eq(schema.dates.slug, params.slug)).limit(1)
  if (!row || !row.isActive) notFound()

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>Counting down to</p>
        <h1 className="font-syne text-4xl font-bold mb-8">{row.title}</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Countdown widget — Phase 2</p>
      </div>
    </main>
  )
}
