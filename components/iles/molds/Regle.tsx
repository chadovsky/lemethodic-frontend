'use client'

export interface RegleExample {
  sentence: string
  highlight: string
}

export interface RegleProps {
  regle: string
  structure: string
  exemples: RegleExample[]
  piege?: string
}

function HighlightedText({ sentence, highlight }: { sentence: string; highlight: string }) {
  const idx = sentence.indexOf(highlight)
  if (idx === -1) return <>{sentence}</>
  return (
    <>
      {sentence.slice(0, idx)}
      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{highlight}</span>
      {sentence.slice(idx + highlight.length)}
    </>
  )
}

export default function Regle({ regle, structure, exemples, piege }: RegleProps) {
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
        {'La Règle'}
      </p>

      {/* Rule statement */}
      <p
        style={{
          fontFamily: 'var(--f-ui)',
          fontSize: '1.0625rem',
          fontWeight: 500,
          lineHeight: 1.55,
          color: 'var(--ink)',
          margin: '0 0 20px',
        }}
        lang="fr"
      >
        {regle}
      </p>

      {/* Structure pattern — dark block, monospaced */}
      <div
        style={{
          background: 'var(--dominant)',
          borderRadius: 'var(--r-md)',
          padding: '14px 20px',
          marginBottom: 28,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: '0.9375rem',
            lineHeight: 1.5,
            color: 'var(--paper)',
            margin: 0,
            letterSpacing: '0.02em',
          }}
          lang="fr"
        >
          {structure}
        </p>
      </div>

      {/* Examples */}
      <div>
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            margin: '0 0 16px',
          }}
        >
          Exemples
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {exemples.map((ex, i) => (
            <div
              key={i}
              style={{
                background: 'var(--paper-tint)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r-md)',
                padding: '14px 18px',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 10,
                  color: 'var(--ink-faint)',
                  paddingTop: 5,
                  flexShrink: 0,
                  userSelect: 'none',
                }}
              >
                {i + 1}
              </span>
              <p
                style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.6,
                  color: 'var(--ink)',
                  margin: 0,
                }}
                lang="fr"
              >
                <HighlightedText sentence={ex.sentence} highlight={ex.highlight} />
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Piege / exception note */}
      {piege && (
        <div
          style={{
            marginTop: 20,
            background: 'color-mix(in srgb, var(--accent) 5%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
            borderRadius: 'var(--r-md)',
            padding: '14px 18px',
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              paddingTop: 3,
              flexShrink: 0,
            }}
          >
            {'Piège'}
          </span>
          <p
            style={{
              fontFamily: 'var(--f-ui)',
              fontSize: '0.9375rem',
              lineHeight: 1.55,
              color: 'var(--accent)',
              margin: 0,
            }}
            lang="fr"
          >
            {piege}
          </p>
        </div>
      )}
    </section>
  )
}
