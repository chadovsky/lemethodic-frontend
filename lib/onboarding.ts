'use client'

// Onboarding store (P-220). Holds the user's answers across the BE-driven
// questionnaire, plus the current step pointer (so refresh-mid-flow resumes at
// the right question) and the chosen interface language (en/fr toggle in the
// onboarding header).
//
// Persisted to localStorage key "lemethodic_onboarding". Call reset() after
// api.onboarding.submit() succeeds.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { OnboardingAnswer, OnboardingData, UiLanguage } from './types'
import { ONBOARDING_KEY } from './storage-keys'

interface OnboardingState {
  data: OnboardingData
  currentStepIndex: number
  interfaceLanguage: UiLanguage
  // F-327 — another_exam waitlist-moat fields. specificIntendedExam is
  // written by ExamPickerQuestion when the user types a free-text exam name.
  // acceptFallback is set by WaitlistOrProxyConfirmation before submit.
  specificIntendedExam: string | null
  acceptFallback: boolean
  setAnswer: (questionId: string, value: OnboardingAnswer) => void
  setStep: (i: number) => void
  setLanguage: (lang: UiLanguage) => void
  setSpecificIntendedExam: (v: string | null) => void
  setAcceptFallback: (v: boolean) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      data: {},
      currentStepIndex: 0,
      interfaceLanguage: 'en',
      specificIntendedExam: null,
      acceptFallback: false,
      setAnswer: (questionId, value) =>
        set((state) => ({ data: { ...state.data, [questionId]: value } })),
      setStep: (i) => set({ currentStepIndex: Math.max(0, i) }),
      setLanguage: (lang) => set({ interfaceLanguage: lang }),
      setSpecificIntendedExam: (v) => set({ specificIntendedExam: v }),
      setAcceptFallback: (v) => set({ acceptFallback: v }),
      reset: () => {
        set({
          data: {},
          currentStepIndex: 0,
          interfaceLanguage: 'en',
          specificIntendedExam: null,
          acceptFallback: false,
        })
        // Persist middleware would rewrite the key with the cleared state;
        // drop the localStorage entry entirely so a reset leaves no trace.
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem(ONBOARDING_KEY)
          } catch {
            // privacy mode / quota — ignore
          }
        }
      },
    }),
    {
      name: ONBOARDING_KEY,
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
