import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Flashcard from '@/components/vocabulaire/Flashcard'
import type { Chunk } from '@/lib/data/chunks'

const SAMPLE: Chunk = {
  id: 13,
  fr: 'Ça tombe à pic',
  en: "That's perfect timing",
  level: 'B1',
  source: 'Conversation',
}

describe('Flashcard', () => {
  it('renders the front face with French chunk, CEFR badge, and source pill', () => {
    render(<Flashcard chunk={SAMPLE} flipped={false} onFlip={() => {}} />)
    expect(screen.getByTestId('flashcard-fr-front')).toHaveTextContent('Ça tombe à pic')
    expect(screen.getByTestId('flashcard-level')).toHaveTextContent('B1')
    expect(screen.getByTestId('flashcard-source')).toHaveTextContent('Conversation')
  })

  it('renders the back face with English gloss and the French chunk as reference', () => {
    render(<Flashcard chunk={SAMPLE} flipped={true} onFlip={() => {}} />)
    expect(screen.getByTestId('flashcard-en')).toHaveTextContent("That's perfect timing")
    expect(screen.getByTestId('flashcard-fr-back')).toHaveTextContent('Ça tombe à pic')
  })

  it('exposes flipped state via data-flipped on the container', () => {
    const { rerender } = render(<Flashcard chunk={SAMPLE} flipped={false} onFlip={() => {}} />)
    expect(screen.getByTestId('flashcard')).toHaveAttribute('data-flipped', 'false')

    rerender(<Flashcard chunk={SAMPLE} flipped={true} onFlip={() => {}} />)
    expect(screen.getByTestId('flashcard')).toHaveAttribute('data-flipped', 'true')
  })

  it('renders as a button element with aria-pressed reflecting flipped state', () => {
    const { rerender } = render(<Flashcard chunk={SAMPLE} flipped={false} onFlip={() => {}} />)
    const card = screen.getByTestId('flashcard')
    expect(card.tagName).toBe('BUTTON')
    expect(card).toHaveAttribute('type', 'button')
    expect(card).toHaveAttribute('aria-pressed', 'false')

    rerender(<Flashcard chunk={SAMPLE} flipped={true} onFlip={() => {}} />)
    expect(screen.getByTestId('flashcard')).toHaveAttribute('aria-pressed', 'true')
  })

  it('clicking the card calls onFlip', () => {
    const onFlip = vi.fn()
    render(<Flashcard chunk={SAMPLE} flipped={false} onFlip={onFlip} />)
    fireEvent.click(screen.getByTestId('flashcard'))
    expect(onFlip).toHaveBeenCalledTimes(1)
  })

  it('hides the inactive face from assistive tech via aria-hidden', () => {
    const { rerender } = render(<Flashcard chunk={SAMPLE} flipped={false} onFlip={() => {}} />)
    expect(screen.getByTestId('flashcard-front')).toHaveAttribute('aria-hidden', 'false')
    expect(screen.getByTestId('flashcard-back')).toHaveAttribute('aria-hidden', 'true')

    rerender(<Flashcard chunk={SAMPLE} flipped={true} onFlip={() => {}} />)
    expect(screen.getByTestId('flashcard-front')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('flashcard-back')).toHaveAttribute('aria-hidden', 'false')
  })

  it('does NOT contain an <audio> element', () => {
    const { container } = render(<Flashcard chunk={SAMPLE} flipped={false} onFlip={() => {}} />)
    expect(container.querySelector('audio')).toBeNull()
  })
})
