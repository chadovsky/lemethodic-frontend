'use client'

// Gate wrapper for authenticated-only routes. Redirects to "/" when the auth
// store hydrates without a token (or when a token that was present turns out
// to be stale and is cleared by lib/api.ts on a 401). Use it at the top of
// any protected page:
//
//   <ProtectedRoute><Whatever /></ProtectedRoute>
//
// The loader frame is deliberately content-free — no header, no shell, no
// mock data — so unauthenticated users never see a glimpse of the app.
//
// Three states the user can be in while this component runs:
//   1. not hydrated yet                        → loader
//   2. hydrated, no token                      → loader + effect redirects
//   3. hydrated, token, but not yet verified   → loader, verify call in-flight
//   4. hydrated, token, verified               → render children
// Only state (4) reveals the children, which closes the stale-token flash.

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'
import { useVerifyAuth } from '@/hooks/useVerifyAuth'
import { ThemeProvider } from '@/components/ThemeProvider'

// F-474 — matches the destination canvas (--bg-canvas, #EAEFF3) so the auth
// gate doesn't flash peach before the app surface paints behind it.
const LOADER_BG = 'var(--bg-canvas)'

export default function ProtectedRoute({
  children,
  redirectTo = '/',
}: {
  children: ReactNode
  redirectTo?: string
}) {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)
  const verified = useAuthStore((s) => s.verified)

  // Kick off store rehydration once on mount. Idempotent — safe if the store
  // was already hydrated by a sibling route earlier in the session.
  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])

  // Verify the local token against /api/auth/me on first mount with a token.
  // No-op if already verified this session.
  useVerifyAuth()

  useEffect(() => {
    if (hydrated && !token) {
      router.replace(redirectTo)
    }
  }, [hydrated, token, router, redirectTo])

  if (!hydrated || !token || !verified) {
    return <div style={{ minHeight: '100dvh', backgroundColor: LOADER_BG }} />
  }

  // F-481 — dark mode is an authenticated-only capability (the ThemeToggle lives
  // in the app shell, reachable only when signed in). Mounting the next-themes
  // provider here, at the single auth gate, scopes the theme to every authed
  // surface at once: the (app) shell and the standalone authed routes that wrap
  // ProtectedRoute directly (/bienvenue, /more, /la-methode/intro, ...). Every
  // logged-out / marketing surface mounts no provider, so the .dark class is
  // never applied there and it renders the v3 light palette by construction,
  // ignoring the OS color scheme with no flash. (The /dev token galleries get
  // their own scoped provider in app/dev/layout.tsx since they are not authed.)
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  )
}
