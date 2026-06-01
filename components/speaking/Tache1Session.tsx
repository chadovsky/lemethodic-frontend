'use client'

// Tâche 1 — personal-interview conversation session (F-063).
//
// State machine:
//   briefing → examiner-speaking (opening) → user-idle
//                                             ↓
//              user-recording → user-transcribing → reviewing
//                                                   ↓
//                                                   examiner-speaking (reply) → user-idle
//                                                                               ↓
//                                                                               finalizing → /diagnostic
//   Any phase → error → recovery
//
// Differences from Tache2Session:
//   - Hybrid opening: briefing card → tap Start → backend returns an examiner
//     turn on /start itself (not null like T2), so we enter examiner-speaking
//     before the user's first PTT.
//   - 4 user turns (TCF Canada T1 exam spec), not 6.
//   - 30s per-turn PTT cap — T1 turns are short exchanges.
//   - No scenario/picker. Single "interview" slug with a randomized opening
//     prompt picked server-side from tache1_openings.
//
// Everything else is ported from F-062/F-062.3 unchanged:
//   - useAudioRecorder + VuMeter + RecordButton (pointer capture via F-062.2)
//   - TurnReviewSheet (Confirmer + Refaire cette prise + suppress checkbox)
//   - supersede / soft-flag cascade for re-record
//   - Error overlay + secondary "Keep this take" escape

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import ChatBubble from './ChatBubble'
import RecordButton, { RecordingState } from './RecordButton'
import VuMeter from './VuMeter'
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
const PEACH        = 'var(--lm-pastel-peach)'
const BG           = 'var(--lm-bg-base)'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

const TARGET_USER_TURNS = 4
const TURN_CAP_MS       = 30_000
// Belt-and-braces against spurious pointer releases. Mirror of the T2
// guard. Real F-062.2 root cause is fixed by pointer capture in
// RecordButton; this catches anything else (OS-level events, stray taps).
const MIN_HOLD_MS       = 200

type Phase =
  | 'briefing'
  | 'user-idle'
  | 'user-recording'
  | 'user-transcribing'
  | 'reviewing'
  | 'supersede-in-flight'
  | 'examiner-speaking'
  | 'finalizing'
  | 'error'

type BubbleEntry = {
  side: 'examiner' | 'user'
  text: string
  audioUrl?: string | null
}

