import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import QuizQuestion from '@/components/vocabulaire/QuizQuestion'
import type { QuizQuestionData } from '@/lib/vocab/quiz'
import type { Chunk } from '@/lib/data/chunks'

const PROMPT: Chunk = {
  id: 13,
  fr: 'Ça tombe à pic',
  en: "That's perfect timing",
  level: 'B1',
  source: 'Conversation',
}

const QUESTION: QuizQuestionData = {
  chunk: PROMPT,
  choices: ["That's perfect timing", 'Actually', 'In my opinion', 'To wait in line'],
  correctIndex: 0,
}

describe('QuizQuestion', () => {
  it('renders the French prompt, CEFR badge, and source pill', () => {
    render(
      <QuizQuestion
        question={QUESTION}
        questionNumber={1}
        totalQuestions={10}
        onComplete={() => {}}
      />,
    )
    expect(screen.getByTestId('quiz-prompt')).toHaveTextContent('Ça tombe à pic')
    expect(screen.getByTestId('quiz-prompt-level')).toHaveTextContent('B1')
    expect(screen.getByTestId('quiz-prompt-source')).toHaveTextContent('Conversation')
  })

  it('renders 4 choice buttons labeled A, B, C, D in order', () => {
    render(
      <QuizQuestion
        question={QUESTION}
        questionNumber={1}
        totalQuestions={10}
        onComplete={() => {}}
      />,
    )
    const labels = ['A', 'B', 'C', 'D']
    for (let i = 0; i < 4; i++) {
      const choice = screen.getByTestId(`quiz-choice-${i}`)
      expect(choice).toHaveTextContent(QUESTION.choices[i])
      expect(choice).toHaveTextContent(labels[i])
    }
  })

  it('Submit is disabled until a choice is selected', () => {
    render(
      <QuizQuestion
        question={QUESTION}
        questionNumber={1}
        totalQuestions={10}
        onComplete={() => {}}
      />,
    )
    const submit = screen.getByTestId('quiz-submit')
    expect(submit).toBeDisabled()
    fireEvent.click(screen.getByTestId('quiz-choice-1'))
    expect(submit).toBeEnabled()
  })

  it('selecting a choice marks it via data-selected and clears others', () => {
    render(
      <QuizQuestion
        question={QUESTION}
        questionNumber={1}
        totalQuestions={10}
        onComplete={() => {}}
      />,
    )
    fireEvent.click(screen.getByTestId('quiz-choice-1'))
    expect(screen.getByTestId('quiz-choice-1')).toHaveAttribute('data-selected', 'true')
    expect(screen.getByTestId('quiz-choice-0')).toHaveAttribute('data-selected', 'false')

    fireEvent.click(screen.getByTestId('quiz-choice-2'))
    expect(screen.getByTestId('quiz-choice-2')).toHaveAttribute('data-selected', 'true')
    expect(screen.getByTestId('quiz-choice-1')).toHaveAttribute('data-selected', 'false')
  })

  it('after Submit, choices freeze and Question suivante replaces Submit', () => {
    render(
      <QuizQuestion
        question={QUESTION}
        questionNumber={1}
        totalQuestions={10}
        onComplete={() => {}}
      />,
    )
    fireEvent.click(screen.getByTestId('quiz-choice-1'))
    fireEvent.click(screen.getByTestId('quiz-submit'))
    expect(screen.queryByTestId('quiz-submit')).not.toBeInTheDocument()
    expect(screen.getByTestId('quiz-next')).toBeInTheDocument()
  })

  it('after Submit with wrong choice, the correct choice shows data-state=correct and the selected wrong choice shows data-state=incorrect', () => {
    render(
      <QuizQuestion
        question={QUESTION}
        questionNumber={1}
        totalQuestions={10}
        onComplete={() => {}}
      />,
    )
    // Correct is index 0; click 1 (wrong)
    fireEvent.click(screen.getByTestId('quiz-choice-1'))
    fireEvent.click(screen.getByTestId('quiz-submit'))

    expect(screen.getByTestId('quiz-choice-0')).toHaveAttribute('data-state', 'correct')
    expect(screen.getByTestId('quiz-choice-1')).toHaveAttribute('data-state', 'incorrect')
    expect(screen.getByTestId('quiz-choice-2')).toHaveAttribute('data-state', 'idle')
    expect(screen.getByTestId('quiz-choice-3')).toHaveAttribute('data-state', 'idle')
  })

  it('after Submit with correct choice, only the correct choice is highlighted (correct), others are idle', () => {
    render(
      <QuizQuestion
        question={QUESTION}
        questionNumber={1}
        totalQuestions={10}
        onComplete={() => {}}
      />,
    )
    fireEvent.click(screen.getByTestId('quiz-choice-0'))
    fireEvent.click(screen.getByTestId('quiz-submit'))

    expect(screen.getByTestId('quiz-choice-0')).toHaveAttribute('data-state', 'correct')
    expect(screen.getByTestId('quiz-choice-1')).toHaveAttribute('data-state', 'idle')
    expect(screen.getByTestId('quiz-choice-2')).toHaveAttribute('data-state', 'idle')
    expect(screen.getByTestId('quiz-choice-3')).toHaveAttribute('data-state', 'idle')
  })

  it('clicking Question suivante calls onComplete with isCorrect=true for a correct answer', () => {
    const onComplete = vi.fn()
    render(
      <QuizQuestion
        question={QUESTION}
        questionNumber={1}
        totalQuestions={10}
        onComplete={onComplete}
      />,
    )
    fireEvent.click(screen.getByTestId('quiz-choice-0'))
    fireEvent.click(screen.getByTestId('quiz-submit'))
    fireEvent.click(screen.getByTestId('quiz-next'))
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith(true)
  })

  it('clicking Question suivante calls onComplete with isCorrect=false for a wrong answer', () => {
    const onComplete = vi.fn()
    render(
      <QuizQuestion
        question={QUESTION}
        questionNumber={1}
        totalQuestions={10}
        onComplete={onComplete}
      />,
    )
    fireEvent.click(screen.getByTestId('quiz-choice-2'))
    fireEvent.click(screen.getByTestId('quiz-submit'))
    fireEvent.click(screen.getByTestId('quiz-next'))
    expect(onComplete).toHaveBeenCalledWith(false)
  })

  it('after Submit, clicking a choice does not change selection (frozen)', () => {
    render(
      <QuizQuestion
        question={QUESTION}
        questionNumber={1}
        totalQuestions={10}
        onComplete={() => {}}
      />,
    )
    fireEvent.click(screen.getByTestId('quiz-choice-1'))
    fireEvent.click(screen.getByTestId('quiz-submit'))
    fireEvent.click(screen.getByTestId('quiz-choice-3'))
    expect(screen.getByTestId('quiz-choice-1')).toHaveAttribute('data-selected', 'true')
    expect(screen.getByTestId('quiz-choice-3')).toHaveAttribute('data-selected', 'false')
  })

  it('does NOT contain an <audio> element', () => {
    const { container } = render(
      <QuizQuestion
        question={QUESTION}
        questionNumber={1}
        totalQuestions={10}
        onComplete={() => {}}
      />,
    )
    expect(container.querySelector('audio')).toBeNull()
  })
})
