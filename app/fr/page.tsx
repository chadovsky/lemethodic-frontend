// F-300a — French root route. Mirrors app/page.tsx with lang='fr' and
// French <head> metadata. The TCF/TEF/DELF funnel content moved to
// /fr/exam-prep in F-300b.

import PlatformLanding from '@/components/landing/PlatformLanding'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Le Méthodic | Plateforme de français pour anglophones',
  description:
    'La méthode, les examens, les livres, pensés pour les anglophones. Parcours basé sur diagnostic pour le TCF · TEF · DELF · DALF, plus une bibliothèque croissante de livres de méthode et ressources gratuites.',
  alternates: {
    canonical: '/fr',
    languages: {
      'x-default': '/',
      en: '/',
      fr: '/fr',
    },
  },
}

export default function HomeFr() {
  return <PlatformLanding lang="fr" />
}
