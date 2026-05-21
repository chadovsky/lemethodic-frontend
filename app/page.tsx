// UI-001 — landing page hero. TCF Canada single-purpose hero shell.
// PlatformLanding (F-300a multi-surface) preserved at /exam-prep.

import Hero from '@/components/landing/Hero'
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
  return <Hero />
}
