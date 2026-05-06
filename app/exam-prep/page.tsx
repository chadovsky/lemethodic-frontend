// F-300b — preserved exam-prep landing. Verbatim copy of the pre-F-300a
// root route (English). The LandingPage component is unchanged; this
// route holds the exam-prep funnel content while / pivots to a
// platform-level landing in F-300a.

import LandingPage from '@/components/landing/LandingPage'
import { META } from '@/components/landing/copy'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: META.en.title,
  description: META.en.description,
  alternates: {
    canonical: '/exam-prep',
    languages: {
      en: '/exam-prep',
      fr: '/fr/exam-prep',
    },
  },
}

export default function ExamPrepEn() {
  return <LandingPage lang="en" />
}
