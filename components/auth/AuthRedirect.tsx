'use client'

// Thin client guard that redirects authenticated users away from the given
// route. Renders null — no UI. Pattern mirrors ProtectedRoute but inverted:
// hydrated + token → replace(to). Unauthenticated users are unaffected.
//
// Note: auth is localStorage-only (no httpOnly session cookie exposed to
// Next.js middleware), so the redirect is client-side. Authenticated users
// see one render of the parent page before the replace fires — unavoidable
// without a server-accessible session signal. Flash is imperceptible because
// localStorage.getItem() is synchronous and hydrate() resolves in the same
// microtask queue flush as the first effect.

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'

interface AuthRedirectProps {
  to: string
}

export default function AuthRedirect({ to }: AuthRedirectProps) {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)
  const hydrated = useAuthStore((s) => s.hydrated)

  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])

  useEffect(() => {
    if (hydrated && token) {
      router.replace(to)
    }
  }, [hydrated, token, router, to])

  return null
}
