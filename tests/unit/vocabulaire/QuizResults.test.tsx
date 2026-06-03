import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import QuizResults from '@/components/vocabulaire/QuizResults'

describe('QuizResults', () => {
  it('renders the score "4 / 10" for score=4', () => {
    render(<QuizResults score={4} total={10} onRestart={() => {}} />)
    expect(screen.getByTestId('quiz-results-score')).toHaveTextContent('4')
    expect(screen.getByTestId('quiz-results-score')).toHaveTextContent('10')
  })

  it('score ≤4 shows "À revoir" flavor copy', () => {
    render(<QuizResults score={4} total={10} onRestart={() => {}} />)
    expect(screen.getByTestId('quiz-results-flavor')).toHaveTextContent(
      'À revoir. Répétez la pratique régulièrement.',
    )
  })

  it('score 0 also shows "À revoir" flavor copy', () => {
    render(<QuizResults score={0} total={10} onRestart={() => {}} />)
    expect(screen.getByTestId('quiz-results-flavor')).toHaveTextContent(
      'À revoir. Répétez la pratique régulièrement.',
    )
  })

  it('score 5–7 shows "Bien" flavor copy', () => {
    render(<QuizResults score={7} total={10} onRestart={() => {}} />)
    expect(screen.getByTestId('quiz-results-flavor')).toHaveTextContent(
      'Bien. Continuez à pratiquer.',
    )
  })

  it('score 5 also shows "Bien" flavor copy', () => {
    render(<QuizResults score={5} total={10} onRestart={() => {}} />)
    expect(screen.getByTestId('quiz-results-flavor')).toHaveTextContent(
      'Bien. Continuez à pratiquer.',
    )
  })

  it('score 8–10 shows "Excellent" flavor copy', () => {
    render(<QuizResults score={10} total={10} onRestart={() => {}} />)
    expect(screen.getByTestId('quiz-results-flavor')).toHaveTextContent(
      'Excellent. Votre réservoir lexical est solide.',
    )
  })

  it('score 8 also shows "Excellent" flavor copy', () => {
    render(<QuizResults score={8} total={10} onRestart={() => {}} />)
    expect(screen.getByTestId('quiz-results-flavor')).toHaveTextContent(
      'Excellent. Votre réservoir lexical est solide.',
    )
  })

  it('renders restart button and back-to-list link', () => {
    render(<QuizResults score={7} total={10} onRestart={() => {}} />)
    expect(screen.getByTestId('quiz-results-restart')).toBeInTheDocument()
    expect(screen.getByTestId('quiz-results-back-to-list')).toHaveAttribute('href', '/bibliotheque')
  })
})
