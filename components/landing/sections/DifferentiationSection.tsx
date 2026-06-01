'use client'

// V-004 — three differentiation cards, each with a per-card visual
// element above the headline + body. Visuals are tiny SVG/typographic
// pieces that activate on hover (couche-stack illumination shift,
// EN/FR pair cycling, waveform amplitude bump). Card chrome (ed-paper
// + 1px ed-rule + ed-card-lift + 4px radius) shared per F-200 system.

import { useEffect, useState } from 'react'
import type { Lang } from '../copy'
import { DIFFERENTIATION } from '../copy'
import { ED, LETTER_SPACING, LINE_HEIGHT, SANS_FONT, SERIF_FONT } from '@/lib/typography'
import RevealOnScroll from '../RevealOnScroll'

// Local hook — gates idle animations + scale transforms behind
// prefers-reduced-motion. The CSS class .ed-pair-fade is already gated
// in globals.css; this hook controls JS-driven animation values.
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

// ── Card 1 — text-anchored bottleneck cycle (V-016f Option B) ─────────────
// V-016f rebuild — replaced the 5-bar decorative stack with a typographic
// frame that names the bottleneck directly. Cycles through the 5 couches
// on hover. Default focus on Les Pièges Anglais (most thematically
// resonant for an anglophone audience). The new layout reads as data
// (a diagnosis), not as a pattern.

const COUCHE_NAMES_FR = [
  'Le Propos',
  'Le Plan',
  'La Construction',
  'Les Pièges Anglais',
  'La Musique',
] as const

const BOTTLENECK_COPY = {
  en: { eyebrow: 'Your bottleneck', tail: "is what's blocking your B2." },
  fr: { eyebrow: 'Votre goulet', tail: 'freine votre B2.' },
} as const

function CoucheStackVisual({ language }: { language: 'en' | 'fr' }) {
  // Default cycle position on Couche 4 (Les Pièges Anglais). Hover →
  // next couche, modulo 5 so the loop is endless. Reduced-motion users
  // see the same end state without the spring transition.
  const [active, setActive] = useState(3)
  const reduced = useReducedMotion()
  const couche = COUCHE_NAMES_FR[active]
  const copy = BOTTLENECK_COPY[language]
  return (
    <div
      onMouseEnter={() => setActive((i) => (i + 1) % COUCHE_NAMES_FR.length)}
      style={{
        marginBottom: 28,
        height: 130,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 8,
      }}
      aria-live="polite"
    >
      <p
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: ED.muted,
          margin: 0,
        }}
      >
        {copy.eyebrow}
      </p>
      <p
        // Keyed remount triggers the spring fade-up on each hover advance.
        key={active}
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 400,
          fontSize: 'clamp(28px, 3vw, 36px)',
          lineHeight: 1.1,
          letterSpacing: '-0.012em',
          color: 'var(--lm-warm-peach-deep)',
          margin: 0,
          animation: reduced ? 'none' : 'ed-pair-fade-in 400ms var(--lm-ease-spring) both',
        }}
      >
        {couche}
      </p>
      <p
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: 14,
          lineHeight: 1.45,
          color: ED.fg,
          margin: 0,
        }}
      >
        {copy.tail}
      </p>
    </div>
  )
}

// ── Card 2 — anglophone interference pair (cycles on hover) ────────────────

// V-008 — direction reversed. Audience is English-speakers learning French,
// so each pair shows the WRONG attempt (calque from English structure) and
// the CORRECT French. Two-line layout: struck-through wrong attempt above,
// correct version below. The reader infers the English source from context.
// All four pairs are iconic L1-interference mistakes (être/avoir confusion
// for first three; word-order for the fourth).
const INTERFERENCE_PAIRS = [
  { wrong: 'Je suis 25 ans', correct: "J'ai 25 ans" },
  { wrong: 'Je suis faim', correct: "J'ai faim" },
  { wrong: 'Je manque toi', correct: 'Tu me manques' },
  { wrong: 'Je suis chaud', correct: "J'ai chaud" },
] as const

