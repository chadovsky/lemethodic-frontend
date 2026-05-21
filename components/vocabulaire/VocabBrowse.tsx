'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import { CHUNKS } from '@/lib/data/chunks'
import { applyFilters, DEFAULT_FILTER_STATE, type VocabFilterState } from '@/lib/vocab/filter'
import FilterBar from './FilterBar'
import ChunkRow from './ChunkRow'
import EmptyState from './EmptyState'

export default function VocabBrowse() {
  const [filterState, setFilterState] = useState<VocabFilterState>(DEFAULT_FILTER_STATE)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filtered = applyFilters(CHUNKS, filterState)
  const resetFilters = () => setFilterState(DEFAULT_FILTER_STATE)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 8 }}>
      <header
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 auto' }}>
          <h1
            style={{
              fontFamily: SERIF_FONT,
              fontStyle: 'italic',
              fontWeight: 500,
              fontSize: 'clamp(32px, 4vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Le Vocabulaire
          </h1>
          <p
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 500,
              fontSize: '1rem',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            Les chunks qui font la différence.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <Link
            data-testid="vocab-cta-practice"
            href="/vocabulaire/practice"
            className="ed-btn-press"
            style={{
              minHeight: 44,
              padding: '10px 18px',
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--bg-elevated)',
              backgroundColor: 'var(--cta-primary)',
              border: '1px solid var(--cta-primary)',
              borderRadius: 4,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Pratiquer
          </Link>
        </div>
      </header>

      <button
        type="button"
        data-testid="vocab-mobile-filters-toggle"
        aria-expanded={mobileFiltersOpen}
        aria-controls="vocab-filter-bar-wrapper"
        onClick={() => setMobileFiltersOpen((v) => !v)}
        className="ed-btn-press vocab-mobile-filters-toggle"
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '0.875rem',
          color: 'var(--text-primary)',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--rule-default)',
          padding: '10px 14px',
          borderRadius: 4,
          cursor: 'pointer',
          alignSelf: 'flex-start',
        }}
      >
        Filtres {mobileFiltersOpen ? '▲' : '▼'}
      </button>

      <div
        id="vocab-filter-bar-wrapper"
        className="vocab-filter-bar-wrapper"
        data-mobile-open={mobileFiltersOpen}
      >
        <FilterBar state={filterState} onChange={setFilterState} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState onReset={resetFilters} />
      ) : (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {filtered.map((chunk) => (
            <ChunkRow key={chunk.id} chunk={chunk} />
          ))}
        </ul>
      )}
    </div>
  )
}
