import { render, screen, within, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const mockFetchLessons = vi.fn()

vi.mock('@/lib/api/lessons', () => ({
  fetchLessons: (...args: unknown[]) => mockFetchLessons(...args),
}))

import LessonList from '@/components/ecole/LessonList'
import type { Lesson } from '@/lib/types'

function makeMockLessons(): Lesson[] {
  const lessons: Lesson[] = []
  for (let i = 1; i <= 27; i++) {
    const phase = (i <= 16 ? 1 : 2) as 1 | 2
    const status: Lesson['status'] =
      i <= 3 ? 'completed' : i <= 6 ? 'unlocked' : 'locked'
    lessons.push({
      id: i,
      lessonNumber: i,
      code: i <= 16
        ? `F${String(i).padStart(3, '0')}`
        : `A${String(i - 16).padStart(3, '0')}`,
      title: `Lecon ${i}`,
      shortDescription: `Description de la lecon ${i}.`,
      status,
      quizAttempts: 0,
      quizBestScore: null,
      completedAt: i <= 3 ? '2026-01-01T00:00:00Z' : null,
      phase,
    })
  }
  return lessons
}

describe('LessonList', () => {
  beforeEach(() => {
    mockFetchLessons.mockResolvedValue(makeMockLessons())
  })

  it('renders the page header with title and tagline', async () => {
    render(<LessonList />)
    // h1 text is "L’École" from &rsquo;  &mdash; match via text content
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/la méthode en 27 leçons\./i)).toBeInTheDocument()
  })

  it('renders both section headings in order', async () => {
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

  it('renders 16 lesson cards in the Fondations section in numerical order', async () => {
    render(<LessonList />)
    const section = screen.getByTestId('section-fondations')
    await waitFor(() => expect(within(section).getAllByTestId('lesson-card')).toHaveLength(16))
    const cards = within(section).getAllByTestId('lesson-card')
    cards.forEach((card, i) => {
      expect(card).toHaveAttribute('data-lesson-id', String(i + 1))
    })
  })

  it('renders 11 lesson cards in the Approfondissement section in numerical order', async () => {
    render(<LessonList />)
    const section = screen.getByTestId('section-approfondissement')
    await waitFor(() => expect(within(section).getAllByTestId('lesson-card')).toHaveLength(11))
    const cards = within(section).getAllByTestId('lesson-card')
    cards.forEach((card, i) => {
      expect(card).toHaveAttribute('data-lesson-id', String(17 + i))
    })
  })

  it('renders 27 lesson cards in total', async () => {
    render(<LessonList />)
    await waitFor(() =>
      expect(screen.getAllByTestId('lesson-card')).toHaveLength(27),
    )
  })

  it('applies the locked state-distribution placeholder: 3 completed + 3 available + 21 locked', async () => {
    render(<LessonList />)
    await waitFor(() =>
      expect(screen.getAllByTestId('lesson-card')).toHaveLength(27),
    )
    const cards = screen.getAllByTestId('lesson-card')
    const completed = cards.filter((c) => c.getAttribute('data-lesson-state') === 'completed')
    const available = cards.filter((c) => c.getAttribute('data-lesson-state') === 'available')
    const locked = cards.filter((c) => c.getAttribute('data-lesson-state') === 'locked')
    expect(completed).toHaveLength(3)
    expect(available).toHaveLength(3)
    expect(locked).toHaveLength(21)
  })
})
