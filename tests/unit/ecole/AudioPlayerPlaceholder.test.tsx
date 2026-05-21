import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import AudioPlayerPlaceholder from '@/components/ecole/AudioPlayerPlaceholder'

describe('AudioPlayerPlaceholder', () => {
  it('renders the placeholder container with test id', () => {
    render(<AudioPlayerPlaceholder />)
    expect(screen.getByTestId('audio-player-placeholder')).toBeInTheDocument()
  })

  it('renders a play button', () => {
    render(<AudioPlayerPlaceholder />)
    expect(screen.getByTestId('audio-play-button')).toBeInTheDocument()
  })

  it('renders a static scrubber with placeholder time (0:00 / 12:34)', () => {
    render(<AudioPlayerPlaceholder />)
    const scrubber = screen.getByTestId('audio-scrubber')
    expect(scrubber).toBeInTheDocument()
    expect(screen.getByText(/0:00\s*\/\s*12:34/)).toBeInTheDocument()
  })

  it('renders a volume icon', () => {
    render(<AudioPlayerPlaceholder />)
    expect(screen.getByTestId('audio-volume-icon')).toBeInTheDocument()
  })

  it('does NOT contain an <audio> element', () => {
    const { container } = render(<AudioPlayerPlaceholder />)
    expect(container.querySelector('audio')).toBeNull()
  })

  it('clicking the play button does nothing — no errors thrown, no <audio> appears', () => {
    const { container } = render(<AudioPlayerPlaceholder />)
    const playButton = screen.getByTestId('audio-play-button')
    expect(() => fireEvent.click(playButton)).not.toThrow()
    expect(container.querySelector('audio')).toBeNull()
  })
})
