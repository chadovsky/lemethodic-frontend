import type { Metadata, Viewport } from 'next'
import { Instrument_Serif, Crimson_Pro, Instrument_Sans, Inter, DM_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import TopNav from '@/components/nav/TopNav'
import CartDrawer from '@/components/store/CartDrawer'
import QueryProvider from '@/components/QueryProvider'
import { PlausibleAnalytics } from '@/components/analytics/Plausible'
import MarketingThemeGuard from '@/components/theme/MarketingThemeGuard'
import { AUTHED_PREFIXES } from '@/lib/theme/authed-prefixes'
import { TOKEN_KEY } from '@/lib/storage-keys'

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

// F-482 — pre-paint, route-aware theme initializer. Runs synchronously in <head>
// before first paint (the next-themes technique: a raw inline script, NOT
// next/script). It reads the path against the shared AUTHED_PREFIXES list:
//   - marketing / logged-out path: always strip .dark, never read the token, so
//     marketing renders v3 light on every full load (closes the stale-.dark case
//     where a prior authed dark session left "theme=dark" in storage).
//   - authed path WITH a token: apply the stored theme before paint (dark / light,
//     or system resolved via matchMedia), which removes the F-481 app entry snap.
//   - authed path WITHOUT a token: strip .dark (a logged-out visitor on an
//     auth-aware route like /la-methode renders light). Everything is wrapped in
//     try/catch so a storage / matchMedia failure can never throw before paint.
// "theme" is the next-themes default storageKey (no storageKey override exists).
const themeInitScript = `(function(){try{
var p=location.pathname;
var A=${JSON.stringify(AUTHED_PREFIXES)};
var authed=A.some(function(x){return p===x||p.indexOf(x+"/")===0;});
var d=document.documentElement;
var tok=null;try{tok=localStorage.getItem(${JSON.stringify(TOKEN_KEY)});}catch(e){}
if(authed&&tok){
var t=null;try{t=localStorage.getItem("theme");}catch(e){}
var dark=t==="dark"||((!t||t==="system")&&typeof window.matchMedia==="function"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
if(dark){d.classList.add("dark");}else{d.classList.remove("dark");}
}else{d.classList.remove("dark");}
}catch(e){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${instrumentSerif.variable} ${crimsonPro.variable} ${instrumentSans.variable} ${inter.variable} ${dmMono.variable}`}>
      <head>
        {/* F-482 — pre-paint, route-aware theme init (see themeInitScript above).
            Marketing paths always end up light; authed paths apply the stored
            theme before paint. Raw inline script so it runs before hydration. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        {/* F-481 — the next-themes provider is NOT at the root. It is mounted on
            the authed surfaces only: ProtectedRoute (the (app) group + the
            standalone authed routes) and AuthAwareShell (the authed (shell)
            view), plus app/dev/layout.tsx for the dev token galleries. Marketing
            surfaces get NO provider, so the .dark class is never owned there.
            F-482 adds the pre-paint script above (light by construction on full
            load) and the MarketingThemeGuard below (strips .dark on client-side
            nav into marketing). Dark mode + the ThemeToggle stay fully live for
            authed users. */}
        {/* F-482 — client-nav guard: strips a stale .dark when an authed dark
            session routes into a marketing path without a full reload. No-op on
            authed paths. */}
        <MarketingThemeGuard />
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
      </body>
    </html>
  )
}
