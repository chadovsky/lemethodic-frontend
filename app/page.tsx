// UI-001–004 — TCF Canada landing: hero, persona-match, 5-couche, pricing + footer.
// PlatformLanding (F-300a multi-surface) preserved at /exam-prep.

import Hero from '@/components/landing/Hero'
import PersonaMatch from '@/components/landing/PersonaMatch'
import MethodologyPreview from '@/components/landing/MethodologyPreview'
import PricingTeaser from '@/components/landing/PricingTeaser'
import Footer from '@/components/landing/Footer'
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
      <main className="ed-page-enter">
        <Hero />
        <PersonaMatch />
        <MethodologyPreview />
        <PricingTeaser />
      </main>
      <Footer />
    </>
  )
}
