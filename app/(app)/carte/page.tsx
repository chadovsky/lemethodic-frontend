import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

const INK      = 'var(--dominant)'
const INK_SOFT = 'var(--text-secondary)'
const PAPER    = 'var(--lm-bg-surface)'
const RULE     = 'var(--rule-default)'

export default function CartePage() {
  return (
    <div
      style={{
        fontFamily: SANS_FONT,
        maxWidth: 640,
        margin: '0 auto',
        padding: '80px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          backgroundColor: PAPER,
          border: `1px solid ${RULE}`,
          borderRadius: 8,
          padding: '64px 48px',
        }}
      >
        <p
          style={{
            fontFamily: SANS_FONT,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: INK_SOFT,
            margin: '0 0 20px',
          }}
        >
          Bientôt
        </p>
        <h1
          style={{
            fontFamily: SERIF_FONT,
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 400,
            color: INK,
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}
        >
          La Carte
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: INK_SOFT,
            margin: 0,
            lineHeight: 1.6,
            maxWidth: 340,
          }}
        >
          Votre carte personnelle des îles de La Méthode. En cours de construction.
        </p>
      </div>
    </div>
  )
}
