import type { Metadata } from 'next'
import Bientot from '@/components/bientot/Bientot'

export const metadata: Metadata = {
  title: 'Le Blog | Le Méthodic',
  description:
    'Articles sur la méthode, la préparation aux examens de français, et les erreurs typiques des anglophones.',
  alternates: { canonical: '/blog' },
}

const DISPLAY = 'var(--f-display), Georgia, serif'
const UI = 'var(--f-ui), system-ui, sans-serif'
const MONO = 'var(--f-mono), monospace'

const PLACEHOLDER_POSTS = [
  {
    category: 'Méthode',
    title: 'Comprendre la couche du Propos : poser sa position avant de construire',
    excerpt:
      'La première couche de la méthode Le Méthodic est souvent celle que les apprenants sous-estiment. Avant la syntaxe, avant les connecteurs, il faut une idée centrale claire.',
    date: 'À venir',
  },
  {
    category: 'Pièges Anglais',
    title: 'Les faux amis les plus fréquents pour les anglophones au TCF Canada',
    excerpt:
      'Sensible, actuellement, assister : trois mots qui trahissent l\'anglophone au moment précis où il croit parler couramment. Un tour d\'horizon des pièges les plus récurrents.',
    date: 'À venir',
  },
  {
    category: 'TCF Canada',
    title: 'TCF Canada oral B2 : comment structurer une réponse en deux minutes',
    excerpt:
      'L\'examinateur vous pose une question ouverte. Vous avez deux minutes. Voici comment la couche du Plan vous donne une structure reproductible quel que soit le sujet.',
    date: 'À venir',
  },
  {
    category: 'La Musique',
    title: 'Rythme et accentuation en français : ce que l\'anglais vous fait croire à tort',
    excerpt:
      'L\'anglais accentue les syllabes de manière variable et imprévisible. Le français non. Comprendre cette différence fondamentale change la prosodie immédiatement.',
    date: 'À venir',
  },
]

function PostCard({
  category,
  title,
  excerpt,
  date,
}: {
  category: string
  title: string
  excerpt: string
  date: string
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--paper)',
        border: '1px solid var(--rule)',
        borderRadius: 8,
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontWeight: 500,
          fontSize: '0.6875rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
        }}
      >
        {category}
      </span>
      <h3
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: '1.0625rem',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          color: 'var(--ink)',
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: UI,
          fontWeight: 400,
          fontSize: '0.875rem',
          lineHeight: 1.65,
          color: 'var(--ink-soft)',
          margin: 0,
          flexGrow: 1,
        }}
      >
        {excerpt}
      </p>
      <span
        style={{
          fontFamily: MONO,
          fontWeight: 400,
          fontSize: '0.75rem',
          color: 'var(--ink-faint)',
          marginTop: 4,
        }}
      >
        {date}
      </span>
    </div>
  )
}

export default function BlogPage() {
  return (
    <main className="ed-page-enter" style={{ backgroundColor: 'var(--paper)', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 1024,
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
            marginBottom: 'clamp(40px, 6vw, 56px)',
          }}
        >
          Le Blog
        </h1>

        <Bientot level="surface" label="Les premiers articles arrivent bientôt.">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {PLACEHOLDER_POSTS.map((post) => (
              <PostCard key={post.title} {...post} />
            ))}
          </div>
        </Bientot>
      </div>
    </main>
  )
}
