'use client'

import { ED, SANS_FONT, SERIF_FONT } from '@/lib/typography'
import RevealOnScroll from './RevealOnScroll'

// MOCK-002 — art-directed div surfaces standing in for real product
// screenshots (tâche Recording state + score card). Wispr-style overlapping
// card composition: dark primary surface full-width, light score card
// anchored to the primary's bottom-right corner.
// Score card hidden on mobile (<768px) per spec ("single image, no overflow").

const WAVEFORM_HEIGHTS = [4, 8, 14, 10, 20, 16, 8, 24, 18, 12, 22, 16, 10, 18, 24, 14, 8, 20, 12, 6, 16, 22, 10, 18, 14]

const SCORE_ROWS = [
  { label: 'Cohérence', score: 87 },
  { label: 'Vocabulaire', score: 74 },
  { label: 'Grammaire', score: 91 },
]

export default function ProductDemo() {
  return (
    <section
      data-testid="demo-section"
      aria-label="Product demo"
      style={{
        backgroundColor: ED.bg,
        borderTop: `1px solid ${ED.rule}`,
        padding: 'clamp(64px, 10vw, 120px) clamp(24px, 5vw, 40px)',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Heading */}
        <RevealOnScroll>
          <h2
            className="text-balance"
            style={{
              fontFamily: SERIF_FONT,
              fontWeight: 400,
              fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              color: ED.fg,
              margin: 0,
              marginBottom: 'clamp(40px, 6vw, 64px)',
              textAlign: 'center',
            }}
          >
            Watch it work
          </h2>
        </RevealOnScroll>

        {/* Demo block — primary + overlapping secondary */}
        <RevealOnScroll distance={40}>
          <div style={{ position: 'relative' }}>
            {/* Primary: tâche Recording surface */}
            <div
              data-testid="demo-image-primary"
              className="ed-card-lift"
              style={{
                backgroundColor: '#1C1A16',
                borderRadius: 12,
                padding: 'clamp(28px, 4vw, 48px)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Recording header row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'clamp(20px, 3vw, 32px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#E05252',
                      display: 'inline-block',
                      boxShadow: '0 0 6px rgba(224,82,82,0.6)',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: SANS_FONT,
                      fontWeight: 600,
                      fontSize: '0.6875rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase' as const,
                      color: 'rgba(248,244,237,0.5)',
                    }}
                  >
                    Enregistrement
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 400,
                    fontSize: '0.75rem',
                    color: 'rgba(248,244,237,0.3)',
                  }}
                >
                  1:24
                </span>
              </div>

              {/* Tâche prompt */}
              <p
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 500,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase' as const,
                  color: 'rgba(143,162,121,0.8)',
                  margin: 0,
                  marginBottom: 12,
                }}
              >
                Production Orale — Tâche 2
              </p>

              {/* Transcription text */}
              <p
                style={{
                  fontFamily: SERIF_FONT,
                  fontWeight: 400,
                  fontSize: 'clamp(1rem, 2vw, 1.375rem)',
                  lineHeight: 1.7,
                  color: 'rgba(248,244,237,0.82)',
                  margin: 0,
                  marginBottom: 'clamp(24px, 3.5vw, 36px)',
                  maxWidth: 640,
                }}
              >
                &ldquo;Euh... je voudrais décrire cette image où on voit une... comment
                dire... une scène au marché local, et il y a beaucoup de, euh,
                de personnes qui...&rdquo;
              </p>

              {/* Waveform */}
              <div
                aria-hidden="true"
                style={{
                  display: 'flex',
                  gap: 3,
                  alignItems: 'center',
                  height: 32,
                }}
              >
                {WAVEFORM_HEIGHTS.map((h, i) => (
                  <span
                    key={i}
                    style={{
                      width: 3,
                      height: h,
                      borderRadius: 2,
                      backgroundColor: 'rgba(143,162,121,0.65)',
                      flexShrink: 0,
                      display: 'inline-block',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Secondary: Production Orale score card — desktop only */}
            <div
              data-testid="demo-image-secondary"
              className="hidden md:block"
              style={{
                position: 'absolute',
                bottom: 24,
                right: 24,
                width: 'clamp(180px, 26%, 240px)',
                backgroundColor: ED.paper,
                border: `1px solid ${ED.rule}`,
                borderRadius: 8,
                padding: 'clamp(16px, 2vw, 22px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07)',
                zIndex: 2,
              }}
            >
              <p
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 700,
                  fontSize: '0.625rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: ED.muted,
                  margin: 0,
                  marginBottom: 14,
                }}
              >
                Production Orale
              </p>

              {SCORE_ROWS.map((row) => (
                <div key={row.label} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SANS_FONT,
                        fontWeight: 400,
                        fontSize: '0.75rem',
                        color: ED.fg,
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: SANS_FONT,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: ED.accent,
                      }}
                    >
                      {row.score}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      backgroundColor: ED.rule,
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${row.score}%`,
                        backgroundColor: ED.accent,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              ))}

              <p
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 400,
                  fontSize: '0.625rem',
                  color: ED.muted,
                  margin: 0,
                  marginTop: 14,
                  textAlign: 'right' as const,
                }}
              >
                TCF Canada — résultat simulé
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
