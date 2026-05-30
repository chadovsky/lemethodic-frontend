// UI-001–004 — TCF Canada landing: hero, persona-match, 5-couche, pricing + footer.
// PlatformLanding (F-300a multi-surface) preserved at /exam-prep.

import Hero from '@/components/landing/Hero'
import PersonaMatch from '@/components/landing/PersonaMatch'
import MethodologyPreview from '@/components/landing/MethodologyPreview'
import ProductDemo from '@/components/landing/ProductDemo'
import PricingTeaser from '@/components/landing/PricingTeaser'
import Footer from '@/components/landing/Footer'
import AuthRedirect from '@/components/auth/AuthRedirect'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pass TCF Canada. Get to Quebec. | Le Méthodic',
  description:
    'Method-based oral exam prep for anglophone TCF Canada candidates pursuing Quebec PR.',
  alternates: {
    canonical: '/',
  },
}

export default function Home() {
  return (
    <>
      {/* Redirect authenticated users to their dashboard server-side equivalent.
          Client-side only — no httpOnly cookie is exposed to middleware. */}
      <AuthRedirect to="/dashboard" />
      <main className="ed-page-enter">
        <Hero />
        <PersonaMatch />
        <MethodologyPreview />
        <ProductDemo />
        <PricingTeaser />
      </main>
      <Footer />
    </>
  )
}
