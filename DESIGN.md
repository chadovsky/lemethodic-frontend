# DESIGN.md — Le Méthodic

**Version:** v2 (Atelier Français)
**Locked:** 2026-05-27
**Supersedes:** DESIGN.md v1 (commit 9081610, warm mustard/ochre direction — now obsolete)

This document is the source of truth for Le Méthodic's visual system. All new surfaces are built against it. Where the codebase still reflects v1 (mustard palette, Cabinet Grotesk, per-couche surface colors), it is migrated to this spec.

---

## 1. Movement: Atelier Français

The aesthetic is **French artisan workshop precision** — academic, sophisticated, modern. The reference points are NRF Gallimard, Le Monde, Clairefontaine, Cassandre, and French academic press, not vintage paper or manuscript pastiche. The feeling is editorial and exact: ink on white, generous whitespace, a single confident accent.

Rejected: warm mustard/ochre palette (v1), vintage-paper texture, decorative ornament for its own sake.

---

## 2. Palette A — French ink blue

Cool, not warm. One dominant, one accent, paper white, and a near-black ink for text.

```css
:root {
  /* Dominant — French ink blue */
  --dominant: #14213D;
  --dominant-soft: #2C3E5E;
  --dominant-deep: #0B1729;

  /* Accent — vermillion */
  --accent: #C8102E;
  --accent-soft: #E84A5F;

  /* Paper / backgrounds */
  --paper: #FFFFFF;
  --paper-tint: #FAFAFA;
  --paper-edge: #F4F4F5;

  /* Ink / text */
  --ink: #0F1419;
  --ink-soft: rgba(15, 20, 25, 0.62);
  --ink-faint: rgba(15, 20, 25, 0.38);
  --ink-trace: rgba(15, 20, 25, 0.16);

  /* Rules / borders */
  --rule: rgba(15, 20, 25, 0.08);
  --rule-strong: rgba(15, 20, 25, 0.16);
}
```

**Usage rules**
- Body text: `--ink`. Secondary text: `--ink-soft`. Metadata/labels: `--ink-faint`.
- CTAs and primary interactive surfaces: `--dominant` (NOT near-black). Hover deepens to `--dominant-deep`.
- `--accent` (vermillion) is reserved for emphasis, attention/bottleneck states, the master's accent line, and the wordmark animation. It is the single bold note — used sparingly so it stays loud.
- Backgrounds: `--paper` (pure white) is the base. `--paper-tint` for raised cards/cells. The beige `#FAF7F0` from v1 is banned.

**Couche colors (LOCKED).** Four couches render in `--dominant` (ink blue): Le Propos, Le Plan, La Construction, La Musique. **Les Pièges Anglais** — the differentiator — renders in `--accent` (vermillion). It is the only couche with a distinct color, spending the palette's single bold note where it matters most.

Bottleneck/attention is communicated by the "Bottleneck" tag pill (with its breathing animation), NOT by recoloring a bar to vermillion. That color is reserved for Les Pièges Anglais's identity, so any couche can be flagged as a bottleneck via the tag with no color conflict.

**Dark mode (LOCKED) — "night paper."** The dark background is a deep version of the ink blue, not a neutral charcoal, so dark mode still reads as Le Méthodic. Cool, not warm. The dominant shifts to a mid-blue so it stays visible against the dark background while white button text still passes contrast; hover lightens rather than darkens. Vermillion brightens slightly so it pops instead of going muddy.

```css
.dark {
  /* Night paper — deep ink blue, cool */
  --paper: #0E1626;
  --paper-tint: #16203A;
  --paper-edge: #1E2A47;

  /* Cool off-white ink */
  --ink: #E5E9F0;
  --ink-soft: rgba(229, 233, 240, 0.64);
  --ink-faint: rgba(229, 233, 240, 0.40);
  --ink-trace: rgba(229, 233, 240, 0.18);

  /* Rules / borders */
  --rule: rgba(229, 233, 240, 0.10);
  --rule-strong: rgba(229, 233, 240, 0.20);

  /* Dominant — mid blue: visible on night paper, white text still passes contrast */
  --dominant: #38598F;
  --dominant-soft: #2E4A7A;
  --dominant-deep: #4A6BA3;   /* hover LIGHTENS in dark mode */

  /* Accent — vermillion brightened for dark backgrounds */
  --accent: #E23A54;
  --accent-soft: #F06B7E;
}
```

