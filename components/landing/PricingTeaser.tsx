import Link from 'next/link'
import { SANS_FONT } from '@/lib/typography'
import RevealOnScroll from '@/components/landing/RevealOnScroll'

// F-478 — the stale USD multi-tier teaser (À la carte / Daily Bundle / Pro $49 /
// Sprint $199) is removed: it contradicted the canonical €uro ladder on /tarifs
// and put prices on the homepage. This is now a minimal no-price hook (one value
// line + a single "View pricing" CTA → /tarifs). No prices on the homepage. The
// full homepage hook redesign is parked; do not expand this.
export default function PricingTeaser() {
  return (
    <section
      aria-label="Pricing"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        borderTop: '1px solid var(--rule-default)',
        padding: 'clamp(64px, 10vw, 120px) clamp(24px, 5vw, 80px)',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <RevealOnScroll>
          <h2
            id="pricing-heading"
            className="text-balance"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
              lineHeight: 1.2,
              letterSpacing: '-0.015em',
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: 24,
            }}
          >
            Start free. Upgrade when you&rsquo;re ready.
          </h2>

          <Link
            href="/tarifs"
            data-testid="pricing-cta"
            className="ed-btn-press"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              padding: '0 28px',
              borderRadius: 4,
              backgroundColor: 'var(--cta-primary)',
              color: 'var(--accent-foreground)',
              fontFamily: SANS_FONT,
              fontWeight: 600,
              fontSize: '0.9375rem',
              textDecoration: 'none',
              letterSpacing: '0.01em',
            }}
          >
            View pricing
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  )
}
