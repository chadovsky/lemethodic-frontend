// M-101a — landing page copy. Single source of truth for all en+fr strings
// rendered on / and /fr. Section keys mirror the M-101 doc structure
// (docs/M-101-landing-page-copy.md) so iteration on copy is grep-friendly.
//
// Both languages live side-by-side per section to keep parallel-content
// editing trivial. When the writer updates Section 3's headline, both
// translations are within scrolling distance.

export type Lang = 'en' | 'fr'

export interface I18nString {
  en: string
  fr: string
}

export interface I18nList {
  en: string[]
  fr: string[]
}

// ── Brand + chrome ──────────────────────────────────────────────────────────

export const BRAND = 'LeMethodic'

export const TOGGLE_LABELS: Record<Lang, string> = {
  en: 'EN',
  fr: 'FR',
}

// ── Section 1 — Hero ────────────────────────────────────────────────────────

export const HERO = {
  h1: {
    en: "The TCF Canada speaking exam doesn't reward what you know. It rewards what you can produce in 12 minutes under pressure.",
    fr: "L'examen oral du TCF Canada ne récompense pas ce que vous savez. Il récompense ce que vous pouvez produire en 12 minutes sous pression.",
  } satisfies I18nString,
  subhead: {
    en: 'LeMethodic is exam prep for B1 anglophones who can read French, write French, even understand French — but freeze the moment they have to speak it.',
    fr: "LeMethodic est une préparation d'examen pour anglophones B1 qui lisent, écrivent, et comprennent le français — mais qui se figent au moment de parler.",
  } satisfies I18nString,
  ctaPrimary: {
    en: 'Start the 12-minute diagnostic',
    fr: 'Commencer le diagnostic en 12 minutes',
  } satisfies I18nString,
  ctaSecondary: {
    en: "Free. No card required. You'll know your speaking level in real conditions before you decide anything.",
    fr: 'Gratuit. Sans carte bancaire. Vous saurez votre niveau oral en conditions réelles avant de décider quoi que ce soit.',
  } satisfies I18nString,
}

// ── Section 2 — Problem ─────────────────────────────────────────────────────

export const PROBLEM = {
  heading: {
    en: "You're not stuck because you're bad at French.",
    fr: "Vous n'êtes pas bloqué parce que vous êtes mauvais en français.",
  } satisfies I18nString,
  // Body is split into paragraphs for layout control.
  paragraphs: {
    en: [
      "You hit a wall at B1. Most learners do. It's the moment French stops being forgiving.",
      'You can survive a conversation. You can read articles. You can write structured texts. But when a real French speaker talks at normal speed, or when an examiner asks you to argue a position in 5 minutes — you collapse into safe phrases. Short sentences. Past tense only. The word you needed wasn\'t there when you needed it.',
      "Duolingo, Babbel, even Preply tutoring won't fix this. They were built for a different problem: helping you learn French. You don't need to learn more French. You need to break the wall between knowing French and producing French under exam pressure.",
      'That\'s what LeMethodic does.',
    ],
    fr: [
      "Vous avez frappé un mur au niveau B1. La plupart des apprenants y arrivent. C'est le moment où le français cesse d'être indulgent.",
      "Vous tenez une conversation. Vous lisez des articles. Vous rédigez des textes structurés. Mais quand un francophone parle à vitesse normale, ou quand un examinateur vous demande d'argumenter en 5 minutes — vous vous repliez sur des phrases sûres. Des phrases courtes. Du passé composé partout. Le mot dont vous aviez besoin n'était pas là quand il fallait.",
      "Duolingo, Babbel, même les cours sur Preply ne résoudront pas cela. Ils ont été construits pour un autre problème : vous apprendre le français. Vous n'avez pas besoin d'apprendre plus de français. Vous avez besoin de briser le mur entre savoir le français et le produire sous pression d'examen.",
      "C'est ce que fait LeMethodic.",
    ],
  } satisfies I18nList,
}

// ── Section 3 — Differentiation ─────────────────────────────────────────────

export interface DiffCardCopy {
  title: I18nString
  body: I18nString
}

