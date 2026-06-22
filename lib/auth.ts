'use client'

// Auth store. Token + user, persisted to localStorage so refresh survives.
// The API client (lib/api.ts) reads the token directly from the
// "lemethodic_token" key, so setAuth / clearAuth must keep that key in sync.

import { create } from 'zustand'
import type { User } from './types'
import { TOKEN_KEY, USER_KEY } from './storage-keys'

interface AuthState {
  token: string | null
  user: User | null
  // hydrated: we've read localStorage (may or may not have found a token).
  // verified: we've talked to the backend in this session and confirmed the
  //   token is still good (or accepted it optimistically after a non-401
  //   failure like a network drop). Required before rendering any protected
  //   content so a stale localStorage token can't leak someone else's UI.
  hydrated: boolean
  verified: boolean
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  hydrate: () => void
  markVerified: () => void
}

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // quota / privacy-mode — ignore
  }
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  verified: false,

  // Fresh credentials arriving from login/register/complete-onboarding are
  // known-good by construction — mark verified immediately.
  setAuth: (token, user) => {
    safeSet(TOKEN_KEY, token)
    safeSet(USER_KEY, JSON.stringify(user))
    set({ token, user, hydrated: true, verified: true })
  },

  clearAuth: () => {
    safeRemove(TOKEN_KEY)
    safeRemove(USER_KEY)
    set({ token: null, user: null, hydrated: true, verified: false })
  },

  // Components call this from a useEffect on first mount so we don't touch
  // localStorage during SSR. Safe to call repeatedly. Does NOT mark the token
  // verified — that requires a round-trip to /api/auth/me (see useVerifyAuth).
  hydrate: () => {
    const token = safeGet(TOKEN_KEY)
    const userRaw = safeGet(USER_KEY)
    let user: User | null = null
    if (userRaw) {
      try {
        user = JSON.parse(userRaw) as User
      } catch {
        user = null
      }
    }
    set({ token, user, hydrated: true })
  },

  // Called from useVerifyAuth after a non-401 failure (network, 5xx) — we
  // can't confirm the token but we accept it locally so the user isn't
  // locked out. A subsequent API 401 will still auto-clear via lib/api.
  markVerified: () => set({ verified: true }),
}))

// F-222 — canonical sign-out helper. Clears all FE-side persisted state
// (auth + onboarding answers + waitlist response) so a subsequent sign-in
// starts fresh, then routes to landing. Use from any surface that exposes
// a "Sign out" affordance.
//
// F-482 — sign-out now does a FULL-PAGE navigation (window.location.assign),
// not a client-side router.push. A push would leave the authed dark session's
// .dark class on <html> as the user lands on the (marketing) landing page,
// rendering it dark. A full load triggers a fresh server render plus the
// pre-paint theme script in app/layout.tsx, which strips .dark for the marketing
// path. The router argument is gone; callers now invoke signOut() with no args.

import { useOnboardingStore } from './onboarding'
import { useSubmitResponseStore } from './submitResponse'

export function signOut(): void {
  useAuthStore.getState().clearAuth()
  useOnboardingStore.getState().reset()
  useSubmitResponseStore.getState().clear()
  if (typeof window !== 'undefined') {
    window.location.assign('/')
  }
}
