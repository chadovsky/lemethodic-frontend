import Link from 'next/link'

const DISPLAY_FONT = 'var(--font-geist), -apple-system, "Segoe UI", system-ui, sans-serif'
const INK          = 'var(--text-primary)'
const INK_MUTED    = 'var(--text-muted)'
const BG           = 'var(--lm-bg-base)'

export default function FeedbackPlaceholderPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: BG,
        fontFamily: DISPLAY_FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        textAlign: 'center',
        gap: 16,
      }}
    >
      <p style={{ fontWeight: 700, fontSize: 20, color: INK, margin: 0 }}>
        Session complete
      </p>
      <p style={{ fontWeight: 500, fontSize: 14, color: INK_MUTED, margin: 0 }}>
        Feedback analysis is coming in F-058.
      </p>
      <Link
        href="/examen/expression-orale"
        style={{
          display: 'inline-block',
          marginTop: 8,
          padding: '12px 28px',
          borderRadius: 14,
          backgroundColor: INK,
          color: '#FFFFFF',
          fontFamily: DISPLAY_FONT,
          fontWeight: 700,
          fontSize: 15,
          textDecoration: 'none',
        }}
      >
        Retour à Expression orale
      </Link>
    </div>
  )
}