export const DIFFERENTIATION = {
  heading: {
    en: 'Built specifically for the B1 → B2 wall. Built specifically for English speakers.',
    fr: 'Construit spécifiquement pour le mur B1 → B2. Construit spécifiquement pour les anglophones.',
  } satisfies I18nString,
  cards: [
    {
      title: {
        en: 'Diagnostic-driven, not curriculum-driven',
        fr: 'Diagnostic, pas programme générique',
      },
      body: {
        en: 'Most apps push you through generic lessons. LeMethodic starts with 3 recordings to find your specific gaps — the exact patterns blocking your B2 score. Your path is built from your gaps, not from someone else\'s syllabus.',
        fr: "La plupart des applications vous font suivre des leçons standardisées. LeMethodic commence par 3 enregistrements pour identifier vos lacunes spécifiques — les patterns exacts qui bloquent votre score B2. Votre parcours est construit à partir de vos lacunes, pas d'un programme prédéfini.",
      },
    },
    {
      title: {
        en: 'Anglophone interference, not generic French',
        fr: 'Interférences anglophones, pas français générique',
      },
      body: {
        en: 'Built on 7,000+ hours of teaching English speakers learning French. The mistakes you make aren\'t random. They follow patterns. LeMethodic detects those patterns and trains you out of them — not generic "French grammar," but the specific traps anglophones fall into and never escape.',
        fr: "Construit à partir de plus de 7 000 heures d'enseignement à des anglophones apprenant le français. Les erreurs que vous faites ne sont pas aléatoires. Elles suivent des patterns. LeMethodic détecte ces patterns et vous en sort — pas de la « grammaire française » générique, mais les pièges spécifiques dans lesquels les anglophones tombent et n'arrivent jamais à sortir.",
      },
    },
    {
      title: {
        en: 'Real-time AI speaking feedback',
        fr: 'Feedback IA en temps réel sur l\'oral',
      },
      body: {
        en: "The TCF speaking test is 12 minutes of pressure. You can't simulate that with flashcards. LeMethodic puts you under the same pressure: real prompts, recorded responses, immediate feedback on what an examiner would actually score you on.",
        fr: "L'examen oral du TCF, c'est 12 minutes de pression. On ne simule pas cela avec des flashcards. LeMethodic vous met sous la même pression : prompts réels, réponses enregistrées, feedback immédiat sur ce qu'un examinateur évaluerait vraiment.",
      },
    },
  ] as DiffCardCopy[],
}

// ── Section 4 — How it works ────────────────────────────────────────────────

export interface StepCopy {
  title: I18nString
  body: I18nString
}

export const HOW_IT_WORKS = {
  heading: {
    en: 'Three steps. About 12 minutes to start.',
    fr: 'Trois étapes. Environ 12 minutes pour commencer.',
  } satisfies I18nString,
  steps: [
    {
      title: {
        en: 'The diagnostic (12 minutes)',
        fr: 'Le diagnostic (12 minutes)',
      },
      body: {
        en: 'Three recordings. Three TCF-realistic prompts. Our engine identifies the specific grammar, vocabulary, and structural patterns that are blocking your B2 score.',
        fr: 'Trois enregistrements. Trois prompts réalistes du TCF. Notre moteur identifie les patterns grammaticaux, lexicaux et structurels précis qui bloquent votre score B2.',
      },
    },
    {
      title: {
        en: 'Your path',
        fr: 'Votre parcours',
      },
      body: {
        en: 'You\'re enrolled in the B1 → B2 path: 22 clusters covering every grammar pattern that distinguishes B1 from B2 speech. The diagnostic decides where you start and what you skip.',
        fr: 'Vous êtes inscrit dans le parcours B1 → B2 : 22 clusters couvrant chaque pattern grammatical qui distingue le discours B1 du discours B2. Le diagnostic décide où vous commencez et ce que vous sautez.',
      },
    },
    {
      title: {
        en: 'Real exam pressure, every day',
        fr: 'La pression réelle de l\'examen, chaque jour',
      },
      body: {
        en: 'Daily Tâche simulations under timing constraints. AI feedback on accuracy, fluency, and structural production. Weekly diagnostics to track real progress, not vanity metrics.',
        fr: 'Simulations quotidiennes des Tâches sous contraintes de temps. Feedback IA sur la précision, la fluidité, et la production structurelle. Diagnostics hebdomadaires pour suivre les vrais progrès, pas des métriques cosmétiques.',
      },
    },
  ] as StepCopy[],
}

// ── Section 5 — Pricing ─────────────────────────────────────────────────────

export type PricingTier = 'subscription' | 'sprint' | 'premium'

