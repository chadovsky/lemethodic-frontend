'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Settings } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import RecordButton, { RecordingState } from './RecordButton'
import VuMeter from './VuMeter'
import CountdownTimer from './CountdownTimer'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'
import {
  durationBase,
  easeFpEnter,
  recordingDonePulseScale,
  recordingDonePulseDuration,
} from '@/lib/motion'

const INK          = 'var(--text-primary)'
const INK_SOFT     = 'var(--text-secondary)'
const INK_MUTED    = 'var(--text-muted)'
const LAVENDER     = 'var(--fp-lavender)'
const BG           = 'var(--fp-canvas)'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

const PREP_SECS      = 120 // 2 minutes
const RECORD_SECS    = 180 // 3 minutes
const RECORD_CAP_MS  = RECORD_SECS * 1000
const CORAL          = '#FF8B6B'

// TODO(Phase 4): resolve the URL slug to a real topic_id via a backend
// lookup endpoint, and fetch the prompt/difficulty/theme from that topic.
// For now the prompt is hardcoded and the topic_id falls back to 1 when the
// URL slug isn't numeric — sufficient to exercise the recording pipeline.
const TOPIC = {
  prompt:
    "Certains pensent que les réseaux sociaux ont rapproché les gens. D'autres estiment qu'ils ont au contraire détérioré nos relations. Qu'en pensez-vous ?",
  difficulty: 'B1-B2',
  theme: 'Society',
}

type Phase = 'prep' | 'recording' | 'processing' | 'error'

interface Tache3SessionProps {
  /** URL param from /speaking/tache-3/[topic]. May be a numeric id or a
   *  slug; the component parses defensively and falls back to topic_id 1. */
  topicSlug?: string
}

