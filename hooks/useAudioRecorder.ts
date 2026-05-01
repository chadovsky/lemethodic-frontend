'use client'

// Thin hook wrapping MediaRecorder. Ownership of the MediaStream and mic
// lifecycle lives here so that callers don't have to think about cleanup —
// stopRecording releases the tracks, so does reset(), so does unmount.
//
// Timing note: durationMs is driven by Date.now() deltas, not
// performance.now(). Chrome's hidden-tab throttle on performance.now() is
// what caused the F-050 drift where a backgrounded recorder would show wildly
// wrong durations; Date.now() isn't throttled.
//
// P-104 (2026-05-01): a visibilitychange listener forces durationMs to
// recompute the moment the tab refocuses. Background tabs throttle
// setInterval to ≥ 1Hz (and pause it entirely under intensive throttling
// after ~5 min hidden), which means downstream useEffect([durationMs])
// watchers — including the per-Tâche cap auto-stops — wouldn't fire
// promptly on return without this. Same pattern as F-076 in
// CountdownTimer's owned mode. P-104.x covers the deep-throttle edge
// case (5+ min hidden) via a wall-clock setTimeout fallback; deferred
// until real user data shows it matters.

import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderStatus =
  | 'idle'
  | 'requesting-permission'
  | 'ready'
  | 'recording'
  | 'stopped'
  | 'error'

export interface UseAudioRecorderResult {
  status: RecorderStatus
  error: string | null
  durationMs: number
  /** Live MediaStream for driving a VU meter. Null when not recording. */
  stream: MediaStream | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob>
  /** Tear down any in-flight recording + release the mic. Safe to call at
   *  any status. */
  reset: () => void
}

// Map platform errors to a one-liner we can show the user. The NotAllowedError
// copy is special-cased upstream (Tache3Session detects "permission" to offer
// a targeted help card); leave the phrasing alone.
function formatMediaError(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return 'Microphone permission denied. Allow mic access in your browser and try again.'
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return 'No microphone detected. Plug one in or check your audio settings.'
    }
    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      return 'Microphone is busy. Close other apps using the mic and try again.'
    }
    if (err.name === 'SecurityError') {
      return 'Microphone blocked by browser security. Use HTTPS or localhost.'
    }
    return err.message || 'Could not access the microphone.'
  }
  return 'Could not access the microphone.'
}

export function useAudioRecorder(): UseAudioRecorderResult {
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [durationMs, setDurationMs] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef<number | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // P-104 — handler ref so all cleanup paths can detach the listener
  // without restating the closure.
  const visibilityHandlerRef = useRef<(() => void) | null>(null)
  // Parallel ref to stream so cleanup callbacks can reach the latest instance
  // without being stale-closure'd through useCallback deps.
  const streamRef = useRef<MediaStream | null>(null)

  const stopTicks = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  const unbindVisibility = useCallback(() => {
    if (visibilityHandlerRef.current) {
      document.removeEventListener('visibilitychange', visibilityHandlerRef.current)
      visibilityHandlerRef.current = null
    }
  }, [])

  const releaseStream = useCallback(() => {
    const s = streamRef.current
    if (s) {
      s.getTracks().forEach((t) => {
        try {
          t.stop()
        } catch {
          /* track may already be dead — that's fine */
        }
      })
    }
    streamRef.current = null
    setStream(null)
  }, [])

  // Cleanup on unmount — a leaked mic leaves the browser indicator lit up
  // (tab-level "recording" dot), which is both creepy and wrong.
  useEffect(() => {
    return () => {
      stopTicks()
      unbindVisibility()
      const rec = recorderRef.current
      if (rec && rec.state !== 'inactive') {
        try {
          rec.stop()
        } catch {
          /* ignore */
        }
      }
      const s = streamRef.current
      if (s) {
        s.getTracks().forEach((t) => {
          try {
            t.stop()
          } catch {
            /* ignore */
          }
        })
        streamRef.current = null
      }
    }
  }, [stopTicks, unbindVisibility])

  const startRecording = useCallback(async () => {
    // Guard against double-starts.
    if (
      status === 'requesting-permission' ||
      status === 'recording' ||
      status === 'ready'
    ) {
      return
    }

    setError(null)
    setStatus('requesting-permission')

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser.')
      }
      const obtained = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = obtained
      setStream(obtained)

      // Let the browser pick a sensible mimeType — forcing webm breaks
      // Safari, forcing mp4 breaks Firefox. MediaRecorder defaults to
      // whatever the UA supports.
      const recorder = new MediaRecorder(obtained)
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      setStatus('ready')
      recorder.start()
      startedAtRef.current = Date.now()
      setDurationMs(0)
      tickRef.current = setInterval(() => {
        if (startedAtRef.current != null) {
          setDurationMs(Date.now() - startedAtRef.current)
        }
      }, 100)
      // P-104 — force a durationMs recompute on tab refocus. Background
      // setInterval throttling (≥ 1Hz, paused entirely under intensive
      // throttling after ~5 min hidden) would otherwise leave downstream
      // useEffect([durationMs]) cap-watchers stale on return.
      const handleVisibilityChange = () => {
        if (!document.hidden && startedAtRef.current != null) {
          setDurationMs(Date.now() - startedAtRef.current)
        }
      }
      visibilityHandlerRef.current = handleVisibilityChange
      document.addEventListener('visibilitychange', handleVisibilityChange)
      setStatus('recording')
    } catch (err) {
      setError(formatMediaError(err))
      setStatus('error')
      stopTicks()
      unbindVisibility()
      releaseStream()
      recorderRef.current = null
    }
  }, [status, stopTicks, unbindVisibility, releaseStream])

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const recorder = recorderRef.current
      if (!recorder) {
        reject(new Error('No active recording.'))
        return
      }
      if (recorder.state === 'inactive') {
        // Already stopped (possibly by an earlier stopRecording race) —
        // resolve with whatever chunks we captured.
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        resolve(blob)
        return
      }

      recorder.onstop = () => {
        stopTicks()
        unbindVisibility()
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        releaseStream()
        setStatus('stopped')
        resolve(blob)
      }
      recorder.onerror = (e: Event) => {
        stopTicks()
        unbindVisibility()
        releaseStream()
        setStatus('error')
        setError('Recording failed. Try again.')
        reject(e)
      }

      try {
        recorder.stop()
      } catch (err) {
        stopTicks()
        unbindVisibility()
        releaseStream()
        setStatus('error')
        setError('Could not stop the recording cleanly.')
        reject(err)
      }
    })
  }, [stopTicks, unbindVisibility, releaseStream])

  const reset = useCallback(() => {
    stopTicks()
    unbindVisibility()
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') {
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
    }
    recorderRef.current = null
    releaseStream()
    chunksRef.current = []
    startedAtRef.current = null
    setDurationMs(0)
    setError(null)
    setStatus('idle')
  }, [stopTicks, unbindVisibility, releaseStream])

  return {
    status,
    error,
    durationMs,
    stream,
    startRecording,
    stopRecording,
    reset,
  }
}
