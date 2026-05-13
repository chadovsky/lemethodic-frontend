'use client'

// VU meter — bar-graph visualization of live mic level.
//
// Two modes:
//   - stream prop provided → drives bars from Web Audio AnalyserNode FFT bins
//   - stream absent, active flag → legacy callers (Tache1/Tache2) still use
//     the boolean; we keep it rendering a static shape so those screens don't
//     break until they migrate.
//
// The AudioContext is created per-stream and torn down on stream change /
// unmount so we don't leak contexts across re-mounts.

import { useEffect, useRef, useState } from 'react'

const BAR_COUNT = 24
const MIN_BAR_H = 4
const MAX_BAR_H = 32

interface VuMeterProps {
  /** Live MediaStream from useAudioRecorder. When present, overrides `active`. */
  stream?: MediaStream | null
  /** Legacy boolean for callers not yet wired to a stream. Ignored when
   *  `stream` is set. */
  active?: boolean
  /** Bar color in the active state. Idle uses a faded variant. */
  color?: string
}

export default function VuMeter({ stream, active, color = 'var(--text-primary)' }: VuMeterProps) {
  const [levels, setLevels] = useState<number[]>(() =>
    Array(BAR_COUNT).fill(MIN_BAR_H),
  )
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // No real stream: reset to idle and exit.
    if (!stream) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      setLevels(Array(BAR_COUNT).fill(MIN_BAR_H))
      return
    }

    let audioCtx: AudioContext | null = null
    let source: MediaStreamAudioSourceNode | null = null
    let analyser: AnalyserNode | null = null

    try {
      const AudioCtxCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      audioCtx = new AudioCtxCtor()
      source = audioCtx.createMediaStreamSource(stream)
      analyser = audioCtx.createAnalyser()
      // 64 bin FFT → 32 frequency bins. 24 bars map onto those cleanly enough
      // for a visual signal; we're not doing DSP here, just a pretty meter.
      analyser.fftSize = 64
      analyser.smoothingTimeConstant = 0.55
      source.connect(analyser)

      const data = new Uint8Array(analyser.frequencyBinCount)

      const tick = () => {
        if (!analyser) return
        analyser.getByteFrequencyData(data)
        const next = Array.from({ length: BAR_COUNT }, (_, i) => {
          const binIdx = Math.floor((i / BAR_COUNT) * data.length)
          const value = data[binIdx] / 255 // 0..1
          return Math.max(
            MIN_BAR_H,
            Math.round(MIN_BAR_H + value * (MAX_BAR_H - MIN_BAR_H)),
          )
        })
        setLevels(next)
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      // Web Audio not available or stream unreadable — don't crash, just
      // freeze on idle bars.
      setLevels(Array(BAR_COUNT).fill(MIN_BAR_H))
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      try {
        source?.disconnect()
      } catch {
        /* ignore */
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {
          /* ignore */
        })
      }
    }
  }, [stream])

  // "Active" = we're driven by a real stream, OR the legacy boolean is on.
  // Only the opacity/color of the bars differs between the two modes; the
  // stream-driven path is what produces animated heights.
  const isActive = stream != null || active === true

  return (
    <div
      role="img"
      aria-label={isActive ? 'Audio level meter active' : 'Audio level meter idle'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        height: 36,
      }}
    >
      {levels.map((h, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: h,
            borderRadius: 3,
            backgroundColor: isActive ? color : `${color}33`,
            transition: isActive ? 'height 0.04s ease' : 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  )
}
