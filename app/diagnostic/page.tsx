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
import { useInterfaceLanguage, type InterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import { dimensionLabel, sidebarLabel } from '@/lib/rubric/dimensionLabels'
import type {
  Couche,
  DetectedModulesResponse,
  Diagnostic,
  Lesson,
  RemediationModule,
  TacheRubric,
  TacheRubricDimension,
} from '@/lib/types'

// ─── design tokens ────────────────────────────────────────────────────────────
// F-205 — page chrome migrated to editorial system. Couches/modules
// section components keep their FluentPath palette as data-display
// accent layer per F-200 rule. Full editorial migration of the dense
// diagnostic surface tracked as F-205.deep.
const INK          = 'var(--ed-fg)'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const SAGE         = '#D4E4D0'
const BUTTER       = '#FFF0C2'
const PEACH        = '#FFD8C2'
const BG           = 'var(--ed-bg)'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

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
//
// F-088 — `name` reads from the F-088 backend display labels. EN/FR
// are identical today (TCF criteria use the same French words across
// language tracks); the parameter is here for forward compatibility
// with a possible market-specific divergence.
function couchesToRows(
  couches: Couche[],
  lang: InterfaceLanguage,
): { name: string; score: number; cefr: string }[] {
  return couches
    .map((c) => {
      const pct = toPercent(c.score)
      const name = lang === 'fr' ? c.displayLabelFr : c.displayLabelEn
      return { name, score: pct, cefr: cefrBand(pct) }
    })
    .sort((a, b) => a.score - b.score)
}

// F-088 — section header copy keyed by interface language. Replaces
// "LA MÉTHODE EN COUCHES" / "Your CEFR-tracking baseline" pair.
// P-220 narrowed InterfaceLanguage to en/fr; the prior 'es' entry
// was removed alongside the legacy LanguageSelect onboarding step.
const TCF_SECTION_COPY: Record<InterfaceLanguage, { eyebrow: string; heading: string }> = {
  en: { eyebrow: 'TCF Evaluation',     heading: 'Your CEFR-tracking baseline' },
  fr: { eyebrow: 'Évaluation TCF',     heading: 'Your CEFR-tracking baseline' },
}

// F-084 — pick top 3 rubric dimensions: 1 strength + 2 weaknesses.
// Tie-break is deterministic — preserve the rubric's canonical order
// (the index in the dimensions array, which matches the prompt's
// emit order).
//
// Strength = highest score; if multiple dimensions tie at the top,
// pick the one earliest in the canonical order.
// Weaknesses = the two lowest scores from the REMAINING dimensions
// (after the strength is removed). Same tie-break rule.
//
// Returns { top3, remaining } so Layer 3 can render the visible 3 and
// Layer 5 can render whatever didn't fit (T1+T2: 2 remaining; T3: 3).
function pickTop3Dimensions(dims: TacheRubricDimension[]): {
  top3: TacheRubricDimension[]
  remaining: TacheRubricDimension[]
} {
  if (dims.length === 0) return { top3: [], remaining: [] }
  const indexed = dims.map((d, i) => ({ d, i }))
  // Strength: highest score, then lowest index for tie-break.
  const strength = [...indexed].sort((a, b) => {
    if (b.d.score !== a.d.score) return b.d.score - a.d.score
    return a.i - b.i
  })[0]
  const remainingAfterStrength = indexed.filter((x) => x.i !== strength.i)
  // Weaknesses: lowest score, then lowest index for tie-break.
  const weakSorted = [...remainingAfterStrength].sort((a, b) => {
    if (a.d.score !== b.d.score) return a.d.score - b.d.score
    return a.i - b.i
  })
  const weaknesses = weakSorted.slice(0, 2)
  const visibleIndices = new Set([strength.i, ...weaknesses.map((w) => w.i)])
  // Restore canonical order in the visible row so the page reads in a
  // stable order regardless of which 3 dims got picked.
  const top3 = indexed
    .filter((x) => visibleIndices.has(x.i))
    .map((x) => x.d)
  const remaining = indexed
    .filter((x) => !visibleIndices.has(x.i))
    .map((x) => x.d)
  return { top3, remaining }
}

// F-084 — semantic color tinting for the score badge. Subtle, no
// alarm bells; mid scores stay neutral. 0-1 = warning tint, 2-3 =
// neutral, 4-5 = success tint.
function dimensionScoreTint(score: number): { bg: string; fg: string } {
  if (score <= 1) return { bg: '#F5D6D6', fg: '#8A2A2A' } // soft blush
  if (score >= 4) return { bg: '#D4E4D0', fg: '#2D5A38' } // soft sage
  return { bg: '#1A1A1A0F', fg: '#1A1A1A' }                // neutral
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
  const lang = useInterfaceLanguage()
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

  // F-084 — Section 5 (mocked WPM/pron%) removed; sessionOpen state
  // dropped alongside it. See F-084.x in BACKLOG for restoring real
  // session details once the underlying data lands.
  const [transcriptTab, setTranscriptTab] = useState<'resume' | 'complet'>('resume')
  // F-084 — progressive disclosure for Layer 5. Local state only; no
  // persistence, no URL param. Page reload resets to collapsed (gate 7).
  const [breakdownOpen, setBreakdownOpen] = useState(false)

  // F-080d: state for the LearnModuleSheet picker (linked-module path
  // from the "Learn this" button). Orphan modules tap straight through
  // to /learn/[id]; the sheet only opens when ecole_lesson_id is
  // non-null.
  const [pickerModule, setPickerModule] = useState<RemediationModule | null>(null)
  const [lessonsCache, setLessonsCache] = useState<Lesson[] | null>(null)

  const handleLearnTap = useCallback(
    (m: RemediationModule) => {
      if (m.ecole_lesson_id != null) {
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

  const pickerLesson =
    pickerModule != null && pickerModule.ecole_lesson_id != null && lessonsCache
      ? lessonsCache.find((l) => l.lessonNumber === pickerModule.ecole_lesson_id)
      : undefined
  const pickerLessonTitle = pickerLesson?.title
  const pickerLessonSubline = pickerLesson?.sublineEn ?? undefined

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

  // P-100.5 — no more silent `?? 'B2'` fallback. When realMode and
  // backend hasn't computed a CEFR level, render a muted placeholder
  // rather than masquerade a hardcoded value as data. Mock mode keeps
  // the canonical 'C1' for design-review.
  const tcfBand: string | null = realMode ? (diagnostic.cefrLevel ?? null) : 'C1'
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
  const coucheRows = realMode ? couchesToRows(diagnostic.couches, lang) : undefined
  const tcfCopy = TCF_SECTION_COPY[lang] ?? TCF_SECTION_COPY.en

  // F-084 — pedagogical-rubric data and progressive-disclosure derivations.
  const tacheRubric: TacheRubric | null = realMode ? diagnostic.tacheRubric : null
  const rubricDims = tacheRubric?.dimensions ?? []
  const { top3: top3Dimensions, remaining: remainingDimensions } =
    pickTop3Dimensions(rubricDims)
  const retryRec = tacheRubric?.retryRecommendation
  const showRetryCallout = !!retryRec?.shouldRetry
  // Hero narrative — single sentence above the score. Falls back to a
  // CEFR-band heading for legacy recordings (gate 4).
  const tacheNumber = tacheRubric?.tacheMode === 'tache_1' ? 1
    : tacheRubric?.tacheMode === 'tache_2' ? 2
    : tacheRubric?.tacheMode === 'tache_3' ? 3
    : null
  // P-100.5 — when both narrativeSummary and tcfBand are absent, surface
  // an honest "Analysis pending" rather than rendering "null on Tâche 1".
  const narrativeFallback = tcfBand
    ? (tacheNumber != null ? `${tcfBand} on Tâche ${tacheNumber}` : tcfBand)
    : 'Analysis pending — your CEFR band will appear once the backend finishes scoring.'
  const narrativeText = realMode ? (diagnostic.narrativeSummary ?? narrativeFallback) : narrativeFallback

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
          // F-205 — column widened 440 → 720, fixes desktop white-rails
          maxWidth: 720,
          margin: '0 auto',
          paddingBottom: 'calc(120px + var(--fp-safe-bottom))',
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
          {/* ══ LAYER 1 — F-084 NARRATIVE HERO ══════════════════════════════
                Single deadpan sentence above the score. Falls back to
                "{cefr_band} on Tâche {n}" for legacy recordings where
                narrative_summary is null. NOT a heading element — it's
                content, not a section header. ══════════════════════════ */}
          <p
            style={{
              margin: '0 4px 4px',
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 18,
              lineHeight: 1.45,
              color: INK,
            }}
          >
            {narrativeText}
          </p>

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
                  // P-100.5 — muted color when band is pending (null from
                  // backend) so users can distinguish "we don't know yet"
                  // from a real CEFR value.
                  color: tcfBand ? INK : INK_MUTED,
                }}
                aria-label={tcfBand ?? 'CEFR band pending'}
              >
                {tcfBand ?? '—'}
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

          {/* ══ SECTION 2 — TCF Evaluation (F-088 relabel of "La Méthode en
                Couches"; backend dimensions / scoring unchanged, label layer
                only) ════════════════════════════════════════════════════ */}
          <SectionCard bg={SAGE}>
            <SectionLabel>{tcfCopy.eyebrow}</SectionLabel>
            <SectionHeading>{tcfCopy.heading}</SectionHeading>

            <CouchesDiagnostic rows={coucheRows} />
          </SectionCard>

          {/* ══ LAYER 3 — TOP 3 RUBRIC DIMENSIONS (F-084) ════════════════════
                1 strength + 2 weaknesses; deterministic tie-break by
                canonical rubric order. Skipped entirely when the
                rubric is null (legacy recording) or has no dimensions. */}
          {top3Dimensions.length > 0 && (
            <SectionCard bg="white">
              {top3Dimensions.map((dim) => {
                const tint = dimensionScoreTint(dim.score)
                return (
                  <div
                    key={dim.key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      paddingBottom: 12,
                      borderBottom: '1px solid #1A1A1A0A',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          fontFamily: DISPLAY_FONT,
                          fontWeight: 700,
                          fontSize: 14,
                          color: INK,
                          marginBottom: 2,
                        }}
                      >
                        {dimensionLabel(dim.key)}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontFamily: DISPLAY_FONT,
                          fontWeight: 500,
                          fontSize: 13,
                          lineHeight: 1.45,
                          color: INK_SOFT,
                        }}
                      >
                        {(dim.prose ?? '').length > 120
                          ? `${dim.prose.slice(0, 117).trim()}…`
                          : dim.prose}
                      </p>
                    </div>
                    <span
                      style={{
                        flexShrink: 0,
                        fontFamily: DISPLAY_FONT,
                        fontWeight: 700,
                        fontSize: 13,
                        backgroundColor: tint.bg,
                        color: tint.fg,
                        padding: '4px 10px',
                        borderRadius: 999,
                      }}
                      aria-label={`Score: ${dim.score} out of 5`}
                    >
                      {dim.score}/5
                    </span>
                  </div>
                )
              })}
            </SectionCard>
          )}

          {/* ══ LAYER 4 — RETRY CALLOUT (F-084, conditional) ═════════════════
                Renders only when the rubric's deterministic-or-LLM
                threshold check decided a retry is worth doing. */}
          {showRetryCallout && retryRec && (
            <SectionCard bg={PEACH}>
              <SectionLabel>Worth another try</SectionLabel>
              <p
                style={{
                  margin: 0,
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: INK,
                }}
              >
                {retryRec.reason}
              </p>
              {tacheNumber != null && (
                <Link
                  href={`/speaking/tache-${tacheNumber}`}
                  style={{
                    alignSelf: 'flex-start',
                    fontFamily: DISPLAY_FONT,
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#FFFFFF',
                    backgroundColor: INK,
                    padding: '10px 18px',
                    borderRadius: 12,
                    textDecoration: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  Record again
                </Link>
              )}
            </SectionCard>
          )}

          {/* ══ LAYER 5 — "See full breakdown" disclosure (F-084) ═════════════
                Single button at the bottom. Click expands inline (no
                modal). Contains: remaining dimensions, universal
                sidebars, full retry reasoning, plus the existing
                detected-modules + L'Ordonnance + corrected-transcript
                sections (moved from their previous always-visible
                positions). Section 5 (mocked WPM/pron%) intentionally
                removed — see F-084.x. ════════════════════════════════ */}
          <SectionCard bg="white" style={{ gap: 0, padding: 0, overflow: 'hidden' }}>
            <button
              onClick={() => setBreakdownOpen((v) => !v)}
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
              aria-expanded={breakdownOpen}
            >
              <span
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 15,
                  color: INK,
                }}
              >
                See full breakdown
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                style={{
                  transform: breakdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
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
          </SectionCard>

          {breakdownOpen && (
            <>
              {/* Remaining rubric dimensions (those not shown in Layer 3). */}
              {remainingDimensions.length > 0 && (
                <SectionCard bg="white">
                  <SectionLabel>Other dimensions</SectionLabel>
                  {remainingDimensions.map((dim) => {
                    const tint = dimensionScoreTint(dim.score)
                    return (
                      <div
                        key={dim.key}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 12,
                          paddingBottom: 12,
                          borderBottom: '1px solid #1A1A1A0A',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontFamily: DISPLAY_FONT,
                              fontWeight: 700,
                              fontSize: 14,
                              color: INK,
                              marginBottom: 2,
                            }}
                          >
                            {dimensionLabel(dim.key)}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontFamily: DISPLAY_FONT,
                              fontWeight: 500,
                              fontSize: 13,
                              lineHeight: 1.45,
                              color: INK_SOFT,
                            }}
                          >
                            {dim.prose}
                          </p>
                        </div>
                        <span
                          style={{
                            flexShrink: 0,
                            fontFamily: DISPLAY_FONT,
                            fontWeight: 700,
                            fontSize: 13,
                            backgroundColor: tint.bg,
                            color: tint.fg,
                            padding: '4px 10px',
                            borderRadius: 999,
                          }}
                        >
                          {dim.score}/5
                        </span>
                      </div>
                    )
                  })}
                </SectionCard>
              )}

              {/* Universal sidebars: conjugation / grammar_structure /
                  sentence_construction. Reads from rubric.universalSidebars. */}
              {tacheRubric && (
                <SectionCard bg="white">
                  <SectionLabel>Technical KPIs</SectionLabel>
                  {(['conjugation', 'grammar_structure', 'sentence_construction'] as const).map((sbKey) => {
                    const sb = tacheRubric.universalSidebars[sbKey]
                    const tint = dimensionScoreTint(sb.score)
                    return (
                      <div
                        key={sbKey}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          paddingBottom: 12,
                          borderBottom: '1px solid #1A1A1A0A',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <span
                            style={{
                              fontFamily: DISPLAY_FONT,
                              fontWeight: 700,
                              fontSize: 14,
                              color: INK,
                            }}
                          >
                            {sidebarLabel(sbKey)}
                          </span>
                          <span
                            style={{
                              flexShrink: 0,
                              fontFamily: DISPLAY_FONT,
                              fontWeight: 700,
                              fontSize: 13,
                              backgroundColor: tint.bg,
                              color: tint.fg,
                              padding: '4px 10px',
                              borderRadius: 999,
                            }}
                          >
                            {sb.score}/5
                          </span>
                        </div>
                        {sb.examples.length > 0 && (
                          <ul
                            style={{
                              margin: '4px 0 0',
                              paddingLeft: 18,
                              fontFamily: DISPLAY_FONT,
                              fontWeight: 500,
                              fontSize: 13,
                              lineHeight: 1.45,
                              color: INK_SOFT,
                            }}
                          >
                            {sb.examples.map((ex, i) => (
                              <li key={i} style={{ marginBottom: 2 }}>{ex}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                </SectionCard>
              )}

              {/* Full retry reasoning (always shown inside the disclosure
                  even when Layer 4 already surfaced the reason). */}
              {retryRec && retryRec.reason && (
                <SectionCard bg="white">
                  <SectionLabel>Retry reasoning</SectionLabel>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: DISPLAY_FONT,
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: INK,
                    }}
                  >
                    {retryRec.shouldRetry
                      ? retryRec.reason
                      : `No retry recommended. ${tacheRubric?.nextActionSuggestion ?? ''}`.trim()}
                  </p>
                </SectionCard>
              )}

              {/* ── SECTION 3 (moved into disclosure) — DETECTED REFLEXES ── */}
              <DetectedReflexesSection
                primaryModule={primaryModule}
                primaryDetection={primaryDetection}
                secondaryModules={secondaryModules}
                detections={detections}
                onLearnTap={handleLearnTap}
              />

              {/* ── SECTION 4 (moved into disclosure) — L'ORDONNANCE ────── */}
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

              {/* ── SECTION 6 (moved into disclosure) — CORRECTED TRANSCRIPTION ── */}
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
            </>
          )}

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
              href="/ecole"
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
              Back to L'École
            </Link>
          </div>
        </div>
      </div>

      {pickerModule && (
        <LearnModuleSheet
          module={pickerModule}
          lessonTitle={pickerLessonTitle}
          lessonSubline={pickerLessonSubline}
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