export interface PricingCardCopy {
  tier: PricingTier
  title: I18nString
  price: I18nString
  priceSubtext: I18nString | null   // e.g. "7-day free trial. Cancel anytime."
  audience: I18nString
  bullets: I18nList
  guarantee: I18nString | null
  ctaLabel: I18nString
  comingSoon: boolean
}

export const PRICING = {
  heading: {
    en: 'Choose your timeline.',
    fr: 'Choisissez votre échéance.',
  } satisfies I18nString,
  cards: [
    {
      tier: 'subscription',
      title: { en: 'Subscription', fr: 'Abonnement' },
      price: { en: '$29/month', fr: '29 $/mois' },
      priceSubtext: {
        en: '7-day free trial. Cancel anytime.',
        fr: 'Essai gratuit de 7 jours. Annulez à tout moment.',
      },
      audience: {
        en: 'For candidates with 3+ months until their exam.',
        fr: 'Pour les candidats avec 3+ mois avant leur examen.',
      },
      bullets: {
        en: [
          'Full B1 → B2 path access',
          'Diagnostic + personalized routing',
          'AI speaking feedback',
          '2 Tâche simulations per week',
          'Monthly progress diagnostics',
        ],
        fr: [
          'Accès complet au parcours B1 → B2',
          'Diagnostic + parcours personnalisé',
          'Feedback IA sur l\'oral',
          '2 simulations de Tâches par semaine',
          'Diagnostics mensuels de progression',
        ],
      },
      guarantee: null,
      ctaLabel: { en: 'Start the diagnostic', fr: 'Commencer le diagnostic' },
      comingSoon: false,
    },
    {
      // M-101a editorial change: Sprint marked "Coming soon" pending Stripe
      // (P-105/P-106) ship. Feature copy stays accurate about what Sprint
      // WILL deliver. CTA changed from "Start the Sprint" to "Join the Sprint
      // waitlist". When Stripe ships, flip comingSoon → false and ctaLabel.
      tier: 'sprint',
      title: { en: 'Final Sprint', fr: 'Le Sprint Final' },
      price: { en: '$199', fr: '199 $' },
      priceSubtext: {
        en: 'One-time payment. 4 weeks of intensified preparation.',
        fr: 'Paiement unique. 4 semaines de préparation intensifiée.',
      },
      audience: {
        en: 'For candidates with 4–8 weeks until their exam.',
        fr: 'Pour les candidats avec 4–8 semaines avant leur examen.',
      },
      bullets: {
        en: [
          'Everything in subscription, accelerated',
          'Daily Tâche simulations under exam timing',
          'Weekly progress diagnostics',
          '3 TCF Canada mock exams (with scoring rubrics)',
          'Downloadable cheat sheets (grammar, vocabulary, exam strategy)',
          'Priority AI processing for faster feedback',
          'Exam-day countdown dashboard',
        ],
        fr: [
          'Tout ce qui est dans l\'abonnement, en accéléré',
          'Simulations quotidiennes des Tâches sous contraintes de temps réel',
          'Diagnostics hebdomadaires',
          '3 examens blancs TCF Canada (avec barèmes de notation)',
          'Fiches récapitulatives téléchargeables (grammaire, vocabulaire, stratégie d\'examen)',
          'Traitement IA prioritaire pour un feedback plus rapide',
          'Tableau de bord du compte à rebours d\'examen',
        ],
      },
      guarantee: {
        en: '14-day money-back guarantee if you\'ve engaged with the program for at least 3 days and it\'s not working for you.',
        fr: 'Garantie de remboursement de 14 jours si vous avez utilisé le programme pendant au moins 3 jours et qu\'il ne fonctionne pas pour vous.',
      },
      ctaLabel: {
        en: 'Join the Sprint waitlist',
        fr: 'Liste d\'attente du Sprint',
      },
      comingSoon: true,
    },
    {
      tier: 'premium',
      title: { en: 'Premium', fr: 'Premium' },
      price: { en: '$499', fr: '499 $' },
      priceSubtext: {
        en: 'One-time payment. Coming month 2–3.',
        fr: 'Paiement unique. À venir au mois 2–3.',
      },
      audience: {
        en: 'For candidates who want live coaching with the founder, an outcome-based guarantee, and direct access for the 4 weeks before their exam.',
        fr: 'Pour les candidats qui veulent un coaching en direct avec le fondateur, une garantie basée sur le résultat, et un accès direct pendant les 4 semaines avant leur examen.',
      },
      bullets: {
        en: [
          'Everything in Sprint',
          '2 live 30-minute coaching sessions with the founder',
          'Personalized exam strategy document',
          'Pre-exam dress rehearsal (full Tâche 3 simulation with live feedback)',
          '4 weeks of WhatsApp access to the founder',
          'Outcome guarantee: full refund if you don\'t reach B2 oral on your TCF',
        ],
        fr: [
          'Tout ce qui est dans le Sprint',
          '2 sessions de coaching en direct de 30 minutes avec le fondateur',
          'Document de stratégie d\'examen personnalisé',
          'Répétition générale avant l\'examen (simulation complète de Tâche 3 avec feedback en direct)',
          '4 semaines d\'accès WhatsApp au fondateur',
          'Garantie de résultat : remboursement intégral si vous n\'atteignez pas le niveau B2 oral à votre TCF',
        ],
      },
      guarantee: null,
      ctaLabel: {
        en: 'Join the waitlist',
        fr: 'S\'inscrire à la liste d\'attente',
      },
      comingSoon: true,
    },
  ] as PricingCardCopy[],
  comingSoonBadge: {
    en: 'Coming soon',
    fr: 'Bientôt',
  } satisfies I18nString,
}

