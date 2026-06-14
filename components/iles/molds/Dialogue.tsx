'use client'

import { useState, useRef } from 'react'

export interface Turn {
  speaker: string
  text: string
}

export interface ComprehensionCheck {
  type: 'mcq' | 'vrai-faux'
  question: string
  options: string[]
  correctIndex: number
}

export interface DialogueProps {
  audio: string
  transcript: Turn[]
  comprehensionChecks: ComprehensionCheck[]
}

export default function Dialogue({ audio, transcript, comprehensionChecks }: DialogueProps) {
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => comprehensionChecks.map(() => null)
  )
  const audioRef = useRef<HTMLAudioElement>(null)

  function submit(ci: number, oi: number) {
    setAnswers(prev => {
      if (prev[ci] !== null) return prev
      return prev.map((a, i) => (i === ci ? oi : a))
    })
  }

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
        Le Dialogue
      </p>

      {/* Audio player */}
      <div
        style={{
          background: 'var(--paper-tint)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-md)',
          padding: '16px 20px',
          marginBottom: 20,
        }}
      >
        <audio
          ref={audioRef}
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

      {/* Transcript toggle */}
      <button
        onClick={() => setTranscriptOpen(o => !o)}
        aria-expanded={transcriptOpen}
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
          marginBottom: transcriptOpen ? 16 : 28,
          transition: 'color 150ms var(--ease), border-color 150ms var(--ease)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.color = 'var(--ink)'
          el.style.borderColor = 'var(--ink-faint)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.color = 'var(--ink-soft)'
          el.style.borderColor = 'var(--rule-strong)'
        }}
      >
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 200ms var(--ease)',
            transform: transcriptOpen ? 'rotate(180deg)' : 'none',
            lineHeight: 1,
          }}
        >
          ▾
        </span>
        {transcriptOpen ? 'Masquer la transcription' : 'Voir la transcription'}
      </button>

      {/* Transcript body */}
      {transcriptOpen && (
        <div
          style={{
            background: 'var(--paper-tint)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--r-md)',
            padding: '24px',
            marginBottom: 28,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {transcript.map((turn, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--dominant)',
                  minWidth: 72,
                  paddingTop: 3,
                  flexShrink: 0,
                }}
              >
                {turn.speaker}
              </span>
              <p
                style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.6,
                  color: 'var(--ink)',
                  margin: 0,
                }}
              >
                {turn.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Comprehension checks */}
      <div>
        <p
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-faint)',
            margin: '0 0 20px',
          }}
        >
          Verification de comprehension
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {comprehensionChecks.map((check, ci) => {
            const answered = answers[ci] !== null
            const selectedIdx = answers[ci]
            const isCorrect = selectedIdx === check.correctIndex

            return (
              <div key={ci}>
                <p
                  style={{
                    fontFamily: 'var(--f-body)',
                    fontSize: '1.0625rem',
                    lineHeight: 1.55,
                    color: 'var(--ink)',
                    margin: '0 0 14px',
                  }}
                >
                  {ci + 1}.{'  '}{check.question}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {check.options.map((opt, oi) => {
                    const isSelected = selectedIdx === oi
                    const isThisCorrect = oi === check.correctIndex

                    // Determine option state styling after answer
                    let bg = 'var(--paper-tint)'
                    let borderColor = 'var(--rule-strong)'
                    let color = 'var(--ink)'
                    let cursor = 'pointer'

                    if (answered) {
                      cursor = 'default'
                      if (isSelected && isCorrect) {
                        bg = 'color-mix(in srgb, var(--success) 10%, transparent)'
                        borderColor = 'var(--success)'
                        color = 'var(--success)'
                      } else if (isSelected && !isCorrect) {
                        bg = 'color-mix(in srgb, var(--accent) 8%, transparent)'
                        borderColor = 'var(--accent)'
                        color = 'var(--accent)'
                      } else if (!isSelected && isThisCorrect) {
                        bg = 'color-mix(in srgb, var(--success) 5%, transparent)'
                        borderColor = 'color-mix(in srgb, var(--success) 35%, transparent)'
                        color = 'var(--success)'
                      }
                    }

                    return (
                      <button
                        key={oi}
                        disabled={answered}
                        onClick={() => submit(ci, oi)}
                        style={{
                          background: bg,
                          border: `1px solid ${borderColor}`,
                          borderRadius: 'var(--r-pill)',
                          padding: '10px 22px',
                          fontFamily: 'var(--f-ui)',
                          fontSize: 14,
                          fontWeight: 500,
                          color,
                          cursor,
                          transition: 'background 150ms var(--ease), border-color 150ms var(--ease), color 150ms var(--ease)',
                        }}
                        onMouseEnter={e => {
                          if (answered) return
                          const el = e.currentTarget
                          el.style.background = 'var(--paper-edge)'
                          el.style.borderColor = 'var(--ink-faint)'
                        }}
                        onMouseLeave={e => {
                          if (answered) return
                          const el = e.currentTarget
                          el.style.background = 'var(--paper-tint)'
                          el.style.borderColor = 'var(--rule-strong)'
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {answered && !isCorrect && (
                  <p
                    style={{
                      fontFamily: 'var(--f-ui)',
                      fontSize: 13,
                      color: 'var(--success)',
                      margin: '10px 0 0',
                    }}
                  >
                    Bonne reponse: {check.options[check.correctIndex]}
                  </p>
                )}

                {answered && isCorrect && (
                  <p
                    style={{
                      fontFamily: 'var(--f-ui)',
                      fontSize: 13,
                      color: 'var(--success)',
                      margin: '10px 0 0',
                    }}
                  >
                    Correct.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
