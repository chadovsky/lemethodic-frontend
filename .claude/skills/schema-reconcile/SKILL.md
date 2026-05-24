---
name: schema-reconcile
description: Use whenever the FE consumes a new or changed BE endpoint, when enum/field mismatches surface during integration, when BE→FE type sync is needed, or when reviewing PR diffs that touch `lib/api/`. Triggers on phrases like "schema mismatch", "BE updated the endpoint", "the FE is sending wrong format", "enum doesn't match", "field missing", "type error from API call", or before merging any commit that adds or modifies files under `lib/api/`. Use aggressively at the boundary — silent schema drift is the most common source of runtime API errors in Le Méthodic, and the `lib/api/` layer is the only correct place to resolve it.
---

# schema-reconcile (frontend)

You are reconciling a FE↔BE schema contract for Le Méthodic. The architectural invariant: **`lib/api/<feature>.ts` is the SOLE boundary** between FE shapes and BE shapes. Components never call `fetch` directly. All enum normalization, flatten operations, and field-count bridging happen inside the `api/` module — not at the call site, not in a separate mapping layer, not in component-level transforms.

This pattern was established by BE-001-005 and tested at scale via BE-006 onboarding reconciliation (canonical example documented below).

## Hard gates

### 1. Identify the api boundary file

Find or create the relevant `lib/api/<feature>.ts` file. The feature name matches the BE router prefix (e.g., BE router `/api/onboarding` → `lib/api/onboarding.ts`).

If multiple features are touched in a single PR, work each one independently — do not try to reconcile across files in one pass. Reconciliation is per-contract.

### 2. Diff actual BE shape vs current FE shape

Read the BE router file at `C:\Users\pc\Downloads\tcf-oral-tool\tcf-oral-tool\app\routers\<feature>.py`. Extract the exact request/response shapes from the Pydantic models or schema definitions.

Read the current FE types: `lib/api/<feature>.ts` if it exists, or the consuming component's local types if not.

Produce a side-by-side diff. Do not skip this step — guessing the BE shape from memory is exactly how drift compounds across sessions.

### 3. Categorize every mismatch

For each mismatch found, classify into exactly one of these categories:

| Category | Example | Resolution pattern |
|---|---|---|
| **Enum naming** | FE `A1_A2`, BE `a2`; FE `TCF_CANADA`, BE `tcf_canada` | Update FE option values to match BE exactly. Eliminate any intermediate mapping. |
| **Field count gap** | FE collects 5 fields, BE requires 11 | Add the missing FE inputs (new component, step, or form fields). Do NOT submit partial/null/default values to hide the gap. |
| **Type structure** | BE returns `{ key, label_en, label_fr, score }`, FE expects `{ name, value }` | Update FE type to match BE shape; let consumer components destructure differently. |
| **Nested shape divergence** | BE nests config under `metadata.config`, FE accesses `.config` | Update FE access pattern; flatten in `api/` module ONLY if BE shape is genuinely awkward for UI consumption. |
| **Optional field discipline** | BE marks field `Optional`, FE always sends value | Document explicitly in payload builder; omit from request payload. |

### 4. Apply resolution AT THE SOURCE

This is the rule most likely to be violated under deadline pressure. **Read it twice.**

For enum mismatches:

- **CORRECT:** update the option `value` in `CurrentLevelSelect.tsx` from `A1_A2` to `a2`. Update the exported `CurrentLevel` type. Now the component naturally produces BE-compatible values; no mapping anywhere.
- **WRONG:** add a `mapLevelToBackend()` function in `lib/api/onboarding.ts` that translates `A1_A2 → a2` before submission. This is a "mapping layer" anti-pattern — it preserves the FE↔BE divergence forever and creates a second source of truth for the enum. Six months from now, someone updates the FE enum and forgets the mapper, and the BE silently rejects valid input.

For field-count gaps: add the missing inputs to the FE flow. Do NOT hide the gap by sending `null` or default values that pretend the data was collected — that breaks downstream BE logic and creates silent data quality issues that compound over user volume.

### 5. Verify no orphan mapping logic remains

Grep for leftover transformation helpers that may no longer have a reason to exist:

```bash
git grep -E "(map|transform|convert|normalize).*To(Backend|Server|Api|BE)" lib/api/
```

