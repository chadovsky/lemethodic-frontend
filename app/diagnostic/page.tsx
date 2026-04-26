'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import CouchesDiagnostic from '@/components/diagnostic/CouchesDiagnostic'
// F-080c: GouletCard removed from the page render; component file kept
// (cleanup follow-up filed as F-080c.x). Replaced by DetectedModuleCard +
// SecondaryModulesList + EmptyDetectionFallback in the new DETECTED
// REFLEXES section. L'ORDONNANCE is repurposed to render the primary
// module's content_refs when present.
import DetectedModuleCard from '@/components/diagnostic/DetectedModuleCard'
import SecondaryModulesList from '@/components/diagnostic/SecondaryModulesList'
import EmptyDetectionFallback from '@/components/diagnostic/EmptyDetectionFallback'
import InlineContentRef from '@/components/diagnostic/InlineContentRef'
import CorrectedLine, { Correction } from '@/components/diagnostic/CorrectedLine'
import LearnModuleSheet from '@/components/modules/LearnModuleSheet'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { api, ApiError } from '@/lib/api'
import type {
  Couche,
  DetectedModulesResponse,
  Diagnostic,
  Lesson,
  RemediationModule,
} from '@/lib/types'

// ─── design tokens ────────────────────────────────────────────────────────────
const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const SAGE         = '#D4E4D0'
const BUTTER       = '#FFF0C2'
const PEACH        = '#FFD8C2'
const BG           = '#FAFAF7'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

// ─── mock transcript (shown when no ?session= param — for design-review) ─────
type Segment = { text?: string; correction?: Correction }

const MOCK_LINES: { segments: Segment[]; coachingNote: string }[] = [
  {
    segments: [
      { text: 'Bonjour, je voudrais partir ' },
      { correction: { wrong: 'en', right: 'dans' } },
      { text: ' un pays francophone.' },
    ],
    coachingNote:
      '"En" is used for countries and regions; "dans" is correct for the general concept of a place.',
  },
  {
    segments: [
      { text: 'Oui, je ' },
      { correction: { wrong: 'pensais', right: 'comptais' } },
      { text: ' partir en juillet ou août.' },
    ],
    coachingNote:
      '"Compter + infinitif" is the natural French register for planned intention; "penser" reads as a direct English calque.',
  },
  {
    segments: [
      { text: 'Et combien ça ' },
      { correction: { wrong: 'coûterait', right: 'coûte' } },
      { text: ' pour deux semaines à Montréal ?' },
    ],
    coachingNote:
      'In a live inquiry the present tense is preferred; the conditional shifts register to polite hypothetical which is unnecessary here.',
  },
]

// ─── helpers ─────────────────────────────────────────────────────────────────
function cefrBand(score0to100: number): string {
  if (score0to100 <= 20) return 'A1'
  if (score0to100 <= 35) return 'A2'
  if (score0to100 <= 55) return 'B1'
  if (score0to100 <= 75) return 'B2'
  if (score0to100 <= 90) return 'C1'
  return 'C2'
}

// Backend scores for each couche come in at whatever scale analysis.py
// happens to emit today — the Diagnostic type notes "0-10 typically" but
// the UI bars treat scores as percentages. Rescale defensively: anything
// ≤10 is assumed 0-10 and scaled; anything larger is passed through.
function toPercent(rawScore: number): number {
  if (!Number.isFinite(rawScore)) return 0
  if (rawScore <= 10) return Math.round(rawScore * 10)
  return Math.round(rawScore)
}

// Map the shaped Diagnostic into the CoucheRow shape CouchesDiagnostic expects.
// Sorted worst-first so the bottleneck is at the top of the chart.
function couchesToRows(couches: Couche[]): { name: string; score: number; cefr: string }[] {
  return couches
    .map((c) => {
      const pct = toPercent(c.score)
      return { name: c.label, score: pct, cefr: cefrBand(pct) }
    })
    .sort((a, b) => a.score - b.score)
}

// ─── sub-components ──────────────────────────────────────────────────────────

