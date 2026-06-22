import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/ThemeProvider'

// F-481 — the global next-themes provider was removed from the root layout so
// marketing / logged-out surfaces are locked to the v3 light palette. The /dev
// token galleries (/dev/molds, /dev/bientot) exist precisely to preview the
// design system in BOTH light and dark, so they keep a scoped provider here.
// Rendered in a server layout, its pre-paint script applies the theme before
// first paint (no flash), and the scope never reaches any marketing surface.
export const metadata = {
  robots: { index: false, follow: false },
}

export default function DevLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
