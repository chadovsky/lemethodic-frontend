import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import RotatingKicker from '@/components/landing/RotatingKicker'

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

          <div data-testid="hero-kicker" className="ed-hero-rise">
            <RotatingKicker lang="en" />
          </div>

          <h1
            className="text-balance ed-hero-rise ed-hero-rise-delay-1"
            style={{
              fontFamily: SERIF_FONT,
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: 'clamp(2.75rem, 6.5vw, 5.5rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: 'clamp(20px, 2.5vw, 32px)',
            }}
          >
            Pass TCF Canada. Get to Quebec.
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
            The only TCF Canada prep built on the 5-Couche method, for anglophone candidates racing the clock.
          </p>

          <div data-testid="hero-cta-wrapper" className="ed-hero-rise ed-hero-rise-delay-3">
            <Link
              href="/signup"
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
              Start your prep
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