export default function Tache1Session() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  // ── State ────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('briefing')
  const [error, setError] = useState<string | null>(null)

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [bubbles, setBubbles] = useState<BubbleEntry[]>([])
  const [userTurnCount, setUserTurnCount] = useState(0)
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null)
  const [pendingExaminerBubble, setPendingExaminerBubble] = useState<BubbleEntry | null>(null)
  // Just-uploaded candidate turn's backend turn_number — used by Refaire
  // cette prise to know what row to supersede.
  const [pendingCandidateTurnNumber, setPendingCandidateTurnNumber] = useState<number | null>(null)
  const [reviewSuppressed, setReviewSuppressed] = useState(false)
  const [muted, setMuted] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)

  const recorder = useAudioRecorder()
  const scrollRef = useRef<HTMLDivElement>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  // Guards stopRecording / finalize / supersede against double-fire races.
  const stoppingRef = useRef(false)
  const finalizingRef = useRef(false)
  const supersedingRef = useRef(false)
  const userTurnCountRef = useRef(0)
  useEffect(() => {
    userTurnCountRef.current = userTurnCount
  }, [userTurnCount])

  // Auto-scroll on new bubble.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [bubbles, phase])

  // Cleanup: stop any playing examiner audio on unmount.
  useEffect(() => {
    return () => {
      const a = audioElRef.current
      if (a) {
        a.pause()
        a.src = ''
        audioElRef.current = null
      }
    }
  }, [])

  // ── Backend calls ────────────────────────────────────────────────────────

  const handleApiError = useCallback((err: unknown, genericFallback: string) => {
    setPhase('error')
    if (err instanceof ApiError) {
      setError(err.message ? `${err.status}: ${err.message}` : `${genericFallback} (${err.status}).`)
    } else if (err instanceof TypeError) {
      setError("Couldn't reach the server. Retry?")
    } else if (
      recorder.status === 'error' &&
      (recorder.error?.toLowerCase().includes('permission') ?? false)
    ) {
      setError(recorder.error)
    } else {
      setError(genericFallback)
    }
  }, [recorder.status, recorder.error])

  const startConversation = useCallback(async () => {
    setError(null)
    try {
      // T1 has no scenarioCode. Backend randomizes the opening prompt.
      const start = await api.sessions.createConversation('tache_1', {
        targetLevel: user?.targetLevel ?? 'B2',
        uiLanguage: user?.interfaceLanguage ?? 'en',
        examProfile: user?.examProfile ?? 'tcf_canada',
      })
      setConversationId(start.conversationId)
      if (start.examinerTurnText) {
        // T1's /start always carries the opening examiner turn. Render
        // bubble + play audio; the examiner-speaking effect handles the
        // transition to user-idle once audio finishes.
        setBubbles([
          {
            side: 'examiner',
            text: start.examinerTurnText,
            audioUrl: start.examinerTurnAudioUrl,
          },
        ])
        setPhase('examiner-speaking')
      } else {
        // Defensive — if the backend somehow returns no opening, skip
        // straight to user-idle instead of hanging on examiner-speaking.
        setPhase('user-idle')
      }
    } catch (err) {
      handleApiError(err, 'Could not start the interview.')
    }
  }, [user, handleApiError])

  // ── Recording controls ───────────────────────────────────────────────────

  const handlePTTStart = useCallback(async () => {
    if (phase !== 'user-idle') return
    setError(null)
    stoppingRef.current = false
    await recorder.startRecording()
  }, [phase, recorder])

  useEffect(() => {
    if (recorder.status === 'recording' && phase === 'user-idle') {
      setPhase('user-recording')
    } else if (recorder.status === 'error' && phase !== 'error') {
      handleApiError(
        new Error(recorder.error ?? 'Microphone error.'),
        recorder.error ?? 'Microphone error.',
      )
    }
  }, [recorder.status, recorder.error, phase, handleApiError])

  const finalize = useCallback(async () => {
    if (finalizingRef.current) return
    finalizingRef.current = true
    setPhase('finalizing')
    try {
      if (!conversationId) {
        throw new Error('Missing conversation id.')
      }
      const result = await api.sessions.finalizeConversation(conversationId)
      if (result.recordingId == null) {
        throw new Error('Analysis returned no recording id.')
      }
      router.push(`/l-examen/diagnostic?session=${result.recordingId}`)
    } catch (err) {
      finalizingRef.current = false
      handleApiError(err, 'Could not finalize the session. Retry?')
    }
  }, [conversationId, router, handleApiError])

  // Central "user turn committed → what next" router. Called from both
  // the review-confirm path and the review-suppressed path. userTurnCount
  // increments here, not in uploadTurn — matches F-062.3 deferred-commit
  // pattern so a Refaire between upload and Confirmer cleanly rolls back.
  const proceedAfterCommit = useCallback(
    (
      examinerBubble: BubbleEntry,
      hasExaminerReply: boolean,
    ) => {
      const committedCount = userTurnCountRef.current + 1
      setUserTurnCount(committedCount)
      setPendingCandidateTurnNumber(null)

      if (hasExaminerReply) {
        setBubbles((prev) => [...prev, examinerBubble])
        setPhase('examiner-speaking')
      } else if (committedCount >= TARGET_USER_TURNS) {
        // Backend auto-ended (hit its cap) and didn't emit another
        // examiner turn — finalize directly.
        void finalize()
      } else {
        // Defensive: no examiner reply but more turns to go. Shouldn't
        // normally happen (T1 backend emits one reply per turn until the
        // cap), but keep the flow alive if it does.
        setPhase('user-idle')
      }
      stoppingRef.current = false
    },
    [finalize],
  )

  const uploadTurn = useCallback(
    async (blob: Blob) => {
      if (!conversationId) {
        handleApiError(new Error('Missing conversation id.'), 'Session state lost. Retry?')
        return
      }
      setPhase('user-transcribing')
      try {
        const result = await api.sessions.uploadConversationTurn(conversationId, blob)

        // Optimistic user bubble (popped on Refaire via handleReRecord).
        setBubbles((prev) => [
          ...prev,
          { side: 'user', text: result.candidateTranscript || '…' },
        ])
        setPendingTranscript(result.candidateTranscript)
        setPendingCandidateTurnNumber(result.candidateTurnNumber)

        if (result.examinerTurnText) {
          setPendingExaminerBubble({
            side: 'examiner',
            text: result.examinerTurnText,
            audioUrl: result.examinerTurnAudioUrl,
          })
        } else {
          setPendingExaminerBubble(null)
        }

        if (reviewSuppressed) {
          proceedAfterCommit(
            {
              side: 'examiner',
              text: result.examinerTurnText ?? '',
              audioUrl: result.examinerTurnAudioUrl,
            },
            result.examinerTurnText != null,
          )
        } else {
          setPhase('reviewing')
        }
      } catch (err) {
        handleApiError(err, 'Upload failed. Retry?')
      }
    },
    [conversationId, reviewSuppressed, handleApiError, proceedAfterCommit],
  )

  const finishRecording = useCallback(async () => {
    if (stoppingRef.current) return
    stoppingRef.current = true
    const heldMs = recorder.durationMs
    try {
      const blob = await recorder.stopRecording()
      if (heldMs < MIN_HOLD_MS) {
        // Slip-finger guard. Silent — no error card, just pop back to idle.
        setPhase('user-idle')
        stoppingRef.current = false
        return
      }
      await uploadTurn(blob)
    } catch {
      handleApiError(new Error('Could not stop the recording cleanly.'), 'Could not stop the recording cleanly.')
    }
  }, [recorder, uploadTurn, handleApiError])

  // 30s hard cap during recording.
  useEffect(() => {
    if (recorder.status === 'recording' && recorder.durationMs >= TURN_CAP_MS) {
      void finishRecording()
    }
  }, [recorder.status, recorder.durationMs, finishRecording])

  // ── Supersede (Refaire cette prise) ──────────────────────────────────────

  const handleReRecord = useCallback(async () => {
    if (phase !== 'reviewing' && phase !== 'error') return
    if (!conversationId || pendingCandidateTurnNumber == null) {
      handleApiError(
        new Error('Missing turn context.'),
        'Could not identify this take. Start the interview again.',
      )
      return
    }
    if (supersedingRef.current) return
    supersedingRef.current = true
    setPhase('supersede-in-flight')
    try {
      await api.sessions.supersedeTurn(conversationId, pendingCandidateTurnNumber)
      setBubbles((prev) => prev.slice(0, -1))
      setPendingTranscript(null)
      setPendingExaminerBubble(null)
      setPendingCandidateTurnNumber(null)
      stoppingRef.current = false
      supersedingRef.current = false
      setPhase('user-idle')
    } catch (err) {
      supersedingRef.current = false
      handleApiError(err, 'Could not discard this take. Retry?')
    }
  }, [phase, conversationId, pendingCandidateTurnNumber, handleApiError])

  const keepTakeFromSupersedeError = useCallback(() => {
    if (!pendingExaminerBubble) {
      setPhase('user-idle')
      setPendingCandidateTurnNumber(null)
      setPendingTranscript(null)
      supersedingRef.current = false
      return
    }
    supersedingRef.current = false
    proceedAfterCommit(pendingExaminerBubble, true)
  }, [pendingExaminerBubble, proceedAfterCommit])

  // ── Examiner playback ────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'examiner-speaking') return
    const last = bubbles[bubbles.length - 1]
    if (!last || last.side !== 'examiner') return

    setAutoplayBlocked(false)

    const onDone = () => {
      // If we've hit the committed-turn cap, finalize; else hand off to
      // the user for the next turn.
      if (userTurnCountRef.current >= TARGET_USER_TURNS) {
        void finalize()
      } else {
        setPhase('user-idle')
      }
    }

    if (!last.audioUrl || muted) {
      onDone()
      return
    }

    const audio = new Audio(last.audioUrl)
    audioElRef.current = audio
    audio.onended = onDone
    audio.onerror = onDone
    audio.play().catch(() => {
      // Autoplay blocked — expose a manual Listen button.
      setAutoplayBlocked(true)
    })

    return () => {
      audio.onended = null
      audio.onerror = null
      audio.pause()
      if (audioElRef.current === audio) audioElRef.current = null
    }
  }, [phase, bubbles, muted, finalize])

  const handleListenTap = useCallback(() => {
    const a = audioElRef.current
    if (a) {
      a.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true))
    } else {
      setAutoplayBlocked(false)
      if (userTurnCountRef.current >= TARGET_USER_TURNS) {
        void finalize()
      } else {
        setPhase('user-idle')
      }
    }
  }, [finalize])

  // ── Review flow ──────────────────────────────────────────────────────────

  const confirmReview = useCallback(() => {
    const examiner = pendingExaminerBubble
    setPendingExaminerBubble(null)
    setPendingTranscript(null)
    proceedAfterCommit(examiner ?? { side: 'examiner', text: '' }, examiner != null)
  }, [pendingExaminerBubble, proceedAfterCommit])

  // ── Error recovery ───────────────────────────────────────────────────────

  const retryFromError = useCallback(() => {
    finalizingRef.current = false
    stoppingRef.current = false
    supersedingRef.current = false
    setError(null)
    if (!conversationId) {
      setPhase('briefing')
      return
    }
    if (pendingCandidateTurnNumber != null) {
      void handleReRecord()
      return
    }
    if (userTurnCount >= TARGET_USER_TURNS) {
      void finalize()
    } else {
      setPhase('user-idle')
    }
  }, [conversationId, userTurnCount, pendingCandidateTurnNumber, finalize, handleReRecord])

  // ── Derived values ───────────────────────────────────────────────────────

  const recordButtonState: RecordingState =
    phase === 'user-recording'
      ? 'recording'
      : phase === 'user-transcribing'
        ? 'processing'
        : phase === 'reviewing'
          ? 'awaiting_review'
          : 'idle'

  const secondsLeftInTurn = Math.max(
    0,
    Math.ceil((TURN_CAP_MS - recorder.durationMs) / 1000),
  )

  const turnDisplay = `Turn ${Math.min(userTurnCount + 1, TARGET_USER_TURNS)} of ${TARGET_USER_TURNS}`

  const showFinalizingOverlay = phase === 'finalizing'
  const showReviewSheet = phase === 'reviewing'
  const showErrorOverlay = phase === 'error'

  // Hide turn indicator during briefing and the opening examiner turn —
  // it should only surface once the user is about to speak. Everyone
  // already knows they're on turn 1 before the opening ends.
  const showTurnIndicator = phase !== 'briefing' && !(phase === 'examiner-speaking' && userTurnCount === 0)

  // ── Render ───────────────────────────────────────────────────────────────

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
      <div
        style={{
          maxWidth: 440,
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        <Header
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
          onExit={() => {
            if (confirm('End this session?')) {
              recorder.reset()
              router.push('/l-examen/expression-orale')
            }
          }}
          turnDisplay={showTurnIndicator ? turnDisplay : null}
        />

        {phase === 'briefing' ? (
          <BriefingPanel onStart={startConversation} />
        ) : (
          <>
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                paddingBottom: phase === 'user-recording' ? 340 : 220,
                transition: 'padding-bottom 0.2s ease',
              }}
            >
              {bubbles.map((b, i) => (
                <ChatBubble
                  key={i}
                  side={b.side}
                  senderLabel={b.side === 'examiner' ? 'Examinateur' : 'Vous'}
                  text={b.text}
                  showAudio={b.side === 'examiner' && !!b.audioUrl}
                  bubbleColor={PEACH}
                />
              ))}

              {autoplayBlocked && phase === 'examiner-speaking' && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <button
                    onClick={handleListenTap}
                    style={ghostButtonStyle}
                    aria-label="Play examiner audio"
                  >
                    Tap to hear the question
                  </button>
                </div>
              )}
            </div>

            <BottomBar
              phase={phase}
              recordButtonState={recordButtonState}
              recorderStream={recorder.stream}
              secondsLeftInTurn={secondsLeftInTurn}
              onPTTStart={handlePTTStart}
              onPTTEnd={finishRecording}
            />
          </>
        )}
      </div>

      {showReviewSheet && (
        <TurnReviewSheet
          transcript={pendingTranscript ?? ''}
          onConfirm={confirmReview}
          onReRecord={handleReRecord}
          suppressed={reviewSuppressed}
          onToggleSuppress={setReviewSuppressed}
        />
      )}

      {phase === 'supersede-in-flight' && <SupersedeInFlightOverlay />}

      {showFinalizingOverlay && <FinalizingOverlay />}

      {showErrorOverlay && (
        <ErrorOverlay
          message={error ?? 'Something went wrong.'}
          onRetry={retryFromError}
          secondaryAction={
            pendingCandidateTurnNumber != null
              ? { label: 'Keep this take', onClick: keepTakeFromSupersedeError }
              : undefined
          }
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-components — inline since they're only used here.
// ═══════════════════════════════════════════════════════════════════════════

const ghostButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: `1.5px solid ${INK_MUTED}`,
  borderRadius: 100,
  padding: '8px 16px',
  fontFamily: DISPLAY_FONT,
  fontWeight: 600,
  fontSize: 13,
  color: INK_SOFT,
  cursor: 'pointer',
  outline: 'none',
}

function Header({
  muted,
  onToggleMute,
  onExit,
  turnDisplay,
}: {
  muted: boolean
  onToggleMute: () => void
  onExit: () => void
  turnDisplay: string | null
}) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: BG,
        borderBottom: '1px solid #1A1A1A0A',
        padding: '10px 12px 10px',
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 2,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onExit}
          aria-label="Go back"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: INK, display: 'flex' }}
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: 11, color: INK_MUTED, margin: '0 0 2px', letterSpacing: '0.04em' }}>
            T&acirc;che 1 &middot; Self-presentation
          </p>
          <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 17, color: INK, margin: 0 }}>
            Your interview
          </p>
        </div>
        <button
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute voice' : 'Mute voice'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: INK_MUTED, display: 'flex' }}
        >
          {muted ? <VolumeX size={20} strokeWidth={1.75} /> : <Volume2 size={20} strokeWidth={1.75} />}
        </button>
      </div>
      {turnDisplay && (
        <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 12, color: INK_MUTED, textAlign: 'center', margin: 0 }}>
          {turnDisplay}
        </p>
      )}
    </header>
  )
}

