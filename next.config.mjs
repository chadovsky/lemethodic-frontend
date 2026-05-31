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
      { source: '/vocabulaire', destination: '/la-bibliotheque', permanent: true },
      { source: '/vocabulaire/:path*', destination: '/la-bibliotheque/:path*', permanent: true },
      { source: '/diagnostic', destination: '/l-examen', permanent: true },
      { source: '/diagnostic/:path*', destination: '/l-examen/:path*', permanent: true },
    ]
  },
}

export default nextConfig
