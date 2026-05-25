/**
 * M0 FE Route Audit — standalone Playwright script (no test runner)
 * Usage: node scripts/m0-audit.mjs
 * Dev server must be running on http://localhost:3000
 */
import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.join(__dirname, '..')

const ROUTES = [
  // --- static ---
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
  { path: '/diagnostic', slug: 'diagnostic', isDynamic: false },
  { path: '/diagnostic/results', slug: 'diagnostic-results', isDynamic: false },
  { path: '/ecole', slug: 'ecole', isDynamic: false },
  { path: '/vocabulaire', slug: 'vocabulaire', isDynamic: false },
  { path: '/vocabulaire/practice', slug: 'vocabulaire-practice', isDynamic: false },
  { path: '/vocabulaire/test', slug: 'vocabulaire-test', isDynamic: false },
  { path: '/fr', slug: 'fr', isDynamic: false },
  { path: '/fr/exam-prep', slug: 'fr-exam-prep', isDynamic: false },
  { path: '/fr/library', slug: 'fr-library', isDynamic: false },
  { path: '/ecole/intro', slug: 'ecole-intro', isDynamic: false },
  { path: '/onboarding', slug: 'onboarding', isDynamic: false },
  { path: '/onboarding/waitlist', slug: 'onboarding-waitlist', isDynamic: false },
  { path: '/speaking', slug: 'speaking', isDynamic: false },
  { path: '/speaking/tache-1', slug: 'speaking-tache-1', isDynamic: false },
  { path: '/speaking/tache-2', slug: 'speaking-tache-2', isDynamic: false },
  { path: '/writing', slug: 'writing', isDynamic: false },
  { path: '/writing/history', slug: 'writing-history', isDynamic: false },
  { path: '/legal/privacy', slug: 'legal-privacy', isDynamic: false },
  { path: '/legal/tos', slug: 'legal-tos', isDynamic: false },
  // --- dynamic (placeholder params) ---
  { path: '/cluster/test-slug', slug: 'cluster-slug', isDynamic: true, note: '[slug]' },
  { path: '/learn/test-module', slug: 'learn-module-id', isDynamic: true, note: '[module_id]' },
  { path: '/diagnostic/tache/1', slug: 'diagnostic-tache-n', isDynamic: true, note: '[n]=1' },
  { path: '/ecole/test-lesson', slug: 'ecole-id', isDynamic: true, note: '(app)/ecole/[id]' },
  { path: '/ecole/lesson/test-id', slug: 'ecole-lesson-id', isDynamic: true, note: '[id]' },
  { path: '/ecole/lesson/test-id/quiz', slug: 'ecole-lesson-quiz', isDynamic: true, note: '[id]/quiz' },
  { path: '/speaking/tache-1/test-topic', slug: 'speaking-tache1-topic', isDynamic: true, note: '[topic]' },
  { path: '/speaking/tache-2/test-scenario', slug: 'speaking-tache2-scenario', isDynamic: true, note: '[scenario]' },
  { path: '/speaking/tache-3/test-topic', slug: 'speaking-tache3-topic', isDynamic: true, note: '[topic]' },
  { path: '/speaking/feedback/test-session', slug: 'speaking-feedback-session', isDynamic: true, note: '[session]' },
  { path: '/vocabulaire/test-slug', slug: 'vocabulaire-slug', isDynamic: true, note: '[slug]' },
  { path: '/vocabulaire/test-slug/practice', slug: 'vocabulaire-slug-practice', isDynamic: true, note: '[slug]/practice' },
  { path: '/vocabulaire/test-slug/test', slug: 'vocabulaire-slug-test', isDynamic: true, note: '[slug]/test' },
  { path: '/writing/test-prompt', slug: 'writing-prompt-id', isDynamic: true, note: '[prompt_id]' },
]

const LEGACY_STRINGS = [
  'FluentPath', 'FluentPrep',
  'Le Vocabulaire', 'Le Diagnostic', "L'École", "L'Ecole",
  'Le Fond', 'Moules des Idées', 'Réflexes Anglais', 'La Voix',
]

async function launchBrowser() {
  return chromium.launch({ headless: true })
}

