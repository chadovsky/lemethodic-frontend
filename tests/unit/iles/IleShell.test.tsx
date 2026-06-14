import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'

import IleShell from '@/components/iles/IleShell'

beforeEach(() => {
  localStorage.clear()
})

describe('IleShell — 3-beat template (default B1)', () => {
  it('renders the header with theme label, level, and current status', async () => {
    render(<IleShell theme="education" />)
    const header = await screen.findByTestId('ile-header')
    expect(header).toHaveAttribute('data-theme', 'education')
    expect(header).toHaveAttribute('data-level', 'B1')
    expect(header).toHaveAttribute('data-status', 'current')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("L'éducation")
    expect(screen.getByTestId('ile-level')).toHaveTextContent('Niveau B1')
  })

  it('renders all three beats', async () => {
    render(<IleShell theme="education" />)
    expect(await screen.findByTestId('ile-beat-learn')).toBeInTheDocument()
    expect(screen.getByTestId('ile-beat-practice')).toBeInTheDocument()
    expect(screen.getByTestId('ile-beat-check')).toBeInTheDocument()
  })

  it('Beat 1: lists the 5 vocab items', async () => {
    render(<IleShell theme="education" />)
    const vocab = await screen.findAllByTestId('ile-vocab-item')
    expect(vocab).toHaveLength(5)
    expect(vocab[0]).toHaveTextContent('la scolarité')
  })

  it('Beat 1: lists the grammar points and flags the Pieges Anglais (interference)', async () => {
    render(<IleShell theme="education" />)
    const points = await screen.findAllByTestId('ile-grammar-point')
    // education@B1 foregrounds 2 grammar points, both interference-flagged.
    expect(points).toHaveLength(2)
    for (const point of points) {
      expect(point).toHaveAttribute('data-interference', 'true')
    }
    expect(screen.getAllByTestId('ile-piege')).toHaveLength(2)
  })

  it('Beat 1: Le Maitre video slot is a bientot shell when no MDX is authored', async () => {
    render(<IleShell theme="education" />)
    const slot = await screen.findByTestId('ile-maitre-video')
    expect(slot).toBeInTheDocument()
    // No MDX authored for the journey themes -> the lesson content seam is absent.
    expect(screen.queryByTestId('ile-maitre-content')).toBeNull()
  })

  it('Beat 2: lists the 5 activity shells and a placed-but-gated seance CTA', async () => {
    render(<IleShell theme="education" />)
    const activities = await screen.findAllByTestId('ile-activity')
    expect(activities).toHaveLength(5)
    const cta = screen.getByTestId('ile-seance-cta')
    expect(cta).toHaveTextContent(/commencer la séance/i)
    expect(cta).toBeDisabled()
  })

  it('Beat 3: renders the mini-mock shell as not-yet-live', async () => {
    render(<IleShell theme="education" />)
    const mock = await screen.findByTestId('ile-mini-mock')
    expect(mock).toHaveAttribute('data-status', 'bientot')
  })
})

describe('IleShell — unknown theme', () => {
  it('renders the graceful bientot stub, never a crash', async () => {
    render(<IleShell theme="not-a-theme" />)
    expect(await screen.findByTestId('ile-not-found')).toBeInTheDocument()
    expect(screen.queryByTestId('ile-page')).toBeNull()
  })
})

describe('IleShell — non-authored level (B2 via target profile)', () => {
  beforeEach(() => {
    localStorage.setItem(
      'lm.targetProfile.v1',
      JSON.stringify({ exam: 'TCF', threshold: 'B2 (CLB 7-8)' }),
    )
  })

  it('renders the 3-beat structure at B2 with bientot status and empty learn slots', async () => {
    render(<IleShell theme="education" />)
    const header = await screen.findByTestId('ile-header')
    await waitFor(() => expect(header).toHaveAttribute('data-level', 'B2'))
    expect(header).toHaveAttribute('data-status', 'bientot')
    expect(screen.queryAllByTestId('ile-vocab-item')).toHaveLength(0)
    expect(screen.queryAllByTestId('ile-grammar-point')).toHaveLength(0)
    // Structure is still present (the 3 beats + the gated CTA).
    expect(screen.getByTestId('ile-beat-practice')).toBeInTheDocument()
    expect(screen.getByTestId('ile-seance-cta')).toBeDisabled()
  })
})
