'use client'

import { Play, Pause } from 'lucide-react'
import { useState } from 'react'

const INK          = '#1A1A1A'
const INK_MUTED    = '#1A1A1A66'
const PEACH        = '#FFD8C2'
const SAGE         = '#D4E4D0'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

export type BubbleSide = 'examiner' | 'user'

interface ChatBubbleProps {
  side: BubbleSide
  senderLabel: string
  text: string
  /** If provided, renders the audio playback bar below the bubble */
  showAudio?: boolean
  /** Accent color for examiner bubble; defaults to PEACH */
  bubbleColor?: string
}

export default function ChatBubble({
  side,
  senderLabel,
  text,
  showAudio = false,
  bubbleColor = PEACH,
}: ChatBubbleProps) {
  const [playing, setPlaying] = useState(false)
  const isExaminer = side === 'examiner'

  return (
    <div
      className="flex flex-col"
      style={{
        alignItems: isExaminer ? 'flex-start' : 'flex-end',
        gap: 4,
      }}
    >
      {/* Sender label */}
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          color: INK_MUTED,
          paddingLeft: isExaminer ? 4 : 0,
          paddingRight: isExaminer ? 0 : 4,
        }}
      >
        {senderLabel}
      </span>

      {/* Bubble */}
      <div
        style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: 20,
          borderBottomLeftRadius: isExaminer ? 6 : 20,
          borderBottomRightRadius: isExaminer ? 20 : 6,
          backgroundColor: isExaminer ? bubbleColor : INK,
          color: isExaminer ? INK : '#FFFFFF',
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 15,
          lineHeight: '22px',
        }}
      >
        {text}
      </div>

      {/* Audio playback bar (examiner only) */}
      {isExaminer && showAudio && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingLeft: 4,
            marginTop: 2,
          }}
        >
          <button
            aria-label={playing ? 'Pause audio' : 'Play audio'}
            onClick={() => setPlaying((p) => !p)}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: INK,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {playing ? (
              <Pause size={12} color="#fff" strokeWidth={2.5} />
            ) : (
              <Play size={12} color="#fff" strokeWidth={2.5} />
            )}
          </button>

          {/* Static waveform visualization */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[3, 6, 10, 7, 12, 5, 9, 14, 8, 6, 11, 7, 4, 9, 6].map((h, i) => (
              <div
                key={i}
                style={{
                  width: 2,
                  height: h,
                  borderRadius: 2,
                  backgroundColor: playing ? INK : INK_MUTED,
                  transition: 'background-color 0.2s',
                }}
              />
            ))}
          </div>

          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 11,
              color: INK_MUTED,
            }}
          >
            0:07
          </span>
        </div>
      )}
    </div>
  )
}
