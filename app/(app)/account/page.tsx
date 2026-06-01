import { SERIF_FONT, SANS_FONT } from '@/lib/typography'

export const metadata = {
  title: 'Compte | Le Méthodic',
}

export default function AccountPage() {
  return (
    <section style={{ paddingTop: 16 }}>
      <h1
        style={{
          fontFamily: SERIF_FONT,
          fontWeight: 500,
          fontSize: 'clamp(28px, 3.5vw, 44px)',
          lineHeight: 1.15,
          letterSpacing: '-0.015em',
          color: 'var(--text-primary)',
          margin: '0 0 12px',
        }}
      >
        Compte
      </h1>
      <p
        style={{
          fontFamily: SANS_FONT,
          fontWeight: 400,
          fontSize: '1rem',
          lineHeight: 1.55,
          color: 'var(--text-muted)',
          margin: 0,
        }}
      >
        Bientôt disponible.
      </p>
    </section>
  )
}
