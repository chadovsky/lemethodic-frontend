'use client'

// F-469 — La Carte responsive switch.
//
// One data source, two presentations off a single 1024px breakpoint:
//   >=1024px -> CarteWorld   (the immersive sea-world scatter)
//   <1024px  -> CarteMap     (the mobile-first vertical serpentine, F-462)
// Both render from the same getJourney seam and expose the same DOM contract
// (carte-level, carte-grammar, carte-ile, the island-node art seam, /ile links,
// the single carte-current-cta). SSR + first client paint render the serpentine
// (works at any width, zero horizontal overflow); the world swaps in on desktop
// after mount. Only one is mounted at a time, so the contract testids are never
// duplicated.

import { useEffect, useState } from 'react'
import CarteMap from '@/components/carte/CarteMap'
import CarteWorld from '@/components/carte/CarteWorld'

export default function CarteResponsive() {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  return isDesktop ? <CarteWorld /> : <CarteMap />
}
