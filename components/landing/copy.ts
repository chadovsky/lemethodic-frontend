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

// F-221 — brand-layer rewrite (full TCF neutralization for V1 multi-exam
// landing). Per-exam specifics surface post-onboarding once exam choice
// is known; landing stays universal.
export const HERO = {
  h1: {
    en: "The French speaking exam doesn't reward what you know. It rewards what you can produce in 12 minutes under pressure.",
    fr: "L'examen oral de français ne récompense pas ce que vous savez. Il récompense ce que vous pouvez produire en 12 minutes sous pression.",
  } satisfies I18nString,
  subhead: {
    en: 'LeMethodic is exam prep for B1 anglophones who can read French, write French, even understand French, but freeze the moment they have to speak it.',
    fr: "LeMethodic est une préparation d'examen pour anglophones B1 qui lisent, écrivent, et comprennent le français, mais qui se figent au moment de parler.",
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
      'You can survive a conversation. You can read articles. You can write structured texts. But when a real French speaker talks at normal speed, or when an examiner asks you to argue a position in 5 minutes, you collapse into safe phrases. Short sentences. Past tense only. The word you needed wasn\'t there when you needed it.',
      "Duolingo, Babbel, even Preply tutoring won't fix this. They were built for a different problem: helping you learn French. You don't need to learn more French. You need to break the wall between knowing French and producing French under exam pressure.",
      'That\'s what LeMethodic does.',
    ],
    fr: [
      "Vous avez frappé un mur au niveau B1. La plupart des apprenants y arrivent. C'est le moment où le français cesse d'être indulgent.",
      "Vous tenez une conversation. Vous lisez des articles. Vous rédigez des textes structurés. Mais quand un francophone parle à vitesse normale, ou quand un examinateur vous demande d'argumenter en 5 minutes, vous vous repliez sur des phrases sûres. Des phrases courtes. Du passé composé partout. Le mot dont vous aviez besoin n'était pas là quand il fallait.",
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
        en: 'Most apps push you through generic lessons. LeMethodic starts with 3 recordings to find your specific gaps: the exact patterns blocking your B2 score. Your path is built from your gaps, not from someone else\'s syllabus.',
        fr: "La plupart des applications vous font suivre des leçons standardisées. LeMethodic commence par 3 enregistrements pour identifier vos lacunes spécifiques : les patterns exacts qui bloquent votre score B2. Votre parcours est construit à partir de vos lacunes, pas d'un programme prédéfini.",
      },
    },
    {
      title: {
        en: 'Anglophone interference, not generic French',
        fr: 'Interférences anglophones, pas français générique',
      },
      body: {
        en: 'Built on 7,000+ hours of teaching English speakers learning French. The mistakes you make aren\'t random. They follow patterns. LeMethodic detects those patterns and trains you out of them. Not generic "French grammar," but the specific traps anglophones fall into and never escape.',
        fr: "Construit à partir de plus de 7 000 heures d'enseignement à des anglophones apprenant le français. Les erreurs que vous faites ne sont pas aléatoires. Elles suivent des patterns. LeMethodic détecte ces patterns et vous en sort. Pas de la « grammaire française » générique, mais les pièges spécifiques dans lesquels les anglophones tombent et n'arrivent jamais à sortir.",
      },
    },
    {
      title: {
        en: 'Real-time AI speaking feedback',
        fr: 'Feedback IA en temps réel sur l\'oral',
      },
      body: {
        en: "The exam speaking test is 12 minutes of pressure. You can't simulate that with flashcards. LeMethodic puts you under the same pressure: real prompts, recorded responses, immediate feedback on what an examiner would actually score you on.",
        fr: "L'examen oral, c'est 12 minutes de pression. On ne simule pas cela avec des flashcards. LeMethodic vous met sous la même pression : prompts réels, réponses enregistrées, feedback immédiat sur ce qu'un examinateur évaluerait vraiment.",
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
        en: 'Three recordings. Three exam-realistic prompts. Our engine identifies the specific grammar, vocabulary, and structural patterns that are blocking your B2 score.',
        fr: 'Trois enregistrements. Trois prompts réalistes. Notre moteur identifie les patterns grammaticaux, lexicaux et structurels précis qui bloquent votre score B2.',
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

// ── Section 6 — Methodology (F-227 compressed breakout) ────────────────────

// F-227 — compressed methodology surface for landing. Reuses the F-202
// /ecole/intro Section 2 framework in glance-form: 5 couches as one-line
// entries, no deep blocks. Locked verbatim copy (khâgneux-reviewed; do
// not paraphrase). Couche names match F-202 EXACTLY (Le Fond / Les Moules
// des Idées / Les Moules / Les Réflexes Anglais / La Voix) — these are
// the named in-product concepts and must stay consistent across surfaces.
export interface CoucheCopy {
  name: I18nString
  description: I18nString
}

export const METHODOLOGY = {
  heading: {
    en: 'La Méthode en Couches',
    fr: 'La Méthode en Couches',
  } satisfies I18nString,
  intro: {
    en: "Five layers compose your French. We diagnose the one that's holding you back, and we treat it specifically.",
    fr: "Cinq couches composent votre français. On diagnostique celle qui vous freine, et on la traite précisément.",
  } satisfies I18nString,
  couches: [
    {
      name: { en: 'Le Fond', fr: 'Le Fond' },
      description: {
        en: 'Ideas, arguments, examples.',
        fr: 'Les idées, les arguments, les exemples.',
      },
    },
    {
      name: { en: 'Les Moules des Idées', fr: 'Les Moules des Idées' },
      description: {
        en: 'How thought is organized in French.',
        fr: "Comment la pensée s'organise en français.",
      },
    },
    {
      name: { en: 'Les Moules', fr: 'Les Moules' },
      description: {
        en: 'How sentences are built in French.',
        fr: 'Comment les phrases se construisent en français.',
      },
    },
    {
      name: { en: 'Les Réflexes Anglais', fr: 'Les Réflexes Anglais' },
      description: {
        en: 'The English habits that slip through unnoticed.',
        fr: 'Les habitudes anglaises qui passent sans permission.',
      },
    },
    {
      name: { en: 'La Voix', fr: 'La Voix' },
      description: {
        en: 'How it sounds: vowels, liaisons, rhythm.',
        fr: 'Comment ça sonne : voyelles, liaisons, rythme.',
      },
    },
  ] as CoucheCopy[],
  closer: {
    en: "Most platforms tell you to practice more. La Méthode identifies the layer that's dragging. Treats that one, specifically.",
    fr: 'La plupart des plateformes vous disent de pratiquer plus. La Méthode identifie la couche qui freine. Et traite celle-là, précisément.',
  } satisfies I18nString,
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
        en: 'How is this different from PrepMyFuture?',
        fr: 'En quoi est-ce différent de PrepMyFuture ?',
      },
      answer: {
        en: "Most French exam prep drills grammar and vocabulary. We're the only platform built for speaking practice with AI examiner feedback, tuned for the specific interference patterns English speakers fall into, not generic French grammar.",
        fr: "La plupart des préparations aux examens de français font travailler la grammaire et le vocabulaire. Nous sommes la seule plateforme construite pour la pratique orale avec feedback IA, adaptée aux schémas d'interférence spécifiques aux anglophones, pas à la grammaire française générique.",
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
        en: 'Do you guarantee I pass?',
        fr: 'Garantissez-vous que je vais réussir ?',
      },
      answer: {
        en: "The subscription and Sprint don't include outcome guarantees. Passing depends on your effort, not just the platform. The Premium tier (coming month 2-3) includes an outcome-based money-back guarantee.",
        fr: "L'abonnement et le Sprint n'incluent pas de garantie de résultat. La réussite dépend de votre effort, pas seulement de la plateforme. Le niveau Premium (à venir au mois 2-3) inclut une garantie de remboursement basée sur le résultat.",
      },
    },
    {
      question: {
        en: 'How long until I see results?',
        fr: 'Combien de temps avant de voir des résultats ?',
      },
      answer: {
        en: 'The diagnostic gives you immediate visibility into your gaps. Real production change takes 4-8 weeks of consistent practice. Candidates ready to commit 5+ hours per week typically see exam-relevant improvement within 4 weeks.',
        fr: 'Le diagnostic vous donne une visibilité immédiate sur vos lacunes. Un vrai changement de production prend 4-8 semaines de pratique régulière. Les candidats prêts à investir 5+ heures par semaine voient typiquement une amélioration pertinente pour leur examen en 4 semaines.',
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
    en: 'Your French exam is in 4 weeks, or 8 weeks, or 6 months. Whatever your timeline, the first step is the same: 12 minutes of recording, an honest diagnostic, and a decision based on real information instead of anxiety.',
    fr: "Votre examen de français est dans 4 semaines, ou 8 semaines, ou 6 mois. Quelle que soit votre échéance, la première étape est la même : 12 minutes d'enregistrement, un diagnostic honnête, et une décision basée sur de vraies informations plutôt que sur l'anxiété.",
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
    title: 'LeMethodic | French exam speaking prep for B1 anglophones',
    description:
      "Exam preparation built for English speakers preparing French speaking exams (TCF / TEF / DELF). Diagnostic-driven path, AI feedback under real exam pressure.",
  },
  fr: {
    title: "LeMethodic | Préparation à l'oral des examens de français pour anglophones B1",
    description:
      "Préparation d'examen pour anglophones préparant les examens de français (TCF / TEF / DELF). Parcours basé sur diagnostic, feedback IA sous pression d'examen réelle.",
  },
}

// ── F-221 — exam picker (Q1 / q0_target_exam) ─────────────────────────────
// Five options at the head of the questionnaire. BE drives the question
// itself via /onboarding/questions; FE matches on `id === 'q0_target_exam'`
// and dispatches to ExamPickerQuestion.tsx. The format-DNA chip copy here
// is FE-owned so we can localize without BE round-trip.

export type ExamValue =
  | 'tcf_canada'
  | 'tef_canada'
  | 'delf_b1_b2'
  | 'another_exam'
  | 'not_sure'

export interface ExamOption {
  value: ExamValue
  // The exam name (e.g., "TCF Canada"). Universal across languages —
  // exam names aren't translated, just the format-DNA chip copy below.
  label: string
  // Format-DNA chip — short positioning line under the exam name.
  formatDna: I18nString
  // True when picking this option should skip the rest of the
  // questionnaire and route to the exam-not-supported waitlist surface.
  routesToWaitlist: boolean
}

export const EXAM_OPTIONS: ExamOption[] = [
  {
    value: 'tcf_canada',
    label: 'TCF Canada',
    formatDna: {
      en: 'Canadian immigration · Express Entry',
      fr: 'Immigration canadienne · Entrée Express',
    },
    routesToWaitlist: false,
  },
  {
    value: 'tef_canada',
    label: 'TEF Canada',
    formatDna: {
      en: 'Canadian immigration · faster than TCF',
      fr: 'Immigration canadienne · plus rapide que le TCF',
    },
    routesToWaitlist: false,
  },
  {
    value: 'delf_b1_b2',
    label: 'DELF B1 / B2',
    formatDna: {
      en: 'Standardized proficiency · valid worldwide',
      fr: 'Compétence standardisée · valable mondialement',
    },
    routesToWaitlist: false,
  },
  {
    value: 'another_exam',
    label: 'Another exam',
    formatDna: {
      en: "Tell us which one. We'll email you when ready.",
      fr: "Dites-nous lequel. Nous vous écrirons quand prêt.",
    },
    routesToWaitlist: true,
  },
  {
    value: 'not_sure',
    label: "I'm not sure yet",
    formatDna: {
      en: "We'll start you on the most common path",
      fr: "Nous vous lancerons sur le parcours le plus courant",
    },
    routesToWaitlist: false,
  },
]

// Per-exam helper text rendered under q2_target_level options when exam
// is known. Single helper line at question level (not per-option). Maps
// CEFR target to exam-specific scoring band so the user understands the
// level in their exam's terms.
export const TARGET_LEVEL_HELPER_BY_EXAM: Record<ExamValue, I18nString | null> = {
  tcf_canada: {
    en: 'For Canadian PR via Express Entry, B2 typically maps to CLB 7-8.',
    fr: "Pour la résidence permanente canadienne via Entrée Express, B2 correspond généralement à CLB 7-8.",
  },
  tef_canada: {
    en: 'For Canadian PR via Express Entry, B2 typically maps to NCLC 7-8.',
    fr: "Pour la résidence permanente canadienne via Entrée Express, B2 correspond généralement à NCLC 7-8.",
  },
  delf_b1_b2: {
    en: 'DELF uses CEFR levels directly. Pick the one you need.',
    fr: 'Le DELF utilise directement les niveaux CECR. Choisissez celui qu\'il vous faut.',
  },
  another_exam: null,   // shouldn't reach this question (waitlist branch)
  not_sure: null,       // no helper — let the standard helper text stand
}

// Display name used when interpolating {exam} into waitlist + post-signup
// surfaces. Used by WaitlistScreen + AnotherExam waitlist UI.
export const EXAM_DISPLAY_NAME: Record<ExamValue, string> = {
  tcf_canada: 'TCF Canada',
  tef_canada: 'TEF Canada',
  delf_b1_b2: 'DELF B1 / B2',
  another_exam: 'your exam',
  not_sure: 'TCF Canada',  // default per Chadi 2026-05-05
}

// Strings for the inline "Another exam" mini-form that appears when the
// user picks `another_exam` on the picker. Captures email + which exam
// they want, stores to localStorage waitlist (lib/waitlist.ts), shows
// confirmation. Doesn't proceed through the rest of the questionnaire.
export const EXAM_OTHER_FORM = {
  en: {
    heading: "Tell us which exam.",
    description: "We'll email you when LeMethodic supports it.",
    examLabel: 'Which exam?',
    examPlaceholder: 'e.g. DALF C1, DILF, TCF DAP',
    emailLabel: 'Email',
    emailPlaceholder: 'your@email.com',
    submit: 'Join the list',
    invalidEmail: 'Enter a valid email address.',
    invalidExam: 'Tell us which exam.',
    successHeading: "You're on the list.",
    successBody: "We'll email you when your exam is supported.",
    backToPicker: 'Pick a different exam',
  },
  fr: {
    heading: 'Dites-nous quel examen.',
    description: "Nous vous écrirons quand LeMethodic le prendra en charge.",
    examLabel: 'Quel examen ?',
    examPlaceholder: 'p. ex. DALF C1, DILF, TCF DAP',
    emailLabel: 'Email',
    emailPlaceholder: 'votre@email.com',
    submit: 'Rejoindre la liste',
    invalidEmail: 'Entrez une adresse email valide.',
    invalidExam: "Dites-nous quel examen.",
    successHeading: 'Vous êtes sur la liste.',
    successBody: "Nous vous écrirons quand votre examen sera pris en charge.",
    backToPicker: 'Choisir un autre examen',
  },
} as const satisfies Record<Lang, unknown>
