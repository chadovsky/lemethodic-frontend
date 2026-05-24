---
name: playwright-capture
description: Use whenever capturing, validating, or updating Playwright visual snapshots for Le Méthodic. Triggers on phrases like "generate captures", "run the snapshot battery", "update screenshots", "review visual diff", "accept new baselines", "F-225 capture", "playwright snapshot", or before any soft-beta launch sequence. Covers the one-time soft-beta battery (initial baseline generation across all surfaces × 3 projects) AND post-battery per-ticket capture maintenance. Use aggressively when ANY UI surface changes after the battery has run — silent capture drift is exactly what F-225 was created to prevent.
---

# playwright-capture

You are running, validating, or updating Playwright visual captures for Le Méthodic per the F-225 protocol (amended 2026-05-23: auto-captures replace manual screenshots; UI-001 through BE-005 receipts accepted lost; one-time full-surface battery at soft-beta launch).

There are two distinct modes. Identify which one applies before proceeding.

## Mode detection

Check whether the soft-beta battery has run. The marker is the file `.f-225-battery-complete` at the FE repo root.

| Marker state | Mode | What this skill does |
|---|---|---|
| **Absent** | Pre-battery (current default) | Either generate the one-time battery (Mode 1) OR no-op if not yet at soft-beta launch readiness |
| **Present** | Post-battery | Per-ticket capture generation and baseline maintenance for UI changes (Mode 2) |

The marker is created exclusively by Mode 1 on successful battery completion. Do not create it manually under any other circumstances — its presence triggers `le-methodic-ship`'s gate 5 promotion from surfacing to hard block.

---

## Mode 1 — Soft-beta one-time battery

Runs ONCE, at soft-beta launch prep. Captures baselines across every UI surface × every Playwright project (desktop, mobile, reduced-motion — defined in `playwright.config.ts`).

### Prerequisites (hard preconditions)

Do not proceed if any of these fail:

1. **Working tree clean on `main`.** `git status --short` returns empty.
2. **BE-006 through BE-010 features all implemented** and visible in the FE shell. The battery captures the soft-beta-ready state, not work-in-progress. If any of these tickets is partial, the battery is premature.
3. **`pnpm install` recent** and `pnpm dev` boots without errors.
4. **`.f-225-battery-complete` does NOT exist.** If it does, the battery has already run — switch to Mode 2 instead.

If any precondition fails, surface to Chadi and stop. Do not partial-run the battery; it produces an incomplete baseline that's worse than no baseline.

### Execute the battery

For each project, run the full e2e spec set with snapshot generation:

```bash
pnpm playwright test --project=desktop --update-snapshots
pnpm playwright test --project=mobile --update-snapshots
pnpm playwright test --project=reduced-motion --update-snapshots
```

Captures land under `tests/e2e/**/*-snapshots/<project>/*.png` per Playwright defaults. These become the baselines committed to git.

### Validate the battery output

Before committing, walk this checklist:

