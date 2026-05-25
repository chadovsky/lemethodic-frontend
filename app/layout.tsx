import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Geist, Source_Serif_4 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import TopNav from '@/components/nav/TopNav'
import StickyHeader from '@/components/layout/StickyHeader'
import QueryProvider from '@/components/QueryProvider'
import { ThemeProvider } from '@/components/ThemeProvider'

// M2 t6 — Font stack migration per DESIGN.md v1:
//   Cabinet Grotesk — display/hero/marketing headings (self-hosted woff2)
//   Geist            — UI/body/interface chrome (next/font/google)
//   Source Serif 4   — lesson content/editorial reading (next/font/google)
//
// Subset coverage for French (CRITICAL):
//   'latin'     — U+0000-00FF: é è à â ç î ô û ï ù ë and « »
//   'latin-ext' — U+0100-024F: œ Œ (cœur, œuvre, sœur, bœuf)
// All three fonts subset to 'latin' + 'latin-ext'.

const cabinetGrotesk = localFont({
  src: [
    {
      path: '../public/fonts/cabinet-grotesk/cabinet-grotesk-medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/cabinet-grotesk/cabinet-grotesk-bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/cabinet-grotesk/cabinet-grotesk-black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-cabinet',
  display: 'swap',
})

const geist = Geist({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-geist',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-source-serif',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
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
    <html lang="en" suppressHydrationWarning className={`${cabinetGrotesk.variable} ${geist.variable} ${sourceSerif4.variable}`}>
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
