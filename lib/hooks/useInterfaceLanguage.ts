'use client'

// F-080c — interface-language hook for FR/EN/ES field selection on the
// diagnostic page (and any future surface that renders multi-language
// authored content). Pulls from useAuthStore.user.interfaceLanguage and
// falls back to 'en' when missing/unrecognized.
//
// Backend persists `interface_language` on the User row (set during
// onboarding via mapOnboardingToBackend). The auth-store user shape
// surfaces it as `interfaceLanguage`. ES is recognized but the V1 module
// authoring pipeline only ships FR + EN content — components consuming
// this hook should fall back to 'en' for 'es' users until ES authoring
// lands.

import { useAuthStore } from '@/lib/auth'

export type InterfaceLanguage = 'en' | 'fr' | 'es'

const SUPPORTED: ReadonlySet<string> = new Set(['en', 'fr', 'es'])

export function useInterfaceLanguage(): InterfaceLanguage {
  const raw = useAuthStore((s) => s.user?.interfaceLanguage)
  if (typeof raw === 'string' && SUPPORTED.has(raw)) {
    return raw as InterfaceLanguage
  }
  return 'en'
}
