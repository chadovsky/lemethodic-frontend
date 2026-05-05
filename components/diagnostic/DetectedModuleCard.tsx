'use client'

// F-080c — primary detection card. Renders the module's name, category,
// severity, L1-interference description, the supporting quote from this
// session, and an expandable "See examples" list.

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type {
  ModuleCategory,
  RemediationModule,
  SessionDetection,
} from '@/lib/types'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import ModuleExamples from './ModuleExamples'

const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const DISPLAY_FONT = 'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'

// FluentPath pastels (mirrored from globals.css). One per category so the
// badge becomes a visual cue. Pre-launch this is decorative; if/when the
// library grows past 8 categories we'd switch to a hash-based palette.
const CATEGORY_BG: Record<ModuleCategory, string> = {
  vocab_calque:        '#FFD8C2', // peach
  discourse_structure: '#E0D4F0', // lavender
  grammar_interference:'#FFF0C2', // butter
  pronunciation:       '#C7DFEA', // sky
  register_mismatch:   '#F4CFD8', // blush
  word_order:          '#D4E4D0', // sage
  verb_aspect:         '#E8E4D8', // warm gray
  other:               '#1A1A1A0F',
}

const CATEGORY_LABEL: Record<'fr' | 'en', Record<ModuleCategory, string>> = {
  fr: {
    vocab_calque:        'Calque lexical',
    discourse_structure: 'Structure du discours',
    grammar_interference:'Interférence grammaticale',
    pronunciation:       'Prononciation',
    register_mismatch:   'Registre',
    word_order:          'Ordre des mots',
    verb_aspect:         'Aspect verbal',
    other:               'Autre',
  },
  en: {
    vocab_calque:        'Vocabulary calque',
    discourse_structure: 'Discourse structure',
    grammar_interference:'Grammar interference',
    pronunciation:       'Pronunciation',
    register_mismatch:   'Register',
    word_order:          'Word order',
    verb_aspect:         'Verb aspect',
    other:               'Other',
  },
}

const COPY = {
  fr: {
    fromSession: 'Dans votre session :',
    seeExamples: 'Voir les exemples',
    hideExamples: 'Masquer les exemples',
    severity: 'Sévérité',
    learnThis: 'En savoir plus',
  },
  en: {
    fromSession: 'From your session:',
    seeExamples: 'See examples',
    hideExamples: 'Hide examples',
    severity: 'Severity',
    learnThis: 'Learn this',
  },
} as const

interface Props {
  module: RemediationModule
  detection: SessionDetection | null
  /** F-080d — when provided, renders a "Learn this" button at the bottom
   *  of the card. Caller routes per linked-vs-orphan rules (linked
   *  module → LearnModuleSheet picker; orphan → /learn/[id] direct push).
   *  Omit to keep the F-080c-shipped behavior with no Learn-this CTA. */
  onLearnTap?: (m: RemediationModule) => void
}

export default function DetectedModuleCard({ module: m, detection, onLearnTap }: Props) {
  const lang = useInterfaceLanguage()
  const copy = lang === 'fr' ? COPY.fr : COPY.en
  const name = lang === 'fr' ? m.name_fr : m.name_en
  const description =
    lang === 'fr' ? m.L1_interference_description_fr : m.L1_interference_description_en
  const categoryLabel = (lang === 'fr' ? CATEGORY_LABEL.fr : CATEGORY_LABEL.en)[m.category]

  const [examplesOpen, setExamplesOpen] = useState(false)

  return (
    <div
      style={{
        backgroundColor: CATEGORY_BG[m.category],
        borderRadius: 24,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Top row: category badge + severity */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: INK_SOFT,
          }}
        >
          {categoryLabel}
        </span>
        <SeverityScale value={m.severity} label={copy.severity} />
      </div>

      {/* Module name */}
      <h2
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: 22,
          lineHeight: 1.2,
          color: INK,
        }}
      >
        {name}
      </h2>

      {/* L1-interference description */}
      <p
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '21px',
          color: INK_SOFT,
        }}
      >
        {description}
      </p>

      {/* Supporting quote — only when the detection actually carried one */}
      {detection?.supporting_quote ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: INK_MUTED,
            }}
          >
            {copy.fromSession}
          </span>
          <p
            style={{
              margin: 0,
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontStyle: 'italic',
              fontSize: 14,
              lineHeight: '21px',
              color: INK,
            }}
          >
            &ldquo;{detection.supporting_quote}&rdquo;
          </p>
        </div>
      ) : null}

      {/* See examples expand + F-080d Learn this CTA */}
      {m.examples.length > 0 || onLearnTap ? (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {m.examples.length > 0 && (
              <button
                type="button"
                onClick={() => setExamplesOpen((v) => !v)}
                aria-expanded={examplesOpen}
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 13,
                  color: INK,
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: 100,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {examplesOpen ? copy.hideExamples : copy.seeExamples}
                {examplesOpen ? <ChevronUp size={14} strokeWidth={2.25} /> : <ChevronDown size={14} strokeWidth={2.25} />}
              </button>
            )}
            {onLearnTap && (
              <button
                type="button"
                onClick={() => onLearnTap(m)}
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#FFFFFF',
                  backgroundColor: INK,
                  border: 'none',
                  borderRadius: 100,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {copy.learnThis}
              </button>
            )}
          </div>
          {examplesOpen ? <ModuleExamples examples={m.examples} /> : null}
        </>
      ) : null}
    </div>
  )
}

function SeverityScale({ value, label }: { value: number; label: string }) {
  const dots = [1, 2, 3, 4, 5]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: '0.04em',
          color: INK_MUTED,
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', gap: 3 }} aria-label={`${label} ${value}/5`}>
        {dots.map((d) => (
          <span
            key={d}
            aria-hidden="true"
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: d <= value ? INK : '#1A1A1A24',
            }}
          />
        ))}
      </div>
    </div>
  )
}
