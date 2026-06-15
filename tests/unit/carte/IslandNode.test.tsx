import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import IslandNode from '@/components/carte/IslandNode'
import { ISLAND_ART, type IslandKey } from '@/lib/journey/island-art'
import { THEMES } from '@/lib/journey/journey'

describe('ISLAND_ART map (F-461)', () => {
  it('covers all 8 island keys, each resolving to /iles/island-<key>.png', () => {
    const keys = Object.keys(ISLAND_ART) as IslandKey[]
    expect(keys).toHaveLength(8)
    for (const key of keys) {
      expect(ISLAND_ART[key]).toBe(`/iles/island-${key}.png`)
    }
  })

  it('resolves every TCF theme plus the grammar foundation island', () => {
    const expected: IslandKey[] = [...THEMES.map((t) => t.id), 'grammaire']
    for (const key of expected) {
      expect(ISLAND_ART[key]).toBeDefined()
    }
  })
})

describe('IslandNode (F-461)', () => {
  it('renders the themed island image with the FR label as alt', () => {
    render(<IslandNode theme="education" status="current" label="L'éducation" />)
    const img = screen.getByRole('img', { name: "L'éducation" })
    expect(img).toHaveAttribute('src', '/iles/island-education.png')
  })

  it('current: lifts, coral glow, largest grounding shadow, no badge', () => {
    render(<IslandNode theme="culture" status="current" label="La culture" />)
    const node = screen.getByTestId('island-node')
    expect(node).toHaveAttribute('data-status', 'current')
    expect(node).toHaveAttribute('data-state', 'current')

    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.className).toContain('motion-safe:-translate-y-1')
    expect(img.style.filter).toContain('drop-shadow')
    expect(img.style.filter).toContain('var(--accent)')

    const shadow = screen.getByTestId('island-shadow') as HTMLElement
    expect(shadow.style.width).toBe('58px')

    expect(screen.queryByTestId('island-badge')).toBeNull()
  })

  it('completed: full colour, coral check badge, no lift', () => {
    render(<IslandNode theme="famille" status="completed" label="La famille" />)
    const node = screen.getByTestId('island-node')
    expect(node).toHaveAttribute('data-state', 'completed')

    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.className).not.toContain('-translate-y-1')
    expect(img.style.filter).toBe('')
    expect(img.style.opacity).toBe('1')

    const badge = screen.getByTestId('island-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({ background: 'var(--accent)' })

    expect((screen.getByTestId('island-shadow') as HTMLElement).style.width).toBe('48px')
  })

  it('locked: desaturated + dimmed, flattened, tightest shadow, no badge', () => {
    render(<IslandNode theme="sante" status="locked" label="La santé" />)
    const node = screen.getByTestId('island-node')
    expect(node).toHaveAttribute('data-state', 'locked')

    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.className).not.toContain('-translate-y-1')
    expect(img.style.filter).toContain('grayscale')
    expect(img.style.opacity).toBe('0.55')

    expect((screen.getByTestId('island-shadow') as HTMLElement).style.width).toBe('34px')
    expect(screen.queryByTestId('island-badge')).toBeNull()
  })

  it('bientot folds into the locked treatment', () => {
    render(<IslandNode theme="economie" status="bientot" label="L'économie" />)
    const node = screen.getByTestId('island-node')
    expect(node).toHaveAttribute('data-status', 'bientot')
    expect(node).toHaveAttribute('data-state', 'locked')
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.style.filter).toContain('grayscale')
  })

  it('guards motion: transition + shadow ride the motion-safe variant', () => {
    render(<IslandNode theme="technologie" status="current" label="La technologie" />)
    expect((screen.getByRole('img') as HTMLElement).className).toContain('motion-safe:transition-all')
    const shadow = screen.getByTestId('island-shadow') as HTMLElement
    expect(shadow.className).toContain('motion-safe:transition-all')
    expect(shadow.className).toContain('dark:opacity-0')
  })
})
