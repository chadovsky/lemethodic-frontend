'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'
import { CHUNKS } from '@/lib/data/chunks'
import { buildQuiz } from '@/lib/vocab/quiz'
import QuizQuestion from './QuizQuestion'
import QuizResults from './QuizResults'

const QUESTION_COUNT = 10

export default function Quiz() {
  const questions = useMemo(() => buildQuiz(CHUNKS, QUESTION_COUNT), [])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)

  const isFinished = index >= questions.length

  const handleComplete = (isCorrect: boolean) => {
    if (isCorrect) setScore((s) => s + 1)
    setIndex((i) => i + 1)
  }

  const restart = () => {
    setIndex(0)
    setScore(0)
  }

  return (
    <div
      data-testid="quiz-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        paddingTop: 8,
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link
          data-testid="quiz-back-to-list"
          href="/la-bibliotheque"
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 500,
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            alignSelf: 'flex-start',
          }}
        >
          ← Retour à la liste
        </Link>
        <h1
          style={{
            fontFamily: SERIF_FONT,
            fontWeight: 500,
            fontSize: 'clamp(32px, 4vw, 52px)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Test
        </h1>
        <p
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 500,
            fontSize: '1rem',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          10 chunks, à vous de retrouver la traduction.
        </p>
      </header>

      {isFinished ? (
        <QuizResults score={score} total={questions.length} onRestart={restart} />
      ) : (
        <QuizQuestion
          key={index}
          question={questions[index]}
          questionNumber={index + 1}
          totalQuestions={questions.length}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
}
