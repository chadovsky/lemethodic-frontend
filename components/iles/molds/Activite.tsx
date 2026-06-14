'use client'

import { useState } from 'react'

// ---- Comprehension ----
export interface ComprehensionProps {
  subtype: 'comprehension'
  question: string
  options: string[]
  correctIndex: number
  feedbackCorrect?: string
  feedbackWrong?: string
}

// ---- Reflexe ----
export interface ReflexeItem {
  prompt: string
  expected: string
}
export interface ReflexeProps {
  subtype: 'reflexe'
  items: ReflexeItem[]
}

// ---- Reemploi ----
export interface ReemploiItem {
  prompt: string
  modelAnswer: string
}
export interface ReemploiProps {
  subtype: 'reemploi'
  items: ReemploiItem[]
}

// ---- Conversation ----
export interface ConversationProps {
  subtype: 'conversation'
  scenario: string
  openingPrompt: string
}

export type ActiviteProps =
  | ComprehensionProps
  | ReflexeProps
  | ReemploiProps
  | ConversationProps

// ---- Subtype label display ----
const SUBTYPE_LABELS: Record<string, string> = {
  comprehension: 'Comprehension',
  reflexe: 'Reflexe',
  reemploi: 'Reemploi',
  conversation: 'Conversation',
}

// ---- Branch: Comprehension ----
function ComprehensionBranch(props: ComprehensionProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  const isCorrect = selected === props.correctIndex

  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--f-body)',
          fontSize: '1.0625rem',
          lineHeight: 1.55,
          color: 'var(--ink)',
          margin: '0 0 16px',
        }}
      >
        {props.question}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {props.options.map((opt, oi) => {
          const isSelected = selected === oi
          const isThisCorrect = oi === props.correctIndex
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
              onClick={() => setSelected(oi)}
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
                transition:
                  'background 150ms var(--ease), border-color 150ms var(--ease), color 150ms var(--ease)',
              }}
              onMouseEnter={e => {
                if (answered) return
                e.currentTarget.style.background = 'var(--paper-edge)'
                e.currentTarget.style.borderColor = 'var(--ink-faint)'
              }}
              onMouseLeave={e => {
                if (answered) return
                e.currentTarget.style.background = 'var(--paper-tint)'
                e.currentTarget.style.borderColor = 'var(--rule-strong)'
              }}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <p
          style={{
            fontFamily: 'var(--f-ui)',
            fontSize: 13,
            color: isCorrect ? 'var(--success)' : 'var(--accent)',
            margin: '12px 0 0',
          }}
        >
          {isCorrect
            ? (props.feedbackCorrect ?? 'Correct.')
            : props.feedbackWrong
            ? `${props.feedbackWrong} — Bonne reponse: ${props.options[props.correctIndex]}`
            : `Bonne reponse: ${props.options[props.correctIndex]}`}
        </p>
      )}
    </div>
  )
}

