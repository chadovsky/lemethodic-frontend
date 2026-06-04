import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

export default function Hero() {
  return (
    <section
      aria-label="Hero"
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--bg-canvas)',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(80px, 12vw, 160px) clamp(24px, 5vw, 80px)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div style={{ maxWidth: 760 }}>

          <h1
            className="text-balance ed-hero-rise ed-hero-rise-delay-1"
            style={{
              fontFamily: SERIF_FONT,
              fontWeight: 400,
              fontSize: 'clamp(2.75rem, 6.5vw, 5.5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: 'clamp(20px, 2.5vw, 32px)',
            }}
          >
            {"There's a method to French. Now there's Le Méthodic."}
          </h1>

          <p
            data-testid="hero-subheadline"
            className="text-pretty ed-hero-rise ed-hero-rise-delay-2"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: 'clamp(1.125rem, 1.6vw, 1.375rem)',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              maxWidth: 560,
              margin: 0,
              marginBottom: 'clamp(32px, 4vw, 48px)',
            }}
          >
            Built by an author of 28 French linguistics books. Used by anglophones who want their French to sound native, not assembled.
          </p>

          <div
            data-testid="hero-cta-wrapper"
            className="ed-hero-rise ed-hero-rise-delay-3"
            style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}
          >
            <Link
              href="/la-methode"
              className="ed-btn-press"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 56,
                padding: '0 36px',
                borderRadius: 4,
                backgroundColor: 'var(--cta-primary)',
                color: '#ffffff',
                fontFamily: SANS_FONT,
                fontWeight: 600,
                fontSize: '1rem',
                letterSpacing: '0',
                textDecoration: 'none',
              }}
            >
              See how it works
            </Link>

            <Link
              href="/placement"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 56,
                fontFamily: SANS_FONT,
                fontWeight: 500,
                fontSize: '1rem',
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
                letterSpacing: '0',
              }}
            >
              Start with a free placement
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