export default function Tache3Session({ topicSlug }: Tache3SessionProps) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const reduceMotion = useReducedMotion()

  const topicId = Number.parseInt(topicSlug ?? '', 10) || 1

  const [phase, setPhase] = useState<Phase>('prep')
  const [prepRemaining, setPrepRemaining] = useState(PREP_SECS)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const lastBlobRef = useRef<Blob | null>(null)
  // Idempotency guard — stop may be triggered both by the 3-min auto-cap
  // effect and a user tap racing into the same tick.
  const stoppingRef = useRef(false)

  const recorder = useAudioRecorder()

  // Request mic + start capturing.
  const beginRecording = useCallback(async () => {
    setUploadError(null)
    stoppingRef.current = false
    await recorder.startRecording()
    // status transitions (recording|error) are observed via the effect below.
  }, [recorder])

  // Mirror recorder errors into local phase so the UI can show a help card.
  useEffect(() => {
    if (recorder.status === 'error') {
      setPhase('error')
    } else if (recorder.status === 'recording' && phase === 'prep') {
      setPhase('recording')
    }
  }, [recorder.status, phase])

  // Upload an already-captured blob. Separated from stopRecording so the
  // retry-upload button can re-fire without re-recording.
  const uploadBlob = useCallback(
    async (blob: Blob) => {
      setPhase('processing')
      setUploadError(null)
      try {
        const recording = await api.sessions.createRecording(topicId, blob, {
          tacheMode: 3,
          targetLevel: user?.targetLevel ?? 'B2',
          uiLanguage: user?.interfaceLanguage ?? 'en',
          examProfile: user?.examProfile ?? 'tcf_canada',
        })
        router.push(`/l-examen?session=${recording.id}`)
      } catch (err) {
        setPhase('error')
        // Three shapes to distinguish:
        //   - ApiError: server responded with a detail — surface it verbatim
        //     so the user sees what actually broke (bad tache_mode, missing
        //     topic, auth expired, etc.), with the status prefix for context.
        //   - TypeError: fetch() itself rejected — network is down / CORS.
        //   - Anything else: generic fallback.
        if (err instanceof ApiError) {
          setUploadError(
            err.message
              ? `${err.status}: ${err.message}`
              : `Upload failed (${err.status}).`,
          )
        } else if (err instanceof TypeError) {
          setUploadError("Couldn't reach the server. Retry?")
        } else {
          setUploadError('Upload failed. Retry?')
        }
      }
    },
    [topicId, user, router],
  )

  const finishRecording = useCallback(async () => {
    if (stoppingRef.current) return
    stoppingRef.current = true
    try {
      const blob = await recorder.stopRecording()
      lastBlobRef.current = blob
      await uploadBlob(blob)
    } catch {
      setPhase('error')
      setUploadError('Could not stop the recording cleanly.')
    }
  }, [recorder, uploadBlob])

  // Hard-cap: auto-stop at 3 minutes.
  useEffect(() => {
    if (recorder.status === 'recording' && recorder.durationMs >= RECORD_CAP_MS) {
      void finishRecording()
    }
  }, [recorder.status, recorder.durationMs, finishRecording])

  // Retry after an upload failure — re-posts the saved blob, no re-record.
  const retryUpload = useCallback(() => {
    if (lastBlobRef.current) {
      void uploadBlob(lastBlobRef.current)
    } else {
      // No blob captured (e.g. permission error); restart from scratch.
      retryPermission()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadBlob])

  // Retry after a permission/mic error — reset and re-prompt.
  const retryPermission = useCallback(() => {
    recorder.reset()
    lastBlobRef.current = null
    stoppingRef.current = false
    setUploadError(null)
    setPhase('prep')
    // Caller (user tapping "Try again") then taps Record again. We don't
    // auto-restart getUserMedia here because some browsers require a fresh
    // user gesture after a denial.
  }, [recorder])

  const errorIsPermission =
    recorder.status === 'error' &&
    (recorder.error?.toLowerCase().includes('permission') ?? false)

  // Derived timer values for the recording view.
  const recordingSecondsElapsed = Math.min(
    RECORD_SECS,
    Math.floor(recorder.durationMs / 1000),
  )
  const recordingRemainingSecs = Math.max(0, RECORD_SECS - recordingSecondsElapsed)

  // Drive the RecordButton visual state from the recorder directly.
  let recordButtonState: RecordingState = 'idle'
  if (phase === 'processing') recordButtonState = 'processing'
  else if (recorder.status === 'recording') recordButtonState = 'recording'

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: BG,
        fontFamily: DISPLAY_FONT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ maxWidth: 440, margin: '0 auto', width: '100%', flex: 1 }}>
        {/* Top bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            height: 64,
            backgroundColor: BG,
            borderBottom: '1px solid #1A1A1A0A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => {
              if (confirm('End this session?')) {
                recorder.reset()
                router.push('/speaking')
              }
            }}
            aria-label="Go back"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: INK,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 16,
              color: INK,
              margin: 0,
              textAlign: 'center',
              flex: 1,
            }}
          >
            T&acirc;che 3 &middot; Argumentative monologue
          </p>
          <button
            aria-label="Settings"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: INK_MUTED,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Settings size={20} strokeWidth={1.75} />
          </button>
        </header>

        <main style={{ padding: '24px 20px', paddingBottom: 'calc(40px + var(--fp-safe-bottom))' }}>
          {/* Topic card (hidden in error state so the help is front-and-center) */}
          {phase !== 'error' && (
            <div
              style={{
                backgroundColor: LAVENDER,
                borderRadius: 24,
                padding: '22px 22px',
                marginBottom: 32,
              }}
            >
              <p
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: INK_MUTED,
                  margin: '0 0 10px',
                }}
              >
                Your topic
              </p>
              <h2
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 20,
                  lineHeight: '28px',
                  color: INK,
                  margin: '0 0 12px',
                }}
              >
                {TOPIC.prompt}
              </h2>
              <p
                style={{
                  fontWeight: 500,
                  fontSize: 12,
                  color: INK_MUTED,
                  margin: 0,
                }}
              >
                Difficulty: {TOPIC.difficulty} &middot; Theme: {TOPIC.theme}
              </p>
            </div>
          )}

          {/* ── PREP STATE ── */}
          {phase === 'prep' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <h2
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 26,
                  color: INK,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                2 minutes to prepare
              </h2>
              <p
                style={{
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '22px',
                  color: INK_SOFT,
                  margin: 0,
                  textAlign: 'center',
                  maxWidth: 280,
                }}
              >
                Think about your structure: introduction, 2–3 arguments, conclusion.
              </p>

              <CountdownTimer
                totalSeconds={PREP_SECS}
                remaining={prepRemaining}
                onTick={setPrepRemaining}
                onComplete={() => void beginRecording()}
                size={140}
                accentColor={INK}
              />

              <button
                onClick={() => void beginRecording()}
                disabled={recorder.status === 'requesting-permission'}
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: INK,
                  color: '#FFFFFF',
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 16,
                  border: 'none',
                  cursor:
                    recorder.status === 'requesting-permission'
                      ? 'not-allowed'
                      : 'pointer',
                  outline: 'none',
                  marginTop: 4,
                  opacity: recorder.status === 'requesting-permission' ? 0.6 : 1,
                }}
              >
                {recorder.status === 'requesting-permission'
                  ? 'Requesting mic…'
                  : 'Ready. Record now'}
              </button>

              <button
                disabled
                aria-disabled="true"
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 500,
                  fontSize: 13,
                  color: INK_MUTED,
                  cursor: 'not-allowed',
                  padding: 0,
                  opacity: 0.5,
                }}
              >
                Add 1 more minute
              </button>
            </div>
          )}

          {/* ── RECORDING + PROCESSING STATES ── */}
          {(phase === 'recording' || phase === 'processing') && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <motion.h2
                key={phase}
                initial={reduceMotion ? false : { y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: durationBase, ease: easeFpEnter }}
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 26,
                  color: INK,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                {phase === 'processing' ? 'Analyzing…' : 'Recording'}
              </motion.h2>
              {phase === 'recording' && (
                <p
                  style={{
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: '22px',
                    color: INK_SOFT,
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  Speak for up to 3 minutes. Tap to stop early.
                </p>
              )}

              <CountdownTimer
                totalSeconds={RECORD_SECS}
                remaining={recordingRemainingSecs}
                // F-076 — controlled mode: parent owns timing. The
                // recordingRemainingSecs value is computed from
                // recorder.durationMs, which is already wall-clock-
                // correct via Date.now() (see useAudioRecorder.ts).
                // onTick / onComplete here are no-ops because the
                // parent's 3-min useEffect watcher on durationMs is
                // the actual auto-stop trigger.
                controlled
                onTick={() => {}}
                onComplete={() => {}}
                size={140}
                countUp
                maxSeconds={RECORD_SECS}
                accentColor={phase === 'processing' ? INK_MUTED : CORAL}
              />

              <motion.div
                animate={
                  reduceMotion
                    ? { scale: 1 }
                    : phase === 'processing'
                      ? { scale: recordingDonePulseScale }
                      : { scale: 1 }
                }
                transition={{ duration: recordingDonePulseDuration, ease: easeFpEnter }}
                style={{ display: 'flex' }}
              >
                <RecordButton
                  mode="tap"
                  recordingState={recordButtonState}
                  idleColor={CORAL}
                  onTap={() => void finishRecording()}
                />
              </motion.div>

              {phase === 'recording' && (
                <VuMeter stream={recorder.stream} color={CORAL} />
              )}

              {phase === 'recording' && (
                <button
                  onClick={() => void finishRecording()}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 500,
                    fontSize: 13,
                    color: INK_MUTED,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Stop recording
                </button>
              )}
            </div>
          )}

          {/* ── ERROR STATE ── */}
          {phase === 'error' && (
            <div
              role="alert"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                paddingTop: 12,
              }}
            >
              <h2
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 22,
                  color: INK,
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                {errorIsPermission ? 'Microphone access needed' : 'Something went wrong'}
              </h2>
              <p
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: '22px',
                  color: INK_SOFT,
                  margin: 0,
                  textAlign: 'center',
                  maxWidth: 320,
                }}
              >
                {errorIsPermission
                  ? "LeMethodic needs your microphone to record practice sessions. Click the camera/lock icon in your browser's address bar and allow microphone access, then try again."
                  : uploadError || recorder.error || 'Please try again.'}
              </p>

              <button
                onClick={
                  errorIsPermission
                    ? retryPermission
                    : lastBlobRef.current
                      ? retryUpload
                      : retryPermission
                }
                style={{
                  width: '100%',
                  maxWidth: 280,
                  height: 52,
                  borderRadius: 14,
                  backgroundColor: INK,
                  color: '#FFFFFF',
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 15,
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                Try again
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
