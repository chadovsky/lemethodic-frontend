import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos | Le Méthodic',
  description:
    'Le Méthodic est une plateforme numérique de préparation aux examens de français, construite autour de la méthode en cinq couches.',
  alternates: { canonical: '/a-propos' },
}

const preplyUrl = process.env.NEXT_PUBLIC_PREPLY_URL || 'https://preply.com'

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

export default function AProposPage() {
  return (
    <main className="ed-page-enter" style={{ backgroundColor: 'var(--paper)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 720,
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
            marginBottom: 'clamp(48px, 6vw, 64px)',
          }}
        >
          À propos
        </h1>

        <section aria-labelledby="section-plateforme" style={{ marginBottom: 'clamp(40px, 5vw, 56px)' }}>
          <h2 id="section-plateforme" style={eyebrow}>
            La plateforme
          </h2>
          <p style={body}>
            Le Méthodic est une plateforme numérique de préparation aux examens de français,
            conçue pour les anglophones qui visent une certification (TCF, TEF, DELF, DALF).
            Elle est construite autour d&apos;une méthode en cinq couches : Le Propos, Le Plan,
            La Construction, Les Pièges Anglais, La Musique.
            L&apos;objectif est de former à la production, non à la traduction.
          </p>
        </section>

        <hr style={rule} />

        <section aria-labelledby="section-fondateur" style={{ marginBottom: 'clamp(40px, 5vw, 56px)' }}>
          <h2 id="section-fondateur" style={eyebrow}>
            Le fondateur
          </h2>
          <p style={body}>
            Chadi est tuteur de français avec plus de 7 000 heures d&apos;enseignement auprès
            d&apos;anglophones, dont une large part consacrée à la préparation aux examens oraux.
            Il est co-fondateur de Book-Lab, un catalogue d&apos;édition francophone.
            La méthode en cinq couches est issue de cette expérience accumulée en situation réelle.
          </p>
        </section>

        <hr style={rule} />

        <section aria-labelledby="section-coaching">
          <h2 id="section-coaching" style={eyebrow}>
            Le coaching un-à-un
          </h2>
          <p style={{ ...body, marginBottom: 32 }}>
            La plateforme est entièrement numérique et en libre-service : chaque apprenant progresse
            à son rythme. Pour ceux qui souhaitent un accompagnement humain en parallèle, Chadi
            continue à enseigner sur Preply. Les cours particuliers sont indépendants de la
            plateforme et se réservent directement sur son profil.
          </p>
          <a
            href={preplyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ed-btn-press"
            style={{
              display: 'inline-block',
              padding: '0 32px',
              height: 56,
              lineHeight: '56px',
              backgroundColor: 'var(--cta-primary)',
              color: '#FFFFFF',
              borderRadius: 4,
              fontFamily: UI,
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: '0',
              textDecoration: 'none',
              transition: 'background-color 200ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          >
            Prendre un cours sur Preply
          </a>
        </section>
      </div>
    </main>
  )
}
