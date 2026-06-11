import Link from 'next/link'
import type { StoreBook } from '@/lib/store/books'
import { formatPrice } from '@/lib/store/books'
import { SANS_FONT } from '@/lib/typography'
import BookCover from './BookCover'

// Catalog grid card: cover, title, category-agnostic author line, price.
// The whole card is a link to the detail page. Hover lift via .ed-card-lift.

const CATEGORY_LABELS: Record<string, string> = {
  livres: 'Livres',
  audio: 'Audio',
  telechargements: 'Téléchargements',
  'ressources-gratuites': 'Ressources gratuites',
}

export default function BookCard({ book }: { book: StoreBook }) {
  return (
    <Link
      href={`/librairie/${book.slug}`}
      data-testid={`book-card-${book.slug}`}
      className="ed-card-lift"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: 16,
        textDecoration: 'none',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 'var(--r-md)',
      }}
    >
      <BookCover book={book} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.625rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {CATEGORY_LABELS[book.category]}
        </span>
        <span
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.9375rem',
            lineHeight: 1.3,
            color: 'var(--text-primary)',
          }}
        >
          {book.title}
        </span>
        <span
          data-testid={`book-price-${book.slug}`}
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: book.priceCents === 0 ? 'var(--text-secondary)' : 'var(--accent)',
            marginTop: 2,
          }}
        >
          {formatPrice(book.priceCents, book.currency)}
        </span>
      </div>
    </Link>
  )
}
