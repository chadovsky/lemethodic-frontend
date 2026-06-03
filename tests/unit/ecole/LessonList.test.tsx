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

// F-432 introduced a static LECONS manifest (27 entries, no BE call).
// F-433 flipped leçon 2 (café) from bientôt → available.
// Currently 2 available (leçons 1 & 2), 25 bientôt (leçons 3–27).

describe('LessonList', () => {
  it('renders the page header with title and tagline', () => {
    render(<LessonList />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
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
    expect(
      fondations.compareDocumentPosition(approfondissement) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('renders 16 ile-lecon cards in the Fondations section in numerical order', () => {
    render(<LessonList />)
    const section = screen.getByTestId('section-fondations')
    const cards = within(section).getAllByTestId('ile-lecon-card')
    expect(cards).toHaveLength(16)
    cards.forEach((card, i) => {
      expect(card).toHaveAttribute('data-lecon-number', String(i + 1))
    })
  })

  it('renders 11 ile-lecon cards in the Approfondissement section in numerical order', () => {
    render(<LessonList />)
    const section = screen.getByTestId('section-approfondissement')
    const cards = within(section).getAllByTestId('ile-lecon-card')
    expect(cards).toHaveLength(11)
    cards.forEach((card, i) => {
      expect(card).toHaveAttribute('data-lecon-number', String(17 + i))
    })
  })

  it('renders 27 ile-lecon cards in total', () => {
    render(<LessonList />)
    expect(screen.getAllByTestId('ile-lecon-card')).toHaveLength(27)
  })

  it('2 cards are available (leçons 1 and 2) and 25 are bientôt', () => {
    render(<LessonList />)
    const cards = screen.getAllByTestId('ile-lecon-card')
    const available = cards.filter((c) => c.getAttribute('data-lecon-status') === 'available')
    const bientot = cards.filter((c) => c.getAttribute('data-lecon-status') === 'bientot')
    expect(available).toHaveLength(2)
    expect(bientot).toHaveLength(25)
  })
})
