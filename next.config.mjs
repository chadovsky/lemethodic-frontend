import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // F-367: canonical route migrations (308 permanent).
      // Specific rules must precede the catch-all for the same prefix.

      // F-437: /method doublon retired — canonical is /la-methode.
      { source: '/method', destination: '/la-methode', permanent: true },
      { source: '/method/:path*', destination: '/la-methode/:path*', permanent: true },

      // Legacy /l-examen shorthand → canonical /l-examen/diagnostic paths.
      { source: '/l-examen/results', destination: '/l-examen/diagnostic/results', permanent: true },
      { source: '/l-examen/results/:path*', destination: '/l-examen/diagnostic/results/:path*', permanent: true },
      { source: '/l-examen/tache/:n', destination: '/l-examen/diagnostic/tache/:n', permanent: true },

      // Backward compat: /maitre/diagnostic → /l-examen/diagnostic (canonical).
      { source: '/maitre/diagnostic', destination: '/l-examen/diagnostic', permanent: true },
      { source: '/maitre/diagnostic/:path*', destination: '/l-examen/diagnostic/:path*', permanent: true },

      // /examen -> /l-examen (canonical slug migration F-43x)
      { source: '/examen', destination: '/l-examen', permanent: true },
      { source: '/examen/:path*', destination: '/l-examen/:path*', permanent: true },

      // /dashboard -> /tableau-de-bord
      { source: '/dashboard', destination: '/tableau-de-bord', permanent: true },
      { source: '/dashboard/:path*', destination: '/tableau-de-bord/:path*', permanent: true },

      // /bibliotheque -> /la-bibliotheque (canonical slug migration F-43x)
      { source: '/bibliotheque', destination: '/la-bibliotheque', permanent: true },
      { source: '/bibliotheque/:path*', destination: '/la-bibliotheque/:path*', permanent: true },

      // /progress -> /progression
      { source: '/progress', destination: '/progression', permanent: true },
      { source: '/progress/:path*', destination: '/progression/:path*', permanent: true },

      // /profile -> /profil
      { source: '/profile', destination: '/profil', permanent: true },
      { source: '/profile/:path*', destination: '/profil/:path*', permanent: true },

      // /account -> /profil (F-372: /account stub had no unique content vs /profil)
      { source: '/account', destination: '/profil', permanent: true },
      { source: '/account/:path*', destination: '/profil/:path*', permanent: true },

      // Auth surfaces
      { source: '/signup', destination: '/inscription', permanent: true },
      { source: '/login', destination: '/connexion', permanent: true },

      // /ecole -> /la-methode (canonical route; /cours was the legacy 2-hop destination)
      { source: '/ecole', destination: '/la-methode', permanent: true },
      { source: '/ecole/:path*', destination: '/la-methode/:path*', permanent: true },

      // /cours/methode-tcf-canada -> /la-methode (F-361: legacy /cours route removed)
      { source: '/cours/methode-tcf-canada', destination: '/la-methode', permanent: true },
      { source: '/cours/methode-tcf-canada/:path*', destination: '/la-methode/:path*', permanent: true },

      // /exam-prep -> /examens/tcf (F-450: /tcf-canada destination never built;
      // /examens/tcf is the real TCF Canada landing page). MS-1 may reinstate /tcf-canada later.
      { source: '/exam-prep', destination: '/examens/tcf', permanent: true },
      { source: '/exam-prep/:path*', destination: '/examens/tcf', permanent: true },

      // /fr/exam-prep -> /fr (F-340: English /exam-prep deleted by F-332)
      { source: '/fr/exam-prep', destination: '/fr', permanent: true },
      { source: '/fr/exam-prep/:path*', destination: '/fr/:path*', permanent: true },

      // F-370: legal route migration to canonical French paths (308 permanent).
      { source: '/terms', destination: '/mentions-legales', permanent: true },
      { source: '/terms/:path*', destination: '/mentions-legales/:path*', permanent: true },
      { source: '/privacy', destination: '/confidentialite', permanent: true },
      { source: '/privacy/:path*', destination: '/confidentialite/:path*', permanent: true },

      // /vocabulaire -> /la-bibliotheque (direct to canonical)
      { source: '/vocabulaire', destination: '/la-bibliotheque', permanent: true },
      { source: '/vocabulaire/:path*', destination: '/la-bibliotheque/:path*', permanent: true },

      // /diagnostic -> /l-examen (direct to canonical)
      { source: '/diagnostic', destination: '/l-examen', permanent: true },
      { source: '/diagnostic/:path*', destination: '/l-examen/:path*', permanent: true },

      // /speaking -> /l-examen/expression-orale (direct to canonical)
      { source: '/speaking', destination: '/l-examen/expression-orale', permanent: true },
      { source: '/speaking/:path*', destination: '/l-examen/expression-orale/:path*', permanent: true },

      // /writing -> /l-examen/expression-ecrite (direct to canonical)
      { source: '/writing', destination: '/l-examen/expression-ecrite', permanent: true },
      { source: '/writing/:path*', destination: '/l-examen/expression-ecrite/:path*', permanent: true },
    ]
  },
}

const withMDX = createMDX({})

export default withMDX(nextConfig)
