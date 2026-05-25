# T5 Dark Mode — Review Report

Generated: 2026-05-26. Run `pnpm test:e2e --grep "t5 dark mode gallery"` to regenerate screenshots.

## What shipped in t5

| Item | Status |
|------|--------|
| `next-themes` ThemeProvider wired (`attribute="class"`, `defaultTheme="system"`) | ✅ |
| System preference (`prefers-color-scheme: dark`) detected on first load | ✅ |
| localStorage override persists across reload | ✅ |
| `ThemeToggle` (sun/moon) in TopNav right cluster (desktop only) | ✅ |
| `.dark` legacy token aliases: `--bg-elevated`, `--text-primary`, `--rule-default`, etc. | ✅ |
| `--lm-*` dark mode values already present from M2 t7 | ✅ |
| TopNav scrolled bg (`rgba(251,248,244,0.78)`) → `var(--lm-bg-blur)` | ✅ |
| BottomNav `PAPER = '#FFFFFF'` → `var(--lm-bg-surface)` | ✅ |
| BottomNav border `#1A1A1A0F` → `var(--lm-border-subtle)` | ✅ |
| Build: 41 pages, 0 errors | ✅ |

---

## Surfaces flagged for visual review

Run the gallery spec and compare light/dark pairs. Known issues noted below.

### HIGH — likely broken or illegible in dark mode

| Surface | File | Issue |
|---------|------|-------|
| Onboarding steps (1–6) | `components/onboarding/OnboardingScreen.tsx` et al. | Each step hardcodes `style={{ backgroundColor: '#FFD8C2' }}` (hex pastel) — these do NOT flip. In dark mode the bg stays light peach on a dark page. **Needs per-step dark override or token migration.** |
| Paywall / Recharts radar | `components/Paywall.tsx` | Multiple inline hex colors for chart fills, grid lines, axis labels. RadarChart uses hardcoded `stroke="#E5E0D8"` etc. — all invisible or wrong in dark. |
| `OnboardingScreen.tsx` CTA button | same | `backgroundColor: CTA_DISABLED` / `CTA_FILL` are hardcoded hex values from `OnboardingScreen.tsx` constants — not `--lm-*` vars. |
| Landing `HeroSection` | `components/landing/HeroSection.tsx` | Inline hex colors for hero bg gradient. |
| Speaking session (recording state) | `components/speaking/Tache1Session.tsx`, `Tache2Session.tsx`, `Tache3Session.tsx` | Waveform bar colors hardcoded. |
| Writing submission | `components/writing/WritingSubmissionClient.tsx` | Inline `#FAFAF8` type surfaces. |

### MEDIUM — degraded but readable

| Surface | File | Issue |
|---------|------|-------|
| Sidebar avatar | `components/layout/Sidebar.tsx` | Avatar bg is `var(--cta-primary)` = `hsl(220 40% 21%)` (dark navy). In dark mode `.dark` overrides it to `hsl(220 40% 58%)` (lighter blue). Readable but may feel disconnected from brand. |
| AppShell topbar (mobile) | `components/layout/AppShell.tsx` | May have inline bg values — check gallery. |
| StickyHeader (marketing nav) | `components/layout/StickyHeader.tsx` | Uses legacy tokens; `.dark` aliases cover these but check rendering. |
| Diagnostic results score ring | `components/diagnostic/DiagnosticResults.tsx` | SVG stroke colors may be hardcoded. |
| Progress radar chart | `components/progress/ProgressClient.tsx` | Recharts fills hardcoded. |

### LOW — correct but worth confirming

| Surface | Issue |
|---------|-------|
| Legal pages (`/privacy`, `/terms`, `/refund`) | Uses `.prose-legal` CSS class — all tokens, should be fine. |
| Auth forms (`/signup`, `/login`) | Uses `--lm-*` tokens + shadcn components. Likely fine. |
| Vocabulary surfaces | Uses `--lm-*` tokens. Should flip correctly. |
| Diagnostic landing | Uses `--lm-*` tokens. Should flip correctly. |

---

## Mobile toggle (not in scope for t5)

The ThemeToggle is currently only in the desktop `TopNav`. Mobile uses `BottomNav` (no toggle slot). Recommend adding the toggle to `/more` page settings section in a follow-up ticket.

---

## Deferred to follow-up

- Onboarding step dark mode pastel strategy (design decision required)
- Paywall/Recharts dark mode chart colors
- Landing hero bg dark override
- Mobile theme toggle access point

*These are flagged, not shipped. Extraction into follow-up tickets is Chadi's call.*
