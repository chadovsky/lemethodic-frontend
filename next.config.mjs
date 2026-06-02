/** @type {import('next').NextConfig} */
const nextConfig = {
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

      // Legacy /l-examen/results + tache shorthand — redirect directly to
      // canonical /maitre/diagnostic paths before the /l-examen catch-all fires.
      { source: '/l-examen/results', destination: '/maitre/diagnostic/results', permanent: true },
      { source: '/l-examen/results/:path*', destination: '/maitre/diagnostic/results/:path*', permanent: true },
      { source: '/l-examen/tache/:n', destination: '/maitre/diagnostic/tache/:n', permanent: true },

      // /l-examen/diagnostic -> /maitre/diagnostic (specific + wildcard before catch-all)
      { source: '/l-examen/diagnostic', destination: '/maitre/diagnostic', permanent: true },
      { source: '/l-examen/diagnostic/:path*', destination: '/maitre/diagnostic/:path*', permanent: true },

      // /l-examen -> /examen (exact + catch-all for remaining sub-routes)
      { source: '/l-examen', destination: '/examen', permanent: true },
      { source: '/l-examen/:path*', destination: '/examen/:path*', permanent: true },

      // /dashboard -> /carte
      { source: '/dashboard', destination: '/carte', permanent: true },
      { source: '/dashboard/:path*', destination: '/carte/:path*', permanent: true },

      // /la-bibliotheque -> /bibliotheque
      { source: '/la-bibliotheque', destination: '/bibliotheque', permanent: true },
      { source: '/la-bibliotheque/:path*', destination: '/bibliotheque/:path*', permanent: true },

      // /progress -> /progression
      { source: '/progress', destination: '/progression', permanent: true },
      { source: '/progress/:path*', destination: '/progression/:path*', permanent: true },

      // /profile -> /profil
      { source: '/profile', destination: '/profil', permanent: true },
      { source: '/profile/:path*', destination: '/profil/:path*', permanent: true },

      // Auth surfaces
      { source: '/signup', destination: '/inscription', permanent: true },
      { source: '/login', destination: '/connexion', permanent: true },

      // /ecole -> /la-methode (canonical route; /cours was the legacy 2-hop destination)
      { source: '/ecole', destination: '/la-methode', permanent: true },
      { source: '/ecole/:path*', destination: '/la-methode/:path*', permanent: true },

      // /cours/methode-tcf-canada -> /la-methode (F-361: legacy /cours route removed)
      { source: '/cours/methode-tcf-canada', destination: '/la-methode', permanent: true },
      { source: '/cours/methode-tcf-canada/:path*', destination: '/la-methode/:path*', permanent: true },

      // /exam-prep -> /tcf-canada (MS-1 owns the destination page)
      { source: '/exam-prep', destination: '/tcf-canada', permanent: true },
      { source: '/exam-prep/:path*', destination: '/tcf-canada/:path*', permanent: true },

      // /fr/exam-prep -> /fr (F-340: English /exam-prep deleted by F-332)
      { source: '/fr/exam-prep', destination: '/fr', permanent: true },
      { source: '/fr/exam-prep/:path*', destination: '/fr/:path*', permanent: true },

      // /vocabulaire -> /bibliotheque (updated: skip the legacy /la-bibliotheque hop)
      { source: '/vocabulaire', destination: '/bibliotheque', permanent: true },
      { source: '/vocabulaire/:path*', destination: '/bibliotheque/:path*', permanent: true },

      // /diagnostic -> /examen (updated: legacy /diagnostic went to /l-examen)
      { source: '/diagnostic', destination: '/examen', permanent: true },
      { source: '/diagnostic/:path*', destination: '/examen/:path*', permanent: true },

      // /speaking -> /examen/expression-orale (updated from /l-examen/expression-orale)
      { source: '/speaking', destination: '/examen/expression-orale', permanent: true },
      { source: '/speaking/:path*', destination: '/examen/expression-orale/:path*', permanent: true },

      // /writing -> /examen/expression-ecrite (updated from /l-examen/expression-ecrite)
      { source: '/writing', destination: '/examen/expression-ecrite', permanent: true },
      { source: '/writing/:path*', destination: '/examen/expression-ecrite/:path*', permanent: true },
    ]
  },
}

export default nextConfig
