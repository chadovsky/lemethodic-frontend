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
      { source: '/ecole', destination: '/la-methode', permanent: true },
      { source: '/ecole/:path*', destination: '/la-methode/:path*', permanent: true },
      { source: '/vocabulaire', destination: '/la-bibliotheque', permanent: true },
      { source: '/vocabulaire/:path*', destination: '/la-bibliotheque/:path*', permanent: true },
      { source: '/diagnostic', destination: '/l-examen', permanent: true },
      { source: '/diagnostic/:path*', destination: '/l-examen/:path*', permanent: true },
    ]
  },
}

export default nextConfig
