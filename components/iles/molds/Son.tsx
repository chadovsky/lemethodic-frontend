'use client'

import { useState } from 'react'

export interface Word {
  fr: string
  audioSrc?: string
}

export interface MinimalPair {
  a: string
  b: string
  audioA?: string
  audioB?: string
}

export interface SonProps {
  phoneme: string
  description?: string
  words: Word[]
  minimalPairs: MinimalPair[]
  articulationNote?: string
}

export default function Son({ phoneme, description, words, minimalPairs, articulationNote }: SonProps) {
  const [noteOpen, setNoteOpen] = useState(false)

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
        Le Son
      </p>

      {/* Phoneme display */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 28 }}>
        <div
          style={{
            background: 'var(--dominant)',
            borderRadius: 'var(--r-md)',
            padding: '14px 22px',
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--f-mono)',
              fontSize: 26,
              fontWeight: 500,
              color: 'var(--paper)',
              margin: 0,
              letterSpacing: '0.04em',
            }}
          >
            {phoneme}
          </p>
        </div>
        {description && (
          <div style={{ paddingTop: 8 }}>
            <p
              style={{
                fontFamily: 'var(--f-body)',
                fontSize: '1.0625rem',
                lineHeight: 1.55,
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              {description}
            </p>
          </div>
        )}
      </div>

      {/* Example words */}
      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            margin: '0 0 14px',
          }}
        >
          Mots exemples
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {words.map((word, i) => (
            <div
              key={i}
              style={{
                background: 'var(--paper-tint)',
                border: '1px solid var(--rule-strong)',
                borderRadius: 'var(--r-md)',
                padding: '10px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '1.0625rem',
                  color: 'var(--ink)',
                  fontWeight: 500,
                }}
              >
                {word.fr}
              </span>
              {word.audioSrc && (
                <audio
                  controls
                  src={word.audioSrc}
                  style={{ height: 28, width: 120, accentColor: 'var(--dominant)' }}
                >
                  Audio indisponible
                </audio>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Minimal pairs */}
      <div style={{ marginBottom: articulationNote ? 28 : 0 }}>
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            margin: '0 0 14px',
          }}
        >
          Paires minimales
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {minimalPairs.map((pair, i) => (
            <div
              key={i}
              style={{
                background: 'var(--paper-tint)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r-md)',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '1.0625rem',
                  color: 'var(--dominant)',
                  fontWeight: 600,
                  minWidth: 72,
                }}
              >
                {pair.a}
              </span>
              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 12,
                  color: 'var(--ink-faint)',
                  flexShrink: 0,
                }}
              >
                vs
              </span>
              <span
                style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '1.0625rem',
                  color: 'var(--ink)',
                  fontWeight: 500,
                  minWidth: 72,
                }}
              >
                {pair.b}
              </span>
              {(pair.audioA || pair.audioB) && (
                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                  {pair.audioA && (
                    <audio
                      controls
                      src={pair.audioA}
                      style={{ height: 28, width: 100, accentColor: 'var(--dominant)' }}
                    >
                      Audio indisponible
                    </audio>
                  )}
                  {pair.audioB && (
                    <audio
                      controls
                      src={pair.audioB}
                      style={{ height: 28, width: 100, accentColor: 'var(--dominant)' }}
                    >
                      Audio indisponible
                    </audio>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Articulation note — collapsible */}
      {articulationNote && (
        <div>
          <button
            onClick={() => setNoteOpen(o => !o)}
            aria-expanded={noteOpen}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: '1px solid var(--rule-strong)',
              borderRadius: 'var(--r-pill)',
              padding: '8px 18px',
              fontFamily: 'var(--f-ui)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--ink-soft)',
              cursor: 'pointer',
              transition: 'color 150ms var(--ease), border-color 150ms var(--ease)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--ink)'
              e.currentTarget.style.borderColor = 'var(--ink-faint)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--ink-soft)'
              e.currentTarget.style.borderColor = 'var(--rule-strong)'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transition: 'transform 200ms var(--ease)',
                transform: noteOpen ? 'rotate(180deg)' : 'none',
                lineHeight: 1,
              }}
            >
              ▾
            </span>
            {noteOpen ? "Masquer la note" : "Note d'articulation"}
          </button>

          {noteOpen && (
            <div
              style={{
                background: 'var(--paper-tint)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r-md)',
                padding: '16px 20px',
                marginTop: 12,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.6,
                  color: 'var(--ink-soft)',
                  margin: 0,
                }}
              >
                {articulationNote}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