- **All 3 projects ran without spec-level failures.** Project-level failures are tolerable ONLY if explicitly expected (e.g., a route deliberately doesn't render in mobile viewport). Surface every failure to Chadi for explicit accept/reject.
- **Surface coverage complete.** Cross-reference `app/` route directories against the generated snapshot tree. Every route should have at least one capture per project. Missing surfaces = the spec set is incomplete and must be extended before the battery is valid.
- **No flicker.** Captures must be deterministic. Re-run any one spec twice; a delta between runs indicates animation/timing not properly muted. Add `reducedMotion: 'reduce'` or wait conditions in the spec before re-capturing.
- **No accidental data leak.** Captures must not include test-only seed data, debug overlays, developer markers, or anything that wouldn't appear in production.

### Commit and mark complete

```bash
git add tests/e2e/**/*-snapshots/
echo "F-225 soft-beta battery complete. Date: $(date -I). Project count: 3. Surfaces: <N>." > .f-225-battery-complete
git add .f-225-battery-complete
git commit -m "feat(f-225): one-time soft-beta capture battery (<N> surfaces × 3 projects)"
```

After this commit, immediately walk through "Post-battery skill maintenance" below — `le-methodic-ship`'s surfacing item for captures should be promoted back to a hard gate.

---

## Mode 2 — Per-ticket capture maintenance

Runs every time a UI-touching change is about to ship after the battery has been completed.

### Detect what changed

```bash
git diff --name-only main..HEAD | grep -E '^(app/|components/)'
```

Any output means UI surfaces changed. Identify which routes/components specifically; this drives which specs need to re-run.

### Generate updated captures

For each changed surface, run the relevant spec across all 3 projects:

```bash
pnpm playwright test tests/e2e/<spec-name>.spec.ts --update-snapshots
```

If you cannot map a changed surface to a specific spec, regenerate ALL captures:

```bash
pnpm playwright test --update-snapshots
```

The latter is slower but safer than missing a coupling between a component change and a spec that exercises it indirectly.

### Review the baseline diff

```bash
git diff --stat tests/e2e/**/*-snapshots/
```

Every new or changed `.png` is a baseline change. For each one:

- **Expected change** (deliberate redesign, intentional layout shift) → accept the new baseline by `git add`-ing the file.
- **Unexpected change** (test flakiness, unintended visual regression, font glitch) → BLOCK. Investigate. Fix the spec or the code. Re-run.

Never blanket-accept all baseline changes without per-file review. Bulk acceptance defeats the entire purpose of the battery: regression detection.

### Commit captures with the feature

Capture updates ship in the SAME commit as the feature code — not as a follow-up. Mixing them creates a moment where the codebase and the receipts disagree, and that moment is what F-225 exists to prevent.

```bash
git add app/<changed-files> components/<changed-files> tests/e2e/**/*-snapshots/
git commit -m "<your feature commit message>"
```

`le-methodic-ship` FE gate 5 (post-battery promoted) will verify captures exist for every changed surface before allowing the tag/deploy. Mode 2 of this skill is its prerequisite.

---

## Post-battery skill maintenance (one-time, immediately after Mode 1)

After Mode 1 succeeds and `.f-225-battery-complete` is committed, the `le-methodic-ship` FE skill needs its Playwright surfacing item promoted back to a hard gate. Edit `.claude/skills/le-methodic-ship/SKILL.md`:

1. **Move the "Playwright captures for UI changes (F-225)" entry** from the **Surfacing checklist** section into the **Hard gates** section (as the new gate 5 or wherever fits the numbering).
2. **Reword from surfacing tone to blocking tone.** Replace the pre-/post-battery branching language with: "Run `playwright-capture` skill Mode 2 to generate or verify captures for changed surfaces. No captures for a UI diff = block."
3. **Renumber subsequent hard gates** (the original 5 and 6 shift down by one).
4. **Update the output format example** to reflect the renumbering and the gate's new hard-block role.

This is a one-time maintenance task immediately following the battery commit. Do not skip it — leaving the FE skill in pre-battery mode after the battery has run creates a silent gap where post-battery UI changes ship without capture enforcement.

---

## Output format when running this skill

```
=== playwright-capture: <Mode 1 / Mode 2> ===
Marker:         .f-225-battery-complete absent / present

[Mode 1 only]
Preconditions:
  Working tree clean:    OK / FAIL (cite files)
  BE-006-010 complete:   OK / FAIL (cite missing tickets)
  pnpm dev boots:        OK / FAIL (cite error)

Battery execution:
  desktop:         <N> captures generated, <N> spec failures
  mobile:          <N> captures generated, <N> spec failures
  reduced-motion:  <N> captures generated, <N> spec failures

Validation:
  All 3 projects ran:    OK / FAIL
  Surface coverage:      <N>/<N> (cite missing routes)
  Flicker check:         OK / FAIL (cite specs)
  Data-leak check:       clean / FAIL (cite captures)

[Mode 2 only]
UI surfaces changed:     <list>
Specs re-run:            <list>
Captures regenerated:    <N>
Baseline diffs:          <N> new, <N> changed
  - <file>.png: expected ✓ / unexpected ✗ (action taken)

VERDICT: COMMIT / BLOCK — cite first failure if BLOCK
```

If VERDICT is BLOCK, stop and surface to Chadi. Do not silently re-run with different flags, accept-all, or skip-failed — every option there compromises the receipt integrity that F-225 was designed to preserve.
