// F-300a — root route is now the platform-level landing. The previous
// TCF/TEF/DELF funnel content moved to /exam-prep in F-300b.

import PlatformLanding from '@/components/landing/PlatformLanding'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LeMethodic | French learning platform for English speakers',
  description:
    'The method, the exams, the books — built for English speakers. Diagnostic-driven path on TCF · TEF · DELF · DALF, plus a growing library of method books and free resources.',
  alternates: {
    canonical: '/',
    languages: {
      en: '/',
      fr: '/fr',
    },
  },
}

export default function Home() {
  return <PlatformLanding lang="en" />
}
