import Breadcrumb from '@/components/common/Breadcrumb'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import type { Tache } from '@/lib/data/taches'
import Timer from './Timer'
import RecordingPlaceholder from './RecordingPlaceholder'
import TacheNav from './TacheNav'

export default function TacheShell({ tache }: { tache: Tache }) {
  const breadcrumbItems = [
    { label: 'Le Diagnostic', href: '/diagnostic' },
    { label: `Tâche ${tache.id}` },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingTop: 8 }}>
      <Breadcrumb items={breadcrumbItems} />

      <header style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            data-testid="tache-shell-badge"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--bg-elevated)',
              backgroundColor: 'var(--cta-primary)',
              borderRadius: 4,
              padding: '2px 8px',
              lineHeight: 1.6,
            }}
          >
            {tache.id}
          </span>
          <span
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
            }}
          >
            {tache.durationLabel}
          </span>
        </div>

        <h1
          data-testid="tache-shell-title"
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(24px, 2.8vw, 36px)',
            lineHeight: 1.2,
            letterSpacing: '-0.015em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {tache.title}
        </h1>
      </header>

      <div className="tache-timer-row">
        <Timer initialSeconds={tache.durationSeconds} />
      </div>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p
            data-testid="tache-shell-prompt"
            style={{
              fontFamily: SERIF_FONT,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(18px, 2vw, 24px)',
              lineHeight: 1.5,
              color: 'var(--text-primary)',
              margin: 0,
              maxWidth: 720,
            }}
          >
            {tache.prompt}
          </p>
        </div>
        <span
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 400,
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
          }}
          aria-label="Lire l'énoncé"
        >
          Lire l&rsquo;énoncé
        </span>
      </section>

      <RecordingPlaceholder />

      <TacheNav tacheId={tache.id} />
    </div>
  )
}
