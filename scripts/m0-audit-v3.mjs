/**
 * M0 FE Route Audit v3 — verified-account re-run.
 * Usage: node scripts/m0-audit-v3.mjs
 * Requires:
 *   - Dev server on http://localhost:3000
 *   - audit-auth-verified.json in repo root (created by save-auth-state.js)
 *
 * Output: docs/m0-fe-audit-v3-2026-05-25.md + docs/audit-screenshots/v3/
 */
import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.join(__dirname, '..')
const AUTH_STATE_PATH = path.join(REPO_ROOT, 'audit-auth-verified.json')
const BASE_URL = 'http://localhost:3000'
const DATE = '2026-05-25'

if (!fs.existsSync(AUTH_STATE_PATH)) {
  console.error(`ERROR: ${AUTH_STATE_PATH} not found.`)
  console.error('Run `node scripts/save-auth-state.js` first to capture verified-account session.')
  process.exit(1)
}

// Same route list as v2 — keep in sync with scripts/m0-audit.mjs
const ROUTES = [
  // public
  { path: '/', slug: 'home', type: 'public' },
  { path: '/exam-prep', slug: 'exam-prep', type: 'public' },
  { path: '/fr', slug: 'fr', type: 'public' },
  { path: '/fr/exam-prep', slug: 'fr-exam-prep', type: 'public' },
  { path: '/fr/library', slug: 'fr-library', type: 'public' },
  { path: '/library', slug: 'library', type: 'public' },
  { path: '/login', slug: 'login', type: 'public' },
  { path: '/signup', slug: 'signup', type: 'public' },
  { path: '/onboarding', slug: 'onboarding', type: 'public' },
  { path: '/verify-email', slug: 'verify-email', type: 'public' },
  { path: '/password-reset', slug: 'password-reset', type: 'public' },
  { path: '/legal/privacy', slug: 'legal-privacy', type: 'public' },
  { path: '/legal/tos', slug: 'legal-tos', type: 'public' },
  { path: '/privacy', slug: 'privacy', type: 'public' },
  { path: '/terms', slug: 'terms', type: 'public' },
  { path: '/paywall', slug: 'paywall', type: 'public' },
  { path: '/refund', slug: 'refund', type: 'public' },
  { path: '/method', slug: 'method', type: 'public' },
  // protected
  { path: '/dashboard', slug: 'dashboard', type: 'protected' },
  { path: '/account', slug: 'account', type: 'protected' },
  { path: '/l-examen', slug: 'l-examen', type: 'protected' },
  { path: '/l-examen/tache/1', slug: 'l-examen-tache-1', type: 'protected' },
  { path: '/l-examen/tache/2', slug: 'l-examen-tache-2', type: 'protected' },
  { path: '/l-examen/tache/3', slug: 'l-examen-tache-3', type: 'protected' },
  { path: '/l-examen/results', slug: 'l-examen-results', type: 'protected' },
  { path: '/la-methode', slug: 'la-methode', type: 'protected', note: 'V-016c' },
  { path: '/la-methode/1', slug: 'la-methode-1', type: 'protected' },
  { path: '/la-bibliotheque', slug: 'la-bibliotheque', type: 'protected' },
  { path: '/la-bibliotheque/practice', slug: 'la-bibliotheque-practice', type: 'protected' },
  { path: '/la-bibliotheque/test', slug: 'la-bibliotheque-test', type: 'protected' },
  { path: '/la-methode/intro', slug: 'la-methode-intro', type: 'protected' },
  { path: '/la-methode/lesson/1', slug: 'la-methode-lesson-1', type: 'protected' },
  { path: '/la-methode/lesson/1/quiz', slug: 'la-methode-lesson-1-quiz', type: 'protected' },
  { path: '/la-bibliotheque/accord-du-participe', slug: 'la-bibliotheque-accord', type: 'protected' },
  { path: '/cluster/grammaire', slug: 'cluster-grammaire', type: 'protected' },
  { path: '/learn/1', slug: 'learn-1', type: 'protected' },
  { path: '/speaking', slug: 'speaking', type: 'protected' },
  { path: '/speaking/tache-1', slug: 'speaking-tache-1', type: 'protected' },
  { path: '/speaking/tache-1/description', slug: 'speaking-tache-1-description', type: 'protected' },
  { path: '/speaking/tache-2', slug: 'speaking-tache-2', type: 'protected' },
  { path: '/speaking/tache-2/conversation', slug: 'speaking-tache-2-conversation', type: 'protected' },
  { path: '/speaking/tache-3/description', slug: 'speaking-tache-3-description', type: 'protected' },
  { path: '/speaking/feedback/session-abc', slug: 'speaking-feedback', type: 'protected' },
  { path: '/progress', slug: 'progress', type: 'protected' },
  { path: '/profile', slug: 'profile', type: 'protected' },
  { path: '/more', slug: 'more', type: 'protected' },
  { path: '/writing', slug: 'writing', type: 'protected' },
  { path: '/writing/1', slug: 'writing-1', type: 'protected' },
  { path: '/writing/history', slug: 'writing-history', type: 'protected' },
  { path: '/onboarding/waitlist', slug: 'onboarding-waitlist', type: 'protected' },
]

