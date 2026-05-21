import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PracticeDeck from '@/components/vocabulaire/PracticeDeck'
import { CHUNKS } from '@/lib/data/chunks'

const TOTAL = CHUNKS.length

function advance(times: number) {
  for (let i = 0; i < times; i++) {
    fireEvent.click(screen.getByTestId('practice-action-next'))
  }
}

describe('PracticeDeck', () => {
  it('renders the page header "Pratique" with descriptor and back-to-list link', () => {
    render(<PracticeDeck />)
    expect(screen.getByRole('heading', { level: 1, name: /pratique/i })).toBeInTheDocument()
    expect(screen.getByText(/révisez vos chunks, un par un\./i)).toBeInTheDocument()
    const back = screen.getByTestId('practice-back-to-list')
    expect(back).toHaveAttribute('href', '/vocabulaire')
  })

  it('starts on card 1 of 30 with the first chunk’s French side visible', () => {
    render(<PracticeDeck />)
    expect(screen.getByTestId('practice-progress')).toHaveTextContent(`Carte 1 sur ${TOTAL}`)
    expect(screen.getByTestId('flashcard')).toHaveAttribute('data-flipped', 'false')
    expect(screen.getByTestId('flashcard-fr-front')).toHaveTextContent(CHUNKS[0].fr)
  })

  it('renders all three action buttons and a Précédent affordance', () => {
    render(<PracticeDeck />)
    expect(screen.getByTestId('practice-action-review')).toHaveTextContent(/à revoir/i)
    expect(screen.getByTestId('practice-action-next')).toHaveTextContent(/suivant/i)
    expect(screen.getByTestId('practice-action-known')).toHaveTextContent(/connu/i)
    expect(screen.getByTestId('practice-prev')).toBeInTheDocument()
  })

  it('Précédent is disabled on card 1 and clicking it does not change the card', () => {
    render(<PracticeDeck />)
    const prev = screen.getByTestId('practice-prev')
    expect(prev).toBeDisabled()
    fireEvent.click(prev)
    expect(screen.getByTestId('practice-progress')).toHaveTextContent(`Carte 1 sur ${TOTAL}`)
  })

  it('clicking Suivant advances to the next card in fixture order', () => {
    render(<PracticeDeck />)
    fireEvent.click(screen.getByTestId('practice-action-next'))
    expect(screen.getByTestId('practice-progress')).toHaveTextContent(`Carte 2 sur ${TOTAL}`)
    expect(screen.getByTestId('flashcard-fr-front')).toHaveTextContent(CHUNKS[1].fr)
  })

  it('clicking the card flips it; clicking again flips it back', () => {
    render(<PracticeDeck />)
    const card = screen.getByTestId('flashcard')
    expect(card).toHaveAttribute('data-flipped', 'false')
    fireEvent.click(card)
    expect(screen.getByTestId('flashcard')).toHaveAttribute('data-flipped', 'true')
    fireEvent.click(screen.getByTestId('flashcard'))
    expect(screen.getByTestId('flashcard')).toHaveAttribute('data-flipped', 'false')
  })

  it('advancing past the last card shows the end-of-deck panel', () => {
    render(<PracticeDeck />)
    advance(TOTAL)
    expect(screen.queryByTestId('flashcard')).not.toBeInTheDocument()
    expect(screen.getByTestId('end-of-deck')).toBeInTheDocument()
    expect(screen.getByTestId('end-of-deck')).toHaveTextContent(
      /vous avez terminé les 30 chunks\./i,
    )
    expect(screen.getByTestId('end-of-deck-restart')).toBeInTheDocument()
    expect(screen.getByTestId('end-of-deck-back-to-list')).toHaveAttribute('href', '/vocabulaire')
  })

  it('Recommencer from end-of-deck resets to card 1, front side', () => {
    render(<PracticeDeck />)
    advance(TOTAL)
    fireEvent.click(screen.getByTestId('end-of-deck-restart'))
    expect(screen.getByTestId('practice-progress')).toHaveTextContent(`Carte 1 sur ${TOTAL}`)
    expect(screen.getByTestId('flashcard')).toHaveAttribute('data-flipped', 'false')
    expect(screen.getByTestId('flashcard-fr-front')).toHaveTextContent(CHUNKS[0].fr)
  })

  it('"À revoir" advances the card just like Suivant', () => {
    render(<PracticeDeck />)
    fireEvent.click(screen.getByTestId('practice-action-review'))
    expect(screen.getByTestId('practice-progress')).toHaveTextContent(`Carte 2 sur ${TOTAL}`)
  })

  it('"Connu" advances the card just like Suivant', () => {
    render(<PracticeDeck />)
    fireEvent.click(screen.getByTestId('practice-action-known'))
    expect(screen.getByTestId('practice-progress')).toHaveTextContent(`Carte 2 sur ${TOTAL}`)
  })

  it('Précédent on card 2 goes back to card 1', () => {
    render(<PracticeDeck />)
    fireEvent.click(screen.getByTestId('practice-action-next'))
    expect(screen.getByTestId('practice-progress')).toHaveTextContent(`Carte 2 sur ${TOTAL}`)
    fireEvent.click(screen.getByTestId('practice-prev'))
    expect(screen.getByTestId('practice-progress')).toHaveTextContent(`Carte 1 sur ${TOTAL}`)
  })

  it('flipping a card and then advancing resets the next card to the front face', () => {
    render(<PracticeDeck />)
    fireEvent.click(screen.getByTestId('flashcard'))
    expect(screen.getByTestId('flashcard')).toHaveAttribute('data-flipped', 'true')
    fireEvent.click(screen.getByTestId('practice-action-next'))
    expect(screen.getByTestId('flashcard')).toHaveAttribute('data-flipped', 'false')
  })

  it('does NOT contain an <audio> element', () => {
    const { container } = render(<PracticeDeck />)
    expect(container.querySelector('audio')).toBeNull()
  })
})
