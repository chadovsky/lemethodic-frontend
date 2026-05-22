import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'
import RevealOnScroll from '@/components/landing/RevealOnScroll'

interface Tier {
  name: string
  price: string
  priceNote: string
  description: string
  slug: string
  popular: boolean
}

const TIERS: Tier[] = [
  {
    name: 'À la carte',
    price: '$9–19',
    priceNote: 'per session',
    description: 'Individual oral mock sessions or module packs. No subscription — buy what you need.',
    slug: 'a-la-carte',
    popular: false,
  },
  {
    name: 'Daily Bundle',
    price: '$19',
    priceNote: 'per day',
    description: 'Full daily access to all prep modules. Built for candidates 4–8 weeks from exam.',
    slug: 'daily-bundle',
    popular: true,
  },
  {
    name: 'Exam Bundle',
    price: '$29',
    priceNote: '90 days',
    description: 'Complete 90-day cycle with oral simulation and personalized scoring replay.',
    slug: 'exam-bundle',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$49',
    priceNote: 'per month',
    description: 'Unlimited access plus oral feedback priority and a full method audit included.',
    slug: 'pro',
    popular: false,
  },
  {
    name: 'Sprint',
    price: '$199',
    priceNote: 'one-time',
    description: 'Intensive pre-exam package: full access and a personalized review before your exam date.',
    slug: 'sprint',
    popular: false,
  },
]

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
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
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
              marginBottom: 'clamp(32px, 5vw, 56px)',
            }}
          >
            Choose your plan
          </h2>
        </RevealOnScroll>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5"
          style={{ gap: 'clamp(12px, 1.5vw, 20px)', alignItems: 'stretch' }}
        >
          {TIERS.map((tier) => (
            <div
              key={tier.slug}
              data-testid="pricing-tier"
              className={tier.popular ? 'ed-card-lift pricing-popular-card' : 'ed-card-lift'}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                ...(tier.popular ? {} : { border: '1px solid var(--rule-default)' }),
                borderRadius: 4,
                padding: 'clamp(20px, 2.5vw, 28px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
              }}
            >
              {tier.popular && (
                <span
                  data-testid="pricing-badge-popular"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    padding: '3px 9px',
                    borderRadius: 4,
                    backgroundColor: 'var(--ed-accent)',
                    color: '#ffffff',
                    fontFamily: SANS_FONT,
                    fontWeight: 600,
                    fontSize: '0.625rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 14,
                  }}
                >
                  Most popular
                </span>
              )}

              <h3
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 600,
                  fontSize: '1rem',
                  lineHeight: 1.2,
                  color: 'var(--text-primary)',
                  margin: 0,
                  marginBottom: 10,
                }}
              >
                {tier.name}
              </h3>

              <div style={{ marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: SERIF_FONT,
                    fontWeight: 400,
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.5rem, 2vw, 1.75rem)',
                    lineHeight: 1,
                    color: 'var(--text-primary)',
                  }}
                >
                  {tier.price}
                </span>
                <span
                  style={{
                    fontFamily: SANS_FONT,
                    fontWeight: 400,
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginLeft: 6,
                  }}
                >
                  {tier.priceNote}
                </span>
              </div>

              <p
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 400,
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  margin: 0,
                  marginBottom: 20,
                  flexGrow: 1,
                }}
              >
                {tier.description}
              </p>

              <Link
                href={`/signup?tier=${tier.slug}`}
                data-testid="tier-cta"
                className="ed-btn-press"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 44,
                  borderRadius: 4,
                  backgroundColor: tier.popular ? 'var(--cta-primary)' : 'transparent',
                  border: tier.popular
                    ? 'none'
                    : '1px solid var(--rule-default)',
                  color: tier.popular ? '#ffffff' : 'var(--text-primary)',
                  fontFamily: SANS_FONT,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                }}
              >
                Choose
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