const LEGACY_STRINGS = [
  'FluentPath', 'FluentPrep',
  'Le Vocabulaire', 'Le Diagnostic', "L'École", "L'Ecole",
  'Le Fond', 'Moules des Idées', 'Réflexes Anglais', 'La Voix',
]

// V2 auth state for comparison (used for state_delta_vs_v2 column)
const V2_AUTH_STATES = {
  '/': 'complete',
  '/exam-prep': 'partial',
  '/fr': 'complete',
  '/fr/exam-prep': 'partial',
  '/fr/library': 'partial',
  '/library': 'partial',
  '/login': 'partial',
  '/signup': 'empty',
  '/onboarding': 'complete',
  '/verify-email': 'partial',
  '/password-reset': 'empty',
  '/legal/privacy': 'empty',
  '/legal/tos': 'empty',
  '/privacy': 'complete',
  '/terms': 'complete',
  '/paywall': 'partial',
  '/refund': 'complete',
  '/method': 'empty',
  '/dashboard': 'partial',
  '/account': 'empty',
  '/l-examen': 'complete',
  '/l-examen/tache/1': 'partial',
  '/l-examen/tache/2': 'empty',
  '/l-examen/tache/3': 'empty',
  '/l-examen/results': 'complete',
  '/la-methode': 'partial',
  '/la-methode/1': 'partial',
  '/la-bibliotheque': 'partial',
  '/la-bibliotheque/practice': 'empty',
  '/la-bibliotheque/test': 'empty',
  '/la-methode/intro': 'complete',
  '/la-methode/lesson/1': 'partial',
  '/la-methode/lesson/1/quiz': 'empty',
  '/la-bibliotheque/accord-du-participe': 'partial',
  '/cluster/grammaire': 'partial',
  '/learn/1': 'partial',
  '/speaking': 'partial',
  '/speaking/tache-1': 'partial',
  '/speaking/tache-1/description': 'partial',
  '/speaking/tache-2': 'partial',
  '/speaking/tache-2/conversation': 'empty',
  '/speaking/tache-3/description': 'partial',
  '/speaking/feedback/session-abc': 'empty',
  '/progress': 'partial',
  '/profile': 'partial',
  '/more': 'partial',
  '/writing': 'complete',
  '/writing/1': 'partial',
  '/writing/history': 'empty',
  '/onboarding/waitlist': 'partial',
}

function stateDelta(v3State, routePath) {
  const v2 = V2_AUTH_STATES[routePath]
  if (!v2) return 'n/a'
  if (v2 === v3State) return 'same'
  const rank = { complete: 3, partial: 2, empty: 1, placeholder: 0 }
  const v2r = rank[v2] ?? -1
  const v3r = rank[v3State] ?? -1
  if (v3r > v2r) return 'improved'
  if (v3r < v2r) return 'worse'
  return 'same'
}

function classifyState(bodyText, consoleErrors, finalUrl) {
  if (finalUrl.includes('/verify-email')) return 'partial'
  if (finalUrl.includes('/login') || finalUrl.includes('/signup')) return 'auth_gate'

  const len = bodyText.trim().length
  if (len < 200) return 'empty'
  if (len < 500 || consoleErrors.length > 0) return 'partial'
  return 'complete'
}

