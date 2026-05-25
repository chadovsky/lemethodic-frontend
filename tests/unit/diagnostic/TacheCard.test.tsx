import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TacheCard from '@/components/diagnostic/TacheCard'
import type { Tache } from '@/lib/data/taches'

const SAMPLE: Tache = {
  id: 2,
  title: "Tâche 2 : Échange d'opinions",
  descriptor:
    "Vous échangez des opinions sur un sujet de la vie courante avec l'examinateur.",
  durationLabel: '~3 min 30',
  durationSeconds: 210,
  prompt:
    'Donnez votre avis sur le télétravail. Préférez-vous travailler à distance ou au bureau ?',
}

describe('TacheCard', () => {
  it('renders the tâche title', () => {
    render(<TacheCard tache={SAMPLE} />)
    expect(screen.getByTestId('tache-card-title')).toHaveTextContent(
      "Tâche 2 : Échange d'opinions",
    )
  })

  it('renders the descriptor text', () => {
    render(<TacheCard tache={SAMPLE} />)
    expect(screen.getByTestId('tache-card-descriptor')).toHaveTextContent(
      /vous échangez des opinions/i,
    )
  })

  it('renders the duration label', () => {
    render(<TacheCard tache={SAMPLE} />)
    expect(screen.getByTestId('tache-card-duration')).toHaveTextContent('~3 min 30')
    expect(screen.getByTestId('tache-card-duration')).toHaveTextContent(/durée/i)
  })

  it('exposes data-tache-id for downstream tests', () => {
    render(<TacheCard tache={SAMPLE} />)
    expect(screen.getByTestId('tache-card')).toHaveAttribute('data-tache-id', '2')
  })

  it('applies the ed-card-lift class for the editorial hover treatment', () => {
    render(<TacheCard tache={SAMPLE} />)
    expect(screen.getByTestId('tache-card').className).toMatch(/ed-card-lift/)
  })

  it('does NOT contain an <audio> element', () => {
    const { container } = render(<TacheCard tache={SAMPLE} />)
    expect(container.querySelector('audio')).toBeNull()
  })
})
