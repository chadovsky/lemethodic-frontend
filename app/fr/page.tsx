// M-101a — French landing route. Mirrors app/page.tsx with lang='fr' and
// French <head> metadata. The hreflang alternates are emitted symmetrically
// so Google sees both URLs as canonical for their respective languages.

import LandingPage from '@/components/landing/LandingPage'
import { META } from '@/components/landing/copy'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: META.fr.title,
  description: META.fr.description,
  alternates: {
    canonical: '/fr',
    languages: {
      en: '/',
      fr: '/fr',
    },
  },
}

export default function HomeFr() {
  return <LandingPage lang="fr" />
}
