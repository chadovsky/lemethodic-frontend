import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ChunkRow from '@/components/vocabulaire/ChunkRow'
import type { Chunk } from '@/lib/data/chunks'

const SAMPLE: Chunk = {
  id: 13,
  fr: 'Ça tombe à pic',
  en: "That's perfect timing",
  level: 'B1',
  source: 'Conversation',
}

describe('ChunkRow', () => {
  it('renders the French chunk text', () => {
    render(<ChunkRow chunk={SAMPLE} />)
    expect(screen.getByTestId('chunk-row-fr')).toHaveTextContent('Ça tombe à pic')
  })

  it('renders the English gloss', () => {
    render(<ChunkRow chunk={SAMPLE} />)
    expect(screen.getByTestId('chunk-row-en')).toHaveTextContent("That's perfect timing")
  })

  it('renders the CEFR level badge', () => {
    render(<ChunkRow chunk={SAMPLE} />)
    expect(screen.getByTestId('chunk-row-level')).toHaveTextContent('B1')
  })

  it('renders the source pill', () => {
    render(<ChunkRow chunk={SAMPLE} />)
    expect(screen.getByTestId('chunk-row-source')).toHaveTextContent('Conversation')
  })

  it('renders a save icon button', () => {
    render(<ChunkRow chunk={SAMPLE} />)
    expect(screen.getByTestId('chunk-row-save')).toBeInTheDocument()
  })

  it('exposes data-chunk-id and data-chunk-level for downstream tests', () => {
    render(<ChunkRow chunk={SAMPLE} />)
    const row = screen.getByTestId('chunk-row')
    expect(row).toHaveAttribute('data-chunk-id', '13')
    expect(row).toHaveAttribute('data-chunk-level', 'B1')
    expect(row).toHaveAttribute('data-chunk-source', 'Conversation')
  })
})