async function capture(context, slug, screenshotDir, viewport, contextLabel) {
  const page = await context.newPage()
  try {
    const fname = `${slug}-${viewport}-${contextLabel}.png`
    await page.screenshot({ path: path.join(screenshotDir, fname), fullPage: true, timeout: 12000 })
  } catch {}
  await page.close()
}

async function auditRoute(browser, route, screenshotDir) {
  const result = {
    ...route,
    unauth_final_url: '',
    unauth_state: 'unknown',
    auth_final_url: '',
    auth_state: 'unknown',
    auth_body_len: 0,
    errors: [],
    legacy_hits: 0,
    state_delta_vs_v2: 'n/a',
  }

  // --- Unauth pass ---
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()

    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'load', timeout: 15000 })
    await page.waitForTimeout(1500)
    result.unauth_final_url = page.url().replace(BASE_URL, '') || '/'

    const bodyText = await page.locator('body').textContent().catch(() => '')
    const consoleErrs = []
    page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()) })
    result.unauth_state = classifyState(bodyText, consoleErrs, result.unauth_final_url)

    await page.screenshot({ path: path.join(screenshotDir, `${route.slug}-1440-unauth.png`), fullPage: true, timeout: 12000 })

    // Mobile unauth
    const mCtx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true })
    const mPage = await mCtx.newPage()
    await mPage.goto(`${BASE_URL}${route.path}`, { waitUntil: 'load', timeout: 15000 }).catch(() => {})
    await mPage.waitForTimeout(1000)
    await mPage.screenshot({ path: path.join(screenshotDir, `${route.slug}-375-unauth.png`), fullPage: true, timeout: 12000 }).catch(() => {})
    await mCtx.close()
    await ctx.close()
  } catch (err) {
    result.errors.push(`unauth: ${err.message.slice(0, 120)}`)
    result.unauth_state = 'timeout'
  }

  // --- Auth (verified) pass ---
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      storageState: AUTH_STATE_PATH,
    })
    const page = await ctx.newPage()
    const consoleErrs = []
    page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()) })

    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'load', timeout: 15000 })
    await page.waitForTimeout(2500)
    result.auth_final_url = page.url().replace(BASE_URL, '') || '/'

    const bodyText = await page.locator('body').textContent().catch(() => '')
    result.auth_body_len = bodyText.trim().length
    result.auth_state = classifyState(bodyText, consoleErrs, result.auth_final_url)

    for (const s of LEGACY_STRINGS) {
      if (bodyText.includes(s)) result.legacy_hits++
    }

    await page.screenshot({ path: path.join(screenshotDir, `${route.slug}-1440-auth-verified.png`), fullPage: true, timeout: 12000 })

    // Mobile auth
    const mCtx = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      storageState: AUTH_STATE_PATH,
    })
    const mPage = await mCtx.newPage()
    await mPage.goto(`${BASE_URL}${route.path}`, { waitUntil: 'load', timeout: 15000 }).catch(() => {})
    await mPage.waitForTimeout(1500)
    await mPage.screenshot({ path: path.join(screenshotDir, `${route.slug}-375-auth-verified.png`), fullPage: true, timeout: 12000 }).catch(() => {})
    await mCtx.close()
    await ctx.close()
  } catch (err) {
    result.errors.push(`auth: ${err.message.slice(0, 120)}`)
    result.auth_state = 'timeout'
  }

  result.state_delta_vs_v2 = stateDelta(result.auth_state, route.path)
  return result
}

const STATE_RANK = { complete: 3, partial: 2, empty: 1, placeholder: 0 }