async function auditRoute(browser, route, screenshotDir) {
  const consoleErrors = []
  const networkErrors = []
  let httpStatus = 0
  let renders = false
  let authGated = false
  let state = 'unknown'
  let pageTitle = ''
  let finalUrl = ''
  let legacyStrings = []

  let ctx = null
  let page = null

  try {
    ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    page = await ctx.newPage()

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const txt = msg.text()
        // Filter noise
        if (!txt.includes('favicon') && !txt.includes('ResizeObserver') &&
            !txt.includes('net::ERR_ABORTED') && !txt.includes('404')) {
          consoleErrors.push(txt.slice(0, 300))
        }
      }
    })

    page.on('response', response => {
      const url = response.url()
      const status = response.status()
      if (url.includes('localhost:3000') && status >= 400 && !url.includes('favicon')) {
        networkErrors.push(`${status} ${url.replace('http://localhost:3000', '')}`)
      }
    })

    const response = await page.goto(`http://localhost:3000${route.path}`, {
      waitUntil: 'load',
      timeout: 15000,
    })

    httpStatus = response?.status() ?? 0
    finalUrl = page.url()
    pageTitle = await page.title()

    renders = httpStatus < 400

    // Auth gate: redirected away from the intended route to login/signup
    const redirectedToAuth = (
      finalUrl.includes('/login') ||
      finalUrl.includes('/signup')
    )
    authGated = redirectedToAuth &&
      route.path !== '/login' &&
      route.path !== '/signup'

    if (authGated) {
      state = 'auth_gate'
    } else if (httpStatus === 404) {
      state = '404'
    } else if (httpStatus >= 500) {
      state = 'server_error'
    } else if (renders) {
      // Short wait for JS to hydrate
      await page.waitForTimeout(1500)

      const bodyText = await page.locator('body').textContent().catch(() => '')
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
      timeout: 12000,
    })
  } catch (err) {
    if (state === 'unknown') state = 'timeout'
    renders = false
    console.error(`    ERROR on ${route.path}: ${err.message.slice(0, 120)}`)
  } finally {
    try { await ctx?.close() } catch {}
  }

  // Mobile screenshot (best-effort, separate browser context)
  let mobileCtx = null
  try {
    mobileCtx = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
    })
    const mobilePage = await mobileCtx.newPage()
    await mobilePage.goto(`http://localhost:3000${route.path}`, {
      waitUntil: 'load',
      timeout: 15000,
    })
    await mobilePage.waitForTimeout(1000)
    await mobilePage.screenshot({
      path: path.join(screenshotDir, `${route.slug}-375.png`),
      fullPage: true,
      timeout: 12000,
    })
  } catch {
    // non-fatal
  } finally {
    try { await mobileCtx?.close() } catch {}
  }

  return { ...route, httpStatus, renders, authGated, finalUrl, pageTitle, state, consoleErrors, networkErrors, legacyStrings }
}

const STATE_EMOJI = {
  complete: '✅',
  partial: '⚠️',
  placeholder: '🟡',
  auth_gate: '🔐',
  '404': '❌',
  server_error: '🔴',
  timeout: '⏱️',
  unknown: '❓',
}

