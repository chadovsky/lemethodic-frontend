import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

const COUCHE_NAMES = [
  'Le Propos',
  'Le Plan',
  'La Construction',
  'Les Pièges Anglais',
  'La Musique',
] as const

export default function CouchesPreview() {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--rule-default)',
        borderRadius: 4,
        padding: 'clamp(20px, 2vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <h2
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 500,
          fontSize: 'clamp(22px, 2.6vw, 30px)',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Les 5 couches
      </h2>
      <p
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: '0.9375rem',
          lineHeight: 1.55,
          color: 'var(--text-muted)',
          margin: 0,
          maxWidth: 640,
        }}
      >
        Votre diagnostic produit un score sur les 5 couches.
      </p>
      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 14px',
          fontFamily: SANS_FONT,
          fontWeight: 500,
          fontSize: '0.9375rem',
          color: 'var(--text-primary)',
        }}
      >
        {COUCHE_NAMES.map((name, i) => (
          <li
            key={name}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
          >
            <span
              aria-hidden="true"
              style={{
                fontFamily: SERIF_FONT,
                fontWeight: 500,
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                minWidth: '1ch',
              }}
            >
              {i + 1}.
            </span>
            <span>{name}</span>
            {i < COUCHE_NAMES.length - 1 ? (
              <span
                aria-hidden="true"
                style={{ color: 'var(--text-muted)', marginLeft: 4 }}
              >
                ·
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  )
}
