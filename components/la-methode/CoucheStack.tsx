import type { CSSProperties } from 'react'

// F-483 — La Méthode 5-couche isometric 3D stack visualizer.
//
// The five couches are the lens over Beacco that defines the method; they must
// be visible in-product (launch criterion). This renders them as an isometric
// 3D stack using the uiverse skewY effect, reskinned to v3 (coral ramp + Inter;
// styles live in app/globals.css under the F-483 block).
//
// Each block carries ONE short How-to headline that lies ON the slanted face
// (it inherits the wrapper skew, like the reference). No couche-name eyebrows,
// no detail line on the face — one clean line per block. Copy and the coral ramp
// are placeholders; Chadi refines both on preview.

type Couche = {
  headline: string
  face: string // top-face fill (coral ramp token)
  text: 'black' | 'white' // AA-safe text color for that step
}

// Light at the top, deep at the bottom. The upper three steps take dark text,
// the lower two take light text, so the headline clears 4.5:1 on every layer.
const COUCHES: Couche[] = [
  { headline: 'How to say what you actually mean', face: 'var(--couche-ramp-1)', text: 'black' },
  { headline: 'How to organize your ideas in French', face: 'var(--couche-ramp-2)', text: 'black' },
  { headline: 'How to build sentences that hold up', face: 'var(--couche-ramp-3)', text: 'black' },
  { headline: 'How to dodge the English traps', face: 'var(--couche-ramp-4)', text: 'white' },
  { headline: 'How to sound native, not assembled', face: 'var(--couche-ramp-5)', text: 'white' },
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
          {COUCHES.map((couche, i) => (
            <li
              key={couche.headline}
              className="couche-stack__item"
              style={{ ['--i' as string]: i + 1 } as CSSProperties}
            >
              <div
                className="couche-layer"
                data-testid="couche-stack-layer"
                style={
                  {
                    ['--face-top']: couche.face,
                    ['--face-text']: couche.text,
                  } as CSSProperties
                }
              >
                <h3
                  className="couche-layer__headline"
                  data-testid="couche-stack-headline"
                >
                  {couche.headline}
                </h3>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
