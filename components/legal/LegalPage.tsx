// B-102 — shared shell for /privacy, /terms, /refund. Server Component:
// reads the source markdown from docs/ at request time (statically rendered
// in production builds, so I/O is cheap), parses with react-markdown +
// remark-gfm, and emits styled HTML inside the .prose-legal container
// defined in app/globals.css.
//
// EN-only at v1. FR translations file as M-101.x post-launch. The footer
// shows whatever lang the user chose on the landing page is irrelevant
// here — legal docs are EN; the footer copy is rendered with lang='en'
// to keep nav strings consistent with the doc body.

import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import LandingFooter from '../landing/LandingFooter'
import { BRAND } from '../landing/copy'
import { DISPLAY_FONT, INK } from '../onboarding/OnboardingScreen'

const PAGE_BG = '#FFFFFF'

interface LegalPageProps {
  // Filename in docs/, e.g. "privacy-policy.md"
  docFile: string
}

export default function LegalPage({ docFile }: LegalPageProps) {
  const fullPath = path.join(process.cwd(), 'docs', docFile)
  const content = fs.readFileSync(fullPath, 'utf-8')

  return (
    <main
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: PAGE_BG }}
    >
      {/* Header — brand wordmark links back to landing. No language toggle:
          legal pages are EN-only at v1. */}
      <header
        className="w-full"
        style={{ padding: '20px 24px 8px', maxWidth: 1080, margin: '0 auto' }}
      >
        <Link
          href="/"
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 800,
            fontSize: 22,
            color: INK,
            letterSpacing: '-0.01em',
            textDecoration: 'none',
          }}
        >
          {BRAND}
        </Link>
      </header>

      {/* Markdown body */}
      <article
        className="prose-legal w-full"
        style={{ padding: '32px 24px 64px', flex: 1 }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>

      {/* Footer (same as landing) */}
      <LandingFooter lang="en" />
    </main>
  )
}
