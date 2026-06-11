// F-448 -- Store mold placeholder catalog.
//
// DATA SOURCE DECISION (locked): books live in LemonSqueezy as products
// (option A). This module is LOCAL PLACEHOLDER data shaped like the LS
// product API so the later swap is config, not rework. We do NOT call the
// LS API here and do NOT touch API keys.
//
// LS product reference: https://docs.lemonsqueezy.com/api/products
// Field mapping (FE field  <-  LS product attribute):
//   id          <-  product `id`                      (string in LS JSON:API)
//   slug        <-  attributes.slug
//   title       <-  attributes.name
//   description <-  attributes.description             (HTML stripped here)
//   priceCents  <-  attributes.price                  (integer, minor units)
//   currency    <-  store currency (drives price_formatted)
//   coverUrl    <-  attributes.large_thumb_url         (null -> styled placeholder)
//   category    <-  NOT native to LS products; mapped from a product custom
//                   field / collection tag at ingest time
//   author      <-  NOT native; carried in description metadata / custom field
//
// When BE wiring lands (later ticket), lib/api/store.ts will fetch
// /v1/products from LS, reconcile that shape into StoreBook here, and this
// file is deleted. Components import only the StoreBook type + helpers, so
// the swap stays in the api layer.

export type BookCategory =
  | 'livres'
  | 'audio'
  | 'telechargements'
  | 'ressources-gratuites'

export interface BookCategoryMeta {
  key: BookCategory
  label: string
}

// The four canonical categories, preserved from the prior bientôt cards.
export const BOOK_CATEGORIES: BookCategoryMeta[] = [
  { key: 'livres', label: 'Livres' },
  { key: 'audio', label: 'Audio' },
  { key: 'telechargements', label: 'Téléchargements' },
  { key: 'ressources-gratuites', label: 'Ressources gratuites' },
]

export interface StoreBook {
  id: string
  slug: string
  title: string
  author: string
  description: string
  priceCents: number
  currency: string
  category: BookCategory
  coverUrl: string | null
}

