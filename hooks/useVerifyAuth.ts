'use client'

// Verify the persisted auth token against the backend on first mount.
//
// The store's `hydrated` flag only tells us "we read localStorage"; it says
// nothing about whether the token we found is still valid. A stale token (user
// deleted, JWT expired, someone else's session left over in an InPrivate
// window, etc.) would otherwise let protected routes render real content
// briefly before the first API call fails.
//
// This hook closes that gap: on mount, once hydrated and with a token but not
// yet verified, it calls /api/auth/me. A successful response refreshes the
// stored user (useful since login/register return a stripped-down shape) and
// sets `verified: true`. A 401 is already handled inside lib/api.ts, which
// auto-clears the store — that flip triggers ProtectedRoute's redirect
// elsewhere. Anything else (network error, 5xx) is treated optimistically:
// we don't know if the token is valid, but we don't want to lock the user
// out either, so we mark verified and let the next real API call sort it out.
//
// Idempotent: the verify call only runs once per session because `verified`
// stays true until explicit clearAuth.

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/auth'
import { api, ApiError } from '@/lib/api'

export function useVerifyAuth(): void {
  const hydrated = useAuthStore((s) => s.hydrated)
  const token = useAuthStore((s) => s.token)
  const verified = useAuthStore((s) => s.verified)

  useEffect(() => {
    if (!hydrated || !token || verified) return
    let cancelled = false

    api.users
      .getMe()
      .then((user) => {
        if (cancelled) return
        // Re-seat through setAuth so we both refresh the user payload (picks
        // up onboarding fields that login/register don't return) and set
        // verified=true in one transition.
        const currentToken = useAuthStore.getState().token
        if (currentToken) {
          useAuthStore.getState().setAuth(currentToken, user)
        }
      })
      .catch((err) => {
        if (cancelled) return
        // 401: lib/api.ts already called clearAuth. Nothing else to do.
        if (err instanceof ApiError && err.status === 401) return
        // Anything else — trust the local token so we don't strand an
        // authenticated user over a transient backend problem.
        useAuthStore.getState().markVerified()
      })

    return () => {
      cancelled = true
    }
  }, [hydrated, token, verified])
}
