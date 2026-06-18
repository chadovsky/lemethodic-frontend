import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Crimson_Pro, Instrument_Sans, Inter, DM_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import TopNav from '@/components/nav/TopNav'
import CartDrawer from '@/components/store/CartDrawer'
import QueryProvider from '@/components/QueryProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { PlausibleAnalytics } from '@/components/analytics/Plausible'

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
  metadataBase: new URL('https://lemethodic.com'),
  title: 'Le Méthodic',
  description: 'Method-based oral exam prep for anglophone French exam candidates pursuing Quebec PR.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: 'Le Méthodic',
    description: 'Method-based oral exam prep for anglophone French exam candidates pursuing Quebec PR.',
    url: 'https://lemethodic.com',
    siteName: 'Le Méthodic',
    type: 'website',
    locale: 'en_US',
    // Place a 1200x630 JPEG at /public/og-default.jpg to activate OG preview images.
    // Set NEXT_PUBLIC_OG_IMAGE=/og-default.jpg in Vercel env to override per-deploy.
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Le Méthodic',
    description: 'Method-based oral exam prep for anglophone French exam candidates pursuing Quebec PR.',
  },
  // F-473 — favicon + touch icon come from the App Router file convention
  // (app/icon.png + app/apple-icon.png, both the square brand mark). The prior
  // metadata.icons block pointed at /icon-light-32x32.png, /icon-dark-32x32.png,
  // /icon.svg and /apple-icon.png — none of which existed in /public (dangling
  // 404 links). The file convention is now the single source of truth.
}

export const viewport: Viewport = {
  themeColor: '#EAEFF3', // v3 --canvas (F-463)
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
            {/* F-479 — TopNav (the floating pill) is the SINGLE logged-out
                marketing nav across every public surface (StickyHeader retired).
                Returns null when authenticated (AppShell takes over) and on the
                focused auth + conversion-funnel routes (/connexion, /onboarding,
                /paywall). */}
            <TopNav />
            {/* F-448 — global cart drawer; opened by any CartButton (TopNav,
                sidebar, store header). Renders null until opened. */}
            <CartDrawer />
            {children}
            {process.env.NODE_ENV === 'production' && <Analytics />}
            <PlausibleAnalytics />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
