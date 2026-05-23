import type { Page } from '@playwright/test'

export interface FailingTarget {
  tag: string
  testId: string | null
  width: number
  height: number
  href: string | null
}

/**
 * Returns interactive elements (button, a[href], [role="button"]) that are
 * visible but smaller than 44×44px. Skips elements hidden via display:none.
 */
export async function getFailingTouchTargets(page: Page): Promise<FailingTarget[]> {
  return page.evaluate(() => {
    const MIN = 44
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>('button, a[href], [role="button"]'),
    )
    const failing: {
      tag: string
      testId: string | null
      width: number
      height: number
      href: string | null
    }[] = []

    for (const el of candidates) {
      const style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        continue
      }
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue
      if (rect.width < MIN || rect.height < MIN) {
        failing.push({
          tag: el.tagName.toLowerCase(),
          testId: el.getAttribute('data-testid'),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          href: el instanceof HTMLAnchorElement ? el.getAttribute('href') : null,
        })
      }
    }
    return failing
  })
}
