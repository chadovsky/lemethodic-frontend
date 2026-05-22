import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

const CEFR_PCT: Record<CefrLevel, number> = {
  A1: 17, A2: 33, B1: 50, B2: 67, C1: 83, C2: 100,
}

const COUCHES: {
  name: string
  score: CefrLevel
  gloss: string
}[] = [
  {
    name: 'Le Fond',
    score: 'C1',
    gloss: 'Vous maîtrisez les structures attendues.',
  },
  {
    name: 'Les Moules des Idées',
    score: 'B2',
    gloss: 'Vos idées sont articulées mais manquent encore de diversité lexicale.',
  },
  {
    name: 'Les Moules',
    score: 'B2',
    gloss: 'Les structures de phrases sont globalement fluides.',
  },
  {
    name: 'Les Réflexes Anglais',
    score: 'B1',
    gloss: "Quelques calques de l’anglais subsistent sous pression.",
  },
  {
    name: 'La Voix',
    score: 'B2',
    gloss: 'Votre débit et votre intonation sont appropriés au contexte.',
  },
]

export default function CouchesBreakdown() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {COUCHES.map((couche) => (
        <div
          key={couche.name}
          data-testid="couche-row"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 'clamp(12px, 1.5vw, 16px) clamp(14px, 2vw, 20px)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--rule-default)',
            borderRadius: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span
              style={{
                fontFamily: SERIF_FONT,
                fontStyle: 'italic',
                fontWeight: 500,
                fontSize: 'clamp(15px, 1.6vw, 18px)',
                color: 'var(--text-primary)',
              }}
            >
              {couche.name}
            </span>
            <span
              data-testid="couche-badge"
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                color: 'var(--bg-elevated)',
                backgroundColor: 'var(--cta-primary)',
                borderRadius: 4,
                padding: '2px 8px',
                flexShrink: 0,
              }}
            >
              {couche.score}
            </span>
          </div>

          {/* Bar */}
          <div
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'var(--rule-default)',
              overflow: 'hidden',
            }}
          >
            <div
              data-testid="couche-bar"
              style={{
                height: '100%',
                width: `${CEFR_PCT[couche.score]}%`,
                borderRadius: 3,
                backgroundColor: 'var(--cta-primary)',
                transition: 'width 600ms var(--ed-ease, ease)',
              }}
            />
          </div>

          <p
            data-testid="couche-gloss"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            {couche.gloss}
          </p>
        </div>
      ))}
    </div>
  )
}
