'use client'

import { useState } from 'react'
import Link from 'next/link'

const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'
const INK        = '#1A1A1A'
const INK_MUTED  = '#1A1A1A66'
const CTA_BG     = '#1A1A1A'
const SAGE       = '#D4E4D0'
const BLUSH      = '#F5D6D6'
const BG         = 'var(--fp-canvas)'

interface Question {
  question: string
  options: string[]
  correctIndex: number
}

// Hardcoded lesson 5 questions — placeholder content
const QUIZ_QUESTIONS: Question[] = [
  {
    question: 'Fill in the blank: "Je vais ___ Paris demain."',
    options: ['de', 'en', 'à', 'dans'],
    correctIndex: 2,
  },
  {
    question: 'Which preposition expresses "inside a period of time"?',
    options: ['à', 'de', 'en', 'dans'],
    correctIndex: 3,
  },
  {
    question: 'Complete: "Il revient ___ France la semaine prochaine."',
    options: ['à', 'de', 'en', 'dans'],
    correctIndex: 2,
  },
  {
    question: 'What does "parler de quelque chose" translate to?',
    options: ['to talk to something', 'to talk about something', 'to talk with something', 'to talk for something'],
    correctIndex: 1,
  },
  {
    question: 'Choose the correct sentence:',
    options: [
      'Je travaille dans le matin.',
      'Je travaille au matin.',
      'Je travaille le matin.',
      'Je travaille en matin.',
    ],
    correctIndex: 2,
  },
]

export default function QuizClient({ lessonId }: { lessonId: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = QUIZ_QUESTIONS[currentIndex]
  const total = QUIZ_QUESTIONS.length
  const isCorrect = selectedOption === question.correctIndex

  function handleConfirm() {
    if (selectedOption === null) return
    setConfirmed(true)
    if (isCorrect) setScore((s) => s + 1)
  }

  function handleNext() {
    if (currentIndex + 1 >= total) {
      setFinished(true)
    } else {
      setCurrentIndex((i) => i + 1)
      setSelectedOption(null)
      setConfirmed(false)
    }
  }

  if (finished) {
    return (
      <div
        style={{
          padding: '48px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 28,
            color: INK,
            margin: 0,
          }}
        >
          {score}/{total} correct
        </p>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 15,
            color: INK_MUTED,
            margin: 0,
          }}
        >
          {score === total ? 'Perfect score — lesson complete.' : 'Good effort. Review the lesson and try again.'}
        </p>
        <Link
          href="/"
          style={{
            marginTop: 24,
            display: 'inline-block',
            padding: '0 32px',
            height: 52,
            lineHeight: '52px',
            borderRadius: 14,
            backgroundColor: CTA_BG,
            color: '#FFFFFF',
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
          }}
        >
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <main style={{ padding: '24px 20px 100px' }}>
      {/* Progress header */}
      <p
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 600,
          fontSize: 13,
          color: INK_MUTED,
          margin: 0,
          marginBottom: 8,
        }}
      >
        Question {currentIndex + 1} of {total}
      </p>

      {/* Progress bar */}
      <div
        style={{
          height: 4,
          borderRadius: 100,
          backgroundColor: '#1A1A1A12',
          marginBottom: 32,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((currentIndex) / total) * 100}%`,
            backgroundColor: CTA_BG,
            borderRadius: 100,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Question */}
      <h2
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 20,
          lineHeight: '28px',
          color: INK,
          margin: 0,
          marginBottom: 24,
        }}
      >
        {question.question}
      </h2>

      {/* Answer options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {question.options.map((option, i) => {
          const isSelected = selectedOption === i
          const isThisCorrect = i === question.correctIndex

          let bg = '#FFFFFF'
          let border = '1.5px solid #1A1A1A14'
          let textColor = INK

          if (confirmed) {
            if (isThisCorrect) {
              bg = SAGE
              border = `2px solid var(--fp-sage-deep)`
              textColor = '#1A4A2E'
            } else if (isSelected && !isThisCorrect) {
              bg = BLUSH
              border = `2px solid #C0474C`
              textColor = '#7A1C20'
            }
          } else if (isSelected) {
            border = `2px solid ${CTA_BG}`
          }

          return (
            <button
              key={i}
              onClick={() => !confirmed && setSelectedOption(i)}
              disabled={confirmed}
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: 16,
                backgroundColor: bg,
                border,
                fontFamily: DISPLAY_FONT,
                fontWeight: isSelected ? 700 : 600,
                fontSize: 15,
                color: textColor,
                textAlign: 'left',
                cursor: confirmed ? 'default' : 'pointer',
                transition: 'all 0.15s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
              }}
            >
              {option}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {confirmed && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            borderRadius: 12,
            backgroundColor: isCorrect ? SAGE : BLUSH,
            fontFamily: DISPLAY_FONT,
            fontWeight: 600,
            fontSize: 14,
            color: isCorrect ? '#1A4A2E' : '#7A1C20',
          }}
        >
          {isCorrect ? 'Correct.' : `Incorrect. The right answer is: ${question.options[question.correctIndex]}`}
        </div>
      )}

      {/* Bottom CTA */}
      <div style={{ marginTop: 32 }}>
        {!confirmed ? (
          <button
            onClick={handleConfirm}
            disabled={selectedOption === null}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 16,
              backgroundColor: selectedOption !== null ? CTA_BG : '#1A1A1A33',
              color: '#FFFFFF',
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              cursor: selectedOption !== null ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.15s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Check answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 16,
              backgroundColor: CTA_BG,
              color: '#FFFFFF',
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {currentIndex + 1 >= total ? 'See results' : 'Next question'}
          </button>
        )}
      </div>
    </main>
  )
}
