// M-101a — root route is the English landing page. Auth check + redirect to
// /ecole live inside <LandingPage /> so the same component handles both
// app/page.tsx (lang=en) and app/fr/page.tsx (lang=fr). Onboarding moved to
// /onboarding (a dedicated route that already existed as a duplicate entry).

import LandingPage from '@/components/landing/LandingPage'
import { META } from '@/components/landing/copy'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: META.en.title,
  description: META.en.description,
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      fr: '/fr',
    },
  },
}

export default function Home() {
  return <LandingPage lang="en" />
}
