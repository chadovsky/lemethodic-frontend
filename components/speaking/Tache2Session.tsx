'use client'

// Tâche 2 — role-play conversation session (F-062).
//
// State machine:
//   briefing → user-idle → user-recording → user-transcribing
//              ↓             ↑
//              reviewing ────┘ (loops up to TARGET_USER_TURNS)
//              ↓
//              examiner-speaking → user-idle (next turn)
//                                  ↓
//                                  finalizing → routes to /diagnostic
//   Any phase → error → recovery
//
// Backend contract:
//   POST /conversations/start       (T2: examiner_turn_* all null, candidate opens)
//   POST /conversations/{id}/turn   (multipart audio; returns transcript + next examiner turn)
//   POST /conversations/{id}/end    (runs 4-couche analysis, returns recording_id)
//
// Primitives: useAudioRecorder + VuMeter come from F-061 untouched. The
// 60s cap is enforced here via an effect on recorder.durationMs — same
// pattern as Tache3Session's 180s cap but with a different threshold.
//
// Per-turn review: the backend emits feedback_grid only at /end (not per
// /turn), so the review sheet here is transcript-confirmation only — no
// moule-level coaching. Full Pyramide/Rebond/Ciblage breakdown surfaces
// on the /diagnostic page after finalize. See F-068 if per-turn moule
// feedback gets added to /turn later.

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import ChatBubble from './ChatBubble'
import RecordButton, { RecordingState } from './RecordButton'
import VuMeter from './VuMeter'
import {
  durationBase,
  easeFpEnter,
  recordingDonePulseScale,
  recordingDonePulseDuration,
} from '@/lib/motion'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'

const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const SAGE         = '#D4E4D0'
const PEACH        = '#FFD8C2'
const BUTTER       = '#FFF0C2'
const BG           = 'var(--fp-canvas)'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

const TARGET_USER_TURNS = 6
const TURN_CAP_MS       = 60_000
// Belt-and-braces against spurious pointer releases (slip fingers, OS
// events firing during the recorder startup window, etc.). The real
// F-062.2 root cause (layout-shift-triggered pointerleave) is fixed by
// pointer capture in RecordButton; this guard catches anything else.
const MIN_HOLD_MS       = 200

type Phase =
  | 'briefing'
  | 'user-idle'
  | 'user-recording'
  | 'user-transcribing'
  | 'reviewing'
  // F-062.3 Refaire cette prise is in flight — supersede API call running.
  | 'supersede-in-flight'
  | 'examiner-speaking'
  | 'finalizing'
  | 'error'

type BubbleEntry = {
  side: 'examiner' | 'user'
  text: string
  /** Examiner audio URL for this bubble, if any. */
  audioUrl?: string | null
}

interface ScenarioBrief {
  /** The backend's scenario_code column value. URL slugs and backend codes
   *  drifted during seeding (hyphen vs underscore, plus three entirely
   *  different spellings — "ami-demenage" vs "ami_demenagement", etc.), so
   *  this field is the source of truth for what /start accepts. */
  backendCode: string
  title: string
  roleBody: string
  infoTargets: string[]
  bg: string
  counterpartLabel: string
  register: string
}

