'use client'

// P-100 Section 2 — Sustained position view of the 4 TCF couches.
//
// Reuses CouchesDiagnostic but feeds it the rolling AVERAGE across the
// last N recordings (capped at 5; falls back to all available when the
// user has fewer). Distinct from the diagnostic page's single-session
// snapshot — this surface is "where you sit on average" rather than
// "what just happened in this recording".
//
// CEFR-band + percent helpers replicated from app/diagnostic/page.tsx.
// Two consumers now (diagnostic + this); a third would justify
// extracting into a shared util — for now the duplication is contained
// and F-110.1 doesn't touch this banding logic.

import CouchesDiagnostic from '@/components/diagnostic/CouchesDiagnostic'
import { useInterfaceLanguage, type InterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import type { Couche, CoucheKey, RecordingSummary } from '@/lib/types'

const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

const ROLLING_WINDOW = 5

// Mirror of app/diagnostic/page.tsx::cefrBand. Keep in sync if banding
// thresholds shift — both surfaces need the same mapping for users to
// trust the comparison.
function cefrBand(score0to100: number): string {
  if (score0to100 <= 20) return 'A1'
  if (score0to100 <= 35) return 'A2'
  if (score0to100 <= 55) return 'B1'
  if (score0to100 <= 75) return 'B2'
  if (score0to100 <= 90) return 'C1'
  return 'C2'
}

// Mirror of app/diagnostic/page.tsx::toPercent. Defensive rescale —
// backend couche scores have historically come in on a 0-10 scale or
// already 0-100; the heuristic catches both without a backend contract
// change.
function toPercent(rawScore: number): number {
  if (!Number.isFinite(rawScore)) return 0
  if (rawScore <= 10) return Math.round(rawScore * 10)
  return Math.round(rawScore)
}

interface AggregatedCouche {
  key: CoucheKey
  displayLabelEn: string
  displayLabelFr: string
  averageScore: number  // raw scale (matches incoming Couche.score)
}

// Aggregate a couche key's score across the rolling window, taking
// labels from the most recent occurrence (labels are backend-emitted
// constants per F-088 so they should be stable across recordings, but
// the most-recent-wins rule guards against silent label drift).
function aggregateCouches(recordings: RecordingSummary[]): AggregatedCouche[] {
  const window = recordings.slice(0, ROLLING_WINDOW)
  if (window.length === 0) return []

  const buckets = new Map<CoucheKey, { sum: number; count: number; meta: Couche }>()
  for (const rec of window) {
    for (const c of rec.couches) {
      const existing = buckets.get(c.key)
      if (existing) {
        existing.sum += c.score
        existing.count += 1
        // Don't overwrite meta — first encountered wins, which (since
        // window is DESC ordered) means most recent labels.
      } else {
        buckets.set(c.key, { sum: c.score, count: 1, meta: c })
      }
    }
  }

  return Array.from(buckets.values()).map(({ sum, count, meta }) => ({
    key: meta.key,
    displayLabelEn: meta.displayLabelEn,
    displayLabelFr: meta.displayLabelFr,
    averageScore: sum / count,
  }))
}

// Map aggregated couches to CouchesDiagnostic's row shape. Sort
// worst-first so the bottleneck row is at the top of the chart, matching
// the diagnostic page's contract — the bottleneck callout in
// CouchesDiagnostic literally reads "the top row".
function couchesToRows(
  aggregated: AggregatedCouche[],
  lang: InterfaceLanguage,
): { name: string; score: number; cefr: string }[] {
  return aggregated
    .map((c) => {
      const pct = toPercent(c.averageScore)
      const name = lang === 'fr' ? c.displayLabelFr : c.displayLabelEn
      return { name, score: pct, cefr: cefrBand(pct) }
    })
    .sort((a, b) => a.score - b.score)
}

interface Props {
  recordings: RecordingSummary[]
}

export default function SustainedCouches({ recordings }: Props) {
  const lang = useInterfaceLanguage()
  const aggregated = aggregateCouches(recordings)
  const rows = couchesToRows(aggregated, lang)

  // Defensive — if the backend ever returns empty couches arrays for
  // every recording in the window, bail rather than render a 0-bar
  // CouchesDiagnostic that would mislead the user.
  if (rows.length === 0) return null

  const sampleSize = Math.min(recordings.length, ROLLING_WINDOW)
  const labels =
    lang === 'fr'
      ? {
          eyebrow: 'Position soutenue',
          subhead: `Moyenne des ${sampleSize} derniers enregistrement${sampleSize > 1 ? 's' : ''}.`,
        }
      : {
          eyebrow: 'Your sustained position',
          subhead: `Rolling average across your last ${sampleSize} recording${sampleSize === 1 ? '' : 's'}.`,
        }

  return (
    <section
      aria-label={labels.eyebrow}
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <div>
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
          {labels.eyebrow}
        </p>
        <p
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 500,
            fontSize: 13,
            color: INK_SOFT,
            margin: 0,
          }}
        >
          {labels.subhead}
        </p>
      </div>

      <CouchesDiagnostic rows={rows} />
    </section>
  )
}
