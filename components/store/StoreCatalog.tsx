'use client'

import { useState } from 'react'
import type { StoreBook, BookCategory } from '@/lib/store/books'
import { BOOK_CATEGORIES } from '@/lib/store/books'
import { SANS_FONT } from '@/lib/typography'
import BookCard from './BookCard'

// Catalog: category filter chips + responsive book grid. Filter is pure
// client state; "Tout" shows everything. The four chips are the canonical
// categories preserved from the prior bientôt cards.

type Filter = BookCategory | 'all'

export default function StoreCatalog({ books }: { books: StoreBook[] }) {
  const [filter, setFilter] = useState<Filter>('all')

  const visible = filter === 'all' ? books : books.filter((b) => b.category === filter)

  const chips: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Tout' },
    ...BOOK_CATEGORIES.map((c) => ({ key: c.key as Filter, label: c.label })),
  ]

  return (
    <div>
      <div
        role="group"
        aria-label="Filtrer par catégorie"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}
      >
        {chips.map((chip) => {
          const active = filter === chip.key
          return (
            <button
              key={chip.key}
              type="button"
              data-testid={`filter-chip-${chip.key}`}
              data-active={active}
              aria-pressed={active}
              onClick={() => setFilter(chip.key)}
              className="ed-btn-press"
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--r-pill)',
                border: `1px solid ${active ? 'var(--text-primary)' : 'var(--rule-default)'}`,
                backgroundColor: active ? 'var(--text-primary)' : 'transparent',
                color: active ? 'var(--paper)' : 'var(--text-secondary)',
                fontFamily: SANS_FONT,
                fontWeight: 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'background-color var(--lm-duration-hover) var(--lm-ease), color var(--lm-duration-hover) var(--lm-ease), border-color var(--lm-duration-hover) var(--lm-ease)',
              }}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      <div
        data-testid="catalog-grid"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        style={{ gap: 24 }}
      >
        {visible.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  )
}
