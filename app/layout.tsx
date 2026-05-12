import type { Metadata, Viewport } from 'next'
import { Fraunces } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import TopNav from '@/components/nav/TopNav'
import QueryProvider from '@/components/QueryProvider'

// V-005 — font system upgrade. Switzer replaces Geist for sans/UI/body
// (loaded via Fontshare CDN, defined as `--font-switzer` CSS variable
// in globals.css :root). Fraunces replaces Source Serif 4 for display +
// serif accents (variable axes: opsz + SOFT + wght). The previous
// per-surface DISPLAY_FONT constants pointing at Cabinet Grotesk /
// Geist were rewritten to `var(--font-switzer)` in this same ticket.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'opsz'],
})

export const metadata: Metadata = {
  title: 'LeMethodic',
  description: 'Learn French with LeMethodic',
  generator: 'v0.app',
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
  themeColor: '#FAF7F2', // F-200: warm off-white editorial bg
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
    <html lang="en" className={fraunces.variable}>
      <head>
        {/* V-005 — Switzer via Fontshare CDN. Fraunces is loaded via
            next/font above (Google Fonts). Cabinet Grotesk + Geist
            CDN/Google links retired with V-005.
            V-016e — added crossOrigin on preconnect (Fontshare's CSS
            references font files on a different host) and a preload
            link for the CSS itself so first-paint on landing doesn't
            FOUT into system-sans before the @font-face declarations
            arrive. */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700,800&display=swap"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <QueryProvider>
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
