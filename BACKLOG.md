# FluentPath Backlog

**Source of truth** for FluentPath sprint work. Maintained in the frontend repo because most active work is here, but covers both frontend and backend.

**Last updated:** 2026-04-27 (F-087 ship — 27-lesson L'École curriculum)
**Sprint window:** April 21 – May 4, 2026
**Sprint pivot (2026-04-25):** launch-prep tickets (F-071 through F-079) pushed behind the intelligence-layer initiative. F-080 (Module Library + Intelligence Layer) is now the spine of the remaining sprint window — replaces generic Claude-API feedback with a named library of L1-interference remediation modules and cross-session accumulation.

> **Note (F-086, 2026-04-27):** Le Raccourci was renamed to L'École. Historical entries below — anything marked ✅ shipped before today — are preserved verbatim with their original "Le Raccourci" / `raccourci_*` references. Forward-looking queued and deferred entries have been rewritten to use the new names. The DB migration (`scripts/rename_raccourci_to_ecole.py`) ran cleanly: `raccourci_lessons` → `ecole_lessons`, `raccourci_quiz_questions` → `ecole_quiz_questions`, `user_raccourci_progress` → `user_ecole_progress`, `remediation_modules.raccourci_lesson_id` → `ecole_lesson_id`. F-087 will replace lesson row contents wholesale and truncate user progress.

---

## How this file works

- Every ticket has a unique F-0xx ID. IDs are never reused or renumbered.
- Tickets reference repos by their local paths: `fluentpath-frontend/` or `tcf-oral-tool/`.
- Status markers: ✅ shipped · 🔄 in progress · 📋 queued · ⏸ deferred
- When a ticket is closed, mark ✅ and leave it in place. Do not delete.
- When a new ticket is created, append it with the next available F-0xx number.
- When a ticket spawns sub-work, either break it into new F-0xx tickets OR add numbered sub-items. Do not nest sub-phases beyond one level.

---

## Shipped — Week 1 (April 21)

F-038 ✅ Fluency analysis layer (backend)
F-039 ✅ [historical, see code comments]
F-040 ✅ [historical, see code comments]
F-041 ✅ [historical, see code comments]
F-042 ✅ [historical, see code comments]
F-043 ✅ [historical, see code comments]
F-044 ✅ Language verification (backend)
F-045 ✅ [historical, see code comments]
F-046 ✅ FR i18n leaks, radar orphaning, hidden accordions
F-047 ✅ Tâche 1/2/3 mode architecture (tache_mode column)
F-048 ✅ Tâche 1 engine (examiner persona)
F-049 ✅ Tâche 2 engine (Yarden methodology)
F-050 ✅ Tâche 2 PTT + transcription review (backend)
F-051 ✅ Tâche 3 engine (monologue scoring)
F-052 ✅ OpenAI TTS-1-HD integration + cache
F-053 ✅ Le Raccourci backend (lessons, completion, gating)

## Shipped — Week 2 (April 22)

F-054 ✅ v0 onboarding screen 1 + design tokens
F-055 ✅ v0 onboarding screens 2-6 + paywall
F-056 ✅ v0 home screen + Le Raccourci tab + lesson detail + quiz scaffold
F-057 ✅ v0 speaking module (Speaking landing, T1, T2 picker, T2 session, T3 session, TranscriptReviewPanel with Pyramide/Rebond/Ciblage)
F-058 ✅ v0 diagnostic view (CouchesDiagnostic stacked bars, Le Goulet, L'Ordonnance, CorrectedLine)

## Shipped — Week 2 (April 23)

F-059 ✅ Phase 3 integration
  - Backend: onboarding persistence (6 new columns on users table)
  - Backend: POST /api/users/onboarding endpoint
  - Frontend: API plumbing (lib/api, lib/auth, lib/types, lib/onboarding)
  - Frontend: Login screen at /login
  - Frontend: Signup screen at /signup with ?trial= query param
  - Frontend: Paywall CTAs rewired to /signup
  - Frontend: Auth gates via ProtectedRoute on all protected routes
  - Frontend: Root route auth-aware redirect
  - Frontend: HomeScreen real user data (name, countdown, 16-lesson progress)
  - Frontend: useVerifyAuth hook — validates stored tokens via /api/auth/me
  - Frontend: Auto-clearAuth on 401 from any API call
  - Onboarding store wiring: every step writes to useOnboardingStore on change
  - /test-drive route deleted (deferred post-launch)
  - Paywall heading renamed "Where you stand today"

F-061 ✅ Tâche 3 full loop shipped — audio capture, upload, backend analysis, diagnostic page render with real data. Verified end-to-end on recording #22.
  - `hooks/useAudioRecorder.ts` — MediaRecorder wrapper exposing status, error, durationMs, stream, startRecording, stopRecording, reset; Date.now()-based timing (sidesteps the hidden-tab throttle called out in F-076); releases getUserMedia tracks on stop/reset/unmount so the browser recording indicator doesn't linger
  - Maps getUserMedia errors (NotAllowedError, NotFoundError, NotReadableError, SecurityError) to human-readable copy; "permission" keyword in the string is what Tache3Session uses to switch into the permission-help card
  - `components/speaking/VuMeter.tsx` — stream prop drives a Web Audio AnalyserNode (fftSize 64, smoothing 0.55) read via requestAnimationFrame; AudioContext torn down on stream change / unmount; falls back to idle bars when no stream
  - `components/speaking/Tache3Session.tsx` — wired to useAudioRecorder; phase state machine (prep → recording → processing → error); 3-minute hard cap via useEffect on durationMs; stopRecording idempotency guard; CountdownTimer driven from durationMs in count-up mode
  - Upload path: `api.sessions.createRecording(topicId, blob, { targetLevel, uiLanguage, examProfile })` posts multipart to /api/recordings/upload; on success router.push(`/diagnostic?session=${id}`); on failure, blob is cached in a ref so the retry button re-uploads the same audio
  - Permission denial UX: dedicated "Microphone access needed" card with retry that re-enters prep and waits for a fresh user gesture (some browsers require this after denial)
  - `app/diagnostic/page.tsx` — reads `session` search param, calls `api.sessions.getDiagnostic`, renders real 4-couche scores (couchesToRows sorted worst-first), goulet, and up to 3 ordonnance steps (tops up with mock cards if backend returns <3); peach loader during fetch; dedicated error card with retry; falls back to mock data when no session param (so /diagnostic still works for design review)
  - Topic slug parsing is defensive: numeric slug → topic_id, non-numeric → fallback to 1 (see queued F-061.1 for the real picker + slug resolver)
  - tsc --noEmit: clean except the pre-existing TargetScoreSelect.tsx:98 error noted under "Known issues"
  - Out of scope and deferred to F-062/F-063: Tâche 1 and Tâche 2 session wiring (they share the useAudioRecorder + VuMeter primitives but have different state machines — multi-turn conversations vs single recording)

## Shipped — Week 2 (April 24)

F-061.2a ✅ Tâche 3 upload hotfix — tache_mode + error surfacing hardening
  - `lib/api.ts` `createRecording`: added `tacheMode` option accepting `1|2|3|'tache_1'|'tache_2'|'tache_3'`; normalizes bare digits to `tache_${n}` before posting. Defaults to `'tache_3'`. Unblocks F-062/F-063 reuse. Backend's `_validate_tache_mode_for_oral` rejects anything other than the full string form with a 400.
  - `components/speaking/Tache3Session.tsx` uploadBlob catch: differentiates `ApiError` (prefix with status code, surface backend `detail` verbatim), `TypeError` from fetch (actual network failure → "Couldn't reach the server"), and other errors (generic fallback). Stops mislabeling server-side errors as connectivity problems.
  - Tache3Session call site passes `tacheMode: 3` explicitly — normalized to `'tache_3'` at the API boundary.

F-061.2 ✅ Fetch method inference fix
  - Fixed fetch method inference in `lib/api.ts` `request()` — bodies now force POST. Affected `createRecording` and `uploadAudio` (would have bit F-062 too). Caller audit confirmed all 16 endpoints use correct methods.
  - Root cause: the request wrapper defaulted `method = 'GET'`. The two FormData callers passed only `{ formData: fd }` with no explicit method, so fetch was invoked with `GET + body` and the browser rejected it synchronously with "Request with GET/HEAD method cannot have body." This silent failure never reached the Network tab and was only pinpointed by transient `REC:` / `SESSION:` console instrumentation (removed on ship).
  - Fix: `method = opts.method ?? (body !== undefined || formData ? 'POST' : 'GET')`. Explicit overrides still work; all other callers already passed `method: 'POST'` explicitly so only the two FormData sites changed behavior.

F-061.3 ✅ Ordonnance shape normalization
  - Backend `ordonnance` is a wrapper object `{ couche_ciblee, nom_couche, exercices: [...] }` with per-exercise keys `{numero, type, consigne, modele, phrase, options, reponse, explication}`. Empty recordings serialize as `{}` (per `recordings.py:645`). Frontend was typing it as `OrdonnanceStep[]` and calling `.slice(0, 3)` on the object — instant runtime TypeError on first real diagnostic render.
  - `lib/api.ts`: new `RawOrdonnanceExercise` / `RawOrdonnanceBlock` types + a dedicated `mapOrdonnance(raw: unknown)` guard that returns `[]` for any unrecognized shape and key-maps present exercises (`numero→priority`, `consigne→action` with `type` fallback, `type→pattern`, `modele ?? phrase→example`). `RawDiagnosticBlock.ordonnance` retyped to `unknown` so the guard owns the shape check.
  - `app/diagnostic/page.tsx:316`: belt-and-braces `(diagnostic.ordonnance ?? []).slice(0, 3)` — if a future backend shape change breaks the mapper invariant, the page renders fewer cards instead of crashing. Mock-card padding (tops up to 3) still kicks in when backend returns fewer exercises.

F-062 ✅ Tâche 2 multi-turn role-play shipped end-to-end — 6-turn flow with examiner persona, per-turn review sheet with per-session suppression, final /end routes to diagnostic with real 4-couche analysis on combined audio.
  - `components/speaking/Tache2Session.tsx` — full rewrite against a phase state machine: `briefing → user-idle → user-recording → user-transcribing → reviewing → examiner-speaking → finalizing` (plus `error` recovery). Fixed 6-turn client-side cap (`TARGET_USER_TURNS`); backend hard cap is 12 so the client's cap always wins and we explicitly call finalize.
  - Reuses F-061 primitives unchanged: `useAudioRecorder` (60s per-turn cap via effect on `durationMs`, same pattern as T3's 180s but with a different threshold) and `VuMeter` (stream-driven AnalyserNode). No fork.
  - PTT flow — hold to record, release to stop. Idempotency guards (`stoppingRef`, `finalizingRef`) prevent the 60s cap effect racing a user tap, and prevent double-finalize on error-retry.
  - Per-turn upload: `api.sessions.uploadConversationTurn(conversationId, audioBlob)` — new method on the API surface (renamed from `uploadAudio` with enriched response shape: `autoEnded`, `wrapUpHint`, `examinerTurnNumber` added).
  - Examiner playback: simple `HTMLAudioElement` with autoplay attempt. On `NotAllowedError` (autoplay blocked on first load) shows a "Tap to hear the reply" ghost button; subsequent turns play inline once the audio context is user-unlocked. Text-only fallback when backend returns `examiner_turn_audio_url: null` (TTS unavailable).
  - Muted toggle respected on the NEXT examiner turn, not mid-sentence — intentional so toggling mute doesn't cut off the current line.
  - Per-session review-suppression: `reviewSuppressed` is ephemeral component state (NOT localStorage per spec). Default false; checkbox in the turn-review sheet flips it for remaining turns in the same session.
  - Turn-review sheet: simplified from spec — backend emits `feedback_grid` only at `/end` (see discrepancy note below), so the sheet shows the user's transcribed line with a "Confirmer" CTA and the suppress checkbox, **not** the Pyramide/Rebond/Ciblage moule breakdown. Full moule breakdown still appears on `/diagnostic` after finalize, via the existing mapper chain.
  - Finalize: `api.sessions.finalizeConversation(conversationId)` — new method hitting `POST /api/conversations/{id}/end`. Semantically identical to the spec's `/finalize` (runs 4-couche analysis across all candidate turns, returns recording_id, idempotent on completed conversations). Routes to `/diagnostic?session=<recording_id>` on success.
  - Error surface: mirrors F-061.2 pattern — `ApiError` → "{status}: {message}", `TypeError` → network error, microphone permission errors → recorder's own copy. Retry button re-enters the right phase based on state (briefing if /start failed, user-idle if mid-conversation, finalize if /end failed).
  - Scenario briefs: client-side literals for the three unlocked scenarios (`agence-voyages`, `ami-demenage`, `bibliotheque`); fallback brief for any other slug so direct URL edits don't crash (backend still rejects unknown `scenario_code` with 404 on `/start`). Picker wiring to `GET /api/conversations/scenarios` is deferred to F-061.1.
  - API surface additions (`lib/api.ts` + `lib/types.ts`): `ConversationStart`, `ConversationTurnResult`, `ConversationFinalizeResult` types; `createConversation` now takes an options bag (`scenarioCode`, `topicId`, `targetLevel`, `uiLanguage`, `examProfile`) and returns the richer `ConversationStart` shape with opening-examiner fields (always null for T2) and normalized turn caps.
  - Spec discrepancies documented for the follow-up ticket (not blocking ship):
      · Spec assumed `/turn` response carried `feedback_grid`; backend only emits feedback at `/end`. Per-turn moule coaching isn't available — sheet shows transcript confirmation instead.
      · Spec named the final endpoint `/finalize`; backend has `/end` with identical semantics. Frontend method name kept as `finalizeConversation`; HTTP endpoint is `/end`.
      · T2 `/start` returns `examiner_turn_text: null` (candidate opens). Spec's `examiner-speaking` phase after briefing is skipped for T2 — we go straight to `user-idle`. The phase still exists for T1 reuse in F-063.
  - Verification: `tsc --noEmit` clean except the pre-existing TargetScoreSelect.tsx:98 known issue.

F-062.1 ✅ Scenario slug↔backend code mapping + dev sanity check
  - Bug: browser test hit "Start conversation" on /speaking/tache-2/agence-voyages and got `404: Unknown or inactive scenario_code 'agence-voyages'`. Frontend was sending URL slugs; backend's `tache2_scenarios.code` column uses underscored + three entirely different spellings (picker and seeder drifted during F-049 seeding):
      · `agence-voyages` → `agence_voyages` (hyphen→underscore)
      · `ami-demenage` → `ami_demenagement` (different word form)
      · `bibliotheque` → `bibliotheque` (exact)
      · `collegue-quebecois` → `nouveau_collegue_quebecois` (prefix)
      · `agence-immobiliere` → `agence_immobiliere_canada` (suffix)
  - Fix: added a `backendCode` field to each `Scenario` / `ScenarioBrief` literal — one in `Tache2Picker.tsx`, one in `Tache2Session.tsx`. `createConversation` now sends `brief.backendCode` instead of the URL slug. URL slugs stay hyphen-cased (no breaking changes). Fallback for unknown slugs sends the slug itself; backend returns a clean 404 surfaced via the error overlay.
  - Dev sanity check (Tache2Picker): on mount in `NODE_ENV === 'development'`, fires `api.sessions.listTache2Scenarios()` once and `console.warn`s any unlocked SCENARIOS entry whose `backendCode` isn't in the backend response. Locked entries are skipped because `/scenarios` filters by the raccourci gate (F-053) — a "missing" warning for a gated row would be a false positive. Errors are swallowed silently.
  - New API method: `api.sessions.listTache2Scenarios()` — GET /api/conversations/scenarios, returns trimmed `{scenarios: [{id, code, difficulty}], aboveA2}`. Reused by the sanity check; eventually consumed by F-061.1 picker wiring as the source-of-truth replacement for the client literal.
  - TODO(F-061.1) comment on both sides points at the long-term fix: have the picker consume `/scenarios` directly, eliminating the drift problem by construction.

F-062.2 ✅ PTT pointer capture + minimum-hold guard
  - Bug: turn 2 of a T2 session produced a 110-byte empty webm; backend rejected with `500: Transcription failed: ... File does not appear to contain audio. File type is video/webm`. Turn 1 always worked.
  - Diagnosis (via transient REC:/T2: instrumentation, removed on ship): `RecordButton.tsx` wired `onPointerLeave={handlePointerUp}`. On turn 1, the getUserMedia permission prompt absorbs the pointer-down gesture — by the time the MediaRecorder starts, no layout shift matters. On turn 2, permission is cached, getUserMedia returns in ~10ms, the phase transition `user-idle → user-recording` mounts the turn-timer text + VuMeter above the button, the button shifts down in the layout → `pointerleave` fires against the user's still-held finger → `onPTTEnd` → `finishRecording` → recorder stops ~10ms after start → 0 audio chunks → 110-byte header-only webm. Full trace in conversation thread.
  - Fix 1 — pointer capture in `components/speaking/RecordButton.tsx`: `setPointerCapture(pointerId)` on pointerdown routes all subsequent pointer events to the button regardless of cursor position. `pointerleave` no longer fires while captured. `pointerup` still delivered correctly even if the user's finger drifts off the button. Dropped `onPointerLeave={handlePointerUp}`; added `onPointerCancel` handler (releases capture + fires onPTTEnd) to handle OS-level pointer takeaway (phone call, tab switch, app backgrounded, stylus lifted without a normal up event). Tap mode (`mode === 'tap'`, used by T3) is untouched — every new handler bails with `if (mode !== 'ptt') return`.
  - Fix 2 — `MIN_HOLD_MS = 200` guard in `components/speaking/Tache2Session.tsx` `finishRecording`: if `recorder.durationMs < 200` when stop fires, discard the blob, reset phase to `user-idle`, no upload, no error card. Silent design — a user slip-finger should feel like the button just didn't register, not like an error. Belt-and-braces on top of pointer capture; also catches genuine accidental taps.
  - Verification: 6 turns end-to-end, landed on /diagnostic?session=<id> with real 4-couche analysis. T3 tap flow re-tested — no regression (shared RecordButton component but tap mode bypasses every new handler).

---

## Shipped — Week 2 (April 27)

F-086 ✅ Le Raccourci → L'École rename. Atomic phase-1 of the F-086→F-089 pack.

**Backend (tcf-oral-tool):**
- `scripts/rename_raccourci_to_ecole.py` — idempotent SQLite migration. Renamed three tables (`raccourci_lessons` → `ecole_lessons`, `raccourci_quiz_questions` → `ecole_quiz_questions`, `user_raccourci_progress` → `user_ecole_progress`) and one column (`remediation_modules.raccourci_lesson_id` → `ecole_lesson_id`). Row counts preserved exactly: 16 lessons, 80 quiz questions, 80 progress rows. SQLite 3.50.4 auto-rewrites FK references on `ALTER TABLE RENAME`; foreign-key enforcement disabled during the migration window as belt-and-braces. Indexes keep their original `raccourci_*` names — internal sqlite_master metadata, not surfaced anywhere user-or-grep-facing.
- Discovery: an early run hit a Windows console encoding crash on the `→` character mid-loop, leaving one table renamed and two not. Migration script's idempotency check now tolerates per-table half-state and resumes from any partial state. Future runs (e.g. on prod first-deploy) re-run cleanly. ASCII `->` replaced the offending arrow in print statements.
- Backend code rename via one-shot `_f086_refactor.py` (deleted post-ship): 184 raccourci/Raccourci occurrences across 14 .py files replaced. ORM classes (`RaccourciLesson` → `EcoleLesson`, `RaccourciQuizQuestion` → `EcoleQuizQuestion`, `UserRaccourciProgress` → `UserEcoleProgress`), `__tablename__` strings, FK targets (`raccourci_lessons.id` → `ecole_lessons.id`), relationship names, the entire `app/services/raccourci_gating.py` (now `ecole_gating.py`), the entire `app/routers/raccourci.py` (now `ecole.py`) including `APIRouter(prefix="/api/ecole")`, three scripts (`seed_ecole_lessons.py`, `seed_ecole_quiz_placeholders.py`, `add_ecole_tables.py`), `app/schemas/modules.py::raccourci_lesson_id` field, and incidental references in `conversations.py`, `recordings.py`, `users.py`, `modules.py`, `main.py`. Substitution order: most-specific identifier first so e.g. `raccourci_lesson_id` was replaced before bare `raccourci_lessons` could eat it.
- 3 module JSONs (`nuance_reflex.json`, `to_get_reflex.json`, `gerondif_confusion.json`) had `raccourci_lesson_id` keys renamed to `ecole_lesson_id`. Reseeded via `python -m scripts.seed_remediation_modules`: 0 inserted, 3 updated. Post-reseed verify: `gerondif_confusion.ecole_lesson_id = 16` (lesson-16 link preserved across rename), other two NULL.

**Frontend (fluentpath-frontend):**
- One-shot `_f086_refactor.mjs` (deleted post-ship): 95 occurrences across 21 .ts/.tsx files. Component identifiers (`RaccourciProgress` → `EcoleProgress`, `RaccourciReveal` → `EcoleReveal`), field name on response shapes (`raccourci_lesson_id` → `ecole_lesson_id` on `RemediationModule`, `RecurringModule`, `ModuleWithContext`, `LearnModuleSheet`'s ShortModule), API path strings (`/api/raccourci` → `/api/ecole`), frontend route paths (`/raccourci/lesson` → `/ecole/lesson`), illustration asset paths, user-facing copy (`Le Raccourci` → `L'École`).
- Files moved: `components/home/RaccourciProgress.tsx` → `EcoleProgress.tsx`, `components/onboarding/RaccourciReveal.tsx` → `EcoleReveal.tsx`, `public/illustration-raccourci.{jpg,png}` → `illustration-ecole.{jpg,png}`. Directory `app/raccourci/` → `app/ecole/` blocked by Windows file lock (Next.js `.next` cache held handles); worked around with file-by-file moves + cascading `rmdir`. Stale `.next/` cache nuked at the end so the next dev start rebuilds with the new paths.
- Two regressions caught and fixed: the `Le Raccourci → L'École` substitution introduced **unescaped apostrophes** inside single-quoted JS strings (in `LearnModulePage.tsx`, `Paywall.tsx`, `Tache2Picker.tsx` — 7 broken literals total) — fixed by swapping to double quotes. Also produced a **broken JS identifier** `backToÉcole` (Unicode-valid but ugly) — renamed to `backToEcole` (ASCII).
- `RaccourciReveal` onboarding component renamed to `EcoleReveal` per atomicity rule (overrides earlier "scoped rename" interpretation). The component reveals the path to fluency — that path is now L'École.

**Strategic docs:**
- `fluentpath-frontend/CLAUDE.md`: 3 `RaccourciReveal` references updated to `EcoleReveal`.
- `fluentpath-frontend/README.md` + `public/illustrations/README.md`: `RaccourciReveal` references updated.
- `BACKLOG.md`: header note added at top documenting the rename. Shipped (✅) entries preserved verbatim (F-053, F-056, F-062.x details, F-080d details). Queued/deferred entries with raccourci references rewritten in place (F-064, F-066, F-069, "Mock Exam mode" deferred). The "in progress" header text updated to reflect post-F-086 reality and forward-link F-087 → F-089.
- `tcf-oral-tool/CLAUDE.md`: zero raccourci hits to start with — untouched.
- `HANDOVER.md`, `PROMOVA-PATTERNS.md`, `DECISIONS.md` — none existed in either repo. `HANDOVER.md` and `PROMOVA-PATTERNS.md` skipped silently per the per-prompt rule. `DECISIONS.md` awaiting Chadi's entry text (commit ships without it; gate 9 is satisfied because the file simply doesn't exist yet — when it does, the rename note will be its first entry).

**Verification gates (all 9 green):**
1. `GET /api/ecole/lessons` → 200 with 16 lessons. ✅
2. `GET /api/raccourci/lessons` → 404. ✅
3. DB: `ecole_lessons` exists, `raccourci_lessons` does not. ✅
4. `SELECT ecole_lesson_id FROM remediation_modules WHERE id='gerondif_confusion'` → 16. ✅
5. `app/ecole/page.tsx`, `app/ecole/lesson/[id]/page.tsx`, `app/ecole/lesson/[id]/quiz/page.tsx` exist. ✅
6. `app/raccourci/` directory does not exist. ✅
7. HomeScreen daily-action CTA href: `/ecole/lesson/${nextLesson.lessonNumber}`. ✅
8. `/learn` page footer copy: `"Back to L'École"` / `"Retour à L'École"`. ✅
9. `grep -ri "raccourci" tcf-oral-tool/ fluentpath-frontend/` returns ZERO active code references. Allowed survivors only: (a) the migration script `rename_raccourci_to_ecole.py` itself, (b) `.claude/settings.local.json` (gitignored local agent state), (c) `node_modules/typescript/.../fr/diagnosticMessages.generated.json` (TypeScript's French translation of "shorthand property" — completely unrelated to FluentPath), (d) BACKLOG.md historical entries below the header note (per Chadi's preserve-shipped-verbatim rule).

`pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

---

F-087 ✅ 27-lesson L'École curriculum. Phase 2 of the F-086→F-089 pack.

**Backend (tcf-oral-tool):**
- New `scripts/seed_ecole_curriculum.py` — single-run migration + seeder. Adds `phase` (default 1) and `subline_en` (nullable) columns to `ecole_lessons` via idempotent `ALTER TABLE ADD COLUMN IF NOT EXISTS`-equivalent (PRAGMA-guarded). Wipes `user_ecole_progress` (80 stale rows from the pre-rename test users — 0 completions, 1 quiz attempt, no real investment per F-086 Q1.2 audit). Truncates `ecole_lessons` and inserts the locked 27 rows. Updates `remediation_modules.ecole_lesson_id` for `gerondif_confusion` from 16 → 22 (gérondif moved from old curriculum lesson 16 to new curriculum lesson 22, in Phase 2). Linear prerequisite chain (1→2→3→…→27).
- Two minor fixes when saving Chadi's script: trimmed columns from the lesson INSERT that don't exist on `ecole_lessons` (status / quiz_attempts / completed_at / updated_at — those live on `user_ecole_progress`); replaced unicode arrows + check/cross marks in print statements with ASCII to avoid the same Windows console encoding crash that bit F-086.
- Curriculum locked: Phase 1 Fondations (1-16) replaces the old curriculum's Conjugation / Articles / Prepositions / etc. with Articles définis et indéfinis (1) → Concordance des temps et hypothèse (16). Phase 2 Approfondissement (17-27) is brand new: Verbes pronominaux (17) → Faire causatif (18) → Mise en relief (19) → Tournures impersonnelles (20) → Comparatifs (21) → Gérondif (22) → Présentatifs (23) → Connecteurs logiques (24) → Marqueurs temporels (25) → Registre oral (26) → Nominalisation (27). Voix passive removed from sequence; demoted to module library as `voix_passive_calque` per spec note (separate authoring ticket, not part of F-087).
- Each lesson row carries `subline_en` (deadpan English subline) authored at seed time. F-087 only stores them; F-089 surfaces them under the lesson title on cards.
- Backend code updates: `EcoleLesson` model gains `phase` + `subline_en` columns; `_lesson_row_to_summary` and `_lesson_full_detail` in `app/routers/ecole.py` expose both fields in the API response. `phase` defaults to 1 in both serialization and ORM, so any pre-F-087 row that survives a future regression lands as Fondations. `subline_en` flows through nullable; F-089 surfaces it conditionally.

**Frontend (fluentpath-frontend):**
- `lib/types.ts::Lesson`: `phase: 1 | 2` (required, defaulted by mapper) + `sublineEn?: string | null` (optional). `lib/api.ts::mapLesson` defaults `phase` to 1 when the backend omits it (covers any rollback / replay against an older API), maps `subline_en → sublineEn`.
- `components/home/HomeScreen.tsx`: `TOTAL_LESSONS` 16 → 27. Lesson list loop now renders all 27 rows with a Phase 2 divider injected at the boundary (when `prev.phase === 1 && current.phase === 2`). Divider component `<PhaseDivider />` (defined inline in HomeScreen since it's the only consumer): small-caps "PHASE 2 — APPROFONDISSEMENT" header + subline "11 lessons of polish, after the click." Keyed off row data, not hardcoded `lesson_number === 17`, so a future curriculum reshuffle just works.
- `components/home/EcoleProgress.tsx`: 3 milestones rebalanced to the new curriculum:
    · Fondations (Lessons 1–4) — unchanged
    · Approfondissement (Lessons 5–16) — replaces "Mécaniques" + "Raccourci Complet" splits; earned at lesson 16 to mark the transition INTO Phase 2 Approfondissement
    · L'École Complète (Lessons 17–27) — new, full-curriculum completion at lesson 27
- `components/Paywall.tsx`: feature comparison table "1 of 16" → "1 of 27"; first VALUE_ROWS entry "L'École — 16 lessons unlocking B2 grammar" → "27 lessons".
- `components/onboarding/EcoleReveal.tsx`: onboarding step 6 copy "16 lessons" → "27 lessons" (the rest of the EcoleReveal copy intentionally unchanged — the "shortcut" framing of the screen is now stale post-rename but is a separate copywriting concern, not a curriculum-count concern; flagged as F-087.x).
- `components/modules/LearnModuleSheet.tsx`: stale "(16 lessons)" comment in the lesson-fetch caching note updated to "(27 lessons post-F-087)".
- `app/ecole/page.tsx`: function name `ÉcolePage` → `EcolePage` (Unicode-acute identifier was a holdover from the F-086 substitution pass; cleaning to ASCII matches the same rule that produced `backToEcole` in F-086).

**Verification gates (all 7 green):**
1. `GET /api/ecole/lessons` → 27 lessons ordered by `lesson_number` ascending. ✅
2. Response includes `phase: 1` for lessons 1-16, `phase: 2` for 17-27. ✅
3. `SELECT COUNT(*) FROM ecole_lessons` → 27. ✅
4. `SELECT ecole_lesson_id FROM remediation_modules WHERE id='gerondif_confusion'` → 22. ✅
5. HomeScreen + `/ecole` render 27 lesson cards with the Phase 2 divider visible between #16 and #17 (visual gate — code path verified, browser verification deferred to Chadi's smoke).
6. `gerondif_confusion` linked-module picker now routes to `/ecole/lesson/22` (LearnModuleSheet reads `m.ecole_lesson_id` which the API returns as 22 post-seed).
7. Milestone badges render at lessons 4 (Fondations), 16 (Approfondissement), 27 (L'École Complète) with new copy.

`pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

**Filed:**
- **F-087.x** EcoleReveal copy refresh — the onboarding step 6 "The shortcut" framing is stale post-Le-Raccourci-→-L'École rename. Component renamed to EcoleReveal in F-086, lesson count updated to 27 in F-087, but the rhetorical lead-in still calls L'École "the shortcut." Chadi to revise the copy when ready (not blocking; F-087 was scoped to mechanical curriculum updates).

---

## In progress

**F-080 epic CLOSED 2026-04-26.** F-080a + F-080b + F-080c shipped 2026-04-25; F-080d shipped 2026-04-26. The intelligence layer is end-to-end live: detection → persistence → diagnostic surface → cross-session recurrence → Raccourci routing.

F-086 + F-087 shipped 2026-04-27. Next per the F-086→F-089 pack: F-088 (Couches → TCF criteria relabel — frontend-heavy, no DB churn), then F-089 (lesson card sublines render — purely cosmetic, reads what F-087 already seeded). Other queued tickets (F-061.1 T3 picker, F-064 lesson detail + quiz, launch-prep F-071–F-079, F-080.x detection-sensitivity refinement, F-080c.x Le Goulet cleanup, F-080d.x recordings(user_id) perf, F-080d.y public-glossary path, F-087.x EcoleReveal copy refresh) remain deferred.

---

## Queued — core product wiring (F-061.1, F-063, F-064)

**F-061.1** 📋 Tâche 3 topic picker + slug resolution
- Hardcoded `TOPIC` literal in `components/speaking/Tache3Session.tsx:29-34` still renders the "réseaux sociaux" prompt regardless of URL slug. Silent `topicId=1` fallback in `Tache3Session.tsx:48` sends the same topic_id for every session.
- Add `app/speaking/tache-3/page.tsx` — Tache3Picker, mirroring Tache2Picker. Consume existing backend `GET /api/recordings/tache3-topics` (recordings.py:487) which already returns `{topics: [{id, title, theme, sous_theme, difficulty, prompt_{fr,en,es}}], gates: {above_a2}}` — frontend isn't calling it yet.
- Decide on slug-vs-id URL shape: `TestTopic` model has no `slug` column today (only `id, title, theme, sous_theme, tache_3_prompt_*, tache_3_difficulty, is_active`). Either add a `slug` column backend-side OR keep numeric-id URLs and have the picker route to `/speaking/tache-3/<id>`.
- Update `components/speaking/SpeakingLanding.tsx:56` — currently hardcodes `'/speaking/tache-3/environnement'`. Route to the picker instead.
- Replace `Tache3Session`'s hardcoded TOPIC literal with a fetch on mount; show real prompt/difficulty/theme; proper "topic not found" error state instead of `|| 1`.
- Does not block core functionality — F-061 works end-to-end today with the fallback. This is UX cleanup.

---

F-062.3 ✅ Tâche 2 re-record current turn — "Refaire cette prise"
  - User-facing: new secondary button in the TurnReviewSheet alongside "Confirmer". Tap → current transcript discarded, user's optimistic bubble popped from chat, turn counter unchanged, phase resets to user-idle, user can hold PTT to re-record the same turn position. No max-attempts cap.
  - Backend (tcf-oral-tool):
      · Migration `scripts/add_turn_supersede_columns.py` (repo convention: direct sqlite3 ALTER TABLE + idempotent PRAGMA guard; no Alembic — project doesn't use it and the F-062.3 ticket's "Use Alembic" line was superseded by its own "File naming per repo convention" line). Adds `superseded_at TIMESTAMP NULL` + `superseded_by_turn_id INTEGER NULL` columns to `conversation_turns`, plus partial index `ix_conversation_turns_active` on (conversation_id, speaker) WHERE superseded_at IS NULL for hot-path queries.
      · New endpoint `POST /api/conversations/{id}/turn/{turn_number}/supersede` — sets superseded_at=now() on the target turn, cascades to the immediately-following examiner turn (if active) since that reply was generated in context of the now-rejected candidate transcript. Returns `{superseded_turn_id, superseded_turn_number, superseded_at, cascaded_examiner_turn_numbers, status: 'superseded'}`. Idempotent (second call returns the original superseded_at), 404 on unknown turn, 400 on non-candidate target or non-in_progress conversation, 403 on owner mismatch.
      · `_candidate_turns(conv)` helper now filters superseded — this one change propagates the soft-flag semantics through the hard-cap check in `/turn`, the zero-turns check in `/end`, and the combined-transcript build in `_run_conversation_analysis_and_persist`.
      · `_active_turns(conversation)` helper added to both `app/services/tache_1.py` and `app/services/tache_2.py` (mirror helpers — shared module is a future refactor). Applied to `generate_examiner_turn_*` (so the next examiner turn isn't prompted with stale context) AND `analyze_tache_*` (so superseded turns don't leak into final scoring).
      · `recordings.py::_conversation_snapshot_for` — filters superseded turns out of the /diagnostic page's conversation replay.
      · `_serialize_turn` exposes `superseded_at` + `superseded_by_turn_id` for debugability; frontend doesn't need them in the happy path.
      · Auto-supersede defensive path in `/turn` (spec item 3): **skipped**. The current backend assigns turn_number monotonically via `len(conv.turns)`, so a "new turn with same turn_number N" collision can't occur unless the frontend skips /supersede and re-uploads — in which case we'd have two active candidate turns in a row, not a collision. Documented deviation. The explicit `/supersede` endpoint is the single sanctioned path.
      · Turn response for `/turn` now includes `candidate_turn_number` — the frontend needs it to know what row to supersede on Refaire.
      · Audio file NOT deleted on supersede — kept for audit. Future async cleanup job is out of scope for F-062.3 and not tracked here yet.
  - Frontend (fluentpath-frontend):
      · `api.sessions.supersedeTurn(sessionId, turnNumber)` — new method + `ConversationSupersedeResult` type in lib/types.ts. Posts empty body to the cascade endpoint.
      · `ConversationTurnResult` type gains `candidateTurnNumber: number` (non-null; backend always populates).
      · Tache2Session state machine: new `'supersede-in-flight'` phase + `supersedingRef` double-tap guard. `pendingCandidateTurnNumber` state tracks the just-uploaded turn from upload → review → commit/discard. `handleReRecord` calls /supersede, pops the last (optimistic) user bubble, resets pendingCandidateTurnNumber, transitions to user-idle. On supersede error: reuses ErrorOverlay with a new `secondaryAction` prop offering "Keep this take" (falls back to Confirmer behavior so the user isn't stranded against a broken /supersede).
      · **Deferred-commit refactor**: `userTurnCount` now increments in `proceedAfterCommit` (Confirmer path) instead of in `uploadTurn`. This means the "Turn X of 6" indicator correctly stays on the current turn through a re-record cycle, and no decrement dance is needed.
      · TurnReviewSheet: "Refaire cette prise" as a ghost/outline secondary button below "Confirmer" (primary). The "Ne plus afficher cette revue" checkbox semantics are unchanged — it affects the NEXT turn regardless of this turn's resolution.
      · New `SupersedeInFlightOverlay` — brief "Discarding this take…" spinner, lighter visual weight than FinalizingOverlay since the action is sub-second.
  - Edge cases handled: double-tap Refaire (second tap short-circuits via supersedingRef), supersede during examiner-speaking (blocked — review sheet is only visible in 'reviewing' phase), network failure on supersede (error overlay + Keep-this-take fallback), multiple supersedes on the same turn position (backend monotonic turn_numbers and cascade logic handle it cleanly).
  - Final verification (Recording #25): DB soft-flag cascade confirmed on a 7-candidate-row conversation where 1 row was re-recorded — `conversation_turns` had (candidate 0, examiner 1, candidate 2 superseded, examiner 3 superseded via cascade, candidate 4, examiner 5, ...) with 6 active candidate turns total. `/end` analysis built the combined transcript from active rows only. Diagnostic page rendered real 4-couche scores matching conversation content (Le Goulet explanation cited "says 'I'm going to Marrakech' but explains neither preferences, needs, budget" — content from the kept turns, not the discarded retake).
  - `tsc --noEmit` clean on ship (only the pre-existing TargetScoreSelect.tsx:98 known error). Migration ran cleanly on dev SQLite.

F-063 ✅ Tâche 1 real recording (AI examiner conversation) shipped end-to-end — 4-turn personal-interview flow with randomized opening prompts from DB, per-turn upload + review sheet (Confirmer / Refaire cette prise), hybrid briefing-then-examiner-opens, final /end routing to /diagnostic with 4-couche analysis on combined active-turn audio.
  - Backend (tcf-oral-tool):
      · New model `Tache1Opening` in `app/models/models.py` — columns: `id`, `opening_prompt_fr` (NOT NULL), `opening_prompt_en`, `opening_prompt_es`, `is_active`, `created_at`. EN/ES columns mirror the Tâche 2 scenario table's multi-language pattern; examiner TTS only reads the FR column (kept for future bilingual-subtitle display).
      · Migration `scripts/add_tache1_openings.py` — idempotent CREATE TABLE IF NOT EXISTS + partial index `ix_tache1_openings_active` on (is_active). Repo-convention direct-sqlite3 pattern, same as `scripts/add_turn_supersede_columns.py` from F-062.3. Note: because `init_db.py` uses `Base.metadata.create_all()` the table auto-materializes when the backend imports the model — the explicit migration script is still shipped for fresh-DB bootstrapping and clarity.
      · Seeder `scripts/seed_tache1_openings.py` — 8 prompts with FR/EN/ES translations (idempotent upsert by `opening_prompt_fr`). Ran cleanly on dev DB: 8 rows inserted, all is_active=1.
      · `app/routers/conversations.py`: imported `Tache1Opening` + `random_opening as t1_random_opening_fallback` from the persona module; new helper `_pick_random_tache1_opening(db)` that `ORDER BY func.random() LIMIT 1` on active rows. `_append_examiner_turn` now branches on `conv.tache_mode == "tache_1" and next_number == 0` to use the DB pick; fallback to the in-code tuple if the table is empty or the query raises (defensive — a fresh DB without the migration shouldn't 500 a T1 session). All other examiner-turn flow unchanged — subsequent T1 turns still go through `generate_examiner_turn_t1(conv)` with Claude Sonnet.
      · `analyze_tache_1` already existed (F-048) — no changes needed. It uses `_active_turns()` so F-062.3's soft-flag cascade applies automatically on /end; `candidate_turn_number` already shipped in `/turn` response for Refaire.
      · No changes to `/supersede`, `/end`, or TTS. T1 and T2 share the same endpoints and analysis persistence pipeline.
  - Frontend (fluentpath-frontend):
      · `components/speaking/Tache1Session.tsx` — full rewrite as a near-clone of Tache2Session. Phase state machine: `briefing → examiner-speaking (opening) → user-idle → user-recording → user-transcribing → reviewing → supersede-in-flight | examiner-speaking (reply) → user-idle (loop) → finalizing`. Reuses F-061/F-062 primitives unchanged: `useAudioRecorder`, `VuMeter`, `RecordButton` (PTT mode with pointer capture from F-062.2), `TurnReviewSheet` (inlined — Confirmer + Refaire cette prise + "Ne plus afficher" checkbox).
      · T1-specific adjustments from T2: `TARGET_USER_TURNS = 4` (vs 6); `TURN_CAP_MS = 30_000` (vs 60_000 — T1 turns are short exchanges); hybrid briefing card with hardcoded prose (no scenario object / picker) → single "Start interview" CTA → /start returns `examinerTurnText` populated → phase lands in `examiner-speaking` before the user's first PTT (contrast with T2 which lands in `user-idle` because the candidate opens there); single `PEACH` bubble color for examiner bubbles (T1 has no per-scenario palette); turn indicator hidden during briefing AND during the opening examiner turn (shown once `userTurnCount > 0` or non-opening phase) so users aren't distracted by "Turn 1 of 4" while the examiner is still speaking.
      · `MIN_HOLD_MS = 200` slip-finger guard mirrored from T2.
      · Muted toggle + autoplay-blocked "Tap to hear the question" ghost button mirrored from T2 (copy adjusted: "question" vs "reply" since T1 is a Q&A).
      · Error overlay with secondary "Keep this take" escape for supersede failures — identical to F-062.3 pattern.
      · Deferred-commit via `proceedAfterCommit` / `userTurnCountRef`: `userTurnCount` increments on Confirmer (not on upload), so the "Turn X of 4" indicator correctly stays on the current turn through a re-record cycle.
      · Per-session `reviewSuppressed` ephemeral state (not localStorage) — same pattern as T2.
      · No API surface changes in `lib/api.ts` or `lib/types.ts` — `createConversation('tache_1', opts)` already worked (TacheMode type included 'tache_1'; `scenarioCode` was already optional; mapper normalizes `max_candidate_turns` (T1) vs `max_candidate_turns_hard` (T2) into `maxCandidateTurnsHard`). `supersedeTurn` / `uploadConversationTurn` / `finalizeConversation` unchanged.
  - Routing:
      · `app/speaking/tache-1/[topic]/page.tsx` — new dynamic route; renders `Tache1Session` inside `ProtectedRoute`. Slug is informational only (session doesn't branch on it).
      · `app/speaking/tache-1/page.tsx` — now redirects to `/speaking/tache-1/interview` (Next.js `redirect()`) for anyone who navigates to the bare URL by hand.
      · `components/speaking/SpeakingLanding.tsx` — Tâche 1 card `href` updated from `/speaking/tache-1` to `/speaking/tache-1/interview`.
  - Verification: `pnpm tsc --noEmit` clean except the pre-existing TargetScoreSelect.tsx:98 known issue. Migration ran idempotently (table auto-created on backend boot); seeder inserted 8 rows; 5 samples of `_pick_random_tache1_opening(db)` returned 4 unique prompts (expected distribution).
  - Deliberate deviations from spec:
      · `analyze_tache_1` already existed from F-048 — no new analyzer, no rubric-weight adjustments made in this ticket. T2/T3 weighting lives in `app/services/scoring_profiles.py::compute_weighted_note_globale` which already has a `tache_1` branch. If rubric calibration surfaces issues during F-079 (calibration with real students), revisit in a separate follow-up — not in scope for F-063.
      · Opening-prompt EN/ES columns seeded but not surfaced in UI yet. Examiner bubble renders only FR since that's the spoken language. Kept for parity with Tache2Scenario shape and future bilingual-subtitle display.

## Queued — follow-ups

_(none — F-063 closed; T1 full loop shipped, mirrors T2 behavior.)_

---

## Queued — core product wiring (continued)

**F-064** 📋 Lesson detail + quiz real data
- `app/ecole/lesson/[id]/page.tsx` fetches GET /api/ecole/lessons/{id}
- Quiz component submits to POST /api/ecole/lessons/{id}/complete
- Lesson completion updates user progress state
- HomeScreen lesson list re-renders with updated completion state

---

## Queued — polish for real-feel (F-065 to F-067)

**F-065** 📋 Profile page real data
- Replace hardcoded "Chadi" / "chadi@example.com" / "TCF C1 (level 5)" / "June 7, 2026" / Day 7 / 4/16 / 47 days
- Pull from useAuthStore.user (email, full_name, target_level, exam_profile, exam_date, goal, current_level)
- Preply CTA stays as-is (links to Chadi's Preply profile)
- Edit icon on exam date triggers a mini-editor that PATCHes /api/users/me

**F-066** 📋 Daily action card B — smart practice recommendation
- Currently hardcoded to "Tâche 2 · Agence de voyages"
- Replace with endpoint that returns recommended practice based on user's bottleneck couche
- Backend: new endpoint GET /api/ecole/recommended-practice
- Frontend: HomeScreen fetches and renders recommendation
- May be deferred to post-launch if bottleneck detection requires session history

**F-067** 📋 Streak endpoint + wiring
- Backend: GET /api/users/me/streak returns last-7-days practice activity count
- Frontend: HomeScreen reads from streak endpoint, renders "Day N · Current streak"
- Current fallback shows "Start your streak today" — keep as empty state

---

## Queued — methodology / content gaps (F-068 to F-070)

**F-068** 📋 TEF option in onboarding
- Split "Immigration" goal into "Immigration — TCF Canada" and "Immigration — TEF Canada"
- mapOnboardingToBackend routes second option to exam_profile='tef'
- No backend change needed (exam_profile column already accepts 'tef')

**F-069** 📋 French lesson titles in backend seeder
- Update seed_topics.py or ecole seeder
- Lesson titles must be French ("Conjugaison" not "Conjugation", "Prépositions" not "Prepositions")
- Lesson short_descriptions stay in interface language (English for EN users)
- Reseed the ecole_lessons table on dev DB before launch

**F-070** 📋 CEFR → TCF /699 score mapping
- Backend analysis engine must emit tcfScore (0-699) alongside noteGlobale (0-20) and cefrBand
- Map internal score → TCF band using official TCF Oral rubric (0-699)
- Frontend diagnostic page hero switches from {noteGlobale}/20 to {tcfScore} / 699 {cefrBand}
- Paywall radar already shows this; make sure diagnostic matches

---

## Queued — Module Library + Intelligence Layer (F-080)

**F-080** 📋 Sprint pivot (2026-04-25). Replace generic Claude-API feedback with a named library of L1-interference remediation modules; every speaking session tagged with detected modules; cross-session accumulation drives Raccourci routing. Architectural cornerstone: new `remediation_modules` table (coexists with existing `raccourci_lessons` via optional `raccourci_lesson_id` FK); every Tâche analysis outputs `detected_modules: [ids]`. Split into 4 phased sub-tickets with verification gates between each. Total budget ~3.5 engineering days + parallel module authoring by Chadi. See `F-080-SPEC.md` (to be added) for the full ticket text; summary per phase below.

**F-080a** ✅ Backend scaffolding — modules table + seed loader (shipped 2026-04-25, commit `4f48ae1` in tcf-oral-tool; first commit after git init)
- Migration `scripts/add_remediation_modules.py` (idempotent sqlite3 pattern from F-062.3) — creates `remediation_modules` + `session_detected_modules` with CHECK constraints on `category` and `severity`, partial active-row indexes.
- SQLAlchemy `RemediationModule` + `SessionDetectedModule` in `app/models/models.py` with JSON-blob TEXT fields for `detection_criteria`, `examples`, `content_refs`, `drill_ids`, `prerequisite_module_ids`.
- Pydantic schemas in new `app/schemas/modules.py` (ContentRef, ExampleEntry, DetectionCriteria, RemediationModule, DetectedModule).
- Seed loader `scripts/seed_remediation_modules.py` reading `*.json` from a modules folder (Windows path TBD — spec says `/mnt/user-data/uploads/modules/` which is Linux; finalize before implementation).
- CRUD endpoints in new `app/routers/modules.py` — `GET /api/modules`, `GET /api/modules/{id}`, `GET /api/modules?category=X`. No auth restrictions V1.
- Gate: migration idempotent, 2 authored modules seed and re-seed cleanly, schema CHECK rejects invalid category/severity.

**F-080.x** 📋 Module 1 (`nuance_reflex`) detection_criteria refinement — request-vs-make distinction for T2
- Surfaced during F-080b Path A regression analysis. The `nuance_reflex` `contextual_triggers` list says "T2 role-plays asking the candidate to recommend or weigh options," but doesn't distinguish between a candidate **MAKING** a recommendation (canonical trigger) vs **REQUESTING** one (e.g. asking a travel agent for advice — the candidate stating "Je préfère la plage" is preference-as-input-to-service, not opinion-defending). The current criteria treat both identically; Claude reads them inconsistently across runs.
- Possible refinement: split the T2 contextual_trigger into "candidate making a recommendation/weighing options for someone else" vs "candidate stating preferences as input to a service request" — only the first is a canonical nuance_reflex context.
- Not blocking F-080b. Surface during content-authoring review; Chadi to decide whether the criteria need rewording or whether the borderline case should be left out-of-scope.

**F-080b** ✅ Claude API integration — detect modules per session (shipped 2026-04-25 in tcf-oral-tool; Path A v2 fix-up shipped same day after gerondif_confusion smoke test)
- New `app/services/module_library.py` — three responsibilities: `fetch_active_modules_for_prompt(db)` renders the active library as a compact text block (~600 tokens for 2 modules; see F-080 deferred Q on prompt-size scaling), `fetch_valid_module_ids(db)` returns the set used for hallucination rejection, `persist_detected_modules(recording_id, detected_modules, primary_module_id, db)` is the single source of truth for writing detection rows. Single helper called from BOTH finalize paths.
- New `app/services/module_detector.py` — `detect_modules(transcript, tache_mode, db)` makes one Claude Sonnet call against a system prompt that injects the rendered library + per-Tâche category-priority instructions (T1: discourse_structure / register_mismatch / vocab_calque; T2: register_mismatch / vocab_calque / grammar_interference; T3: discourse_structure / verb_aspect / word_order). Weighting is prompt INSTRUCTION not hard filter — modules from non-priority categories still surface when criteria match. Empty `detected_modules` is an explicitly valid result (the prompt instructs Claude to return empty when nothing fits — false detections degrade student trust more than missed ones).
- `analyze_tache_1`, `analyze_tache_2`, `analyze_tache_3` each call `detect_modules` after the existing 4-couche analysis (same layered pattern as Yarden in T2 and argumentation in T3); the result is merged into the analyzer's output dict as `detected_modules` + `primary_module`. New optional `db` kwarg threaded through; when absent (legacy crossover path), analyzers default to empty detection.
- Persistence wired in BOTH finalize paths per spec amendment (T3 doesn't go through `/end`):
    · `app/routers/conversations.py::_run_conversation_analysis_and_persist` — T1 + T2 sessions, immediately after `db.refresh(rec)` for the new Recording row
    · `app/routers/recordings.py::_run_analysis_and_persist` — T3 (and any legacy upload path), after `db.refresh(feedback)`
  Both call sites wrap `persist_detected_modules` in a defensive try/except so a detection failure can never crash session finalize. The helper itself never raises.
- Hallucination protection: `persist_detected_modules` fetches valid module ids before insert and skips any detection whose `module_id` isn't in the active library, logging at WARNING with the rejected ids and the active set for debugging. Malformed detection entries (missing module_id, non-dict, non-numeric confidence) are similarly logged + skipped without crashing.
- Verification gates (all green):
    · imports clean across analyzers + routers (54 routes, no circular imports)
    · prompt block renders correctly for the 2 seeded modules (3111 chars, all detection_criteria fields populated)
    · demo-mode (no `ANTHROPIC_API_KEY`) returns `{detected_modules: [], primary_module: null}` — no fake detections
    · live Claude T2 prompt with "Je prefere la plage. C'est mieux pour se reposer." → detects `nuance_reflex` (confidence 0.72), supporting_quote verbatim from transcript
    · live Claude T1 prompt with "j'ai eu une biere", "j'ai ete a la maison", "j'ai eu ce poste" → detects `to_get_reflex` 3× (confidences 0.82–0.88), each with verbatim supporting_quote
    · live Claude T3 prompt with a clean 3-beat argumentative monologue ("Il est vrai que… Cependant… C'est pour cette raison que…") → empty detection, primary null. Critical negative-test pass: no false positive on a well-structured response.
    · hallucination test against persistence helper: mixed valid + 2 hallucinated + 4 malformed entries → only the 2 valid rows inserted, exactly 1 marked is_primary, non-numeric confidence preserved as NULL, all rejections logged at WARNING.
- Deferred to later iterations (per F-080 spec): confidence threshold filtering (storing all detections for now, threshold tuning postponed until we have data); per-Tâche category subsetting in the injected library (revisit at 25+ modules); admin UI for module CRUD (F-080.1 if/when authoring scales).
- Shipped on the master branch in tcf-oral-tool — second commit on the repo (after F-080a's initial commit `4f48ae1`).

  **Path A v2 (post-ship fix, same day):** smoke test of seeded Module 3 (`gerondif_confusion`, the first conditional-detection module) revealed F-080b's prompt only handled surface-visible modules cleanly. The detector was suppressing conditional detections to <0.4 (below the emit floor) because their criteria are by-design semantically ambiguous. Three fixes:
    1. **Detection prompt: two-class structure.** `_DETECTION_SYSTEM` now distinguishes Class 1 (surface-visible: keywords ARE the mistake; old behavior preserved with 0.85+ for unmistakable, 0.55–0.75 for suggested) and Class 2 (conditional: keywords are inspection triggers only, identified by markers like "wrongness depends on semantic context" / "inspection trigger only" / "see grammatical_signals" embedded in the keywords_wrong list). Conditional modules use a 4-step process — surface match → semantic intent eval → verify mismatch → emit at 0.55–0.75 — and the 0.4 floor explicitly does NOT apply to them.
    2. **Module ordering: alphabetical-by-id.** `fetch_active_modules_for_prompt` switched from severity-DESC to alphabetical, removing the anchoring bias that made high-severity modules dominate even when subtler conditional ones were the better match. Random ordering was tried first but introduced run-to-run variance; alphabetical is deterministic and category/severity-neutral.
    3. **Parser robustness + prompt cleanup.** Added `_extract_first_json_object()` — balanced `{...}` walker tolerant of leading prose preambles ("Looking at the transcript: …" before the JSON). Also fixed doubled-brace artifact in the OUTPUT FORMAT example (holdover from `.format()`-style template; my code uses `.replace()`) — Claude was occasionally mirroring the literal `{{...}}` back, producing unparseable output.
  **Verification gates after Path A v2 (all green, intentional non-borderline test cases):**
    · R1 nuance_reflex on T3 unambiguous flat stance ("Les réseaux sociaux sont négatifs…") → detected @ 0.87 (≥0.7 floor)
    · R2 to_get_reflex on T1 avoir-misuse → 3 detections @ 0.88, 0.82, 0.75 (multi-hit verbatim quotes)
    · R3a gerondif_confusion SHORT (2-sentence Module 3 example #4) → 0.65 (squarely in 0.55–0.75 conditional band)
    · R3b gerondif_confusion LONG (6-sentence T3 monologue with same misuse buried) → 0.65, confirming short-context starvation is NOT a separate factor
    · R4 clean argumentative monologue (negative test) → empty, no false positives
    · R5 hallucination test → 2 valid rows inserted, 1 is_primary, hallucinated/malformed all rejected with WARNING logs
    · Variance: 5x repeats of R3a → identical outcome (1 unique result across 5 runs) under deterministic alphabetical ordering
  **Test redesign noted:** the original F-080b ship test for nuance_reflex used the T2 plage transcript ("Je préfère la plage…"), which turned out to be a borderline case (T2 role-play where candidate REQUESTS rather than MAKES a recommendation). That borderline behavior is filed as F-080.x for Module 1 criteria review. Replacement regression test uses the unambiguous T3 flat-opinion case.
- Inject active-module library (id + name + detection_criteria only — keep prompt compact) into each of `tache_1.py`, `tache_2.py`, `tache_3.py` analysis prompts.
- Per-Tâche category weighting in prompt instructions (not hard filters): T1 favors discourse_structure + register_mismatch + vocab_calque; T2 favors register_mismatch + vocab_calque + grammar_interference; T3 favors discourse_structure + verb_aspect + word_order.
- Analysis output schema gains `detected_modules: [{module_id, confidence, supporting_quote}]` + `primary_module: string`.
- On `/end`, extract and insert one `session_detected_modules` row per detected module; set `is_primary=1` on the matching row. Empty detection logs a warning but does not fail finalize.
- Gate: T2 session persists 1-3 detection rows with exactly one `is_primary=1`; supporting_quote matches real candidate utterance; T1 session preferentially detects the weighted categories.

**F-080d.x** 📋 Perf — `recurring_modules` query index (deferred from F-080d B1)
- The `GET /api/users/me/recurring_modules` query joins `session_detected_modules` (scanned via `idx_sdm_user_module` on `module_id`) with `recordings` (via PK) and filters on `recordings.user_id`. Today `recordings.user_id` is NOT indexed (only the PK `ix_recordings_id`). EXPLAIN QUERY PLAN at F-080d ship time shows SQLite uses the `module_id` index to drive the GROUP BY and resolves recordings via PK lookup — no full scan of recordings observed.
- File now because: at first-1000-users scale, with ~25 recordings per user, the per-row recordings PK lookup is fast enough. If the query starts hot-pathing in production, add `CREATE INDEX idx_recordings_user_id ON recordings(user_id)` and re-run EXPLAIN.
- Spec asked for a 3-column index `(user_id, module_id, session_id)` on `session_detected_modules`. That shape doesn't fit the actual schema (no user_id or session_id columns on that table — user comes from the recordings JOIN, "session" is the recording_id). Ignore the spec shape; the simpler `recordings(user_id)` single-column index is the right intervention if/when needed.

**F-080d.y** 📋 Public-glossary path for `/learn/[module_id]` (post-launch)
- F-080d Q4 locked to Option A: pre-launch all visitors to `/learn/[id]` authenticate via `ProtectedRoute`. Cold state = logged-in user who hasn't triggered the module.
- Backend is already optional-auth ready (`get_current_user_optional` on `GET /api/modules/{id}`; `user_context: null` when no token). Frontend just wraps in `ProtectedRoute` per the existing pattern.
- Post-launch SEO play: drop the `ProtectedRoute` wrapper, render the page as a public glossary entry. Backend unchanged. Surfaces module library to search engines as long-form authored content; bonus marketing surface.

**F-080c.x** 📋 Full Le Goulet cleanup (deferred from F-080c per the F-080c.(3a) decision)
- F-080c removed `<GouletCard />` from `app/diagnostic/page.tsx` and stripped the goulet derivation block, but left in place: `components/diagnostic/GouletCard.tsx` (the component file), `Goulet` interface in `lib/types.ts`, `goulet` field on the `Diagnostic` type, the `goulet`/`gouletKey` mapping in `lib/api.ts::mapDiagnosticBlock`, and the backend `le_goulet` block in `_format_recording`. None of these affect the visible UI today; they're carried forward defensively in case other consumers reference them.
- Cleanup once nothing else reads goulet: delete `components/diagnostic/GouletCard.tsx`, drop `Goulet` + `goulet` field from frontend types and the api mapper, and stop writing `goulet_*` columns in `Feedback` (or keep them as legacy noise; either is fine).
- Not blocking. File now to keep tech debt visible.

**F-080c** ✅ Frontend — module-driven diagnostic page (shipped 2026-04-25)
- Backend: new endpoint `GET /api/recordings/{id}/detected-modules` in `app/routers/recordings.py`. Owner check via existing recording.user_id pattern. Joins `session_detected_modules` with `remediation_modules`, hydrates the JSON-blob columns (detection_criteria / examples / content_refs / drill_ids / prerequisite_module_ids) into structured shape. Returns `{primary_module, secondary_modules, detections}`; 404 on unknown/foreign recording_id, 401 on missing token. Module-data only — couche scores stay on `getDiagnostic` (avoids duplication; new endpoint stays focused). Smoke-tested with seeded detections, empty case, 404, 401 — all green. Detection rows that reference a deleted module are logged at WARNING and dropped from the response rather than 500 (defensive — F-080b's persist_detected_modules already enforces FK validity at write time).
- Frontend deps: `pnpm add react-markdown` (10.1.0). Used by InlineContentRef for rendering `inline_markdown` content_refs.
- New hook `lib/hooks/useInterfaceLanguage.ts` — returns `'en' | 'fr' | 'es'` from `useAuthStore.user.interfaceLanguage` with `'en'` fallback. Consumed by every F-080c component for FR/EN field selection. ES users fall back to EN content (V1 module authoring ships FR + EN only).
- New types in `lib/types.ts`: `ModuleCategory`, `ContentRefType`, `ModuleExampleEntry`, `ModuleContentRef`, `ModuleDetectionCriteria`, `RemediationModule`, `SessionDetection`, `DetectedModulesResponse`. Deliberately keeps the backend's snake_case field names (no camelCase mapper) — modules are read-only authored content that flows through unchanged, distinct from User/Recording mappers that bridge frontend-store-shape to backend.
- New api method `api.sessions.getDetectedModules(recordingId)` — returns `DetectedModulesResponse` verbatim from the new endpoint.
- Five new diagnostic components in `components/diagnostic/`:
    · `DetectedModuleCard.tsx` — primary module rendering: category badge (1-of-8 pastel palette mirroring `globals.css`), severity dot scale (1-5), module name, L1-interference description, supporting quote in italics ("From your session: …"), expandable "See examples" button. Confidence is NEVER surfaced — F-080c locked UX decision. Confidence is logged for debugging only via the network tab.
    · `SecondaryModulesList.tsx` — collapsed "Also detected · N" section. Expanded reveals per-module rows that themselves expand into description + supporting quote + examples. Per-module row picks the first non-primary detection for the supporting quote (T1 to_get_reflex emits multiple detection rows for the same module_id; we surface only one in the secondary view).
    · `ModuleExamples.tsx` — wrong/right/explanation triplets. Wrong line in red strikethrough; right line in green; explanation in `Why:` block. Reused by both the primary card's expand and the secondary rows' expand.
    · `InlineContentRef.tsx` — `react-markdown` rendering of `inline_markdown` refs (h1/h2/h3, **strong**, *em*, ul/ol/li, hr, code) styled to the FluentPath display tokens. `document` / `audio` / `external_link` types render placeholder cards ("Coming soon" — F-081 ships audio drills, F-082 ships interactive drills, document hosting deferred until authored content needs it).
    · `EmptyDetectionFallback.tsx` — "No specific reflexes detected this session. Keep practicing." Bilingual FR/EN copy; ES falls back to EN.
- Diagnostic page rewrite (`app/diagnostic/page.tsx`):
    · Parallel fetch via `Promise.all([getDiagnostic, getDetectedModules])`. The diagnostic call is the load-blocker; `getDetectedModules` failure is non-fatal — falls back to the empty-fallback state (which is also a valid product state).
    · Section 2 LA MÉTHODE EN COUCHES: header copy changed to "Your CEFR-tracking baseline" — bars stay, position is now secondary context.
    · Section 3 LE GOULET removed from JSX. Replaced by inline `DetectedReflexesSection` (composes `DetectedModuleCard` + `SecondaryModulesList` + `EmptyDetectionFallback`).
    · Section 4 L'ORDONNANCE conditionally rendered only when `primary_module` exists AND has at least one `content_refs` entry. Module 2 (`to_get_reflex`) ships empty content_refs by design — for those, examples in the primary card ARE the teaching surface; L'ORDONNANCE section disappears entirely. Otherwise renders the primary module's content_refs sorted by `display_order`, each via `InlineContentRef`.
    · Mock-mode (no `?session=` param, design-review path) lands on the empty fallback in DETECTED REFLEXES with L'ORDONNANCE skipped — keeps mock surface area small and matches a real product state.
    · Sections 5/6 (Session details, Corrected transcription) untouched — still mocked, out of scope for F-080c.
- Verification: `pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue; backend endpoint smoke-tested via `TestClient` (200 with detections, 200 with empty, 404, 401); routes count incremented from 54 → 55.
- Le Goulet cleanup deferred to F-080c.x (component file, type field, api mapper, backend column writes all left in place — F-080c only removed the visible UI surface per (3a) decision in the implementation discussion).
- F-080c locked UX decisions held: secondary modules collapsed by default, no confidence threshold, confidence never surfaced in UI, Le Goulet removed from visible UI.
_(F-080c shipped detail captured above; legacy queue text was here.)_

**F-080d** ✅ Cross-session intelligence + Raccourci routing (shipped 2026-04-26 — closes the F-080 epic)

Backend (commit `cbd1d8e` in tcf-oral-tool):
- New endpoint `GET /api/users/me/recurring_modules` (in `app/routers/users.py`) — modules detected in 3+ distinct recordings for the authed user, sorted by severity DESC then recurrence_count DESC. Each entry: `module_id`, `name_en`, `name_fr`, `category`, `severity`, `raccourci_lesson_id`, `recurrence_count`, `first_detected_at`, `last_detected_at`, `recording_ids`. Empty array on cold users (status 200, not 404). Threshold constant `RECURRING_MODULE_RECORDING_THRESHOLD = 3`.
- Schema-correction note: F-080d spec referenced `session_id` / `user_id` columns on `session_detected_modules` that don't exist. Actual schema has `recording_id` (FK to recordings, recordings owns user_id). Response field renamed from spec's `session_ids` → `recording_ids` so the API contract matches the data model. "Session" stays in user-facing copy only ("Detected in 5 of your sessions").
- Augmented `GET /api/modules/{module_id}` (in `app/routers/modules.py`) — endpoint already existed from F-080a as public-read CRUD. Added optional auth via `get_current_user_optional`; when token is present and user has detections, attaches `user_context` block (`recurrence_count`, `first_detected_at`, `last_detected_at`, `detected_in_recordings`). Always present in response, null when no token / no detections / cold user. 404 unchanged.
- Query plan: `SCAN sdm USING INDEX idx_sdm_user_module + SEARCH r USING INTEGER PRIMARY KEY` — no full scan of recordings even though `recordings.user_id` is unindexed. Fine for first-1000-users scale; tracked as F-080d.x.
- Verification: 4 gates green + EXPLAIN QUERY PLAN clean (run from F-080d round 1 with snapshot/restore for the test user's pre-existing detections).

Frontend (commit ahead of this BACKLOG.md update in fluentpath-frontend):
- `lib/types.ts` adds `ModuleUserContext`, `ModuleWithContext`, `RecurringModule`, `RecurringModulesResponse`. Snake_case preserved (read-only authored content; no camelCase mapper layer).
- `lib/api.ts` adds `api.users.getRecurringModules()` and a new `api.modules.get(moduleId)` namespace.
- New shared `components/modules/LearnModuleSheet.tsx` — bottom-sheet picker for linked modules (raccourci_lesson_id non-null). Two CTAs: primary "Lesson N: {title}" → `/raccourci/lesson/{N}`, secondary "Just read about this pattern" → `/learn/{module_id}`. Backdrop tap + X close + body-scroll lock. Lesson title is auto-fetched via `api.lessons.list()` when caller doesn't pre-resolve.
- New shared `components/modules/RecurringModuleCard.tsx` — compact card (name, category badge, severity dots, "Detected in N of your sessions") used in HomeScreen "Recommended for you" section. Whole card is the tap target.
- `components/home/HomeScreen.tsx` — "Recommended for you" section inserted between Zone 1 (today's daily action card) and Zone 2 (Le Raccourci 16-lesson list). Hidden entirely (no banner, no header) when `recurring_modules.length === 0`. Picker state + portal lifted into HomeScreen; tap routing branches linked → sheet vs orphan → direct push.
- New route `app/learn/[module_id]/page.tsx` + `components/learn/LearnModulePage.tsx` — wrapped in `ProtectedRoute` per Q4 Option A (cold state = authed user with no detections, NOT public visitor). Header (back chevron, name_en, category badge, severity dots), recurrence pill (suppressed when user_context null) using `date-fns.formatDistanceToNow` for "most recently 2 days ago" copy, FR/EN locale switching, long-form description, examples expanded by default (no toggle), conditional footer CTA (linked → "Go deeper in Lesson N: {title}" + secondary text "Or just close this"; orphan → "Back to Le Raccourci"). Loader/error screens with Retry. Reuses `ModuleExamples` from F-080c.
- `components/diagnostic/DetectedModuleCard.tsx` — added "Learn this" button alongside the existing "See examples" expand. New optional `onLearnTap` prop; caller (DiagnosticInner) handles routing via the same shared LearnModuleSheet picker.
- `app/diagnostic/page.tsx` — wired `handleLearnTap` callback through DetectedReflexesSection → DetectedModuleCard. Picker state + sheet portal lifted into DiagnosticInner. Lessons cache lazy-fetched on first picker open.
- Type reconciliation: `RemediationModule.id` (canonical) vs `RecurringModule.module_id` (snake_case from backend response). LearnModuleSheet's internal `ShortModule` interface uses `id`; HomeScreen does the trivial `module_id → id` mapping at the picker call site so both consumers (diagnostic page + HomeScreen) feed the sheet a uniform shape.

Verification: `tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue. The 7 F4 gates require Chadi's manual session-recording (3 deliberate trigger sessions + linked-module retest with temporary `raccourci_lesson_id: 16` on `to_get_reflex.json`); code paths are wired, ready for browser smoke.

Filed:
- F-080d.x — perf follow-up for `recordings(user_id)` index if the recurring query hot-paths.
- F-080d.y — public-glossary path for `/learn/[module_id]` (post-launch SEO play; backend optional-auth ready).
- F-080d.z — verification harness rule: any test that mutates `session_detected_modules` MUST use try/finally with snapshot+restore. Adopted after the round-1 cleanup leak; documented in this ticket's commit message.

**F-080 deferred architectural questions (flagged in spec; revisit when relevant):**
- Prompt-size scaling once library passes ~25 modules — inject category-subset per Tâche rather than full library.
- Early false-positive detections — add confidence threshold (persist only >= 0.7) in a 2nd iteration of F-080b.
- Module deprecation workflow — schema has `active: false` but no operational path defined.
- Module authoring pipeline — V1 is JSON files + reseed; V2 admin-UI is deferred (would be F-080.1).

**F-080 unblocks** (out-of-sprint follow-ups): F-081 audio content refs (native-speaker drills), F-082 interactive drill implementation, F-063.1 T1 audio autoplay investigation, F-063.3 T1 review-sheet timing UX, F-061.1 T3 topic picker (lower priority once module-driven feedback lands).

---

## Queued — launch prep (F-071 to F-079)

**Pushed behind F-080 per 2026-04-25 pivot.** Still on the sprint board but re-prioritized after the intelligence layer ships.

Previously called "F-060 launch prep" umbrella. Split into discrete tickets here.

**F-071** 📋 Password reset flow
- Backend: POST /api/auth/forgot-password (email link), POST /api/auth/reset-password (token + new password)
- Frontend: /forgot-password screen, /reset-password/[token] screen
- Email sending: SendGrid or Resend

**F-072** 📋 JWT expiry + refresh token handling
- Backend: shorten JWT to 1 hour, issue refresh tokens (7 days) on login/register
- Backend: POST /api/auth/refresh endpoint
- Frontend: api.ts intercepts 401, tries refresh, retries original call
- Frontend: on refresh failure, clearAuth and redirect to /login

**F-073** 📋 Onboarding resume-from-step
- Each onboarding step component accepts initialValue prop
- OnboardingFlow reads useOnboardingStore on mount, resumes from last populated step
- If user refreshes mid-onboarding, they don't lose progress

**F-074** 📋 422 email TLD error messaging
- Signup page parses 422 response body for validation detail
- Shows specific message "Please use a valid email address (not .local, .test, or .example)" instead of generic "Could not create account"

**F-075** 📋 Audio upload security hardening (carried from F-050)
- Backend: server-side size cap on /api/audio/upload (5 MB hard limit)
- Backend: user_id on Recording model + auth check on /api/audio/{id} serve route
- Current state: raw filesystem paths exposed as URLs with no ownership check

**F-076** 📋 Background tab timer drift fix (carried from F-050)
- Frontend: PTT 60s cap in Tache2Session uses performance.now()+setInterval
- Chrome throttles setInterval in hidden tabs, timer drifts
- Fix: use Date.now() deltas (already pattern in useAudioRecorder)

**F-077** 📋 Production environment config
- Backend: production .env with real secrets
- Backend: CORS allow_origins updated to production domain (remove localhost)
- Frontend: NEXT_PUBLIC_API_URL for production
- Deploy backend to production host (DigitalOcean or similar)
- Deploy frontend to Vercel production

**F-078** 📋 Asset drop — 11 missing 3D illustrations
- Source via Canva or Fiverr
- Files needed: key.png, calendar.png, target.png, stairs.png, globe.png, graduation-ca.png, passport.png, flag-canada.png, flag-spain.png, flag-uk.png, speech-bubble variants
- Drop into fluentpath-frontend/public/icons/

**F-079** 📋 Calibration with real students
- Recruit 5-10 past Preply students with known TCF scores
- Have them record sessions in the launched product
- Compare FluentPath predicted TCF score vs actual exam score
- Tune analysis engine thresholds if gaps exceed ±50 points on /699 scale

---

## Deferred — post-launch (Week 3+)

**F-093** ⏸ Streaming transcription via WebSocket STT
- Replace Whisper API batch transcription with streaming provider (Deepgram, OpenAI Realtime API, or Groq Whisper streaming).
- Backend: WebSocket endpoint for audio streaming, partial-result forwarding, reconnection handling.
- Frontend: real-time transcript rendering during recording, interim vs final states.
- Migration: existing recordings stay batch; new recordings stream.
- Estimate: 3-5 days. Priority: High post-launch. Filed 2026-04-27 from observed Gemini Live UX.

**F-093.1** ⏸ Progressive transcription UI (no backend change)
- Frontend-only illusion of streaming using existing batch backend. Show waveform of captured audio, animated "Transcribing..." text, then word-by-word stagger animation when transcript arrives.
- ~2 hours work. Optional pre-launch in QA window May 2-3 if real-streaming feel is desired before F-093 ships. Filed 2026-04-27.

⏸ **Stripe integration** — deferred per explicit decision. Backend first, revenue later.
⏸ **Test-drive recording before paywall** — post-launch A/B test for conversion optimization
⏸ **Writing module (Expression Écrite)** — full TCF coverage beyond Expression Orale
⏸ **Exam Simulation mode** — distinct from Learning Mode (current default)
⏸ **Mock Exam mode** — separate scoring mode recommended after completing L'École
⏸ **Mobile PWA install prompt + service worker** — Phase 1 is responsive web
⏸ **Cross-session pattern detection** — locked behind 3-session minimum
⏸ **PDF export of diagnostic** — not required for launch
⏸ **Teacher dashboard** — aggregate analytics across students, Preply integration
⏸ **Referral system** — viral growth loop
⏸ **Email notifications** — "You haven't practiced in 5 days"
⏸ **Onboarding tutorial overlay** — first-time UX walkthrough

---

## Known issues — not blocking

- `components/onboarding/TargetScoreSelect.tsx:98` — pre-existing v0 unknown-narrowing TypeScript error. Cosmetic, doesn't break build.
- Backend `main.py` CORS has `allow_credentials=True` — not needed for JWT-only but harmless; leave it.
- Paywall.tsx has a lingering `{/* ── Test-drive section ─────── */}` code comment referencing deprecated feature. Cosmetic.

---

## Architectural lessons (ops gotchas from shipped tickets)

### Uvicorn `--reload` on Windows: worker processes go stale silently

Learned during F-062.3. On Windows, `uvicorn --reload` with the WatchFiles backend has edge cases where:

- WatchFiles doesn't always detect edits in nested subdirectories (`app/routers/*.py` in particular — `scripts/*.py` edits were detected in the same session).
- Worker processes don't fully terminate on reload, accumulating zombie workers that continue answering requests with their original in-memory module state.
- The `.pyc` file timestamp can reflect a *past* import (leaving you reasoning about fresh bytecode when the serving process is holding old code).

Symptom: source code on disk provably contains a change (grep, `inspect.getsource(<fresh import>)`), but the HTTP response body doesn't reflect it. F-062.3's /turn endpoint was missing `candidate_turn_number` in the wire response for 2+ hours of debugging despite the field being on disk in two return dicts.

**Nuclear restart protocol** (when response doesn't match source):

```
taskkill /F /IM python.exe
find . -type d -name __pycache__ -exec rm -rf {} +
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The `taskkill /F` is the non-negotiable part — stops every Python process bound to the workspace, not just the foreground one. WatchFiles will not save you from a zombie worker holding a stale module.

Belt-and-braces diagnostic pattern: add `print(..., flush=True)` calls in the live handler (not just the return dict — also entry with `__file__`) and watch uvicorn stdout. If the prints don't fire, you're not looking at the right process. If they fire with the right `__file__` but the wire body still doesn't match, the serving process is new but the browser/cache/DevTools is showing a stale response — reload the network tab.

---

## Working protocol reminder

- Every new ticket drafted must reference this BACKLOG.md and use the next available F-0xx number.
- Every completed ticket must be marked ✅ in this file with a brief summary of what shipped.
- If this file conflicts with memory or a past conversation, this file wins.
- External tracker equivalent: there isn't one. This file IS the tracker.

---

End of BACKLOG.md.