function SectionCard({
  children,
  bg = 'white',
  style = {},
}: {
  children: React.ReactNode
  bg?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        backgroundColor: bg,
        borderRadius: 24,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: DISPLAY_FONT,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        color: INK_MUTED,
      }}
    >
      {children}
    </p>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        margin: 0,
        fontFamily: DISPLAY_FONT,
        fontWeight: 800,
        fontSize: 20,
        color: INK,
        lineHeight: 1.25,
      }}
    >
      {children}
    </h2>
  )
}

// F-080c — DETECTED REFLEXES section. Composes the primary module
// card, the collapsed secondary list, and the empty fallback. Kept
// inline to mirror the existing section helpers (SectionCard /
// SectionLabel / SectionHeading) — no separate file needed.
function DetectedReflexesSection({
  primaryModule,
  primaryDetection,
  secondaryModules,
  detections,
  onLearnTap,
}: {
  primaryModule: DetectedModulesResponse['primary_module']
  primaryDetection: DetectedModulesResponse['detections'][number] | null
  secondaryModules: DetectedModulesResponse['secondary_modules']
  detections: DetectedModulesResponse['detections']
  onLearnTap?: (m: RemediationModule) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionLabel>Detected reflexes</SectionLabel>
      {primaryModule ? (
        <DetectedModuleCard
          module={primaryModule}
          detection={primaryDetection}
          onLearnTap={onLearnTap}
        />
      ) : (
        <EmptyDetectionFallback />
      )}
      {secondaryModules.length > 0 ? (
        <SecondaryModulesList modules={secondaryModules} detections={detections} />
      ) : null}
    </div>
  )
}

function LoaderScreen() {
  return (
    <div
      style={{ minHeight: '100dvh', backgroundColor: PEACH }}
      aria-label="Loading diagnostic"
    />
  )
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: BG,
        fontFamily: DISPLAY_FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        gap: 16,
      }}
      role="alert"
    >
      <p style={{ fontWeight: 700, fontSize: 18, color: INK, margin: 0, textAlign: 'center' }}>
        Couldn&rsquo;t load your diagnostic.
      </p>
      <p style={{ fontWeight: 500, fontSize: 14, color: INK_MUTED, margin: 0, textAlign: 'center' }}>
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 15,
          color: '#FFFFFF',
          backgroundColor: INK,
          border: 'none',
          borderRadius: 14,
          padding: '10px 22px',
          cursor: 'pointer',
          marginTop: 4,
        }}
      >
        Try again
      </button>
    </div>
  )
}

// ─── inner content ───────────────────────────────────────────────────────────

function DiagnosticInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionParam = searchParams.get('session')
  const sessionId = sessionParam != null ? Number.parseInt(sessionParam, 10) : null
  const hasSession = sessionId != null && Number.isFinite(sessionId)

  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)
  // F-080c: detected-modules response. null = not yet fetched (initial /
  // retry); empty-shape object = backend confirmed no detections (renders
  // EmptyDetectionFallback). Failure to fetch this is non-fatal — the
  // diagnostic page degrades to the empty fallback rather than blocking
  // the whole render on a secondary endpoint.
  const [modulesResp, setModulesResp] = useState<DetectedModulesResponse | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(hasSession)
  const [retryKey, setRetryKey] = useState(0)

  const [sessionOpen, setSessionOpen] = useState(false)
  const [transcriptTab, setTranscriptTab] = useState<'resume' | 'complet'>('resume')

  // F-080d: state for the LearnModuleSheet picker (linked-module path
  // from the "Learn this" button). Orphan modules tap straight through
  // to /learn/[id]; the sheet only opens when raccourci_lesson_id is
  // non-null.
  const [pickerModule, setPickerModule] = useState<RemediationModule | null>(null)
  const [lessonsCache, setLessonsCache] = useState<Lesson[] | null>(null)

  const handleLearnTap = useCallback(
    (m: RemediationModule) => {
      if (m.raccourci_lesson_id != null) {
        setPickerModule(m)
        // Lazy-fetch lessons once so the sheet's primary CTA shows the
        // real lesson title rather than the bare lesson number.
        if (lessonsCache == null) {
          api.lessons
            .list()
            .then(setLessonsCache)
            .catch(() => {
              /* sheet falls back to "Lesson N" when title is missing */
            })
        }
      } else {
        router.push(`/learn/${m.id}`)
      }
    },
    [lessonsCache, router],
  )

  const pickerLessonTitle =
    pickerModule != null && pickerModule.raccourci_lesson_id != null && lessonsCache
      ? lessonsCache.find((l) => l.lessonNumber === pickerModule.raccourci_lesson_id)?.title
      : undefined

  const fetchDiagnostic = useCallback(async () => {
    if (!hasSession || sessionId == null) return
    setIsLoading(true)
    setLoadError(null)
    try {
      // F-080c: parallel fetches. The diagnostic call is the load-blocker
      // (its failure renders the error screen); the modules call is
      // non-blocking — its failure logs and falls back to the empty
      // detection state, which is also a valid product state.
      const [diagResult, modulesResult] = await Promise.all([
        api.sessions.getDiagnostic(sessionId),
        api.sessions.getDetectedModules(sessionId).catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('F-080c: getDetectedModules failed; rendering empty fallback.', err)
          return {
            primary_module: null,
            secondary_modules: [],
            detections: [],
          } as DetectedModulesResponse
        }),
      ])
      setDiagnostic(diagResult)
      setModulesResp(modulesResult)
    } catch (err) {
      if (err instanceof ApiError) {
        setLoadError(err.message || "The server couldn't find that recording.")
      } else {
        setLoadError("We couldn't reach the server. Check your connection.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [hasSession, sessionId])

  useEffect(() => {
    void fetchDiagnostic()
  }, [fetchDiagnostic, retryKey])

  // ── loading / error gates when a session is requested ─────────────────────
  if (hasSession && isLoading && !diagnostic) {
    return <LoaderScreen />
  }
  if (hasSession && loadError && !diagnostic) {
    return (
      <ErrorScreen
        message={loadError}
        onRetry={() => setRetryKey((k) => k + 1)}
      />
    )
  }

  // ── compute display values — real when diagnostic present, mock otherwise ─
  //
  // The existing layout is the source of truth for the mock values; the fields
  // the Diagnostic shape doesn't (yet) provide (TCF 0-699 score, WPM, flagged
  // counts, corrected lines) stay on the mocks with a TODO so the design
  // review path still works at /diagnostic with no query param.
  const realMode = diagnostic != null

  const tcfBand = realMode ? diagnostic.cefrLevel ?? 'B2' : 'C1'
  // TODO(Phase 4): derive the /699 TCF score from backend once a CEFR→TCF
  // table exists server-side. For now we surface noteGlobale (/20) as the
  // numeric anchor in real mode; mock mode shows the canonical 428/699.
  const tcfScoreLabel = realMode
    ? `${Math.round((diagnostic.noteGlobale ?? 0))}/20`
    : '428 / 699'
  const tcfTargetLine = realMode
    ? diagnostic.ceQuiMarche ?? 'Diagnostic ready.'
    : 'Within target band for TCF Canada (CLB 9+)'

  // Couches radar rows
  const coucheRows = realMode ? couchesToRows(diagnostic.couches) : undefined

  // F-080c: detected modules + ordonnance source. The Diagnostic.goulet
  // and Diagnostic.ordonnance fields from the legacy /diagnostic block
  // are no longer surfaced — Le Goulet was removed from visible UI in
  // F-080c, and the mock "ordonnance exercises" are replaced by the
  // primary module's content_refs (when present). The design-review
  // path (no `?session=`) lands on the empty fallback, same as a real
  // session that detected nothing — keeps mock surface area small.
  const primaryModule = modulesResp?.primary_module ?? null
  const secondaryModules = modulesResp?.secondary_modules ?? []
  const detections = modulesResp?.detections ?? []
  const primaryDetection = detections.find((d) => d.is_primary) ?? null
  // Render L'ORDONNANCE only when the primary module ships at least one
  // content_ref. Module 2 (to_get_reflex) has empty content_refs by
  // design — for those, the in-card examples ARE the teaching surface.
  const ordonnanceRefs = primaryModule
    ? [...primaryModule.content_refs].sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
      )
    : []

  // TCF score bar fill: only meaningful for the mock number; hide in real mode.
  const bandFill = 0.28 // mock 428 within C1 band 400-499 ≈ 28%

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: BG,
        fontFamily: DISPLAY_FONT,
      }}
    >
      <div
        style={{
          maxWidth: 440,
          margin: '0 auto',
          paddingBottom: 120,
        }}
      >
        {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backgroundColor: BG,
            padding: '16px 20px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link
            href="/speaking"
            aria-label="Back to speaking"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#1A1A1A0F',
              textDecoration: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M11 14L6 9L11 4"
                stroke={INK}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                margin: 0,
                fontFamily: DISPLAY_FONT,
                fontWeight: 800,
                fontSize: 17,
                color: INK,
              }}
            >
              Your diagnostic
            </p>
            <p
              style={{
                margin: 0,
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 12,
                color: INK_MUTED,
              }}
            >
              {realMode
                ? `Recording #${diagnostic.recordingId}`
                : 'Tâche 2 · Agence de voyages · 8 min'}
            </p>
          </div>

          <button
            aria-label="Share"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#1A1A1A0F',
              border: 'none',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="13" cy="3"  r="1.75" stroke={INK} strokeWidth="1.5" />
              <circle cx="3"  cy="8"  r="1.75" stroke={INK} strokeWidth="1.5" />
              <circle cx="13" cy="13" r="1.75" stroke={INK} strokeWidth="1.5" />
              <line x1="4.6"  y1="7.1"  x2="11.4" y2="3.9"  stroke={INK} strokeWidth="1.25" />
              <line x1="4.6"  y1="8.9"  x2="11.4" y2="12.1" stroke={INK} strokeWidth="1.25" />
            </svg>
          </button>
        </div>

        <div
          style={{
            padding: '0 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* ══ SECTION 1 — TCF SCORE HERO ══════════════════════════════════ */}
          <SectionCard bg="white">
            <SectionLabel>
              {realMode ? 'Overall band' : 'Estimated TCF Score'}
            </SectionLabel>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 800,
                  fontSize: 56,
                  lineHeight: 1,
                  color: INK,
                }}
              >
                {tcfBand}
              </span>
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 600,
                  fontSize: 18,
                  color: INK_MUTED,
                  paddingBottom: 6,
                }}
              >
                {tcfScoreLabel}
              </span>
            </div>

            <p
              style={{
                margin: 0,
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 13,
                color: INK_SOFT,
              }}
            >
              {tcfTargetLine}
            </p>

            {/* Progress bar — only in mock mode where the /699 anchor is known */}
            {!realMode && (
              <div>
                <div
                  style={{
                    height: 6,
                    backgroundColor: '#1A1A1A12',
                    borderRadius: 100,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${bandFill * 100}%`,
                      backgroundColor: INK,
                      borderRadius: 100,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 4,
                  }}
                >
                  <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 10, color: INK_MUTED }}>
                    C1 band start
                  </span>
                  <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 500, fontSize: 10, color: INK_MUTED }}>
                    C2
                  </span>
                </div>
              </div>
            )}
          </SectionCard>

          {/* ══ SECTION 2 — LA MÉTHODE EN COUCHES (now secondary context) ══ */}
          <SectionCard bg={SAGE}>
            <SectionLabel>La Méthode en Couches</SectionLabel>
            <SectionHeading>Your CEFR-tracking baseline</SectionHeading>

            <CouchesDiagnostic rows={coucheRows} />
          </SectionCard>

          {/* ══ SECTION 3 — DETECTED REFLEXES (F-080c, replaces Le Goulet) ══ */}
          <DetectedReflexesSection
            primaryModule={primaryModule}
            primaryDetection={primaryDetection}
            secondaryModules={secondaryModules}
            detections={detections}
            onLearnTap={handleLearnTap}
          />

          {/* ══ SECTION 4 — L'ORDONNANCE (only when primary has content_refs) */}
          {primaryModule && ordonnanceRefs.length > 0 ? (
            <SectionCard bg={BUTTER}>
              <SectionLabel>{"L'Ordonnance · Learn this"}</SectionLabel>
              <SectionHeading>How to fix this in your next session</SectionHeading>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  padding: '16px 18px',
                }}
              >
                {ordonnanceRefs.map((ref, i) => (
                  <InlineContentRef key={i} ref_={ref} />
                ))}
              </div>
            </SectionCard>
          ) : null}

          {/* ══ SECTION 5 — SESSION DETAILS (still mocked — WPM/pron% aren't
                 in the shared Diagnostic shape yet; follow-up ticket) ═══════ */}
          <SectionCard bg="white" style={{ gap: 0, padding: 0, overflow: 'hidden' }}>
            <button
              onClick={() => setSessionOpen((v) => !v)}
              style={{
                width: '100%',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-expanded={sessionOpen}
            >
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 15,
                  color: INK,
                }}
              >
                Session details
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                style={{
                  transform: sessionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke={INK_MUTED}
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {sessionOpen && (
              <div
                style={{
                  borderTop: '1px solid #1A1A1A0A',
                  padding: '16px 20px 20px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 12,
                }}
              >
                {[
                  { value: '112 WPM',      sub: 'Native: 130–160' },
                  { value: '87%',          sub: 'Pronunciation' },
                  { value: '6 flagged',    sub: 'L1 interference' },
                ].map(({ value, sub }) => (
                  <div
                    key={sub}
                    style={{
                      backgroundColor: BG,
                      borderRadius: 14,
                      padding: '12px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontWeight: 800,
                        fontSize: 17,
                        color: INK,
                      }}
                    >
                      {value}
                    </span>
                    <span
                      style={{
                        fontFamily: DISPLAY_FONT,
                        fontWeight: 500,
                        fontSize: 10,
                        color: INK_MUTED,
                        lineHeight: '14px',
                      }}
                    >
                      {sub}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ══ SECTION 6 — CORRECTED TRANSCRIPTION (still mocked — the
                 Diagnostic shape doesn't carry segment-level corrections;
                 wiring /recordings/{id} transcript/corrections into the
                 CorrectedLine segments shape is its own ticket) ═══════════ */}
          <SectionCard bg="white">
            <div
              style={{
                display: 'flex',
                backgroundColor: BG,
                borderRadius: 100,
                padding: 4,
                gap: 2,
              }}
            >
              {(['resume', 'complet'] as const).map((tab) => {
                const active = transcriptTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setTranscriptTab(tab)}
                    style={{
                      flex: 1,
                      fontFamily: DISPLAY_FONT,
                      fontWeight: active ? 700 : 500,
                      fontSize: 13,
                      color: active ? INK : INK_MUTED,
                      backgroundColor: active ? 'white' : 'transparent',
                      border: 'none',
                      borderRadius: 100,
                      padding: '8px 0',
                      cursor: 'pointer',
                      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.15s',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {tab === 'resume' ? 'Le Résumé' : 'Le Diagnostic complet'}
                  </button>
                )
              })}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: transcriptTab === 'complet' ? 20 : 14,
              }}
            >
              {MOCK_LINES.map((line, i) => (
                <CorrectedLine
                  key={i}
                  segments={line.segments}
                  coachingNote={line.coachingNote}
                  showCoaching={transcriptTab === 'complet'}
                />
              ))}
            </div>
          </SectionCard>

          {/* ══ BOTTOM ACTIONS ══════════════════════════════════════════════ */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: '8px 0 24px',
            }}
          >
            <Link
              href="/speaking"
              style={{
                display: 'block',
                textAlign: 'center',
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 16,
                color: 'white',
                backgroundColor: INK,
                borderRadius: 100,
                padding: '16px 0',
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Practice again
            </Link>

            <Link
              href="/raccourci"
              style={{
                display: 'block',
                textAlign: 'center',
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 15,
                color: INK_SOFT,
                textDecoration: 'none',
                padding: '12px 0',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Back to Le Raccourci
            </Link>
          </div>
        </div>
      </div>

      {pickerModule && (
        <LearnModuleSheet
          module={pickerModule}
          lessonTitle={pickerLessonTitle}
          onClose={() => setPickerModule(null)}
        />
      )}
    </div>
  )
}

// ─── outer wrapper: ProtectedRoute + Suspense (for useSearchParams) ──────────
export default function DiagnosticPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoaderScreen />}>
        <DiagnosticInner />
      </Suspense>
    </ProtectedRoute>
  )
}