function BriefingPanel({ onStart }: { onStart: () => void }) {
  return (
    <div
      style={{
        margin: '12px 20px 0',
        backgroundColor: PEACH,
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '20px 20px' }}>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: INK_MUTED,
            margin: '0 0 8px',
          }}
        >
          Your interview
        </p>
        <p style={{ fontWeight: 500, fontSize: 15, lineHeight: '22px', color: INK, margin: '0 0 14px' }}>
          The examiner will ask you questions about yourself.
        </p>
        <p style={{ fontWeight: 500, fontSize: 14, lineHeight: '21px', color: INK_SOFT, margin: '0 0 10px' }}>
          Introduce who you are, what you do, your interests.
        </p>
        <p style={{ fontWeight: 500, fontSize: 14, lineHeight: '21px', color: INK_SOFT, margin: '0 0 18px' }}>
          Speak naturally &mdash; this is a conversation, not a monologue.
        </p>
        <div
          style={{
            borderTop: '1px solid #1A1A1A14',
            paddingTop: 14,
            marginBottom: 18,
          }}
        >
          <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 600, fontSize: 12, color: INK_SOFT, margin: '0 0 6px' }}>
            {TARGET_USER_TURNS} turns &middot; up to {Math.round(TURN_CAP_MS / 1000)} seconds each
          </p>
          <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 12, color: INK_MUTED, margin: 0 }}>
            Hold the mic button while speaking. Release to send.
          </p>
        </div>
        <button
          onClick={onStart}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 16,
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
          Start interview
        </button>
      </div>
    </div>
  )
}

