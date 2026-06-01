import type { MetadataRoute } from 'next'

const BASE = 'https://lemethodic.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: {
        languages: {
          en: BASE,
          fr: `${BASE}/fr`,
        },
      },
    },
    {
      url: `${BASE}/fr`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          en: BASE,
          fr: `${BASE}/fr`,
        },
      },
    },
    {
      url: `${BASE}/library`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          en: `${BASE}/library`,
          fr: `${BASE}/fr/library`,
        },
      },
    },
    {
      url: `${BASE}/fr/library`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          en: `${BASE}/library`,
          fr: `${BASE}/fr/library`,
        },
      },
    },
    {
      url: `${BASE}/onboarding`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${BASE}/refund`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]
}
