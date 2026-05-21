'use client'

import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import type { Chunk } from '@/lib/data/chunks'

export default function ChunkRow({ chunk }: { chunk: Chunk }) {
  return (
    <li
      data-testid="chunk-row"
      data-chunk-id={chunk.id}
      data-chunk-level={chunk.level}
      data-chunk-source={chunk.source}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 'clamp(14px, 1.5vw, 18px) clamp(16px, 2vw, 22px)',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          data-testid="chunk-row-fr"
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: '1.0625rem',
            lineHeight: 1.3,
            letterSpacing: '-0.005em',
            color: 'var(--text-primary)',
          }}
        >
          {chunk.fr}
        </span>
        <span
          data-testid="chunk-row-en"
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 400,
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: 'var(--text-muted)',
          }}
        >
          {chunk.en}
        </span>
      </div>

      <span
        data-testid="chunk-row-level"
        style={{
          flexShrink: 0,
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '0.6875rem',
          letterSpacing: '0.06em',
          color: 'var(--text-primary)',
          backgroundColor: 'var(--accent-primary-soft)',
          padding: '4px 8px',
          borderRadius: 4,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {chunk.level}
      </span>

      <span
        data-testid="chunk-row-source"
        style={{
          flexShrink: 0,
          fontFamily: SANS_FONT,
          fontWeight: 500,
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-subtle)',
          padding: '4px 10px',
          borderRadius: 999,
          border: '1px solid var(--rule-default)',
          whiteSpace: 'nowrap',
        }}
      >
        {chunk.source}
      </span>

      <button
        type="button"
        data-testid="chunk-row-save"
        aria-label={`Sauvegarder « ${chunk.fr} »`}
        onClick={() => {
          /* Save state — BE-XXX wires the endpoint */
        }}
        className="ed-btn-press"
        style={{
          flexShrink: 0,
          width: 36,
          height: 36,
          borderRadius: 4,
          border: '1px solid var(--rule-default)',
          backgroundColor: 'transparent',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </li>
  )
}
