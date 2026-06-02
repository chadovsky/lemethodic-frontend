import type { ReactNode } from 'react'
import { SANS_FONT } from '@/lib/typography'

interface BientotProps {
  label: string
  level: 'surface' | 'section'
  children: ReactNode
}

export default function Bientot({ label, level, children }: BientotProps) {
  return (
    <div
      data-testid="bientot-wrapper"
      data-level={level}
      style={{ position: 'relative' }}
    >
      <span
        data-testid="bientot-pill"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 1,
          fontFamily: SANS_FONT,
          fontWeight: 600,
          fontSize: '0.6875rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          backgroundColor: 'var(--accent)',
          color: 'var(--paper)',
          padding: '3px 10px',
          borderRadius: 'var(--r-pill)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        Bientôt
      </span>

      <p
        data-testid="bientot-label"
        style={{
          fontFamily: SANS_FONT,
          fontSize: level === 'surface' ? '1rem' : '0.875rem',
          lineHeight: 1.5,
          color: 'var(--text-secondary)',
          margin: 0,
          marginTop: level === 'surface' ? 8 : 4,
          marginBottom: level === 'surface' ? 24 : 16,
          paddingRight: 80,
        }}
      >
        {label}
      </p>

      <div
        aria-hidden="true"
        style={{
          opacity: 0.6,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