function BottomBar({
  phase,
  recordButtonState,
  recorderStream,
  secondsLeftInTurn,
  onPTTStart,
  onPTTEnd,
}: {
  phase: Phase
  recordButtonState: RecordingState
  recorderStream: MediaStream | null
  secondsLeftInTurn: number
  onPTTStart: () => void
  onPTTEnd: () => void
}) {
  const reduceMotion = useReducedMotion()
  const helper =
    phase === 'user-idle' ? 'Hold to talk' :
    phase === 'user-recording' ? 'Recording… release to stop' :
    phase === 'user-transcribing' ? 'Transcribing…' :
    phase === 'reviewing' ? 'Reviewing your turn…' :
    phase === 'examiner-speaking' ? 'Listen to the examiner…' :
    'Waiting…'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 440,
        backgroundColor: 'var(--paper)',
        borderTop: '1px solid #1A1A1A14',
        padding: '20px 24px calc(20px + var(--lm-safe-bottom)) 24px',
        zIndex: 30,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {phase === 'user-recording' && (
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 800,
              fontSize: 22,
              color: INK,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            0:{String(secondsLeftInTurn).padStart(2, '0')}
          </p>
        )}

        <motion.div
          animate={
            reduceMotion
              ? { scale: 1 }
              : phase === 'user-transcribing'
                ? { scale: recordingDonePulseScale }
                : { scale: 1 }
          }
          transition={{ duration: recordingDonePulseDuration, ease: easeFpEnter }}
          style={{ display: 'flex' }}
        >
          <RecordButton
            mode="ptt"
            recordingState={recordButtonState}
            idleColor={PEACH}
            onPTTStart={phase === 'user-idle' ? onPTTStart : undefined}
            onPTTEnd={phase === 'user-recording' ? onPTTEnd : undefined}
          />
        </motion.div>

        {phase === 'user-recording' && (
          <VuMeter stream={recorderStream} color={INK} />
        )}

        <motion.p
          key={phase}
          initial={reduceMotion ? false : { y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: durationBase, ease: easeFpEnter }}
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 14,
            color: INK,
            margin: 0,
            textAlign: 'center',
          }}
        >
          {helper}
        </motion.p>

        {phase === 'user-idle' && (
          <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 12, color: INK_MUTED, margin: 0, textAlign: 'center' }}>
            Press and hold the button to speak
          </p>
        )}
      </div>
    </div>
  )
}