// Scenario briefs keyed by URL slug. `backendCode` is the value sent to
// POST /api/conversations/start; it does NOT match the URL slug in three of
// the five seeded scenarios.
//
// TODO(F-061.1): replace this literal with a live fetch of
// GET /api/conversations/scenarios so there's one source of truth for both
// the picker and this session. The sanity check in Tache2Picker currently
// flags drift; moving to a live fetch eliminates the drift entirely.
const SCENARIO_BRIEFS: Record<string, ScenarioBrief> = {
  'agence-voyages': {
    backendCode: 'agence_voyages',
    title: "L'agence de voyages",
    roleBody:
      'You want to plan a vacation to a French-speaking country. Ask the agent everything you need to choose the perfect destination.',
    infoTargets: [
      'Destination options',
      'Price range',
      'Duration of stay',
      'Type of accommodation',
      'Included activities',
      'Weather forecast',
      'Visa requirements',
    ],
    bg: SAGE,
    counterpartLabel: 'travel agent',
    register: 'Formel',
  },
  'ami-demenage': {
    backendCode: 'ami_demenagement',
    title: "L'ami qui déménage",
    roleBody:
      'Your friend is moving to another city. Ask the questions a good friend would ask.',
    infoTargets: [
      'Where they are moving',
      'When they leave',
      'Why they are leaving',
      'New job or studies',
      'New living situation',
      'When you can visit',
    ],
    bg: PEACH,
    counterpartLabel: 'your friend',
    register: 'Informel',
  },
  'bibliotheque': {
    backendCode: 'bibliotheque',
    title: 'La bibliothèque',
    roleBody:
      'You need a book at the library and want to know the rules. Ask the librarian.',
    infoTargets: [
      'How to borrow a book',
      'Loan duration',
      'Late fees',
      'Renewing a loan',
      'Quiet-room hours',
      'Membership cost',
    ],
    bg: BUTTER,
    counterpartLabel: 'the librarian',
    register: 'Semi-formel',
  },
}

// Fallback brief used when a scenario slug isn't in the map (e.g. direct
// URL edit). Keeps the session functional instead of crashing; backendCode
// falls back to the slug itself — the backend will reject it with a 404
// and the error overlay will surface the detail.
const FALLBACK_BRIEF: Omit<ScenarioBrief, 'backendCode'> = {
  title: 'Role-play',
  roleBody: 'Ask questions to gather the information you need.',
  infoTargets: [],
  bg: SAGE,
  counterpartLabel: 'your counterpart',
  register: 'Formel',
}

interface Tache2SessionProps {
  scenario?: string
}

