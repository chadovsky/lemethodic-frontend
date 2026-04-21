'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

interface TranscriptReviewPanelProps {
  transcript: string
  onConfirm: () => void
  onRedo: () => void
  visible: boolean
}

export default function TranscriptReviewPanel({
  transcript,
  onConfirm,
  onRedo,
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
          backgroundColor: 'rgba(0,0,0,0.24)',
          zIndex: 60,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          transition: 'opacity 0.25s',
        }}
        onClick={onRedo}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Review your response"
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: visible
            ? 'translateX(-50%) translateY(0)'
            : 'translateX(-50%) translateY(100%)',
          width: '100%',
          maxWidth: 440,
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: '28px 24px 36px',
          zIndex: 70,
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
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

        {/* Title */}
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: INK_MUTED,
            margin: '0 0 10px',
          }}
        >
          Vous avez dit :
        </p>

        {/* Transcript text */}
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 18,
            lineHeight: '28px',
            color: INK,
            margin: '0 0 28px',
            minHeight: 80,
          }}
        >
          {transcript}
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onRedo}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 14,
              border: `1.5px solid ${INK}`,
              backgroundColor: 'transparent',
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 15,
              color: INK,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            Refaire
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 14,
              border: 'none',
              backgroundColor: INK,
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 15,
              color: '#FFFFFF',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            Confirmer
          </button>
        </div>

        {/* Skip review checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 18,
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            checked={skipReview}
            onChange={(e) => setSkipReview(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: INK, cursor: 'pointer' }}
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
    </>
  )
}
