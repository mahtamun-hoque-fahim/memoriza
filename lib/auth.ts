// lib/auth.ts — Auth.js v5 with Resend magic links + role in session
import NextAuth           from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Resend             from 'next-auth/providers/resend'
import { neon }           from '@neondatabase/serverless'
import { drizzle }        from 'drizzle-orm/neon-http'
import { eq }             from 'drizzle-orm'
import * as schema        from '@/lib/db/schema'

function getAuthDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is required')
  return drizzle(neon(url), { schema })
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(getAuthDb(), {
    usersTable:              schema.users,
    accountsTable:           schema.accounts,
    sessionsTable:           schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),

  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from:   process.env.RESEND_FROM_EMAIL ?? 'Memoriza <noreply@memoriza.app>',
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Sign in to Memoriza</title></head>
<body style="margin:0;padding:0;background:#0A0C10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#131720;border:1px solid #1E2433;border-radius:16px;overflow:hidden;max-width:100%;">
        <tr>
          <td style="padding:28px 40px 24px;border-bottom:1px solid #1E2433;">
            <span style="font-size:20px;font-weight:700;color:#F2F2F5;letter-spacing:-0.5px;">Memoriza</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#F2F2F5;">Sign in to your account</h1>
            <p style="margin:0 0 28px;font-size:15px;color:#9CA3AF;line-height:1.6;">
              Click the button below to sign in. This link expires in 10 minutes.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#6C63FF;border-radius:10px;">
                  <a href="${url}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                    Sign in →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:13px;color:#6B7280;line-height:1.6;">
              Or copy this link:<br/>
              <span style="color:#6C63FF;word-break:break-all;">${url}</span>
            </p>
            <div style="margin:24px 0;height:1px;background:#1E2433;"></div>
            <p style="margin:0;font-size:12px;color:#4B5563;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #1E2433;">
            <p style="margin:0;font-size:12px;color:#4B5563;">Sent by Memoriza</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

        const res = await fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers: { 'Authorization': `Bearer ${provider.apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: provider.from, to: [email], subject: 'Sign in to Memoriza', html }),
        })

        if (!res.ok) throw new Error(`[auth] Resend error: ${await res.text()}`)
      },
    }),
  ],

  pages: {
    signIn: '/sign-in',
    error:  '/sign-in',
    verifyRequest: '/sign-in?verify=1',
  },

  session: { strategy: 'database' },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id   = user.id
        // Fetch role from DB — not stored in Auth.js user by default
        const db = getAuthDb()
        const [row] = await db.select({ role: schema.users.role })
          .from(schema.users)
          .where(eq(schema.users.id, user.id))
          .limit(1)
        session.user.role = row?.role ?? 'user'
      }
      return session
    },
  },
})

declare module 'next-auth' {
  interface Session {
    user: {
      id:    string
      role:  string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
