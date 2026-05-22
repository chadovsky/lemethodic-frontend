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
import { getLessonById } from '@/lib/data/lessons'

describe('LessonDetail', () => {
  beforeEach(() => mockPush.mockClear())

  it('renders the breadcrumb with L\'École and lesson number/title', () => {
    const lesson = getLessonById(3)!
    render(<LessonDetail lesson={lesson} />)
    const crumb = screen.getByTestId('lesson-breadcrumb')
    // Encoding-agnostic apostrophe in L'École
    expect(within(crumb).getByText(/l['']école/i)).toBeInTheDocument()
    expect(within(crumb).getByText(/leçon\s*3/i)).toBeInTheDocument()
    expect(within(crumb).getByText(new RegExp(lesson.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))).toBeInTheDocument()
  })

  it('renders the Fondations section badge for a fondations lesson', () => {
    const lesson = getLessonById(3)!
    render(<LessonDetail lesson={lesson} />)
    expect(screen.getByTestId('lesson-section-badge')).toHaveTextContent(/fondations/i)
  })

  it('renders the Approfondissement section badge for an approfondissement lesson', () => {
    const lesson = getLessonById(17)!
    render(<LessonDetail lesson={lesson} />)
    expect(screen.getByTestId('lesson-section-badge')).toHaveTextContent(/approfondissement/i)
  })

  it('renders the lesson header with number and title', () => {
    const lesson = getLessonById(5)!
    render(<LessonDetail lesson={lesson} />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(lesson.title)
    expect(screen.getByTestId('lesson-detail-number')).toHaveTextContent('5')
  })

  it('renders the audio player placeholder', () => {
    const lesson = getLessonById(3)!
    render(<LessonDetail lesson={lesson} />)
    expect(screen.getByTestId('audio-player-placeholder')).toBeInTheDocument()
  })

  it('renders the three content section headings: Introduction, Méthode, Pratique', () => {
    const lesson = getLessonById(3)!
    render(<LessonDetail lesson={lesson} />)
    expect(screen.getByRole('heading', { level: 2, name: /^introduction$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /^méthode$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /^pratique$/i })).toBeInTheDocument()
  })

  it('renders the three content sections in DOM order', () => {
    const lesson = getLessonById(3)!
    render(<LessonDetail lesson={lesson} />)
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

  it('lesson 1 — renders no previous-lesson button, only a next button linking to /ecole/2', () => {
    const lesson = getLessonById(1)!
    render(<LessonDetail lesson={lesson} />)
    expect(screen.queryByTestId('lesson-nav-prev')).not.toBeInTheDocument()
    const next = screen.getByTestId('lesson-nav-next')
    expect(next).toHaveAttribute('href', '/ecole/2')
  })

  it('lesson 27 — renders no next-lesson button, only a prev button linking to /ecole/26', () => {
    const lesson = getLessonById(27)!
    render(<LessonDetail lesson={lesson} />)
    expect(screen.queryByTestId('lesson-nav-next')).not.toBeInTheDocument()
    const prev = screen.getByTestId('lesson-nav-prev')
    expect(prev).toHaveAttribute('href', '/ecole/26')
  })

  it('mid lesson (5) — renders both prev (→ /ecole/4) and next (→ /ecole/6) buttons', () => {
    const lesson = getLessonById(5)!
    render(<LessonDetail lesson={lesson} />)
    expect(screen.getByTestId('lesson-nav-prev')).toHaveAttribute('href', '/ecole/4')
    expect(screen.getByTestId('lesson-nav-next')).toHaveAttribute('href', '/ecole/6')
  })

  // MOCK-008 — waveform bars, CEFR badge, keyboard navigation
  it('audio player shows 15 waveform bars', () => {
    const lesson = getLessonById(3)!
    render(<LessonDetail lesson={lesson} />)
    expect(screen.getAllByTestId('lesson-waveform-bar')).toHaveLength(15)
  })

  it('audio player shows the lesson CEFR badge', () => {
    const lesson = getLessonById(3)!
    render(<LessonDetail lesson={lesson} />)
    const badge = screen.getByTestId('audio-cefr-badge')
    expect(badge).toHaveTextContent(lesson.cefr)
  })

  it('ArrowRight on lesson 5 pushes to /ecole/6', () => {
    const lesson = getLessonById(5)!
    render(<LessonDetail lesson={lesson} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(mockPush).toHaveBeenCalledWith('/ecole/6')
  })

  it('ArrowLeft on lesson 5 pushes to /ecole/4', () => {
    const lesson = getLessonById(5)!
    render(<LessonDetail lesson={lesson} />)
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(mockPush).toHaveBeenCalledWith('/ecole/4')
  })

  it('ArrowLeft on lesson 1 does not push (boundary guard)', () => {
    const lesson = getLessonById(1)!
    render(<LessonDetail lesson={lesson} />)
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('ArrowRight on lesson 27 does not push (boundary guard)', () => {
    const lesson = getLessonById(27)!
    render(<LessonDetail lesson={lesson} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(mockPush).not.toHaveBeenCalled()
  })
})
