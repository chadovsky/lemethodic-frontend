'use client'

import { Mic } from 'lucide-react'

const INK          = 'var(--text-primary)'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

export type RecordingState = 'idle' | 'recording' | 'processing' | 'awaiting_review'
export type RecordMode     = 'tap' | 'ptt'

interface RecordButtonProps {
  mode: RecordMode
  recordingState: RecordingState
  /** Background for idle state — defaults to INK */
  idleColor?: string
  /** Tap mode: fires on click. PTT mode: fires on pointer down/up */
  onTap?: () => void
  onPTTStart?: () => void
  onPTTEnd?: () => void
}

export default function RecordButton({
  mode,
  recordingState,
  idleColor = INK,
  onTap,
  onPTTStart,
  onPTTEnd,
}: RecordButtonProps) {
  const isRecording  = recordingState === 'recording'
  const isProcessing = recordingState === 'processing'

  // Pulse ring color: red for tap-mode recording, colored ring for PTT
  const ringColor = mode === 'tap' ? 'var(--error)' : idleColor

  const buttonBg = isRecording
    ? mode === 'tap' ? 'var(--error)' : idleColor
    : idleColor

  function handleClick() {
    if (mode === 'tap') onTap?.()
  }
  // PTT handlers use setPointerCapture so the button receives pointerup even
  // if the pointer drifts out of the element — or, critically, if layout
  // shifts (timer + VU meter mounting during the idle→recording transition)
  // move the button out from under a stationary pointer. Without capture,
  // that shift would fire pointerleave and stop the recording ~10ms in.
  // See F-062.2 diagnosis for the full trace.
  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (mode !== 'ptt') return
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Very old browsers or pointer types that don't support capture —
      // fall through to the normal event flow. No visible regression; we
      // just lose the layout-shift protection.
    }
    onPTTStart?.()
  }
  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    if (mode !== 'ptt') return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      // pointerId may already have been released by the OS (e.g.
      // pointercancel fired first); ignore.
    }
    onPTTEnd?.()
  }
  // Treat OS-level pointer takeaway (phone call, tab switch, app
  // backgrounded, stylus lifted without a normal up event) as a release —
  // otherwise the recorder would leak and the user would never get the
  // review panel.
  function handlePointerCancel(e: React.PointerEvent<HTMLButtonElement>) {
    if (mode !== 'ptt') return
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    onPTTEnd?.()
  }

  return (
    <div style={{ position: 'relative', width: 88, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Pulsing ring when recording */}
      {isRecording && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: -8,
            borderRadius: '50%',
            border: `3px solid ${ringColor}`,
            animation: 'pulse-ring 1.2s ease-out infinite',
            opacity: 0.6,
          }}
        />
      )}

      <button
        aria-label={
          isRecording  ? 'Stop recording' :
          isProcessing ? 'Processing...' :
          mode === 'ptt' ? 'Hold to record' : 'Tap to record'
        }
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        disabled={isProcessing}
        style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          backgroundColor: isProcessing ? `${INK}33` : buttonBg,
          border: 'none',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          transition: 'background-color 0.2s, transform 0.1s',
          boxShadow: isRecording ? `0 0 0 6px ${ringColor}22` : '0 4px 16px rgba(0,0,0,0.14)',
          transform: isRecording ? 'scale(1.04)' : 'scale(1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {isProcessing ? (
          /* Spinner */
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ animation: 'spin 0.8s linear infinite' }}>
            <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" strokeDasharray="28 56" strokeLinecap="round" />
          </svg>
        ) : (
          <Mic size={32} color="#ffffff" strokeWidth={2} />
        )}
      </button>

      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1);    opacity: 0.6; }
          70%  { transform: scale(1.25); opacity: 0;   }
          100% { transform: scale(1.25); opacity: 0;   }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
