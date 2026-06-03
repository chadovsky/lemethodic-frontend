import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Lesson } from '@/lib/types'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

import LessonList from '@/components/ecole/LessonList'

function makeMockLessons(): Lesson[] {
  return Array.from({ length: 27 }, (_, i) => ({
    id: i + 1,
    lessonNumber: i + 1,
    code: i < 16 ? `F${String(i + 1).padStart(3, '0')}` : `A${String(i - 15).padStart(3, '0')}`,
    title: `Leçon ${i + 1}`,
    shortDescription: `Description de la leçon ${i + 1}.`,
    status: (i < 3 ? 'completed' : i < 6 ? 'unlocked' : 'locked') as Lesson['status'],
    quizAttempts: 0,
    quizBestScore: null,
    completedAt: i < 3 ? '2026-01-01T00:00:00Z' : null,
    phase: (i < 16 ? 1 : 2) as 1 | 2,
  }))
}

const MOCK_LESSONS = makeMockLessons()

describe('LessonList', () => {
  it('renders the page header with title and tagline', () => {
    render(<LessonList lessons={MOCK_LESSONS} />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/la méthode en 27 leçons\./i)).toBeInTheDocument()
  })

  it('renders both section headings in order', () => {
    render(<LessonList lessons={MOCK_LESSONS} />)
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

  it('renders 16 lesson cards in the Fondations section in numerical order', () => {
    render(<LessonList lessons={MOCK_LESSONS} />)
    const section = screen.getByTestId('section-fondations')
    const cards = within(section).getAllByTestId('lesson-card')
    expect(cards).toHaveLength(16)
    cards.forEach((card, i) => {
      expect(card).toHaveAttribute('data-lesson-id', String(i + 1))
    })
  })

  it('renders 11 lesson cards in the Approfondissement section in numerical order', () => {
    render(<LessonList lessons={MOCK_LESSONS} />)
    const section = screen.getByTestId('section-approfondissement')
    const cards = within(section).getAllByTestId('lesson-card')
    expect(cards).toHaveLength(11)
    cards.forEach((card, i) => {
      expect(card).toHaveAttribute('data-lesson-id', String(17 + i))
    })
  })

  it('renders 27 lesson cards in total', () => {
    render(<LessonList lessons={MOCK_LESSONS} />)
    expect(screen.getAllByTestId('lesson-card')).toHaveLength(27)
  })

  it('lessons 1–3 show Terminée badge (completed)', () => {
    render(<LessonList lessons={MOCK_LESSONS} />)
    for (const id of [1, 2, 3]) {
      const badge = screen
        .getAllByTestId('lesson-card')
        .find((c) => c.getAttribute('data-lesson-id') === String(id))!
        .querySelector('[data-testid="lesson-card-state"]')
      expect(badge).toBeTruthy()
      expect(badge!.textContent).toMatch(/terminée/i)
    }
  })
})
