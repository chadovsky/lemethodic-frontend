'use client'

import type { CSSProperties } from 'react'

export interface Formula {
  text: string
  audio?: string
}

export type Register = 'familier' | 'courant' | 'soutenu'

export interface ActeDeParoleProps {
  fonction: string
  formules: Formula[]
  register: Register
}

const REGISTER_LABELS: Record<Register, string> = {
  familier: 'Familier',
  courant: 'Courant',
  soutenu: 'Soutenu',
}

// soutenu: dominant bg + paper text (fully opaque)
// courant: dominant rgba tint
// familier: neutral paper-edge
const REGISTER_BADGE: Record<Register, CSSProperties> = {
  familier: {
    background: 'var(--paper-edge)',
    color: 'var(--ink-soft)',
    border: '1px solid var(--rule-strong)',
  },
  courant: {
    background: 'rgba(20, 33, 61, 0.08)',
    color: 'var(--dominant)',
    border: '1px solid rgba(20, 33, 61, 0.18)',
  },
  soutenu: {
    background: 'var(--dominant)',
    color: 'var(--paper)',
    border: 'none',
  },
}

export default function ActeDeParole({ fonction, formules, register }: ActeDeParoleProps) {
  const badgeStyle = REGISTER_BADGE[register]

  return (
    <section
      style={{
        background: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-lg)',
        padding: 'clamp(24px, 4vw, 40px)',
        marginBottom: 32,
      }}
    >
      {/* Mold label */}
      <p
        style={{
          fontFamily: 'var(--f-mono)',
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
          margin: '0 0 24px',
        }}
      >
        {"L'Acte de Parole"}
      </p>

      {/* Function label + register badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 28,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--f-display)',
            fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
            fontWeight: 400,
            color: 'var(--ink)',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
          lang="fr"
        >
          {fonction}
        </p>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            ...badgeStyle,
            borderRadius: 'var(--r-pill)',
            padding: '5px 14px',
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            flexShrink: 0,
            marginTop: 4,
          }}
        >
          {REGISTER_LABELS[register]}
        </span>
      </div>

      {/* Formulas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {formules.map((f, i) => (
          <div
            key={i}
            style={{
              background: 'var(--paper-tint)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--r-md)',
              padding: '18px 20px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--f-body)',
                fontSize: '1.125rem',
                lineHeight: 1.55,
                color: 'var(--ink)',
                margin: f.audio ? '0 0 14px' : 0,
              }}
              lang="fr"
            >
              {f.text}
            </p>
            {f.audio && (
              <audio
                controls
                src={f.audio}
                style={{
                  width: '100%',
                  height: 32,
                  accentColor: 'var(--dominant)',
                }}
              >
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