Toggle via the `.dark` class on a wrapper (next-themes ThemeProvider is already wired). The codebase's legacy `--lm-*` dark tokens must be mapped to these values during migration (see §10).

---

## 3. Type A — Editorial Atelier

```css
:root {
  --f-display: 'Instrument Serif', Georgia, serif;   /* headlines, hero, large display */
  --f-body:    'Crimson Pro', Georgia, serif;         /* lesson body, long-form reading */
  --f-ui:      'Instrument Sans', system-ui, sans-serif; /* French UI: nav, labels, buttons */
  --f-en:      'Inter', system-ui, sans-serif;        /* English UI text */
  --f-mono:    'DM Mono', 'Courier New', monospace;   /* metadata, eyebrows, folios, accents */
}
```

**Language-aware UI font**

French UI text uses Instrument Sans. English UI text uses Inter. Apply via the `lang` attribute:

```css
[lang="en"] { font-family: var(--f-en); }
```

Set `lang="fr"` as the document default; mark English fragments/pages with `lang="en"`.

**Mapping**
- Display / hero / section headings → `--f-display` (Instrument Serif)
- Lesson body, reading content → `--f-body` (Crimson Pro)
- Nav, buttons, form labels, in-product chrome (French) → `--f-ui` (Instrument Sans)
- Same chrome in English → `--f-en` (Inter)
- Eyebrows, folios, timestamps, monospace metadata → `--f-mono` (DM Mono)

Cabinet Grotesk, Geist, Source Serif 4, Fraunces, Figtree are all obsolete for this direction.

---

## 4. Shape & radius

No sharp corners anywhere (Apple-feel). Soft shadows preferred over hard borders for elevation.

```css
:root {
  --r-xs: 6px;    /* small chips, dots */
  --r-sm: 10px;   /* dropdown items, inputs */
  --r-md: 16px;   /* dropdowns, mid containers */
  --r-lg: 22px;   /* cards, cells */
  --r-xl: 28px;   /* large shells, panels */
  --r-pill: 999px;/* CTAs, pills, tags */
}
```

---

## 5. Motion

```css
:root {
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);       /* default — most transitions */
  --ease-snap: cubic-bezier(0.4, 0, 0.2, 1.4);  /* playful overshoot — dots, hover pops */
}
```

**Principles**
- Reveals: fade + 24px translate-up, IntersectionObserver-triggered as content scrolls in.
- Hover lifts: cards rise 3px; CTAs rise 2px with a soft shadow.
- Number tickers: count up on scroll-into-view with cubic ease-out.
- Always honor `prefers-reduced-motion: reduce` — disable transforms/animations, show final state.

---

## 6. Wordmark signature (LOCKED)

The wordmark is **"LE MÉTHODIC"** and its animation is the brand's signature gesture. It is used in two places with identical mechanics: as a showcase (e.g. brand panels) and as the in-product brand mark in the top nav (smaller padding).

