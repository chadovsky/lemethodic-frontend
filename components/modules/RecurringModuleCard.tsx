'use client'

// F-080d — module card rendered in the home tab "Recommended for you"
// section. Compact: name, category badge, severity dots, "Detected in
// N of your sessions". Whole card is the tap target — caller decides
// where the tap routes (linked → LearnModuleSheet picker; orphan →
// /learn/[id] direct push).

import type { ModuleCategory, RecurringModule } from '@/lib/types'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'

const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

// Mirror of CATEGORY_BG in components/diagnostic/DetectedModuleCard.tsx.
// Kept in sync manually — pre-launch the palette is small enough that
// hoisting into a shared constants file isn't worth the import churn.
const CATEGORY_BG: Record<ModuleCategory, string> = {
  vocab_calque:        '#FFD8C2',
  discourse_structure: '#E0D4F0',
  grammar_interference:'#FFF0C2',
  pronunciation:       '#C7DFEA',
  register_mismatch:   '#F4CFD8',
  word_order:          '#D4E4D0',
  verb_aspect:         '#E8E4D8',
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

interface Props {
  module: RecurringModule
  onTap: () => void
}

export default function RecurringModuleCard({ module: m, onTap }: Props) {
  const lang = useInterfaceLanguage()
  const name = lang === 'fr' ? m.name_fr : m.name_en
  const categoryLabel = (lang === 'fr' ? CATEGORY_LABEL.fr : CATEGORY_LABEL.en)[m.category]
  const sessionsCopy =
    lang === 'fr'
      ? `Détecté dans ${m.recurrence_count} de vos sessions`
      : `Detected in ${m.recurrence_count} of your sessions`

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={`${name} — ${sessionsCopy}`}
      style={{
        width: '100%',
        backgroundColor: CATEGORY_BG[m.category],
        borderRadius: 20,
        padding: '18px 18px',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        WebkitTapHighlightColor: 'transparent',
        transition: 'transform 0.12s',
      }}
      onPointerDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)' }}
      onPointerUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
      onPointerLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
    >
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
        <SeverityDots value={m.severity} />
      </div>

      <h3
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          fontSize: 18,
          lineHeight: 1.25,
          color: INK,
        }}
      >
        {name}
      </h3>

      <p
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 13,
          color: INK_SOFT,
        }}
      >
        {sessionsCopy}
      </p>
    </button>
  )
}

function SeverityDots({ value }: { value: number }) {
  const dots = [1, 2, 3, 4, 5]
  return (
    <div
      style={{ display: 'flex', gap: 3, alignItems: 'center' }}
      aria-label={`Severity ${value}/5`}
    >
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
  )
}
