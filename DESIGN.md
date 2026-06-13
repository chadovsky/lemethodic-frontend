# DESIGN v3

**Le Méthodic visual system. Apple-lean modern.**
Supersedes v2 (Atelier Français). v2 is retired: watercolor, ink washes, typewriter wordmark, serif type, and handmade-imperfection texture all read archaic and are removed. This document is the source of truth every surface executes against.

Status: LOCKED 2026-06-11. Decisions resolved (see bottom).

> Archived predecessors: `docs/archive/DESIGN-v2.md` (Atelier Français) and `docs/archive/LEMETHODIC-DESIGN-archived.md` (pastel "disciplined warmth"). Retained for audit only.

---

## 1. Direction

Premium, minimal, calm, modern tech product. The feel of a high-end app, not a literary journal. Content-first, restraint over decoration, generous whitespace, soft depth instead of ornament. Confidence through space and typography, not flourish.

The signature that keeps it from being generic clean-SaaS: **the islands voyage**, rendered as glossy, dimensional, rim-lit 3D objects. The aesthetic is restrained everywhere so the islands carry the brand.

Principles:
1. Whitespace is a feature. Let surfaces breathe.
2. One accent color, used sparingly, for moments that matter (price, primary CTA, progress).
3. Soft depth, never ornament. Subtle shadow and blur, no texture, no grain, no vintage.
4. Sans-led, upright, modern. No serifs.
5. The islands are the only place that gets to be expressive.

---

## 2. Color

Near-monochrome base plus one confident accent. Light mode primary; full dark mode (Apple-style true dark).

### Light
| token | hex | use |
|---|---|---|
| `--bg` | `#FFFFFF` | base background |
| `--surface` | `#F5F5F7` | subtle panels, sections |
| `--surface-elevated` | `#FFFFFF` | cards (with shadow) |
| `--hairline` | `#E8E8ED` | borders, dividers |
| `--ink` | `#1D1D1F` | primary text |
| `--ink-secondary` | `#6E6E73` | secondary text |
| `--ink-tertiary` | `#86868B` | captions, disabled |
| `--accent` | `#E5301C` | brand accent (modern vermillion) |

### Dark (true dark)
| token | hex | use |
|---|---|---|
| `--bg` | `#000000` | base background |
| `--surface` | `#1C1C1E` | panels |
| `--surface-elevated` | `#2C2C2E` | cards |
| `--hairline` | `#38383A` | borders |
| `--ink` | `#F5F5F7` | primary text |
| `--ink-secondary` | `#98989D` | secondary text |
| `--accent` | `#FF453A` | accent on dark |

Accent is rare. Most of the UI is ink-on-paper. The red appears on the primary CTA, prices, active progress, and the occasional brand moment. Nowhere else.

---

## 3. Typography

Sans-led system. Serifs are out (the serif was the archaic signal). `Inter` is the system face: clean, modern, Apple-adjacent, already in the stack.

| role | face | size (desktop) | weight |
|---|---|---|---|
| Display | Inter (tight tracking) | 56–72px | 700 |
| H1 | Inter | 40px | 700 |
| H2 | Inter | 28px | 600 |
| H3 | Inter | 20px | 600 |
| Body | Inter | 17px | 400 |
| Body-emphasis | Inter | 17px | 500 |
| Small | Inter | 14px | 400 |
| Mono | DM Mono | 13px | 400 |

- Headings: tight letter-spacing (-0.02em on display), generous line-height on body (1.5–1.6).
- Mono (DM Mono) survives for data: streak counts, scores, timers.
- **Removed:** Instrument Serif, Crimson Pro.
- Display = Inter for now. A distinctive display face is a deferred revisit, once surfaces exist.

---

## 4. Space & layout

- Base unit 8px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Section padding desktop: 96–128px vertical. Apple-grade breathing room.
- Content max-width ~1120px; hero sections can go full-bleed.
- Mobile: 16–24px gutters, sections 48–64px vertical.
- Strong baseline grid, lots of negative space, never crowded.

---

## 5. Shape & elevation

- **Rounded everywhere. No sharp corners** (carries from v2, and it is core to the Apple-lean feel).
- Radius scale: `8` (inputs/small), `12` (buttons), `16` (cards), `20–24` (large cards/sections), `999` (pills, avatars).
- **Soft, layered shadows only.** Three levels:
  - `e1`: `0 1px 2px rgba(0,0,0,0.04)` (resting cards)
  - `e2`: `0 4px 16px rgba(0,0,0,0.06)` (raised cards, dropdowns)
  - `e3`: `0 12px 40px rgba(0,0,0,0.10)` (modals, hero objects)