// ── Section 6 — Methodology ─────────────────────────────────────────────────

// F-200 — brief in-line reframe surfacing Les Moules + La Méthode en Couches
// as named system concepts. The full sub-section breakout (with hierarchy,
// examples, diagrams) is filed as F-227 — a copy-authoring task that needs
// Chadi-input on framing language and examples. v1 ships the moat at
// minimum credibility: the concepts are named, briefly defined, and tied
// to where the user encounters them.
export const METHODOLOGY = {
  heading: {
    en: 'The methodology behind LeMethodic.',
    fr: 'La méthodologie derrière LeMethodic.',
  } satisfies I18nString,
  paragraphs: {
    en: [
      'LeMethodic is built on a methodology refined across 7,000+ hours of one-on-one teaching with anglophone French learners on Preply.',
      "The patterns of error are not random. After thousands of hours, they reveal themselves: which grammatical structures English speakers systematically transfer incorrectly. Which preposition pairs they consistently get wrong. Which moments of speech reveal the B1 ceiling to a TCF examiner.",
      'The methodology has two named layers. **La Méthode en Couches** — the four TCF criteria (content, structure, grammar, English-speaker patterns) graded as discrete diagnostic dimensions, not collapsed into a single fluency score. **Les Moules** — the recurring grammatical "molds" anglophones fall into when speaking French under exam pressure. Both are visible to you in the diagnostic and the path. The product names what other tools leave invisible.',
      'The diagnostic detects them. The path corrects them. The dashboard shows you which mold you fell into and which couche it scored against.',
      "This is not a generic French learning app with AI added. It's a focused exam-preparation system for a specific candidate facing a specific exam.",
    ],
    fr: [
      "LeMethodic est construit sur une méthodologie affinée sur plus de 7 000 heures d'enseignement individuel avec des apprenants anglophones de français sur Preply.",
      "Les patterns d'erreurs ne sont pas aléatoires. Après des milliers d'heures, ils se révèlent : quelles structures grammaticales les anglophones transfèrent systématiquement de manière incorrecte. Quelles paires de prépositions ils confondent constamment. Quels moments de leur discours révèlent le plafond B1 à un examinateur du TCF.",
      'La méthodologie repose sur deux couches nommées. **La Méthode en Couches** — les quatre critères TCF (contenu, structure, grammaire, schémas anglophones) évalués comme des dimensions diagnostiques distinctes, jamais agrégés en un score unique de fluidité. **Les Moules** — les « moules » grammaticaux récurrents dans lesquels tombent les anglophones quand ils parlent français sous pression d\'examen. Les deux sont visibles dans le diagnostic et le parcours. Le produit nomme ce que les autres outils laissent invisible.',
      "Le diagnostic les détecte. Le parcours les corrige. Le tableau de bord vous montre dans quel moule vous êtes tombé et contre quelle couche il a été noté.",
      "Ce n'est pas une application générique d'apprentissage du français avec de l'IA ajoutée. C'est un système ciblé de préparation d'examen pour un candidat spécifique face à un examen spécifique.",
    ],
  } satisfies I18nList,
}

