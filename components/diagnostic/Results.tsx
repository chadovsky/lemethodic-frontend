import Link from 'next/link'
import Breadcrumb from '@/components/common/Breadcrumb'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import { CEFR_PASTEL_MAP } from '@/lib/data/cefr'
import CouchesBreakdown from './CouchesBreakdown'
import TacheSummary from './TacheSummary'
import RecommendationsStub from './RecommendationsStub'

const SCORE = 'C1'

const EVAL_DATE = new Intl.DateTimeFormat('fr-CA', { dateStyle: 'long' }).format(
  new Date(2026, 4, 15),
)

const SECTION_HEADING: React.CSSProperties = {
  fontFamily: SERIF_FONT,
  fontWeight: 500,
  fontSize: 'clamp(22px, 2.5vw, 30px)',
  lineHeight: 1.2,
  letterSpacing: '-0.015em',
  color: 'var(--text-primary)',
  margin: 0,
}

export default function Results() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingTop: 8 }}>
      <Breadcrumb
        items={[
          { label: "L'Examen", href: '/l-examen' },
          { label: 'Résultats' },
        ]}
      />

      {/* Header: overall score */}
      <div
        data-testid="results-score-block"
        className="results-score-enter"
        style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
      >
        <span
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 500,
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          Niveau estimé TCF Canada
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span
            data-testid="results-score"
            style={{
              fontFamily: SERIF_FONT,
              fontWeight: 500,
              fontSize: 'clamp(52px, 6vw, 80px)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
            }}
          >
            {SCORE}
          </span>
          <span
            data-testid="results-cefr-pill"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              backgroundColor: CEFR_PASTEL_MAP[SCORE],
              borderRadius: 4,
              padding: '4px 10px',
              flexShrink: 0,
            }}
          >
            {SCORE}
          </span>
          <span
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.9375rem',
              color: 'var(--text-muted)',
            }}
          >
            Évalué le {EVAL_DATE}
          </span>
        </div>
      </div>

      {/* 5-couche breakdown */}
      <section
        data-testid="results-section-couches"
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <h2 style={SECTION_HEADING}>Votre score par couche</h2>
        <CouchesBreakdown />
      </section>

      {/* Per-tâche summary */}
      <section
        data-testid="results-section-taches"
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <h2 style={SECTION_HEADING}>Vos tâches</h2>
        <TacheSummary />
      </section>

      {/* Recommendations */}
      <section
        data-testid="results-section-recommendations"
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <h2 style={SECTION_HEADING}>Vos prochaines étapes</h2>
        <RecommendationsStub />
      </section>

      {/* Bottom action row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 8 }}>
        <Link
          data-testid="results-action-recommencer"
          href="/l-examen/diagnostic/tache/1"
          className="ed-btn-press"
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--bg-elevated)',
            backgroundColor: 'var(--cta-utility)',
            border: '1px solid var(--cta-utility)',
            borderRadius: 4,
            padding: '12px 24px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            minHeight: 44,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Recommencer le diagnostic
        </Link>
        <Link
          data-testid="results-action-dashboard"
          href="/dashboard"
          className="ed-btn-press"
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--cta-utility)',
            backgroundColor: 'transparent',
            border: '1px solid var(--cta-utility)',
            borderRadius: 4,
            padding: '12px 24px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 44,
          }}
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
