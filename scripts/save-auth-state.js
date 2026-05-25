/**
 * Save verified-account Playwright storage state for M0 v3 audit.
 * Usage: node scripts/save-auth-state.js
 * Dev server must be running on http://localhost:3000.
 *
 * Opens a headed browser, directs you to /login, then waits for you
 * to complete login with a VERIFIED account. Once the browser lands on
 * a dashboard-like URL, it saves storageState to audit-auth-verified.json
 * and closes automatically.
 */
import { chromium } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.join(__dirname, '..')

const OUTPUT_PATH = path.join(REPO_ROOT, 'audit-auth-verified.json')
const BASE_URL = 'http://localhost:3000'

// URL patterns that indicate a successful verified login (post-redirect).
// Excludes /onboarding (unfinished profile), /verify-email (unverified),
// and /login (still on auth surface).
const DASHBOARD_PATTERNS = [
  /\/(dashboard|ecole|vocabulaire|speaking|writing|diagnostic|progress|account|profile|more)\b/,
]

function looksLikeDashboard(url) {
  const pathname = url.replace(BASE_URL, '')
  return DASHBOARD_PATTERNS.some(re => re.test(pathname))
}

async function main() {
  console.log('Launching headed Chromium...')
  const browser = await chromium.launch({ headless: false, slowMo: 50 })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'load', timeout: 15000 })

  console.log('\n===========================================================')
  console.log('  ACTION REQUIRED — log in with a VERIFIED account in the  ')
  console.log('  browser window that just opened.                         ')
  console.log('  The browser will auto-close 5 s after you reach a        ')
  console.log('  dashboard-like URL (ecole, dashboard, etc.).             ')
  console.log('===========================================================\n')

  // Poll until we land on a verified-user destination.
  let settled = false
  while (!settled) {
    await page.waitForTimeout(500)
    const current = page.url()
    if (looksLikeDashboard(current)) {
      console.log(`  Detected dashboard URL: ${current}`)
      console.log('  Waiting 5 s for session cookies to settle...')
      await page.waitForTimeout(5000)
      settled = true
    }
  }

  await context.storageState({ path: OUTPUT_PATH })
  console.log(`\n  Storage state saved → ${OUTPUT_PATH}`)
  console.log('  Closing browser.')
  await browser.close()
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
