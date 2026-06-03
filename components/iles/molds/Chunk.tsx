'use client'

export interface ChunkProps {
  chunk: string
  gloss: string
  examples: string[]
  audio?: string
  register?: string
}

export default function Chunk({ chunk, gloss, examples, audio, register }: ChunkProps) {
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
        Le Chunk
      </p>

      {/* Chunk + gloss */}
      <div style={{ marginBottom: 20 }}>
        <p
          style={{
            fontFamily: 'var(--f-body)',
            fontSize: '1.625rem',
            lineHeight: 1.25,
            color: 'var(--ink)',
            margin: '0 0 6px',
            letterSpacing: '-0.01em',
          }}
          lang="fr"
        >
          {chunk}
        </p>
        <p
          style={{
            fontFamily: 'var(--f-en)',
            fontSize: '1rem',
            lineHeight: 1.5,
            color: 'var(--ink-soft)',
            margin: 0,
          }}
          lang="en"
        >
          {gloss}
        </p>
      </div>

      {/* Register badge */}
      {register && (
        <div style={{ marginBottom: 20 }}>
          <span
            style={{
              display: 'inline-block',
              background: 'var(--paper-edge)',
              border: '1px solid var(--rule-strong)',
              borderRadius: 'var(--r-pill)',
              padding: '4px 12px',
              fontFamily: 'var(--f-mono)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--ink-soft)',
            }}
          >
            {register}
          </span>
        </div>
      )}

      {/* Audio player */}
      {audio && (
        <div
          style={{
            background: 'var(--paper-tint)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--r-md)',
            padding: '16px 20px',
            marginBottom: 28,
          }}
        >
          <audio
            controls
            src={audio}
            style={{
              width: '100%',
              height: 36,
              accentColor: 'var(--dominant)',
            }}
          >
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      )}

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
          {examples.map((sentence, i) => (
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
                {sentence}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
