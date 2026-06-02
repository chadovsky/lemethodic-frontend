// Future structure: pattern header (term + phonetics), why-it-happens section,
// correct-form block with examples, audio clips (Le Maître), related pièges grid.
// Slug → piège lookup happens here via generateStaticParams once entries are authored.
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function PiegeSlugPage() {
  notFound()
}
