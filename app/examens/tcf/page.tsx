import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'TCF Canada | Le Méthodic',
  description:
    'Préparez le TCF Canada pour votre demande de résidence permanente au Québec. Méthode en cinq couches, parcours complet.',
  alternates: { canonical: '/examens/tcf' },
}

const DISPLAY = 'var(--f-display), Georgia, serif'
const UI = 'var(--f-ui), system-ui, sans-serif'
const MONO = 'var(--f-mono), monospace'

const eyebrow: React.CSSProperties = {
  fontFamily: MONO,
  fontWeight: 500,
  fontSize: '0.6875rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--ink-faint)',
  margin: 0,
  marginBottom: 16,
}

const sectionHeading: React.CSSProperties = {
  fontFamily: DISPLAY,
  fontWeight: 700,
  fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
  color: 'var(--ink)',
  margin: 0,
  marginBottom: 16,
}

const body: React.CSSProperties = {
  fontFamily: UI,
  fontWeight: 400,
  fontSize: 'clamp(1rem, 2vw, 1.0625rem)',
  lineHeight: 1.75,
  color: 'var(--ink)',
  margin: 0,
}

const rule: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid var(--rule)',
  margin: '0 0 clamp(40px, 5vw, 56px)',
}

export default function TcfPage() {
  return (
    <main className="ed-page-enter" style={{ backgroundColor: 'var(--paper)', minHeight: '100vh' }}>
      {/* Hero */}
      <div
        style={{
          borderBottom: '1px solid var(--rule)',
          padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px) clamp(48px, 6vw, 72px)',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <p style={{ ...eyebrow, marginBottom: 20 }}>Examens / TCF Canada</p>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: 'var(--ink)',
              margin: 0,
              marginBottom: 16,
            }}
          >
            TCF Canada
          </h1>
          <p
            style={{
              fontFamily: UI,
              fontWeight: 400,
              fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
              lineHeight: 1.5,
              color: 'var(--ink-soft)',
              margin: 0,
            }}
          >
            Pour la résidence permanente au Québec
          </p>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: 'clamp(48px, 6vw, 72px) clamp(24px, 5vw, 48px)',
        }}
      >
        {/* Section 1 — L'examen */}
        <section aria-labelledby="section-examen" style={{ marginBottom: 'clamp(40px, 5vw, 56px)' }}>
          <h2 id="section-examen" style={eyebrow}>
            L&apos;examen
          </h2>
          <h3 style={sectionHeading}>Structure et seuils</h3>
          <p style={body}>
            Le TCF Canada évalue quatre compétences : compréhension orale, compréhension écrite,
            expression orale et expression écrite. Les deux premières sont obligatoires ; les deux
            expressions sont exigées pour la plupart des programmes d&apos;immigration québécois.
            Le seuil courant pour la résidence permanente au Québec se situe au niveau B2, en
            particulier pour l&apos;expression orale. Obtenir un B2 solide en production orale est
            le principal défi pour les candidats anglophones.
          </p>
        </section>

        <hr style={rule} />

        {/* Section 2 — La méthode */}
        <section aria-labelledby="section-methode" style={{ marginBottom: 'clamp(40px, 5vw, 56px)' }}>
          <h2 id="section-methode" style={eyebrow}>
            La méthode
          </h2>
          <h3 style={sectionHeading}>Cinq couches, un résultat</h3>
          <p style={body}>
            Le Méthodic prépare le TCF Canada à travers une méthode en cinq couches : Le Propos
            (construire une idée centrale), Le Plan (structurer la réponse), La Construction
            (produire des phrases complètes en français), Les Pièges Anglais (éliminer les
            interférences de l&apos;anglais) et La Musique (adopter le rythme et la prosodie du
            français natif). Ces cinq couches s&apos;appliquent directement aux épreuves orales et
            écrites du TCF.{' '}
            <Link
              href="/la-methode"
              style={{
                color: 'var(--ink)',
                textDecoration: 'underline',
                textDecorationColor: 'var(--rule)',
                textUnderlineOffset: 3,
              }}
            >
              Découvrir la méthode complète.
            </Link>
          </p>
        </section>

        <hr style={rule} />

        {/* Section 3 — Le parcours */}
        <section aria-labelledby="section-parcours" style={{ marginBottom: 'clamp(48px, 6vw, 72px)' }}>
          <h2 id="section-parcours" style={eyebrow}>
            Le parcours
          </h2>
          <h3 style={sectionHeading}>Du niveau actuel à l&apos;examen</h3>
          <p style={body}>
            Le parcours TCF Canada commence par un diagnostic de niveau. Sur cette base, la
            plateforme construit un plan d&apos;entraînement personnalisé : exercices de
            compréhension, simulations d&apos;expression orale avec retour du Maître, et
            entraînements à l&apos;expression écrite. Chaque session renforce les cinq couches
            jusqu&apos;à ce que le candidat atteigne le niveau cible avec confiance.
          </p>
        </section>

        {/* CTA */}
        <Link
          href="/inscription"
          className="ed-btn-press"
          style={{
            display: 'inline-block',
            padding: '0 36px',
            height: 56,
            lineHeight: '56px',
            backgroundColor: 'var(--cta-primary)',
            color: '#FFFFFF',
            borderRadius: 4,
            fontFamily: UI,
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: 0,
            textDecoration: 'none',
            transition: 'background-color 200ms cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          Commencer mon parcours TCF
        </Link>
      </div>
    </main>
  )
}
