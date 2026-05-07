// V-016g — /library stub. F-300a links here from the platform landing
// product cards + footer; F-300c will populate the real catalog. Until
// then this page replaces the prod console 404 (was being prefetched
// from the landing) with a valid empty-state surface.

import LibraryStub from '@/components/library/LibraryStub'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Library | LeMethodic',
  description:
    'Method books, exam prep PDFs, and free resources for English speakers learning French. Catalog launching soon.',
  alternates: {
    canonical: '/library',
    languages: {
      en: '/library',
      fr: '/fr/library',
    },
  },
}

export default function LibraryPage() {
  return <LibraryStub lang="en" />
}
