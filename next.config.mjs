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
      // /ecole -> /cours/methode-tcf-canada (collapse old 2-hop chain)
      { source: '/ecole', destination: '/cours/methode-tcf-canada', permanent: true },
      { source: '/ecole/:path*', destination: '/cours/methode-tcf-canada/:path*', permanent: true },
      // /la-methode -> /cours/methode-tcf-canada
      { source: '/la-methode', destination: '/cours/methode-tcf-canada', permanent: true },
      { source: '/la-methode/:path*', destination: '/cours/methode-tcf-canada/:path*', permanent: true },
      // /exam-prep -> /tcf-canada (MS-1 owns the destination page)
      { source: '/exam-prep', destination: '/tcf-canada', permanent: true },
      { source: '/exam-prep/:path*', destination: '/tcf-canada/:path*', permanent: true },
      // /fr/exam-prep -> /fr (F-340: English /exam-prep deleted by F-332, French page now legacy dead end)
      { source: '/fr/exam-prep', destination: '/fr', permanent: true },
      { source: '/fr/exam-prep/:path*', destination: '/fr/:path*', permanent: true },
      { source: '/vocabulaire', destination: '/la-bibliotheque', permanent: true },
      { source: '/vocabulaire/:path*', destination: '/la-bibliotheque/:path*', permanent: true },
      { source: '/diagnostic', destination: '/l-examen', permanent: true },
      { source: '/diagnostic/:path*', destination: '/l-examen/:path*', permanent: true },
      // F-335: /speaking -> /l-examen/expression-orale
      { source: '/speaking', destination: '/l-examen/expression-orale', permanent: true },
      { source: '/speaking/:path*', destination: '/l-examen/expression-orale/:path*', permanent: true },
      // F-335: /writing -> /l-examen/expression-ecrite
      { source: '/writing', destination: '/l-examen/expression-ecrite', permanent: true },
      { source: '/writing/:path*', destination: '/l-examen/expression-ecrite/:path*', permanent: true },
      // F-335: /l-examen/results and /l-examen/tache/:n -> under /diagnostic/
      { source: '/l-examen/results', destination: '/l-examen/diagnostic/results', permanent: true },
      { source: '/l-examen/results/:path*', destination: '/l-examen/diagnostic/results/:path*', permanent: true },
      { source: '/l-examen/tache/:n', destination: '/l-examen/diagnostic/tache/:n', permanent: true },
    ]
  },
}

export default nextConfig
