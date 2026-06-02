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

const LOADER_BG = 'var(--lm-pastel-peach)' // peach, matches /onboarding so the redirect is seamless

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

  return <>{children}</>
}
