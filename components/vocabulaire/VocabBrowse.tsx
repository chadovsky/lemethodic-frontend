'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import { applyLocalFilters, DEFAULT_FILTER_STATE, type VocabFilterState } from '@/lib/vocab/filter'
import { buildChunkParams } from '@/lib/vocab/params'
import { useChunks } from '@/lib/hooks/useChunks'
import FilterBar from './FilterBar'
import ChunkRow from './ChunkRow'
import EmptyState from './EmptyState'

export default function VocabBrowse() {
  const [filterState, setFilterState] = useState<VocabFilterState>(DEFAULT_FILTER_STATE)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const { chunks: allChunks, isLoading, total } = useChunks()

  const params = buildChunkParams(filterState)
  const filtered = params === null ? [] : applyLocalFilters(allChunks, filterState)
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
              fontWeight: 500,
              fontSize: 'clamp(32px, 4vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            La Bibliothèque
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
          <span
            data-testid="vocab-count-badge"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
              color: 'var(--text-muted)',
            }}
          >
            {total} chunks
          </span>
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
            href="/la-bibliotheque/practice"
            className="ed-btn-press"
            style={{
              minHeight: 44,
              padding: '10px 18px',
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--bg-elevated)',
              backgroundColor: 'var(--cta-utility)',
              border: '1px solid var(--cta-utility)',
              borderRadius: 4,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Pratiquer
          </Link>
          <Link
            data-testid="vocab-cta-test"
            href="/la-bibliotheque/test"
            className="ed-btn-press"
            style={{
              minHeight: 44,
              padding: '10px 18px',
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              backgroundColor: 'transparent',
              border: '1px solid var(--rule-default)',
              borderRadius: 4,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            Tester
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
          minHeight: 44,
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

      {isLoading ? (
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
          {Array.from({ length: 8 }, (_, i) => (
            <li
              key={i}
              data-testid="chunk-row-skeleton"
              className="ed-skeleton"
              style={{ height: 72, borderRadius: 4 }}
            />
          ))}
        </ul>
      ) : filtered.length === 0 ? (
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
