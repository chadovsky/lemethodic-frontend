import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(cleanup)

// Framer-motion's whileInView uses IntersectionObserver; jsdom doesn't include it.
// This no-op stub prevents ReferenceError in unit tests — callbacks never fire,
// so whileInView animations don't complete, but DOM structure is still testable.
if (typeof global.IntersectionObserver === 'undefined') {
  global.IntersectionObserver = class IntersectionObserver {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    root: Element | null = null
    rootMargin = ''
    thresholds: ReadonlyArray<number> = []
    takeRecords(): IntersectionObserverEntry[] { return [] }
  }
}
