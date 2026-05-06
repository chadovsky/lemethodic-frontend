// F-300b — French exam-prep landing. Mirrors app/exam-prep/page.tsx
// with lang='fr' and French <head> metadata.

import LandingPage from '@/components/landing/LandingPage'
import { META } from '@/components/landing/copy'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: META.fr.title,
  description: META.fr.description,
  alternates: {
    canonical: '/fr/exam-prep',
    languages: {
      en: '/exam-prep',
      fr: '/fr/exam-prep',
    },
  },
}

export default function ExamPrepFr() {
  return <LandingPage lang="fr" />
}
