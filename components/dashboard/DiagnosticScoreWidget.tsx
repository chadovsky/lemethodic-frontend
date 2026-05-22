import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import { DIAGNOSTIC_SCORE } from '@/lib/data/dashboard'

export default function DiagnosticScoreWidget() {
  return (
    <section
      data-testid="dashboard-widget-score"
      className="ed-card-lift"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        padding: 'clamp(20px, 2vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <h2
        style={{
          fontFamily: SERIF_FONT,
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 'clamp(22px, 2.6vw, 30px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Score Diagnostic
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span
          data-testid="diagnostic-score-value"
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(40px, 5vw, 56px)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
        >
          {DIAGNOSTIC_SCORE.level}
        </span>
        <span
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 400,
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
          }}
        >
          Dernière évaluation : {DIAGNOSTIC_SCORE.lastEvaluatedLabel}
        </span>
      </div>

      <Link
        href="/diagnostic"
        className="ed-btn-press"
        style={{
          alignSelf: 'flex-start',
          marginTop: 'auto',
          padding: '10px 18px',
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '0.01em',
          textDecoration: 'none',
          borderRadius: 4,
          border: '1px solid var(--text-primary)',
        }}
      >
        Voir le détail
      </Link>
    </section>
  )
}
