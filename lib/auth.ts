'use client'

// Auth store. Token + user, persisted to localStorage so refresh survives.
// The API client (lib/api.ts) reads the token directly from the
// "fluentpath_token" key, so setAuth / clearAuth must keep that key in sync.

import { create } from 'zustand'
import type { User } from './types'

const TOKEN_KEY = 'fluentpath_token'
const USER_KEY = 'fluentpath_user'

interface AuthState {
  token: string | null
  user: User | null
  hydrated: boolean
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  hydrate: () => void
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

  setAuth: (token, user) => {
    safeSet(TOKEN_KEY, token)
    safeSet(USER_KEY, JSON.stringify(user))
    set({ token, user, hydrated: true })
  },

  clearAuth: () => {
    safeRemove(TOKEN_KEY)
    safeRemove(USER_KEY)
    set({ token: null, user: null, hydrated: true })
  },

  // Components call this from a useEffect on first mount so we don't touch
  // localStorage during SSR. Safe to call repeatedly.
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
}))
