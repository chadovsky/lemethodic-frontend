/**
 * M0 FE Route Audit — 2026-05-25
 * Navigates every app route, captures screenshots at 1440px + 375px,
 * records console errors, network errors, auth gates, and legacy strings.
 * Writes docs/m0-fe-audit-2026-05-25.md on completion.
 */
import { test, Browser } from '@playwright/test'
import fs from 'fs'
import path from 'path'

test.setTimeout(900_000)

interface RouteSpec {
  path: string
  slug: string
  isDynamic: boolean
  note?: string
}

interface RouteResult extends RouteSpec {
  httpStatus: number
  renders: boolean
  authGated: boolean
  finalUrl: string
  pageTitle: string
  state: 'complete' | 'partial' | 'placeholder' | 'auth_gate' | '404' | 'server_error' | 'timeout' | 'unknown'
  consoleErrors: string[]
  networkErrors: string[]
  legacyStrings: string[]
}

const STATIC_ROUTES: RouteSpec[] = [
  { path: '/', slug: 'home', isDynamic: false },
  { path: '/exam-prep', slug: 'exam-prep', isDynamic: false },
  { path: '/library', slug: 'library', isDynamic: false },
  { path: '/login', slug: 'login', isDynamic: false },
  { path: '/method', slug: 'method', isDynamic: false },
  { path: '/more', slug: 'more', isDynamic: false },
  { path: '/password-reset', slug: 'password-reset', isDynamic: false },
  { path: '/paywall', slug: 'paywall', isDynamic: false },
  { path: '/privacy', slug: 'privacy', isDynamic: false },
  { path: '/profile', slug: 'profile', isDynamic: false },
  { path: '/progress', slug: 'progress', isDynamic: false },
  { path: '/refund', slug: 'refund', isDynamic: false },
  { path: '/signup', slug: 'signup', isDynamic: false },
  { path: '/terms', slug: 'terms', isDynamic: false },
  { path: '/verify-email', slug: 'verify-email', isDynamic: false },
  { path: '/account', slug: 'account', isDynamic: false },
  { path: '/dashboard', slug: 'dashboard', isDynamic: false },
  { path: '/l-examen', slug: 'l-examen', isDynamic: false },
  { path: '/l-examen/results', slug: 'l-examen-results', isDynamic: false },
  { path: '/cours/methode-tcf-canada', slug: 'la-methode', isDynamic: false },
  { path: '/la-bibliotheque', slug: 'la-bibliotheque', isDynamic: false },
  { path: '/la-bibliotheque/practice', slug: 'la-bibliotheque-practice', isDynamic: false },
  { path: '/la-bibliotheque/test', slug: 'la-bibliotheque-test', isDynamic: false },
  { path: '/fr', slug: 'fr', isDynamic: false },
  { path: '/fr/exam-prep', slug: 'fr-exam-prep', isDynamic: false },
  { path: '/fr/library', slug: 'fr-library', isDynamic: false },
  { path: '/cours/methode-tcf-canada/intro', slug: 'la-methode-intro', isDynamic: false },
  { path: '/onboarding', slug: 'onboarding', isDynamic: false },
  { path: '/onboarding/waitlist', slug: 'onboarding-waitlist', isDynamic: false },
  { path: '/speaking', slug: 'speaking', isDynamic: false },
  { path: '/speaking/tache-1', slug: 'speaking-tache-1', isDynamic: false },
  { path: '/speaking/tache-2', slug: 'speaking-tache-2', isDynamic: false },
  { path: '/writing', slug: 'writing', isDynamic: false },
  { path: '/writing/history', slug: 'writing-history', isDynamic: false },
  { path: '/legal/privacy', slug: 'legal-privacy', isDynamic: false },
  { path: '/legal/tos', slug: 'legal-tos', isDynamic: false },
]

