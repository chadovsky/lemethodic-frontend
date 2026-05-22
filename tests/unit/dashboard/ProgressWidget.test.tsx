import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ProgressWidget from '@/components/dashboard/ProgressWidget'
import { PROGRESS_LAYERS } from '@/lib/data/dashboard'

const LOCKED_LAYER_ORDER = [
  'Le Fond',
  'Les Moules des Idées',
  'Les Moules',
  'Les Réflexes Anglais',
  'La Voix',
] as const

describe('ProgressWidget', () => {
  it('renders the "Progression" section heading', () => {
    render(<ProgressWidget />)
    expect(
      screen.getByRole('heading', { name: /progression/i, level: 2 }),
    ).toBeInTheDocument()
  })

  it('renders five 5-couche layer bars in the locked order', () => {
    render(<ProgressWidget />)
    const bars = screen.getAllByTestId('progress-layer')
    expect(bars).toHaveLength(5)
    bars.forEach((bar, i) => {
      expect(bar).toHaveTextContent(LOCKED_LAYER_ORDER[i])
    })
  })

  it('renders the placeholder fill levels as visible percentages', () => {
    render(<ProgressWidget />)
    expect(screen.getByTestId('progress-layer-le-fond')).toHaveTextContent('80%')
    expect(screen.getByTestId('progress-layer-les-moules-des-idees')).toHaveTextContent(
      '60%',
    )
    expect(screen.getByTestId('progress-layer-les-moules')).toHaveTextContent('50%')
    expect(screen.getByTestId('progress-layer-les-reflexes-anglais')).toHaveTextContent(
      '35%',
    )
    expect(screen.getByTestId('progress-layer-la-voix')).toHaveTextContent('20%')
  })

  it('exposes progressbar role on each layer with correct aria-valuenow', () => {
    render(<ProgressWidget />)
    const bars = screen.getAllByRole('progressbar')
    expect(bars).toHaveLength(5)
    expect(bars[0]).toHaveAttribute('aria-valuenow', '80')
    expect(bars[1]).toHaveAttribute('aria-valuenow', '60')
    expect(bars[2]).toHaveAttribute('aria-valuenow', '50')
    expect(bars[3]).toHaveAttribute('aria-valuenow', '35')
    expect(bars[4]).toHaveAttribute('aria-valuenow', '20')
  })

  // MOCK-007 — progress bar data-testids + settled width from fixture
  it('each bar fill element has data-testid progress-bar-{slug}', () => {
    render(<ProgressWidget />)
    for (const layer of PROGRESS_LAYERS) {
      expect(screen.getByTestId(`progress-bar-${layer.slug}`)).toBeInTheDocument()
    }
  })

  it('each bar settled width matches fixture percent', async () => {
    render(<ProgressWidget />)
    for (const layer of PROGRESS_LAYERS) {
      const bar = screen.getByTestId(`progress-bar-${layer.slug}`)
      await waitFor(() => {
        expect(bar).toHaveStyle({ width: `${layer.percent}%` })
      })
    }
  })
})