// ── Section 7 — FAQ ─────────────────────────────────────────────────────────

export interface FAQItem {
  question: I18nString
  answer: I18nString
}

export const FAQ = {
  heading: {
    en: 'Questions worth asking.',
    fr: 'Les questions qui valent la peine.',
  } satisfies I18nString,
  items: [
    {
      question: {
        en: 'How is this different from PrepMyFrench?',
        fr: 'En quoi est-ce différent de PrepMyFrench ?',
      },
      answer: {
        en: 'PrepMyFrench is generalist TEF/TCF prep for all native languages. LeMethodic is built for one specific candidate: an anglophone preparing for the TCF Canada speaking test. The detection of errors, the path, and the feedback are all tuned for English-speaker interference patterns specifically.',
        fr: "PrepMyFrench est une préparation TEF/TCF généraliste pour toutes les langues maternelles. LeMethodic est construit pour un candidat spécifique : un anglophone préparant l'oral du TCF Canada. La détection d'erreurs, le parcours, et le feedback sont tous adaptés aux patterns d'interférence anglophones spécifiquement.",
      },
    },
    {
      question: {
        en: 'How is this different from Duolingo or Babbel?',
        fr: 'En quoi est-ce différent de Duolingo ou Babbel ?',
      },
      answer: {
        en: "Duolingo and Babbel are designed to teach French to beginners. They work well for that. LeMethodic is designed for B1 learners who already know French but can't perform under exam pressure. Different problem, different product.",
        fr: "Duolingo et Babbel sont conçus pour enseigner le français aux débutants. Ils fonctionnent bien pour ça. LeMethodic est conçu pour les apprenants B1 qui connaissent déjà le français mais qui n'arrivent pas à performer sous pression d'examen. Problème différent, produit différent.",
      },
    },
    {
      question: {
        en: 'Will this guarantee I pass the TCF?',
        fr: 'Est-ce que cela garantit que je vais réussir le TCF ?',
      },
      answer: {
        en: "The subscription and Sprint don't include outcome guarantees — passing depends on your effort, not just the platform. The Premium tier (coming month 2-3) includes an outcome-based money-back guarantee.",
        fr: "L'abonnement et le Sprint n'incluent pas de garantie de résultat — la réussite dépend de votre effort, pas seulement de la plateforme. Le niveau Premium (à venir au mois 2-3) inclut une garantie de remboursement basée sur le résultat.",
      },
    },
    {
      question: {
        en: 'How long until I see results?',
        fr: 'Combien de temps avant de voir des résultats ?',
      },
      answer: {
        en: 'The diagnostic gives you immediate visibility into your gaps. Real production change takes 4-8 weeks of consistent practice. Candidates ready to commit 5+ hours per week typically see TCF-relevant improvement within 4 weeks.',
        fr: 'Le diagnostic vous donne une visibilité immédiate sur vos lacunes. Un vrai changement de production prend 4-8 semaines de pratique régulière. Les candidats prêts à investir 5+ heures par semaine voient typiquement une amélioration pertinente pour le TCF en 4 semaines.',
      },
    },
    {
      question: {
        en: 'Do I need to be at B1 already?',
        fr: 'Dois-je déjà être au niveau B1 ?',
      },
      answer: {
        en: "LeMethodic is designed for B1 → B2. If you're at A2 or below, you'll see this in the diagnostic and we'll redirect you to the waitlist for the A2 → B1 path (in development). If you're already B2+, the diagnostic will tell you and recommend appropriate next steps.",
        fr: "LeMethodic est conçu pour B1 → B2. Si vous êtes au niveau A2 ou inférieur, vous le verrez dans le diagnostic et nous vous redirigerons vers la liste d'attente pour le parcours A2 → B1 (en développement). Si vous êtes déjà B2+, le diagnostic vous le dira et recommandera les prochaines étapes appropriées.",
      },
    },
  ] as FAQItem[],
}

// ── Section 8 — Final CTA ───────────────────────────────────────────────────

