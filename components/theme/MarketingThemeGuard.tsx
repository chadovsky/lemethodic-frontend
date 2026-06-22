'use client'

import { useEffect, useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'
import { isAuthedPath } from '@/lib/theme/authed-prefixes'

// F-482 — closes the client-nav .dark leak onto marketing. After F-481 the theme
// provider is scoped to authed surfaces, but next-themes does not strip .dark on
// provider unmount. So when an authed dark session navigates into a marketing
// route WITHOUT a full reload (e.g. clicking "Pricing" in the authed sidebar,
// which client-routes to /tarifs), the stale .dark lingers on <html> and the
// marketing route renders dark.
//
// This guard, mounted once in the root layout, strips .dark on every marketing
// pathname and is a no-op on authed routes (where the scoped provider stays in
// control). A layout effect runs before the browser paints the new route, so the
// strip lands without a one-frame dark flash. On first load the pre-paint inline
// script has already handled .dark, so the initial run is just a confirmation.

// useLayoutEffect on the server warns; fall back to useEffect there. The guard
// renders null and only touches the DOM, so this swap is purely about timing.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

export default function MarketingThemeGuard() {
  const pathname = usePathname()

  useIsomorphicLayoutEffect(() => {
    if (!isAuthedPath(pathname)) {
      document.documentElement.classList.remove('dark')
    }
  }, [pathname])

  return null
}
