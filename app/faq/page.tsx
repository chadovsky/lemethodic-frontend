import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'Questions fréquentes | Le Méthodic',
  description:
    'Réponses aux questions sur la méthode en cinq couches, les examens couverts, les tarifs et les prérequis techniques.',
  alternates: { canonical: '/faq' },
}

const DISPLAY = 'var(--f-display), Georgia, serif'
const UI = 'var(--f-ui), system-ui, sans-serif'

type FAQItem = { q: string; a: ReactNode }

const FAQ: FAQItem[] = [
  {
    q: 'Comment fonctionne la méthode en cinq couches ?',
    a: "La méthode Le Méthodic décompose chaque production en cinq couches travaillées successivement : Le Propos (l'idée centrale et la position), Le Plan (la structure argumentative), La Construction (la syntaxe et les connecteurs), Les Pièges Anglais (les interférences de l'anglais à corriger), et La Musique (le rythme, la prosodie, l'intonation). Chaque couche se maîtrise séparément avant d'être combinée en une production fluide et naturelle.",
  },
  {
    q: 'Quels examens sont couverts par la plateforme ?',
    a: 'Le TCF Canada est l\'examen actif : toutes les tâches, tous les niveaux de A2 à C2. Les parcours TEF, DALF, DELF et Français Général sont en construction et arriveront progressivement. La méthode en cinq couches est portable vers tous ces examens car elle cible la production, pas les grilles spécifiques.',
  },
  {
    q: 'Comment les niveaux CEFR et CLB sont-ils organisés dans la plateforme ?',
    a: 'Chaque tâche est étiquetée avec son niveau CEFR (A2 à C2) et son équivalent CLB pour le Canada. Le tableau de bord affiche le niveau actuel, le seuil cible, et l\'écart à combler. Le parcours s\'adapte au profil sélectionné lors de l\'onboarding : examen, seuil cible, date d\'examen.',
  },
  {
    q: 'Comment sont structurées les séances de travail ?',
    a: 'Une séance type dure 20 à 40 minutes : écoute d\'un modèle calibré au niveau cible, analyse couche par couche, production guidée avec retour audio, puis validation. Le rythme recommandé est de quatre à cinq séances par semaine. La plateforme suit la progression et suggère la prochaine tâche automatiquement.',
  },
  {
    q: 'Comment fonctionne le coaching un-à-un sur Preply ?',
    a: (
      <>
        Le coaching un-à-un est proposé en dehors de la plateforme, directement sur le profil
        Preply du fondateur. C&apos;est un complément pour les apprenants qui souhaitent un
        retour personnalisé en temps réel.{' '}
        <Link href="/a-propos" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
          Consultez la page À propos
        </Link>{' '}
        pour les détails.
      </>
    ),
  },
  {
    q: 'Quels sont les tarifs ?',
    a: (
      <>
        Un accès gratuit est disponible sans carte bancaire (CLB Read et une traversée d&apos;île
        complète). Les plans payants Core (29€/mois) et Sprint (179€ pour 6 à 8 semaines) arrivent
        bientôt.{' '}
        <Link href="/tarifs" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
          Voir le détail sur la page Tarifs
        </Link>
        .
      </>
    ),
  },
  {
    q: 'Quels sont les prérequis techniques ?',
    a: 'Un microphone fonctionnel est nécessaire pour les tâches d\'expression orale : le micro intégré d\'un ordinateur suffit, un casque améliore la qualité. La plateforme fonctionne dans tout navigateur moderne (Chrome, Firefox, Safari, Edge). Aucune installation n\'est requise.',
  },
  {
    q: 'Quelle est la politique de remboursement ?',
    a: 'Remboursement complet dans les 14 jours suivant le premier paiement, sans condition. Pour toute demande, utilisez le formulaire de contact ou l\'adresse courriel indiquée dans les conditions d\'utilisation.',
  },
  {
    q: 'Faut-il déjà parler français pour commencer ?',
    a: 'Non. La plateforme accueille les apprenants à partir du niveau A2 (débutant intermédiaire). Les explications de méthode sont disponibles en anglais pour faciliter la transition.',
  },
  {
    q: 'La plateforme couvre-t-elle aussi la compréhension orale et écrite ?',
    a: 'La méthode se concentre sur la production (expression orale et écrite), la compétence la plus différenciante pour les anglophones aux examens. Des ressources de compréhension (La Bibliothèque) complètent le parcours pour les apprenants qui souhaitent travailler toutes les composantes.',
  },
]

export default function FAQPage() {
  return (
    <main className="ed-page-enter" style={{ backgroundColor: 'var(--paper)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: 'clamp(64px, 8vw, 96px) clamp(24px, 5vw, 48px)',
        }}
      >
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: 'var(--ink)',
            margin: 0,
            marginBottom: 'clamp(40px, 5vw, 56px)',
          }}
        >
          Questions fréquentes
        </h1>

        <Accordion type="multiple">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>
                <span
                  style={{
                    fontFamily: UI,
                    fontWeight: 600,
                    fontSize: 'clamp(0.9375rem, 2vw, 1.0625rem)',
                    color: 'var(--ink)',
                    lineHeight: 1.4,
                    textAlign: 'left',
                  }}
                >
                  {item.q}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div
                  style={{
                    fontFamily: UI,
                    fontWeight: 400,
                    fontSize: '0.9375rem',
                    lineHeight: 1.75,
                    color: 'var(--ink-soft)',
                  }}
                >
                  {item.a}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </main>
  )
}
