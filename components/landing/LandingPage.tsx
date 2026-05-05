'use client'

// M-101a — landing page orchestrator. Two routes consume this: app/page.tsx
// (lang='en') and app/fr/page.tsx (lang='fr'). Language is URL-derived, never
// localStorage — different from /onboarding's pattern.
//
// Render strategy: the marketing content renders immediately (including
// during SSR), so crawlers, link-preview bots, and JS-disabled clients all
// see the copy. A useEffect-driven auth check redirects already-authenticated
// users to /ecole after hydration. This means logged-in users may briefly
// see the landing before the redirect — acceptable since logged-in traffic
// to the landing is rare and the bounce is fast. The SEO win (full content
// in the first SSR byte) is more valuable than the rare-flicker cost.
//
// Approach A from the M-101a plan: 'use client' wrapping the page so the
// existing localStorage-driven auth check works without moving auth state to
// cookies. We lose RSC-bundle-size savings but ship without touching auth.

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/auth'
import { useVerifyAuth } from '@/hooks/useVerifyAuth'
import LandingHeader from './LandingHeader'
import LandingFooter from './LandingFooter'
import HeroSection from './sections/HeroSection'
import ProblemSection from './sections/ProblemSection'
import DifferentiationSection from './sections/DifferentiationSection'
import HowItWorksSection from './sections/HowItWorksSection'
import PricingSection from './sections/PricingSection'
import MethodologySection from './sections/MethodologySection'
import FAQSection from './sections/FAQSection'
import FinalCTASection from './sections/FinalCTASection'
import type { Lang } from './copy'

// F-200 — landing now uses the editorial system bg (warm off-white).
// The original peach (`#FFD8C2`) was the M-101a hero bg; F-200 retires
// it from the landing in favor of the more restrained `--ed-bg`.
const PAGE_BG = 'var(--ed-bg)'

interface LandingPageProps {
  lang: Lang
}

export default function LandingPage({ lang }: LandingPageProps) {
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
      router.replace('/ecole')
    }
  }, [hydrated, token, verified, router])

  // Sync <html lang> post-hydration so screen readers + DOM-aware tooling
  // see the correct language. SSR emits whatever the root layout sets
  // ('en' by default); the JS-side update fires for /fr after hydration.
  // True per-route SSR lang requires multiple root layouts via route
  // groups (out of scope for M-101a; M-101.x candidate if French SEO
  // underperforms).
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  return (
    <main className="min-h-screen w-full" style={{ backgroundColor: PAGE_BG }}>
      <LandingHeader lang={lang} />
      <HeroSection lang={lang} />
      <ProblemSection lang={lang} />
      <DifferentiationSection lang={lang} />
      <HowItWorksSection lang={lang} />
      <PricingSection lang={lang} />
      <MethodologySection lang={lang} />
      <FAQSection lang={lang} />
      <FinalCTASection lang={lang} />
      <LandingFooter lang={lang} />
    </main>
  )
}
