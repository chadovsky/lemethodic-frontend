import Link from 'next/link'
import { BOOKS } from '@/lib/store/books'
import { DISPLAY_FONT, SANS_FONT } from '@/lib/typography'
import StoreCatalog from '@/components/store/StoreCatalog'

export const metadata = {
  title: 'La Librairie | Le Méthodic',
  description:
    'Manuels, audio, téléchargements et ressources gratuites pour préparer le TCF et les examens de français.',
}

export default function LibrairiePage() {
  return (
    <main
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: 'clamp(40px, 7vw, 72px) clamp(24px, 5vw, 80px) 96px',
      }}
    >
      <header style={{ maxWidth: 680, marginBottom: 'clamp(32px, 5vw, 48px)' }}>
        <p
          style={{
            fontFamily: SANS_FONT,
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            margin: '0 0 14px',
          }}
        >
          La Librairie
        </p>
        <h1
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 400,
            color: 'var(--text-primary)',
            margin: '0 0 18px',
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
          }}
        >
          Les ouvrages qui font progresser
        </h1>
        <p
          style={{
            fontFamily: SANS_FONT,
            fontSize: '1.0625rem',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            margin: 0,
          }}
        >
          Manuels, contenus audio, fiches à télécharger et ressources gratuites, conçus pour la
          préparation aux examens. Distinct de{' '}
          <Link
            href="/la-bibliotheque"
            style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            la bibliothèque
          </Link>{' '}
          de vocabulaire intégrée au parcours.
        </p>
      </header>

      <StoreCatalog books={BOOKS} />
    </main>
  )
}
