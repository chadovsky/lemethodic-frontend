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
import type { Lesson } from '@/lib/data/lessons'

const SAMPLE: Lesson = {
  id: 5,
  title: 'Les expressions de probabilité',
  description: 'Nuancer une opinion sans surcharger la phrase.',
  section: 'fondations',
  state: 'available',
}

describe('LessonCard', () => {
  it('renders the lesson number, title, and description', () => {
    render(<LessonCard lesson={SAMPLE} />)
    expect(screen.getByTestId('lesson-card-number')).toHaveTextContent('5')
    expect(screen.getByText(SAMPLE.title)).toBeInTheDocument()
    expect(screen.getByText(SAMPLE.description)).toBeInTheDocument()
  })

  it('wraps the card in a link to /ecole/<id>', () => {
    render(<LessonCard lesson={SAMPLE} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/ecole/5')
  })

  it('renders the "Disponible" state badge for an available lesson', () => {
    render(<LessonCard lesson={SAMPLE} />)
    expect(screen.getByTestId('lesson-card-state')).toHaveTextContent('Disponible')
  })

  it('renders the "Terminée" badge for a completed lesson', () => {
    render(<LessonCard lesson={{ ...SAMPLE, id: 1, state: 'completed' }} />)
    expect(screen.getByTestId('lesson-card-state')).toHaveTextContent('Terminée')
  })

  it('renders the "Verrouillée" badge for a locked lesson', () => {
    render(<LessonCard lesson={{ ...SAMPLE, id: 20, state: 'locked' }} />)
    expect(screen.getByTestId('lesson-card-state')).toHaveTextContent('Verrouillée')
  })

  it('exposes data-lesson-id and data-lesson-state for downstream tests', () => {
    render(<LessonCard lesson={SAMPLE} />)
    const card = screen.getByTestId('lesson-card')
    expect(card).toHaveAttribute('data-lesson-id', '5')
    expect(card).toHaveAttribute('data-lesson-state', 'available')
  })
})
