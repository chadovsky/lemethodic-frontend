import { render, screen, within } from '@testing-library/react'
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
    render(<DiagnosticLanding />)
    expect(screen.getByRole('heading', { level: 1, name: /le diagnostic/i })).toBeInTheDocument()
    expect(
      screen.getByText(/mesurez votre niveau réel en expression orale tcf canada\./i),
    ).toBeInTheDocument()
  })

  it('renders the persona-match section with its heading and prose', () => {
    render(<DiagnosticLanding />)
    const section = screen.getByTestId('diagnostic-section-persona')
    expect(section).toBeInTheDocument()
    expect(within(section).getByRole('heading', { level: 2, name: /pourquoi un diagnostic/i }))
      .toBeInTheDocument()
    expect(within(section).getAllByRole('paragraph').length).toBeGreaterThanOrEqual(2)
  })

  it('renders the "Le déroulé" overview section with all 3 tâche cards in fixture order', () => {
    render(<DiagnosticLanding />)
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
    render(<DiagnosticLanding />)
    const section = screen.getByTestId('diagnostic-section-couches')
    expect(section).toBeInTheDocument()
    for (const name of COUCHE_NAMES) {
      expect(within(section).getByText(name)).toBeInTheDocument()
    }
    // Verify order. Search starts after the previous match so that
    // "Les Moules" — which is a prefix of "Les Moules des Idées" — is
    // located by its standalone occurrence rather than by the prefix.
    const renderedText = section.textContent ?? ''
    let lastIndex = -1
    for (const name of COUCHE_NAMES) {
      const idx = renderedText.indexOf(name, lastIndex + 1)
      expect(idx).toBeGreaterThan(lastIndex)
      lastIndex = idx
    }
  })

  it('renders the primary CTA "Commencer le diagnostic" linking to /diagnostic/tache/1', () => {
    render(<DiagnosticLanding />)
    const cta = screen.getByTestId('diagnostic-cta-start')
    expect(cta).toHaveTextContent(/commencer le diagnostic/i)
    expect(cta).toHaveAttribute('href', '/diagnostic/tache/1')
  })

  it('renders the past-score panel with placeholder C1 and "Voir les résultats" link', () => {
    render(<DiagnosticLanding />)
    const panel = screen.getByTestId('diagnostic-past-score')
    expect(panel).toBeInTheDocument()
    expect(within(panel).getByText('C1')).toBeInTheDocument()
    expect(within(panel).getByText(/il y a 7 jours/i)).toBeInTheDocument()
    const link = screen.getByTestId('diagnostic-past-score-link')
    expect(link).toHaveAttribute('href', '/diagnostic/results')
    expect(link).toHaveTextContent(/voir les résultats/i)
  })

  it('does NOT contain an <audio> element', () => {
    const { container } = render(<DiagnosticLanding />)
    expect(container.querySelector('audio')).toBeNull()
  })
})
