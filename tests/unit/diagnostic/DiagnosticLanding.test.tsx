import { render, screen, within, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DiagnosticLanding from '@/components/diagnostic/DiagnosticLanding'
import { TACHES } from '@/lib/data/taches'

const COUCHE_NAMES = [
  'Le Fond',
  'Les Moules des Idées',
  'Les Moules',
  'Les Réflexes Anglais',
  'La Voix',
] as const

describe('DiagnosticLanding', () => {
  it('renders the page header "Le Diagnostic" with tagline', () => {
    render(<DiagnosticLanding taches={TACHES} />)
    expect(screen.getByRole('heading', { level: 1, name: /le diagnostic/i })).toBeInTheDocument()
    expect(
      screen.getByText(/mesurez votre niveau réel en expression orale tcf canada\./i),
    ).toBeInTheDocument()
  })

  it('renders the persona-match section with its heading and prose', () => {
    render(<DiagnosticLanding taches={TACHES} />)
    const section = screen.getByTestId('diagnostic-section-persona')
    expect(section).toBeInTheDocument()
    expect(within(section).getByRole('heading', { level: 2, name: /pourquoi un diagnostic/i }))
      .toBeInTheDocument()
    expect(within(section).getAllByRole('paragraph').length).toBeGreaterThanOrEqual(2)
  })

  it('renders the "Le déroulé" overview section with all 3 tâche cards in fixture order', () => {
    render(<DiagnosticLanding taches={TACHES} />)
    const section = screen.getByTestId('diagnostic-section-overview')
    expect(within(section).getByRole('heading', { level: 2, name: /le déroulé/i }))
      .toBeInTheDocument()
    const cards = within(section).getAllByTestId('tache-card')
    expect(cards).toHaveLength(3)
    for (let i = 0; i < 3; i++) {
      expect(cards[i]).toHaveAttribute('data-tache-id', String(TACHES[i].id))
    }
  })

  it('renders the 5-couche preview section with all five layer names in locked order', () => {
    render(<DiagnosticLanding taches={TACHES} />)
    const section = screen.getByTestId('diagnostic-section-couches')
    expect(section).toBeInTheDocument()
    for (const name of COUCHE_NAMES) {
      expect(within(section).getByText(name)).toBeInTheDocument()
    }
    const renderedText = section.textContent ?? ''
    let lastIndex = -1
    for (const name of COUCHE_NAMES) {
      const idx = renderedText.indexOf(name, lastIndex + 1)
      expect(idx).toBeGreaterThan(lastIndex)
      lastIndex = idx
    }
  })

  it('renders the primary CTA "Commencer le diagnostic" linking to /diagnostic/tache/1', () => {
    render(<DiagnosticLanding taches={TACHES} />)
    const cta = screen.getByTestId('diagnostic-cta-start')
    expect(cta).toHaveTextContent(/commencer le diagnostic/i)
    expect(cta).toHaveAttribute('href', '/diagnostic/tache/1')
  })

  it('renders the past-score panel with placeholder C1 and "Voir les résultats" link', () => {
    render(<DiagnosticLanding taches={TACHES} />)
    const panel = screen.getByTestId('diagnostic-past-score')
    expect(panel).toBeInTheDocument()
    expect(within(panel).getByText('C1')).toBeInTheDocument()
    expect(within(panel).getByText(/il y a 7 jours/i)).toBeInTheDocument()
    const link = screen.getByTestId('diagnostic-past-score-link')
    expect(link).toHaveAttribute('href', '/diagnostic/results')
    expect(link).toHaveTextContent(/voir les résultats/i)
  })

  it('does NOT contain an <audio> element', () => {
    const { container } = render(<DiagnosticLanding taches={TACHES} />)
    expect(container.querySelector('audio')).toBeNull()
  })

  // MOCK-010 — dismiss button and tâche accent bars
  it('past-score panel has a dismiss button', () => {
    render(<DiagnosticLanding taches={TACHES} />)
    const panel = screen.getByTestId('diagnostic-past-score')
    expect(within(panel).getByTestId('past-score-dismiss')).toBeInTheDocument()
  })

  it('clicking the dismiss button removes the past-score panel from DOM', () => {
    render(<DiagnosticLanding taches={TACHES} />)
    fireEvent.click(screen.getByTestId('past-score-dismiss'))
    expect(screen.queryByTestId('diagnostic-past-score')).not.toBeInTheDocument()
  })

  it('each tâche card has an accent bar element', () => {
    render(<DiagnosticLanding taches={TACHES} />)
    const cards = screen.getAllByTestId('tache-card')
    expect(cards).toHaveLength(3)
    for (const card of cards) {
      expect(within(card).getByTestId('tache-card-accent-bar')).toBeInTheDocument()
    }
  })
})
