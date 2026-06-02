import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tarifs | Le Méthodic',
  description:
    'Accès gratuit, abonnement mensuel Core et parcours intensif Sprint. Choisissez la formule adaptée à votre objectif de français.',
  alternates: { canonical: '/tarifs' },
}

const DISPLAY = 'var(--f-display), Georgia, serif'
const UI = 'var(--f-ui), system-ui, sans-serif'
const MONO = 'var(--f-mono), monospace'

const TIERS = [
  {
    key: 'free',
    name: 'Gratuit',
    price: '0€',
    priceUnit: null,
    priceNote: null,
    valueLine: 'CLB Read et une traversée d\'île complète, sans carte bancaire.',
    features: [
      'Accès aux tâches de niveau Read (CLB 4)',
      'Une traversée d\'île guidée',
      'Tableau de bord du niveau CEFR',
    ],
    cta: { label: 'Commencer', href: '/inscription', live: true },
    bientot: false,
  },
  {
    key: 'core',
    name: 'Core',
    price: '29€',
    priceUnit: '/mois',
    priceNote: '19€/mois facturé annuellement',
    valueLine: 'Accès illimité à toutes les tâches TCF, tous niveaux débloqués.',
    features: [
      'Toutes les tâches orales et écrites TCF',
      'Niveaux A2 à C2 débloqués',
      'Retours audio calibrés par couche',
      'Progression tracée et adaptée',
      'Accès à La Bibliothèque',
    ],
    cta: { label: 'Bientôt disponible', href: null, live: false },
    bientot: true,
  },
  {
    key: 'sprint',
    name: 'Sprint',
    price: '179€',
    priceUnit: null,
    priceNote: 'pour 6 à 8 semaines',
    valueLine: 'Un parcours intensif calibré sur une date d\'examen précise.',
    features: [
      'Tout le plan Core inclus',
      'Planification serrée semaine par semaine',
      'Simulations d\'examen complètes',
      'Rapport de progression exportable',
      'Accès prioritaire aux nouvelles tâches',
    ],
    cta: { label: 'Bientôt disponible', href: null, live: false },
    bientot: true,
  },
]

function CheckIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        backgroundColor: 'var(--accent)',
        flexShrink: 0,
        marginTop: 2,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
        <path
          d="M1.5 4l1.5 1.5L6.5 2"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default function TarifsPage() {
  return (
    <main className="ed-page-enter" style={{ backgroundColor: 'var(--paper)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 1024,
          margin: '0 auto',
          padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px)',
        }}
      >
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: 'var(--ink)',
            margin: 0,
            marginBottom: 12,
          }}
        >
          Tarifs
        </h1>

        <p
          style={{
            fontFamily: UI,
            fontWeight: 400,
            fontSize: 'clamp(1rem, 2vw, 1.0625rem)',
            lineHeight: 1.75,
            color: 'var(--ink-soft)',
            margin: 0,
            marginBottom: 'clamp(40px, 6vw, 56px)',
            maxWidth: 560,
          }}
        >
          Commencez gratuitement. Les formules payantes arrivent bientôt.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
            marginBottom: 'clamp(40px, 6vw, 56px)',
          }}
        >
          {TIERS.map((tier) => (
            <div
              key={tier.key}
              style={{
                position: 'relative',
                backgroundColor: 'var(--paper)',
                border: '1px solid var(--rule)',
                borderRadius: 8,
                padding: '28px 24px',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              }}
            >
              {tier.bientot && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: 1,
                    fontFamily: UI,
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
              )}

              <p
                style={{
                  fontFamily: MONO,
                  fontWeight: 500,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-faint)',
                  margin: 0,
                  marginBottom: 14,
                }}
              >
                {tier.name}
              </p>

              <div style={{ marginBottom: tier.priceNote ? 6 : 18 }}>
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    fontSize: 'clamp(1.875rem, 4vw, 2.5rem)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    color: 'var(--ink)',
                  }}
                >
                  {tier.price}
                </span>
                {tier.priceUnit && (
                  <span
                    style={{
                      fontFamily: UI,
                      fontWeight: 400,
                      fontSize: '0.9375rem',
                      color: 'var(--ink-soft)',
                      marginLeft: 4,
                    }}
                  >
                    {tier.priceUnit}
                  </span>
                )}
              </div>

              {tier.priceNote && (
                <p
                  style={{
                    fontFamily: UI,
                    fontWeight: 400,
                    fontSize: '0.8125rem',
                    color: 'var(--ink-faint)',
                    margin: 0,
                    marginBottom: 18,
                  }}
                >
                  {tier.priceNote}
                </p>
              )}

              <p
                style={{
                  fontFamily: UI,
                  fontWeight: 400,
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  color: 'var(--ink-soft)',
                  margin: 0,
                  marginBottom: 20,
                }}
              >
                {tier.valueLine}
              </p>

              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  flexGrow: 1,
                  marginBottom: 28,
                }}
              >
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      fontFamily: UI,
                      fontWeight: 400,
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                      color: 'var(--ink)',
                    }}
                  >
                    <CheckIcon />
                    {feature}
                  </li>
                ))}
              </ul>

              {tier.cta.live ? (
                <Link
                  href={tier.cta.href!}
                  className="ed-btn-press"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 48,
                    backgroundColor: 'var(--cta-primary)',
                    color: '#FFFFFF',
                    borderRadius: 4,
                    fontFamily: UI,
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    textDecoration: 'none',
                    letterSpacing: '0.01em',
                    transition: 'background-color 200ms ease',
                  }}
                >
                  {tier.cta.label}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 48,
                    width: '100%',
                    backgroundColor: 'transparent',
                    color: 'var(--ink-faint)',
                    borderRadius: 4,
                    border: '1px solid var(--rule)',
                    fontFamily: UI,
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                    cursor: 'not-allowed',
                    letterSpacing: '0.01em',
                    opacity: 0.7,
                  }}
                >
                  {tier.cta.label}
                </button>
              )}
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: UI,
            fontWeight: 400,
            fontSize: '0.9375rem',
            lineHeight: 1.75,
            color: 'var(--ink-soft)',
            margin: 0,
          }}
        >
          Vous préférez un accompagnement humain en parallèle ?{' '}
          <Link href="/a-propos" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
            Le fondateur continue à enseigner sur Preply
          </Link>
          . Les cours particuliers se réservent directement sur son profil, indépendamment de la
          plateforme.
        </p>
      </div>
    </main>
  )
}
