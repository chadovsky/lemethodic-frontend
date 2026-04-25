'use client'

// F-080c — wrong/right/explanation pairs from a module's `examples` array.
// Used inline by DetectedModuleCard's "See examples" expand AND directly
// in SecondaryModulesList's expanded view.

import type { ModuleExampleEntry } from '@/lib/types'
import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'

const INK          = '#1A1A1A'
const INK_SOFT     = '#1A1A1AB3'
const INK_MUTED    = '#1A1A1A66'
const RED_SOFT     = '#C84A3F'
const GREEN_SOFT   = '#3F7A4A'
const DISPLAY_FONT = '"Cabinet Grotesk", Geist, sans-serif'

const COPY = {
  fr: { context: 'Contexte', wrong: 'Évitez', right: 'Préférez', why: 'Pourquoi' },
  en: { context: 'Context', wrong: 'Avoid', right: 'Prefer', why: 'Why' },
} as const

interface Props {
  examples: ModuleExampleEntry[]
}

export default function ModuleExamples({ examples }: Props) {
  const lang = useInterfaceLanguage()
  // ES falls back to EN — V1 module authoring ships FR + EN only.
  const copy = lang === 'fr' ? COPY.fr : COPY.en
  const explanationField: 'explanation_fr' | 'explanation_en' =
    lang === 'fr' ? 'explanation_fr' : 'explanation_en'

  if (!examples.length) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {examples.map((ex, i) => (
        <div
          key={i}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #1A1A1A12',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: DISPLAY_FONT,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: INK_MUTED,
            }}
          >
            {copy.context} · {ex.context}
          </p>

          <ExampleLine label={copy.wrong} text={ex.wrong_utterance} accent={RED_SOFT} strikethrough />
          <ExampleLine label={copy.right} text={ex.corrected_utterance} accent={GREEN_SOFT} />

          <div style={{ paddingTop: 4, borderTop: '1px solid #1A1A1A0A' }}>
            <p
              style={{
                margin: '8px 0 4px',
                fontFamily: DISPLAY_FONT,
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: INK_MUTED,
              }}
            >
              {copy.why}
            </p>
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
              {ex[explanationField]}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ExampleLine({
  label,
  text,
  accent,
  strikethrough = false,
}: {
  label: string
  text: string
  accent: string
  strikethrough?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: accent,
          lineHeight: '20px',
          flexShrink: 0,
          minWidth: 56,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 14,
          lineHeight: '20px',
          color: INK,
          textDecoration: strikethrough ? 'line-through' : 'none',
          textDecorationColor: strikethrough ? `${accent}80` : 'none',
          textDecorationThickness: '1.5px',
        }}
      >
        {text}
      </span>
    </div>
  )
}
