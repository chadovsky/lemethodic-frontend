import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Bientot from '@/components/bientot/Bientot'

describe('Bientot', () => {
  it('renders the label text', () => {
    render(
      <Bientot level="section" label="Contenu bientôt disponible.">
        <div>enfant</div>
      </Bientot>,
    )
    expect(screen.getByTestId('bientot-label')).toHaveTextContent('Contenu bientôt disponible.')
  })

  it('renders children inside an aria-hidden wrapper', () => {
    render(
      <Bientot level="section" label="Test.">
        <div data-testid="inner-child">contenu</div>
      </Bientot>,
    )
    const child = screen.getByTestId('inner-child')
    expect(child.parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders the Bientot pill', () => {
    render(
      <Bientot level="surface" label="Test.">
        <div>contenu</div>
      </Bientot>,
    )
    expect(screen.getByTestId('bientot-pill')).toBeInTheDocument()
  })

  it('applies data-level="surface" for the surface variant', () => {
    render(
      <Bientot level="surface" label="Test.">
        <div>contenu</div>
      </Bientot>,
    )
    expect(screen.getByTestId('bientot-wrapper')).toHaveAttribute('data-level', 'surface')
  })

  it('applies data-level="section" for the section variant', () => {
    render(
      <Bientot level="section" label="Test.">
        <div>contenu</div>
      </Bientot>,
    )
    expect(screen.getByTestId('bientot-wrapper')).toHaveAttribute('data-level', 'section')
  })
})