**Sequence**
1. **Typewriter** — letters stamp in one by one. Implemented with the Web Animations API (WAAPI), triggered by IntersectionObserver when the wordmark scrolls into view (NOT on page load — that's why earlier versions appeared to "not fire"). Stagger ~70ms per character; each letter does a small scale+drop entrance.
2. **Caret** — a vermillion (`--accent`) caret blinks at the end of the word after the last letter lands.
3. **Frame** — a black/ink (`--ink`) frame draws in around the word: two symmetric SVG paths, both starting at top-center, one tracing clockwise (right side), one counterclockwise (left side), meeting at bottom-center. Duration ~800ms. The frame **stays** (no retract). It appears after the caret, slower than the caret's first blink.

**The M** breathes continuously and independently: scale 1.0 → 1.06 + color shift toward vermillion, 3.6s loop, infinite. This is the only persistent motion after the sequence settles.

**Implementation notes (so it survives re-execution)**
- Frame centering: measure the wordmark width **excluding the caret** (caret width + its 3px margin). Including the caret pushes the frame off-center to the left.
- Frame padding is parameterized per context via data attributes: `data-frame-pad-x`, `data-frame-pad-y`, `data-frame-margin`. Showcase uses generous padding; nav uses tight (`pad-x≈11`, `pad-y≈5`, `margin≈2`).
- Frame SVG `stroke-width` ~1.4px, `stroke-linejoin: miter` for crisp corners.
- The frame is enabled per-element via a `data-frame="1"` attribute on the wordmark; the typewriter is enabled via `data-typewriter`.
- The wordmark element MUST set `white-space: nowrap`. The typewriter wraps each letter in an inline-block span, which can wrap to a second line in a constrained container; if it does, the frame measures a broken tall/narrow box.
- The frame stroke, caret, and M-breath colors MUST read from theme tokens (`var(--ink)` for the frame, `var(--accent)` for caret and the M's color shift), not hardcoded hex, so they flip correctly between light and dark mode. Read the computed token values in JS at setup time.

**Do not** attempt to anchor animated lines to the M's stroke positions — that approach (earlier iterations) is abandoned because per-glyph stroke alignment can't be made reliable across fonts/sizes/render engines. The frame is independent of the M.

---

## 7. Component patterns

**Top nav**
- Brand mark = framed wordmark (§6), no icon/seal beside it.
- Nav links: pill-shaped, `--ink-soft` default, `--paper-tint` on hover, `--dominant` background + white text when active.
- Dropdowns open on hover with a fade + 6px translate.

**Dropdown items**
- On hover: item scales up slightly (≈1.025, left origin) and a vermillion dot fades/pops in from the left (`--ease-snap`). This grow-plus-dot is the canonical dropdown hover pattern.

**CTAs**
- Pill (`--r-pill`), `--dominant` background, white text. Hover: deepen to `--dominant-deep`, rise 2px, soft shadow. A trailing arrow slides right on hover.

**Cards / cells**
- `--paper-tint` background, `--r-lg`/`--r-xl` radius. Hover: rise 3px + soft shadow. No hard borders.

**Progress / couche bars**
- Track in faint ink. Fill in the couche's identity color: `--dominant` for four couches, `--accent` (vermillion) for Les Pièges Anglais. Bottleneck/attention shown via the "Bottleneck" tag pill, not by recoloring the fill. Fills animate width on scroll-into-view.

**Editorial (lesson) elements**
- Drop cap (Instrument Serif, vermillion) on opening paragraph.
- Marginalia: monospace side note, small, `--ink-faint`, with a vermillion left rule on narrow viewports.
- Pull quote: Instrument Serif with a vermillion left bar.
- Folio: centered monospace, e.g. `— III —`.

**Master's seal** (optional accent mark)
- Small SVG seal with a slowly rotating outer ring and an "M" monogram, in vermillion. Used beside scores/grades as a "visa du maître" mark. Decorative-but-branded; use sparingly.

---

## 8. Copy & language rules

- **No em-dashes** (—) anywhere in product copy. Use commas, colons, or restructure.
- **No italic** in display type.
- French is the primary product language; copy uses canonical names: La Méthode, La Bibliothèque, L'Examen, and the 5 couches Le Propos / Le Plan / La Construction / Les Pièges Anglais / La Musique.
- English UI text switches to Inter (§3).

---

## 9. Open items (decisions pending)

1. **Hero treatment.** "Bonjour, [name]." in Instrument Serif with a vermillion hand-drawn accent line under the name is locked as Hero A. Full hero/dashboard layout still iterating.

---

## 10. Migration status

- **t1–t9** (token/component work) predate this direction and need re-execution against this spec.
- **M-RENAME** routes (/la-methode, /la-bibliotheque, /l-examen and nested) are not yet built; canonical FR routes still 404.
- The codebase still uses legacy product/couche names; M-RENAME Phase A.3 handles that migration.
