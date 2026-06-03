import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import TacheShell from '@/components/diagnostic/TacheShell'
import { TACHES } from '@/lib/data/taches'

describe('TacheShell', () => {
  it('renders breadcrumb with "L\'Examen" link and current tâche label', () => {
    render(<TacheShell tache={TACHES[0]} />)
    const bc = screen.getByTestId('breadcrumb')
    expect(within(bc).getByText(/l'examen/i)).toBeInTheDocument()
    expect(within(bc).getByText('Tâche 1')).toBeInTheDocument()
  })

  it('renders the tâche title from the fixture', () => {
    render(<TacheShell tache={TACHES[0]} />)
    expect(screen.getByTestId('tache-shell-title')).toHaveTextContent(
      "Tâche 1 : Échange d'informations",
    )
  })

  it('renders the prompt text from the fixture', () => {
    render(<TacheShell tache={TACHES[0]} />)
    expect(screen.getByTestId('tache-shell-prompt')).toHaveTextContent(/cours de cuisine/i)
  })

  it('renders timer at 03:00 for tâche 1', () => {
    render(<TacheShell tache={TACHES[0]} />)
    expect(screen.getByTestId('timer-display')).toHaveTextContent('03:00')
  })

  it('renders timer at 03:30 for tâche 2', () => {
    render(<TacheShell tache={TACHES[1]} />)
    expect(screen.getByTestId('timer-display')).toHaveTextContent('03:30')
  })

  it('renders timer at 05:00 for tâche 3', () => {
    render(<TacheShell tache={TACHES[2]} />)
    expect(screen.getByTestId('timer-display')).toHaveTextContent('05:00')
  })

  it('renders no previous nav button for tâche 1', () => {
    render(<TacheShell tache={TACHES[0]} />)
    expect(screen.queryByTestId('tache-nav-prev')).toBeNull()
    expect(screen.getByTestId('tache-nav-next')).toBeInTheDocument()
  })

  it('renders both prev (→ tâche 1) and next (→ tâche 3) for tâche 2', () => {
    render(<TacheShell tache={TACHES[1]} />)
    expect(screen.getByTestId('tache-nav-prev')).toHaveAttribute(
      'href',
      '/maitre/diagnostic/tache/1',
    )
    expect(screen.getByTestId('tache-nav-next')).toHaveAttribute(
      'href',
      '/maitre/diagnostic/tache/3',
    )
  })

  it('renders "Voir les résultats" instead of next for tâche 3', () => {
    render(<TacheShell tache={TACHES[2]} />)
    expect(screen.getByTestId('tache-nav-prev')).toHaveAttribute(
      'href',
      '/maitre/diagnostic/tache/2',
    )
    const link = screen.getByTestId('tache-nav-results')
    expect(link).toHaveAttribute('href', '/maitre/diagnostic/results')
    expect(link).toHaveTextContent(/voir les résultats/i)
    expect(screen.queryByTestId('tache-nav-next')).toBeNull()
  })

  it('renders the recording UI placeholder', () => {
    render(<TacheShell tache={TACHES[0]} />)
    expect(screen.getByTestId('recording-placeholder')).toBeInTheDocument()
    expect(screen.getByTestId('recording-mic-btn')).toBeInTheDocument()
  })

  it('does NOT contain an <audio> element', () => {
    const { container } = render(<TacheShell tache={TACHES[0]} />)
    expect(container.querySelector('audio')).toBeNull()
  })
})
