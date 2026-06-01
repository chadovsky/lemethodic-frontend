'use client'

import { useState, useEffect } from 'react'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import { CEFR_PASTEL_MAP } from '@/lib/data/cefr'

type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

const CEFR_PCT: Record<CefrLevel, number> = {
  A1: 17, A2: 33, B1: 50, B2: 67, C1: 83, C2: 100,
}

const COUCHES: {
  name: string
  score: CefrLevel
  gloss: string
  barColor: string
}[] = [
  {
    name: 'Le Propos',
    score: 'C1',
    gloss: 'Vous maîtrisez les structures attendues.',
    barColor: 'var(--couche-default)',
  },
  {
    name: 'Le Plan',
    score: 'B2',
    gloss: 'Vos idées sont articulées mais manquent encore de diversité lexicale.',
    barColor: 'var(--couche-default)',
  },
  {
    name: 'La Construction',
    score: 'B2',
    gloss: 'Les structures de phrases sont globalement fluides.',
    barColor: 'var(--couche-default)',
  },
  {
    name: 'Les Pièges Anglais',
    score: 'B1',
    gloss: "Quelques calques de l'anglais subsistent sous pression.",
    barColor: 'var(--couche-pieges)',
  },
  {
    name: 'La Musique',
    score: 'B2',
    gloss: 'Votre débit et votre intonation sont appropriés au contexte.',
    barColor: 'var(--couche-default)',
  },
]

export default function CouchesBreakdown() {
  const [mounted, setMounted] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {COUCHES.map((couche, i) => (
        <div
          key={couche.name}
          data-testid="couche-row"
          onMouseEnter={() => setHoveredIdx(i)}
          onMouseLeave={() => setHoveredIdx(null)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: 'clamp(12px, 1.5vw, 16px) clamp(14px, 2vw, 20px)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--rule-default)',
            borderRadius: 4,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span
              style={{
                fontFamily: SERIF_FONT,
                fontWeight: 500,
                fontSize: 'clamp(15px, 1.6vw, 18px)',
                color: 'var(--text-primary)',
              }}
            >
              {couche.name}
            </span>
            <span
              data-testid="couche-badge"
              data-cefr-token={CEFR_PASTEL_MAP[couche.score]}
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 700,
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                color: 'var(--text-primary)',
                backgroundColor: CEFR_PASTEL_MAP[couche.score],
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
                width: mounted ? `${CEFR_PCT[couche.score]}%` : '0%',
                borderRadius: 3,
                backgroundColor: couche.barColor,
                transition: 'width 600ms var(--lm-ease, ease)',
              }}
            />
          </div>

          {/* Gloss — always in DOM (visible inline on mobile, reference for tooltip on desktop) */}
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

          {/* Tooltip — appears on desktop hover */}
          {hoveredIdx === i && (
            <div
              data-testid="couche-tooltip"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 4,
                padding: '8px 14px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--rule-default)',
                borderRadius: 4,
                zIndex: 10,
                fontFamily: SANS_FONT,
                fontWeight: 400,
                fontSize: '0.8125rem',
                color: 'var(--text-primary)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                pointerEvents: 'none',
              }}
            >
              {couche.gloss}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