- **Frosted glass** (backdrop-blur, ~20px, translucent surface) for the sticky top nav and overlays. A clear Apple signal.

---

## 6. Components

- **Buttons.** Primary = filled `--accent`, radius 12, weight 500, comfortable padding, large tap target. Secondary = subtle grey fill or ghost (hairline border). Tertiary = text + accent. One primary per view.
- **Cards.** `--surface-elevated`, radius 16, shadow `e1`/`e2`, generous internal padding. Hover lifts shadow gently.
- **Inputs.** Radius 8–12, hairline border, focus ring in accent, large hit area.
- **Nav.** Sticky top nav (logged-out) frosted-glass; left sidebar (logged-in) clean, hairline divider, soft active state.
- **Pills / chips.** Radius 999, subtle fill, for filters and bientôt tags.

---

## 7. Motion

Calm, smooth, purposeful. The Apple feel lives here.
- Easing: ease-out / custom cubic-bezier(0.4, 0, 0.2, 1). Durations 200–400ms.
- Scroll-reveal: content fades + rises slightly on entry.
- Hero island: subtle float / parallax, soft rotation, reactive to scroll.
- Interactive: gentle spring on press, smooth state transitions.
- Restraint: motion supports, never distracts.
- **Execution:** this is where Fable 5 (motion code) + Nano Banana 2 (the glossy 3D assets) combine. Pending verification that Claude Code can run Fable 5.

---

## 8. The Islands system (the signature)

Glossy 3D rendered islands. Smooth rounded forms, shiny rim-lit beveled edges, soft studio lighting, subtle reflections and gloss, gentle depth. Generated in Nano Banana 2 (locked prompt C+). Light background, soft shadows, one accent marker.

Where they appear:
- **Homepage hero:** one large glossy island, soft float motion, the centerpiece.
- **Dashboard voyage map:** a clean dotted path connecting islands; accent markers show progress along the journey.
- **Île detail:** the island as the surface's hero, calm and dimensional.

The islands are the ONLY expressive element. Everything around them stays restrained so they read as premium, not busy.

---

## 9. Logotype

Retire the typewriter "LE MÉTHODIC" + red caret + breathing M. New: a clean modern logotype in Inter (tight tracking), upright, confident. Optional minimal mark (a small glossy island dot, or a single geometric glyph) for favicon / collapsed nav.
- `white-space: nowrap` on the wordmark element (carries from v2).
- Logotype reads `--ink`; optional mark uses `--accent`.
- Mark: a short exploration pass is queued (glossy island dot / single geometric glyph). The modern Inter wordmark ships first.

---

## 10. Iconography & imagery

- **Icons:** `lucide` (in-stack), clean line, consistent 1.5–2px stroke, rounded joins. Modern and quiet. No illustrated or hand-drawn icons.
- **Spot illustration:** glossy 3D renders only, reserved for brand moments (islands, key objects). Not on every surface.
- **Imagery:** clean, modern, dimensional. No watercolor, no grain, no paper texture, no vintage anything.

---

## 11. Hard rules

Carry forward:
- **Never an em-dash** in any output. Use commas, colons, parens, sentence breaks.
- **No sharp corners.** Everything rounded.

New in v3:
- **One accent color only.** No second brand color.
- **Sans only.** No serif type anywhere.
- **No texture.** No watercolor, grain, paper, or handmade imperfection.
- **Restraint.** Whitespace and soft depth over decoration.

Relaxed from v2:
- Italics allowed sparingly for genuine emphasis (v2 banned them; not needed in a modern sans system, but no longer forbidden).

Retired from v2:
- Atelier Français direction, watercolor washes, typewriter wordmark, breathing-M animation, ink/handmade texture, Instrument Serif, Crimson Pro, mustard (already gone in v2).

---

## Locked decisions (2026-06-11)

1. **Accent color:** `#E5301C` (modern vermillion) light, `#FF453A` dark. One accent only.
2. **Display typeface:** Inter system. A distinctive display face is deferred, revisited once surfaces exist.
3. **Logotype mark:** modern Inter wordmark ships first; a short mark/glyph exploration (glossy island dot / single geometric glyph) is queued as a follow-on.