export const FINAL_CTA = {
  heading: {
    en: "Stop guessing what's blocking your B2.",
    fr: 'Arrêtez de deviner ce qui bloque votre B2.',
  } satisfies I18nString,
  body: {
    en: 'The TCF Canada exam is in 4 weeks, or 8 weeks, or 6 months. Whatever your timeline, the first step is the same: 12 minutes of recording, an honest diagnostic, and a decision based on real information instead of anxiety.',
    fr: "L'examen TCF Canada est dans 4 semaines, ou 8 semaines, ou 6 mois. Quelle que soit votre échéance, la première étape est la même : 12 minutes d'enregistrement, un diagnostic honnête, et une décision basée sur de vraies informations plutôt que sur l'anxiété.",
  } satisfies I18nString,
  ctaPrimary: {
    en: 'Start the diagnostic',
    fr: 'Commencer le diagnostic',
  } satisfies I18nString,
  ctaSecondary: {
    en: 'Free. No card. About 12 minutes.',
    fr: 'Gratuit. Sans carte. Environ 12 minutes.',
  } satisfies I18nString,
}

// ── Waitlist UI ─────────────────────────────────────────────────────────────

// Authored to M-101 voice: direct, slightly clinical, no SaaS-fluff. The
// confirmation message names the specific tier so the user knows their intent
// was captured correctly.
export const WAITLIST = {
  heading: (tier: 'sprint' | 'premium'): I18nString => ({
    en: tier === 'sprint' ? 'Sprint waitlist' : 'Premium waitlist',
    fr: tier === 'sprint' ? 'Liste d\'attente Sprint' : 'Liste d\'attente Premium',
  }),
  description: (tier: 'sprint' | 'premium'): I18nString => ({
    en:
      tier === 'sprint'
        ? "We'll email you when the Sprint opens for purchase. Optionally, tell us when your exam is so we can warn you if the Sprint won't ship in time."
        : "We'll email you when Premium opens for purchase. Optionally, tell us when your exam is so we can prioritize candidates with closer dates.",
    fr:
      tier === 'sprint'
        ? "Nous vous écrirons à l'ouverture du Sprint. Optionnel : indiquez votre date d'examen pour que nous puissions vous prévenir si le Sprint n'est pas prêt à temps."
        : "Nous vous écrirons à l'ouverture du Premium. Optionnel : indiquez votre date d'examen pour que nous puissions prioriser les candidats avec des échéances proches.",
  }),
  emailLabel: { en: 'Email', fr: 'Email' } satisfies I18nString,
  emailPlaceholder: {
    en: 'your@email.com',
    fr: 'votre@email.com',
  } satisfies I18nString,
  examDateLabel: {
    en: 'Exam date (optional)',
    fr: 'Date d\'examen (optionnel)',
  } satisfies I18nString,
  submit: {
    en: 'Join the list',
    fr: 'Rejoindre la liste',
  } satisfies I18nString,
  cancel: { en: 'Cancel', fr: 'Annuler' } satisfies I18nString,
  successHeading: {
    en: "You're on the list.",
    fr: 'Vous êtes sur la liste.',
  } satisfies I18nString,
  successBody: (tier: 'sprint' | 'premium'): I18nString => ({
    en: `We'll email you when ${tier === 'sprint' ? 'Sprint' : 'Premium'} ships.`,
    fr: `Nous vous écrirons au lancement de ${tier === 'sprint' ? 'Sprint' : 'Premium'}.`,
  }),
  alreadyOnList: {
    en: "You're already on this list. We'll email you when it ships.",
    fr: 'Vous êtes déjà sur cette liste. Nous vous écrirons au lancement.',
  } satisfies I18nString,
  invalidEmail: {
    en: 'Enter a valid email address.',
    fr: 'Entrez une adresse email valide.',
  } satisfies I18nString,
  close: { en: 'Close', fr: 'Fermer' } satisfies I18nString,
}

// ── Document-level metadata for <head> ──────────────────────────────────────

export const META: Record<Lang, { title: string; description: string }> = {
  en: {
    title: 'LeMethodic — TCF Canada speaking exam prep for B1 anglophones',
    description:
      'Exam-preparation built for English speakers preparing the TCF Canada speaking test. Diagnostic-driven path, AI feedback under real exam pressure.',
  },
  fr: {
    title: 'LeMethodic — Préparation à l\'oral du TCF Canada pour anglophones B1',
    description:
      "Préparation d'examen pour anglophones préparant l'oral du TCF Canada. Parcours basé sur diagnostic, feedback IA sous pression d'examen réelle.",
  },
}