If matches surface that aren't being called anymore (or shouldn't be), delete them in the same commit as the reconciliation. Orphan mapping functions are exactly how the next developer accidentally reintroduces the mapping layer that this skill exists to eliminate.

### 6. Type-check passes

```bash
pnpm tsc --noEmit
```

Any error blocks. Type errors after reconciliation usually mean: a downstream consumer was relying on the old shape and needs updating. Trace the error to the consumer, update it, re-run. Do not `as any` to silence the error — that recreates the drift this skill is preventing.

## Surfacing checklist (confirm with Chadi, do not auto-block)

- **New `lib/api/<feature>.ts` file?** Surface the new file's existence; a new contract boundary deserves a moment of design review (naming, shape, error handling pattern).
- **Optional BE fields explicitly omitted?** If BE marks fields as `Optional` and FE intentionally skips them in V1, add an inline comment to the payload builder documenting the omission and the ticket where they'll eventually be added.
- **FE-only state preserved?** Some FE-only state (analytics, UI prefs, loading flags) shouldn't go to BE at all. Confirm the api module strips it cleanly before submission.
- **Architectural invariant check.** Did the diff introduce ANY direct `fetch` call from a component, page, or hook? If yes, that's a violation — refactor through `lib/api/`. Surface the violation explicitly so Chadi can decide whether to fix in this commit or queue it as a follow-up.

## Canonical example: BE-006 onboarding reconciliation

This is the test case that validates the skill exists. Full spec at `docs/prd-v1.md` line 2164.

**Enum mismatches identified:**
- FE `CurrentLevelSelect` emits `A1_A2 | A2_B1 | B1_B2 | B2_plus`; BE expects `a2 | b1 | b2 | c1 | not_sure`
- FE `TCFGoalSelect` emits `TCF_CANADA` style slugs; BE expects `tcf_canada` style slugs
- FE `TargetScoreSelect` emits custom labels; BE expects `b1 | b2 | c1 | c2 | not_sure`

**Resolution applied (per this skill):**
- Update `CurrentLevelSelect` option values to `a2 | b1 | b2 | c1 | not_sure`; update exported `CurrentLevel` type.
- Update `TCFGoalSelect` option values to match BE enum exactly; remove any separate mapping.
- Update `TargetScoreSelect` option values and `TargetScore` type export.

**Field-count gap:**
- FE collects 5 fields across existing 5 steps; BE requires 11 questions including `q7_hours_per_week`, `q9_native_language`, `q10_prior_exam_history`, `q11_feedback_mode`.
- Resolution: add new onboarding step 6 "À propos de vous" with all four required fields as single-select cards using existing `OnboardingCard` / `OnboardingScreen` primitives; advance EcoleReveal to step 7; update all `total={7}` and `filledUpTo` values.

**Optional fields omitted (V1):**
- `q4_motivation`, `q5_strongest_skill`, `q6_weakest_skill`, `q8_topics_tested_on` — all marked `Optional` on BE. Omit from V1 submit payload. Inline comment on payload builder documents the omission and references the future ticket.

## Output format when running this skill

```
=== schema-reconcile: <feature-name> ===
Boundary file:   lib/api/<feature>.ts (existing / NEW)
BE router:       app/routers/<feature>.py

Mismatches identified:
  Enum naming:         <N> (cite each)
  Field count gap:     FE <N> vs BE <N> (cite missing)
  Type structure:      <N> (cite)
  Nested shape:        <N> (cite)
  Optional discipline: <N> (cite)

Resolutions applied (at source):
  - <File>:<change> (category: <enum/field/type/nested/optional>)
  - ...

Orphan mapping check: clean OK / found: <function names>
Type-check:           pass OK / fail: <error>

Surfaced for Chadi:
  - New api file:              <yes/no>
  - Omitted optional fields:   <list with comment refs>
  - FE-only state preserved:   <list>
  - Direct fetch violations:   <list or none>

VERDICT: RECONCILED / BLOCK — cite first hard-gate failure if BLOCK
```

If VERDICT is BLOCK, stop and surface to Chadi. Do NOT silently introduce a mapping layer to bypass enum mismatches — that is the exact anti-pattern this skill exists to prevent. Surface every option (update source, add mapping, defer the mismatch) and let Chadi decide; do not pick "add mapping" as a fallback because it's the path of least resistance.
