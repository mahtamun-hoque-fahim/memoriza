'use client'
// app/(auth)/sign-in/page.tsx
// Magic link sign-in — user enters email, Auth.js sends a one-time link via Resend.

import { useState, useTransition } from 'react'
import { signIn }                  from 'next-auth/react'
import Link                        from 'next/link'
import { useSearchParams }         from 'next/navigation'

export default function SignInPage() {
  const params  = useSearchParams()
  const sent    = params.get('verify') === '1'
  const errCode = params.get('error')

  const [email,   setEmail]   = useState('')
  const [pending, startTransition] = useTransition()
  const [done,    setDone]    = useState(sent)

  const errorMsg = errCode === 'EmailSignin'
    ? 'Failed to send sign-in email. Please try again.'
    : errCode
    ? 'Something went wrong. Please try again.'
    : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    startTransition(async () => {
      await signIn('resend', {
        email,
        redirect:    false,
        callbackUrl: '/dashboard',
      })
      setDone(true)
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)', borderRadius: '12px',
    padding: '13px 16px', color: 'var(--text)', fontSize: '15px',
    outline: 'none',
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.10) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold font-syne"
              style={{ backgroundColor: 'var(--accent)' }}>M</div>
            <span className="font-syne font-semibold text-base" style={{ color: 'var(--text)' }}>Memoriza</span>
          </Link>
          <h1 className="font-syne text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            {done ? 'Check your email' : 'Sign in'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {done
              ? `We sent a sign-in link to ${email || 'your email'}. Click it to continue.`
              : 'Enter your email to receive a magic sign-in link.'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>

          {done ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="text-4xl">📬</div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                The link expires in 10 minutes. If you don't see it, check your spam folder.
              </p>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="font-mono text-xs underline underline-offset-4"
                style={{ color: 'var(--muted)' }}>
                Try a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {errorMsg && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px' }}>
                  <p style={{ color: '#F87171', fontSize: '13px' }}>{errorMsg}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-jetbrains-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '8px' }}>
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={pending || !email}
                style={{
                  width: '100%', padding: '14px',
                  backgroundColor: 'var(--accent)', color: '#fff',
                  fontFamily: 'var(--font-syne)', fontWeight: 600, fontSize: '15px',
                  borderRadius: '12px', border: 'none',
                  cursor: pending || !email ? 'not-allowed' : 'pointer',
                  opacity: pending || !email ? 0.4 : 1,
                  transition: 'all 0.2s',
                }}>
                {pending ? 'Sending link…' : 'Send magic link →'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'var(--muted)' }}>
          No password needed. No data sold. Ever.
        </p>

        <p className="text-center mt-3 text-xs" style={{ color: 'var(--muted)' }}>
          <Link href="/" className="underline underline-offset-4 hover:text-[var(--text)] transition-colors">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
