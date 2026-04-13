import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>404</p>
        <h1 className="font-syne text-4xl font-bold mb-4">Page not found</h1>
        <p className="mb-8" style={{ color: 'var(--muted)' }}>The page you're looking for doesn't exist.</p>
        <Link href="/" className="px-6 py-3 rounded-xl font-syne font-semibold text-white" style={{ background: 'var(--accent)' }}>
          Go home →
        </Link>
      </div>
    </main>
  )
}
