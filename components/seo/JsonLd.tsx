const BASE = 'https://lemethodic.com'

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Le Methodic',
    url: BASE,
    description:
      'A grammar-first French-learning method for anglophones, built by the author of 28 French linguistics books.',
    sameAs: [],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function CourseJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'TCF Canada Preparation - Le Methodic',
    description:
      'Structured, method-based oral and written exam prep for anglophone candidates targeting TCF Canada for Quebec Permanent Residency.',
    url: BASE,
    provider: {
      '@type': 'Organization',
      name: 'Le Methodic',
      url: BASE,
    },
    educationalLevel: 'B1 to B2+ French (CEFR)',
    inLanguage: 'fr-CA',
    teaches: [
      'TCF Canada oral expression',
      'TCF Canada written expression',
      'TCF Canada oral comprehension',
      'TCF Canada written comprehension',
    ],
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      inLanguage: 'en',
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

const FAQ_ITEMS = [
  {
    question: 'What is TCF Canada?',
    answer:
      'TCF Canada (Test de Connaissance du Francais pour le Canada) is the French language proficiency test required for Quebec immigration (QSWP, PEQ) and Canadian citizenship. Scores map directly to Canadian Language Benchmarks (CLB).',
  },
  {
    question: 'Who is Le Methodic for?',
    answer:
      'Le Methodic is built for anglophone candidates who need to pass TCF Canada or TEF Canada for Quebec Permanent Residency. The curriculum assumes English as a first language and focuses on the exam sections anglophones find hardest: oral expression and reading comprehension.',
  },
  {
    question: 'What CLB score do I need for Quebec PR?',
    answer:
      'For the Quebec Skilled Worker Program (QSWP), most categories require at least CLB 7 (roughly B2). For PEQ (Programme de l\'experience quebecoise), requirements range from CLB 4 to 7 depending on your situation. Le Methodic\'s CLB mapping tool shows exactly where your TCF scores land.',
  },
  {
    question: 'How is Le Methodic different from other exam prep tools?',
    answer:
      'Le Methodic is built around La Methode, a structured framework for anglophone learners targeting TCF Canada. Every exercise maps to the exam rubric and CLB scale, so each practice session has a clear score impact instead of generic French practice.',
  },
  {
    question: 'Does Le Methodic cover oral expression?',
    answer:
      'Yes. Oral expression (Tache 1, 2, and 3) is the hardest section for anglophones and is the core of Le Methodic. The platform includes AI-scored practice sessions for all three oral tasks with feedback aligned to the TCF Canada rubric.',
  },
]

export function FaqJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