// ~11 placeholder products across the four categories. Covers are null on
// purpose: the BookCover component renders a styled ink-frame placeholder,
// never a gray box. ressources-gratuites items are priced at 0 (free).
export const BOOKS: StoreBook[] = [
  {
    id: 'prod_lm_0001',
    slug: 'grammaire-essentielle-b2',
    title: 'Grammaire essentielle B2',
    author: 'Le Méthodic',
    description:
      "Le manuel de référence pour verrouiller la grammaire attendue au niveau B2 : subjonctif, concordance des temps, pronoms relatifs composés. Chaque règle est suivie d'exercices ciblés et d'un corrigé commenté.",
    priceCents: 2490,
    currency: 'EUR',
    category: 'livres',
    coverUrl: null,
  },
  {
    id: 'prod_lm_0002',
    slug: 'le-vocabulaire-du-tcf',
    title: 'Le vocabulaire du TCF',
    author: 'Le Méthodic',
    description:
      "1 200 mots et expressions classés par thème d'examen, avec exemples en contexte et pièges de prononciation. Pensé pour la préparation rapide des quatre épreuves.",
    priceCents: 1990,
    currency: 'EUR',
    category: 'livres',
    coverUrl: null,
  },
  {
    id: 'prod_lm_0003',
    slug: 'reussir-l-expression-orale',
    title: "Réussir l'expression orale",
    author: 'Le Méthodic',
    description:
      "La méthode complète pour structurer une prise de parole : le propos, le plan, la construction. Modèles de réponses notés et grilles d'évaluation officielles décodées.",
    priceCents: 2990,
    currency: 'EUR',
    category: 'livres',
    coverUrl: null,
  },
  {
    id: 'prod_lm_0004',
    slug: 'compréhension-orale-dialogues',
    title: 'Compréhension orale : 40 dialogues',
    author: 'Le Méthodic',
    description:
      "40 dialogues audio gradués A2 vers C1, avec transcriptions, questions type examen et corrigés. Idéal pour entraîner l'oreille aux accents et débits réels.",
    priceCents: 1790,
    currency: 'EUR',
    category: 'audio',
    coverUrl: null,
  },
  {
    id: 'prod_lm_0005',
    slug: 'phonetique-en-30-jours',
    title: 'Phonétique en 30 jours',
    author: 'Le Méthodic',
    description:
      "Un programme audio quotidien pour corriger les sons qui trahissent les anglophones : voyelles nasales, le r français, les liaisons. Une piste par jour, dix minutes.",
    priceCents: 2290,
    currency: 'EUR',
    category: 'audio',
    coverUrl: null,
  },
  {
    id: 'prod_lm_0006',
    slug: 'dictees-progressives-audio',
    title: 'Dictées progressives (audio)',
    author: 'Le Méthodic',
    description:
      "25 dictées audio progressives pour ancrer l'orthographe grammaticale et les accords. Vitesse normale et vitesse lente fournies pour chaque dictée.",
    priceCents: 1490,
    currency: 'EUR',
    category: 'audio',
    coverUrl: null,
  },
  {
    id: 'prod_lm_0007',
    slug: 'fiches-conjugaison-pdf',
    title: 'Fiches de conjugaison (PDF)',
    author: 'Le Méthodic',
    description:
      "60 fiches PDF imprimables couvrant tous les temps de l'indicatif, du subjonctif et du conditionnel. Tableaux clairs, verbes irréguliers regroupés par famille.",
    priceCents: 990,
    currency: 'EUR',
    category: 'telechargements',
    coverUrl: null,
  },
  {
    id: 'prod_lm_0008',
    slug: 'planificateur-d-examen-pdf',
    title: "Planificateur d'examen (PDF)",
    author: 'Le Méthodic',
    description:
      "Un planning PDF de 8 semaines pour organiser la préparation, avec objectifs hebdomadaires, suivi des scores blancs et check-list du jour J.",
    priceCents: 690,
    currency: 'EUR',
    category: 'telechargements',
    coverUrl: null,
  },
  {
    id: 'prod_lm_0009',
    slug: 'modeles-de-lettres-pdf',
    title: 'Modèles de lettres et e-mails (PDF)',
    author: 'Le Méthodic',
    description:
      "30 modèles rédigés pour l'épreuve d'expression écrite : lettre formelle, courriel de réclamation, message d'opinion. Structures et formules de politesse fournies.",
    priceCents: 1290,
    currency: 'EUR',
    category: 'telechargements',
    coverUrl: null,
  },
  {
    id: 'prod_lm_0010',
    slug: 'guide-de-demarrage-tcf-gratuit',
    title: 'Guide de démarrage TCF',
    author: 'Le Méthodic',
    description:
      "Le guide gratuit pour comprendre la structure du TCF, le barème et les attentes de chaque épreuve. Le point de départ avant toute préparation.",
    priceCents: 0,
    currency: 'EUR',
    category: 'ressources-gratuites',
    coverUrl: null,
  },
  {
    id: 'prod_lm_0011',
    slug: 'liste-100-mots-gratuite',
    title: 'Les 100 mots indispensables',
    author: 'Le Méthodic',
    description:
      "Une fiche gratuite des 100 mots qui reviennent le plus souvent aux examens, avec leur traduction et un exemple. À garder dans la poche.",
    priceCents: 0,
    currency: 'EUR',
    category: 'ressources-gratuites',
    coverUrl: null,
  },
]

export function getBookBySlug(slug: string): StoreBook | undefined {
  return BOOKS.find((b) => b.slug === slug)
}

export function booksByCategory(category: BookCategory | 'all'): StoreBook[] {
  if (category === 'all') return BOOKS
  return BOOKS.filter((b) => b.category === category)
}

// French price formatting from minor units. Mirrors LS price_formatted.
// 0 cents renders as "Gratuit" so free resources read as free, not "0,00 €".
export function formatPrice(priceCents: number, currency = 'EUR'): string {
  if (priceCents === 0) return 'Gratuit'
  const amount = (priceCents / 100).toFixed(2).replace('.', ',')
  const symbol = currency === 'EUR' ? '€' : currency
  return `${amount} ${symbol}`
}
