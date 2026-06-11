import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BOOKS, getBookBySlug, formatPrice } from '@/lib/store/books'
import { DISPLAY_FONT, SANS_FONT } from '@/lib/typography'
import BookCover from '@/components/store/BookCover'
import AddToCartButton from '@/components/store/AddToCartButton'

const CATEGORY_LABELS: Record<string, string> = {
  livres: 'Livres',
  audio: 'Audio',
  telechargements: 'Téléchargements',
  'ressources-gratuites': 'Ressources gratuites',
}

export function generateStaticParams() {
  return BOOKS.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const book = getBookBySlug(slug)
  if (!book) return { title: 'La Librairie | Le Méthodic' }
  return {
    title: `${book.title} | La Librairie | Le Méthodic`,
    description: book.description.slice(0, 160),
  }
}

export default async function BookDetailPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const book = getBookBySlug(slug)
  if (!book) notFound()

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 'clamp(32px, 6vw, 64px) clamp(24px, 5vw, 80px) 96px',
      }}
    >
      <Link
        href="/librairie"
        style={{
          display: 'inline-block',
          fontFamily: SANS_FONT,
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          marginBottom: 'clamp(24px, 4vw, 40px)',
        }}
      >
        ← La Librairie
      </Link>

      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ gap: 'clamp(32px, 5vw, 64px)', alignItems: 'start' }}
      >
        {/* Cover */}
        <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>
          <BookCover book={book} size="detail" />
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.6875rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: 12,
            }}
          >
            {CATEGORY_LABELS[book.category]}
          </span>

          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 'clamp(1.875rem, 4vw, 2.75rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: '0 0 8px',
            }}
          >
            {book.title}
          </h1>

          <p
            style={{
              fontFamily: SANS_FONT,
              fontSize: '0.9375rem',
              color: 'var(--text-secondary)',
              margin: '0 0 24px',
            }}
          >
            {book.author}
          </p>

          <p
            data-testid="detail-price"
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
              fontWeight: 400,
              color: book.priceCents === 0 ? 'var(--text-primary)' : 'var(--accent)',
              margin: '0 0 28px',
            }}
          >
            {formatPrice(book.priceCents, book.currency)}
          </p>

          <p
            style={{
              fontFamily: SANS_FONT,
              fontSize: '1.0625rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              margin: '0 0 36px',
              maxWidth: 520,
            }}
          >
            {book.description}
          </p>

          <div>
            <AddToCartButton book={book} />
          </div>
        </div>
      </div>
    </main>
  )
}
