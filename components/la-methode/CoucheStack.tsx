import type { CSSProperties } from 'react'

// F-483 — La Méthode 5-couche skewed-stack visualizer.
//
// The five couches are the lens over Beacco that defines the method; they must
// be visible in-product (launch criterion). This renders them as stacked strata
// using the uiverse skewY effect, reskinned to v3 (coral ramp + Inter / DM Mono;
// styles live in app/globals.css under the F-483 block). The audience is
// anglophone, so each band LEADS with a plain How-to headline; the French couche
// name is a small eyebrow above it for method identity.
//
// Copy and the coral ramp are placeholders — Chadi refines both on preview.

type Couche = {
  eyebrow: string
  headline: string
  detail: string
  ramp: string
}

const COUCHES: Couche[] = [
  {
    eyebrow: 'Le Propos',
    headline: 'How to say what you actually mean',
    detail: 'The intent behind your words, shaped before you speak.',
    ramp: 'var(--couche-ramp-1)',
  },
  {
    eyebrow: 'Le Plan',
    headline: 'How to organize your ideas in French',
    detail: 'The order and flow that make you sound structured, not scattered.',
    ramp: 'var(--couche-ramp-2)',
  },
  {
    eyebrow: 'La Construction',
    headline: 'How to build sentences that hold up',
    detail: 'The grammar and syntax that carry the meaning correctly.',
    ramp: 'var(--couche-ramp-3)',
  },
  {
    eyebrow: 'Les Pièges Anglais',
    headline: 'How to dodge the English traps',
    detail: 'Faux amis, calques, and the reflexes that give anglophones away.',
    ramp: 'var(--couche-ramp-4)',
  },
  {
    eyebrow: 'La Musique',
    headline: 'How to sound native, not assembled',
    detail: 'Rhythm, stress, and intonation, the layer most learners skip.',
    ramp: 'var(--couche-ramp-5)',
  },
]

const INTER = 'var(--f-en), "Inter", -apple-system, system-ui, sans-serif'

export default function CoucheStack() {
  return (
    <section
      data-testid="couche-stack"
      aria-labelledby="couche-stack-heading"
      style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(20px, 3vw, 32px)' }}
    >
      <div style={{ maxWidth: 720 }}>
        <h2
          id="couche-stack-heading"
          style={{
            fontFamily: INTER,
            fontWeight: 600,
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--heading)',
            margin: 0,
          }}
        >
          The method, in five layers
        </h2>
        <p
          style={{
            fontFamily: INTER,
            fontWeight: 400,
            fontSize: '1.0625rem',
            lineHeight: 1.55,
            color: 'var(--text-muted)',
            margin: '12px 0 0',
            maxWidth: 600,
          }}
        >
          Every strong oral answer is built from five couches. Each layer is one
          skill you can train.
        </p>
      </div>

      <div className="couche-stack-frame">
        <ul
          className="couche-stack"
          role="list"
          aria-label="Les cinq couches de La Méthode"
        >
          {COUCHES.map((couche) => (
            <li key={couche.eyebrow} className="couche-stack__item">
              <div
                className="couche-layer"
                data-testid="couche-stack-layer"
                data-couche={couche.eyebrow}
                role="group"
                aria-label={`${couche.eyebrow}: ${couche.headline}`}
                tabIndex={0}
                style={{ ['--layer-bg' as string]: couche.ramp } as CSSProperties}
              >
                <div className="couche-layer__content">
                  <span
                    className="couche-layer__eyebrow"
                    data-testid="couche-stack-eyebrow"
                  >
                    {couche.eyebrow}
                  </span>
                  <h3
                    className="couche-layer__headline"
                    data-testid="couche-stack-headline"
                  >
                    {couche.headline}
                  </h3>
                  <div className="couche-layer__detail-wrap">
                    <div
                      className="couche-layer__detail-inner"
                      data-testid="couche-stack-detail"
                    >
                      <p className="couche-layer__detail">{couche.detail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
