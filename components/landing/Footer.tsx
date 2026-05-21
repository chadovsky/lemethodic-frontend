import Link from 'next/link'
import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: "L'École", href: '/ecole' },
      { label: 'Le Vocabulaire', href: '/vocabulaire' },
      { label: 'Le Diagnostic', href: '/diagnostic' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Method', href: '/method' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/legal/tos' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
    ],
  },
]

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#1C1A16',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: 'clamp(48px, 8vw, 80px) clamp(24px, 5vw, 80px) clamp(32px, 5vw, 48px)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Top: wordmark + columns */}
        <div
          className="grid grid-cols-1 md:grid-cols-4"
          style={{ gap: 'clamp(32px, 4vw, 48px)', marginBottom: 'clamp(32px, 4vw, 48px)' }}
        >
          {/* Wordmark */}
          <div>
            <Link
              href="/"
              style={{
                fontFamily: SERIF_FONT,
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: '1.25rem',
                letterSpacing: '-0.01em',
                color: 'rgba(248, 244, 237, 0.9)',
                textDecoration: 'none',
                display: 'inline-block',
                marginBottom: 12,
              }}
            >
              Le Méthodic
            </Link>
            <p
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 400,
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                color: 'rgba(248, 244, 237, 0.45)',
                margin: 0,
              }}
            >
              TCF Canada oral prep for anglophone candidates.
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading} data-testid="footer-column">
              <p
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'rgba(248, 244, 237, 0.45)',
                  margin: 0,
                  marginBottom: 16,
                }}
              >
                {col.heading}
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      style={{
                        fontFamily: SANS_FONT,
                        fontWeight: 400,
                        fontSize: '0.875rem',
                        color: 'rgba(248, 244, 237, 0.7)',
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 'clamp(20px, 2.5vw, 28px)',
          }}
        >
          <p
            data-testid="footer-copyright"
            style={{
              fontFamily: SANS_FONT,
              fontWeight: 400,
              fontSize: '0.8125rem',
              color: 'rgba(248, 244, 237, 0.35)',
              margin: 0,
            }}
          >
            © 2026 Le Méthodic
          </p>
        </div>
      </div>
    </footer>
  )
}