export default function Tache2Session({ scenario = 'agence-voyages' }: Tache2SessionProps) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  // Unknown slug → fallback brief, with the slug itself as the backendCode.
  // /start will 404 and the error overlay will surface the detail — better
  // UX than silently substituting a valid-but-wrong scenario.
  const brief: ScenarioBrief = SCENARIO_BRIEFS[scenario] ?? {
    ...FALLBACK_BRIEF,
    backendCode: scenario,
  }

  // ── State ────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('briefing')
  const [error, setError] = useState<string | null>(null)

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [bubbles, setBubbles] = useState<BubbleEntry[]>([])
  const [userTurnCount, setUserTurnCount] = useState(0)
  const [pendingTranscript, setPendingTranscript] = useState<string | null>(null)
  const [pendingExaminerBubble, setPendingExaminerBubble] = useState<BubbleEntry | null>(null)
  // F-062.3: the just-uploaded candidate turn's backend turn_number. Set
  // when review sheet opens, used to supersede if the user hits Refaire,
  // cleared when the turn is either committed or superseded.
  const [pendingCandidateTurnNumber, setPendingCandidateTurnNumber] = useState<number | null>(null)
  const [reviewSuppressed, setReviewSuppressed] = useState(false)
  const [muted, setMuted] = useState(false)
  const [briefExpanded, setBriefExpanded] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)

  const recorder = useAudioRecorder()
  const scrollRef = useRef<HTMLDivElement>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)
  // Guards finalize + stopRecording against double-triggering from the 60s
  // cap effect racing a user tap.
  const stoppingRef = useRef(false)
  const finalizingRef = useRef(false)
  // F-062.3: guards /supersede from firing twice if the user double-taps
  // Refaire while the network call is in flight.
  const supersedingRef = useRef(false)
  // Latest user-turn count — used by the examiner-audio-ended callback so it
  // doesn't close over a stale count when the effect fires.
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

  const startConversation = useCallback(async () => {
    setError(null)
    try {
      const start = await api.sessions.createConversation('tache_2', {
        scenarioCode: brief.backendCode,
        targetLevel: user?.targetLevel ?? 'B2',
        uiLanguage: user?.interfaceLanguage ?? 'en',
        examProfile: user?.examProfile ?? 'tcf_canada',
      })
      setConversationId(start.conversationId)
      // T2 has no opening examiner turn. If a future backend change adds
      // one, surface it here so the rest of the flow doesn't need to fork.
      if (start.examinerTurnText) {
        setBubbles([
          {
            side: 'examiner',
            text: start.examinerTurnText,
            audioUrl: start.examinerTurnAudioUrl,
          },
        ])
        setPendingExaminerBubble(null)
        setPhase('examiner-speaking')
      } else {
        setPhase('user-idle')
      }
    } catch (err) {
      handleApiError(err, 'Could not start the conversation.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief.backendCode, user])

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

  // ── Recording controls ───────────────────────────────────────────────────

  const handlePTTStart = useCallback(async () => {
    if (phase !== 'user-idle') return
    setError(null)
    stoppingRef.current = false
    await recorder.startRecording()
    // status transitions observed via the effect below.
  }, [phase, recorder])

  // When the recorder reports 'recording' and we're still idle, advance.
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

  const uploadTurn = useCallback(
    async (blob: Blob) => {
      if (!conversationId) {
        handleApiError(new Error('Missing conversation id.'), 'Session state lost. Retry?')
        return
      }
      setPhase('user-transcribing')
      try {
        const result = await api.sessions.uploadConversationTurn(conversationId, blob)

        // F-062.3: show the user's line optimistically so it's visible
        // under the review sheet, BUT don't yet increment userTurnCount.
        // The count increments in proceedAfterCommit (on Confirmer); if
        // the user taps Refaire, we pop this bubble in handleReRecord.
        setBubbles((prev) => [
          ...prev,
          { side: 'user', text: result.candidateTranscript || '…' },
        ])
        setPendingTranscript(result.candidateTranscript)
        setPendingCandidateTurnNumber(result.candidateTurnNumber)

        // Stash the examiner reply — it plays after review (or immediately
        // if review is suppressed).
        if (result.examinerTurnText) {
          setPendingExaminerBubble({
            side: 'examiner',
            text: result.examinerTurnText,
            audioUrl: result.examinerTurnAudioUrl,
          })
        } else {
          setPendingExaminerBubble(null)
        }

        // Branch: review or skip?
        if (reviewSuppressed) {
          proceedAfterCommit({
            side: 'examiner',
            text: result.examinerTurnText ?? '',
            audioUrl: result.examinerTurnAudioUrl,
          }, result.examinerTurnText != null)
        } else {
          setPhase('reviewing')
        }
      } catch (err) {
        handleApiError(err, 'Upload failed. Retry?')
      }
    },
    // proceedAfterCommit referenced below — useCallback chain allows it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversationId, reviewSuppressed, handleApiError],
  )

  const finishRecording = useCallback(async () => {
    if (stoppingRef.current) return
    stoppingRef.current = true
    // Snapshot duration BEFORE stopRecording runs. stopRecording releases
    // the stream and stops the tick interval, so durationMs freezes — but
    // reading it before is explicit about intent.
    const heldMs = recorder.durationMs
    try {
      const blob = await recorder.stopRecording()
      if (heldMs < MIN_HOLD_MS) {
        // Spurious release (slip finger, stray pointer event). Discard and
        // reset — user will see the button pop back to idle and can
        // re-press. Silent by design: showing an error would be more
        // confusing than the state reset for an accidental tap.
        setPhase('user-idle')
        stoppingRef.current = false
        return
      }
      await uploadTurn(blob)
    } catch {
      handleApiError(new Error('Could not stop the recording cleanly.'), 'Could not stop the recording cleanly.')
    }
  }, [recorder, uploadTurn, handleApiError])

  // 60s hard cap during recording.
  useEffect(() => {
    if (recorder.status === 'recording' && recorder.durationMs >= TURN_CAP_MS) {
      void finishRecording()
    }
  }, [recorder.status, recorder.durationMs, finishRecording])

  // ── Examiner playback + turn progression ─────────────────────────────────

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
      router.push(`/diagnostic?session=${result.recordingId}`)
    } catch (err) {
      finalizingRef.current = false
      handleApiError(err, 'Could not finalize the session. Retry?')
    }
  }, [conversationId, router, handleApiError])

  // Central "user turn committed → what next" router. Called from both
  // the review-confirm path and the review-suppressed path.
  // F-062.3: this is where userTurnCount actually increments. Prior to this
  // call, the user bubble is shown on screen but the turn hasn't "counted"
  // — a Refaire tap between upload and Confirmer rolls it back.
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
        // No examiner reply AND we've hit target — straight to finalize.
        void finalize()
      } else {
        // No examiner reply but more turns to go (unexpected for T2, but
        // defensive): go back to user-idle so the candidate can continue.
        setPhase('user-idle')
      }
      stoppingRef.current = false
    },
    [finalize],
  )

  // F-062.3: user tapped Refaire cette prise in the review sheet. Supersede
  // the just-uploaded candidate turn (backend cascades to the examiner
  // follow-up if it generated one), pop the optimistic VOUS bubble, reset
  // to user-idle. Turn counter is NOT touched because it was never
  // incremented for this attempt — see proceedAfterCommit.
  const handleReRecord = useCallback(async () => {
    if (phase !== 'reviewing' && phase !== 'error') return
    if (!conversationId || pendingCandidateTurnNumber == null) {
      handleApiError(
        new Error('Missing turn context.'),
        'Could not identify this take. Start the conversation again.',
      )
      return
    }
    if (supersedingRef.current) return
    supersedingRef.current = true
    setPhase('supersede-in-flight')
    try {
      await api.sessions.supersedeTurn(conversationId, pendingCandidateTurnNumber)
      // Pop the optimistic user bubble. Examiner follow-up was not yet
      // added to bubbles (that happens in proceedAfterCommit), so nothing
      // to pop on that side.
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

  // F-062.3: fallback from the supersede error state. Pretend the user hit
  // Confirmer — commits the take as-is. Safer than stranding them in an
  // error loop if /supersede is broken (network, auth, whatever).
  const keepTakeFromSupersedeError = useCallback(() => {
    if (!pendingExaminerBubble) {
      // Shouldn't happen — the review sheet only opens when we have a
      // response in hand. Defensive.
      setPhase('user-idle')
      setPendingCandidateTurnNumber(null)
      setPendingTranscript(null)
      supersedingRef.current = false
      return
    }
    supersedingRef.current = false
    proceedAfterCommit(pendingExaminerBubble, true)
  }, [pendingExaminerBubble, proceedAfterCommit])

  // Examiner audio playback driver. Runs whenever we enter examiner-speaking
  // and there's a bubble with audio to play.
  useEffect(() => {
    if (phase !== 'examiner-speaking') return
    const last = bubbles[bubbles.length - 1]
    if (!last || last.side !== 'examiner') return

    setAutoplayBlocked(false)

    const onDone = () => {
      // If we've hit TARGET_USER_TURNS user turns, this was the examiner
      // reply to the 6th turn — finalize. Otherwise back to user-idle.
      if (userTurnCountRef.current >= TARGET_USER_TURNS) {
        void finalize()
      } else {
        setPhase('user-idle')
      }
    }

    if (!last.audioUrl || muted) {
      // No audio (backend TTS unavailable, or user muted) — skip the
      // playback step. onDone fires synchronously.
      onDone()
      return
    }

    const audio = new Audio(last.audioUrl)
    audioElRef.current = audio
    audio.onended = onDone
    audio.onerror = onDone
    audio.play().catch(() => {
      // Autoplay blocked — expose a manual Listen button. onDone fires
      // once the user taps Listen and audio plays through.
      setAutoplayBlocked(true)
    })

    return () => {
      audio.onended = null
      audio.onerror = null
      audio.pause()
      if (audioElRef.current === audio) audioElRef.current = null
    }
    // bubbles ref triggers this; muted too (so toggling mute mid-session
    // is respected on the NEXT examiner turn, not the current one — that's
    // intentional, don't cut someone off mid-sentence).
  }, [phase, bubbles, muted, finalize])

  const handleListenTap = useCallback(() => {
    const a = audioElRef.current
    if (a) {
      a.play().then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true))
    } else {
      // Audio element gone (shouldn't happen) — advance anyway.
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
      // Error happened before /start succeeded — retry from briefing.
      setPhase('briefing')
      return
    }
    // F-062.3: if the failed action was /supersede (review sheet visible
    // before failure, pending turn number still set), retry it. The user
    // can bail out via "Keep this take" in the error overlay.
    if (pendingCandidateTurnNumber != null) {
      void handleReRecord()
      return
    }
    if (userTurnCount >= TARGET_USER_TURNS) {
      // Hit the finalize step and failed — retry finalize.
      void finalize()
    } else {
      // Mid-conversation error — let the user re-record the last turn.
      setPhase('user-idle')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          title={brief.title}
          counterpartLabel={brief.counterpartLabel}
          register={brief.register}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
          onExit={() => {
            if (confirm('End this session?')) {
              recorder.reset()
              router.push('/speaking/tache-2')
            }
          }}
          turnDisplay={phase === 'briefing' ? null : turnDisplay}
        />

        {phase === 'briefing' ? (
          <BriefingPanel
            brief={brief}
            onStart={startConversation}
          />
        ) : (
          <>
            <BriefChip
              brief={brief}
              expanded={briefExpanded}
              onToggle={() => setBriefExpanded((v) => !v)}
            />

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
                  senderLabel={b.side === 'examiner' ? brief.counterpartLabel : 'Vous'}
                  text={b.text}
                  showAudio={b.side === 'examiner' && !!b.audioUrl}
                  bubbleColor={brief.bg}
                />
              ))}

              {autoplayBlocked && phase === 'examiner-speaking' && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <button
                    onClick={handleListenTap}
                    style={ghostButtonStyle}
                    aria-label="Play examiner audio"
                  >
                    Tap to hear the reply
                  </button>
                </div>
              )}
            </div>

            <BottomBar
              phase={phase}
              recordButtonState={recordButtonState}
              recorderStream={recorder.stream}
              secondsLeftInTurn={secondsLeftInTurn}
              idleColor={brief.bg}
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
          bg={brief.bg}
        />
      )}

      {phase === 'supersede-in-flight' && <SupersedeInFlightOverlay />}

      {showFinalizingOverlay && <FinalizingOverlay />}

      {showErrorOverlay && (
        <ErrorOverlay
          message={error ?? 'Something went wrong.'}
          onRetry={retryFromError}
          // F-062.3: if the failed action was /supersede, offer "Keep this
          // take" as an escape so the user doesn't get stuck in a retry
          // loop against a broken endpoint. Detected by the presence of a
          // pending candidate turn (only set between upload and commit).
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
  title,
  counterpartLabel,
  register,
  muted,
  onToggleMute,
  onExit,
  turnDisplay,
}: {
  title: string
  counterpartLabel: string
  register: string
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
            T&acirc;che 2 &middot; Role-play
          </p>
          <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 17, color: INK, margin: 0 }}>
            {title}
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
      <p style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 12, color: INK_MUTED, textAlign: 'center', margin: 0 }}>
        You&apos;re talking to: {counterpartLabel} &middot; Register: {register}
        {turnDisplay ? <> &middot; {turnDisplay}</> : null}
      </p>
    </header>
  )
}