const DYNAMIC_ROUTES: RouteSpec[] = [
  { path: '/cluster/test-slug', slug: 'cluster-slug', isDynamic: true, note: '[slug]' },
  { path: '/learn/test-module', slug: 'learn-module-id', isDynamic: true, note: '[module_id]' },
  { path: '/l-examen/tache/1', slug: 'l-examen-tache-n', isDynamic: true, note: '[n]=1' },
  { path: '/cours/methode-tcf-canada/test-lesson', slug: 'la-methode-id', isDynamic: true, note: '(app)/cours/methode-tcf-canada/[id]' },
  { path: '/cours/methode-tcf-canada/lesson/test-id', slug: 'la-methode-lesson-id', isDynamic: true, note: '[id]' },
  { path: '/cours/methode-tcf-canada/lesson/test-id/quiz', slug: 'la-methode-lesson-quiz', isDynamic: true, note: '[id]/quiz' },
  { path: '/speaking/tache-1/test-topic', slug: 'speaking-tache1-topic', isDynamic: true, note: '[topic]' },
  { path: '/speaking/tache-2/test-scenario', slug: 'speaking-tache2-scenario', isDynamic: true, note: '[scenario]' },
  { path: '/speaking/tache-3/test-topic', slug: 'speaking-tache3-topic', isDynamic: true, note: '[topic]' },
  { path: '/speaking/feedback/test-session', slug: 'speaking-feedback-session', isDynamic: true, note: '[session]' },
  { path: '/la-bibliotheque/test-slug', slug: 'la-bibliotheque-slug', isDynamic: true, note: '[slug]' },
  { path: '/la-bibliotheque/test-slug/practice', slug: 'la-bibliotheque-slug-practice', isDynamic: true, note: '[slug]/practice' },
  { path: '/la-bibliotheque/test-slug/test', slug: 'la-bibliotheque-slug-test', isDynamic: true, note: '[slug]/test' },
  { path: '/writing/test-prompt', slug: 'writing-prompt-id', isDynamic: true, note: '[prompt_id]' },
]

const LEGACY_STRINGS = [
  'FluentPath', 'FluentPrep',
  'Le Vocabulaire', 'Le Diagnostic', "L'École", "L'Ecole",
  'Le Fond', 'Moules des Idées', 'Réflexes Anglais', 'La Voix',
]

async function auditRoute(
  browser: Browser,
  route: RouteSpec,
  screenshotDir: string
): Promise<RouteResult> {
  const consoleErrors: string[] = []
  const networkErrors: string[] = []
  let httpStatus = 0
  let renders = false
  let authGated = false
  let state: RouteResult['state'] = 'unknown'
  let pageTitle = ''
  let finalUrl = ''
  let legacyStrings: string[] = []

  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await desktopCtx.newPage()

  page.on('console', msg => {
    if (msg.type() === 'error') {
      const txt = msg.text()
      if (!txt.includes('favicon') && !txt.includes('ResizeObserver')) {
        consoleErrors.push(txt.slice(0, 300))
      }
    }
  })

  page.on('response', response => {
    const url = response.url()
    const status = response.status()
    if (url.includes('localhost:3000') && status >= 400) {
      networkErrors.push(`${status} ${url.replace('http://localhost:3000', '')}`)
    }
  })

  try {
    const response = await page.goto(`http://localhost:3000${route.path}`, {
      waitUntil: 'networkidle',
      timeout: 20_000,
    })

    httpStatus = response?.status() ?? 0
    finalUrl = page.url()
    pageTitle = await page.title()

    renders = httpStatus < 400
    authGated = (
      finalUrl.includes('/login') ||
      finalUrl.includes('/signup') ||
      finalUrl.includes('/onboarding')
    ) && route.path !== '/login' && route.path !== '/signup' && route.path !== '/onboarding' && !route.path.startsWith('/onboarding')

    if (authGated) {
      state = 'auth_gate'
    } else if (httpStatus === 404) {
      state = '404'
    } else if (httpStatus >= 500) {
      state = 'server_error'
    } else if (renders) {
      const bodyText = await page.locator('body').textContent() ?? ''
      for (const s of LEGACY_STRINGS) {
        if (bodyText.includes(s)) legacyStrings.push(s)
      }
      const trimmed = bodyText.trim()
      if (trimmed.length < 100) {
        state = 'placeholder'
      } else if (consoleErrors.length > 0) {
        state = 'partial'
      } else {
        state = 'complete'
      }
    }

    await page.screenshot({
      path: path.join(screenshotDir, `${route.slug}-1440.png`),
      fullPage: true,
      timeout: 15_000,
    })
  } catch {
    state = 'timeout'
    renders = false
  }

  await desktopCtx.close()

  // Mobile screenshot (best-effort)
  try {
    const mobileCtx = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
    })
    const mobilePage = await mobileCtx.newPage()
    await mobilePage.goto(`http://localhost:3000${route.path}`, {
      waitUntil: 'networkidle',
      timeout: 20_000,
    })
    await mobilePage.screenshot({
      path: path.join(screenshotDir, `${route.slug}-375.png`),
      fullPage: true,
      timeout: 15_000,
    })
    await mobileCtx.close()
  } catch {
    // non-fatal
  }

  return {
    ...route,
    httpStatus,
    renders,
    authGated,
    finalUrl,
    pageTitle,
    state,
    consoleErrors,
    networkErrors,
    legacyStrings,
  }
}

