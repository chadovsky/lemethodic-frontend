import type { CSSProperties } from 'react'

// F-483 — La Méthode 5-couche visualizer.
//
// The five couches are the lens over Beacco that defines the method; they must
// be visible in-product (launch criterion). Rendered with the uiverse skewed-
// stack technique (CSS skewY stack + ::before/::after 3D faces; styles live in
// app/globals.css under the F-483 block). Each couche shows a DM Mono uppercase
// eyebrow above an Inter extrabold How-to phrase, both riding the stack skew so
// the type lies on the isometric plane.
//
// Colours are wired to the centralized sky tokens (front / side / top per couche)
// so no raw hex sits in the markup. Copy + ramp are placeholders; Chadi refines
// on preview. Skewed-stack technique by andrew-demchenk0 on Uiverse.io (MIT).

type Couche = {
  eyebrow: string
  headline: string
  front: string // front-face tone (sky token)
  side: string // left/depth-face tone (sky token)
  top: string // top-face tone (sky token)
}

const COUCHES: Couche[] = [
  {
    eyebrow: 'Le Propos',
    headline: 'How to say what you actually mean',
    front: 'var(--couche-ramp-1)',
    side: 'var(--couche-side-1)',
    top: 'var(--couche-top-1)',
  },
  {
    eyebrow: 'Le Plan',
    headline: 'How to organize your ideas in French',
    front: 'var(--couche-ramp-2)',
    side: 'var(--couche-side-2)',
    top: 'var(--couche-top-2)',
  },
  {
    eyebrow: 'La Construction',
    headline: 'How to build sentences that hold up',
    front: 'var(--couche-ramp-3)',
    side: 'var(--couche-side-3)',
    top: 'var(--couche-top-3)',
  },
  {
    eyebrow: 'Les Pièges Anglais',
    headline: 'How to dodge the English traps',
    front: 'var(--couche-ramp-4)',
    side: 'var(--couche-side-4)',
    top: 'var(--couche-top-4)',
  },
  {
    eyebrow: 'La Musique',
    headline: 'How to sound native, not assembled',
    front: 'var(--couche-ramp-5)',
    side: 'var(--couche-side-5)',
    top: 'var(--couche-top-5)',
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

      <div className="couche-viz">
        <ul
          className="couche-stack"
          role="list"
          aria-label="Les cinq couches de La Méthode"
        >
          {COUCHES.map((couche, i) => (
            <li
              key={couche.eyebrow}
              style={
                {
                  ['--i']: String(i + 1),
                  ['--front']: couche.front,
                  ['--side']: couche.side,
                  ['--top']: couche.top,
                } as CSSProperties
              }
            >
              <span className="couche-ey" data-testid="couche-stack-eyebrow">
                {couche.eyebrow}
              </span>
              <span className="couche-ph" data-testid="couche-stack-headline">
                {couche.headline}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
