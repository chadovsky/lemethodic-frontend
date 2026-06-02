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

import LessonCard from '@/components/ecole/LessonCard'
import type { Lesson } from '@/lib/types'

const SAMPLE: Lesson = {
  id: 5,
  lessonNumber: 5,
  code: 'F005',
  title: 'Les expressions de probabilité',
  shortDescription: 'Nuancer une opinion sans surcharger la phrase.',
  status: 'unlocked',
  quizAttempts: 0,
  quizBestScore: null,
  completedAt: null,
  phase: 1,
}

describe('LessonCard', () => {
  it('renders the lesson number, title, and description', () => {
    render(<LessonCard lesson={SAMPLE} />)
    expect(screen.getByTestId('lesson-card-number')).toHaveTextContent('5')
    expect(screen.getByText(SAMPLE.title)).toBeInTheDocument()
    expect(screen.getByText(SAMPLE.shortDescription)).toBeInTheDocument()
  })

  it('wraps the card in a link to /la-methode/<lessonNumber>', () => {
    render(<LessonCard lesson={SAMPLE} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/la-methode/lecon-5')
  })

  it('renders the "Disponible" state badge for an unlocked lesson', () => {
    render(<LessonCard lesson={SAMPLE} />)
    expect(screen.getByTestId('lesson-card-state')).toHaveTextContent('Disponible')
  })

  it('renders the "Disponible" badge for an in_progress lesson', () => {
    render(<LessonCard lesson={{ ...SAMPLE, status: 'in_progress' }} />)
    expect(screen.getByTestId('lesson-card-state')).toHaveTextContent('Disponible')
  })

  it('renders the "Terminée" badge for a completed lesson', () => {
    render(<LessonCard lesson={{ ...SAMPLE, id: 1, lessonNumber: 1, status: 'completed' }} />)
    expect(screen.getByTestId('lesson-card-state')).toHaveTextContent('Terminée')
  })

  it('renders the "Verrouillée" badge for a locked lesson', () => {
    render(<LessonCard lesson={{ ...SAMPLE, id: 20, lessonNumber: 20, status: 'locked' }} />)
    expect(screen.getByTestId('lesson-card-state')).toHaveTextContent('Verrouillée')
  })

  it('exposes data-lesson-id and data-lesson-state for downstream tests', () => {
    render(<LessonCard lesson={SAMPLE} />)
    const card = screen.getByTestId('lesson-card')
    expect(card).toHaveAttribute('data-lesson-id', '5')
    expect(card).toHaveAttribute('data-lesson-state', 'available')
  })

  it('completed lesson has data-lesson-state="completed"', () => {
    render(<LessonCard lesson={{ ...SAMPLE, id: 1, lessonNumber: 1, status: 'completed' }} />)
    expect(screen.getByTestId('lesson-card')).toHaveAttribute('data-lesson-state', 'completed')
  })

  it('locked lesson has data-lesson-state="locked"', () => {
    render(<LessonCard lesson={{ ...SAMPLE, id: 20, lessonNumber: 20, status: 'locked' }} />)
    expect(screen.getByTestId('lesson-card')).toHaveAttribute('data-lesson-state', 'locked')
  })

  // MOCK-008 — lock icon, conditional ed-card-lift, opacity
  it('renders a lock icon for a locked lesson', () => {
    render(<LessonCard lesson={{ ...SAMPLE, id: 20, lessonNumber: 20, status: 'locked' }} />)
    expect(screen.getByTestId('lesson-lock-icon')).toBeInTheDocument()
  })

  it('does not render a lock icon for available or completed lessons', () => {
    render(<LessonCard lesson={SAMPLE} />)
    expect(screen.queryByTestId('lesson-lock-icon')).not.toBeInTheDocument()
  })

  it('locked card does not have ed-card-lift class', () => {
    render(<LessonCard lesson={{ ...SAMPLE, id: 20, lessonNumber: 20, status: 'locked' }} />)
    const card = screen.getByTestId('lesson-card')
    expect(card.className).not.toMatch(/ed-card-lift/)
  })

  it('available card has ed-card-lift class', () => {
    render(<LessonCard lesson={SAMPLE} />)
    const card = screen.getByTestId('lesson-card')
    expect(card.className).toMatch(/ed-card-lift/)
  })

  it('locked card has opacity 0.65', () => {
    render(<LessonCard lesson={{ ...SAMPLE, id: 20, lessonNumber: 20, status: 'locked' }} />)
    const card = screen.getByTestId('lesson-card')
    expect(card).toHaveStyle({ opacity: '0.65' })
  })
})
