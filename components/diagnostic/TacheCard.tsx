import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import type { Tache } from '@/lib/data/taches'

const TACHE_ACCENT: Record<number, string> = {
  1: 'var(--lm-pastel-lavender)',
  2: 'var(--lm-pastel-sky)',
  3: 'var(--lm-pastel-peach)',
}

export default function TacheCard({ tache }: { tache: Tache }) {
  const accentColor = TACHE_ACCENT[tache.id] ?? 'var(--rule-default)'

  return (
    <article
      data-testid="tache-card"
      data-tache-id={String(tache.id)}
      className="ed-card-lift"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        padding: 'clamp(20px, 2vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Per-tâche decorative left accent bar — F-200 chip layer */}
      <div
        data-testid="tache-card-accent-bar"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: accentColor,
          borderRadius: '4px 0 0 4px',
        }}
      />
      <h3
        data-testid="tache-card-title"
        style={{
          fontFamily: SERIF_FONT,
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 'clamp(20px, 2.2vw, 24px)',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        {tache.title}
      </h3>
      <p
        data-testid="tache-card-descriptor"
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: '0.9375rem',
          lineHeight: 1.55,
          color: 'var(--text-muted)',
          margin: 0,
          flex: 1,
        }}
      >
        {tache.descriptor}
      </p>
      <p
        data-testid="tache-card-duration"
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '0.8125rem',
          letterSpacing: '0.005em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Durée : {tache.durationLabel}
      </p>
    </article>
  )
}
