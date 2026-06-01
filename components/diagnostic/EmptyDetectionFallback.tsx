'use client'

// F-080c — fallback when the analyzer detected no L1-interference
// modules in the session. Couche scores still render above this; this
// is the placeholder where the DETECTED REFLEXES section would normally
// surface a primary module.

import { useInterfaceLanguage } from '@/lib/hooks/useInterfaceLanguage'

const INK_SOFT     = 'var(--text-secondary)'
const INK_MUTED    = 'var(--text-muted)'
const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'

const COPY = {
  fr: {
    title: 'Aucun réflexe spécifique détecté',
    body: "Continuez à pratiquer. Plus vous enregistrez, mieux nous repérons les habitudes anglophones qui freinent votre français.",
  },
  en: {
    title: 'No specific reflexes detected this session',
    body: "Keep practicing. The more sessions you record, the better we surface the English habits holding your French back.",
  },
} as const

export default function EmptyDetectionFallback() {
  const lang = useInterfaceLanguage()
  const copy = lang === 'fr' ? COPY.fr : COPY.en

  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        borderRadius: 20,
        padding: '28px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        textAlign: 'center',
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 16,
          color: INK_SOFT,
        }}
      >
        {copy.title}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: DISPLAY_FONT,
          fontWeight: 500,
          fontSize: 13,
          lineHeight: '20px',
          color: INK_MUTED,
        }}
      >
        {copy.body}
      </p>
    </div>
  )
}
