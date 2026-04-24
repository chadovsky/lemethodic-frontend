'use client'

// Root route. Auth-aware:
//   - authenticated + token verified → replace to /raccourci
//   - authenticated but token is stale → useVerifyAuth clears it, we render
//     onboarding on the next tick (no detour through /raccourci)
//   - unauthenticated → render the onboarding flow
//
// Everything downstream (protected routes) uses <ProtectedRoute>; this page
// is the inverse — the one place where an unauthenticated user is the
// expected audience. We still run useVerifyAuth here so a stale localStorage
// token gets cleared without bouncing through /raccourci first.

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'
import { useVerifyAuth } from '@/hooks/useVerifyAuth'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

const LOADER_BG = '#FFD8C2'

export default function Home() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)
  const verified = useAuthStore((s) => s.verified)

  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])

  useVerifyAuth()

  useEffect(() => {
    if (hydrated && token && verified) {
      router.replace('/raccourci')
    }
  }, [hydrated, token, verified, router])

  // Show the loader while: (a) pre-hydration, (b) we have a token that's
  // still being verified, or (c) verification passed and we're about to
  // redirect. Only render OnboardingFlow once we're sure there's no valid
  // session.
  if (!hydrated) return <div style={{ minHeight: '100dvh', backgroundColor: LOADER_BG }} />
  if (token) return <div style={{ minHeight: '100dvh', backgroundColor: LOADER_BG }} />

  // Note on resume-from-step: OnboardingFlow now writes each selection into
  // useOnboardingStore, but the individual step components don't accept an
  // initialValue prop yet, so the store data isn't read back on mount.
  // Resume-from-step is a follow-up ticket.
  return <OnboardingFlow />
}
