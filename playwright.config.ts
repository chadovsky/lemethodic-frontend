import { defineConfig } from '@playwright/test'

const isCI = !!process.env.CI

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? '50%' : undefined,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'off',
    video: 'off',
    trace: 'off',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  projects: [
    {
      name: 'desktop',
      use: { viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: { viewport: { width: 375, height: 667 }, isMobile: true },
    },
    {
      name: 'reduced-motion',
      use: {
        viewport: { width: 1280, height: 800 },
        reducedMotion: 'reduce',
      },
      testMatch: '**/reduced-motion.spec.ts',
    },
  ],
  webServer: {
    // CI: full prod build then start — avoids on-demand compilation hangs.
    // Local: dev server with reuseExistingServer so re-runs are fast.
    command: isCI ? 'pnpm build && pnpm start' : 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 300_000,
  },
})
