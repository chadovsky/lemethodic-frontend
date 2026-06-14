'use client'

export interface TacheProps {
  prompt: string
  scenario: string
  targetLength: string
  type?: 'oral' | 'writing'
}

export default function Tache({ prompt, scenario, targetLength, type = 'oral' }: TacheProps) {
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
      {/* Mold label + type badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            margin: 0,
          }}
        >
          La Tache
        </p>
        <span
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: type === 'oral' ? 'var(--dominant)' : 'var(--accent)',
            background:
              type === 'oral'
                ? 'color-mix(in srgb, var(--dominant) 7%, transparent)'
                : 'color-mix(in srgb, var(--accent) 7%, transparent)',
            borderRadius: 'var(--r-pill)',
            padding: '3px 10px',
          }}
        >
          {type === 'oral' ? 'Oral' : 'Ecrit'}
        </span>
      </div>

      {/* Scenario / Contexte */}
      <div
        style={{
          background: 'var(--paper-tint)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-md)',
          padding: '16px 20px',
          marginBottom: 20,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            margin: '0 0 8px',
          }}
        >
          Contexte
        </p>
        <p
          style={{
            fontFamily: 'var(--f-body)',
            fontSize: '1.0625rem',
            lineHeight: 1.6,
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          {scenario}
        </p>
      </div>

      {/* Consigne */}
      <div style={{ marginBottom: 20 }}>
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            margin: '0 0 10px',
          }}
        >
          Consigne
        </p>
        <p
          style={{
            fontFamily: 'var(--f-body)',
            fontSize: '1.125rem',
            lineHeight: 1.6,
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          {prompt}
        </p>
      </div>

      {/* Target length chip */}
      <div style={{ marginBottom: 28 }}>
        <span
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            background: 'var(--paper-edge)',
            borderRadius: 'var(--r-pill)',
            padding: '4px 12px',
            display: 'inline-block',
          }}
        >
          {targetLength}
        </span>
      </div>

      {/* Record / submit placeholder — disabled seam */}
      {/* BE SEAM: oral recording + Le Maitre scoring wires in F-407 (Phase 2) */}
      <div
        style={{
          background: 'var(--paper-tint)',
          border: '1px dashed var(--rule-strong)',
          borderRadius: 'var(--r-md)',
          padding: '20px 24px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <button
          disabled
          style={{
            background: 'var(--dominant)',
            border: 'none',
            borderRadius: 'var(--r-md)',
            padding: '12px 24px',
            fontFamily: 'var(--f-ui)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--paper)',
            cursor: 'not-allowed',
            opacity: 0.4,
            flexShrink: 0,
          }}
        >
          {type === 'oral' ? "Demarrer l'enregistrement" : 'Soumettre la reponse'}
        </button>
        <p
          style={{
            fontFamily: 'var(--f-ui)',
            fontSize: 12,
            color: 'var(--ink-faint)',
            margin: 0,
          }}
        >
          Enregistrement + scoring Le Maitre — seam (Phase 2, F-407)
        </p>
      </div>

      {/* Le Maitre close — disabled placeholder, same pattern as /ile/[id]/page.tsx */}
      {/* BE SEAM: gate until all molds complete in user_progress (F-417, Round 2) */}
      <div
        style={{
          background: 'var(--paper-tint)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-lg)',
          padding: '20px 24px',
          opacity: 0.45,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--r-pill)',
              background: 'var(--dominant)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--f-display)',
                fontSize: 18,
                color: 'var(--paper)',
                lineHeight: 1,
              }}
            >
              M
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: 13,
              color: 'var(--ink-soft)',
              margin: 0,
            }}
          >
            Le Maitre reagira apres votre soumission.
          </p>
        </div>
      </div>
    </section>
  )
}