// ---- Branch: Reflexe ----
function ReflexeBranch({ items }: ReflexeProps) {
  const [revealed, setRevealed] = useState<boolean[]>(() => items.map(() => false))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            background: 'var(--paper-tint)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--r-md)',
            padding: '16px 20px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--f-body)',
              fontSize: '1.0625rem',
              lineHeight: 1.55,
              color: 'var(--ink)',
              margin: '0 0 12px',
            }}
          >
            {item.prompt}
          </p>
          {revealed[i] ? (
            <p
              style={{
                fontFamily: 'var(--f-ui)',
                fontSize: 14,
                color: 'var(--success)',
                margin: 0,
                borderTop: '1px solid var(--rule)',
                paddingTop: 10,
              }}
            >
              {item.expected}
            </p>
          ) : (
            <button
              onClick={() =>
                setRevealed(prev => prev.map((v, idx) => (idx === i ? true : v)))
              }
              style={{
                background: 'transparent',
                border: '1px solid var(--rule-strong)',
                borderRadius: 'var(--r-pill)',
                padding: '7px 16px',
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
              Reveler la reponse
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// ---- Branch: Reemploi ----
function ReemploiBranch({ items }: ReemploiProps) {
  const [revealed, setRevealed] = useState<boolean[]>(() => items.map(() => false))
  const [inputs, setInputs] = useState<string[]>(() => items.map(() => ''))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            background: 'var(--paper-tint)',
            border: '1px solid var(--rule)',
            borderRadius: 'var(--r-md)',
            padding: '16px 20px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--f-body)',
              fontSize: '1.0625rem',
              lineHeight: 1.55,
              color: 'var(--ink)',
              margin: '0 0 12px',
            }}
          >
            {item.prompt}
          </p>
          <textarea
            value={inputs[i]}
            onChange={e =>
              setInputs(prev => prev.map((v, idx) => (idx === i ? e.target.value : v)))
            }
            placeholder="Votre reponse..."
            rows={2}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: 'var(--f-body)',
              fontSize: '1rem',
              lineHeight: 1.55,
              color: 'var(--ink)',
              background: 'var(--paper)',
              border: '1px solid var(--rule-strong)',
              borderRadius: 'var(--r-sm)',
              padding: '10px 14px',
              resize: 'vertical',
              outline: 'none',
              marginBottom: 10,
              transition: 'border-color 150ms var(--ease)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--dominant)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'var(--rule-strong)'
            }}
          />
          {revealed[i] ? (
            <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 10 }}>
              <p
                style={{
                  fontFamily: 'var(--f-mono)',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
                  margin: '0 0 6px',
                }}
              >
                Modele
              </p>
              <p
                style={{
                  fontFamily: 'var(--f-body)',
                  fontSize: '1rem',
                  lineHeight: 1.55,
                  color: 'var(--success)',
                  margin: 0,
                }}
              >
                {item.modelAnswer}
              </p>
            </div>
          ) : (
            <button
              onClick={() =>
                setRevealed(prev => prev.map((v, idx) => (idx === i ? true : v)))
              }
              style={{
                background: 'transparent',
                border: '1px solid var(--rule-strong)',
                borderRadius: 'var(--r-pill)',
                padding: '7px 16px',
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
              Voir le modele
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// ---- Branch: Conversation ----
function ConversationBranch({ scenario, openingPrompt }: ConversationProps) {
  return (
    <div>
      <div
        style={{
          background: 'var(--paper-tint)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-md)',
          padding: '16px 20px',
          marginBottom: 14,
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
          Scenario
        </p>
        <p
          style={{
            fontFamily: 'var(--f-body)',
            fontSize: '1.0625rem',
            lineHeight: 1.55,
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          {scenario}
        </p>
      </div>
      <div
        style={{
          background: 'var(--paper-tint)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-md)',
          padding: '16px 20px',
          marginBottom: 16,
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
          Amorce
        </p>
        <p
          style={{
            fontFamily: 'var(--f-body)',
            fontSize: '1.0625rem',
            lineHeight: 1.55,
            color: 'var(--ink)',
            margin: 0,
          }}
        >
          {openingPrompt}
        </p>
      </div>
      {/* BE SEAM: Le Maître live conversation wires in F-409 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: 0.5,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--r-pill)',
            background: 'var(--dominant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--f-display)',
              fontSize: 14,
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
          La conversation guidée avec Le Maître arrive bientôt.
        </p>
      </div>
    </div>
  )
}

// ---- Main export ----
export default function Activite(props: ActiviteProps) {
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
      {/* Mold label + subtype badge */}
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
          {"L'Activite"}
        </p>
        <span
          style={{
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--dominant)',
            background: 'color-mix(in srgb, var(--dominant) 7%, transparent)',
            borderRadius: 'var(--r-pill)',
            padding: '3px 10px',
          }}
        >
          {SUBTYPE_LABELS[props.subtype] ?? props.subtype}
        </span>
      </div>

      {props.subtype === 'comprehension' && <ComprehensionBranch {...props} />}
      {props.subtype === 'reflexe' && <ReflexeBranch {...props} />}
      {props.subtype === 'reemploi' && <ReemploiBranch {...props} />}
      {props.subtype === 'conversation' && <ConversationBranch {...props} />}
    </section>
  )
}
