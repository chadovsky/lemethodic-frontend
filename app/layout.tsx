import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Crimson_Pro, Instrument_Sans, Inter, DM_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import TopNav from '@/components/nav/TopNav'
import StickyHeader from '@/components/layout/StickyHeader'
import QueryProvider from '@/components/QueryProvider'
import { ThemeProvider } from '@/components/ThemeProvider'

// M2 t11 — Type A font stack per DESIGN.md v2 (Atelier Français):
//   Instrument Serif — display/hero/wordmark (--f-display)
//   Crimson Pro      — lesson body, long-form reading (--f-body)
//   Instrument Sans  — French UI chrome: nav, labels, buttons (--f-ui)
//   Inter            — English UI text (--f-en)
//   DM Mono          — metadata, eyebrows, folios, accents (--f-mono)
//
// Subset coverage for French (CRITICAL — non-negotiable):
//   'latin'     — U+0000-00FF: é è à â ç î ô û ï ù ë and « »
//   'latin-ext' — U+0100-024F: œ Œ (cœur, œuvre, sœur, bœuf)
// All five fonts subset to 'latin' + 'latin-ext'.

const instrumentSerif = Instrument_Serif({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-instrument-serif',
  weight: ['400'],
  display: 'swap',
})

const crimsonPro = Crimson_Pro({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-crimson-pro',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-instrument-sans',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Le Méthodic',
  description: 'Method-based oral exam prep for anglophone French exam candidates pursuing Quebec PR.',
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
  themeColor: '#FFFFFF', // v2 --paper
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
    <html lang="fr" suppressHydrationWarning className={`${instrumentSerif.variable} ${crimsonPro.variable} ${instrumentSans.variable} ${inter.variable} ${dmMono.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
        </ThemeProvider>
      </body>
    </html>
  )
}
