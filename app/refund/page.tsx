// B-102 — /refund. Renders docs/refund-policy.md.

import type { Metadata } from 'next'
import LegalPage from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Refund Policy — LeMethodic',
  description: 'When and how you can request a refund for LeMethodic purchases.',
  alternates: { canonical: '/refund' },
}

export default function RefundPage() {
  return <LegalPage docFile="refund-policy.md" />
}
