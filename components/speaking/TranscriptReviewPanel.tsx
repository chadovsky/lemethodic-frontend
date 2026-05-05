'use client'

import { useState } from 'react'
import { Mic } from 'lucide-react'

const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const SAGE         = '#D4E4D0'
const BUTTER       = '#FFF0C2'
const PEACH        = '#FFD8C2'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

interface Moule {
  label: 'PYRAMIDE' | 'REBOND' | 'CIBLAGE'
  description: string
  userLine: string
  coaching: string
  bg: string
}

const MOULES: Moule[] = [
  {
    label: 'PYRAMIDE',
    description: 'Your opener. Broad, gives them room to respond.',
    userLine: 'Bonjour, je voudrais partir en vacances dans un pays francophone.',
    coaching: "Strong opener — broad request invites the agent to ask back. Add 's'il vous plaît' for register.",
    bg: SAGE,
  },
  {
    label: 'REBOND',
    description: 'Your follow-up. Builds on what they said.',
    userLine: 'Oui, je pensais partir en juillet ou août. Quelles destinations me recommandez-vous\u00a0?',
    coaching: "Good use of 'Quelles' — properly agrees in gender and number. Natural pivot from your timing to their expertise.",
    bg: BUTTER,
  },
  {
    label: 'CIBLAGE',
    description: 'Your closing. Specific, gets the missing detail.',
    userLine: 'Et combien ça coûterait pour deux semaines à Montréal en hôtel 4 étoiles\u00a0?',
    coaching: "Conditional 'coûterait' is exactly right for a hypothetical price. Specific enough to get a usable answer.",
    bg: PEACH,
  },
]

interface TranscriptReviewPanelProps {
  onConfirm: () => void
  visible: boolean
}

export default function TranscriptReviewPanel({
  onConfirm,
  visible,
}: TranscriptReviewPanelProps) {
  const [skipReview, setSkipReview] = useState(false)

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.28)',
          zIndex: 60,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'opacity 0.25s',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Review your three moves"
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: visible
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(100%)',
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'var(--fp-canvas)',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          zIndex: 70,
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Scrollable interior */}
        <div
          style={{
            overflowY: 'auto',
            flex: 1,
            padding: '20px 20px 0',
          }}
        >
          {/* Drag handle */}
          <div
            aria-hidden="true"
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: INK_MUTED,
              margin: '0 auto 20px',
            }}
          />

          {/* Header */}
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 13,
              color: INK,
              margin: '0 0 2px',
            }}
          >
            Review your three moves
          </p>
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 12,
              color: INK_MUTED,
              margin: '0 0 20px',
              lineHeight: '18px',
            }}
          >
            Each moule has its own job. Refine them independently.
          </p>

          {/* Three moule cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MOULES.map((moule) => (
              <div
                key={moule.label}
                style={{
                  backgroundColor: moule.bg,
                  borderRadius: 20,
                  padding: '16px 18px',
                }}
              >
                {/* Label row */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
                  <span
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 800,
                      fontSize: 10,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase' as const,
                      color: INK,
                    }}
                  >
                    {moule.label}
                  </span>
                  <span
                    style={{
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 500,
                      fontSize: 12,
                      color: INK_SOFT,
                      lineHeight: '16px',
                    }}
                  >
                    {moule.description}
                  </span>
                </div>

                {/* User's transcribed line */}
                <p
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 500,
                    fontSize: 15,
                    lineHeight: '23px',
                    color: INK,
                    margin: '0 0 10px',
                  }}
                >
                  {moule.userLine}
                </p>

                {/* Coaching note */}
                <p
                  style={{
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 400,
                    fontSize: 12,
                    lineHeight: '18px',
                    color: INK_SOFT,
                    fontStyle: 'italic',
                    margin: '0 0 14px',
                  }}
                >
                  {moule.coaching}
                </p>

                {/* Refaire cette partie — ghost button, bottom-right */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      background: 'transparent',
                      border: `1.5px solid ${INK_MUTED}`,
                      borderRadius: 100,
                      padding: '5px 12px',
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 600,
                      fontSize: 12,
                      color: INK_SOFT,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                    // Non-functional in design-review; wired in F-058
                    type="button"
                    aria-label={`Refaire ${moule.label}`}
                  >
                    <Mic size={12} strokeWidth={2} />
                    Refaire cette partie
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Spacer before sticky bottom */}
          <div style={{ height: 20 }} />
        </div>

        {/* Sticky bottom actions */}
        <div
          style={{
            padding: '16px 20px calc(32px + var(--fp-safe-bottom)) 20px',
            borderTop: '1px solid #1A1A1A0A',
            backgroundColor: 'var(--fp-canvas)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 16,
              border: 'none',
              backgroundColor: INK,
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 15,
              color: '#FFFFFF',
              cursor: 'pointer',
              outline: 'none',
              marginBottom: 14,
            }}
          >
            Confirmer les trois
          </button>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={skipReview}
              onChange={(e) => setSkipReview(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: INK, cursor: 'pointer', flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 13,
                color: INK_SOFT,
              }}
            >
              Ne plus afficher cette revue
            </span>
          </label>
        </div>
      </div>
    </>
  )
}
