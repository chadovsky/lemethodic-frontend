'use client'

// P-222 — submit response store. Captures the BE OnboardingSubmitResponse +
// the q1/q2 answers at submit time so the waitlist screen can render without
// a /me round-trip. The onboarding store gets reset right after submit; this
// store holds the cross-route handoff between /signup and
// /onboarding/waitlist.
//
// Persisted to localStorage so a refresh on the waitlist page survives. Call
// clear() once the user acknowledges the waitlist (or routes off it) so the
// data doesn't linger across sessions.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OnboardingSubmitResponse } from './onboarding-questions'
import { SUBMIT_RESPONSE_KEY } from './storage-keys'

interface SubmitResponseState {
  response: OnboardingSubmitResponse | null
  // q1 + q2 answers captured before useOnboardingStore.reset() runs. Used by
  // the waitlist screen to display the user's self-reported level + target
  // without a /me call.
  currentLevelAtSubmit: string | null
  targetLevelAtSubmit: string | null
  setSubmitContext: (
    response: OnboardingSubmitResponse,
    currentLevel: string | null,
    targetLevel: string | null,
  ) => void
  clear: () => void
}

export const useSubmitResponseStore = create<SubmitResponseState>()(
  persist(
    (set) => ({
      response: null,
      currentLevelAtSubmit: null,
      targetLevelAtSubmit: null,
      setSubmitContext: (response, currentLevel, targetLevel) =>
        set({
          response,
          currentLevelAtSubmit: currentLevel,
          targetLevelAtSubmit: targetLevel,
        }),
      clear: () => {
        set({
          response: null,
          currentLevelAtSubmit: null,
          targetLevelAtSubmit: null,
        })
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem(SUBMIT_RESPONSE_KEY)
          } catch {
            // privacy mode / quota — ignore
          }
        }
      },
    }),
    {
      name: SUBMIT_RESPONSE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined'
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
    },
  ),
)
