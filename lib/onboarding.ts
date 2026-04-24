'use client'

// Onboarding store. Holds the user's answers across the 6 onboarding screens
// before they've signed up — FluentPath onboards anonymously then commits to
// the backend at the paywall.
//
// Persisted to localStorage key "fluentpath_onboarding" so a refresh mid-flow
// doesn't wipe progress. Call reset() after api.users.completeOnboarding()
// succeeds.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OnboardingData } from './types'

interface OnboardingState {
  data: Partial<OnboardingData>
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      data: {},
      setField: (key, value) =>
        set((state) => ({ data: { ...state.data, [key]: value } })),
      reset: () => {
        set({ data: {} })
        // Persist middleware would rewrite the key with {data: {}}; drop the
        // localStorage entry entirely so a reset leaves no trace and any
        // subsequent setField creates a fresh record.
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem('fluentpath_onboarding')
          } catch {
            // privacy mode / quota — ignore
          }
        }
      },
    }),
    {
      name: 'fluentpath_onboarding',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.localStorage
          : // no-op storage for SSR
            {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
    },
  ),
)
