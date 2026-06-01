// V-016g — /fr/library stub. Mirrors app/library/page.tsx with FR copy.

import LibraryStub from '@/components/library/LibraryStub'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bibliothèque | Le Méthodic',
  description:
    "Livres de méthode, PDF de préparation aux examens, ressources gratuites pour anglophones apprenant le français. Catalogue à venir bientôt.",
  alternates: {
    canonical: '/fr/library',
    languages: {
      'x-default': '/library',
      en: '/library',
      fr: '/fr/library',
    },
  },
}

export default function LibraryPageFr() {
  return <LibraryStub lang="fr" />
}
