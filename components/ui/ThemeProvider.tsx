'use client'
// components/ui/ThemeProvider.tsx
// Reads system preference on first visit, persists user choice to localStorage.
// Applies/removes 'dark' class on <html>. Uses suppressHydrationWarning on <html>
// (set in layout.tsx) so the brief class mismatch doesn't cause React errors.

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme:       Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:       'dark',
  toggleTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark') // SSR default = dark

  useEffect(() => {
    // After hydration, read real preference
    const stored  = localStorage.getItem('memoriza-theme') as Theme | null
    const system  = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const resolved = stored ?? system
    setTheme(resolved)
    applyTheme(resolved)
  }, [])

  function applyTheme(t: Theme) {
    const root = document.documentElement
    t === 'dark' ? root.classList.add('dark') : root.classList.remove('dark')
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
    localStorage.setItem('memoriza-theme', next)
  }

  // Always render children — suppressHydrationWarning on <html> handles the
  // brief class mismatch between SSR (dark) and client (user preference).
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
