// Future structure: post metadata (title, date, category, readingTime) + rich content area
// (MDX or CMS-sourced) + related posts grid at the bottom. Slug → content lookup
// happens here via generateStaticParams once posts exist.
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function BlogPostPage() {
  notFound()
}