function BriefingPanel({ brief, onStart }: { brief: ScenarioBrief; onStart: () => void }) {
  return (
    <div
      style={{
        margin: '12px 20px 0',
        backgroundColor: brief.bg,
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 18px' }}>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: INK_MUTED,
            margin: '0 0 6px',
          }}
        >
          Your role
        </p>
        <p style={{ fontWeight: 500, fontSize: 14, lineHeight: '21px', color: INK, margin: '0 0 12px' }}>
          {brief.roleBody}
        </p>
        {brief.infoTargets.length > 0 && (
          <>
            <p
              style={{
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: INK_MUTED,
                margin: '0 0 6px',
              }}
            >
              Info to gather:
            </p>
            <ul style={{ margin: '0 0 16px', paddingLeft: 18 }}>
              {brief.infoTargets.map((t) => (
                <li key={t} style={{ fontWeight: 500, fontSize: 13, lineHeight: '21px', color: INK_SOFT }}>{t}</li>
              ))}
            </ul>
          </>
        )}
        <button
          onClick={onStart}
          style={{
            width: '100%',
            height: 48,
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
          Start conversation
        </button>
      </div>
    </div>
  )
}

function BriefChip({
  brief,
  expanded,
  onToggle,
}: {
  brief: ScenarioBrief
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div style={{ margin: '8px 20px 0', flexShrink: 0 }}>
      <button
        onClick={onToggle}
        style={{
          background: brief.bg,
          border: 'none',
          borderRadius: 100,
          padding: '6px 14px',
          fontFamily: DISPLAY_FONT,
          fontWeight: 600,
          fontSize: 12,
          color: INK_SOFT,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        View your role
        {expanded ? <ChevronUp size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />}
      </button>
      {expanded && (
        <div
          style={{
            marginTop: 8,
            padding: '12px 14px',
            backgroundColor: brief.bg,
            borderRadius: 14,
          }}
        >
          <p style={{ fontWeight: 500, fontSize: 13, lineHeight: '19px', color: INK, margin: 0 }}>
            {brief.roleBody}
          </p>
        </div>
      )}
    </div>
  )
}

function BottomBar({
  phase,
  recordButtonState,
  recorderStream,
  secondsLeftInTurn,
  idleColor,
  onPTTStart,
  onPTTEnd,
}: {
  phase: Phase
  recordButtonState: RecordingState
  recorderStream: MediaStream | null
  secondsLeftInTurn: number
  idleColor: string
  onPTTStart: () => void
  onPTTEnd: () => void
}) {
  const reduceMotion = useReducedMotion()
  const helper =
    phase === 'user-idle' ? 'Hold to talk' :
    phase === 'user-recording' ? 'Recording… release to stop' :
    phase === 'user-transcribing' ? 'Transcribing…' :
    phase === 'reviewing' ? 'Reviewing your turn…' :
    phase === 'examiner-speaking' ? 'Listen to the reply…' :
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
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #1A1A1A14',
        padding: '20px 24px calc(20px + var(--fp-safe-bottom)) 24px',
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
          idleColor={idleColor}
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
  bg,
}: {
  transcript: string
  onConfirm: () => void
  /** F-062.3: "Refaire cette prise" — discard this take, supersede the
   *  backend turn, reset to user-idle so the user can hold PTT again. */
  onReRecord: () => void
  suppressed: boolean
  onToggleSuppress: (v: boolean) => void
  bg: string
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
          backgroundColor: 'var(--fp-canvas)',
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
              backgroundColor: bg,
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
            Full Pyramide / Rebond / Ciblage breakdown appears on your diagnostic after all {TARGET_USER_TURNS} turns.
          </p>
          <div style={{ height: 20 }} />
        </div>
        <div
          style={{
            padding: '16px 20px calc(32px + var(--fp-safe-bottom)) 20px',
            borderTop: '1px solid #1A1A1A0A',
            backgroundColor: 'var(--fp-canvas)',
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
          {/* F-062.3: Refaire cette prise. Ghost/outline styling so it
              reads as the safer, less-destructive secondary — users should
              feel Confirmer is the default "happy path". */}
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
        Analyzing your conversation…
      </p>
      <p style={{ fontWeight: 500, fontSize: 13, color: INK_MUTED, margin: 0, textAlign: 'center', maxWidth: 300 }}>
        Running the 4-couche analysis across all {TARGET_USER_TURNS} of your turns.
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// F-062.3: brief overlay while /supersede is in flight. Intentionally
// shorter copy than FinalizingOverlay — this is a <1s interaction and
// should not feel heavy.
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
  /** F-062.3: optional escape hatch. Currently used by the supersede-error
   *  path to offer "Keep this take" so the user isn't stranded if
   *  /supersede is broken. */
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
