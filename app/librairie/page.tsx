import Link from 'next/link'
import Bientot from '@/components/bientot/Bientot'
import { SANS_FONT, SERIF_FONT } from '@/lib/typography'

export const metadata = {
  title: 'La Librairie | Le Méthodic',
}

const CATEGORIES = [
  {
    key: 'livres',
    label: 'Livres',
    href: '/librairie/livres',
    description: 'Manuels, guides et ouvrages de référence du catalogue Book-Lab.',
    bientotLabel: 'Les livres du catalogue Book-Lab arrivent bientôt.',
  },
  {
    key: 'audio',
    label: 'Audio',
    href: '/librairie/audio',
    description: 'Enregistrements, dialogues et ressources audio complémentaires.',
    bientotLabel: 'Les contenus audio arrivent bientôt.',
  },
  {
    key: 'telechargements',
    label: 'Téléchargements',
    href: '/librairie/telechargements',
    description: 'Fiches, tableaux et documents à télécharger.',
    bientotLabel: 'Les téléchargements arrivent bientôt.',
  },
  {
    key: 'ressources-gratuites',
    label: 'Ressources gratuites',
    href: '/librairie/ressources-gratuites',
    description: 'Contenus gratuits accessibles sans inscription.',
    bientotLabel: 'Les ressources gratuites arrivent bientôt.',
  },
]

export default function LibrairiePage() {
  return (
    <main
      style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: 'clamp(48px, 8vw, 80px) clamp(24px, 5vw, 80px)',
      }}
    >
      <h1
        style={{
          fontFamily: SERIF_FONT,
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 400,
          color: 'var(--lm-text-primary)',
          margin: '0 0 20px',
          letterSpacing: '-0.02em',
        }}
      >
        La Librairie
      </h1>
      <p
        style={{
          fontFamily: SANS_FONT,
          fontSize: '1rem',
          lineHeight: 1.65,
          color: 'var(--lm-text-secondary)',
          maxWidth: 640,
          margin: '0 0 48px',
        }}
      >
        La librairie regroupe les livres, contenus audio, téléchargements et ressources gratuites
        du catalogue Book-Lab. Distinct de{' '}
        <Link
          href="/la-bibliotheque"
          style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}
        >
          /la-bibliotheque
        </Link>{' '}
        qui est l'outil de vocabulaire intégré au parcours.
      </p>

      <div
        className="grid grid-cols-1 md:grid-cols-2"
        style={{ gap: 16 }}
      >
        {CATEGORIES.map((cat) => (
          <Bientot key={cat.key} level="section" label={cat.bientotLabel}>
            <Link
              href={cat.href}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                style={{
                  background: 'var(--lm-bg-surface)',
                  border: '1px solid var(--lm-border-subtle)',
                  borderRadius: 4,
                  padding: '28px 24px',
                }}
              >
                <p
                  style={{
                    fontFamily: SERIF_FONT,
                    fontSize: '1.25rem',
                    fontWeight: 400,
                    color: 'var(--lm-text-primary)',
                    margin: '0 0 8px',
                  }}
                >
                  {cat.label}
                </p>
                <p
                  style={{
                    fontFamily: SANS_FONT,
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    color: 'var(--lm-text-secondary)',
                    margin: 0,
                  }}
                >
                  {cat.description}
                </p>
              </div>
            </Link>
          </Bientot>
        ))}
      </div>
    </main>
  )
}
