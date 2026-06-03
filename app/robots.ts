import type { MetadataRoute } from 'next'

const BASE = 'https://lemethodic.com'

// Routes that require authentication or are not intended for indexing.
const PRIVATE = [
  '/carte',
  '/tableau-de-bord',
  '/la-methode/',
  '/la-bibliotheque/',
  '/l-examen/',
  '/account',
  '/admin/',
  '/connexion',
  '/inscription',
  '/verify-email',
  '/password-reset',
  '/onboarding/waitlist',
]

// AI crawlers listed explicitly to signal welcoming — AI citation is an
// acquisition channel for this product. Each named rule overrides the * rule
// for that UA; same disallow list keeps private routes out.
const AI_CRAWLERS = ['GPTBot', 'PerplexityBot', 'Google-Extended', 'ClaudeBot']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: PRIVATE,
      })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
