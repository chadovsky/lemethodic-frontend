---
name: le-methodic-ship
description: Use before tagging, deploying, or merging anything to main in the Le Méthodic frontend repo. Triggers on phrases like "let's ship", "ready to tag", "merge to main", "push to prod", "deploy to vercel", "release this", or before running `git tag`, `git push origin main`, or any Vercel production deploy. Enforces hard gates that have failed in past ships (BACKLOG.md sync, Playwright captures per F-225, forbidden font/product strings, build green) and surfaces deferrable checks (version bump, env parity, memory updates). Use this skill aggressively — better to gate-check a ship that didn't need it than to skip a gate that did.
---

# le-methodic-ship (frontend variant)

You are about to ship code in the Le Méthodic frontend repo. Before any `git tag`, `git push origin main`, or Vercel production deploy, walk this gate sequentially.

Hard gates BLOCK the ship until resolved. Checklist items SURFACE for Chadi's confirmation but do not auto-block. Each hard gate is hard because skipping it has bitten a past ship — these are not theoretical concerns.

## Hard gates

### 1. Branch is `main`

Run `git rev-parse --abbrev-ref HEAD`. The FE repo ships from `main`. The BE repo uses `master` — do not confuse the two, and do not assume the convention is shared across repos.

### 2. Working tree clean

Run `git status --short`. Any output means uncommitted changes that won't match what's been tested. Block until the tree is clean (either committed, stashed, or explicitly discarded by Chadi).

### 3. CLAUDE.md gates pass

Read `CLAUDE.md` at the repo root. Walk every gate listed there. If a gate is unclear or appears to be in tension with this skill, surface that to Chadi rather than silently picking one — CLAUDE.md is the authoritative source of pre-commit policy for this repo.

### 4. BACKLOG.md entry exists for what's shipping

Read `BACKLOG.md` at the repo root. Each ticket being shipped must have a SHIPPED-section entry containing the ticket ID, a one-line description, and the date.

If the entry is missing, add it before tagging. The backlog is canonical and is the only sanctioned record of what's been shipped. Do not reference the legacy `LeMethodic_Master_Backlog.docx`; that file is dead and must never be regenerated.

### 5. Playwright captures present for UI changes

Per F-225 (amended 2026-05-23), Playwright auto-captures replace manual screenshots and serve as the visual receipt for every UI change.

To check:
- Run `git diff --name-only` against the merge base to list changed files.
- If any file under `app/`, `components/`, or any route changed, captures must exist for the affected surfaces.
- No captures for a UI diff = block. Re-run the relevant Playwright spec to generate them.

### 6. No forbidden strings in the diff

Grep the diff (against the merge base, or against `main` for working changes) for the strings below. Any hit blocks the ship.

| Forbidden | Why |
|---|---|
| `FluentPrep` | Obsolete product name. Only `Le Méthodic` is correct. |
| `FluentPath` | Obsolete product name. Only `Le Méthodic` is correct. |
| `Fraunces` | Not in the approved font stack. |
| `Figtree` | Not in the approved font stack. |

Approved fonts: Cabinet Grotesk, Geist, Source Serif 4. If a new font is genuinely required, that is a Chadi-level decision — surface it explicitly, do not silently permit.

### 7. Build green

Run `npm run build`. Any error blocks. Any warning that wasn't present on the last successful build also blocks. Next.js 16 Server Component boundaries are fragile and seemingly innocent changes can break them, so do not trust local memory of "it worked five minutes ago."

## Surfacing checklist (confirm with Chadi, do not auto-block)

- **Version bump.** Is this a user-facing change? If yes, propose semver: patch / minor / major. Do not bump silently.
- **New env vars.** Were any env vars added or renamed? Confirm they're configured in the Vercel dashboard before merge to main.
- **BE schema consumption changed.** If consuming new or changed BE schema, route the diff through the `schema-reconcile` skill first.
- **Memory update warranted.** If this ship represents a locked decision, a resolved blocker, new architecture, or a feature worth long-term recall, flag it at the end so Chadi can update memory via `memory_user_edits`.

## Output format when running this gate

```
=== le-methodic-ship: frontend gate ===
Branch:         main ✓ / <name> ✗
Working tree:   clean ✓ / dirty ✗ (list files)
CLAUDE.md:      <N>/<N> pass (cite failures)
BACKLOG.md:     ticket <ID> entry present ✓ / missing ✗
Playwright:     <N> captures present / not required (no UI diff) / MISSING ✗
Forbidden:      none ✓ / found: <string> at <file>:<line>
Build:          green ✓ / failed: <error>

Surfaced for Chadi:
- Version bump: <recommendation>
- ENV parity:   <status>
- Schema reconcile: <required/not>
- Memory:       <flag/skip>

VERDICT: SHIP / BLOCK — cite first hard-gate failure if BLOCK
```

If VERDICT is BLOCK, stop and surface to Chadi. Do not attempt fixes and silently re-run — Chadi decides what to fix in the moment and what to defer. Re-running this skill after Chadi's explicit fixes is fine; re-running it after silent self-correction is not.