function generateReport(results) {
  const v2WasVerifyGated = new Set([
    '/la-methode', '/la-methode/1', '/la-bibliotheque', '/la-methode/lesson/1',
    '/la-bibliotheque/accord-du-participe', '/cluster/grammaire', '/learn/1',
    '/speaking', '/speaking/tache-2', '/progress', '/onboarding/waitlist',
    '/exam-prep', '/fr/exam-prep', '/paywall',
  ])

  const authComplete = results.filter(r => r.auth_state === 'complete')
  const authPartial = results.filter(r => r.auth_state === 'partial')
  const authEmpty = results.filter(r => r.auth_state === 'empty')
  const authPlaceholder = results.filter(r => r.auth_state === 'placeholder')
  const flipped = results.filter(r => {
    const v2 = V2_AUTH_STATES[r.path]
    return v2WasVerifyGated.has(r.path) && ['complete', 'partial'].includes(r.auth_state) && !r.auth_final_url.includes('/verify-email')
  })
  const stillBad = results.filter(r =>
    ['empty', 'placeholder'].includes(r.auth_state) &&
    !r.auth_final_url.includes('/verify-email')
  )
  const legacyTotal = results.reduce((s, r) => s + r.legacy_hits, 0)

  const ecole = results.find(r => r.path === '/la-methode')
  const v016cVerdict = (() => {
    if (!ecole) return 'inconclusive (route missing)'
    if (ecole.auth_final_url.includes('/verify-email')) return 'inconclusive (verify-email gate still active — auth state may be wrong)'
    if (ecole.auth_state === 'complete') return 'clean — /la-methode renders fully with verified account'
    if (ecole.auth_state === 'partial') return `broken — /la-methode rendered partial (${ecole.auth_body_len} chars) after auth`
    return `broken — /la-methode state: ${ecole.auth_state}, final: ${ecole.auth_final_url}`
  })()

  const tableRows = results.map(r => {
    const errFlag = r.errors.length > 0 ? '⚠' : ''
    const redirectNote = (url) => url !== r.path ? `→ ${url}` : url
    return `| \`${r.path}\` | ${r.type} | ${redirectNote(r.unauth_final_url)} | ${r.unauth_state} | ${redirectNote(r.auth_final_url)} | ${r.auth_state} | ${r.auth_body_len} | ${errFlag} | ${r.legacy_hits} | ${r.state_delta_vs_v2} | ${r.note ?? ''} |`
  }).join('\n')

  const flipList = flipped.map(r => `- \`${r.path}\` — v2: ${V2_AUTH_STATES[r.path] ?? '?'} → v3: ${r.auth_state} (was verify-gated in v2)`).join('\n')
  const stillBadList = stillBad.map(r => `- \`${r.path}\` — auth state: ${r.auth_state} (${r.auth_body_len} chars)`).join('\n')

  return `# M0 FE Route Audit v3 — ${DATE}

> **v3 re-audit** with verified account. v2 (f51f123) used an unverified account; data-heavy protected routes were gate-contaminated by the email-verification wall. v3 eliminates that variable.

## Summary

| Metric | Value |
|--------|-------|
| Audit date | ${DATE} |
| Auth account | verified (storageState from audit-auth-verified.json) |
| Total routes | ${results.length} |
| Public routes | ${results.filter(r => r.type === 'public').length} |
| Protected routes | ${results.filter(r => r.type === 'protected').length} |
| Auth complete | ${authComplete.length} |
| Auth partial | ${authPartial.length} |
| Auth empty | ${authEmpty.length} |
| Auth placeholder | ${authPlaceholder.length} |
| Flipped from empty/partial → complete (gate contamination cleared) | ${flipped.length} |
| Still empty/partial after verification (REAL M1 work) | ${stillBad.length} |
| V-016c status | **${v016cVerdict}** |
| Legacy-name hits (auth verified) | ${legacyTotal} |

## Route Table

| route | type | unauth final_url | unauth state | auth final_url | auth state | auth body len | errors | legacy hits | state_delta_vs_v2 | note |
|-------|------|------------------|--------------|----------------|------------|---------------|--------|-------------|-------------------|------|
${tableRows}

## Findings

### V-016c: /ecole in verified-account context
**Status: ${v016cVerdict.toUpperCase().split(' ')[0]}**

${ecole ? `Auth final URL: \`${ecole.auth_final_url}\` | body chars: ${ecole.auth_body_len} | state: ${ecole.auth_state}` : '_/ecole not found in results_'}

${ecole?.auth_state === 'complete' ? '_/ecole rendered fully. Fondations + Approfondissement sections should be visible in screenshots._' : '_See screenshot: `docs/audit-screenshots/v3/ecole-1440-auth-verified.png`_'}

