import type { CSSProperties } from 'react'

// F-483 — La Méthode 5-couche visualizer, SVG rebuild.
//
// The five couches are the lens over Beacco that defines the method; they must
// be visible in-product (launch criterion). Rendered as one isometric 3D block
// built from exact SVG polygons (replacing the prior CSS skew + pseudo-element
// build, which left a white wedge, soft corners, and seam leaks). Polygons make
// every edge crisp and leave no canvas gap by construction.
//
// Geometry is driven from the parameters below (coordinates verified against the
// F-483 brief). Colours come from the sky tokens in app/globals.css. Copy + ramp
// are placeholders; Chadi refines on preview.

type Couche = { eyebrow: string; headline: string }

const COUCHES: Couche[] = [
  { eyebrow: 'Le Propos', headline: 'How to say what you actually mean' },
  { eyebrow: 'Le Plan', headline: 'How to organize your ideas in French' },
  { eyebrow: 'La Construction', headline: 'How to build sentences that hold up' },
  { eyebrow: 'Les Pièges Anglais', headline: 'How to dodge the English traps' },
  { eyebrow: 'La Musique', headline: 'How to sound native, not assembled' },
]

// Geometry parameters — everything derives from these (points are exact).
const K = 0.2 //            shear slope: faces rise 0.2px per px to the right
const DX = -20 //           depth vector x (back is up-left)
const DY = -14 //           depth vector y
const X0 = 140 //           shared left edge for all five couches
const Y0 = 120 //           top of couche 0
const H = 72 //             box height
const P = 72 //             vertical pitch (flush — shared edges)
const W0 = 300 //           width of couche 0
const WSTEP = 26 //         each lower box grows this much wider (rightward fan)

const pts = (p: number[][]) => p.map(([x, y]) => `${x},${y}`).join(' ')

function geometry(i: number) {
  const ay = Y0 + i * P
  const w = W0 + WSTEP * i
  const bx = X0 + w
  const by = ay - K * w
  return {
    // Front face left edge nudged 1px left (to X0-1) so anti-aliasing leaves no
    // hairline against the side wall.
    front: pts([
      [X0 - 1, ay],
      [bx, by],
      [bx, by + H],
      [X0 - 1, ay + H],
    ]),
    // Side / wall face — tiles seamlessly into the next one (shared edges).
    side: pts([
      [X0, ay],
      [X0, ay + H],
      [X0 + DX, ay + H + DY],
      [X0 + DX, ay + DY],
    ]),
    ty: Y0 + 6 + i * P, // text-group vertical offset
  }
}

// Couche 0 top cap (the others are flush under the box above).
const CAP = pts([
  [X0, Y0],
  [X0 + W0, Y0 - K * W0],
  [X0 + W0 + DX, Y0 - K * W0 + DY],
  [X0 + DX, Y0 + DY],
])

const INTER = 'var(--f-en), "Inter", -apple-system, system-ui, sans-serif'
const DM_MONO = 'var(--f-mono), "DM Mono", ui-monospace, monospace'

const EYEBROW_STYLE: CSSProperties = {
  fontFamily: DM_MONO,
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  fill: 'var(--couche-ink)',
}
const PHRASE_STYLE: CSSProperties = {
  // ~17px target; 16px + a hair of negative tracking so the longest phrase
  // ("How to say what you actually mean") fits inside the narrowest (top) face
  // at the brief's locked geometry instead of overhanging onto the canvas.
  fontFamily: INTER,
  fontSize: '16px',
  fontWeight: 800,
  letterSpacing: '-0.01em',
  fill: 'var(--couche-ink)',
}

export default function CoucheStack() {
  const geo = COUCHES.map((c, i) => ({ ...c, ...geometry(i) }))

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

      <div style={{ width: '100%', maxWidth: 680 }}>
        <svg
          data-testid="couche-stack-svg"
          width="100%"
          viewBox="0 0 680 520"
          role="img"
          aria-labelledby="couche-svg-title couche-svg-desc"
          style={{ display: 'block', height: 'auto' }}
        >
          <title id="couche-svg-title">The method, in five layers</title>
          <desc id="couche-svg-desc">
            {COUCHES.map((c) => `${c.eyebrow}: ${c.headline}`).join('. ') + '.'}
          </desc>

          {/* 1. Side faces first — the continuous left wall. */}
          {geo.map((g, i) => (
            <polygon
              key={`side-${i}`}
              points={g.side}
              style={{ fill: `var(--couche-side-${i + 1})` }}
            />
          ))}

          {/* 2. Couche 0 top cap. */}
          <polygon points={CAP} style={{ fill: 'var(--couche-top-1)' }} />

          {/* 3. Front faces (left edge extended 1px over the wall). */}
          {geo.map((g, i) => (
            <polygon
              key={`front-${i}`}
              points={g.front}
              style={{ fill: `var(--couche-ramp-${i + 1})` }}
            />
          ))}

          {/* 4. Text groups — sheared by the same -0.2 slope so the type lies on
              the isometric plane and rises to the right with the box. */}
          {geo.map((g, i) => (
            <g key={`text-${i}`} transform={`matrix(1,-0.2,0,1,162,${g.ty})`}>
              <text x="0" y="20" data-testid="couche-stack-eyebrow" style={EYEBROW_STYLE}>
                {g.eyebrow}
              </text>
              <text x="0" y="42" data-testid="couche-stack-headline" style={PHRASE_STYLE}>
                {g.headline}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  )
}
