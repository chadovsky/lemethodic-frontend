import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import LessonList from '@/components/ecole/LessonList'

describe('LessonList', () => {
  it('renders the page header with title and tagline', () => {
    render(<LessonList />)
    // Curly right-single-quote (U+2019) renders from &rsquo; — match
    // either curly or straight to stay encoding-agnostic.
    expect(
      screen.getByRole('heading', { level: 1, name: /l[’']école/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/la méthode en 27 leçons\./i)).toBeInTheDocument()
  })

  it('renders both section headings in order', () => {
    render(<LessonList />)
    const fondations = screen.getByRole('heading', { level: 2, name: /^fondations$/i })
    const approfondissement = screen.getByRole('heading', {
      level: 2,
      name: /^approfondissement$/i,
    })
    expect(fondations).toBeInTheDocument()
    expect(approfondissement).toBeInTheDocument()

    // DOM order: fondations must come before approfondissement
    expect(
      fondations.compareDocumentPosition(approfondissement) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('renders 16 lesson cards in the Fondations section in numerical order', () => {
    render(<LessonList />)
    const section = screen.getByTestId('section-fondations')
    const cards = within(section).getAllByTestId('lesson-card')
    expect(cards).toHaveLength(16)
    cards.forEach((card, i) => {
      expect(card).toHaveAttribute('data-lesson-id', String(i + 1))
    })
  })

  it('renders 11 lesson cards in the Approfondissement section in numerical order', () => {
    render(<LessonList />)
    const section = screen.getByTestId('section-approfondissement')
    const cards = within(section).getAllByTestId('lesson-card')
    expect(cards).toHaveLength(11)
    cards.forEach((card, i) => {
      expect(card).toHaveAttribute('data-lesson-id', String(17 + i))
    })
  })

  it('renders 27 lesson cards in total', () => {
    render(<LessonList />)
    expect(screen.getAllByTestId('lesson-card')).toHaveLength(27)
  })

  it('applies the locked state-distribution placeholder: 3 Terminée + 3 Disponible + 21 Verrouillée', () => {
    render(<LessonList />)
    const cards = screen.getAllByTestId('lesson-card')
    const completed = cards.filter((c) => c.getAttribute('data-lesson-state') === 'completed')
    const available = cards.filter((c) => c.getAttribute('data-lesson-state') === 'available')
    const locked = cards.filter((c) => c.getAttribute('data-lesson-state') === 'locked')
    expect(completed).toHaveLength(3)
    expect(available).toHaveLength(3)
    expect(locked).toHaveLength(21)
  })
})
