import type { CSSProperties } from 'react'

// F-483 — La Méthode 5-couche isometric stack visualizer.
//
// The five couches are the lens over Beacco that defines the method; they must
// be visible in-product (launch criterion). This renders them as one flush,
// contiguous isometric block using the uiverse skewY effect, reskinned to a sky
// ramp (styles live in app/globals.css under the F-483 block).
//
// Each layer shows a DM Mono uppercase couche eyebrow above an Inter extrabold
// How-to phrase; both ride a counter-skewed wrapper so the type renders upright.
// The bars are driven from the single COUCHES array below (eyebrow + phrase +
// front-fill token + side-shade token), so no raw hex sits in the markup. Copy
// and the exact sky ramp are placeholders; Chadi refines both on preview.

type Couche = {
  eyebrow: string // couche name (uppercased via CSS)
  headline: string // How-to phrase
  front: string // front-face fill (sky ramp token)
  side: string // depth / side-face shade (sky ramp token)
}

const COUCHES: Couche[] = [
  {
    eyebrow: 'Le Propos',
    headline: 'How to say what you actually mean',
    front: 'var(--couche-ramp-1)',
    side: 'var(--couche-side-1)',
  },
  {
    eyebrow: 'Le Plan',
    headline: 'How to organize your ideas in French',
    front: 'var(--couche-ramp-2)',
    side: 'var(--couche-side-2)',
  },
  {
    eyebrow: 'La Construction',
    headline: 'How to build sentences that hold up',
    front: 'var(--couche-ramp-3)',
    side: 'var(--couche-side-3)',
  },
  {
    eyebrow: 'Les Pièges Anglais',
    headline: 'How to dodge the English traps',
    front: 'var(--couche-ramp-4)',
    side: 'var(--couche-side-4)',
  },
  {
    eyebrow: 'La Musique',
    headline: 'How to sound native, not assembled',
    front: 'var(--couche-ramp-5)',
    side: 'var(--couche-side-5)',
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
            fontWeight: 800,
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
          {COUCHES.map((couche, i) => (
            <li
              key={couche.eyebrow}
              className="couche-stack__item"
              style={{ ['--i' as string]: i + 1 } as CSSProperties}
            >
              <div
                className="couche-layer"
                data-testid="couche-stack-layer"
                data-couche={couche.eyebrow}
                style={
                  {
                    ['--face-top']: couche.front,
                    ['--face-side']: couche.side,
                  } as CSSProperties
                }
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
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
