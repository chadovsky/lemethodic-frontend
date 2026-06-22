import { describe, it, expect } from 'vitest'
import { AUTHED_PREFIXES, isAuthedPath } from '@/lib/theme/authed-prefixes'

// F-482 guard-rail: this list drives both the pre-paint script and the
// MarketingThemeGuard. A marketing route slipping in here would render dark for
// a logged-in user (the guard skips authed paths). These tests lock the boundary.

describe('isAuthedPath', () => {
  it('matches the (app) group routes and their sub-paths', () => {
    for (const p of [
      '/tableau-de-bord',
      '/carte',
      '/l-examen',
      '/l-examen/expression-orale/tache-1',
      '/la-bibliotheque',
      '/la-bibliotheque/abc/practice',
      '/profil',
      '/progression',
      '/seance',
      '/ile/education',
      '/abonnement',
      '/parametres',
    ]) {
      expect(isAuthedPath(p)).toBe(true)
    }
  })

  it('matches the standalone authed root routes', () => {
    for (const p of [
      '/bienvenue',
      '/more',
      '/progres/clb',
      '/onboarding/waitlist',
      '/learn/mod-1',
      '/cluster/famille',
    ]) {
      expect(isAuthedPath(p)).toBe(true)
    }
  })

  it('treats /la-methode and its subtrees as authed (auth-aware base + authed children)', () => {
    expect(isAuthedPath('/la-methode')).toBe(true)
    expect(isAuthedPath('/la-methode/intro')).toBe(true)
    expect(isAuthedPath('/la-methode/lecon-1')).toBe(true)
  })

  it('keeps the /onboarding funnel PUBLIC (only /onboarding/waitlist is authed)', () => {
    expect(isAuthedPath('/onboarding')).toBe(false)
    expect(isAuthedPath('/onboarding/waitlist')).toBe(true)
  })

  it('does not let sibling prefixes collide (/progres vs /progression)', () => {
    // /progression is its own authed entry; it must not be swallowed by, nor
    // accidentally match through, the /progres/clb prefix boundary.
    expect(isAuthedPath('/progression')).toBe(true)
    expect(isAuthedPath('/progres')).toBe(false) // bare /progres is not a route
    expect(isAuthedPath('/progres/clb')).toBe(true)
  })

  it('GUARD-RAIL: every marketing / logged-out route is NOT authed', () => {
    for (const p of [
      '/',
      '/tarifs',
      '/connexion',
      '/inscription',
      '/onboarding',
      '/paywall',
      '/blog',
      '/blog/some-post',
      '/faq',
      '/librairie',
      '/librairie/livres',
      '/library',
      '/fr',
      '/examens',
      '/examens/tcf',
      '/pieges',
      '/a-propos',
      '/coaching',
      '/placement',
      '/bienvenue-typo', // near-miss must not match /bienvenue
      '/mentions-legales',
      '/confidentialite',
      '/cgv',
      '/refund',
      '/verify-email',
      '/password-reset',
    ]) {
      expect(isAuthedPath(p)).toBe(false)
    }
  })

  it('contains no obvious marketing route in the constant', () => {
    const forbidden = ['/', '/tarifs', '/connexion', '/inscription', '/onboarding', '/paywall', '/librairie', '/examens', '/blog', '/faq']
    for (const f of forbidden) {
      expect(AUTHED_PREFIXES).not.toContain(f)
    }
  })
})