function InterferenceVisual() {
  const [pairIdx, setPairIdx] = useState(0)
  const pair = INTERFERENCE_PAIRS[pairIdx]
  return (
    <div
      onMouseEnter={() => setPairIdx((i) => (i + 1) % INTERFERENCE_PAIRS.length)}
      style={{
        marginBottom: 28,
        height: 130,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 12,
      }}
      aria-hidden="true"
    >
      <p
        key={`wrong-${pairIdx}`}
        className="ed-pair-fade"
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 400,
          fontSize: '1.25rem',
          lineHeight: 1.2,
          color: ED.muted,
          margin: 0,
          textDecoration: 'line-through',
          // V-012b — strikethrough color shifts to warm-peach for the
          // "wrong attempt" warmth signal (was neutral ed-muted).
          textDecorationColor: 'var(--lm-warm-peach)',
          textDecorationThickness: '1.5px',
        }}
      >
        {pair.wrong}
      </p>
      <p
        key={`correct-${pairIdx}`}
        className="ed-pair-fade ed-pair-fade-delay"
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 400,
          fontSize: '1.5rem',
          lineHeight: 1.2,
          color: ED.fg,
          margin: 0,
        }}
      >
        {pair.correct}
      </p>
    </div>
  )
}

// ── Card 3 — audio waveform (amplifies on hover) ──────────────────────────

// Heights derived from a smooth sine-ish pattern (8-48px). Static array
// keeps the waveform shape stable; idle animation pulses opacity, hover
// scales each bar's Y.
const WAVEFORM_HEIGHTS = [
  10, 18, 28, 36, 42, 38, 26, 14, 8, 16, 30, 44, 48, 40, 28, 18,
  12, 22, 34, 42, 46, 38, 24, 14, 10, 20, 32, 40, 44, 36, 22, 12,
] as const

function WaveformVisual() {
  const [hovered, setHovered] = useState(false)
  const reduced = useReducedMotion()
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        marginBottom: 28,
        height: 130,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
      }}
      aria-hidden="true"
    >
      {WAVEFORM_HEIGHTS.map((h, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: h,
            backgroundColor: 'var(--lm-warm-sage-deep)',
            opacity: 0.45,
            borderRadius: 1,
            transform: !reduced && hovered ? `scaleY(${1.4 + (i % 3) * 0.1})` : 'scaleY(1)',
            transformOrigin: 'center',
            transition: reduced
              ? 'none'
              : `transform 400ms var(--lm-ease) ${(i % 8) * 18}ms, opacity 400ms var(--lm-ease)`,
            animation: reduced || hovered
              ? 'none'
              : `ed-wave-pulse 1800ms var(--lm-ease) ${i * 50}ms infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────

export default function DifferentiationSection({ lang }: { lang: Lang }) {
  // V-016f — Card 1 visual now takes a language prop (bottleneck eyebrow
  // + tail localised). Cards 2/3 remain prop-less. Map per-index inline
  // instead of an array of components.
  const renderVisual = (i: number) => {
    if (i === 0) return <CoucheStackVisual language={lang} />
    if (i === 1) return <InterferenceVisual />
    if (i === 2) return <WaveformVisual />
    return null
  }
  return (
    <section
      className="w-full"
      style={{
        backgroundColor: ED.bg,
        padding: 'clamp(80px, 12vw, 140px) clamp(24px, 4vw, 64px)',
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280 }}>
        <RevealOnScroll>
          <h2
            className="text-balance"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 'clamp(1.75rem, 3.5vw, 3rem)',
              lineHeight: LINE_HEIGHT.heading,
              letterSpacing: LETTER_SPACING.heading,
              color: ED.fg,
              maxWidth: 920,
              margin: 0,
              marginBottom: 'clamp(40px, 5vw, 72px)',
            }}
          >
            {DIFFERENTIATION.heading[lang]}
          </h2>
        </RevealOnScroll>
        <div
          style={{
            display: 'grid',
            gap: 'clamp(16px, 2vw, 24px)',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {DIFFERENTIATION.cards.map((card, i) => {
            return (
              <RevealOnScroll key={i} delay={i * 0.08}>
                <div
                  className="ed-card-lift"
                  style={{
                    backgroundColor: ED.paper,
                    border: `1px solid ${ED.rule}`,
                    borderRadius: 4,
                    padding: 'clamp(28px, 3vw, 40px)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {renderVisual(i)}
                  <h3
                    style={{
                      fontFamily: SANS_FONT,
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      lineHeight: 1.3,
                      letterSpacing: LETTER_SPACING.heading,
                      color: ED.fg,
                      margin: 0,
                      marginBottom: 16,
                    }}
                  >
                    {card.title[lang]}
                  </h3>
                  <p
                    className="text-pretty"
                    style={{
                      fontFamily: SANS_FONT,
                      fontWeight: 400,
                      fontSize: '1rem',
                      lineHeight: LINE_HEIGHT.body,
                      letterSpacing: LETTER_SPACING.body,
                      color: ED.muted,
                      margin: 0,
                      flex: 1,
                    }}
                  >
                    {card.body[lang]}
                  </p>
                </div>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
