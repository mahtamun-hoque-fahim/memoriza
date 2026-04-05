// app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />
      <div className="relative z-10">
        <SignUp
          appearance={{
            variables: {
              colorPrimary:         '#6C63FF',
              colorBackground:      '#131720',
              colorText:            '#F2F2F5',
              colorInputText:       '#F2F2F5',
              colorInputBackground: '#0A0C10',
              borderRadius:         '12px',
              fontFamily:           'var(--font-dm-sans)',
            },
            elements: {
              card:              'border border-[#1E2433] shadow-none',
              headerTitle:       'font-syne',
              formButtonPrimary: 'bg-[#6C63FF] hover:bg-[#5a52e0]',
            },
          }}
        />
      </div>
    </main>
  )
}
