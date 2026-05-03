// B-102 — /privacy. Renders docs/privacy-policy.md.

import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy — LeMethodic',
  description: 'How LeMethodic collects, uses, and shares your personal information.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return <LegalPage docFile="privacy-policy.md" />
}
