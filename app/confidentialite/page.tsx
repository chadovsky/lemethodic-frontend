// F-370 — /confidentialite. Renders docs/privacy-policy.md.

import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Le Méthodic',
  description: 'Comment Le Méthodic collecte, utilise et partage vos données personnelles.',
  alternates: { canonical: '/confidentialite' },
}

export default function ConfidentialitePage() {
  return <LegalPage docFile="privacy-policy.md" />
}