function generateMarkdown(results) {
  const DATE = '2026-05-25'
  const totalRoutes = results.length
  const placeholders = results.filter(r => r.state === 'placeholder')
  const broken = results.filter(r => ['404', 'server_error', 'timeout'].includes(r.state))
  const withConsoleErrors = results.filter(r => r.consoleErrors.length > 0)
  const withLegacy = results.filter(r => r.legacyStrings.length > 0)
  const authGated = results.filter(r => r.authGated)
  const allLegacy = results.flatMap(r => r.legacyStrings.map(s => ({ route: r.path, str: s })))

  const tableRows = results.map(r => {
    const shots = `[1440](audit-screenshots/${r.slug}-1440.png) [375](audit-screenshots/${r.slug}-375.png)`
    const cons = r.consoleErrors.length > 0 ? `${r.consoleErrors.length} err` : '—'
    const net = r.networkErrors.length > 0 ? r.networkErrors.slice(0, 1).join('; ') : '—'
    const auth = r.authGated ? '🔐' : '—'
    const legacy = r.legacyStrings.length > 0 ? r.legacyStrings.join(', ') : '—'
    const rend = r.renders ? '✅' : '❌'
    return `| \`${r.path}\` | ${rend} | ${auth} | ${STATE_EMOJI[r.state] ?? '❓'} ${r.state} | ${cons} | ${net} | ${legacy} | ${shots} |`
  }).join('\n')

  const findings = []

  if (placeholders.length > 0) {
    findings.push(`### Empty / placeholder surfaces (${placeholders.length}) — M1 target`)
    findings.push(placeholders.map(r => `- \`${r.path}\``).join('\n'))
  }

  if (broken.length > 0) {
    findings.push(`### Broken / unreachable routes (${broken.length})`)
    findings.push(broken.map(r => `- \`${r.path}\` — **${r.state}** (HTTP ${r.httpStatus})`).join('\n'))
  }

  if (authGated.length > 0) {
    findings.push(`### Auth-gated routes (${authGated.length}) — verify ProtectedRoute coverage is intentional`)
    findings.push(authGated.map(r => `- \`${r.path}\` → \`${r.finalUrl.replace('http://localhost:3000', '')}\``).join('\n'))
  }

  if (withConsoleErrors.length > 0) {
    findings.push(`### Routes with console errors (${withConsoleErrors.length}) — M1 target`)
    withConsoleErrors.forEach(r => {
      findings.push(`**\`${r.path}\`**`)
      r.consoleErrors.forEach(e => findings.push(`- \`${e.slice(0, 200)}\``))
    })
  }

  if (allLegacy.length > 0) {
    findings.push(`### Legacy name strings (${allLegacy.length} hits across ${withLegacy.length} routes) — M2 target`)
    allLegacy.forEach(({ route, str }) => findings.push(`- \`${route}\` → \`${str}\``))
  }

  const dynamic = results.filter(r => r.isDynamic)
  if (dynamic.length > 0) {
    findings.push(`### Dynamic routes (tested with placeholder params)`)
    findings.push(dynamic.map(r => `- \`${r.path}\` _(${r.note ?? 'dynamic'})_`).join('\n'))
  }

  return `# M0 FE Route Audit — ${DATE}

**Generated:** ${DATE} | **Branch:** main | **Script:** \`scripts/m0-audit.mjs\`

## Summary

| Metric | Count |
|--------|-------|
| Total routes audited | ${totalRoutes} |
| Renders (HTTP < 400) | ${results.filter(r => r.renders).length} |
| Auth-gated (redirected) | ${authGated.length} |
| Placeholder / empty | ${placeholders.length} |
| Broken (404 / 5xx / timeout) | ${broken.length} |
| Routes with console errors | ${withConsoleErrors.length} |
| Routes with legacy name strings | ${withLegacy.length} |

## Route Table

| route | renders | auth | state | console errors | network errors | legacy strings | screenshots |
|-------|---------|------|-------|----------------|----------------|----------------|-------------|
${tableRows}

---

## Findings

${findings.join('\n\n')}

---

*Audit script: \`scripts/m0-audit.mjs\` — run: \`node scripts/m0-audit.mjs\` with dev server on :3000*
`
}

async function main() {
  const screenshotDir = path.join(REPO_ROOT, 'docs', 'audit-screenshots')
  fs.mkdirSync(screenshotDir, { recursive: true })

  console.log('Launching Chromium...')
  let browser = await launchBrowser()

  const results = []

  for (let i = 0; i < ROUTES.length; i++) {
    const route = ROUTES[i]
    process.stdout.write(`[${String(i + 1).padStart(2, '0')}/${ROUTES.length}] ${route.path} ... `)

    // Re-launch browser if it's gone (crash recovery)
    let isBrowserAlive = true
    try { await browser.version() } catch { isBrowserAlive = false }
    if (!isBrowserAlive) {
      console.log('\n  ⚠ Browser crashed — re-launching...')
      try { await browser.close() } catch {}
      browser = await launchBrowser()
    }

    const result = await auditRoute(browser, route, screenshotDir)
    results.push(result)
    console.log(`${STATE_EMOJI[result.state] ?? '?'} ${result.state} (HTTP ${result.httpStatus}) | console:${result.consoleErrors.length} net:${result.networkErrors.length}`)
  }

  await browser.close()

  const markdown = generateMarkdown(results)
  const outputPath = path.join(REPO_ROOT, 'docs', 'm0-fe-audit-2026-05-25.md')
  fs.writeFileSync(outputPath, markdown)

  const placeholders = results.filter(r => r.state === 'placeholder').length
  const errors = results.filter(r => r.consoleErrors.length > 0).length
  const legacy = results.filter(r => r.legacyStrings.length > 0).length
  const broken = results.filter(r => ['404', 'server_error', 'timeout'].includes(r.state)).length

  console.log('\n=== M0 Audit Complete ===')
  console.log(`Routes:       ${results.length}`)
  console.log(`Placeholder:  ${placeholders}`)
  console.log(`Console errs: ${errors}`)
  console.log(`Legacy names: ${legacy}`)
  console.log(`Broken:       ${broken}`)
  console.log(`Output:       ${outputPath}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
