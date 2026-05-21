'use client'

import { useState } from 'react'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import type { QuizQuestionData } from '@/lib/vocab/quiz'

interface QuizQuestionProps {
  question: QuizQuestionData
  questionNumber: number
  totalQuestions: number
  onComplete: (isCorrect: boolean) => void
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D'] as const

type ChoiceState = 'idle' | 'correct' | 'incorrect'

function choiceVisualState(
  index: number,
  submitted: boolean,
  selectedIndex: number | null,
  correctIndex: number,
): ChoiceState {
  if (!submitted) return 'idle'
  if (index === correctIndex) return 'correct'
  if (index === selectedIndex) return 'incorrect'
  return 'idle'
}

function choiceBorderColor(state: ChoiceState, selected: boolean): string {
  if (state === 'correct') return 'var(--cta-primary)'
  if (state === 'incorrect') return 'var(--text-primary)'
  if (selected) return 'var(--cta-primary)'
  return 'var(--rule-default)'
}

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onComplete,
}: QuizQuestionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSelect = (index: number) => {
    if (submitted) return
    setSelectedIndex(index)
  }

  const handleSubmit = () => {
    if (selectedIndex === null || submitted) return
    setSubmitted(true)
  }

  const handleNext = () => {
    if (!submitted || selectedIndex === null) return
    onComplete(selectedIndex === question.correctIndex)
  }

  return (
    <section
      data-testid="quiz-question"
      data-question-index={questionNumber - 1}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        width: '100%',
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      <p
        data-testid="quiz-progress"
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 500,
          fontSize: '0.8125rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          margin: 0,
          textAlign: 'center',
        }}
      >
        Question {questionNumber} sur {totalQuestions}
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          padding: 'clamp(20px, 3vw, 32px) clamp(16px, 2.5vw, 28px)',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--rule-default)',
          borderRadius: 8,
          textAlign: 'center',
        }}
      >
        <span
          data-testid="quiz-prompt"
          style={{
            fontFamily: SERIF_FONT,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(26px, 3.6vw, 40px)',
            lineHeight: 1.15,
            letterSpacing: '-0.015em',
            color: 'var(--text-primary)',
          }}
        >
          {question.chunk.fr}
        </span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
          <span
            data-testid="quiz-prompt-level"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.6875rem',
              letterSpacing: '0.06em',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--accent-primary-soft)',
              padding: '4px 8px',
              borderRadius: 4,
            }}
          >
            {question.chunk.level}
          </span>
          <span
            data-testid="quiz-prompt-source"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 500,
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-subtle)',
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid var(--rule-default)',
            }}
          >
            {question.chunk.source}
          </span>
        </div>
      </div>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {question.choices.map((choice, index) => {
          const state = choiceVisualState(
            index,
            submitted,
            selectedIndex,
            question.correctIndex,
          )
          const selected = selectedIndex === index
          return (
            <li key={index} style={{ width: '100%' }}>
              <button
                type="button"
                data-testid={`quiz-choice-${index}`}
                data-selected={selected}
                data-state={state}
                aria-pressed={selected}
                disabled={submitted}
                onClick={() => handleSelect(index)}
                className="ed-btn-press"
                style={{
                  width: '100%',
                  minHeight: 56,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  fontFamily: SANS_FONT,
                  fontWeight: 500,
                  fontSize: '0.9375rem',
                  textAlign: 'left',
                  color: 'var(--text-primary)',
                  backgroundColor: selected && !submitted
                    ? 'var(--accent-primary-soft)'
                    : 'var(--bg-elevated)',
                  border: `2px solid ${choiceBorderColor(state, selected)}`,
                  borderRadius: 6,
                  cursor: submitted ? 'default' : 'pointer',
                  opacity: submitted && state === 'idle' ? 0.6 : 1,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    width: 28,
                    height: 28,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    flexShrink: 0,
                  }}
                >
                  {CHOICE_LABELS[index]}
                </span>
                <span style={{ flex: 1 }}>{choice}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {submitted ? (
          <button
            type="button"
            data-testid="quiz-next"
            onClick={handleNext}
            className="ed-btn-press"
            style={{
              minHeight: 48,
              padding: '12px 28px',
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'var(--bg-elevated)',
              backgroundColor: 'var(--cta-primary)',
              border: '1px solid var(--cta-primary)',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Question suivante
          </button>
        ) : (
          <button
            type="button"
            data-testid="quiz-submit"
            disabled={selectedIndex === null}
            onClick={handleSubmit}
            className="ed-btn-press"
            style={{
              minHeight: 48,
              padding: '12px 28px',
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: selectedIndex === null ? 'var(--text-muted)' : 'var(--bg-elevated)',
              backgroundColor:
                selectedIndex === null ? 'var(--bg-subtle)' : 'var(--cta-primary)',
              border: '1px solid',
              borderColor:
                selectedIndex === null ? 'var(--rule-default)' : 'var(--cta-primary)',
              borderRadius: 4,
              cursor: selectedIndex === null ? 'not-allowed' : 'pointer',
              opacity: selectedIndex === null ? 0.7 : 1,
            }}
          >
            Valider
          </button>
        )}
      </div>
    </section>
  )
}
