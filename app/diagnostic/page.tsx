'use client'

import { useState } from 'react'
import Link from 'next/link'
import CouchesDiagnostic from '@/components/diagnostic/CouchesDiagnostic'
import GouletCard from '@/components/diagnostic/GouletCard'
import OrdonnanceExerciseCard from '@/components/diagnostic/OrdonnanceExerciseCard'
import CorrectedLine, { Correction } from '@/components/diagnostic/CorrectedLine'

// ─── design tokens ────────────────────────────────────────────────────────────
const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const SAGE         = '#D4E4D0'
const BUTTER       = '#FFF0C2'
const BG           = '#FAFAF7'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

// ─── transcript data ──────────────────────────────────────────────────────────
type Segment = { text?: string; correction?: Correction }

const LINES: { segments: Segment[]; coachingNote: string }[] = [
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

// ─── helper: CEFR from score ─────────────────────────────────────────────────
function cefrBand(score: number): string {
  if (score <= 20) return 'A1'
  if (score <= 35) return 'A2'
  if (score <= 55) return 'B1'
  if (score <= 75) return 'B2'
  if (score <= 90) return 'C1'
  return 'C2'
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

// ─── page ─────────────────────────────────────────────────────────────────────
export default function DiagnosticPage() {
  const [sessionOpen, setSessionOpen] = useState(false)
  const [transcriptTab, setTranscriptTab] = useState<'resume' | 'complet'>('resume')

  const tcfScore = 428
  const tcfBand  = 'C1'
  // C1 band = 400–499, position within band
  const bandMin  = 400
  const bandMax  = 499
  const bandFill = Math.min(1, Math.max(0, (tcfScore - bandMin) / (bandMax - bandMin)))

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: BG,
        fontFamily: DISPLAY_FONT,
      }}
    >
      {/* ── max-width wrapper ── */}
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
          {/* Back arrow */}
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

          {/* Title */}
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
              Tâche 2 · Agence de voyages · 8 min
            </p>
          </div>

          {/* Share icon */}
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

        {/* ── page body ── */}
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
            <SectionLabel>Estimated TCF Score</SectionLabel>

            {/* Score hero */}
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
                {tcfScore} / 699
              </span>
            </div>

            {/* Target line */}
            <p
              style={{
                margin: 0,
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 13,
                color: INK_SOFT,
              }}
            >
              Within target band for TCF Canada (CLB 9+)
            </p>

            {/* Progress bar */}
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
          </SectionCard>

          {/* ══ SECTION 2 — RADAR ═══════════════════════════════════════════ */}
          <SectionCard bg={SAGE}>
            <SectionLabel>La Méthode en Couches</SectionLabel>
            <SectionHeading>Where you stand on each layer</SectionHeading>

            <CouchesDiagnostic />
          </SectionCard>

          {/* ══ SECTION 3 — LE GOULET ═══════════════════════════════════════ */}
          <GouletCard
            layer="Les Réflexes Anglais"
            score={45}
            band={cefrBand(45)}
            estimatedGain={35}
            body="You're translating English structures directly into French. This is the lowest of your four layers (45/100, A2 band) and the single biggest thing holding your TCF score back. Fix this layer and your overall score jumps the most."
          />

          {/* ══ SECTION 4 — L'ORDONNANCE ════════════════════════════════════ */}
          <SectionCard bg={BUTTER}>
            <SectionLabel>{"L'Ordonnance · Your Prescription"}</SectionLabel>
            <SectionHeading>Three exercises to fix this</SectionHeading>
            <p
              style={{
                margin: 0,
                fontFamily: DISPLAY_FONT,
                fontWeight: 500,
                fontSize: 13,
                color: INK_MUTED,
              }}
            >
              Targeted at Les Réflexes Anglais. Built for English speakers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <OrdonnanceExerciseCard
                number="01"
                title="Préposition swap drill"
                description="20 sentences where English speakers reach for the wrong preposition. Spot the trap, pick the French one."
                duration="10 min"
              />
              <OrdonnanceExerciseCard
                number="02"
                title="Word order rebuild"
                description="10 English sentences. Rebuild each as a native French speaker would — not as a direct translation."
                duration="12 min"
              />
              <OrdonnanceExerciseCard
                number="03"
                title="False friend gauntlet"
                description="15 cognates that look identical in both languages but mean different things. Choose the right French sense."
                duration="8 min"
              />
            </div>
          </SectionCard>

          {/* ══ SECTION 5 — SESSION DETAILS (collapsible) ═══════════════════ */}
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

          {/* ══ SECTION 6 — CORRECTED TRANSCRIPTION ═════════════════════════ */}
          <SectionCard bg="white">
            {/* Tab toggle */}
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

            {/* Lines */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: transcriptTab === 'complet' ? 20 : 14,
              }}
            >
              {LINES.map((line, i) => (
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
            {/* Primary */}
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

            {/* Secondary */}
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
    </div>
  )
}