function TurnReviewSheet({
  transcript,
  onConfirm,
  onReRecord,
  suppressed,
  onToggleSuppress,
}: {
  transcript: string
  onConfirm: () => void
  onReRecord: () => void
  suppressed: boolean
  onToggleSuppress: (v: boolean) => void
}) {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.28)',
          zIndex: 60,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Review your turn"
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'var(--lm-bg-base)',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          zIndex: 70,
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 20px 0' }}>
          <div
            aria-hidden="true"
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: INK_MUTED,
              margin: '0 auto 20px',
            }}
          />
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: INK_MUTED,
              margin: '0 0 8px',
            }}
          >
            Your turn
          </p>
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 17,
              color: INK,
              margin: '0 0 12px',
              lineHeight: 1.35,
            }}
          >
            Does this capture what you said?
          </p>
          <div
            style={{
              backgroundColor: PEACH,
              borderRadius: 18,
              padding: '16px 18px',
              marginBottom: 20,
            }}
          >
            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 15,
                lineHeight: '23px',
                color: INK,
                margin: 0,
              }}
            >
              {transcript || '—'}
            </p>
          </div>
          <p
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 12,
              color: INK_MUTED,
              lineHeight: '18px',
              margin: 0,
            }}
          >
            Full feedback appears on your diagnostic after all {TARGET_USER_TURNS} turns.
          </p>
          <div style={{ height: 20 }} />
        </div>
        <div
          style={{
            padding: '16px 20px calc(32px + var(--lm-safe-bottom)) 20px',
            borderTop: '1px solid #1A1A1A0A',
            backgroundColor: 'var(--lm-bg-base)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={onConfirm}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 16,
              border: 'none',
              backgroundColor: INK,
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 15,
              color: '#FFFFFF',
              cursor: 'pointer',
              outline: 'none',
              marginBottom: 10,
            }}
          >
            Confirmer
          </button>
          <button
            onClick={onReRecord}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 14,
              border: `1.5px solid ${INK_MUTED}`,
              backgroundColor: 'transparent',
              fontFamily: DISPLAY_FONT,
              fontWeight: 600,
              fontSize: 14,
              color: INK_SOFT,
              cursor: 'pointer',
              outline: 'none',
              marginBottom: 14,
            }}
            aria-label="Re-record this take"
          >
            Refaire cette prise
          </button>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={suppressed}
              onChange={(e) => onToggleSuppress(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: INK, cursor: 'pointer', flexShrink: 0 }}
            />
            <span
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 13,
                color: INK_SOFT,
              }}
            >
              Ne plus afficher cette revue
            </span>
          </label>
        </div>
      </div>
    </>
  )
}

function FinalizingOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(250, 250, 247, 0.96)',
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontFamily: DISPLAY_FONT,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 44,
          height: 44,
          border: `3px solid ${INK}22`,
          borderTopColor: INK,
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }}
      />
      <p style={{ fontWeight: 700, fontSize: 18, color: INK, margin: 0 }}>
        Analyzing your interview…
      </p>
      <p style={{ fontWeight: 500, fontSize: 13, color: INK_MUTED, margin: 0, textAlign: 'center', maxWidth: 300 }}>
        Running the 5-couche analysis across all {TARGET_USER_TURNS} of your turns.
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function SupersedeInFlightOverlay() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(250, 250, 247, 0.72)',
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        fontFamily: DISPLAY_FONT,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          border: `3px solid ${INK}22`,
          borderTopColor: INK,
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }}
      />
      <p style={{ fontWeight: 600, fontSize: 14, color: INK_SOFT, margin: 0 }}>
        Discarding this take…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function ErrorOverlay({
  message,
  onRetry,
  secondaryAction,
}: {
  message: string
  onRetry: () => void
  secondaryAction?: { label: string; onClick: () => void }
}) {
  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(250, 250, 247, 0.96)',
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '0 24px',
        fontFamily: DISPLAY_FONT,
      }}
    >
      <p style={{ fontWeight: 700, fontSize: 18, color: INK, margin: 0, textAlign: 'center' }}>
        Something went wrong
      </p>
      <p style={{ fontWeight: 500, fontSize: 14, color: INK_SOFT, margin: 0, textAlign: 'center', maxWidth: 320 }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        style={{
          marginTop: 4,
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 15,
          color: '#FFFFFF',
          backgroundColor: INK,
          border: 'none',
          borderRadius: 14,
          padding: '12px 24px',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
      {secondaryAction && (
        <button
          onClick={secondaryAction.onClick}
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 600,
            fontSize: 14,
            color: INK_SOFT,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 12px',
          }}
        >
          {secondaryAction.label}
        </button>
      )}
    </div>
  )
}
