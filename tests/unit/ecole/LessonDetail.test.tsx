import { render, screen, within, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const mockPush = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

import LessonDetail from '@/components/ecole/LessonDetail'
import type { Lesson } from '@/lib/types'

const LESSON_1: Lesson = {
  id: 1, lessonNumber: 1, code: 'F001',
  title: "L'amorce d'une idee",
  shortDescription: 'Comment ouvrir une reponse sans hesiter.',
  status: 'completed', quizAttempts: 1, quizBestScore: 85, completedAt: '2026-01-01T00:00:00Z',
  phase: 1,
}

const LESSON_3: Lesson = {
  id: 3, lessonNumber: 3, code: 'F003',
  title: 'Les connecteurs essentiels',
  shortDescription: 'Sept connecteurs qui structurent toute prise de parole.',
  status: 'completed', quizAttempts: 1, quizBestScore: 80, completedAt: '2026-01-01T00:00:00Z',
  phase: 1,
}

const LESSON_5: Lesson = {
  id: 5, lessonNumber: 5, code: 'F005',
  title: 'Le rythme de la phrase',
  shortDescription: "Pourquoi le debit trahit le candidat.",
  status: 'unlocked', quizAttempts: 0, quizBestScore: null, completedAt: null,
  phase: 1,
}

const LESSON_17: Lesson = {
  id: 17, lessonNumber: 17, code: 'A001',
  title: "L'argumentation soutenue",
  shortDescription: "Articuler un argument long.",
  status: 'locked', quizAttempts: 0, quizBestScore: null, completedAt: null,
  phase: 2,
}

const LESSON_27: Lesson = {
  id: 27, lessonNumber: 27, code: 'A011',
  title: 'La parole strategique',
  shortDescription: "Gerer le temps imparti.",
  status: 'locked', quizAttempts: 0, quizBestScore: null, completedAt: null,
  phase: 2,
}

describe('LessonDetail', () => {
  beforeEach(() => mockPush.mockClear())

  it("renders the breadcrumb with L'Ecole and lesson number/title", () => {
    render(<LessonDetail lesson={LESSON_3} />)
    const crumb = screen.getByTestId('lesson-breadcrumb')
    expect(within(crumb).getByRole('link')).toHaveAttribute('href', '/la-methode')
    expect(within(crumb).getByText(/leçon\s*3/i)).toBeInTheDocument()
    expect(
      within(crumb).getByText(
        new RegExp(LESSON_3.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      ),
    ).toBeInTheDocument()
  })

  it('renders the Fondations section badge for a phase-1 lesson', () => {
    render(<LessonDetail lesson={LESSON_3} />)
    expect(screen.getByTestId('lesson-section-badge')).toHaveTextContent(/fondations/i)
  })

  it('renders the Approfondissement section badge for a phase-2 lesson', () => {
    render(<LessonDetail lesson={LESSON_17} />)
    expect(screen.getByTestId('lesson-section-badge')).toHaveTextContent(/approfondissement/i)
  })

  it('renders the lesson header with number and title', () => {
    render(<LessonDetail lesson={LESSON_5} />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(LESSON_5.title)
    expect(screen.getByTestId('lesson-detail-number')).toHaveTextContent('5')
  })

  it('renders the audio player placeholder', () => {
    render(<LessonDetail lesson={LESSON_3} />)
    expect(screen.getByTestId('audio-player-placeholder')).toBeInTheDocument()
  })

  it('renders the three content section headings: Introduction, Methode, Pratique', () => {
    render(<LessonDetail lesson={LESSON_3} />)
    expect(screen.getByRole('heading', { level: 2, name: /^introduction$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /^méthode$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /^pratique$/i })).toBeInTheDocument()
  })

  it('renders the three content sections in DOM order', () => {
    render(<LessonDetail lesson={LESSON_3} />)
    const intro = screen.getByTestId('lesson-section-introduction')
    const methode = screen.getByTestId('lesson-section-methode')
    const pratique = screen.getByTestId('lesson-section-pratique')
    expect(
      intro.compareDocumentPosition(methode) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      methode.compareDocumentPosition(pratique) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('lesson 1 - renders no previous-lesson button, only a next button linking to /la-methode/2', () => {
    render(<LessonDetail lesson={LESSON_1} />)
    expect(screen.queryByTestId('lesson-nav-prev')).not.toBeInTheDocument()
    const next = screen.getByTestId('lesson-nav-next')
    expect(next).toHaveAttribute('href', '/la-methode/2')
  })

  it('lesson 27 - renders no next-lesson button, only a prev button linking to /ecole/26', () => {
    render(<LessonDetail lesson={LESSON_27} />)
    expect(screen.queryByTestId('lesson-nav-next')).not.toBeInTheDocument()
    const prev = screen.getByTestId('lesson-nav-prev')
    expect(prev).toHaveAttribute('href', '/la-methode/26')
  })

  it('mid lesson (5) - renders both prev and next buttons', () => {
    render(<LessonDetail lesson={LESSON_5} />)
    expect(screen.getByTestId('lesson-nav-prev')).toHaveAttribute('href', '/la-methode/4')
    expect(screen.getByTestId('lesson-nav-next')).toHaveAttribute('href', '/la-methode/6')
  })

  // MOCK-008 - waveform bars, CEFR badge, keyboard navigation
  it('audio player shows 15 waveform bars', () => {
    render(<LessonDetail lesson={LESSON_3} />)
    expect(screen.getAllByTestId('lesson-waveform-bar')).toHaveLength(15)
  })

  it('audio player shows B1 CEFR badge for a phase-1 lesson', () => {
    render(<LessonDetail lesson={LESSON_3} />)
    const badge = screen.getByTestId('audio-cefr-badge')
    expect(badge).toHaveTextContent('B1')
  })

  it('audio player shows B2 CEFR badge for a phase-2 lesson', () => {
    render(<LessonDetail lesson={LESSON_17} />)
    const badge = screen.getByTestId('audio-cefr-badge')
    expect(badge).toHaveTextContent('B2')
  })

  it('ArrowRight on lesson 5 pushes to /ecole/6', () => {
    render(<LessonDetail lesson={LESSON_5} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(mockPush).toHaveBeenCalledWith('/la-methode/6')
  })

  it('ArrowLeft on lesson 5 pushes to /ecole/4', () => {
    render(<LessonDetail lesson={LESSON_5} />)
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(mockPush).toHaveBeenCalledWith('/la-methode/4')
  })

  it('ArrowLeft on lesson 1 does not push (boundary guard)', () => {
    render(<LessonDetail lesson={LESSON_1} />)
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('ArrowRight on lesson 27 does not push (boundary guard)', () => {
    render(<LessonDetail lesson={LESSON_27} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(mockPush).not.toHaveBeenCalled()
  })
})