function stateEmoji(state: RouteResult['state']): string {
  const map: Record<RouteResult['state'], string> = {
    complete: '✅',
    partial: '⚠️',
    placeholder: '🟡',
    auth_gate: '🔐',
    '404': '❌',
    server_error: '🔴',
    timeout: '⏱️',
    unknown: '❓',
  }
  return map[state] ?? '❓'
}

function generateMarkdown(results: RouteResult[]): string {
  const now = '2026-05-25'
  const totalRoutes = results.length
  const placeholderCount = results.filter(r => r.state === 'placeholder').length
  const consoleErrorCount = results.filter(r => r.consoleErrors.length > 0).length
  const legacyCount = results.filter(r => r.legacyStrings.length > 0).length
  const authGateCount = results.filter(r => r.authGated).length
  const errorCount = results.filter(r => ['404', 'server_error', 'timeout'].includes(r.state)).length
  const allLegacy = results.flatMap(r => r.legacyStrings.map(s => ({ route: r.path, str: s })))

  const tableRows = results.map(r => {
    const screenshotCell = `[1440](audit-screenshots/${r.slug}-1440.png) [375](audit-screenshots/${r.slug}-375.png)`
    const consoleCell = r.consoleErrors.length > 0 ? `${r.consoleErrors.length} error(s)` : '—'
    const networkCell = r.networkErrors.length > 0 ? r.networkErrors.slice(0, 2).join('; ') : '—'
    const authCell = r.authGated ? '🔐 yes' : '—'
    const legacyCell = r.legacyStrings.length > 0 ? r.legacyStrings.join(', ') : '—'
    const rendersCell = r.renders ? '✅' : '❌'
    return `| \`${r.path}\` | ${rendersCell} | ${authCell} | ${stateEmoji(r.state)} ${r.state} | ${consoleCell} | ${networkCell} | ${legacyCell} | ${screenshotCell} |`
  }).join('\n')

  const findings: string[] = []

  // Empty / placeholder surfaces
  const placeholders = results.filter(r => r.state === 'placeholder')
  if (placeholders.length > 0) {
    findings.push(`### Empty / placeholder surfaces (${placeholders.length})`)
    findings.push(placeholders.map(r => `- \`${r.path}\` — body text < 100 chars`).join('\n'))
  }

  // 404 / server error routes
  const broken = results.filter(r => ['404', 'server_error', 'timeout'].includes(r.state))
  if (broken.length > 0) {
    findings.push(`### Broken / unreachable routes (${broken.length})`)
    findings.push(broken.map(r => `- \`${r.path}\` — ${r.state} (HTTP ${r.httpStatus})`).join('\n'))
  }

  // Auth-gated routes
  const gated = results.filter(r => r.authGated)
  if (gated.length > 0) {
    findings.push(`### Auth-gated routes (${gated.length})`)
    findings.push(gated.map(r => `- \`${r.path}\` → redirected to \`${r.finalUrl.replace('http://localhost:3000', '')}\``).join('\n'))
  }

  // Console errors
  const withErrors = results.filter(r => r.consoleErrors.length > 0)
  if (withErrors.length > 0) {
    findings.push(`### Routes with console errors (${withErrors.length})`)
    withErrors.forEach(r => {
      findings.push(`**\`${r.path}\`**`)
      r.consoleErrors.forEach(e => findings.push(`- \`${e.slice(0, 200)}\``))
    })
  }

  // Legacy strings
  if (allLegacy.length > 0) {
    findings.push(`### Legacy name strings (${allLegacy.length} hits across ${legacyCount} routes) — M2 target`)
    allLegacy.forEach(({ route, str }) => {
      findings.push(`- \`${route}\` contains \`${str}\``)
    })
  }

  // Dynamic routes note
  const dynamic = results.filter(r => r.isDynamic)
  if (dynamic.length > 0) {
    findings.push(`### Dynamic routes tested with placeholder params`)
    findings.push(dynamic.map(r => `- \`${r.path}\` (${r.note ?? 'dynamic'})`).join('\n'))
  }

  return `# M0 FE Route Audit — ${now}

**Generated:** ${now} | **Branch:** main | **Commit:** M0

## Summary

| Metric | Count |
|--------|-------|
| Total routes audited | ${totalRoutes} |
| Renders (HTTP < 400) | ${results.filter(r => r.renders).length} |
| Auth-gated (redirected) | ${authGateCount} |
| Placeholder / empty | ${placeholderCount} |
| Broken (404 / 5xx / timeout) | ${errorCount} |
| Routes with console errors | ${consoleErrorCount} |
| Routes with legacy name strings | ${legacyCount} |

## Route Table

| route | renders | auth | state | console errors | network errors | legacy strings | screenshots |
|-------|---------|------|-------|----------------|----------------|----------------|-------------|
${tableRows}

---

## Findings

${findings.join('\n\n')}

---

*Audit script: \`tests/e2e/m0-audit.spec.ts\` — run with \`pnpm test:e2e tests/e2e/m0-audit.spec.ts --project=desktop\`*
`
}

