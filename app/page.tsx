// UI-001–004 — TCF Canada landing: hero, persona-match, 5-couche, pricing + footer.
// PlatformLanding (F-300a multi-surface) preserved at /exam-prep.

import Hero from '@/components/landing/Hero'
import PersonaMatch from '@/components/landing/PersonaMatch'
import MethodologyPreview from '@/components/landing/MethodologyPreview'
import ProductDemo from '@/components/landing/ProductDemo'
import PricingTeaser from '@/components/landing/PricingTeaser'
import Footer from '@/components/landing/Footer'
import AuthRedirect from '@/components/auth/AuthRedirect'
import { OrganizationJsonLd, CourseJsonLd, FaqJsonLd } from '@/components/seo/JsonLd'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Le Méthodic | Learn French that sounds native',
  description:
    'A grammar-first method for anglophones learning French, built by the author of 28 French linguistics books.',
  alternates: {
    canonical: '/',
    languages: {
      'x-default': '/',
      en: '/',
      fr: '/fr',
    },
  },
}

export default function Home() {
  return (
    <>
      <OrganizationJsonLd />
      <CourseJsonLd />
      <FaqJsonLd />
      {/* Redirect authenticated users to their dashboard server-side equivalent.
          Client-side only — no httpOnly cookie is exposed to middleware. */}
      <AuthRedirect to="/tableau-de-bord" />
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
