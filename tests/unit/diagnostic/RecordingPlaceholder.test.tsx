import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import RecordingPlaceholder from '@/components/diagnostic/RecordingPlaceholder'

describe('RecordingPlaceholder', () => {
  it('renders in Idle state initially with correct status text', () => {
    render(<RecordingPlaceholder />)
    expect(screen.getByTestId('recording-status')).toHaveTextContent(
      /cliquez pour commencer/i,
    )
    expect(screen.queryByTestId('recording-reecouter')).toBeNull()
    expect(screen.queryByTestId('recording-recommencer')).toBeNull()
  })

  it('transitions to Recording state on first mic-button click', () => {
    render(<RecordingPlaceholder />)
    fireEvent.click(screen.getByTestId('recording-mic-btn'))
    expect(screen.getByTestId('recording-status')).toHaveTextContent(
      /enregistrement en cours/i,
    )
  })

  it('transitions to Stopped state on second mic-button click', () => {
    render(<RecordingPlaceholder />)
    fireEvent.click(screen.getByTestId('recording-mic-btn'))
    fireEvent.click(screen.getByTestId('recording-mic-btn'))
    expect(screen.getByTestId('recording-status')).toHaveTextContent(
      /enregistrement terminé/i,
    )
    expect(screen.getByTestId('recording-reecouter')).toBeInTheDocument()
    expect(screen.getByTestId('recording-recommencer')).toBeInTheDocument()
  })

  it('returns to Idle state when Recommencer is clicked', () => {
    render(<RecordingPlaceholder />)
    fireEvent.click(screen.getByTestId('recording-mic-btn'))
    fireEvent.click(screen.getByTestId('recording-mic-btn'))
    fireEvent.click(screen.getByTestId('recording-recommencer'))
    expect(screen.getByTestId('recording-status')).toHaveTextContent(
      /cliquez pour commencer/i,
    )
    expect(screen.queryByTestId('recording-reecouter')).toBeNull()
  })

  it('never accesses navigator.mediaDevices', () => {
    let accessed = false
    const descriptor = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices')
    Object.defineProperty(navigator, 'mediaDevices', {
      get() {
        accessed = true
        return undefined as unknown as MediaDevices
      },
      configurable: true,
    })
    render(<RecordingPlaceholder />)
    fireEvent.click(screen.getByTestId('recording-mic-btn'))
    fireEvent.click(screen.getByTestId('recording-mic-btn'))
    expect(accessed).toBe(false)
    if (descriptor) {
      Object.defineProperty(navigator, 'mediaDevices', descriptor)
    }
  })

  it('does NOT contain an <audio> element', () => {
    const { container } = render(<RecordingPlaceholder />)
    expect(container.querySelector('audio')).toBeNull()
  })

  it('renders the waveform placeholder', () => {
    render(<RecordingPlaceholder />)
    expect(screen.getByTestId('waveform-placeholder')).toBeInTheDocument()
  })
})
