import { notFound } from 'next/navigation'
import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, DISPLAY_FONT } from '@/lib/typography'

export default function BientotDevPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  const cardStyle = {
    padding: '16px 20px',
    borderRadius: 8,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--rule-default)',
    fontFamily: SANS_FONT,
    fontSize: '0.9375rem',
    color: 'var(--text-primary)',
  }

  const h2Style = {
    fontFamily: DISPLAY_FONT,
    fontSize: '1.25rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: 'var(--text-primary)',
    margin: 0,
    marginBottom: 16,
  }

  const h3Style = {
    fontFamily: SANS_FONT,
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    margin: 0,
    marginBottom: 12,
  }

  const eyebrowStyle = {
    fontFamily: SANS_FONT,
    fontSize: '0.6875rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    marginBottom: 24,
  }

  const livePhrases = ['Ça tombe à pic', 'Avoir le cafard', 'Se débrouiller']
  const placeholderRows = [1, 2, 3]

  return (
    <main
      style={{
        padding: '48px 32px',
        maxWidth: 1000,
        margin: '0 auto',
        background: 'var(--bg-canvas)',
        minHeight: '100vh',
      }}
    >
      <p style={eyebrowStyle}>Dev preview / F-359</p>

      <h1
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: 'clamp(24px, 3vw, 36px)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          margin: 0,
          marginBottom: 8,
        }}
      >
        Bientôt pattern
      </h1>
      <p
        style={{
          fontFamily: SANS_FONT,
          fontSize: '0.9375rem',
          color: 'var(--text-secondary)',
          margin: 0,
          marginBottom: 56,
        }}
      >
        Foundation only. Not applied to any existing surface. Covers both level variants.
      </p>

      {/* Surface variant */}
      <section style={{ marginBottom: 64 }}>
        <h2 style={h2Style}>
          <code style={{ fontFamily: 'monospace', fontSize: '1rem' }}>level=&quot;surface&quot;</code>
        </h2>
        <p style={{ fontFamily: SANS_FONT, fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 24, marginTop: 0 }}>
          Pill anchors top-right of the full content area. Label sits below the page heading.
        </p>

        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--rule-default)',
            borderRadius: 12,
            padding: 32,
          }}
        >
          <h3 style={{ ...h2Style, marginBottom: 0 }}>Progrès détaillé</h3>
          <Bientot
            level="surface"
            label="Vos statistiques d'apprentissage détaillées seront accessibles ici dès que cette section sera disponible."
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 16,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  style={{
                    height: 100,
                    borderRadius: 8,
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--rule-default)',
                  }}
                />
              ))}
            </div>
          </Bientot>
        </div>
      </section>

      {/* Section variant: live vs bientot side by side */}
      <section>
        <h2 style={h2Style}>
          <code style={{ fontFamily: 'monospace', fontSize: '1rem' }}>level=&quot;section&quot;</code>{' '}
          <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>
            (live vs bientôt, side by side)
          </span>
        </h2>
        <p style={{ fontFamily: SANS_FONT, fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 24, marginTop: 0 }}>
          Pill anchors top-right of the wrapped element. Label sits immediately under the section heading.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Live section */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--rule-default)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h3 style={h3Style}>Vocabulaire actif</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {livePhrases.map((phrase) => (
                <div key={phrase} style={cardStyle}>
                  {phrase}
                </div>
              ))}
            </div>
          </div>

          {/* Bientot section */}
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--rule-default)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <h3 style={h3Style}>Compréhension écrite</h3>
            <Bientot
              level="section"
              label="Les exercices de compréhension écrite seront disponibles prochainement."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {placeholderRows.map((n) => (
                  <div key={n} style={cardStyle}>
                    Article {n}
                  </div>
                ))}
              </div>
            </Bientot>
          </div>
        </div>
      </section>
    </main>
  )
}
