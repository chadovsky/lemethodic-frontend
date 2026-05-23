import type { Metadata, Viewport } from 'next'
import { Figtree, Fraunces } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import TopNav from '@/components/nav/TopNav'
import StickyHeader from '@/components/layout/StickyHeader'
import QueryProvider from '@/components/QueryProvider'

// F-VISUAL-001 X.1 — font system pivot. Figtree replaces Switzer for
// sans/UI/body (next/font/google self-hosts at build, removing the
// Fontshare CDN third-party uptime dependency that V-005 introduced).
// Fraunces stays for display + serif accents (variable axes: opsz +
// SOFT + wght).
//
// Subset coverage for French (CRITICAL — per C2 callout):
//   - 'latin' covers U+0000-00FF (Basic Latin + Latin-1 Supplement),
//     which includes the accented letters é è à â ç î ô û ï ù ë and
//     the French guillemets « ».
//   - 'latin-ext' covers U+0100-024F (Latin Extended-A + Extended-B),
//     which carries œ Œ (U+0153 / U+0152) — common French ligature
//     in words like cœur, œuvre, sœur, bœuf. Without latin-ext, those
//     glyphs would fall back to the system font and render with a
//     visible style mismatch on a French-learning product.
// Both fonts subset to 'latin' + 'latin-ext' so French content renders
// in the brand typeface across all surfaces.
const figtree = Figtree({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-figtree',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})
const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'opsz'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LeMethodic',
  description: 'Learn French with LeMethodic',
  generator: 'v0.app',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Le Méthodic',
    description: 'Method-based oral exam prep for anglophone French exam candidates pursuing Quebec PR.',
    url: 'https://lemethodic.com',
    siteName: 'Le Méthodic',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F8F4ED', // F-VISUAL-001 — warm cream --bg-canvas
  width: 'device-width',
  initialScale: 1,
  // userScalable defaults to true — explicitly omitted per WCAG 2.1
  // (preventing pinch-zoom is an accessibility violation).
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${figtree.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">
        <QueryProvider>
          {/* UI-004 — marketing header (logo + Sign in). Shows on all paths;
              TopNav handles authenticated in-product paths separately. */}
          <StickyHeader />
          {/* V-013c — desktop-only top nav. Returns null on marketing /
              conversion / legal paths and below md breakpoint. */}
          <TopNav />
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </QueryProvider>
      </body>
    </html>
  )
}
