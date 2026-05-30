'use client'

import { SANS_FONT } from '@/lib/typography'
import { CEFR_LEVELS, CHUNK_SOURCES, type CefrLevel } from '@/lib/data/chunks'
import type { SourceFilter, VocabFilterState } from '@/lib/vocab/filter'

interface FilterBarProps {
  state: VocabFilterState
  onChange: (next: VocabFilterState) => void
}

export default function FilterBar({ state, onChange }: FilterBarProps) {
  const toggleLevel = (level: CefrLevel) => {
    const next = state.cefrLevels.includes(level)
      ? state.cefrLevels.filter((l) => l !== level)
      : [...state.cefrLevels, level]
    onChange({ ...state, cefrLevels: next })
  }

  return (
    <div
      data-testid="vocab-filter-bar"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
        alignItems: 'center',
        padding: 'clamp(14px, 1.5vw, 18px) clamp(16px, 2vw, 20px)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <span
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Niveau
        </span>
        {CEFR_LEVELS.map((level) => {
          const selected = state.cefrLevels.includes(level)
          return (
            <button
              key={level}
              type="button"
              data-testid={`cefr-chip-${level}`}
              data-selected={selected}
              aria-pressed={selected}
              onClick={() => toggleLevel(level)}
              className="ed-btn-press"
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                color: selected ? 'var(--bg-elevated)' : 'var(--text-primary)',
                backgroundColor: selected ? 'var(--cta-utility)' : 'transparent',
                border: selected
                  ? '1px solid var(--cta-utility)'
                  : '1px solid var(--rule-default)',
                padding: '6px 12px',
                borderRadius: 999,
                cursor: 'pointer',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {level}
            </button>
          )
        })}
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: SANS_FONT,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Source
        </span>
        <select
          data-testid="source-select"
          value={state.source}
          onChange={(e) =>
            onChange({ ...state, source: e.target.value as SourceFilter })
          }
          className="ed-field"
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 500,
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--rule-default)',
            padding: '6px 10px',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          <option value="all">Toutes les sources</option>
          {CHUNK_SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </label>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: '1 1 200px',
          fontFamily: SANS_FONT,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: '0.6875rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Recherche
        </span>
        <input
          type="text"
          data-testid="search-input"
          value={state.search}
          onChange={(e) => onChange({ ...state, search: e.target.value })}
          placeholder="Chercher un chunk…"
          className="ed-field"
          style={{
            flex: 1,
            fontFamily: SANS_FONT,
            fontWeight: 400,
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--rule-default)',
            padding: '8px 12px',
            borderRadius: 4,
            minWidth: 0,
          }}
        />
      </label>
    </div>
  )
}
