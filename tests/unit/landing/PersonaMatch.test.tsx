import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PersonaMatch from '@/components/landing/PersonaMatch'

describe('PersonaMatch', () => {
  it('renders exactly three value-prop columns', () => {
    render(<PersonaMatch />)
    expect(screen.getAllByTestId('persona-column')).toHaveLength(3)
  })

  it('section uses an h2 heading', () => {
    render(<PersonaMatch />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('each column uses an h3 heading', () => {
    render(<PersonaMatch />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3)
  })

  it('column headings cover the three value props', () => {
    render(<PersonaMatch />)
    const texts = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent ?? '')
    expect(texts.some((t) => /tcf canada|canada/i.test(t))).toBe(true)
    expect(texts.some((t) => /english/i.test(t))).toBe(true)
    expect(texts.some((t) => /method/i.test(t))).toBe(true)
  })
})
