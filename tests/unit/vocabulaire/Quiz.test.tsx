import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Quiz from '@/components/vocabulaire/Quiz'
import { CHUNKS } from '@/lib/data/chunks'
import { buildQuiz } from '@/lib/vocab/quiz'

const QUIZ = buildQuiz(CHUNKS, 10)

function answerCurrent(correctly: boolean) {
  const wrapper = screen.getByTestId('quiz-question')
  const qIndex = Number(wrapper.getAttribute('data-question-index'))
  const correctIndex = QUIZ[qIndex].correctIndex
  const choiceIndex = correctly ? correctIndex : (correctIndex + 1) % 4
  fireEvent.click(screen.getByTestId(`quiz-choice-${choiceIndex}`))
  fireEvent.click(screen.getByTestId('quiz-submit'))
  act(() => vi.advanceTimersByTime(250))
  fireEvent.click(screen.getByTestId('quiz-next'))
}

describe('Quiz', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders header "Test" with descriptor and back-to-list link', () => {
    render(<Quiz />)
    expect(screen.getByRole('heading', { level: 1, name: /^test$/i })).toBeInTheDocument()
    expect(
      screen.getByText(/10 chunks, à vous de retrouver la traduction\./i),
    ).toBeInTheDocument()
    expect(screen.getByTestId('quiz-back-to-list')).toHaveAttribute('href', '/vocabulaire')
  })

  it('starts on question 1 of 10 with Submit disabled', () => {
    render(<Quiz />)
    expect(screen.getByTestId('quiz-progress')).toHaveTextContent(/question 1 sur 10/i)
    expect(screen.getByTestId('quiz-submit')).toBeDisabled()
    expect(screen.getByTestId('quiz-question')).toHaveAttribute('data-question-index', '0')
  })

  it('advancing past a question increments progress and resets selection', () => {
    render(<Quiz />)
    answerCurrent(true)
    expect(screen.getByTestId('quiz-progress')).toHaveTextContent(/question 2 sur 10/i)
    expect(screen.getByTestId('quiz-submit')).toBeDisabled()
    expect(screen.getByTestId('quiz-question')).toHaveAttribute('data-question-index', '1')
  })

  it('completing all 10 questions correctly shows the results panel with score 10/10', () => {
    render(<Quiz />)
    for (let i = 0; i < 10; i++) {
      answerCurrent(true)
    }
    expect(screen.queryByTestId('quiz-question')).not.toBeInTheDocument()
    expect(screen.getByTestId('quiz-results')).toBeInTheDocument()
    expect(screen.getByTestId('quiz-results-score')).toHaveTextContent(/10\s*\/\s*10/)
    expect(screen.getByTestId('quiz-results-restart')).toBeInTheDocument()
    expect(screen.getByTestId('quiz-results-back-to-list')).toHaveAttribute('href', '/vocabulaire')
  })

  it('completing all 10 questions incorrectly shows the results panel with score 0/10', () => {
    render(<Quiz />)
    for (let i = 0; i < 10; i++) {
      answerCurrent(false)
    }
    expect(screen.getByTestId('quiz-results-score')).toHaveTextContent(/0\s*\/\s*10/)
  })

  it('Recommencer from the results panel returns to question 1, fresh state', () => {
    render(<Quiz />)
    for (let i = 0; i < 10; i++) {
      answerCurrent(true)
    }
    fireEvent.click(screen.getByTestId('quiz-results-restart'))
    expect(screen.getByTestId('quiz-progress')).toHaveTextContent(/question 1 sur 10/i)
    expect(screen.getByTestId('quiz-question')).toHaveAttribute('data-question-index', '0')
    expect(screen.getByTestId('quiz-submit')).toBeDisabled()
  })

  it('mixed answers produce the matching score', () => {
    render(<Quiz />)
    const pattern = [true, true, true, false, true, false, true, true, false, true]
    for (const correct of pattern) {
      answerCurrent(correct)
    }
    expect(screen.getByTestId('quiz-results-score')).toHaveTextContent(/7\s*\/\s*10/)
  })

  it('does NOT contain an <audio> element', () => {
    const { container } = render(<Quiz />)
    expect(container.querySelector('audio')).toBeNull()
  })
})
