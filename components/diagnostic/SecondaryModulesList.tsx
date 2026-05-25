'use client'

// F-080c — collapsed "Also detected" section. Default is closed; the
// header click expands the list and per-module rows can each open their
// own details inline (description + supporting quote + examples).

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ModuleCategory, RemediationModule, SessionDetection } from '@/lib/types'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'
import ModuleExamples from './ModuleExamples'

const INK          = 'var(--text-primary)'
const INK_SOFT     = 'var(--text-secondary)'
const INK_MUTED    = 'var(--text-muted)'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

const CATEGORY_BG: Record<ModuleCategory, string> = {
  vocab_calque:        'var(--fp-peach)',
  discourse_structure: 'var(--fp-lavender)',
  grammar_interference:'var(--fp-butter)',
  pronunciation:       '#C7DFEA',
  register_mismatch:   'var(--fp-blush)',
  word_order:          'var(--fp-sage)',
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

const COPY = {
  fr: {
    sectionTitle: 'Aussi détecté',
    fromSession: 'Dans votre session :',
  },
  en: {
    sectionTitle: 'Also detected',
    fromSession: 'From your session:',
  },
} as const

interface Props {
  modules: RemediationModule[]
  detections: SessionDetection[]
}

export default function SecondaryModulesList({ modules, detections }: Props) {
  const lang = useInterfaceLanguage()
  const copy = lang === 'fr' ? COPY.fr : COPY.en
  const [open, setOpen] = useState(false)

  if (!modules.length) return null

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 14,
            color: INK,
          }}
        >
          {copy.sectionTitle} · {modules.length}
        </span>
        {open ? (
          <ChevronUp size={16} strokeWidth={2} color={INK_MUTED} />
        ) : (
          <ChevronDown size={16} strokeWidth={2} color={INK_MUTED} />
        )}
      </button>

      {open ? (
        <div
          style={{
            borderTop: '1px solid #1A1A1A0A',
            padding: '12px 14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {modules.map((m) => {
            // Pick the first non-primary detection for this module — there
            // can be multiple supporting_quotes for the same module_id
            // (T1 to_get_reflex emits one per occurrence).
            const det = detections.find(
              (d) => d.module_id === m.id && !d.is_primary,
            ) ?? null
            return (
              <SecondaryModuleRow
                key={m.id}
                module={m}
                detection={det}
                lang={lang}
                fromSessionLabel={copy.fromSession}
              />
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function SecondaryModuleRow({
  module: m,
  detection,
  lang,
  fromSessionLabel,
}: {
  module: RemediationModule
  detection: SessionDetection | null
  lang: 'en' | 'fr' | 'es'
  fromSessionLabel: string
}) {
  const [open, setOpen] = useState(false)
  const name = lang === 'fr' ? m.name_fr : m.name_en
  const description =
    lang === 'fr' ? m.L1_interference_description_fr : m.L1_interference_description_en
  const categoryLabel =
    (lang === 'fr' ? CATEGORY_LABEL.fr : CATEGORY_LABEL.en)[m.category]

  return (
    <div
      style={{
        backgroundColor: CATEGORY_BG[m.category],
        borderRadius: 14,
        padding: '12px 14px',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          WebkitTapHighlightColor: 'transparent',
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
          {categoryLabel}
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 15,
              color: INK,
            }}
          >
            {name}
          </span>
          {open ? (
            <ChevronUp size={14} strokeWidth={2} color={INK_MUTED} />
          ) : (
            <ChevronDown size={14} strokeWidth={2} color={INK_MUTED} />
          )}
        </div>
        {detection?.supporting_quote ? (
          <span
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontStyle: 'italic',
              fontSize: 13,
              color: INK_SOFT,
            }}
          >
            &ldquo;{detection.supporting_quote}&rdquo;
          </span>
        ) : null}
      </button>

      {open ? (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p
            style={{
              margin: 0,
              fontFamily: DISPLAY_FONT,
              fontWeight: 500,
              fontSize: 13,
              lineHeight: '20px',
              color: INK_SOFT,
            }}
          >
            {description}
          </p>
          {detection?.supporting_quote ? (
            <p
              style={{
                margin: 0,
                fontFamily: DISPLAY_FONT,
                fontWeight: 600,
                fontSize: 11,
                color: INK_MUTED,
              }}
            >
              {fromSessionLabel}
            </p>
          ) : null}
          {m.examples.length > 0 ? <ModuleExamples examples={m.examples} /> : null}
        </div>
      ) : null}
    </div>
  )
}