### Gate-contamination flip (v2 partial/empty → v3 improved) — ${flipped.length} routes
These routes were empty/partial in v2 solely due to the email-verification wall:

${flipList || '_None flipped (all v2 empty/partial remain empty/partial — not gate-contaminated, REAL M1 work)_'}

### Still empty/partial with verified account — REAL M1 surface work (${stillBad.length} routes)
${stillBadList || '_None — all routes render complete or partial due to auth gates only_'}

### Legacy-name string count on protected surfaces (verified context)
- Total legacy hits: **${legacyTotal}**
${legacyTotal > 0 ? results.filter(r => r.legacy_hits > 0).map(r => `- \`${r.path}\` — ${r.legacy_hits} hit(s)`).join('\n') : '- _No legacy strings detected_'}

### Redirect surprises in verified context
${results.filter(r => r.auth_final_url !== r.path && !r.auth_final_url.includes('/verify-email')).map(r => `- \`${r.path}\` → \`${r.auth_final_url}\``).join('\n') || '_None_'}

### Routes still verify-email gated with verified account (unexpected)
${results.filter(r => r.auth_final_url.includes('/verify-email')).map(r => `- \`${r.path}\` → \`${r.auth_final_url}\` ← ⚠ storageState may be expired or unverified`).join('\n') || '_None — all routes escaped the verify-email gate_'}

## Screenshots

Saved to \`docs/audit-screenshots/v3/\` as \`<slug>-<viewport>-<context>.png\`.
- Context: \`unauth\` (no session) | \`auth-verified\` (verified account)
- Viewports: \`1440\` (desktop) | \`375\` (mobile)
`
}

async function main() {
  const screenshotDir = path.join(REPO_ROOT, 'docs', 'audit-screenshots', 'v3')
  fs.mkdirSync(screenshotDir, { recursive: true })

  console.log(`M0 FE Route Audit v3 — ${DATE}`)
  console.log(`Auth state: ${AUTH_STATE_PATH}`)
  console.log(`Screenshots → ${screenshotDir}\n`)

  let browser = await chromium.launch({ headless: true })

  const results = []
  for (let i = 0; i < ROUTES.length; i++) {
    const route = ROUTES[i]
    process.stdout.write(`[${String(i + 1).padStart(2, '0')}/${ROUTES.length}] ${route.path} ... `)
    try { await browser.version() } catch {
      console.log('\n  ⚠ Browser crashed — re-launching...')
      try { await browser.close() } catch {}
      browser = await chromium.launch({ headless: true })
    }
    const result = await auditRoute(browser, route, screenshotDir)
    results.push(result)
    console.log(`unauth:${result.unauth_state} auth:${result.auth_state} (${result.auth_body_len}c) delta:${result.state_delta_vs_v2}`)
  }

  await browser.close()

  const report = generateReport(results)
  const outputPath = path.join(REPO_ROOT, 'docs', 'm0-fe-audit-v3-2026-05-25.md')
  fs.writeFileSync(outputPath, report)

  const flipped = results.filter(r => r.state_delta_vs_v2 === 'improved').length
  const stillBad = results.filter(r => ['empty', 'placeholder'].includes(r.auth_state)).length
  const legacy = results.reduce((s, r) => s + r.legacy_hits, 0)

  console.log('\n=== v3 Audit Complete ===')
  console.log(`Routes:        ${results.length}`)
  console.log(`Auth complete: ${results.filter(r => r.auth_state === 'complete').length}`)
  console.log(`Auth partial:  ${results.filter(r => r.auth_state === 'partial').length}`)
  console.log(`Auth empty:    ${results.filter(r => r.auth_state === 'empty').length}`)
  console.log(`Flipped:       ${flipped} (gate contamination cleared)`)
  console.log(`Still bad:     ${stillBad} (real M1 work)`)
  console.log(`Legacy hits:   ${legacy}`)
  const ecole = results.find(r => r.path === '/la-methode')
  console.log(`V-016c:        ${ecole?.auth_state} | ${ecole?.auth_final_url}`)
  console.log(`Output:        ${outputPath}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
