// app/layout.tsx
import type { Metadata }    from 'next'
import { SessionProvider }  from 'next-auth/react'
import { DM_Sans, Syne, JetBrains_Mono, Instrument_Serif } from 'next/font/google'
import { ThemeProvider }    from '@/components/ui/ThemeProvider'
import { Navbar }           from '@/components/ui/Navbar'
import './globals.css'

const dmSans          = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const syne            = Syne({ subsets: ['latin'], variable: '--font-syne', display: 'swap' })
const jetbrainsMono   = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' })
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: ['400'], variable: '--font-instrument-serif', display: 'swap' })

export const metadata: Metadata = {
  title:       'Memoriza — Share the moment',
  description: 'Create a beautiful shareable countdown to any event.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://memoriza.vercel.app'),
  openGraph: {
    title:       'Memoriza — Share the moment',
    description: 'Create a beautiful shareable countdown to any event.',
    type:        'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${dmSans.variable} ${syne.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <SessionProvider>
          <ThemeProvider>
            <Navbar />
            <div className="pt-14">{children}</div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
