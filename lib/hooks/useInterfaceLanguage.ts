'use client'

// F-080c — interface-language hook for FR/EN field selection on the
// diagnostic page (and any future surface that renders multi-language
// authored content). Pulls from useAuthStore.user.interfaceLanguage and
// falls back to 'en' when missing/unrecognized.
//
// P-220 — narrowed from {en,fr,es} to {en,fr}. The 'es' option was a
// pre-pivot relic; the BE only persists en/fr now.

import { useAuthStore } from '@/lib/auth'

export type InterfaceLanguage = 'en' | 'fr'

const SUPPORTED: ReadonlySet<string> = new Set(['en', 'fr'])

export function useInterfaceLanguage(): InterfaceLanguage {
  const raw = useAuthStore((s) => s.user?.interfaceLanguage)
  if (typeof raw === 'string' && SUPPORTED.has(raw)) {
    return raw as InterfaceLanguage
  }
  return 'en'
}
