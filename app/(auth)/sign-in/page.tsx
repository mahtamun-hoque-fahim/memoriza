// app/(auth)/sign-in/page.tsx
'use client'
import { useState } from 'react'
import { signIn }   from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import type { Metadata } from 'next'

export default function SignInPage() {
  const params   = useSearchParams()
  const verified = params.get('verify')

  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(!!verified)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await signIn('resend', { email, redirect: false, callbackUrl: '/dashboard' })
    setSent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="font-syne text-3xl font-bold mb-2">Memoriza</h1>
          <p style={{ color: 'var(--muted)' }} className="text-sm">
            {sent ? 'Check your email' : 'Sign in or create an account'}
          </p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✉️</div>
              <p className="font-syne font-semibold mb-2">Magic link sent!</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Click the link in your email to sign in. It expires in 10 minutes.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-sm underline"
                style={{ color: 'var(--muted)' }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(108,99,255,0.6)'}
                  onBlur={(e)  => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-syne font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--accent)' }}
              >
                {loading ? 'Sending…' : 'Send magic link →'}
              </button>
              <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
                No password needed. We'll email you a sign-in link.
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