test('M0 FE route audit', async ({ browser }) => {
  const repoRoot = process.cwd()
  const screenshotDir = path.join(repoRoot, 'docs', 'audit-screenshots')
  fs.mkdirSync(screenshotDir, { recursive: true })

  const allRoutes: RouteSpec[] = [...STATIC_ROUTES, ...DYNAMIC_ROUTES]
  const results: RouteResult[] = []

  console.log(`Auditing ${allRoutes.length} routes...`)

  for (const route of allRoutes) {
    console.log(`  → ${route.path}`)
    const result = await auditRoute(browser, route, screenshotDir)
    results.push(result)
    console.log(`     state=${result.state} http=${result.httpStatus} errors=${result.consoleErrors.length}`)
  }

  const markdown = generateMarkdown(results)
  fs.writeFileSync(
    path.join(repoRoot, 'docs', 'm0-fe-audit-2026-05-25.md'),
    markdown
  )

  // Print summary to stdout for easy reading
  const placeholders = results.filter(r => r.state === 'placeholder').length
  const errors = results.filter(r => r.consoleErrors.length > 0).length
  const legacy = results.filter(r => r.legacyStrings.length > 0).length
  const broken = results.filter(r => ['404', 'server_error', 'timeout'].includes(r.state)).length
  console.log(`\n=== M0 Audit Summary ===`)
  console.log(`Total routes: ${results.length}`)
  console.log(`Placeholder:  ${placeholders}`)
  console.log(`Console errs: ${errors}`)
  console.log(`Legacy names: ${legacy}`)
  console.log(`Broken:       ${broken}`)
  console.log(`Audit written to docs/m0-fe-audit-2026-05-25.md`)
})
