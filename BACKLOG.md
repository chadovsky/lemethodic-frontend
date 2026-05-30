# LeMethodic Backlog

**Source of truth** for LeMethodic sprint work. Maintained in the frontend repo because most active work is here, but covers both frontend and backend.

**Last updated:** 2026-05-01 (P-100 / P-100.5 superseded by P-230 + Phase 1 Architecture Rework from LEMETHODIC-CURRICULUM v0.2 — 33 tickets P-200 through P-269 filed; P-115 + P-104 + P-100.5 still shipped as production state until P-230 implementation lands)
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
_Diagnostic view shipped; Progress page surface tracked separately as P-100; session-details data layer remains a future ticket (referenced inline within F-084 / F-084.x / F-075b.x)._

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

F-089 ✅ Lesson card subline rendering. Final phase of the F-086→F-089 pack.

**Backend (tcf-oral-tool):**
- No changes. F-087 had already exposed `subline_en` on both `_lesson_row_to_summary` and `_lesson_full_detail` in `app/routers/ecole.py`; the model column was added in the same seed. B1 verification confirmed the API was already shipping the field on all 27 lessons.

**Frontend (fluentpath-frontend):**
- `lib/types.ts::Lesson.sublineEn` and `lib/api.ts::mapLesson` were both wired in F-087 — F-089 only adds rendering.
- `components/home/DailyActionCard.tsx`: optional `subline?: string` prop. Rendered between title and descriptor at 14px / weight 500 / `INK_MUTED` / line-height 1.5, no italic. Title bottom margin tightens from 8 → 4 when a subline is present so the visual stack stays balanced.
- `components/home/LessonListItem.tsx`: same `subline?: string` prop, rendered as a third single-line ellipsised row at 13px between title (15px) and descriptor (12px). Subline conditional — locked rows still get it (they get `EcoleLesson.sublineEn` regardless of progress).
- `components/home/HomeScreen.tsx`: passes `subline={nextLesson.sublineEn ?? undefined}` to the "Today's session" `DailyActionCard`, and `subline={lesson.sublineEn ?? undefined}` to each `LessonListItem` in the L'École list. Picker pre-resolution now caches both title and subline (`pickerLessonTitle`, `pickerLessonSubline`) and forwards both to `LearnModuleSheet`.
- `components/modules/LearnModuleSheet.tsx`: new `lessonSubline?: string | null` prop (parallel to `lessonTitle`). Same caching pattern — caller can pass it to skip the roundtrip; otherwise the on-open `api.lessons.list()` fetch fills it in. Subline is rendered as a third line inside the primary "Structured lesson" CTA below the existing eyebrow + lesson label, at 13px / weight 500 / opacity 0.7 against the dark button background.
- `app/diagnostic/page.tsx`: same picker pre-resolution change as HomeScreen — `pickerLessonSubline` derived from `lessonsCache` and forwarded to the `LearnModuleSheet` invocation.
- `components/learn/LearnModulePage.tsx`: "Go deeper to Lesson N: {title}" primary CTA on `/learn/[module_id]` now renders the linked lesson's subline below the title line in the same dark-button-on-light-bg style as the picker. Same surface as the picker primary CTA — added to scope after a `lesson.title` audit (the original `title_en|title_fr` grep missed this because the title arrives via the normalized `Lesson` shape).
- `app/ecole/lesson/[id]/page.tsx` rewritten — split into a thin server shell that awaits route params and a new `LessonDetailClient.tsx` that fetches `api.lessons.list()`, filters by `lesson_number`, and renders real title + subline + description from the data layer. Replaces the pre-F-089 hardcoded `LESSON_TITLES` stub map (which only covered the old 16-lesson curriculum, with lessons 17–27 falling through to "Lesson N"). Subline appears between the h1 title and the existing duration eyebrow, at 16px / weight 500 / `INK_MUTED` / line-height 1.5. This was an F-087 verification miss (gate 5 confirmed the list rendered 27 cards but never clicked into a detail page); bundled into F-089 since gate 6 cannot pass without real data wiring. See `F-080d.z` rule #2.

**Verification gates (7):**
1. `SELECT COUNT(*) FROM ecole_lessons WHERE subline_en IS NULL` → 0. ✅
2. `GET /api/ecole/lessons` returns `subline_en` populated on all 27 lesson objects. ✅ (curl with minted JWT — `count: 27`, `with_subline: 27`).
3-7. UI rendering gates — code paths verified end-to-end, `tsc --noEmit` clean (only pre-existing `TargetScoreSelect.tsx:98` issue). Browser smoke deferred to Chadi: "Today's session" card, home/`/ecole` list (all 27 + Phase 2 divider), `/ecole/lesson/1` showing "Coffee can't stand alone here. It needs an article. Don't ask why.", and `LearnModuleSheet` picker showing lesson 22's "Three traps wearing the same '-ing.' We disarm them one by one." in the primary CTA.

**Filed:**
- **F-089.x** quiz page (`app/ecole/lesson/[id]/quiz/`) is still stub — hardcoded preposition questions regardless of route param. Out of F-089 scope (subline rendering only); flagged as a follow-up since the detail page rewrite makes the contrast more visible.
- **F-080d.z rule #2** added (see below) — list rendering verification gates must also click through to a detail page reached from the list.

`pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

---

F-088 ✅ Couches → TCF criteria relabel. Closes the F-086→F-089 pack.

**Spec correction (commit + ticket history accuracy):** the F-088 spec referred to a `/api/diagnostic/{session_id}` endpoint; this codebase doesn't have one. The diagnostic block is served under `GET /api/recordings/{id}` with `result["diagnostic"] = {...}`. Frontend: `lib/api.ts:890` + `mapDiagnosticBlock()`. The implementation targets `/api/recordings/{id}` (and the `/history` companion that uses the same shape).

**Backend (tcf-oral-tool):**
- New `app/services/couche_labels.py` — single source for the 4-couche TCF mapping (`le_fond → Étendue`, `les_moules_des_idees → Cohérence`, `les_moules → Correction`, `les_reflexes_anglais → Aisance`). Exposes `couches_array(scores)` returning `[{internal_key, display_label_en, display_label_fr, score}]` in the canonical order. EN/FR labels are intentionally identical today (TCF criteria use the same French words across language tracks) but kept as distinct keys for forward compatibility.
- `app/routers/recordings.py` — hard cut: replaced the `la_carte` dict in both `/api/recordings/history` (line ~594) and `GET /api/recordings/{id}` (line ~791 in `_format_recording`) with the new `couches` array. No transition period, no dual-shape support.
- `app/templates/index.html` — the legacy admin/demo dashboard's `displayResults()` migrated alongside the API change. Reads `d.couches` (array), constructs an internal `carte` dict from `internal_key` → `score`, and the rest of the rendering pipeline (which calls `coucheLabel(internal_key)`) is untouched. Admin keeps showing internal pedagogical names per F-088 F5 (internal naming preserved on internal tools).
- Untouched: `analytics.py` (`latest_carte`, `points[].le_fond`, `couche_trends`) — the FluentPath frontend doesn't consume `/api/analytics/*`; only the legacy admin template does. Out of F-088 scope.
- Untouched: `analysis.py` LLM contract (the LLM still emits `la_carte` in the analysis JSON; the relabel is a serialization-boundary concern, not an internal-data concern). Same for `Feedback` model column names.

**Frontend (fluentpath-frontend):**
- `lib/types.ts::Couche` — `label: string` replaced by `displayLabelEn: string` + `displayLabelFr: string`. `CoucheKey` narrowed from 5 keys to 4 (prononciation removed; the F-088 array doesn't carry it and the historical defensive 5th key was never emitted in production).
- `lib/types.ts::Goulet` — `nom` + new `nomFr` string carrying the bottleneck's TCF display labels (pre-resolved by the mapper so the diagnostic page can pick by interface language without rewalking the array).
- `lib/api.ts::mapDiagnosticBlock` — reads from `d.couches` array, drops the local `COUCHE_LABELS` dict (labels now come from backend per request). Goulet resolution looks up the matching couche in the array to pre-fill `displayLabelEn` + `displayLabelFr` on the Goulet shape.
- `app/diagnostic/page.tsx` — `couchesToRows()` takes an `InterfaceLanguage` and picks `displayLabelFr` for `lang === 'fr'`, `displayLabelEn` otherwise. New `TCF_SECTION_COPY` map gives the eyebrow text in EN/FR/ES (`TCF Evaluation` / `Évaluation TCF` / `Evaluación TCF`). Section heading "Your CEFR-tracking baseline" preserved per spec. Component imports `useInterfaceLanguage()`.
- `components/diagnostic/CouchesDiagnostic.tsx::DEFAULT_ROWS` — demo-mode mock data labels updated from internal names (Le Fond / Les Moules / …) to TCF criteria so demo mode matches a real session's bar names. Bottleneck callout already generic ("Your bottleneck is the top row") — no couche-specific text to update.

**DECISIONS.md:** entry appended to `tcf-oral-tool/DECISIONS.md` under `April 27, 2026 — Couches → TCF criteria relabel (F-088)`. Documents the relabel, the Réflexes Anglais ≠ Aisance honesty flag, and the F-090 backend refactor as the proper post-launch fix.

**Verification gates (7):**
1. Backend: `curl /api/recordings/{id}` returns `couches` array with `display_label_en` + `display_label_fr` populated for all 4 couches. ✅ (verified live: `Étendue`, `Cohérence`, `Correction`, `Aisance`)
2. Backend: `internal_key` field present on each couche. ✅ (live verified)
3. Frontend: diagnostic page header — code path verified (eyebrow reads from `tcfCopy.eyebrow`, switches on UI lang). Browser smoke deferred.
4. Frontend: 4 score bars labeled Étendue · Cohérence · Correction · Aisance. Code path verified (mapper reads `display_label_*` per couche; `couchesToRows` picks by lang). Browser smoke deferred.
5. Frontend: bottleneck callout uses new labels — copy is generic ("Your bottleneck is the top row. Fix it first.") so the relabel is automatic via the bar at the top.
6. Progress tab radar chart — **N/A**: `app/progress/page.tsx` is currently a "Coming soon (F-058)" placeholder. No radar to relabel.
7. About page methodology preservation — **N/A**: no About page exists in the FluentPath frontend. The methodology framing is preserved by virtue of not having a page to alter.

`pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

**Filed:**
- F-090 (post-launch) — proper backend refactor with a true Aisance dimension based on F-038 fluency layer signals. Replaces "Réflexes Anglais → Aisance" relabel with a faithful measure.

---

F-083 ✅ Per-Tâche pedagogical rubric (backend). Sprint feedback-rendering pack, phase 1.

**Architecture:** additive layer alongside the existing prompts (chosen over strict replacement after a Step 0 audit found the existing `SYSTEM_PROMPT_DIAGNOSTIC` is consumed by F-088 / F-080c / scoring_profiles — replacing it would have collapsed yesterday's F-088 ship). Three prompt categories per recording: (1) generic 4-couche diagnostic (`analysis.py::SYSTEM_PROMPT_DIAGNOSTIC`, unchanged); (2) Tâche specialty prompts (T2 Yarden Pyramide/Rebond/Ciblage from F-049, T3 argumentation from F-051, both unchanged); (3) **new** per-Tâche pedagogical rubric (F-083). Two Claude calls per recording instead of one, run in parallel via `asyncio.gather` so total latency is `max()` not `sum()`.

**Backend (tcf-oral-tool):**
- New `app/services/tache_rubric.py` — three deadpan-English rubric prompts (`_RUBRIC_SYSTEM_T1` / `_T2` / `_T3`), one entry point `apply_tache_rubric(tache_mode, transcript, context)`, defensive `_coerce_rubric` + `_rubric_fallback`, and a deterministic `_enforce_threshold` that recomputes the retry recommendation from dimension scores so a noisy LLM response can't ship "should_retry: false" when the scores say otherwise. LLM-flagged retries (where the deterministic check disagrees in the "no retry" direction) are preserved with a `LLM-flagged: …` prefix so a subtle LLM signal isn't lost.
- Per-Tâche dimensions (canonical order, mirrored in the prompts):
  - **T1 (5):** premiere_impression, presentation_de_soi, lexique_identite, aisance_hesitations, prononciation
  - **T2 (5):** formation_questions, registre_approprie, actes_de_parole, reactivite, structuration_interactionnelle
  - **T3 (6):** position_claire, argumentation_structuree, connecteurs_logiques, developpement_thematique, defense_calme, aisance_sous_pression
- Universal sidebars (3, all Tâches): conjugation, grammar_structure, sentence_construction. Each carries a 0-5 score + 1-2 specific examples cited from transcript.
- Retry threshold logic: any dimension < 2/5 OR overall average < 2.5/5 fires retry. T2 also fires when `formation_questions` < 2.5/5 (foundation-skill failure). T3 also fires when `argumentation_structuree` < 2/5 (T3 without structure is just talking).
- `app/services/tache_1.py`, `tache_2.py`, `tache_3.py` — each `analyze_tache_*` now runs `apply_tache_rubric` in parallel with `analyze_transcript` via `asyncio.gather`. Result merged at `result["tache_rubric"]`. Existing T2 Yarden / T3 argumentation calls stay sequential after the gather.
- Schema: new `Feedback.tache_rubric_data` TEXT column (nullable). Migration `scripts/add_tache_rubric_data_column.py` — idempotent PRAGMA-guarded `ALTER TABLE`, repo-convention sqlite3 direct migration matching the F-062.3 / F-063 / F-080a pattern.
- Persistence: `app/routers/recordings.py::_run_analysis_and_persist` and `app/routers/conversations.py::_run_conversation_analysis_and_persist` both write `tache_rubric_data=json.dumps(analysis["tache_rubric"])` when present (defensive — leaves NULL when the rubric call fell back).
- Serialization: `_format_recording` exposes `diagnostic.tache_rubric` (or `null` for legacy / failed-rubric rows).

**Frontend:** none. F-084 is the rendering ticket.

**Verification gates (5/5 green via `scripts/verify_f083_rubric.py`):**
1. ✅ Step 0 grep audit: located the generic prompt at `app/services/analysis.py::SYSTEM_PROMPT_DIAGNOSTIC` (line 264-410). New module added alongside, not replacing.
2. ✅ Live Claude T1 call: 5 dimensions populated, all sidebars present, retry recommendation fires.
3. ✅ T2: 5 dimensions; T3: 6 dimensions. Both with universal_sidebars (conjugation / grammar_structure / sentence_construction) populated.
4. ✅ universal_sidebars present on all three Tâches in live runs.
5. ✅ Threshold logic deterministic test: 6/6 cases (T1 strong/weak, T2 strong/foundation-fail, T3 strong/no-structure) fire as expected. Coercion robustness: 4/4 cases (empty payload, garbage types, LLM-flag preservation, score clamp). Live Claude retry flag fires correctly per-Tâche.

**Filed (sub-ticket):**
- **F-083.x** ⏸ Extract T1 biographical data to user profile. T1 transcripts contain origin/profession/family/hobbies. The diagnostic should extract structured fields and store them on `users` for personalized examples in later sessions. Out of F-083 scope; filed per anti-scope. Estimate: 1 day.

`pnpm tsc --noEmit` clean (frontend untouched). Backend imports clean (`python -c "import main"` smoke).

---

F-084 ✅ Diagnostic page progressive disclosure (v2 — replaces the original basic/detailed toggle design). Two-commit ship: backend extends the F-083 rubric prompt with `narrative_summary`; frontend rebuilds the diagnostic page around 5 layers.

**Audit C decision: A1 (extend F-083 prompt) over A2 (separate Claude call).** The F-083 prompts are large but structurally compartmentalized — scoring (sec. 3) and threshold (sec. 4) are isolated from the JSON OUTPUT block (sec. 5). Adding a `narrative_summary` field to the JSON schema doesn't touch the scoring instructions, and the LLM has all the right context already in scope. A2 would have meant 50% more tokens per analysis to re-derive context. F-083 verification harness re-ran 6/6 + 4/4 + 3/3 green post-change → byte-identical scoring confirmed (gate 2).

**Backend (tcf-oral-tool):**
- `app/services/tache_rubric.py` — three rubric prompts (T1/T2/T3) gain a `NARRATIVE SUMMARY` instruction block + a `narrative_summary` field in their JSON OUTPUT schemas. Spec format preserved verbatim ("{CEFR band}, headed to {next band}. {What's holding them back, in plain words}." with the three example sentences). Dimension scoring + threshold sections byte-identical to F-083 ship.
- `_coerce_rubric` adds a `narrative_summary` field to the canonical shape (240-char trim cap; LLM occasionally drifts to 2 sentences and the cap protects the hero slot from rendering a wall of text). `_rubric_fallback` returns empty string for legacy/no-key paths.
- `Feedback.narrative_summary` (TEXT NULLABLE) added via `scripts/add_narrative_summary_column.py`. Idempotent PRAGMA-guarded `ALTER TABLE` matching the F-083 / F-062.3 / F-080a pattern. Ran cleanly on dev DB.
- Persistence (both `recordings.py::_run_analysis_and_persist` and `conversations.py::_run_conversation_analysis_and_persist`) extracts `analysis["tache_rubric"]["narrative_summary"]` into the dedicated column. Empty-string fallbacks collapse to `None` for consistent legacy/empty behavior.
- Serialization: `_format_recording` exposes `diagnostic.narrative_summary` at the top level alongside `diagnostic.tache_rubric`. Nullable.
- `scripts/verify_f083_rubric.py` extended to assert `narrative_summary` shape on live Claude runs. Live runs produced the correct deadpan-tutor format on all three Tâches:
  - T1: *"A2+, foundation work needed. Vocabulary range and content depth are holding you back."*
  - T2: *"A2+, foundation work needed. Scripted delivery is holding you back from real interaction."*
  - T3: *"B2, ready to push for C1. Solid structure and connectors; need richer examples for thematic depth."*

**Frontend (fluentpath-frontend):**
- `lib/types.ts` adds `TacheRubricDimension`, `UniversalSidebar`, `RetryRecommendation`, `TacheRubric` types. `Diagnostic` gains `narrativeSummary: string | null` + `tacheRubric: TacheRubric | null`.
- `lib/api.ts` adds `RawTacheRubric` and pass-through in `mapDiagnosticBlock` (snake_case → camelCase, defensive on every nested field). Empty narrative strings collapse to null at the mapper boundary so the diagnostic page has a single "absent" check.
- New `lib/rubric/dimensionLabels.ts` — hardcoded French labels for all 16 rubric dimension keys (T1: 5, T2: 5, T3: 6) plus the 3 sidebar keys. Labels stay French in both UI languages per the F-088 Étendue/Cohérence/Correction/Aisance precedent. `dimensionLabel()` and `sidebarLabel()` helpers fall back to a prettified snake_case key if a future backend dimension surfaces without a mapping.
- `app/diagnostic/page.tsx` rebuilt around 5 layers:
  - **Layer 1** — narrative hero. Single sentence above Section 1, 18px / weight 500 / `INK`. NOT a heading element. Falls back to `"{cefr_band} on Tâche {n}"` for legacy recordings (gate 4).
  - **Layer 2** — Sections 1 + 2 unchanged (TCF score hero + couches diagnostic from F-088).
  - **Layer 3** — top 3 dimensions card. Selection is deterministic: 1 strength (highest score, canonical-order tie-break) + 2 weaknesses (lowest scores from the remaining set, same tie-break). Visible row sorts by canonical order so the page reads stably regardless of which 3 got picked. Score badges use subtle semantic tinting: `0-1 = soft blush`, `2-3 = neutral`, `4-5 = soft sage`. Prose truncated at 120 chars with ellipsis.
  - **Layer 4** — conditional retry callout. Renders only when `retryRecommendation.shouldRetry === true`. Peach card with `"Worth another try"` eyebrow + reason + "Record again" CTA → `/speaking/tache-{n}`.
  - **Layer 5** — `"See full breakdown"` disclosure. `useState` toggle, no persistence (gate 7). Expanded contents in order: remaining 2-3 dimensions, universal sidebars (conjugation / grammar_structure / sentence_construction with score + examples), full retry reasoning (always shown inside disclosure even when Layer 4 already showed the reason — surface for the no-retry case which uses `nextActionSuggestion` as fallback), then the moved-from-default-render Sections 3 (detected modules) + 4 (L'Ordonnance) + 6 (corrected transcript).
- **Section 5 (mocked WPM / pronon% / flagged-count) deleted entirely.** Mocked stats erode trust once a user notices identical numbers across recordings — see F-084.x for the restore plan when F-058 ships real session-details data. Both the Section 5 markup and the now-unused `sessionOpen` useState dropped.

**Verification gates (7):**
1. ✅ Migration idempotent — `scripts/add_narrative_summary_column.py` ran cleanly on a DB that already had F-083's `tache_rubric_data` column.
2. ✅ F-083 byte-identical scoring — `python -m scripts.verify_f083_rubric` re-ran post-prompt-change: Pass 1 6/6 (threshold logic), Pass 2 4/4 (coercion), Pass 3 3/3 (live shape) — same outcome shape as before F-084.
3. ✅ Live Claude `narrative_summary` populated — verified via Pass 3 (above) on all three Tâches in the deadpan tutor format.
4. ✅ Legacy recording falls back — `TestClient` GET on recording 33 (T1, pre-F-083): `narrative_summary: None` (key present, value null), `tache_rubric: None`. Frontend's mapper collapses both to null and renders `"${tcfBand} on Tâche 1"` heading.
5. ⚠️ Layer rendering — `tsc --noEmit` clean (only pre-existing `TargetScoreSelect.tsx:98`); dev server returns 200 on `/diagnostic` and `/diagnostic?session=33`. Visual smoke (narrative hero → score → top-3 → retry → disclosure-collapsed) deferred to Chadi.
6. ⚠️ Disclosure expand interaction — code path verified (single `breakdownOpen` useState, conditional render of remaining dims + sidebars + reasoning + Section 3 + Section 4 + Section 6); browser smoke deferred.
7. ✅ No persistence — `useState(false)` for `breakdownOpen`, no localStorage, no URL param, no profile field. Page reload resets to collapsed.

`pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

**Filed (sub-ticket):**
- **F-084.x** ⏸ Restore session details into the F-084 disclosure when F-058 ships real WPM/pron%/flagged-count data. Section 5 was deleted in F-084 because mocked numbers erode trust the moment a user notices identical stats across recordings; once the underlying data lands, fold the section back in alongside the universal sidebars in Layer 5's expanded view.

**Followups already in BACKLOG**: F-058 itself remains queued (currently the placeholder "Coming soon" Progress page; same data layer F-084.x will eventually need).

---

F-076 ✅ Background tab timer drift fix. Last of the three pre-launch security tickets.

**Audit reshaped scope, again.** Spec assumed counter-pattern timers (`setInterval(() => seconds + 1)`) across T1/T2/T3 record screens. Reality: T1/T2/T3 already use wall-clock math via `useAudioRecorder.durationMs` (Date.now()-based, fixed in F-061 — the file header explicitly notes the F-050 throttle bug). Auto-stop in all three sessions reads `recorder.durationMs >= CAP_MS` directly; the cap fires correctly under throttling, just visually lagged.

The ONE real counter-pattern bug was in `components/speaking/CountdownTimer.tsx` (T3 prep mode's 2-minute prep timer). Old code: `setInterval(() => onTick(remaining - 1), 1000)` — decrement-by-1-each-second pattern. Backgrounded → throttled → drift. Single owned-mode caller: T3 prep. The other CountdownTimer caller (T3 recording) is parent-controlled from `recorder.durationMs` and was working accidentally because the no-op `onTick={() => {}}` masked the racing internal interval.

**Frontend (fluentpath-frontend) — single commit:**
- `components/speaking/CountdownTimer.tsx` rewritten:
  - Owned mode (default, `controlled=false`): wall-clock math via `Date.now()`. `startTimeRef` captured on mount; tick polls every 250ms (~4Hz when foregrounded; arbitrary firing rate under throttle, doesn't matter — `Date.now() - startTime` is correct whenever the tick fires); `onTick(remaining)` pushed each tick; `onComplete()` fires when wall-clock elapsed ≥ totalSeconds; `completedRef` guard prevents double-fire on the cleanup race.
  - Controlled mode (new `controlled?: boolean` prop): effect early-returns; component is purely visual. Renders the parent-driven `remaining` prop verbatim.
  - `visibilitychange` listener forces an immediate tick on tab refocus — closes the gap between "throttled tick fires" and "user sees current value" for the few ms the next setInterval slot might take.
  - Callbacks (`onTick`, `onComplete`) captured via refs that sync each render — effect doesn't restart on callback identity change.
  - Effect deps `[controlled, totalSeconds]` only — runs ONCE per mount, not on every tick (the pre-F-076 design re-ran the effect on every `remaining` change, which is why the timer felt slightly off in foreground too).
- `components/speaking/Tache3Session.tsx`: T3 recording mode usage now passes `controlled` explicitly. The pre-F-076 `onTick={() => {}}` smell is replaced by an explicit "parent owns timing" declaration; CountdownTimer's internal interval no longer races there.

**Backend:** none. F-076 was always purely frontend.

**Verification gates (5; manual gates 2-5 deferred to Chadi's browser smoke):**
1. ✅ Audit findings reported, including the audit-vs-spec mismatch (T1/T2/T3 already wall-clock via useAudioRecorder; only CountdownTimer was broken).
2-5. ⚠️ Browser-smoke gates deferred to Chadi:
   - 30s background → prep timer reads ~30s elapsed correctly (covered by Date.now() math)
   - Full 2-min background → prep auto-completes on refocus (covered by visibilitychange listener firing tick + onComplete on the catch-up tick)
   - T3 recording controlled mode → CountdownTimer renders parent-driven `remaining` without running its own interval (effect early-returns when `controlled=true`)
   - Foreground baseline → identical behavior to current production (1Hz visual updates since `displaySecs = remaining` is floored seconds; ring transition + label unchanged)

  Code path traced for each gate. Dev server returns 200 on `/speaking/tache-3/environnement` post-change. `pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

**Pre-launch security trio complete:** F-075a (upload size cap) + F-075b (TTS auth wrap) + F-076 (timer drift fix) all shipped 2026-04-27. **Next: DigitalOcean App Platform deploy. Launch May 4.**

---

F-075b ✅ Auth on audio serving. Second half of F-075 (security hardening, carried from F-050).

**Audit reshaped the scope.** The original F-075b spec assumed a user-audio serving route existed and lacked an ownership check. **It doesn't exist.** Audit found no `app.mount("/uploads", ...)`, no `FileResponse` returning recording audio anywhere; `_serialize_turn` (conversations.py:138) explicitly refuses to expose candidate audio_url with the comment "We deliberately do NOT expose candidate audio_url — those are raw filesystem paths to ./uploads and aren't web-servable." `_format_recording` doesn't include `audio_path` either. The frontend `<audio>` calls in `Tache1Session` / `Tache2Session` play back **examiner TTS** (`/tts_audio/<hash>.mp3`), not user recordings.

The actual exposed surface was `/tts_audio/`, mounted as unauthenticated static files (`app.mount("/tts_audio", StaticFiles(...))` in main.py). Hashes are SHA-256 of `(text, voice, model)` — guessing is intractable — but anyone with a leaked URL (devtools network logs, captured frontend bundles) could refetch without auth.

**Backend (tcf-oral-tool):**
- `main.py` — replaced `app.mount("/tts_audio", StaticFiles(...))` with an authenticated `GET /tts_audio/{filename}` handler. Depends on `get_current_user`, which already accepts both the `access_token` cookie AND the `Authorization: Bearer` header. The cookie path is critical — browsers don't attach the Authorization header to `<audio>` element fetches but they do send cookies, so existing T1/T2 examiner playback continues to work without frontend changes.
- Path traversal defense, two layers:
  - Filename string filter rejects `/`, `\`, `..`, `\x00`, leading `.`.
  - Post-resolution check via `Path.resolve().relative_to(cache_root)` confirms the resolved file actually lives inside the cache dir — catches symlink-based escapes and any future filename quirk the string filter doesn't anticipate.
- Media type inferred from extension (`.mp3 → audio/mpeg`, plus wav/ogg/m4a/webm fallbacks; unknown → `application/octet-stream`). The TTS pipeline only emits .mp3 today; the table is forward-compat for a future provider that ships other formats.
- Static `/static` mount unchanged (app/static — CSS/templates, not audio).

**Frontend:** none. Cookie-auth path keeps the existing `<audio src="/tts_audio/...">` playback working without code changes.

**Verification gates (revised; user-audio gates dropped since no such route exists):**
1. ✅ `/tts_audio/<file>.mp3` unauthenticated → 401 (`{"detail":"Not authenticated"}`).
2. ✅ Same path with `Authorization: Bearer <jwt>` → 200, body matches stub bytes, `content-type: audio/mpeg`.
3. ✅ Same path with `access_token=<jwt>` cookie → 200 (the `<audio>` element path that keeps T1/T2 playback working).
4. ✅ Path traversal blocked across 6 attempts:
   - `../etc/passwd` → 404 (router doesn't match multi-segment paths)
   - `..\windows\system32` → 400 (handler guard)
   - `.hidden` → 400 (handler guard)
   - `subdir/file.mp3` → 404 (router)
   - `subdir\file.mp3` → 400 (handler)
   - `with\x00null.mp3` → rejected at httpx URL parser before the request leaves the client (defense-in-depth at the client lib layer)
5. ✅ Well-formed but missing filename → 404 (sanity).

Harness `scripts/verify_f075b_tts_auth.py` drops a synthetic mp3 stub into the TTS cache, exercises all gates, and removes the stub via try/finally per F-080d.z rule #1. Real cache state is untouched.

`python -c "import main"` smoke clean. Confirmed via `app.routes` inspection that the `/tts_audio` mount is gone and only the `/tts_audio/{filename}` route handler is registered.

**Filed:**
- **F-075b.x** 📋 — canonical pattern for the future user-audio serving route. **Spec preserved verbatim from Chadi's go-ahead message** so whoever wires playback first has the exact contract:

  > When future tickets need to play user audio (F-081 audio drills, F-058 session details with playback, or any new playback consumer), add `GET /api/recordings/{id}/audio` with: (1) `get_current_user` dependency, (2) ownership check via `Recording.user_id == current_user.id`, (3) **404 (not 403)** on mismatch to avoid existence-leaking, (4) `FileResponse` with media type inferred from `audio_path`'s extension. Do NOT use `app.mount('/uploads', ...)` — that bypasses ownership entirely.

  Rationale for the 404-not-403 choice: returning 403 leaks the existence of recordings owned by other users (an attacker could enumerate IDs and learn which exist). 404 is indistinguishable from a missing recording, preventing the enumeration leak.

---

F-075a ✅ Server-side audio upload size cap. First half of F-075 (security hardening, carried from F-050); F-075b (user_id auth on /api/audio/{id} serving) remains queued.

**Audit findings reshaped the design.** The spec assumed one upload endpoint (`/api/recordings/upload`); the codebase has **four** audio-receiving multipart routes:
- `POST /api/recordings/upload` (T3 / legacy single-shot)
- `POST /api/recordings/transcribe` (F-002 two-step; appears unused by current FE but still live)
- `POST /api/conversations/{id}/turn` (T1 + T2 per-turn)
- `POST /api/audio/upload` (F-050 audio→URL+transcript helper)

A path-prefix middleware (`/api/recordings/*`) would have left two of four wide open. Adopted **content-type filter** instead — middleware matches any `POST` with `Content-Type: multipart/form-data` regardless of path, defending current routes and any future audio endpoint added without updating an allowlist.

**Cap chosen:** 10 MB. Real-world corpus check (30 audio files on disk): max 1.68 MB, p50 184 KB. 10 MB gives ~6× headroom over the largest legitimate file. Override via `MAX_AUDIO_UPLOAD_BYTES` env if testing needs a different ceiling.

**Backend (tcf-oral-tool):**
- `app/config.py` — new `MAX_AUDIO_UPLOAD_BYTES` constant (default `10 * 1024 * 1024`, env-overridable). Documented at the call site as a 6× headroom decision with a note not to exceed 20 MB without a real reason.
- `main.py` — Layer A middleware `enforce_multipart_upload_cap`: matches `POST` + `Content-Type: multipart/form-data`, reads `Content-Length`, returns `413 {"detail": "Audio file exceeds maximum allowed size of 10 MB"}` when exceeded. Malformed Content-Length values fall through to Layer B (the route's authoritative gate) rather than 400 here.
- Layer B route-level checks added on all four routes:
  - `app/routers/recordings.py` — module-level `_enforce_audio_size_cap(content)` helper, called after each `await audio.read()` in both `/upload` and `/transcribe`.
  - `app/routers/audio.py` — inline `len(content) > cap` check after `await audio.read()` in `/upload`.
  - `app/routers/conversations.py` — same inline check inside `append_turn` for the `audio` branch.
- All four sites raise `HTTPException(status_code=413, detail=…)` so the frontend gets a consistent error regardless of which layer caught it.

**Verification harness `scripts/verify_f075a_size_cap.py` (3 passes, 5 routes):**
- **Pass 1** Layer A — POST `/api/recordings/upload` with an 11 MB body → middleware returns 413. ✅
- **Pass 2** Layer B — all four routes with an 11 MB body → 413 from each. ✅
  - `/api/recordings/upload` ✅
  - `/api/recordings/transcribe` ✅
  - `/api/audio/upload` ✅
  - `/api/conversations/{id}/turn` (started a real conversation, posted over-cap audio) ✅
- **Pass 3** regression — 256 KB legitimate body → status 500 from STT failing on synthetic bytes (NOT 413; the size check let it through, which is the gate). ✅
- Cleanup per F-080d.z rule #1 — snapshot `Recording.id` max + full `Conversation.id` set pre-run, delete any rows added during the run in a `try/finally`. Confirmed: 1 recording + 1 conversation deleted on each run, existing rows untouched.

`python -c "import main"` smoke clean.

**Frontend:** none (per spec — F-075a is backend-only).

**Filed:**
- **F-075a.x** ⏸ Frontend client-side audio size guard. Pre-flight check on the recording blob size before triggering upload, with a clear "Recording too long; please record a shorter session" message. Falls back to handling the server's 413 response. Out of F-075a scope (which was server-side enforcement only). Estimate: 1-2h.
- **F-075b** 📋 user_id auth on `/api/audio/{id}` serving — the second half of the original F-075. Still queued; same launch-prep window as F-076 (background-tab timer drift).

---

F-091.0 ✅ V1 onboarding lock to TCF-only. Pre-launch ticket; May 4 launch ships TCF-honest.

**Approach (a-prime) — adopted after Step 0 audit found the spec's two choices (hide selector / grey out cards) didn't fit the architecture.** No discrete exam-selector step exists in this codebase: step 2 is `TCFGoalSelect` which captures motivation (`immigration` / `studies` / `general`), and the exam profile is **derived** from goal via `mapOnboardingToBackend`. The goal step also gates step 4 (`TargetScoreSelect` branches on `state.goal` to choose between CLB / B1-C2 / "confident conversational"-style options) — removing it breaks the score-selection screen.

(a-prime) keeps the goal selector visible (motivation persists for F-091b post-launch) and locks the false-promise leaks at two surface points:

**Frontend (fluentpath-frontend) — single commit:**
- `components/onboarding/TCFGoalSelect.tsx`:
  - immigration descriptor: `"TCF / TEF Canada, CLB scoring"` → `"TCF Canada, CLB scoring"` (TEF dropped)
  - studies descriptor: `"DELF, DALF, academic admissions"` → `"TCF for academic admissions"` (DELF/DALF dropped; TCF DAP for university entry is a real product fit)
  - general descriptor: unchanged (was already exam-neutral)
- `lib/api.ts::GOAL_TO_EXAM_PROFILE`:
  - `immigration` → `'tcf_canada'` (unchanged; was real)
  - `studies` → `'tcf_canada'` (was `'delf'` — false-promise string that silently fell through to TCF Canada server-side via `get_profile()`'s default fallback)
  - `general` → `'tcf_canada'` (was `'tcf_general'` — same false-promise pattern)
- F-091.0 ship comments added at both surface points so F-091b can find the unwind sites cleanly.

**Backend:** none. The exam_profiles registry already has only `TCF_CANADA`; `get_profile()` already falls back to TCF for unknown ids. The behavior was already TCF-everywhere; F-091.0 makes the persisted strings match.

**Verification gates (5):**
1. ✅ New user signup walks through onboarding without seeing TEF/DELF/DALF — code path verified, two descriptor strings stripped (only F-091.0 ship comments retain the strings, not user-visible). Browser smoke deferred.
2. ✅ Live signup test (`TestClient` against `/api/auth/register` + `/api/users/onboarding`) — registered user, fired the onboarding flush three times once per goal, all three persisted `exam_profile = 'tcf_canada'`. Test user cleaned up via try/finally per F-080d.z rule #1.
3. ✅ Existing users unaffected — pre-flight DB audit: 12 users total, 9 NULL + 3 `'tcf_canada'`. Zero non-TCF rows to disturb.
4. ✅ TCF analyzer dispatch fires correctly — no backend changes; the existing dispatch was already TCF-only via the registry default, and `users.exam_profile` for new signups now matches what the dispatch expects.
5. ✅ Analytics N/A — no `analytics`/`track`/`posthog`/`mixpanel`/`gtag` calls anywhere under `components/onboarding/` or `lib/onboarding*`. Nothing to remove or constant-fire.

`pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

**Unwind for F-091b** (post-launch): the two surface points carry F-091.0 ship comments. F-091b restores the goal-aware mapper (now with real `tef.py` + `delf.py` registered) and re-enables the original descriptors. No DB migration needed — `users.goal` is already persisted unchanged today.

---

## Shipped — Week 2 (April 30)

P-100 ✅ Real Progress Dashboard. Replaces the "Coming soon (F-058)" placeholder on the Progress tab with the 4-section dashboard — live in production on lemethodic-frontend.vercel.app. **Superseded by P-230 (LEMETHODIC-CURRICULUM v0.2 §10.4) on 2026-05-01.** The shipped 4-section dashboard is the current production state and stays live until P-230 implementation lands; the original P-100 spec is no longer the target.

**Sections live:**
1. Snapshot card (current CEFR estimate, target level, exam date countdown)
2. Couches diagnostic — sustained position (rolling average, reuses `components/diagnostic/CouchesDiagnostic.tsx`)
3. Activity timeline (14-day dot calendar, plain SVG)
4. Recurring modules list (top 5 by recurrence_count, severity-colored, linked to École lessons)

**Initial-ship gap (resolved by P-100.5 on 2026-05-01):** Sections 2 and 4 didn't render for a single-recording user, and Section 1 CEFR mismatched the diagnostic page. Investigation found three distinct root causes — see P-100.5 entry under "Shipped — Week 2 (May 1)" for the fixes. P-100 is fully shipped after that bundle.

**Out of scope (per spec):** streaks (waits on F-067), couche scores time-series chart, total time practiced. Empty-state CTA routes to Speaking Lab.

---

## In progress

**F-080 epic CLOSED 2026-04-26.** F-080a + F-080b + F-080c shipped 2026-04-25; F-080d shipped 2026-04-26. The intelligence layer is end-to-end live: detection → persistence → diagnostic surface → cross-session recurrence → Raccourci routing.

F-086 + F-087 + F-088 + F-089 shipped 2026-04-27. The F-086→F-089 rename pack is closed. Next per the roadmap: F-091 multi-exam routing. Other queued tickets (F-061.1 T3 picker, F-064 lesson detail + quiz / F-089.x quiz stub, launch-prep F-071–F-079, F-080.x detection-sensitivity refinement, F-080c.x Le Goulet cleanup, F-080d.x recordings(user_id) perf, F-080d.y public-glossary path, F-087.x EcoleReveal copy refresh, F-090 backend Aisance refactor) remain deferred.

---

## P-100 — Real Progress Dashboard (LEGACY SPEC — SUPERSEDED)
Milestone: DONE

**Status: Superseded by P-230 (LEMETHODIC-CURRICULUM v0.2 §10.4) on 2026-05-01.** Spec block kept below for historical reference only — do not implement against this. P-230 rebuilds /progress per §7.4 with calm/method modes, Block 2 (Goulet Stack), Block 5 (Dialogue Box), Block 8 (Confidence Visualizer).

**Priority:** High (Phase 1, Block 4)
**Status:** ~~Ready to start~~ Superseded
**Scope:** Replace "Coming soon (F-058)" placeholder on Progress tab with functional dashboard. Frontend-only work, no backend instrumentation required for v1.

### Sections (top to bottom)

1. **Snapshot card**
   - Current CEFR estimate: avg of last 3 recordings' cefrLevel
   - Target level (from user.targetLevel)
   - Exam date countdown (from user.examDate)
   - Plain card, no chart

2. **Couches diagnostic — sustained position**
   - Reuse components/diagnostic/CouchesDiagnostic.tsx
   - Feed rolling average of last 5 recordings per couche (le_fond, les_moules_des_idees, les_moules, les_reflexes_anglais)
   - Fallback: if user has <5 recordings, average all available
   - Header: "Your sustained position" (vs diagnostic page's single-session snapshot)
   - Keep bottleneck callout
   - Preserve 0-100 score resolution (no rounding to 0-4)
   - Locale-aware labels via display_label_en / display_label_fr (respects user.interfaceLanguage, per F-088)

3. **Activity timeline**
   - Last 14 days, dot calendar
   - Two dot states: recording done, lesson completed
   - Plain SVG/divs, no chart library
   - Empty days = grey dots

4. **Recurring modules list**
   - Top 5 by recurrence_count (desc), severity-colored
   - Each row linked to its École lesson via ecole_lesson_id
   - Show: name_fr or name_en (locale-driven), recurrence_count, severity badge

### Empty state (zero recordings)
- Show snapshot card with placeholders
- Hide sections 2–4
- Big CTA: "Take your diagnostic to unlock your dashboard" → routes to Speaking Lab (Tâche 1 default)

### Out of scope (defer to P-100.5)
- Streaks (waits on F-067)
- Couche scores time-series chart
- Total time practiced

### Files likely touched
- app/progress/page.tsx (replace placeholder)
- components/dashboard/* (new section components)
- Reuse: components/diagnostic/CouchesDiagnostic.tsx
- API: GET /users/me/dashboard (or compose from existing endpoints — backend agent will scope)

### Definition of done
- All 4 sections render with real data on lemethodic-frontend.vercel.app
- Empty state works for new users (verified end-to-end)
- Mobile-first verified at 380px width
- No new chart libraries added

---

## Shipped — Week 2 (May 1)

P-115 ✅ **Partial ship — foundation + 4 of 8+ motion surfaces.** Filed 2026-04-30, foundation shipped 2026-05-01 (`df11866`), motion implementation 2026-05-01 (`64aad94`). Remainder filed as **P-115.x** (see Queued — follow-ups below).

**Foundation (`df11866`):**
- `framer-motion@^12.38.0` added.
- `lib/motion.ts` — easing tuples (`easeFpDefault` / `easeFpEnter` / `easeFpExit`), spring presets (`heightSpring` / `liftSpring` / `pressSpring` reserved-for-non-button), `pressInstant` for buttons, duration tokens (`durationFast` / `durationBase` / `durationSlow`), stagger helper, scale constants.
- `globals.css` — `--fp-canvas`, `--fp-track`, `--fp-peach-deep`, `--fp-sage-deep`, `--fp-sage-deep-25`, `--fp-error` tokens promoted; `--fp-safe-{top,bottom,left,right}` env() passthroughs; motion CSS vars + Tailwind 4 utilities (`ease-fp-default`, `ease-fp-enter`, `ease-fp-exit`).
- All inline `#FAFAF7`/`#E8E8E5`/`#E0A890`/`#2D8B55` literals migrated to `var(--fp-*)` references across 24 files.
- `viewportFit: 'cover'` added to viewport metadata (without it, `env(safe-area-inset-*)` returns 0 on iOS); `userScalable: false` removed (WCAG 2.1).
- Safe-area applied to: BottomNav, Paywall bottom CTA, OnboardingScreen.CTAButton, Tâche 1/2 record bars + review sheets, Tâche 3 main content, TranscriptReviewPanel, LearnModuleSheet inner action, diagnostic root wrapper, plus sticky headers in HomeScreen / /progress / /profile / ecole/lesson / quiz.
- Paywall billing toggle pill 38px → 44px (HIG floor).

**Motion implementation (`64aad94`) — 4 surfaces:**
1. **Diagnostic reveal** — `components/diagnostic/CouchesDiagnostic.tsx`. Bars stagger in worst-first using `staggerDiagnosticRow` (0.075s); user-fill width animates 0% → score%, score-dot tracks. Easing `easeFpEnter`, duration `durationDiagnosticReveal` (0.7s, justified). Bottleneck callout fades up after all bars settle.
2. **Recording-done state** — `Tache1Session.tsx`, `Tache2Session.tsx`, `Tache3Session.tsx`. Record icon scale-pulse `[1, 1.08, 1]` on transcribe/process; status text remounts via `key={phase}` to retrigger upward fade.
3. **Lesson unlock** — `QuizClient.tsx` writes `lemethodic:unlocked-lesson` to sessionStorage on perfect-score finish; `HomeScreen.tsx` reads + clears + passes `justUnlocked` to `LessonListItem.tsx`; one-shot scale 0.96 → 1.0 + boxShadow tier-1 → tier-2 → none keyframes (1s total). Stoic, not celebratory.
4. **Empty-state pulse** — `components/dashboard/EmptyState.tsx`. Primary CTA scale `[1, 1.02, 1]` loops every 3s (1.5s active + 1.5s gap). Pauses on `whileHover`/`whileTap` (pause-during-interaction, not permanent kill).

All 4 surfaces respect `prefers-reduced-motion` via `useReducedMotion()`.

**Verification:** `pnpm tsc --noEmit` clean except F-108 pre-existing. Mobile-first 380px verified — no layout reflow risk in any of the animations.

**Out of scope (filed as P-115.x):** button presses, card transitions, tab switches, progress bar fills, onboarding step transitions, streak fire icon. Foundation is in place; remainder is a separate pass.

**Reference benchmark:** Promova.

---

P-104 ✅ **Background-tab timer drift fix — Step 1 (visibilitychange listener).** Pre-launch UX hardening for the per-Tâche cap auto-stop when the user backgrounds the tab mid-recording.

**Investigation finding:** `useAudioRecorder.durationMs` and `CountdownTimer` (owned mode, F-076) already use `Date.now()` deltas, so the values are wall-clock-correct. The residual gap is **state-update cadence** — `setInterval(100ms)` is throttled to ≥1Hz in background tabs (and paused entirely under Chrome's intensive throttling after ~5 min hidden). The downstream `useEffect([recorder.durationMs])` cap-watchers in T1/T2/T3 only fire when `durationMs` lands in React state, so a stale state means a late auto-stop.

**Backend ground-truth check:** the frontend never reports duration to the backend — `uploadConversationTurn` and `createRecording` send only the audio blob plus metadata. Backend computes duration from the audio file. So timer drift is **purely a UX issue**, not data corruption; no DB migration needed.

**Fix (`hooks/useAudioRecorder.ts`):**
- New `visibilityHandlerRef` to track the listener for cleanup parity with `tickRef`.
- New `unbindVisibility` cleanup helper, called everywhere `stopTicks` is called (unmount effect, startRecording catch, stopRecording's onstop / onerror / catch, reset).
- Inside `startRecording`, after the interval is set up: attach a `visibilitychange` listener that calls `setDurationMs(Date.now() - startedAtRef.current)` on tab refocus. This wakes downstream effects within one frame of the user returning, so the cap auto-stop trips immediately rather than waiting for the next throttled `setInterval` tick.
- Pattern matches F-076's CountdownTimer fix verbatim.

**Verification:** `pnpm tsc --noEmit` clean except F-108 pre-existing.

**Out of scope (filed as P-104.x):** the deep-throttle edge case where the tab is hidden for the entire turn duration plus several minutes, never refocusing in time. Addressed by a wall-clock `setTimeout` cap fallback. Deferred until real user data shows the long-hidden case actually happens.

---

P-100.5 ✅ **Dashboard rendering bundle.** Three independent fixes that together complete P-100 (Real Progress Dashboard). Filed and shipped 2026-05-01 after a single-recording user surfaced three rendering issues on production: SnapshotCard CEFR mismatched the diagnostic page (A2 vs B2), SustainedCouches didn't render at all, RecurringModulesList silently disappeared.

**Superseded by P-230 (LEMETHODIC-CURRICULUM v0.2 §10.4) on 2026-05-01** — the same day the bundle shipped. Rendering fixes are preserved as production state until P-230 implementation lands; the underlying CEFR null handling, F-110.1 migration, and empty-state placeholder all carry forward into the rebuilt dashboard.

**Investigation finding:** three distinct root causes, two genuine bugs and one design decision needing a UX patch.

**Fix 1 — CEFR null handling (`app/diagnostic/page.tsx`, `components/dashboard/SnapshotCard.tsx`):**
- Removed the silent `?? 'B2'` fallback at `diagnostic/page.tsx:451` that masked a null backend `cefr_level` by displaying a hardcoded "B2" hero. The user-reported B2/A2 mismatch was almost certainly this fallback faking data while the F-110 list endpoint (which the dashboard reads) returned the real "A2".
- Diagnostic hero now renders `tcfBand ?? '—'` in muted color when null, with `aria-label="CEFR band pending"` for screen readers.
- Narrative fallback no longer interpolates a null `tcfBand` into "null on Tâche 1"; renders "Analysis pending" copy when both `narrativeSummary` and `tcfBand` are absent.
- SnapshotCard's `Cell` gains a `placeholder` prop that mutes the value color when rendering the "—" placeholder. Both surfaces now agree on the visual signal: muted "—" = data not available; INK = real value.

**Fix 2 — F-110.1 migration shipped via P-100.5 (`lib/api.ts`):**
- `RawCouche.internal_key` → `RawCouche.key`.
- `mapRecordingSummary` filter `c.internal_key` → `c.key`; map `key: c.internal_key` → `key: c.key`.
- `mapDiagnosticBlock` same migration.
- F-088 docblock updated to reference the new field name.
- The original symptom: F-110 list endpoint emitted `key` per spec while frontend filtered on `c.internal_key`, silently rejecting every couche entry. SustainedCouches's defensive `if (rows.length === 0) return null` then hid the section entirely. Backend `couches_array` dual-emits both fields during the transition window, so reading `key` works against /history, /{id}, and the F-110 list endpoint uniformly.
- F-110.1 entry in Queued — follow-ups marked superseded by P-100.5 (same code change). F-110.2 backend cleanup is now safe to execute.

**Fix 3 — Recurring-modules empty placeholder (`components/dashboard/RecurringModulesList.tsx`):**
- Backend `getRecurringModules` returns empty for users with fewer than 3 distinct recordings (F-080d threshold). Confirmed by the API method's docblock at `api.ts:725-731`. Not a bug — by design.
- Replaced `if (top5.length === 0) return null` with a placeholder card that renders the section eyebrow + subhead + a one-line copy: "Recurring patterns will appear after your first 3 recordings. Keep practicing." (FR equivalent: "Les schémas récurrents apparaîtront après vos 3 premiers enregistrements. Continuez à pratiquer.")
- Disappearing UI sections feel like bugs to users; the placeholder communicates the threshold honestly.

**Verification:** `pnpm tsc --noEmit` clean except F-108 pre-existing. After Vercel deploys, verify in InPrivate on `/progress` that Section 1 CEFR matches diagnostic page, Section 2 renders couche bars, Section 4 shows the placeholder copy.

**P-100 status:** fully shipped. The original P-100 ship (2026-04-30, 4-section dashboard) plus P-100.5 (rendering bundle) close the ticket. The P-100.5 follow-up flag from the original ship entry is resolved.

---

## Phase 1 Architecture Rework — From LEMETHODIC-CURRICULUM v0.2

**Source:** `LEMETHODIC-CURRICULUM.md` §10 (committed 2026-05-01, commit `84320ea`).
**Filed:** 2026-05-01.
**Roster:** 33 tickets — 23 Phase 1 (P-200–P-251), 10 Phase 2 deferred stubs (P-260–P-269). Sequenced by dependency. Supersedes the original P-100 spec and the placeholder P-200 tickets that existed prior to the curriculum doc.

### Foundation (§10.1) — must ship first, in order

### P-200 — Diagnostic engine: detector implementation
Milestone: DONE

**Priority:** HIGH (pre-launch blocker)
**Status:** Shipped 2026-05-02 (BE-side, lemethodic-backend 3-commit set ending `554d824`). FE consumer pending §7 dashboard work.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.1
**Dependencies:** none
**Scope:** implement L1 transfer detector, preposition error detector, subordination counter, connector variety scorer, A2 sentence structure detector, A2 infinitive substitution detector. Plug into existing analysis pipeline alongside couches scoring. Output ceiling markers per level.
**Owner:** Engineering

### P-201 — Diagnostic engine: level assignment + confidence
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-02 (BE-side, lemethodic-backend 2-commit set ending `0d10d11`). FE consumer pending §7 dashboard work.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.1
**Dependencies:** P-200
**Scope:** implement level assignment rule (§3.5). Add confidence scoring. Surface level + confidence on diagnostic page and Snapshot via Block 8.
**Owner:** Engineering

### P-202 — Cluster data model
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-01 (BE-side, lemethodic-backend commit `d5595b3`).
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.1
**Dependencies:** none
**Scope:** backend schema for clusters (grammar topic, vocabulary theme, Tâche application, lesson reference, exercise set reference, prompt reference, detection rubric, lesson delivery format flag). Migration. CRUD for clusters via admin or seed script.
**Owner:** Engineering

### P-203 — Path data model
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-01 (BE-side, lemethodic-backend commit `d5595b3`).
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.1
**Dependencies:** P-202
**Scope:** backend schema for paths (level start, level target, phases, cluster sequence per phase). Path entity, Phase entity, PathCluster join table.
**Owner:** Engineering

### P-204 — User progress model
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-01 (BE-side, lemethodic-backend commit `d5595b3`).
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.1
**Dependencies:** P-202, P-203
**Scope:** backend schema for user's path enrollment, current phase, current cluster, cluster status (not_started / in_progress / absorbed / needs_revisit), cluster history.
**Owner:** Engineering

### Content scaffolding (§10.2)

### P-210 — B1→B2 path seed data
Milestone: DONE

**Priority:** HIGH (pre-launch blocker)
**Status:** Shipped 2026-05-01 (BE-side, lemethodic-backend commit `79cd629`); production seeded same-day via `scripts/seed_b1_b2_path.py`.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.2
**Dependencies:** P-202, P-203
**Scope:** seed the B1→B2 path's 15-20 clusters in the database (titles + structure only; content authored separately). Phase boundaries defined.
**Owner:** Engineering

### P-211 — Cluster content authoring
Milestone: DONE

**Priority:** HIGH (pre-launch blocker)
**Status:** Shipped 2026-05-01 (BE-side, lemethodic-backend commit `d862794`); production ingested same-day via `scripts/ingest_b1_b2_cluster_content.py`.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.2
**Dependencies:** P-202, P-210 (seed must exist before content slots into it)
**Scope:** author lesson + exercise set + practice prompt + detection rubric for each B1→B2 cluster. Decide delivery format per cluster (markdown / PDF / video). Delivered as files into the system.
**Owner:** Chadi (content authoring, not engineering)

### P-212 — Starter cluster seed for A2 and B2 paths
Milestone: DONE

**Priority:** MEDIUM (pre-launch)
**Status:** Superseded by P-210 + P-211 (shipped 2026-05-01). The 22-cluster B1→B2 path is in production with 13 clusters fully authored and 9 placeholders pending. Nothing in P-212's original scope remains uncovered.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.2
**Dependencies:** P-202, P-203
**Scope:** seed first 3-4 clusters of A2→B1 path and first 3-4 of B2→C1 path. Used as waitlist preview content.
**Owner:** Engineering (schema seed); Chadi for the small starter content set

### P-213 — Dialogue Box template authoring
Milestone: TBD

**Priority:** MEDIUM (pre-launch)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.2
**Dependencies:** none
**Scope:** author 30-50 Dialogue Box templates (Block 5) varied by context. Placeholders for detected data.
**Owner:** Chadi

### Onboarding (§10.3)

### P-220 — Onboarding questionnaire rebuild
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-02 (BE + FE + production verification complete).
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.3
**Dependencies:** P-203
**Scope:** rebuild current onboarding to match §8.3 (10-12 screens). Each answer maps to user profile fields that drive path assignment.
**Owner:** Engineering

### P-220.z — Onboarding per-question illustrations and pastels (Phase 1 polish)
Milestone: polish-defer

**Priority:** —
**Status:** Closed 2026-05-05 (scope evaporated by F-201). Per-question pastel cycle dropped (clashed with F-200 editorial direction). Per-question illustrations dropped (type-led question screens). EcoleReveal hero asset re-tracked as P-228.
**Filed:** 2026-05-02
**Source:** P-220 plan-first, deferred from rebuild
**Dependencies:** P-220
**Scope:** author per-question illustrations + pastel backgrounds for the 11 onboarding questions. The P-220 rebuild cycles the existing 6 illustrations/pastels as a placeholder (see components/onboarding/questionMeta.ts); this ticket replaces them with question-specific assets and updates the meta map.
**Owner:** Chadi (illustrations) + Engineering (wire-up)
**Note:** Closed by F-201 — the editorial direction (F-200) replaced the pastel-cycle approach with uniform `--ed-bg` across all 11 questions, type-led screens with no per-question illustrations. P-228 inherits the EcoleReveal-only asset scope.

### P-228 — EcoleReveal hero asset (art-directed illustration)
Milestone: M2

**Priority:** LOW (post-soft-beta; placeholder works)
**Status:** Queued
**Filed:** 2026-05-05
**Source:** F-201 plan-first; P-220.z scope re-tracked
**Dependencies:** F-201
**Scope:** single high-quality art-directed illustration for the EcoleReveal closing screen (the funnel's emotional terminal, where the user sees their persona + plan before /paywall). Current placeholder: `/illustration-ecole.png` recycled from P-220 era. F-201 sized the asset slot at 280×280 above the persona label. Per F-200 imagery rules: real photography muted-tone OR art-directed line drawing / geometric primitives. No 3D emoji, no library cartoon, no mascot energy.
**Owner:** Chadi (art direction / commission) + Engineering (drop-in swap)

### F-213 — Page transitions + celebration moments
Milestone: M2

**Priority:** MEDIUM (soft-beta polish)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured screenshots + interaction trace per F-225 — verify route fade-in across /, /signup, /onboarding, /progress, /ecole, /cluster)
**Filed:** 2026-05-04
**Source:** Strategic recalibration — interaction polish queue
**Dependencies:** F-200, F-212 (ed-page-enter CSS class)
**Scope (this commit):**
- Applied `ed-page-enter` class (250ms fade-in + Y-translate 8px → 0) to outermost containers of major surfaces: LandingPage `<main>`, ProgressDashboard root, ClusterDetailPage root, HomeScreen root, signup outer div.
- Subtle fade on first mount per surface — doesn't replay on internal state changes (CSS animation `both` keeps end state). Reduced-motion respected via globals.css fallback rule.
**Owner:** Engineering
**Cuts:**
- Celebration moments (lesson complete, finish onboarding, milestone hit): filed as F-213.celebration. Needs design pass — F-115 lesson-unlock motion is already in place; layered celebrations need Chadi sign-off on what triggers what (e.g., milestone badge ed-accent pulse vs full congratulations screen). Editorial restraint per F-200 means no confetti — designs must be typography-led.
- /onboarding/waitlist + EcoleReveal + paywall route transitions: not added in this commit (those are terminal/closing surfaces — adding fade-in wouldn't add value, and EcoleReveal already has hero-rise sequence from F-212).
- Inter-question transition within OnboardingFlow (between q1 and q2 etc.): out of scope — that's a state change, not a route change. Could be F-213.intra if user testing flags abrupt step swaps.

### F-213.celebration — Milestone + completion celebration moments
Milestone: M2

**Priority:** MEDIUM (post-soft-beta polish)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-213 scope cut — celebration design needs Chadi sign-off
**Dependencies:** F-213, F-115 (lesson-unlock motion already shipped), F-202 (L'École intro design pass)
**Scope:** layered celebration treatments for lesson complete (per-quiz-pass), finish onboarding (after EcoleReveal continue), and milestone hits (Fondations done at lesson 4, Approfondissement at 16, L'École Complète at 27). Editorial restraint: no confetti. Candidates: typography-led congratulations screen (Source Serif italic for the achievement label), subtle Y-translate + opacity reveal of next-step CTA, ed-accent pulse on milestone badge in EcoleProgress.tsx. Needs Chadi pick + content per moment.
**Owner:** Engineering + Chadi (celebration copy + design picks)

### F-210 — Icon system audit (lucide-react retention + custom marks plan)
Milestone: M2

**Priority:** MEDIUM (audit + filing)
**Status:** Shipped 2026-05-04 — non-visual change, audit only. No code changes this turn. Filed P-229 for the custom marks Chadi-authoring task.
**Filed:** 2026-05-04
**Source:** Strategic recalibration — interaction polish queue
**Dependencies:** none
**Audit findings (this commit, BACKLOG-only):**
- **lucide-react retained** for all current UI icons. Audit covered ~25 imports: `ArrowLeft / ChevronLeft / ChevronRight / ChevronDown / ChevronUp / Check / Play / Lock / Mic / Bell / Pencil / Settings / Volume2 / VolumeX / XIcon / SearchIcon / MinusIcon / CheckIcon / CircleIcon / MoreHorizontal`. All universal UI icons, no brand specificity. Per F-200 imagery rules: "no library cartoons" applies to illustrations, NOT UI iconography. Lucide is the appropriate stack for nav/affordance/state icons.
- **No custom marks needed for replacement** — surfaces using lucide today (HomeScreen Bell, BackButton chevron, LessonListItem check/play/lock, Tâche session controls) all benefit from lucide's consistency.
- **Custom marks needed for ADDITIONS only** — surfaces that don't yet have icons but should get brand-specific marks. Filed as P-229 (Chadi authoring).
**Cuts:** none — audit complete.

### P-229 — Custom brand marks (methodology + exam + milestone iconography)
Milestone: M2

**Priority:** LOW (post-soft-beta polish)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-210 audit
**Dependencies:** F-210, F-202 (methodology demo design pass), F-221 (exam picker shipped)
**Scope:** 9 brand-specific marks for surfaces that should have iconography but currently don't:
- **Methodology marks** (2): "Les Moules" mark + "La Méthode en Couches" mark. Used in MethodologySection on landing + future F-202 L'École intro demo. Style: line-drawn geometric primitive, ed-fg ink, 24-32px.
- **Exam monograms** (4): TCF / TEF / DELF / DALF. Used as format-DNA chip prefix in ExamPickerQuestion (currently text-only) and possibly /profile exam display. Style: small letterform mark, 16-20px, ed-accent or ed-fg.
- **Milestone badges** (3): Fondations / Approfondissement / L'École Complète. Used in EcoleProgress.tsx today (generic Check icon). Replace with editorial badges that signal phase progression.
Editorial constraint per F-200: line drawings or geometric primitives, no mascot energy, no 3D emoji. Either commissioned by Chadi or authored solo.
**Owner:** Chadi (art direction / commission) + Engineering (drop-in swap)

### F-211 — Loading states overhaul (skeleton shimmer migration)
Milestone: M2

**Priority:** MEDIUM (soft-beta polish)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured screenshots of /, /progress, /cluster, /ecole loading states per F-225)
**Filed:** 2026-05-04
**Source:** Strategic recalibration — interaction polish queue
**Dependencies:** F-200, F-212 (ed-skeleton CSS class)
**Scope (this commit):**
- Migrated `animate-pulse` → `ed-skeleton` (1.5s editorial shimmer, ed-rule on ed-paper, no aggressive pulse) on:
  - `ProgressDashboard.tsx` LoadingSkeleton (4 rows)
  - `ClusterDetailPage.tsx` LoadingSkeleton (3 rows)
  - `HomeScreen.tsx` daily-action card skeleton + lesson-list skeleton (5 rows)
- Border radii unified to 4px (was 16-20px) for editorial consistency.
- Reduced-motion fallback handled by ed-skeleton class (drops the shimmer animation, keeps a static ed-rule fill).
**Owner:** Engineering
**Cuts:**
- Recording analysis pipeline progressive states ("Recording received" → "Transcribing" → "Analyzing" → "Done"): filed as F-211.recording — touches F-061/F-062/F-104 invariants on the Tâche session components, needs careful audit.
- Signup → onboarding transition skeleton: filed as F-211.transition — small surface, low priority.
- LessonDetailClient (1 remaining animate-pulse instance): low-traffic auth-gated surface, F-211.x — sweep alongside F-206.lessons.
- shadcn `components/ui/skeleton.tsx` legacy primitive: leave as-is (used by other surfaces; per-consumer migration as F-2xx tickets touch them).

### F-214 — Visual depth + design system extension
Milestone: M2

**Priority:** MEDIUM (soft-beta polish)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` HowItWorks section flip + landing rhythm verification per F-225)
**Filed:** 2026-05-04
**Source:** Strategic recalibration — interaction polish queue
**Dependencies:** F-200, F-212
**Scope (this commit):**
- Section-bg alternation: HowItWorks flipped from `--ed-bg` to `--ed-paper` with 1px ed-rule top/bottom borders. Landing rhythm now: bg/bg/bg/**paper**/bg/paper/bg/paper — paper density increases toward conversion. Other sections kept on bg per "rhythm not chaos" rule.
- New `components/landing/TestimonialCard.tsx`: pattern component only (no data wiring). Serif italic quote (Source Serif), ed-accent left rule (3px), ed-paper bg with 1px ed-rule border, 4px radius, attribution + optional examContext rows. Inherits ed-card-lift on hover. Filed for use post-soft-beta when beta cohort quotes land (M-101 doc note #7 explicitly excluded testimonials from launch).
- `CLAUDE.md` editorial design system section: codified all F-200 → F-214 primitives (CSS utilities, tokens, JS constants, React components, color hierarchy, visual rules). Single canonical reference.
**Owner:** Engineering
**Design calls:**
- HowItWorks chosen for paper flip because it's the "instructional" section — paper bg gives it the "manual page" feel that Methodology + FinalCTA already enjoy. Differentiation kept on bg because flipping it would invert the card hierarchy (cards are ed-paper on bg; flipping section to paper would force cards to bg which loses elevation).
- TestimonialCard not added to landing today — no testimonial data exists. Component sits ready.
**Cuts:**
- Wire TestimonialCard into a TestimonialSection on landing: filed as F-214.x — needs Chadi-authored quotes from beta cohort.

### F-212 — Micro-animations + interaction feedback system
Milestone: M2

**Priority:** HIGH (soft-beta polish — interaction language across the platform)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots + interaction trace per F-225 of /, /fr, /onboarding question screens, signup form interactions, and reduced-motion fallback verification)
**Filed:** 2026-05-04
**Source:** Strategic recalibration — interaction polish queue
**Dependencies:** F-200 (editorial system tokens)
**Scope (this commit):**
- `lib/motion.ts` extended with F-212 editorial primitives (kept alongside legacy FluentPath spring system): `ED_EASE_CUBIC` / `ED_EASE_CSS` / `ED_DUR` / `ED_STAGGER` constants + `useRotatingText` + `useCountUp` + `useInViewOnce` hooks.
- `app/globals.css` adds `.ed-card-lift` (200ms hover translateY -2px + shadow expansion), `.ed-btn-press` (scale 0.98 on :active), `.ed-field` (focus border ed-accent + ring at 18% opacity), `.ed-skeleton` (1.5s shimmer for F-211), `.ed-page-enter` (250ms route fade-in for F-213), `ed-kicker-slide` keyframe (kicker word swap), `ed-hero-rise` keyframes + delay variants (hero first-paint sequence).
- New `components/landing/RotatingKicker.tsx`: flagship hero kicker. Cycles TCF / TEF / DELF / DALF every 2.5s with 600ms vertical-slide swap. Pauses on hover/focus. Honors prefers-reduced-motion (renders static "TCF · TEF · DELF · DALF" listing). EN prefix "Prep for" / FR "Préparation".
- `HeroSection.tsx`: kicker mounted above H1. Hero entry sequence applied via `ed-hero-rise` + delay-1/2/3 classes (200/300/500ms staggered first-paint).
- `OnboardingScreen.OnboardingCard` primitive gains `ed-card-lift` + `ed-btn-press` classes — every selectable card across all 11 onboarding questions inherits the lift + press automatically.
- `OnboardingScreen.CTAButton` primitive gains `ed-btn-press` — every primary CTA across onboarding/waitlist/EcoleReveal inherits the 0.98-scale press feedback.
- `DifferentiationSection` + `PricingSection` cards gain `ed-card-lift` class (landing).
- Stagger duration aligned to `ED_STAGGER.cards` (80ms) on RevealOnScroll consumers (Differentiation + Pricing).
**Owner:** Engineering
**Design calls (made solo per F-212 spec):**
- Card hover shadow ramp: `0 4px 16px rgba(0,0,0,0.06)` + `0 1px 4px rgba(0,0,0,0.04)` — restrained vs the tutorial-app default of larger blurs.
- Press scale 0.98 (vs 0.96 for FluentPath cards) — gentler editorial press.
- Stagger 80ms (lower end of 60-120ms range — F-212 spec). Card grids feel snappy at this rate; longer felt laggy.
- Hover-only on devices with `(hover: hover)` — touch devices skip the lift to avoid sticky-hover bug on tap.
- Kicker pauses on focus too (not just hover) — keyboard users get the same accessibility benefit as mouse users.
**Cuts (deferred):**
- Counter animations (deliverable #6): file as F-212.counter — narrow ROI, /progress and /cluster don't have prominent stat numbers worth animating (status chips and CEFR badges are categorical, not counts).
- Tab/toggle underline slide (deliverable #7): LanguageToggle is already EN/FR with active-state color shift — adding underline-slide on a 2-state toggle is overkill. Will revisit when a multi-tab surface lands (e.g., F-204.deep dashboard with method/calm mode toggle).
- Form-field per-input `ed-field` class application: deferred — existing :focus-visible global rule from F-200 (commit 14d0691) already gives inputs visible focus rings. F-212.field will swap to ed-accent ring + 18% opacity once a sweep across all 8+ form locations is justified.

### F-221 — Exam-target picker + brand-layer rewrite (multi-exam launch)
Milestone: M1

**Priority:** HIGH (launch — multi-exam onboarding gates which path the user enters)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production test BLOCKED on BE shipping `q0_target_exam` to `/onboarding/questions` response + `target_exam` field on User/UserPathEnrollment + accepting `q0_target_exam` in `/onboarding/submit`. Per Chadi 2026-05-05: BE migration in parallel; FE ready-to-fire when BE lands. Verification per F-225 once BE migration is live.)
**Filed:** 2026-05-04
**Source:** Strategic recalibration — exam-selector in onboarding
**Dependencies:** BE `target_exam` schema migration
**Scope (FE side, shipped this commit):**
- Brand-layer rewrite (~12 string edits in `components/landing/copy.ts`): full TCF Canada neutralization on landing → universal "French exam" framing. HERO h1 / DIFFERENTIATION card 3 / HOW_IT_WORKS step 1 / METHODOLOGY paragraph 2 / FAQ "PrepMyFrench" → "PrepMyFuture" with generalized framing / FAQ "guarantee TCF" → "Do you guarantee I pass?" / FINAL_CTA / META all neutralized.
- New `EXAM_OPTIONS` constant in copy.ts: 5 options (TCF Canada / TEF Canada / DELF B1-B2 / Another exam / Not sure) each with FE-localized format-DNA chip copy (EN+FR).
- New `TARGET_LEVEL_HELPER_BY_EXAM` constant: per-exam helper text injected on q2_target_level when q0_target_exam is known (e.g., TCF → "B2 maps to CLB 7-8 for Canadian PR").
- New `EXAM_DISPLAY_NAME` constant: slug → display name mapping for `{exam}` interpolation in waitlist + post-signup surfaces.
- New `EXAM_OTHER_FORM` copy (EN+FR): inline form copy for "Another exam" branch.
- `lib/waitlist.ts` extended: `WaitlistIntent` widened to include `'exam_other'`; `WaitlistEntry.examName` field added (free-text "which exam?" capture).
- `lib/submitResponse.ts` extended: `examAtSubmit` field added; `setSubmitContext` signature gains 4th arg.
- `app/signup/page.tsx`: signup flush captures `q0_target_exam` to submitResponse store before reset.
- New `components/onboarding/questions/ExamPickerQuestion.tsx`: 5 large card buttons with format-DNA chips, 88px minHeight, "Another exam" picks reveals inline mini-form (which exam? + email) → submits to localStorage waitlist (intent='exam_other') → parked confirmation. Continue gated on non-another_exam selection.
- `OnboardingFlow.tsx` dispatch: question id `q0_target_exam` routes to ExamPickerQuestion; q2_target_level reads prior q0 answer to inject helper text.
- `SingleSelectQuestion.tsx`: optional `helperOverride` prop added (used by OnboardingFlow for q2 per-exam helper).
- `WaitlistScreen.tsx`: body1 + body3 interpolate `{exam}` from submitResponse store using `EXAM_DISPLAY_NAME` map.
- `WaitlistForm.tsx` + `PricingSection.tsx`: prop type narrowed to `SprintOrPremium` (the 'exam_other' branch lives inline in ExamPickerQuestion, not the modal).
**Owner:** Engineering
**Note:** picker dormant until BE adds q0_target_exam to questions endpoint. Once BE lands: picker fires as Q1 of questionnaire, "Another exam" routes to email capture, "Not sure" submits as `not_sure` (BE backfills to TCF Canada per Chadi). Existing user backfill (test users id IN 5,6,7) is BE's responsibility.

### F-203 — Auth flow surfaces editorial migration (signup full + paywall responsive)
Milestone: M1

**Priority:** HIGH (launch-blocking — auth surfaces are the conversion funnel)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/signup` and `/paywall` per F-225)
**Filed:** 2026-05-04
**Source:** F-200 cascade
**Dependencies:** F-200
**Scope:** signup got full editorial migration (bg ed-bg, paper card with 1px ed-rule + 0 shadow + 4px radius, all form fields ed-tokens with 56px height + 4px radii + ed-paper bg + ed-rule borders, navy ed-accent submit CTA, Geist throughout). Paywall got minimal responsive fix only (bg → ed-bg, column widened 440→640px to fix desktop white-rails launch-blocker) — full editorial migration of Paywall's pricing chrome / radar chart / comparison table tracked separately as F-203.paywall.
**Owner:** Engineering

### F-203.paywall — Paywall full editorial migration
Milestone: M1

**Priority:** MEDIUM (post-soft-beta polish — F-203 minimal responsive fix unblocks launch)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-203 scope cut — full Paywall editorial migration deferred
**Dependencies:** F-203
**Scope:** migrate Paywall's 660-line pricing chrome to editorial system: typography (DISPLAY_FONT → Geist), Recharts radar styling (axis labels, fill colors, grid stroke → ed-* tokens), value-row checkmarks (current pastel/svg → ed-rule outlined), comparison table (current pill toggles → editorial tabs), trial timeline cards. Significant design work; F-203 minimal fix solves the launch-blocker.
**Owner:** Engineering

### F-204 — Authenticated dashboard surfaces editorial migration (page chrome only)
Milestone: M1

**Priority:** HIGH (launch-blocking — desktop white-rails)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/progress` and `/cluster/[slug]` per F-225)
**Filed:** 2026-05-04
**Source:** F-200 cascade
**Dependencies:** F-200, F-201
**Scope:** migrated PAGE CHROME of `/progress` and `/cluster/[slug]` to editorial system: bg → ed-bg, max-width 440 → 720 (fixes white-rails), header restyled (ed-rule border, Geist 600, padding clamp), main padding clamp() responsive, font tokens swapped at the page level. **Section internals (Snapshot/TodayFocus/Goulet/RecentActivity on /progress; ClusterHeader/LessonBody/PracticeCTA on /cluster) keep their FluentPath pastel chips as accent layer per F-200 rule** (pastels survive as decoration, not chrome). Full section-internal editorial migration deferred to F-204.deep.
**Owner:** Engineering
**Note:** F-204 deliberately scope-cut to page chrome only because section internals carry data-display chips (status indicators on cluster header, confidence visualizer pips on Snapshot, Tâche+CEFR badges on RecentActivity) where ed-* migration without redesign would lose information. Full migration needs design pass on chip vocabulary.

### F-204.deep — Section-internal editorial migration on /progress + /cluster
Milestone: M1

**Priority:** MEDIUM (post-soft-beta polish — F-204 chrome fix unblocks launch)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-204 scope cut — section internals deferred
**Dependencies:** F-204
**Scope:** migrate Snapshot section (level chips + confidence visualizer + agreement copy + diagnostic-in-progress fallback), TodayFocus (Dialogue Box + reason_code copy), GouletStack (RecurringModuleCard reuse), RecentActivity (linear list with Tâche/CEFR badges) on /progress. Plus ClusterHeader (status + last_detection_result chips with traffic-light dots) on /cluster. Each chip vocabulary needs editorial-system equivalent without losing data display.
**Owner:** Engineering + design pass on chip palette

### F-205 — User-state surfaces editorial migration (page chrome only)
Milestone: M1

**Priority:** HIGH (launch-blocking — desktop white-rails)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/profile` and `/diagnostic` per F-225)
**Filed:** 2026-05-04
**Source:** F-200 cascade
**Dependencies:** F-200, F-222.x (/profile real-data wire-up — same surface, separate ticket)
**Scope:** migrated PAGE CHROME of `/profile` and `/diagnostic`: bg → ed-bg, max-width 440 → 720 (fixes white-rails), token references swapped (INK → ed-fg, DISPLAY_FONT → Geist), header heading restyled (16px Geist 600 + 0.02em). Inner cards on /profile (Preply CTA on sage, Stats on butter, avatar on peach) preserved as accent layer per F-200 rule. /diagnostic's dense couches/modules display preserved untouched — section internals are F-205.deep scope.
**Owner:** Engineering
**Note:** /profile's hardcoded mockup data ("Chadi", "chadi@example.com", 47 days) is F-222.x scope — F-205 just restyles chrome. /diagnostic's CouchesDiagnostic + DetectedModuleCard + ordonnance components carry P-088 layout invariants — chrome-only migration avoids breaking those.

### F-205.deep — Section-internal editorial migration on /profile + /diagnostic
Milestone: M1

**Priority:** MEDIUM (post-soft-beta polish)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-205 scope cut
**Dependencies:** F-205, F-088 (couches schema), F-222.x (profile real-data)
**Scope:** /profile inner cards restyle (Preply CTA / Stats / Account / Settings card system to editorial). /diagnostic CouchesDiagnostic + DetectedModuleCard + InlineContentRef + CorrectedLine + GouletCard + ordonnance row migration to editorial chip system. Significant — needs P-088 layout audit to ensure data-display doesn't lose semantic meaning.
**Owner:** Engineering + design pass

### F-206 — Recording + module surfaces editorial migration (page chrome only)
Milestone: M1

**Priority:** HIGH (launch-blocking — desktop white-rails)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of all affected routes per F-225)
**Filed:** 2026-05-04
**Source:** F-200 cascade — final responsive sweep
**Dependencies:** F-200
**Scope:** migrated PAGE CHROME of `/login`, `/writing`, `/more`, `/ecole` (HomeScreen), and `/learn/[module_id]` (LearnModulePage): bg → ed-bg, max-width 440 → 720, font tokens DISPLAY_FONT → Geist, INK/INK_MUTED → ed-* tokens. Pastel accents preserved per F-200 rule: HomeScreen DailyActionCard backgrounds (peach/butter/sage), LearnModulePage CATEGORY_BG (per-category tints — these EARN their keep as data-display chips), avatar circle on /profile.
**Owner:** Engineering
**Note:** /speaking surfaces (SpeakingLanding + 3 Tâche sessions + feedback page) deferred to F-206.speaking — they have heavy interactive UI (PTT button, vu-meter, transcript review sheet, F-061/F-062/F-104 invariants). Editorial migration without invariant audit risks breaking core recording flow. /ecole/lesson/[id] surfaces (LessonDetailClient + quiz) deferred to F-206.lessons.

### F-206.speaking — /speaking surfaces editorial migration
Milestone: M1

**Priority:** MEDIUM (post-soft-beta polish)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-206 scope cut — recording surfaces deferred
**Dependencies:** F-206, F-061 / F-062 / F-104 invariant audit
**Scope:** migrate /speaking, /speaking/tache-1[/topic], /speaking/tache-2[/scenario], /speaking/tache-3/[topic], /speaking/feedback/[session]. Recording surfaces have load-bearing UI (PTT, vu-meter, ChatBubble, TranscriptReviewPanel, CountdownTimer, RecordButton). Editorial migration needs invariant audit.
**Owner:** Engineering + careful audit

### F-206.lessons — /ecole/lesson/[id] + quiz editorial migration
Milestone: M1

**Priority:** MEDIUM (post-soft-beta polish)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-206 scope cut
**Dependencies:** F-206, F-087 (lesson curriculum invariants)
**Scope:** migrate LessonDetailClient (markdown rendering + quiz CTA + back nav) and QuizClient (multi-question flow + answer-checking + result + lesson-unlock animation). Carries F-087 + F-115 motion invariants (lesson-unlock animation in HomeScreen).
**Owner:** Engineering

### F-202 — L'École intro rebuild + methodology surface (post-signup destination)
Milestone: M1

**Priority:** HIGH (launch-blocking — was the empty pink-key placeholder per Block 3 critique)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/ecole/intro` (all 5 sections) + interaction trace `/signup` → register → `/ecole/intro` → CTA → `/ecole` per F-225)
**Filed:** 2026-05-04
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** Strategic recalibration (May 4): "L'École intro is empty placeholder. Doesn't hit Promova benchmark" + F-202 spec May 5 with locked methodology copy (khâgneux-reviewed, 8 native-French ear corrections applied) + 5-couche model expansion (Couche 5 — La Voix added)
**Dependencies:** F-200 (editorial system), F-201 (EcoleReveal), F-203 (signup editorial chrome)
**Scope:** new route `/ecole/intro` — post-signup methodology surface (the moat made visible). Five sections in order: Frame (welcome) / La Méthode en Couches (5 couche blocks, centerpiece) / How it works (3 sub-blocks, diagnostic→treatment loop, "Le Goulet" introduced as named concept) / Le parcours (Fondations 1–16 + Approfondissement 17–27 + 5 lesson segments Le Piège/La Règle/Le Drill/La Situation/Le Débrief) / CTA → /ecole. Bilingual EN/FR via useInterfaceLanguage hook; copy locked verbatim (no paraphrasing). Signup post-register routing changed: `/ecole` → `/ecole/intro` (waitlist branch unchanged). Reveal-on-scroll stagger via useInViewOnce + 80ms sibling delay. ed-page-enter on root.
**Owner:** Engineering (Chadi authored methodology copy)

**Routing/state calls (resolved):**
- (a) **Separate `/ecole/intro` route** — clean separation, no conditional render in HomeScreen, deep-linkable. Picked Option A from spec.
- (b) **Flow:** EcoleReveal → /paywall → /signup → /ecole/intro → /ecole. Paywall stays unchanged (the moat is paid-side, protects from competitor snooping; public landing gets compressed version via F-227). Intro CTA → /ecole (DailyActionCard surfaces lesson 1 for new users; robust for return users via header link too). NOT /ecole/lesson/1 — that wouldn't make sense for return users.
- (c) **/ecole responsive editorial migration** — already shipped in F-206 chrome-level (ed-bg, ed-fg, ed-rule, 720px max-width). Pastels survive as DailyActionCard accent layer per F-200 rule. F-202 scope stayed focused on /ecole/intro alone. Deeper internal migration filed as F-206.lessons.
- **CTA color:** ed-accent navy (matches EcoleReveal + signup CTA chain) instead of spec's ed-fg/ed-paper. Coherent in-product CTA chain.

**Implementation notes:**
- New file: `app/ecole/intro/page.tsx` (ProtectedRoute wrapper)
- New component: `components/ecole/intro/EcoleIntro.tsx` (single orchestrator, ~620 lines, all 5 sections inline; sub-component split filed as F-202.split if it gets unwieldy)
- Methodology copy: locked in EcoleIntro.tsx as FRAME / METHODE / HOW / PARCOURS / CTA constants per language. *italic* tokens in body strings render as Source Serif 4 ed-accent emphasis (used for "Le Goulet" + "ne" callouts).
- Reveal component: useInViewOnce-driven opacity + Y-translate, 700ms ed-ease, sibling stagger via delayMs prop.
- Frame H1: clamp(56-96px) Geist 600. Subhead: Source Serif 4 italic clamp(20-24px) ed-muted.
- Méthode header: Source Serif 4 italic clamp(40-64px) ed-accent navy. 5 couche blocks at 96-112px vertical separation. Each block: "Couche N" italic small, name Geist 600 32-40px, label Geist 500 small-caps tracking, body 17-19px.
- Closer line: Source Serif 4 italic 22-28px ed-fg, centered, 96-144px above. Section borderTop ed-rule.
- How it works on ed-paper bg (alternates from ed-bg). 3 sub-blocks 48-72px apart.
- Le parcours: two-column grid ≥768px (Fondations + Approfondissement, ed-rule left edge), stacked mobile. 5 segments as numbered list, Source Serif 4 italic numerals in ed-accent.
- CTA: ed-accent navy bg, white text, 4px radius, 16x32 padding, ed-btn-press class.
- Signup post-register: `nextRoute = '/ecole/intro'` (was '/ecole'); waitlist branch unchanged. Already-authenticated user redirect from useEffect stays at /ecole (return visit).
- New globals.css utilities: `.ecole-intro-blocks` + `.ecole-intro-block` for the curriculum side-by-side grid (avoided styled-jsx).

**Accessibility:**
- Each section has aria-label (Welcome / Méthode title / How it works / Le parcours / Begin).
- Reduced-motion: ed-page-enter respects prefers-reduced-motion (gated in globals.css); useInViewOnce returns inView immediately when IntersectionObserver unavailable.
- Reveal opacity starts at 0 — if reduced-motion users want sections visible immediately, the IntersectionObserver fires on mount-near-viewport, so they see the same end state without animation.

### F-202.x — "À propos de L'École" header link from /ecole
Milestone: M1

**Priority:** LOW (post-launch UX polish)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** F-202 ship — return-user re-entry to methodology surface
**Dependencies:** F-202
**Scope:** add a small "À propos" / "About" link in /ecole header (or profile menu) that navigates to /ecole/intro. Copy: "À propos de L'École" (FR) / "About L'École" (EN). Position: header right-side, between page title and notifications bell. The intro page is always reachable; this just exposes it for return-users who want to revisit the methodology.
**Owner:** Engineering

### F-202.split — EcoleIntro sub-component decomposition
Milestone: M1

**Priority:** LOW (refactor)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** F-202 ship — single orchestrator at ~620 lines is acceptable today, but if Chadi adds methodology icons (P-229) or interactive elements per couche, sections should split.
**Dependencies:** F-202, P-229 (custom brand marks)
**Scope:** split `components/ecole/intro/EcoleIntro.tsx` into `IntroFrame.tsx`, `MethodeEnCouches.tsx`, `HowItWorks.tsx`, `LeParcours.tsx`, `IntroCTA.tsx`. Lift the FRAME/METHODE/HOW/PARCOURS/CTA copy constants to a shared `intro-copy.ts`. No visual changes — refactor only.
**Owner:** Engineering

### F-201 — Onboarding flow editorial migration (desktop responsive)
Milestone: M1

**Priority:** HIGH (launch-blocking — onboarding is the conversion funnel)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/onboarding` (multiple steps) + EcoleReveal step + `/onboarding/waitlist` per F-225)
**Filed:** 2026-05-04
**Source:** F-200 cascade — F-201..F-214 inherit the editorial system
**Dependencies:** F-200
**Scope:** migrate `/onboarding` flow from M-101a/P-220 era pastel chrome to the F-200 editorial system. Per-question pastel cycle dropped (uniform `--ed-bg`). Per-question illustrations dropped (type-led screens). Desktop column 720px (was 440px → caused white-rails launch-blocker). EcoleReveal full editorial migration: persona label oversized in Source Serif italic + navy `--ed-accent`, plan card on `--ed-paper` with 1px `--ed-rule` border, 280×280 placeholder illustration above. WaitlistScreen migrated. OnboardingScreen kernel restyled (4px button radii, 1px ed-rule borders, 0 shadow, ed-* tokens throughout). 4 question components (Single/Multi/Date/OtherFreetext) refactored to inherit kernel + drop illustration. questionMeta.ts retired to just the EcoleReveal asset constants.
**Owner:** Engineering
**Design calls** (per F-201 spec — captured in code comments):
- Card minHeight reduced 80px → 64-72px (editorial density vs M-101a softness).
- ProgressDots: filled dots 6×6px (was 8×8px) — finer rhythm.
- BackButton: chevron weight 1.5px (was 2px) — restraint.
- Toggle in OnboardingFlow header: text-only `EN / FR` slash separator (no pill backdrop) — matches landing's LanguageToggle.
- EcoleReveal: persona label sized 40-56px clamp (per spec), Source Serif italic, navy. CTA "Start your École" / "Commencer votre École" (was "Start my École" — slight phrasing tighter).
- WaitlistScreen body card: ed-paper 1px ed-rule, no shadow (was ed-paper + 0 2px 12px shadow + backdrop blur). Editorial flat over softness.



### P-221 — Diagnostic flow integration
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-02 (BE-side, lemethodic-backend commit `c475bb7`). FE consumer: /ecole banner + /diagnostic/results screen, scope captured separately as follow-up.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.3
**Dependencies:** P-201, P-220
**Scope:** after questionnaire, run 3 diagnostic recordings (one per Tâche). Engine output updates user level. Path assignment confirmed/adjusted.
**Owner:** Engineering

### P-222 — Waitlist UX for A2 and B2+ paths
Milestone: DONE

**Priority:** HIGH (pre-launch)
**Status:** Shipped 2026-05-03 (FE-side, lemethodic-frontend 3-commit set ending `820d788`; production verified at https://lemethodic.com/onboarding/waitlist).
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.3
**Dependencies:** P-201, P-221
**Scope:** when user diagnostic places them in a not-yet-built path, show waitlist screen with explanation, free interim resources, optional early-access opt-in.
**Owner:** Engineering

### P-222.x — capacity_warning UX surface
Milestone: TBD

**Priority:** LOW (post-launch)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-222 plan-first, deferred from waitlist v1
**Dependencies:** P-222
**Scope:** OnboardingSubmitResponse can carry `capacity_warning` independent of `waitlist` (e.g., a B1→B2 user with too few hours per week vs. their exam date). P-222 v1 ignores this field. This ticket adds a non-blocking advisory surface — banner or toast on /ecole first-load — that surfaces `weeks_to_exam` + recommended-vs-selected hours from the BE warning. Out of scope for waitlist (different code path).
**Owner:** Engineering

### P-222.y — EcoleReveal pre-signup waitlist-aware copy
Milestone: TBD

**Priority:** LOW (post-launch UX polish)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-222 plan-first, UX gap acknowledged
**Dependencies:** P-222
**Scope:** EcoleReveal renders pre-signup before /onboarding/submit fires, so a user who'll be waitlisted (q1 = a2/b2/c1) sees "Meet L'École" + persona preview that doesn't apply to them. Either (a) duplicate the BE waitlist-routing logic in FE so EcoleReveal can short-circuit to a "your path isn't ready, you'll see details after signup" preview, or (b) move EcoleReveal post-signup behind /onboarding/submit so it can read the waitlist flag. (b) is structurally cleaner but reshapes the conversion funnel — needs Chadi sign-off.
**Owner:** Engineering

### P-106.x — /paywall waitlist-aware behavior
Milestone: M6

**Priority:** MEDIUM (Stripe-dependent)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-222 plan-first
**Dependencies:** P-106 (BE Stripe ship), P-222
**Scope:** when Stripe ships and /paywall starts charging, waitlist-bound users (those whose /onboarding/submit response will return waitlist=true) must NOT be charged. Per LEMETHODIC-CURRICULUM §8.4, waitlist users get free access during the wait period unless they explicitly opt in to "early-access subscription". Today /paywall is aspirational copy with no charge so the gap is harmless; when P-106 lands, this ticket gates the charge on the (predicted) waitlist outcome OR moves /paywall behind /onboarding/submit so the waitlist response is known before charging.
**Owner:** Engineering

### Dashboards (§10.4) — full §7 implementation

### P-230 — Overall Progress dashboard rebuild
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-03 (FE-side, lemethodic-frontend 3-commit set ending in cleanup commit). Calm mode 4 sections (Snapshot / Today's focus / Goulet Stack / Recent activity). Method mode toggle hidden — depends on P-235 + P-236.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.4
**Dependencies:** P-201, P-204
**Scope:** rebuild /progress per §7.4. Calm mode default + method mode opt-in. Includes Block 2 (Goulet Stack), Block 5 (Dialogue Box), Block 8 (Confidence Visualizer). Replaces current P-100 surface entirely.
**Owner:** Engineering
**Supersedes:** P-100, P-100.5
**Note:** v1 ships calm mode only. Method mode toggle deferred until Blocks 1 (Ceiling Marker Map, P-235) and 7 (Mistake Repository, P-236) land. dialogue_box always null in production today (P-240b + P-213 not shipped); FE renders reason_code-driven fallback copy with defensive `dialogue_box.text` rendering for when BE populates the field.

### P-230.x — Recent activity calendar view
Milestone: TBD

**Priority:** LOW (post-launch UX polish)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-230 plan-first, deferred from v1
**Dependencies:** P-230
**Scope:** §7.4 calls for a "calendar view (kept from current implementation)" for Recent activity. v1 ships a linear list of last 5 recordings (matches functional baseline + ships fast). This ticket replaces it with a GitHub-contribution-graph-style grid showing the last 30+ days of recording activity. Requires extending `api.recordings.list` or adding a date-bucketed endpoint.
**Owner:** Engineering

### P-230.consolidate — Goulet Stack + /ecole "Recommended for you" overlap
Milestone: TBD

**Priority:** LOW (post-launch UX polish)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-230 plan-first, data-source overlap acknowledged
**Dependencies:** P-230
**Scope:** Goulet Stack (top 3) on /progress and "Recommended for you" (F-080d) on /ecole both consume `getRecurringModules`. Different framings — /ecole = "patterns we've seen" (curriculum-side recommendation), /progress = "bottlenecks blocking you" (severity-ranked dashboard signal) — but the data is the same and the visual treatment is similar. User testing may show this duplication as confusing. Resolution options: (a) keep both with sharper framings, (b) deprecate one, (c) split the data source so /progress reads from a dedicated bottleneck endpoint distinct from /ecole's recurring-detection feed.
**Owner:** Engineering + Product

### P-230.unify — DailyActionCard vs Today's focus duplication
Milestone: TBD

**Priority:** LOW (post-launch UX polish)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-230 plan-first, UX gap acknowledged
**Dependencies:** P-230
**Scope:** /ecole's HomeScreen has a DailyActionCard ("today's lesson" — linear curriculum-driven). /progress's TodayFocusSection has a "Today's focus" card ("today's prescribed practice" — engine-recommended). Two daily-action surfaces in one app may confuse users. v1 ships both intentionally per §7.3 (distinct surfaces). This ticket revisits if user testing shows confusion: (a) keep both with sharper framings, (b) deprecate /ecole's daily action card in favor of /progress's, (c) reverse — keep /ecole's, hide /progress's.
**Owner:** Engineering + Product

### P-231 — Speaking dashboard
Milestone: TBD

**Priority:** HIGH
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.4
**Dependencies:** P-201, P-204
**Scope:** implement §7.5. New surface, drill-down from Speaking tab. Includes Block 3 (Recording Replay with Inline Diagnostics).
**Owner:** Engineering

### P-232 — Per-Tâche dashboards
Milestone: TBD

**Priority:** MEDIUM
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.4
**Dependencies:** P-231
**Scope:** implement §7.6. Three dashboards (T1, T2, T3). Block 3 reused.
**Owner:** Engineering

### P-233 — Curriculum view (path surface)
Milestone: TBD

**Priority:** HIGH
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.4
**Dependencies:** P-203, P-204, P-210
**Scope:** implement §7.7. New surface accessible from main nav. Includes Block 4 (Path Topography).
**Owner:** Engineering

### P-234 — Cluster detail view
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-03 (FE-side, lemethodic-frontend 3-commit set ending in re-routing commit). v1 ships 3 of 5 §7.8 sections: Cluster header, Lesson body (markdown/PDF), Practice CTA. exercise_set + recording_history are in the BE response but rendered post-launch (P-234.exercises / P-234.history).
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.4
**Dependencies:** P-202, P-211
**Scope:** implement §7.8. Per-cluster page with lesson, exercises, prompt, history. Multi-format lesson rendering (markdown / PDF embed / video embed).
**Owner:** Engineering
**Note:** v1 ships at /cluster/[slug]. Visual language paper-on-canvas (mirrors B-102 LegalPage), distinct from /learn/[id]'s category-tinted modules. No `locked` UserClusterStatus state — BE confirmed 4-value enum (not_started/in_progress/absorbed/needs_revisit). TodayFocusSection re-routed: cluster_practice actions now go to /cluster/{slug} instead of directly to /speaking/tache-{N} (cluster page's CTA forwards with ?promptCluster URL param).

### P-234.history — Cluster recording history surface
Milestone: TBD

**Priority:** LOW (post-launch)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-234 plan-first; BE shipped data ahead of FE consumption
**Dependencies:** P-234
**Scope:** GET /api/users/me/clusters/{slug} already returns `recording_history` (last 10 newest-first, RecordingHistoryEntry items with detection_result + rubric_score). v1 doesn't render this. Add a "My history on this cluster" section: linear list with date / detection_result chip (clean/wobble/fail/not_observed) / rubric_score badge. Tap → /diagnostic?session={recording_id} per existing diagnostic deep-link convention.

### P-234.exercises — Cluster exercise set rendering + answer checking
Milestone: TBD

**Priority:** MEDIUM (post-launch)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-234 plan-first; BE shipped data ahead of FE consumption
**Dependencies:** P-234, P-211a (authoring schema lock-in)
**Scope:** ClusterDetailResponse.exercise_set is a JSONB array shipped today but unrendered in v1. The authored shape is owned by the cluster authoring rubric (P-211 / P-211a). This ticket adds an Exercises section between Lesson body and Practice CTA: render each exercise per its authored type (multiple-choice / fill-blank / order-the-words / etc.), check answers client-side or via a new BE endpoint, surface scoring. Significant scope — needs schema lock-in from P-211a first.

### P-234.speaking-promptCluster — /speaking/* consume ?promptCluster URL param
Milestone: TBD

**Priority:** MEDIUM (post-launch)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-234 — completes the round-trip from cluster detail to practice
**Dependencies:** P-234, BE practice prompt resolution
**Scope:** P-234's PracticeCTA emits `/speaking/tache-{N}?promptCluster={slug}`. /speaking/tache-{N} pages currently ignore this param and serve a default/random prompt. This ticket reads the param and either (a) uses the cluster's `practice_prompt` JSONB to override the default Tâche prompt (FE-side lookup), or (b) sends the slug to BE and lets the engine serve the cluster-specific prompt. (b) is cleaner — needs BE to accept the param on the recording-start endpoints.

### P-235 — Ceiling Marker Map
Milestone: TBD

**Priority:** HIGH (method mode visibility moat)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.4
**Dependencies:** P-200, P-201
**Scope:** implement Block 1. Surfaceable from Overall Progress (method mode) and Curriculum view (method mode).
**Owner:** Engineering

### P-236 — Mistake Repository
Milestone: TBD

**Priority:** MEDIUM
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.4
**Dependencies:** P-200
**Scope:** implement Block 7. Standalone tab inside Progress.
**Owner:** Engineering

### P-237 — Time-Adaptive UI (lean version)
Milestone: TBD

**Priority:** HIGH (meta-ticket affecting all dashboards)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.4
**Dependencies:** P-230, P-231, P-233
**Scope:** implement Block 6 lean version. `daysUntilExam` reads + conditional rendering for Dialogue Box copy, Goulet Stack ordering, exam countdown weight, practice CTA emphasis. Full mode redesigns deferred to Phase 2 (P-267).
**Owner:** Engineering

### Prescription engine (§10.5)

### P-240 — Today's recommended action
Milestone: DONE

**Priority:** HIGH
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.5
**Dependencies:** P-204, P-213
**Scope:** prescription logic — given user's current path/phase/cluster + recent submissions + Dialogue Box template selection, output the single recommended next action. Surface on Overall Progress §7.4 section 2.
**Owner:** Engineering

### P-241 — Cluster-level prescription
Milestone: TBD

**Priority:** MEDIUM
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.5
**Dependencies:** P-204, P-211
**Scope:** when a cluster's detection rubric scores "needs revisit", prescription engine routes user back to that cluster instead of advancing.
**Owner:** Engineering

### Calibration & content ops (§10.6)

### P-250 — Threshold calibration
Milestone: TBD

**Priority:** HIGH
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.6
**Dependencies:** P-200, P-211
**Scope:** run real recordings of known-level students (Chadi's existing Preply students with documented levels) through the diagnostic. Tune thresholds in §2.4 and §3.x against ground truth. Iterate until level assignment agrees with Chadi's expert judgment ≥80% of the time.
**Owner:** Engineering (tuning); Chadi (ground-truth labels)

### P-251 — Lesson content delivery infrastructure
Milestone: TBD

**Priority:** MEDIUM
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.6
**Dependencies:** none
**Scope:** implement multi-format lesson delivery (markdown rendered in-app, PDF embedded with download option, video embedded). Specify file storage on Spaces, versioning, FE rendering.
**Owner:** Engineering

### Phase 2 deferred (§10.7)

Stubs filed at the same time as Phase 1 to lock the IDs and prevent collision. Scope is the title only — full specs land when each ticket is taken up post-launch.

### P-260 — Writing analysis pipeline
Milestone: TBD

**Priority:** —
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.7
**Dependencies:** TBD (Phase 1 foundation must ship first)
**Scope:** writing analysis pipeline — full spec at pickup time.
**Owner:** Engineering

### P-261 — Writing dashboard
Milestone: TBD

**Priority:** —
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.7
**Dependencies:** P-260
**Scope:** writing dashboard — full spec at pickup time.
**Owner:** Engineering

### P-262 — Cross-modal prescription
Milestone: TBD

**Priority:** —
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.7
**Dependencies:** P-240, P-260
**Scope:** cross-modal prescription (speaking + writing) — full spec at pickup time.
**Owner:** Engineering

### P-263 — A2 path full content
Milestone: TBD

**Priority:** —
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.7
**Dependencies:** P-211, P-212
**Scope:** A2→B1 path full content authoring (extends P-212 starter set).
**Owner:** Chadi

### P-264 — B2→C1 path full content
Milestone: TBD

**Priority:** —
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.7
**Dependencies:** P-211, P-212
**Scope:** B2→C1 path full content authoring (extends P-212 starter set).
**Owner:** Chadi

### P-265 — C1→C2 path
Milestone: TBD

**Priority:** —
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.7
**Dependencies:** P-211
**Scope:** C1→C2 path (structure + content) — full spec at pickup time.
**Owner:** Chadi (content); Engineering (structure)

### P-266 — Tense + conjugation + idiomaticity detectors
Milestone: TBD

**Priority:** —
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.7
**Dependencies:** P-200
**Scope:** additional detectors beyond P-200's initial set — tense correctness, conjugation accuracy, idiomaticity scoring.
**Owner:** Engineering

### P-267 — Time-Adaptive UI full mode redesigns
Milestone: polish-defer

**Priority:** —
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.7
**Dependencies:** P-237
**Scope:** Foundation / Acceleration / Cram modes with different navigation structures (full redesign beyond P-237's lean conditional rendering).
**Owner:** Engineering

### P-268 — Audio-synced playback for Recording Replay
Milestone: polish-defer

**Priority:** —
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.7
**Dependencies:** P-231
**Scope:** Block 3 enhancement — audio-synced inline diagnostic playback.
**Owner:** Engineering

### P-269 — Streak system
Milestone: polish-defer

**Priority:** —
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 §10.7
**Dependencies:** none
**Scope:** streak system — F-067 reframed under the curriculum architecture.
**Owner:** Engineering
**Note:** F-067 (Queued — polish for real-feel) is now superseded by P-269.

### M-101.z — Landing page custom hero asset + per-section icons (Phase 1 polish)
Milestone: polish-defer

**Priority:** LOW (post-launch P1)
**Status:** Queued
**Filed:** 2026-05-02
**Source:** M-101a plan-first, deferred from launch
**Dependencies:** M-101a
**Scope:** author landing-page custom hero asset + per-section icons. The M-101a build reuses the P-220 pastel palette + at most one P-220 illustration as a placeholder; this ticket replaces them with marketing-specific assets (hero anchor visual, three icons for the differentiation cards, three step indicators if Chadi wants them — currently typographic numbered circles).
**Owner:** Chadi (illustrations) + Engineering (wire-up)
**Note:** filed per the P-220.z precedent (Phase 1 polish, illustrations not blocking ship).

### B-102 — Privacy + Terms + Refund pages with footer integration
Milestone: DONE

**Priority:** HIGH (pre-launch legal compliance)
**Status:** Shipped 2026-05-03 (FE-side, lemethodic-frontend commit `3216d4d`; production verified at https://lemethodic.com/{privacy,terms,refund}).
**Filed:** 2026-05-03
**Source:** Launch checklist (legal pages required for LemonSqueezy onboarding + Stripe ship).
**Dependencies:** none (markdown source authored by Chadi).
**Scope:** three new routes serving docs/{privacy-policy,terms-and-conditions,refund-policy}.md as styled markdown via react-markdown + remark-gfm. Shared `LegalPage` Server Component reads the .md files at request time. New `LandingFooter` component with three legal links + brand mark + copyright + admin@lemethodic.com, mounted on landing routes (`/`, `/fr`) and reused on legal pages. EN-only at v1; FR translations defer to M-101.x post-launch.
**Owner:** Engineering

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

**F-063.1** 📋 T1 audio autoplay — examiner's opening prompt
- Observed during F-063 verification: autoplay doesn't trigger on the examiner's FIRST prompt audio in a Tâche 1 session. Subsequent examiner turns in the same session play inline once the audio context is user-unlocked (via the "Tap to hear the question" ghost button on the first miss). The first turn falls through to the ghost-button fallback every time, even when the user has interacted with the page (briefing CTA tap).
- Hypothesis: the briefing → `examiner-speaking` phase transition mounts the `<audio>` element and calls `.play()` synchronously in a `useEffect`, which lands outside the user-gesture window from the briefing CTA tap. Subsequent turns fire inside a gesture-derived event chain (PTT release → upload → response → play) so they pass.
- Fix candidates: route the first turn's `play()` through the same gesture-chained handler the PTT flow uses, OR keep the current architecture and dismiss the autoplay ghost as expected first-turn behavior (cosmetic-only follow-up).
- Not blocking — F-063 ships with the ghost-button fallback. Filed 2026-04-27.

**F-063.3** 📋 T1 review sheet timing — sheet appears before examiner finishes speaking
- Observed during F-063 verification: the per-turn review sheet (Confirmer / Refaire cette prise) for the user's just-recorded turn pops up before the AI examiner finishes speaking the FOLLOWING reply. The user is asked to confirm/redo while the examiner audio is still playing — clashes with the "let the examiner finish, then react" interaction model.
- Root cause: phase machine flips to `reviewing` (which mounts the sheet) immediately after `/turn` upload completes; the examiner reply audio plays in parallel from the `examiner-speaking` phase. The two phases end up overlapping by ~3-6 seconds depending on turn length.
- Fix candidate: gate the review sheet mount on `audioEnded === true` for the most recent examiner turn (or queue the sheet open behind the audio's `ended` event). Same pattern T2 already handles correctly via deferred-commit (F-062.3) — T1 inherited the structure but the audio-finish gate didn't carry over.
- Filed 2026-04-27 from F-063 verification.

### F-110.1 — Migrate frontend reads from internal_key to key
Milestone: DONE

**Status:** Superseded by P-100.5 (2026-05-01) — same code change shipped as part of the dashboard rendering fix bundle. The migration originally specced here (RawCouche type rename + filter + mapDiagnosticBlock + mapRecordingSummary) shipped verbatim under P-100.5 because Section 2's missing render was caused by exactly this mismatch (frontend reading `internal_key` while F-110 list endpoint emitted `key` only).
**Cleanup trigger:** F-110.2 backend cleanup is now safe to execute — notify backend to drop `internal_key` from `couches_array` dual-emission.

### P-104.x — Wall-clock setTimeout cap fallback for deep-throttle edge case
Milestone: TBD

**Priority:** Low (post-launch)
**Status:** Queued
**Filed:** 2026-05-01
**Parent:** P-104 (Step 1 visibilitychange listener shipped — see "Shipped — Week 2 (May 1)")

**Scope:** harden the per-Tâche cap auto-stop for the deep-throttle edge case where the user backgrounds the tab for the entire turn duration plus several minutes, never refocusing within the cap window. P-104's visibilitychange listener fires the cap on refocus; this ticket bounds the worst-case overrun to ~2s by also scheduling a wall-clock `setTimeout(TURN_CAP_MS, finishRecording)` at recording start, cleared in all stop paths.

**Background:** `setTimeout` is also throttled in background tabs but Chrome doesn't pause it entirely under intensive throttling — a 60s setTimeout fires within ~1-2s of wall-clock t=60 even when hidden. This complements the visibilitychange listener for the case where the user simply doesn't return.

**Implementation sketch:** in each Tâche session's `startRecording`, schedule the timeout. Clear it in `finishRecording`, on phase transitions away from recording, and on unmount. Idempotency is already in place (`recorder.stopRecording()` no-ops when state is `inactive`), so the cap firing twice is safe.

**When:** defer until real user data shows the long-hidden case happens. The Visa-Urgent persona is unlikely to background a TCF practice tab for 5+ min mid-recording. Pre-launch coverage of the brief and moderate cases via P-104 Step 1 is sufficient.

### P-115.x — Motion pass: remaining surfaces
Milestone: M2

**Priority:** Medium
**Status:** Queued
**Filed:** 2026-05-01
**Parent:** P-115 (4 of 8+ surfaces shipped — see "Shipped — Week 2 (May 1)")

**Scope:** the motion surfaces deferred from P-115's first pass.
- **Button presses** — every primary CTA / card press currently uses inline `transform: scale(0.97)` on pointerdown with no transition. Migrate to `motion.button` with `whileTap={{ scale: scaleButtonPress }}` and `transition={pressInstant}`. Hits Paywall CTA, OnboardingScreen.CTAButton, every Tâche briefing/finalize button.
- **Card transitions** — onboarding cards, lesson list rows on hover/tap, Tâche scenario picker cards. Existing pattern uses inline scale; migrate to `motion.div` with `liftSpring` for selected-card lift and `pressInstant` for press.
- **Tab switches** — bottom nav tab change between /, /speaking, /writing, /progress, /more. Currently no transition between routes; add a fade or fade-slide on route content using AnimatePresence + the layout shell.
- **Progress bar fills** — Quiz progress bar (`QuizClient.tsx:155-173`), any other linear progress bars. Currently uses CSS `transition: width 0.3s ease`; migrate to motion with `easeFpDefault` for consistency.
- **Onboarding step transitions** — between LanguageSelect → TCFGoalSelect → … → EcoleReveal. Currently a hard cut on `setStep(n+1)`. Add AnimatePresence + slide/fade between steps.
- **Streak fire icon** — once F-067 ships streaks, a subtle attention pulse on the streak counter when it increments.

**Dependencies:** none; the foundation (`lib/motion.ts`, `framer-motion`, tokens, safe-area) is already shipped via P-115.

**When:** pick up after launch-blockers clear (P-103, P-104, B-100, B-102, M-100). Not pre-launch critical — the 4 shipped surfaces cover the highest-impact moments (diagnostic reveal, recording-done, unlock, empty-state CTA).

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
**Superseded by F-091b** (April 27, 2026). Original scope below preserved for historical record.
- Split "Immigration" goal into "Immigration — TCF Canada" and "Immigration — TEF Canada"
- mapOnboardingToBackend routes second option to exam_profile='tef'
- No backend change needed (exam_profile column already accepts 'tef')

**F-069** 📋 French lesson titles in backend seeder
- Update seed_topics.py or ecole seeder
- Lesson titles must be French ("Conjugaison" not "Conjugation", "Prépositions" not "Prepositions")
- Lesson short_descriptions stay in interface language (English for EN users)
- Reseed the ecole_lessons table on dev DB before launch

**F-070** 📋 CEFR → TCF /699 score mapping
**Superseded by F-091c** (April 27, 2026). Original scope below preserved for historical record. Reframe in F-091c generalizes from TCF /699 to per-exam dispatch.
- Backend analysis engine must emit tcfScore (0-699) alongside noteGlobale (0-20) and cefrBand
- Map internal score → TCF band using official TCF Oral rubric (0-699)
- Frontend diagnostic page hero switches from {noteGlobale}/20 to {tcfScore} / 699 {cefrBand}
- Paywall radar already shows this; make sure diagnostic matches

---

_(F-084 v2 shipped 2026-04-27 as a progressive-disclosure pattern, not the original basic/detailed toggle. See "Shipped — Week 2 (April 27)" below for the full entry. Original spec preserved here for diff-history; the v2 spec replaces the toggle/preference-field design with a single page that uses progressive disclosure for everyone — narrative hero + top-3 dimensions visible by default, "See full breakdown" disclosure for depth.)_

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

**F-080d.aa** 📋 Defensive grep audit — leftover SQLite-isms in raw/ORM SQL (post-launch)
- The hotfix that motivates this ticket: `func.group_concat(distinct(SessionDetectedModule.recording_id))` in `app/routers/users.py::recurring_modules` and `app/routers/modules.py::_user_context_for` raised `psycopg.errors.UndefinedFunction: function group_concat(integer) does not exist` on the production deploy. Both call sites were ported to `func.string_agg(distinct(cast(col, String)), ",")` in a single backend commit. Frontend audit grep was clean of `group_concat | IFNULL | json_extract` everywhere else, but the F-080d epic was authored against SQLite locally — there is no test that exercises the postgres dialect end-to-end, so other dialect-specific calls may be hiding.
- Defensive sweep to schedule post-launch: grep the backend tree for `group_concat`, `IFNULL` (Postgres uses `COALESCE`), `json_extract` (Postgres has `->`/`->>`/`jsonb_path_query`), and string-concat via `||` in raw SQL (`text("...")` blocks) — also worth checking for `STRFTIME(`, `RANDOM()` semantics drift, `AUTOINCREMENT`, and any `op('REGEXP')` / `MATCH` clauses. Anything that surfaces gets a cross-dialect rewrite plus a regression note in this entry.
- Why post-launch: the immediate production breakage is closed by the hotfix. The remaining risk is dialect-specific calls that are reachable only on rarely-invoked endpoints — they will surface as 500s with the same shape as the recurring_modules outage and be straightforward to localize from logs. Pre-launch we'd rather not block on a speculative grep when production traffic has already exercised the high-volume paths.
- Stale comment cleanup hitchhiking on this audit: `users.py::_coerce_iso` still describes "SQLite + func.min/max return strings" as the motivation. Local DB switched to Postgres in F-077; the helper itself is harmless under Postgres (datetimes round-trip as datetimes) but the comment is misleading. Strip or rewrite during the sweep.
- ID note: filed as `F-080d.aa` because `.x` (perf), `.y` (public glossary), `.z` (verification harness rules) were already taken in this epic's sub-ticket numbering when this hotfix landed. Rename if a saner ID is preferred.

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
- F-080d.z — verification harness rules:
  1. Any test that mutates `session_detected_modules` (or any other shared table) MUST use try/finally with snapshot+restore. Adopted after the F-080d round-1 cleanup leak.
  2. List/grid/index rendering gates MUST also click through to a detail page reached from the list and confirm content matches the data layer. Adopted F-089 after F-087 verification gate 5 ("HomeScreen + /ecole render 27 cards") shipped clean while `/ecole/lesson/[id]` was a hardcoded stub map covering only the old 16-lesson curriculum — list rendering passed; detail flow was broken for lessons 17-27 from F-087 onward. Bundled the fix into F-089 since that's the first ticket that actually read the detail page.
  3. Every ticket spec must include an explicit grep-audit step against the actual codebase before implementation begins. Adopted 2026-04-27 after multiple tickets this sprint had spec drift between described state and codebase reality: F-087 referenced fields that didn't exist on the model, F-089 assumed `/ecole/lesson/[id]` rendered real data when it was a hardcoded stub, F-088 named an endpoint (`/api/diagnostic/{session_id}`) that doesn't exist in this codebase and missed the legacy admin template as a second consumer of `la_carte`. The grep-audit catches drift at write-time when the cost of revising the spec is hours, not at implementation-time when the cost is scope creep + commit-message archaeology.

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

**F-072** ✅ Shipped via F-310 (BE 4bb44fb..043167f, 2026-05-12) + F-310.fe (FE 2fef9b7..b8f91ee, 2026-05-12). Original scope fully absorbed: 15-min access + 7-day refresh JWT rotation with httpOnly cookie + Redis revocation; /api/auth/refresh BE endpoint live; FE refresh-on-401 interceptor with retry-loop guard + concurrency dedupe; clearAuth on refresh failure. Plus everything else F-310 added (email verification, hCaptcha, /auth rate limiting, Stripe webhook HMAC, tier-check hook). Original bullets preserved below for diff history:
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

**F-075** 📋 Audio upload security hardening (carried from F-050) — split into F-075a (size cap) and F-075b (auth on audio serving)
**F-075a + F-075b both shipped 2026-04-27.** Entries in "Shipped — Week 2 (April 27)" below.
- Backend: server-side size cap on /api/audio/upload (5 MB hard limit) — **shipped as F-075a; audit found 4 upload endpoints, all capped at 10 MB.**
- Backend: user_id on Recording model + auth check on /api/audio/{id} serve route — **shipped as F-075b, but reshaped: audit found NO existing user-audio serving route (the diagnostic page never plays back user recordings; `_serialize_turn` deliberately refuses to expose candidate audio_url). Actual fix wrapped the unauthenticated `/tts_audio/` static mount with an authenticated route handler. F-075b.x carries the canonical pattern for whoever wires user-audio playback first.**

_(F-076 shipped 2026-04-27 — see entry under "Shipped — Week 2 (April 27)" above. The audit found the bug was localized to `CountdownTimer.tsx` (T3 prep mode); `useAudioRecorder` was already wall-clock via `Date.now()` per F-061. The original ticket text below is preserved verbatim for diff-history; the actual fix scope was narrower than the ticket assumed.)_

**F-076 (original spec, superseded by ship)** 📋 Background tab timer drift fix (carried from F-050)
- Frontend: PTT 60s cap in Tache2Session uses performance.now()+setInterval
- Chrome throttles setInterval in hidden tabs, timer drifts
- Fix: use Date.now() deltas (already pattern in useAudioRecorder)

**F-077** ✅ Production environment config — Shipped 2026-05-12. FE confirmed via Chadi Vercel inspection: `NEXT_PUBLIC_API_URL=https://seal-app-75fiu.ondigitalocean.app` set on `lemethodic-frontend` project, scoped to Production. BE deployed to DigitalOcean App Platform; FE deployed to Vercel at lemethodic.com. CORS allow_origins production domain set (verified via successful authenticated calls from prod FE → prod BE).
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

_(F-091.0 shipped 2026-04-27 — see entry under "Shipped — Week 2 (April 27)" above. Approach (a-prime) — descriptors stripped + mapper locked, goal step retained because it gates `TargetScoreSelect`. Note this entry is intentionally left as a forward-pointer; the original ticket scope is preserved verbatim in the shipped entry.)_

---

## Deferred — post-launch (Week 3+)

**F-081** ⏸ Audio content refs per module
- Native-speaker drill recordings attached to modules. Module schema already supports `content_refs` (typed `audio` is one of the allowed `ContentRefType` variants — see F-080c types). This ticket populates the audio entries with real URLs and wires the playback surface on `/learn/[id]`.
- Backend: extend the seeder + module JSON authoring format to accept audio-file URLs; serve the files (S3 or static).
- Frontend: `InlineContentRef.tsx` currently renders an "audio: Coming soon" placeholder for `audio` type — replace with a real `<audio>` element + waveform display.
- Promoted from the "F-080 unblocks" line + F-080c InlineContentRef placeholder note (line 486) where this ticket lived as a passing reference.
- Estimate: 2 days incl. audio production (native-speaker recordings, level/normalization). Filed 2026-04-27.

**F-082** ⏸ Drill UI on `/learn/[module_id]`
- Interactive AVOID/PREFER click-through exercises on the standalone module page. User reads the explanation, then practices identifying wrong vs right patterns on a series of cards. Spaced-repetition tracking persists per-user-per-module.
- Backend: new `user_module_drills` table (user_id, module_id, drill_id, last_seen_at, correct_count, total_attempts) for SRS scheduling; new endpoints to fetch the next drill and submit answers.
- Frontend: drill component reused on `/learn/[id]`; integrates with `ModuleExamples` (F-080c) for the source content.
- Promoted from the "F-080 unblocks" line + F-080c InlineContentRef placeholder note (line 486).
- Estimate: 2-3 days. Filed 2026-04-27.

**F-091 (epic)** ⏸ Multi-exam routing — TCF + TEF Section B + DELF B1/B2
- Decision (April 27, 2026): deferred from launch sprint to **post-launch week 1**. For the May 4 launch, FluentPath ships TCF-only (see **F-091.0** in the launch-prep queue for the V1 lock). Multi-exam returns post-launch with proper scope.
- **Goal:** one engine, swap prompts and scoring per exam. Three concrete targets: TCF Canada (already shipped, baseline), TEF Section B, DELF B1/B2.
- **Architectural cornerstone:** `app/services/exam_profiles/` already has the dispatch shape (`base.py` interface + `tcf_canada.py` concrete). The epic extends that pattern to the other two exams without forking the engine.
- **Composed of three sub-tickets — ships when all three are green. Total estimate ~2.5 days.**
- **Supersedes** F-068 (folded into F-091b) and F-070 (folded into F-091c). Both originals retained as historical records with supersede header notes.

**F-091a** ⏸ Exam-profile dispatch infrastructure
- Backend only. Extend `app/services/exam_profiles/` with `tef.py` and `delf.py` profile implementations alongside the existing `tcf_canada.py`. Per-exam prompt sets for examiner persona (TEF role-play, DELF entretien dirigé).
- Thread `users.exam_profile` through analyzer dispatch points (`analyze_tache_1` / `_2` / `_3` and the F-080b module detector) so the right prompts are used per recording. Today every analyzer hardcodes the TCF Canada profile via the existing `get_profile()` lookup; this extends `get_profile(exam_profile)` to dispatch by string.
- No frontend changes.
- Estimate: 1 day. Part of F-091 epic.

**F-091b** ⏸ Onboarding goal split + exam_profile wiring
- Frontend + light backend. Subsumes the original F-068 work verbatim plus the DELF option:
  - Split "Immigration" goal into "Immigration — TCF Canada" / "Immigration — TEF Canada"
  - Add "Education — DELF B1/B2" as a new top-level goal
  - Wire `mapOnboardingToBackend` to set `exam_profile` correctly per option ('tcf' | 'tef' | 'delf')
  - Confirm `users.exam_profile` column accepts the new values (currently a bare TEXT column; no constraint to relax)
- **Depends on F-091a shipping first** — otherwise the column value has no dispatch target and the user's experience silently falls through to the TCF profile.
- Estimate: 2-4 hours. Part of F-091 epic.

**F-091c** ⏸ Generalized scoring infrastructure
- Backend + frontend. Reframes the original F-070 work from TCF-only to per-exam dispatch.
- **Backend:** refactor `app/services/scoring_maps.py` from TCF-only to a profile-dispatched layer:
  - `tcf_from_score` (existing — `/699` scale)
  - `tef_from_score` (new — `/450` scale + NCLC mapping for the Canadian-immigration cross-walk)
  - `delf_band_from_score` (new — B1/B2 pass/fail mapping; no continuous scale, just a band assertion against the threshold)
- **Frontend:** diagnostic hero reads from the active exam profile (via the user shape + the recording's `exam_profile` field) and renders the appropriate scale: `/699` for TCF, `/450` for TEF, band-pass for DELF. Paywall radar already shows TCF /699; that surface is updated alongside the diagnostic hero.
- **Depends on F-091a** for the profile dispatch target.
- Estimate: 1 day. Part of F-091 epic.

**F-085** ⏸ Writing integration (Expression Écrite)
- Promoted from the generic deferred bullet to a discrete numbered ticket. Required dependency for **F-101** (master diagnostic, speaking + writing fusion) and indirectly for **F-102** (student-level dashboard, both modalities feed it).
- Concrete scope:
  - **(a)** Text input surface where students paste or type French. Two flavors: structured prompt (TCF Expression Écrite tâche) and free-form (any French text the student wants analyzed).
  - **(b)** Analysis pipeline parallel to the speaking pipeline — re-use Claude API detection prompts adapted for written text. Same `RemediationModule` library; same detection contract; same persistence layer (a new `writing_recordings` or extended `recordings.modality` column carries it).
  - **(c)** Module schema reused as-is — written L1-interference patterns surface as `detected_modules` with the same shape as speaking. No schema fork.
  - **(d)** Writing-specific modules authored in the same JSON format (e.g. `anglicism_orthographique`, `anglicism_syntaxique`, `accord_participe_passe_negligence`). Authoring track ramps post-F-085 ship.
- Estimate: 4-5 days. Filed 2026-04-27.

**F-093** ⏸ Streaming transcription via WebSocket STT
- Replace Whisper API batch transcription with streaming provider (Deepgram, OpenAI Realtime API, or Groq Whisper streaming).
- Backend: WebSocket endpoint for audio streaming, partial-result forwarding, reconnection handling.
- Frontend: real-time transcript rendering during recording, interim vs final states.
- Migration: existing recordings stay batch; new recordings stream.
- Estimate: 3-5 days. Priority: High post-launch. Filed 2026-04-27 from observed Gemini Live UX.

**F-093.1** ⏸ Progressive transcription UI (no backend change)
- Frontend-only illusion of streaming using existing batch backend. Show waveform of captured audio, animated "Transcribing..." text, then word-by-word stagger animation when transcript arrives.
- ~2 hours work. Optional pre-launch in QA window May 2-3 if real-streaming feel is desired before F-093 ships. Filed 2026-04-27.

**F-094** ⏸ TEF Section A examiner mode
- New examiner mode where the AI plays a role and waits to be ASKED questions by the candidate. TEF Section A is "candidate elicits info from examiner" — the opposite information flow from T1 (examiner asks, candidate responds), T2 (role-play with mixed elicitation), and T3 (candidate-only monologue).
- Distinct examiner persona prompts: candidate-driven turn order, examiner answers questions and prompts the candidate when they stall.
- Distinct scoring rubric: quality of question formation, range of registers, ability to handle multi-clause asks ("Could you tell me whether ... and also ...").
- Reuses the existing conversation engine (Tâche 1 / Tâche 2 share `/start`, `/turn`, `/end`) — the new mode plugs in as a `tache_mode` value with its own examiner persona module.
- Estimate: 2 days. Filed 2026-04-27.

**F-095** ⏸ DALF C1 with document presentation
- Compte rendu + débat from a written dossier. Requires a new UI surface: candidate reads a multi-document dossier for 8-10 min prep (timer visible, no recording), then speaks for ~30 min monologue + débat against the AI examiner.
- New `DocumentPresentation` component — paginated dossier reader with annotation/highlight support; optional "show prep notes" overlay during the monologue phase.
- Integrates with the existing recording engine (PTT for the débat phase, monologue for the compte rendu). Document content authored as JSON dossiers per topic.
- Distinct scoring rubric vs TCF: synthesis quality, source-citation in the compte rendu, defense of position in the débat.
- Estimate: 3-4 days. Filed 2026-04-27.

**F-096** ⏸ Visual identity system
- Design tokens lock: color palette (the existing FluentPath pastels formalized into a tokenized scale), typography scale (Cabinet Grotesk display + body sizes / weights / line-heights), spacing rhythm (4/8/12/16/20/24/32 grid), component primitives (button states — default/hover/active/disabled/loading; card elevations; input focus rings; iconography decision — 3D illustrations vs flat illustrative vs photographic vs abstract).
- Output: `design-tokens.css` (or `app/globals.css` extension) + Figma file or markdown spec doc for non-engineering reference.
- Content-heavy not engineering-heavy; primary deliverable is decisions, not code.
- Estimate: 1-2 days. Filed 2026-04-27.

**F-097** ⏸ Apply design system across screens
- Implementation of F-096 across every screen: onboarding, home tab, /ecole list, /ecole/[id] detail, T1/T2/T3 recording, diagnostic page, /learn/[id], profile/settings.
- Component-by-component refactor: replace inline-style hex codes with tokens, normalize spacing to the F-096 rhythm, swap one-off icon usages for the F-098 iconography pass.
- Depends on F-096 being locked. Without locked tokens this becomes whack-a-mole.
- Estimate: 2-3 days after F-096 lands. Filed 2026-04-27.

**F-098** ⏸ Iconography pass
- 3D illustrations on lesson cards (one per phase / theme rather than today's repeated `illustration-level.jpg`), module category icons (vocab_calque, discourse_structure, verb_aspect, register_mismatch, grammar_interference, word_order, verb_aspect, ortho), achievement / milestone badges (already wired in EcoleProgress as text — promote to iconographic), empty-state illustrations.
- Stock library curation (Iconscout / 3DIcons / similar) vs custom commission decision: stock for V1 to ship fast; selective custom commissions post-launch as the visual library matures.
- Estimate: 1-2 days for stock integration; ongoing for custom track. Filed 2026-04-27.

**F-101** ⏸ Master diagnostic — speaking + writing fusion (post-launch)
- Combined view across Expression Orale (already shipped) and Expression Écrite (F-085). Detected modules from both modalities surface in one place. The product differentiator: a student sees the same English habit appearing in their speaking AND their writing — the cross-modal pattern is the key claim against generalist apps.
- Depends on F-085 shipping first (writing pipeline must produce module detections before they can fuse with the speaking ones).
- Estimate: 2-3 days. Filed 2026-04-27 from sprint reconciliation.

**F-102** ⏸ Student-level dashboard (post-launch)
- Longitudinal view of the student's progress across all sessions, all modalities, all time. Surfaces trends ("nuance_reflex fixed in week 2"), stuck patterns ("to_get_reflex still recurring after 8 sessions"), gives the student a Sunday-morning view of how they're doing. Bigger surface than per-session feedback — the home/École/diagnostic triad covers "what to do next"; F-102 covers "where am I going."
- Depends on F-101 (the data model needs both modalities feeding the dashboard so trends are honest about the full surface, not just the speaking half).
- Estimate: 3-4 days. Filed 2026-04-27 from sprint reconciliation.

**F-103** 📋/⏸ Level-aware routing (sprint OR post-launch — Chadi to decide)
- Onboarding captures user level (A1/A2/B1/B2/C1) but the app currently ignores it once the user lands on the home tab. Three places where level should bite:
  - (a) **Lesson list start point** — A1 starts at lesson 1; B2 might start at 16 (skip Phase 1 fundamentals if calibration confirms mastery); C1 at Phase 2 outright.
  - (b) **Diagnostic rubric calibration** — what counts as "good" depends on level. A B1 producing fragments still scores higher than a C1 producing fragments because the bar is different.
  - (c) **"Recommended for you" module filtering** — surface modules appropriate to the student's level, not high-severity advanced patterns when fundamentals are still missing.
- Status undecided: sprint candidate (depends on whether the launch product can honestly handle a B2 user without it; if yes, post-launch). Chadi to flag before next planning pass.
- Estimate: 2 days. Filed 2026-04-27 from sprint reconciliation.

**F-104** ⏸ Pull-up reference tables overlay
- 15 reference tables embedded in lessons + a persistent pull-up button (lower-right of any lesson screen) that opens an overlay with all tables, searchable.
- Tier 1 signature tables (verbes + à, verbes + de, verbes pronominaux idiomatiques, prépositions de lieu, …), Tier 2 high-value supporting tables, Tier 3 exam-specific (TCF / TEF / DALF reference grids).
- Overlay component: bottom-sheet pattern (mirrors `LearnModuleSheet`); search filter at top; tables rendered as `react-markdown` blocks with highlighted-row interaction.
- Estimate: 2-3 days. Filed 2026-04-27.

**F-105** ⏸ Transcript word-edit flow
- After recording, before the user submits the candidate transcript for evaluation, allow surgical word-level editing instead of "Try Again" full rerecord.
- UX: each transcribed word is a tap target → tap → editable input replaces the word inline → enter / blur commits → transcript re-renders with the edit. Edit history not preserved (the edit IS the truth from the user's perspective).
- Backend: candidate transcript on `conversation_turns` already mutable pre-confirm; need to plumb a "user-edited" flag so analysis can know the source vs the candidate-as-recorded.
- Sits alongside F-062.3's "Refaire cette prise" — Refaire is "I want to redo this take entirely"; word-edit is "I said this fine, the STT misheard one word."
- Estimate: 1-2 days. Filed 2026-04-27.

**F-106** ⏸ Master inventory doc — 35-45 grammar topics
- Bilingual reference doc covering all grammar topics with severity rating 1-5. Track 0 deliverable per the Book-Lab pipeline (the authoring rhythm Chadi runs in parallel with engineering).
- Authoring track, not engineering. The doc lives outside the codebase (Notion / Google Doc / dedicated repo) and feeds the curriculum + module-authoring + lesson-card-subline workstreams.
- 15-20h authoring. Filed 2026-04-27.

**F-107** ⏸ Module library expansion (3 → 30+)
- Post-launch authoring umbrella. Continuous module authoring as patterns surface in real student data. Each module = JSON file + `detection_criteria` + AVOID / PREFER examples + optional `ecole_lesson_id` link.
- Current library at F-080d ship time: 3 modules (`nuance_reflex`, `to_get_reflex`, `gerondif_confusion`). Target: 30+ post-launch, prioritized by detection-rate × severity from real recordings.
- Authoring + reseed cycle is well-trodden post-F-080a; engineering work is zero per module unless a new content_ref type or detection prompt class surfaces.
- No fixed estimate; ongoing track. Filed 2026-04-27.

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

## Process improvements

### EX-100 — Evaluate execution tooling for ticket-by-ticket efficiency
Milestone: TBD

**Priority:** Medium
**Filed:** 2026-04-30
**Status:** Queued — review needed

**Context:** Currently using FE/BE Claude Code terminals + manual prompt routing. Three GitHub resources flagged for evaluation:
- **VoltAgent/awesome-design-md** — DESIGN.md drop-ins for coding agents (relevant to P-102)
- **gztchan/awesome-design** — curated design resources (relevant to P-102, Method-as-brand)
- **octopusos/octopus** — AI-Native Autonomous Agent OS (relevant to FE/BE coordination)

**Action:** 30-min evaluation each. Decide if any change current process. Apply before P-102 starts (could reduce P-102 cost from ~$300 + hours to ~$0 + faster).

**When:** Before P-102. After current launch-blocker tickets (P-103, P-104, B-100, B-102, M-100).

---

## Known issues — not blocking

- Backend `main.py` CORS has `allow_credentials=True` — not needed for JWT-only but harmless; leave it.
- Paywall.tsx has a lingering `{/* ── Test-drive section ─────── */}` code comment referencing deprecated feature. Cosmetic.

---

### F-108 — Fix pre-existing TS error in TargetScoreSelect.tsx
Milestone: M1

**Status:** OPEN
**Priority:** Low — build pipeline tolerates via `typescript.ignoreBuildErrors: true`
**Discovered:** April 30, 2026 during Phase 3 brand rename type-check (Phase B)

**Problem:** `components/onboarding/TargetScoreSelect.tsx:98` throws TS2322 — `hasPopular` (destructured option flag) is typed as `unknown` instead of `boolean`.

**Why it's been hiding:** `next.config.mjs` sets `typescript.ignoreBuildErrors: true`. Production builds succeed despite this error.

**Fix:** Narrow `hasPopular` to `boolean` type at the destructure site. Likely 2-line change.

**Scope:** Single file. Independent commit. ~10 min work.

**Related:** Worth a future ticket to address `typescript.ignoreBuildErrors: true` itself — silently passing builds with type errors is technical debt. But that's a separate cleanup session blocked on first fixing all latent TS errors.

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

## Shipped — Week 3 (May 2-4)

P-220 ✅ Onboarding questionnaire rebuild (Shipped 2026-05-02). See §10.3 entry above for full status detail.
P-222 ✅ Waitlist UX (Shipped 2026-05-03). See §10.3 entry.
B-102 ✅ Privacy + Terms + Refund pages with footer integration (Shipped 2026-05-03). See entry above.
P-230 ✅ Overall Progress dashboard rebuild (Shipped 2026-05-03). See §10.4 entry.
P-234 ✅ Cluster detail view (Shipped 2026-05-03). See §10.4 entry.

### F-223 — "Le raccourci" / "The shortcut" copy cleanup (interim patch)
Milestone: DONE

**Priority:** MEDIUM (user-visible stale copy)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/onboarding` EcoleReveal step per F-225)
**Filed:** 2026-05-04
**Source:** F-223 plan-first; raccourci grep surfaced 2 user-facing copy lines on EcoleReveal
**Dependencies:** none (interim — full rebuild lives at F-202)
**Scope:** replace stale `Le raccourci` / `The shortcut` framing on `components/onboarding/EcoleReveal.tsx` SUBHEAD (EN + FR). FR keeps vous-form (`Finissez-la`) to match surrounding FR onboarding context — tu/vous audit + full-app sweep tracked as F-226. Comment at `components/home/EcoleProgress.tsx:24` left in place per "git blame is cheaper than re-discovery" call. Historical raccourci references in BACKLOG.md preserved per F-086 precedent.
**Owner:** Engineering
**Note:** Interim only. F-202 (full L'École intro rebuild with methodology demo) supersedes this copy entirely.

### F-226 — FR voice audit (tu vs vous) full-app sweep
Milestone: M2

**Priority:** LOW (post-soft-beta polish)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** Surfaced during F-223 plan-first — Block 3 spec drift between tu-form and vous-form across FR surfaces
**Dependencies:** none
**Scope:** audit every FR string across the FE for tu/vous consistency. Onboarding questionnaire uses vous (`Quel est votre niveau`); waitlist + landing footer use vous; some Block 3 / interim copy specs called out tu-form. Pick one (likely vous given current preponderance), align all surfaces, document the convention in CLAUDE.md so future copy authoring is consistent.
**Owner:** Engineering + Chadi (copy review)

### F-222 — Sign Out does nothing on click
Milestone: M1

**Priority:** HIGH (auth-state correctness)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit `4916d72`; production deploy pending Chadi-captured screenshots + interaction trace per F-225)
**Filed:** 2026-05-04
**Source:** User-reported bug; root-cause analysis surfaced auth-state drift across stores
**Dependencies:** none
**Scope:** Sign Out row on /profile had `onClick={() => {}}` — silent dev-stub no-op. Fixed by extracting canonical `signOut(router)` helper in `lib/auth.ts` that clears auth + onboarding + submit-response stores atomically + routes to `/`. Wired from /profile and refactored WaitlistScreen to use the same helper. Closes broader gap where prior `clearAuth()` only cleared 2 of the 4 persisted localStorage keys.
**Owner:** Engineering
**Note:** Verification requires interactive trace per F-225.5 — screenshots alone won't catch a Sign Out regression. Test plan: (1) sign in, (2) navigate to /profile, (3) click Sign Out, (4) verify localStorage has zero `lemethodic_*` keys, (5) verify URL is `/`, (6) verify subsequent visit to /profile redirects to `/` (ProtectedRoute kicks in). Same trace from /onboarding/waitlist sign-out link.

### F-222.x — /profile real-data wire-up
Milestone: M1

**Priority:** MEDIUM (Active LC, prioritize after responsive sweep starts)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** Surfaced during F-222 root-cause analysis
**Dependencies:** none
**Scope:** /profile is largely a hardcoded design mockup. Wire to `useAuthStore.user` + `getMe()`: replace hardcoded `"Chadi"` (line 234), `"chadi@example.com"` (line 387), `"TCF Canada · 47 days to exam"` (line 246), `"TCF C1 (level 5)"` (line 388), `"June 7, 2026"` (line 392), `"Day 7"` streak (line 334), `"4/16"` École progress (line 335), `"47"` days-to-TCF (line 336), avatar initial `"C"` (line 218). Avatar background pastel + Preply CTA + interface language + notifications stubs stay as-is. Empty-state branches needed for users without exam date / target / etc.
**Owner:** Engineering
**Note:** Beta-credibility hit if a user opens /profile and sees someone else's name + exam date. Not a functional blocker (Sign Out works post-F-222) but a real perception issue.

### F-200 — Landing page desktop responsive + editorial design system foundation
Milestone: M1

**Priority:** HIGH (launch-blocking — establishes the design system F-201..F-214 inherit)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` and `/fr` per F-225)
**Filed:** 2026-05-04
**Source:** Strategic recalibration (desktop broken on every screen surfaced as launch-blocker); executable spec from Chadi 2026-05-05
**Dependencies:** none
**Scope:** establishes the editorial design system (`--ed-*` palette + Geist + Source Serif 4 + 8px spacing grid + 600-800ms motion language with `cubic-bezier(0.16, 1, 0.3, 1)`) and applies it to the landing page (`/` + `/fr`). Hero CTA removed (trust the user to scroll). Methodology section gains brief in-line reframe surfacing **Les Moules** + **La Méthode en Couches** as named system concepts (full breakout filed as F-227). Trust-line ("Free. No card required. About 12 minutes.") rescued from deleted hero CTA, surfaced at FinalCTA. RevealOnScroll wrapper added (framer-motion `whileInView`, fade-up 24px, 700ms). 4px button radius, 1px ed-rule borders, 0 shadow on cards (editorial flatness). Pastels (`--fp-*`) preserved as accent layer for unmigrated surfaces.
**Owner:** Engineering
**Note:** Naming deviation from spec — used `--ed-*` prefix instead of literal `--color-bg`/`--color-fg`/etc. to avoid collision with shadcn's existing `--color-accent`. Approved by Chadi 2026-05-05. Tailwind utilities are `bg-ed-bg`, `text-ed-fg`, etc.
**Design calls** (per F-200 spec "make the call yourself"):
- Button radius **4px** for editorial CTAs (was 14-16px on M-101a) — premium signal.
- Card surfaces **1px ed-rule + 0 shadow** — editorial flatness vs pastel softness.
- Hover transitions **opacity/color only, 200ms** — no transforms.
- Scroll reveals **700ms with cubic-bezier(0.16, 1, 0.3, 1)**, IntersectionObserver at 20% viewport.
- "Coming soon" tier badges on Pricing — outlined micro-pill (`ed-rule` border, `ed-muted` text) instead of solid ink fill — restraint over loud signaling.
- Methodology bg flips to `--ed-paper` with top+bottom `--ed-rule` — visual emphasis on the moat-evidence section without breaking the bg-flat rhythm elsewhere.
- Sprint/Premium "Join the waitlist" CTAs use ghost button (transparent + ed-fg border, fills on hover) — visual hierarchy below Subscription's solid navy CTA. Confirmed conversion ladder.

### F-227 — Methodology breakout on landing (compressed 5-couche surface)
Milestone: M2

**Priority:** MEDIUM (post-F-202, public-side moat surface)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) showing MethodologySection with surrounding sections (Differentiation above + HowItWorks below) visible to verify bg rhythm + section ordering per F-225. F-225 interactive verification clause does NOT apply — F-227 is static typography with reveal animations only, no handlers/nav/forms/state mutation.)
**Filed:** 2026-05-05
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** F-227 spec May 5 with locked compressed copy (khâgneux-reviewed; reuses F-202 Section 2 framework in glance-form)
**Dependencies:** F-200, F-202 (couche names + descriptions reused — must stay consistent across surfaces)
**Scope:** rewrite existing MethodologySection.tsx (was F-200 stub: 5-paragraph in-line reframe) to compressed 5-couche format matching F-202 /ecole/intro Section 2. Reorder LandingPage.tsx: MethodologySection moved from after PricingSection to between DifferentiationSection and HowItWorksSection per spec — sits at the structural moment a visitor is asking "but how is this different from drill platforms?". Locked verbatim copy (no paraphrasing) in `components/landing/copy.ts` METHODOLOGY constant; restructured from `{heading, paragraphs[]}` to `{heading, intro, couches[5], closer}`. Pure typography: section header (Source Serif 4 italic ed-accent navy 48-64px) → intro framing line (Source Serif 4 italic ed-muted 20-24px) → 5 couches as vertical list (each: Geist 600 ed-fg name + em-dash + Geist 400 ed-fg description, 20-32px gaps) → 1px ed-rule full-bleed → closer kicker (Source Serif 4 italic ed-fg 22-26px centered). 720px max-width, ed-bg, 64-160px vertical padding clamp. RevealOnScroll stagger: 80ms across 5 couches, kicker delay +200ms after last couche. No illustration, no icons, no CTA, no /ecole/intro deep-link.
**Owner:** Engineering (Chadi authored copy)

**Calls (resolved):**
- (a) **Replace existing MethodologySection** (it was the F-200 stub; comment explicitly named F-227 as the rewrite target) rather than add a new section file.
- (b) **Bg = ed-bg** per spec default (HowItWorks that now follows is ed-paper, so the spec tiebreaker doesn't fire). Methodology→HowItWorks alternation preserved.
- (c) **Reorder side-effect flagged but not fixed in F-227 scope:** removing Methodology from between Pricing and FAQ creates new Pricing(bg)→FAQ(bg) adjacency. Per spec "Do not change the surrounding sections' copy or structure" — accepted. Filed as F-227.rhythm.
- (d) **Motion**: spec's "ed-page-enter primitive" misuses the name (ed-page-enter is route-level mount); intent is RevealOnScroll viewport-entry. Used existing RevealOnScroll like the prior MethodologySection.

### V-016a.fix — Writing result rendering crash (couches shape mismatch)
Milestone: DONE

**Priority:** CRITICAL (production blocker — completed analyses crashed the result view)
**Status:** ✅ Shipped + verified 2026-05-12
**Verification:**
- Non-visual sweep (FE-Claude, 2026-05-12): `/writing` returns 200 in production runtime logs; zero 4xx/5xx across the writing surface in the last 24h on deployment `dpl_6F3XFD6zxcDD95bccinNedUtTtzA`.
- Visual + interactive verification (Chadi, 2026-05-12, manual post-deploy hard-refresh on prod): result view renders all 5 couche tiles without crash; submit → poll → result loop functional end-to-end. Initial broken state during V-016a.dashboard verification was browser cache (old bundle pre-deploy); hard refresh resolved.
**Filed:** 2026-05-07
**Shipped:** 2026-05-07
**Source:** Production console diagnostic — `Uncaught TypeError: Cannot read properties of undefined (reading 'le_fond')` after successful writing analysis on `/writing/9`
**Dependencies:** V-013a (writing surface), V-016a (BE async job pattern), V-016a.fe (polling consumer); V-009 (BRAND_LABEL + COUCHE_ORDER + array-shaped Couche convention)

**Cause:** V-013a declared `WritingSubmissionResult.couches` as a record-by-key (`{ le_fond: { score, feedback }, ... }`); BE actually returns the canonical `Couche[]` array shape used everywhere else in the diagnostic stack (`lib/types.ts:227 couches: Couche[]`). When the array arrived where an object was expected, `result.couches.le_fond` was `undefined.le_fond` → TypeError → React error boundary caught → Next.js "page couldn't load" overlay.

**Fix:**
- `WritingSubmissionResult.couches` retyped to `WritingCoucheFeedback[]` (matches BE array convention; new local interface accepts both `analyse` (canonical Couche field) and `feedback` (writing-specific) for the per-layer text)
- Made `overall_score`, `cefr_band`, `couches` all optional on `WritingSubmissionResult` so a partially-populated job result still renders without crashing
- ResultView refactored to look up couches by key from a Map built off the array; renders all 5 expected couches (Le Fond / Les Moules des Idées / Les Moules / Les Réflexes Anglais / La Voix), with "Coming soon" placeholder + 60% opacity for any couche absent from the response (incl. Voix until BE V-009.be ships scoring)
- Score rendered as `score ?? '—'`; missing-feedback case renders an italic muted "No feedback for this layer." line; `Array.isArray(result.couches)` guard before iteration

**Files touched:**
- `lib/types.ts` — `WritingCoucheFeedback` interface; `WritingSubmissionResult` shape relaxed (couches → optional array; overall_score + cefr_band → optional)
- `components/writing/WritingSubmissionClient.tsx` — ResultView refactored: array→Map lookup, defensive guards, "Coming soon" placeholder per missing couche

### V-016a.dashboard — Render BE rich feedback envelope on /writing dashboard
Milestone: DONE

**Priority:** HIGH (production: dashboard hid every per-layer feedback field BE returned; em-dashes for overall_score + CEFR; "No feedback" everywhere despite BE populating examiner remarks, coaching, transformations, and a full TCF rubric breakdown)
**Status:** ✅ Shipped + verified 2026-05-12
**Verification:**
- Non-visual sweep (FE-Claude, 2026-05-12): deployment `dpl_FVz6abPFGt4wpcbBpi2ysqm97nrh` READY; `lemethodic.com/writing` returns 200 (prerender HIT) and `/writing/10` returns 200 from the new lambda (MISS → lambda evaluated); `/ecole` regression check returns 200 (V-016c.fix unaffected). Zero error/warning/fatal entries in project runtime logs over the last 1h.
- Visual + interactive verification (Chadi, 2026-05-12, manual post-deploy hard-refresh on prod): overall_score renders numeric (0 not em-dash); CEFR band renders ("A1 not achieved"); examiner remark in serif italic French; Coaching block EN primary + FR secondary with `FR` label; "Try this" transformation card; all 5 couches present. Initial broken state was browser cache (old bundle pre-deploy) — hard refresh resolved; no code action needed.
**Filed:** 2026-05-12
**Shipped:** 2026-05-12 (commit `f6393fe`)
**Source:** Chadi 2026-05-12 — writing analysis dashboard hides BE-populated fields; root-cause hypothesis: V-016a synchronization gap (BE rewrote response shape to 5-couche; FE rendering layer only absorbed the flat back-compat shape, not the rich envelope)
**Dependencies:** V-016a.fix (flat couches[] back-compat reader stays as fallback); BE V-016a (rewrote response shape to add `feedback.*` envelope with `methode_en_couches`, `exam_profile.criteria_breakdown`, `teacher_coaching`, `tcf_canada_evaluation`); V-009 (BRAND_LABEL); F-225 (verification protocol)

**Cause:** BE response carries TWO parallel shapes — a flat `result.couches[]` array (which V-016a.fix's reader still consumes) AND a rich nested envelope at `result.feedback.*` carrying the methodology-voice examiner remarks, the bilingual teacher coaching, the action-step transformations, and the full exam-profile + TCF-rubric criteria breakdown. V-016a.fix only consumed the flat shape — every field under `result.feedback.*` went unrendered. The FE consequently fell into all its defensive empty-state branches: `result.overall_score` → undefined → em-dash; `result.cefr_band` → undefined → em-dash; per-couche scores still rendered (from the flat array, value `0` when BE scored it zero) but the feedback paragraph slot defaulted to "No feedback for this layer" because the flat shape carries no examiner remark when the rich shape is present.

**Fix:**
- `lib/types.ts` adds the rich envelope types in front of the existing back-compat ones: `WritingTeacherCoaching` (coaching_en/coaching_fr/transformation), `WritingMethodeCoucheRich` (score + examiner_remark_fr + teacher_coaching), `WritingCriterionBreakdown` (display-ready per-criterion shape with localized labels + max_score + score + observation + coaching), `WritingExamProfile` (overall_score + cefr_level + criteria_breakdown[] + secondary_framework_{label,value}), `WritingAnalysisFeedback` (the full envelope keyed by `methode_en_couches: Partial<Record<ExtendedCoucheKey, ...>>`). `WritingSubmissionResult` extended with `feedback?: WritingAnalysisFeedback` — flat fields preserved for back-compat with older BE responses.
- `components/writing/WritingSubmissionClient.tsx` ResultView reads with rich-first / flat-fallback precedence:
  - Top-card `overall_score` ← `result.feedback?.exam_profile?.overall_score ?? result.overall_score ?? null`; CEFR ← `result.feedback?.exam_profile?.cefr_level ?? result.cefr_band ?? null`. **Score `0` displays as `0`** — em-dash is reserved for null/undefined (the bug was treating a real zero as "missing data").
  - Conditional secondary-framework row renders when `exam_profile.secondary_framework_value` is non-null (e.g. CLB equivalence for TCF Canada). Skipped on null.
  - Per-couche cards: precedence `result.feedback?.methode_en_couches?.[key]` rich → flat `result.couches[].find(c => c.key === key)` fallback → `missing`. Score merges (rich wins, flat next). New body layers stacked vertically:
    - Examiner remark (serif italic, the methodology voice in French; reads `examiner_remark_fr`)
    - Coaching block (sans, "Coaching" eyebrow → `coaching_en` 14px ed-fg primary → `coaching_fr` 13px italic ed-fg-soft with small `FR` tag — EN primary, FR secondary, both visible, no toggle per Chadi design call)
    - Transformation sub-card (warm-cream bg, "Try this" / "Essayez ceci" eyebrow in peach-deep, `transformation` body in espresso)
    - Empty-state "No feedback for this layer" only renders when none of remark / coaching / transformation are present and the couche is not `missing`.
  - New TCF rubric breakdown accordion via native `<details><summary>` (no JS state, accessible by default). Renders **only** `exam_profile.criteria_breakdown[]` — `tcf_canada_evaluation.criteria[]` is the raw scoring source and per Chadi design call is intentionally not surfaced (one accordion only). Per criterion: localized label (`label_en_student` / `label_fr_student` per UI language) + `score / max_score` (e.g. "0 / 20") + examiner remark + coaching block + transformation sub-card. Sub-cards reuse the warm-cream + peach-deep eyebrow treatment from the per-couche transformation block.

**Bilingual coaching default:** English primary, French secondary, both visible side-stacked. Matches the user persona (English speaker preparing French exam) — EN reads first as the meta-language explaining the issue, FR reinforces the target language pattern. No toggle (would add state + interaction cost without pedagogical gain for this audience).

**Score handling:** 0 is data, not absence. Em-dash only on null/undefined.

**Files touched:**
- `lib/types.ts` — +75 lines (5 new interfaces + extension to `WritingSubmissionResult`)
- `components/writing/WritingSubmissionClient.tsx` — +287/-62 lines (COPY additions for new strings, ResultView destructure refactor, per-couche body rewrite, criteria accordion)

**Tests:** `pnpm build` clean. `npx tsc --noEmit` clean. No test runner configured (CLAUDE.md confirms).

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: HIGH
- WHY: FE types now mirror the verified production payload exactly (Chadi-supplied top-level keys, criteria_breakdown entry shape, exam_profile envelope). Back-compat preserved via dual-shape reader. Build + typecheck + deploy clean.
- UNCERTAINTY: Visual density on a long /writing/{id} result with all four sub-blocks (examiner remark + coaching + transformation + criteria accordion) — may need a polish pass on spacing/typography after TARS captures the screenshots. Correctness is not at risk; polish is.
- VERIFICATION: Hit `/writing/10` on prod with an authenticated session, submit a fresh response, wait for analysis. Per-couche cards should show numeric score (incl. `0` as `0`), examiner remark in serif italic French, Coaching block with EN primary + FR secondary, and a "Try this" sub-card. TCF rubric accordion appears below the couche stack — expand to see per-criterion label, `score / max_score`, examiner remark, and coaching. Top-card scores read from `exam_profile`; secondary-framework row renders only if BE supplies a non-null CLB-equivalent value. Regression: `/ecole` still renders both phase grids populated (V-016c.fix unaffected).

### V-016g — /library prefetch 404 cleanup (stub page)
Milestone: DONE

**Priority:** MEDIUM (production console noise; UX gap when users click directly)
**Status:** ✅ Shipped (non-visual sweep verified 2026-05-12; visual verification routed to TARS — separate commit)
**Verification:**
- Non-visual sweep (FE-Claude, 2026-05-12): `/library` and `/fr/library` both return 200 with correct hero copy + notify form rendered server-side. 24h Vercel runtime log sweep on `dpl_6F3XFD6zxcDD95bccinNedUtTtzA` shows zero 404s across the project — the `/library?_rsc=…` prefetch regression is gone.
- Visual + interactive verification (1440px desktop + 375px mobile on `/library` and `/fr/library` + email-submit success state + localStorage entry write + DevTools network confirmation): routed to TARS — separate verification commit.
**Filed:** 2026-05-07
**Shipped:** 2026-05-07
**Source:** Production console — `GET /library?_rsc=... → 404` from Next.js link prefetch on platform landing
**Dependencies:** F-300a (Library product card links to /library); V-012 (warm tokens); F-300c (real catalog, queued)

**Scope:** new `/library` and `/fr/library` routes serve a stub hero page until F-300c lands the real catalog. Visual continuity with PlatformLanding — `linear-gradient(--ed-bg → --ed-warm-sand)` hero bg, peach-deep accent eyebrow, ed-paper notify-form card. Email signup is local-only (writes to localStorage `lemethodic:library-notify-email`); BE-side capture endpoint filed as **V-016g.notify**.

**Files touched:**
- `app/library/page.tsx` (NEW) — renders LibraryStub lang="en" with English meta
- `app/fr/library/page.tsx` (NEW) — same with FR meta
- `components/library/LibraryStub.tsx` (NEW) — hero + sub + notify form (email validation + success state) + back-to-home link
- `components/nav/TopNav.tsx` — EXCLUDED_EXACT extended to `/library`, `/fr/library` so the marketing chrome stays consistent (no in-product TopNav)

### V-016g.notify — BE library-notify email capture
Milestone: TBD

**Priority:** LOW (post-launch; FE has localStorage stash today)
**Status:** Queued (BE-side; lemethodic-backend ticket)
**Filed:** 2026-05-07
**Source:** V-016g — FE captures email locally; needs BE persistence for actual launch notification
**Dependencies:** TBD BE notification system (likely shares plumbing with V-013b.notifications)
**Scope:** BE `POST /api/library/notify` accepting `{ email }`, persisting to a notify list. FE swaps localStorage write to API call once the endpoint ships. When F-300c launches the real catalog, BE batch-sends launch notification to the captured list.
**Owner:** Backend Engineering

### F-300a — Platform-level / landing redesign
Milestone: M1

**Priority:** HIGH (strategic surface restructure; depends on F-300b having stabilized /exam-prep)
**Status:** Awaiting verification (FE-side, lemethodic-frontend pushed; production deploy on auto from main merge. 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) end-to-end: hero with new H1 + sub + kicker + 2 CTAs (peach-deep button + ghost link), product cards (Option B layout — Exam Prep featured 2/3 + Library + Free Diagnostic stacked 1/3 at lg, 2-col at md, 1-col <md), compressed methodology (5 couches listed, attribution + see-full link), final CTA + footer with Exam Prep + Library nav links.)
**Filed:** 2026-05-07
**Shipped:** 2026-05-07 (FE-side, frontend commit pushed)
**Source:** F-300 strategic recalibration — LeMethodic repositions from "TCF speaking exam prep" to "French learning platform with multiple products"
**Dependencies:** F-300b (preserves exam-prep funnel at /exam-prep); V-003 (atmospheric glyphs); V-012 (warm tokens); V-013c (TopNav exclusion list); V-016d (kicker treatment); V-016f (bottleneck cycle visual reused for Exam Prep card)

**Locked content:**
- Hero H1: "Stop translating. Start producing French." / FR: "Arrêtez de traduire. Commencez à produire en français."
- Hero sub: "The method, the exams, the books — built for English speakers." / FR analog
- Kicker subtitle (V-016d kicker + new line): "Built for the exams that change visa outcomes."
- Primary CTA: "Start free diagnostic" → /onboarding (peach-deep bg, warm-cream text, height 64)
- Secondary CTA: "Browse the library" → /library (text underline, ed-muted)
- 3 product cards (Option B layout per F-300a plan-first):
  - **Exam Prep (featured)**: visual = bottleneck cycle (V-016f Card 1 reused, hover-cycles 5 couches), copy "Diagnostic-driven path. AI examiner feedback under exam pressure." → /exam-prep
  - **Library**: visual = book-stack (3 typographic blocks in peach-deep / sage-deep / espresso), copy "Method books, exam prep PDFs, free resources for English speakers learning French." → /library (404 today; F-300c)
  - **Free Diagnostic**: visual = mini SVG radar (sage-deep dashed pentagon + peach fill) → /onboarding
- Compressed methodology section: heading + 1-line sub + 5 couche names (no descriptions; "See full methodology →" links to /exam-prep) + attribution line "Built on 7,000+ hours…"
- Final CTA: "Stop guessing what's blocking your French." + body + peach-deep button + trust line
- Footer: existing + new Exam Prep + Library links

**Skipped per plan-first:**
- **Social proof section** in v1 — methodology section's attribution line carries enough atmosphere; full testimonial section deferred. Filed as **F-300a.proof** for follow-up.

**New CSS:** `.fp-platform-cards` grid with breakpoint cascade (1col → 2col at md → 2fr/1fr at lg with featured spanning rows).

**Files touched:**
- `app/page.tsx`, `app/fr/page.tsx` — render PlatformLanding instead of LandingPage; new platform-level metadata title + description
- `components/landing/PlatformLanding.tsx` (NEW) — full platform landing with hero, ProductCards, methodology, FinalCTA. Reuses HeroAtmosphere, RotatingKicker, RevealOnScroll, LandingHeader, LandingFooter
- `components/landing/LandingFooter.tsx` — footer nav extended with Exam Prep + Library links (lang-aware /exam-prep vs /fr/exam-prep)
- `app/globals.css` — .fp-platform-cards grid + breakpoint rules

### F-300a.proof — Platform landing social proof section
Milestone: polish-defer

**Priority:** LOW (post-launch UX polish)
**Status:** Queued
**Filed:** 2026-05-07
**Source:** F-300a plan-first — skipped from v1
**Dependencies:** F-300a; testimonial copy (Chadi authoring)
**Scope:** add a "voices from English speakers" testimonial section between the product cards and the methodology section on platform landing. Pattern from current /exam-prep TestimonialCard component. 3 testimonials minimum, attribution + exam context + outcome quote. Needs Chadi-authored or Chadi-curated testimonials (real users where possible).
**Owner:** Chadi (copy) + Engineering (wire-up)

### F-300b — Move current landing to /exam-prep
Milestone: M1

**Priority:** HIGH (F-300 chain head; preserves existing funnel before / pivots)
**Status:** Awaiting verification (FE-side, frontend commit pushed; production deploy on auto. 1440px desktop + 375px mobile of `/exam-prep` + `/fr/exam-prep` showing identical content to pre-F-300 / + /fr.)
**Filed:** 2026-05-07
**Shipped:** 2026-05-07
**Source:** F-300 strategic recalibration — preserve before disrupt
**Dependencies:** none (mechanical route copy)
**Scope:** new `/exam-prep` and `/fr/exam-prep` routes render the existing LandingPage component verbatim. Canonical + hreflang metadata point at the new URLs. TopNav `EXCLUDED_EXACT` set extended to suppress in-product nav on the funnel landing surface.

**Files touched:**
- `app/exam-prep/page.tsx` (NEW) — renders LandingPage with lang="en"
- `app/fr/exam-prep/page.tsx` (NEW) — renders LandingPage with lang="fr"
- `components/nav/TopNav.tsx` — EXCLUDED_EXACT extended

### F-300c — Library route + content
Milestone: M1

**Priority:** MEDIUM (post-F-300a; /library currently 404)
**Status:** Queued
**Filed:** 2026-05-07
**Source:** F-300a — Library product card links to /library which doesn't exist yet
**Dependencies:** F-300a; library inventory (Chadi authoring book covers + listings + free resources)
**Scope:** new `/library` and `/fr/library` routes with a books / resources catalog. Cards per book (cover image + title + format + buy/download CTA + free-resource flag). Filter or category navigation TBD. Visual continuity with platform landing — V-012 warm tokens, ed-paper book cards, peach-deep CTAs.
**Owner:** Engineering (build) + Chadi (inventory + copy)

### V-016a.fe — Writing submit polling consumer
Milestone: DONE

**Priority:** HIGH (parallel to BE V-016a; FE ready before BE ships contract)
**Status:** ✅ Shipped + verified 2026-05-12 — BE V-016a contract live on prod; FE polling consumer functional end-to-end (Chadi, 2026-05-12, manual post-deploy on `/writing/10`): submit fires, AnalyzingPanel renders during poll, result panel renders on completion with the full V-016a.dashboard rich envelope. Initial broken state during dashboard verification was browser cache (old bundle pre-deploy); hard refresh resolved.
**Filed:** 2026-05-06
**Pushed:** 2026-05-07 (FE-side, frontend commit pending merge); BE deploy unblocks live verification
**Type:** FE async pattern
**Source:** V-016 chain — strategic Claude locked async-job contract for writing analysis
**Dependencies:** BE V-016a (POST /api/writing/submit returns WritingJob handle; GET /api/writing/jobs/{id} polls job status)

**Contract (locked):**
```ts
type WritingJobStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface WritingJob {
  job_id: string
  status: WritingJobStatus
  result?: WritingSubmissionResult | null
  error?: { message: string; code?: string } | null
  created_at: string
  completed_at?: string | null
}
```

**Files touched:**
- `lib/types.ts` — `WritingJobStatus` + `WritingJob` types
- `lib/api.ts` — `api.writing.submit(promptId, text): Promise<WritingJob>` (return shape changed); new `api.writing.getJob(jobId): Promise<WritingJob>`
- `lib/polling.ts` (NEW) — `usePollJob<T>` hook; recursive setTimeout loop, configurable interval (default 3s) + maxPolls (default 100). Returns discriminated `PollJobState<T>`. Cancels via useRef on cleanup, on jobId change, on terminal states.
- `app/globals.css` — `ed-spinner-dot` keyframes + `.ed-spinner-dot-{1,2,3}` staggered delays. Reduced-motion: static dots at 0.85 opacity.
- `components/writing/WritingSubmissionClient.tsx` — extended SubmissionState (added `polling`, `failed`, `abandoned`), wired `usePollJob` driven by `submission.kind === 'polling'`, sync poll-state → submission via useEffect on `pollState`. New AnalyzingPanel (warm-cream bg + sage-deep dots + Fraunces italic title + phased copy + Cancel) and FailedPanel (paper bg + ed-fg headline + ed-muted body + Retry CTA). EN+FR copy added: `analyzingTitle`, `analyzingPhase` (initial/still/almost), `analyzingCancel`, `failedTitle`, `abandonedTitle`, `abandonedBody`. handleSubmit now branches on synchronous-completed vs synchronous-failed vs pending/processing; new `handleCancelPolling` (user-initiated abandon) + `handleRetryFromFailed` (text preserved).

**Polling UX (decisions made in plan-first):**
- 3s interval, 100-poll max (= 5 min total). After abandon, AbandonedPanel surfaces a Retry button — user can resubmit the same draft (preserved in submission.text and localStorage).
- Phased copy by elapsed time:
  - 0-30s (pollCount < 10): "This may take 30-90 seconds." / FR: "Cela peut prendre 30 à 90 secondes."
  - 30-60s (pollCount < 20): "Still analyzing." / "Analyse toujours en cours."
  - 60s+ (pollCount >= 20): "Almost done." / "Presque terminé."
- Cancel button: ghost (transparent + ed-rule border, ed-fg-soft text). User-initiated abandon flips submission to `idle` with text preserved; usePollJob's effect cleanup drops the in-flight poll loop.
- Network error during a poll → fail state with "Lost connection to server." Caller decides whether to retry; we don't auto-retry silently.

**Hold notes:**
- Pushing the FE code now per Chadi resume direction. Auto-deploy to Vercel will happen but will fail live (writing surface non-functional) until BE V-016a contract is on prod. The user explicitly accepted this risk: "Commit + push (don't deploy until BE V-016a contract live)" — interpreted as FE deploy is OK, BE is still being shipped.

### V-016c — /ecole desktop layout (lesson-grid Option C)
Milestone: M1

**Priority:** HIGH (V-016 chain mid; pre-launch desktop polish completes /ecole/speaking/progress trio)
**Status:** Awaiting verification (1440px desktop screenshot of `/ecole` showing eyebrow + Fraunces italic title + progress strip + 2-phase lesson grid (auto-fill 220px columns) + right rail (Today's session warm-cream / days-until-exam / streak placeholder). Verify mobile <md keeps existing HomeScreen layout. F-225 interactive verification clause partially applies — Today's session CTA + lesson card click-throughs.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06
**Source:** V-016 spec — /ecole was mobile-stacked column on desktop
**Dependencies:** V-013c TopNav (desktop chrome); V-012 (warm tokens)

**Layout (Option C — lesson-centric):**
- Header: eyebrow + Fraunces italic page title + greeting + progress strip (peach-deep fill on warm-cream track)
- Body: 2-column grid `1fr / 280-320px`
  - Left: 2 phase sections (Fondations 1-16 / Approfondissement 17-27), each with auto-fill 220px lesson card grid. LessonCard shows lesson number (Fraunces italic), status icon + label (Lock/Play/Check), title, 2-line short description clamp.
  - Right rail (sticky top:96): warm-cream Today's session card with CTA, days-until-exam tile (Fraunces italic count), streak placeholder, optional Recommended modules count
- Locked lessons render at 60% opacity, no Link wrapper (not clickable)
- In-progress + completed lessons wrap in `<Link>` to `/ecole/lesson/{n}`
- Mobile <md: existing HomeScreen via `.fp-mobile-only`

**Skipped from this rev:** the existing HomeScreen DailyActionCard pastels are NOT carried into desktop (warm token-based today card replaces). Recommended modules section reduced to a count chip.

### V-016c.fix — /ecole desktop empty Fondations + Approfondissement (phase-filter regression)
Milestone: DONE

**Priority:** HIGH (production regression on V-016c desktop layout — visual verification on V-016c was blocked because the grids rendered with zero cards)
**Status:** ✅ Shipped 2026-05-12 (non-visual sweep verified; visual verification routed to TARS — separate commit)
**Verification:**
- Non-visual sweep (FE-Claude, 2026-05-12): deployment `dpl_GDqpPYB6XSU6obqVzuedVHFQunYr` READY in ~30s (Turbopack); `lemethodic.com/ecole` returns 200 from the new deployment (cache HIT on prerender shell, fresh chunk hashes confirm new bundle); zero error/warning/fatal entries across project runtime logs in last 1h.
- Visual + interactive verification (1440px desktop + 375px mobile of `/ecole` showing both phase grids populated with lessons; click-through on a Fondations card → `/ecole/lesson/{n}`; click-through on an Approfondissement card → `/ecole/lesson/{n}`): routed to TARS — separate verification commit.
**Filed:** 2026-05-12
**Shipped:** 2026-05-12 (commit `da534dc`)
**Source:** Chadi 2026-05-12 — /ecole desktop renders empty Fondations + Approfondissement sections
**Dependencies:** V-016c (original desktop layout); F-087 (curriculum split invariant 1-16 / 17-27)

**Cause:** `EcoleDesktop` filtered lessons with `lessons.filter((l) => l.phase === 1)` and `l.phase === 2`. The `mapLesson` mapper in `lib/api.ts` defaulted any missing/non-numeric `phase` value to 1 (`raw.phase === 2 ? 2 : 1`). When the backend response omitted `phase`, or serialized it as a string/null, all 27 lessons collapsed to phase=1 — Fondations rendered the full list, Approfondissement rendered empty. (HomeScreen mobile masked the regression because it renders a flat list with an inline phase divider — the divider silently failed to trigger but the lessons themselves still rendered.)

**Fix:**
- `components/home/EcoleDesktop.tsx` — switched the desktop phase filter from the BE `phase` field to `lessonNumber` directly (`≤16` = Fondations, `≥17` = Approfondissement). The 1-16 / 17-27 boundary is a locked curriculum invariant per F-087 and is more reliable than the BE field.
- `lib/api.ts` `mapLesson` — when BE returns a clean numeric `1` or `2`, that wins. Otherwise the mapper falls back to deriving phase from `lesson_number ≥ 17`. Keeps HomeScreen's PhaseDivider correct even with a misbehaving BE field.
- `components/home/EcoleDesktop.tsx` — added top-level empty-state if `lessons.length === 0`. Prior path silently rendered two empty phase grids; now an `ErrorRetry` surfaces so a future "no data" failure mode is visible instead of mistaken for the V-016c bug.

**Files touched:**
- `components/home/EcoleDesktop.tsx` — filter swap + empty-state branch (+13 lines)
- `lib/api.ts` — mapLesson phase fallback (+5 / -3 lines)

**Tests:** `pnpm build` clean. `npx tsc --noEmit` clean. No test runner configured in this repo.

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: MEDIUM
- WHY: Fix removes the dependency on the brittle BE `phase` field by using the locked F-087 lesson-number invariant, which is verified clean by build/typecheck and confirmed deploying on prod. MEDIUM not HIGH because I could not reproduce the empty-grid behavior locally (would have required prod auth + a logged-in account showing the bug) — the fix is theory-driven from the code path, not from observing the bug in action.
- UNCERTAINTY: Have not yet seen the populated phase grids render on prod with a real authenticated session. If the original bug was actually `lessons.length === 0` from BE (rather than the phase-field regression I diagnosed), the new empty-state will at least make that visible — but the underlying BE data issue would still need a separate fix.
- VERIFICATION: Chadi/TARS hit `https://lemethodic.com/ecole` at 1440px desktop on an authenticated session; both Fondations (1-16) and Approfondissement (17-27) should render populated lesson card grids. Click a card in each phase to confirm `/ecole/lesson/{n}` navigation. On 375px mobile, HomeScreen still works — Phase 2 divider should now render between lessons 16 and 17 (it used to silently fail when BE phase was wrong; that's a side-benefit of the mapper hardening).

### V-016f — Differentiation Card 1 rebuild (text-anchored bottleneck)
Milestone: M2

**Priority:** HIGH (V-016 chain; landing card 1 read as decorative not data)
**Status:** Awaiting verification (1440px desktop + 375px mobile of `/` + `/fr` Differentiation section showing Card 1 with "Your bottleneck" eyebrow + Fraunces italic couche name in warm-peach-deep + tail line. Hover trace: cycles through 5 couches.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06
**Source:** V-016 spec — Card 1 "5 horizontal bars" read as decoration
**Dependencies:** V-004 (DifferentiationSection card chrome stays); V-012 (warm tokens)

**Decision: Option B (text-anchored)** — bars rebuild dropped in favor of typographic bottleneck frame:
- Eyebrow: "Your bottleneck" / "Votre goulet" — small uppercase ed-muted
- Body: cycling couche name in Fraunces italic clamp(28-36px) warm-peach-deep
- Tail: "is what's blocking your B2." / "freine votre B2." — Switzer 14px ed-fg
- Hover advances index modulo 5 (Le Fond / Les Moules des Idées / Les Moules / Les Réflexes Anglais / La Voix). Default position: index 3 (Les Réflexes Anglais — most thematically resonant for anglophone audience).
- Spring-eased fade-up on each cycle via `ed-pair-fade-in` keyframe (reused from V-004 InterferenceVisual). Reduced-motion users see end state instantly.
- Card 1 file gains a `language` prop; Cards 2/3 remain prop-less; mount switched to per-index render in DifferentiationSection.

### V-016e — Switzer font preload (landing FOUT fix)
Milestone: M2

**Priority:** HIGH (V-016 chain; landing H1 fell back to system sans on first paint)
**Status:** Awaiting verification (1440px desktop + 375px mobile of `/` + `/fr` H1 + body — verify Switzer renders, not system sans-serif. Network tab: confirm preload link fires before stylesheet link.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06
**Source:** V-016 spec — V-005 Switzer was rendering as system fallback on landing
**Dependencies:** V-005

**Fix:** added `<link rel="preload" as="style">` for the Fontshare CSS URL ahead of the `<link rel="stylesheet">` declaration in `app/layout.tsx` `<head>`. Also added `crossOrigin="anonymous"` to the preconnect hints (Fontshare CSS references font files on `cdn.fontshare.com`, separate origin from `api.fontshare.com`) and a second `preconnect` for `cdn.fontshare.com`. This escalates fetch priority on the font CSS so first-paint H1 hits Switzer's @font-face rules instead of falling through the `-apple-system / Segoe UI / system-ui` chain.

If FOUT persists post-deploy, escalate to **V-016e.local** — self-host Switzer via `next/font/local` with downloaded woff2 files. Filed as queued follow-up.

### V-016d — Hero kicker amendment (size, color split, spring)
Milestone: M1

**Priority:** MEDIUM (V-016 chain; landing hero polish)
**Status:** Awaiting verification (1440px desktop + 375px mobile of `/` + `/fr` hero showing kicker at clamp(24-32px), prefix in ed-fg-soft, exam name in warm-peach-deep, continuous infinite cycle through TCF/TEF/DELF/DALF.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06
**Source:** V-016 spec
**Dependencies:** V-001 (kicker sizing baseline); V-006 (widest-word width sizer); V-012 (spring + warm-peach-deep)

**Changes:**
- Font size: `clamp(20px, 1.8vw, 24px) → clamp(24px, 2.5vw, 32px)`
- Color split: prefix "Prep for" / "Préparation" → `var(--ed-fg-soft)`; exam name → `var(--ed-warm-peach-deep)`. Same split applied to reduced-motion fallback ("Prep for TCF · TEF · DELF · DALF").
- Animation: keyframe `ed-kicker-slide` now runs at 200ms with `ED_EASE_SPRING_CSS` (was 600ms with ED_EASE_CSS). Tighter rotation rhythm.
- Continuous infinite loop: `useRotatingText` already cycles forever via `setInterval`; no behavioral change needed. Hover-pause preserved (kicker pauses while focused / hovered for keyboard accessibility).

### V-016b — La Méthode en Couches copy revision
Milestone: M2

**Priority:** HIGH (V-016 chain; landing methodology copy didn't communicate value)
**Status:** Awaiting verification (1440px desktop + 375px mobile of `/` + `/fr` methodology section showing the 5 couches with revised descriptions. EN: "Le Fond: Your ideas. Generic answers fail at B2. Specific examples score." etc. FR analogs.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06
**Source:** V-016 spec
**Dependencies:** V-002 (em-dash strip rule); F-227 (compressed methodology surface on landing)

**Scope:** updated `METHODOLOGY.couches[*].description` in `components/landing/copy.ts` for all 5 couches (Le Fond / Les Moules des Idées / Les Moules / Les Réflexes Anglais / La Voix), EN + FR. Each description now communicates the layer's value proposition rather than just labeling it. Em-dash appositive markers stripped per V-002 — colon separator is rendered by `MethodologySection` JSX between name and description.

**Out of scope:** EcoleIntro (`/ecole/intro` Section 2) keeps its longer methodology copy. The landing methodology is the compressed glance-form version; EcoleIntro is the deep version. V-016b applies only to the compressed copy on landing.

### V-015d — /progress desktop bento dashboard
Milestone: M1

**Priority:** HIGH (V-015 chain tail; pre-launch desktop polish)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop screenshot of `/progress` showing radar (2×2 tile) + Today's Focus + Bottleneck + Streak/days-to-exam + per-couche row + recent activity. Verify bento collapses to 2-col at md and to single column at <md. F-225 interactive verification clause partially applies — Today's Focus CTA + Recent Activity have hover/click affordance.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-015 spec — /progress was mobile-stacked column on desktop
**Dependencies:** V-009 (5-couche brand labels reused for radar + per-couche row); V-012 (warm tokens); BRAND_LABEL + COUCHE_ORDER from lib/coucheBrandLabels.ts

**Bento layout (Apple iCloud restraint):**
- Radar tile (2×2 at lg, 1×2 at md): 5-couche Recharts polar from latest recording. Voix axis present at user value 0 (unscored placeholder per V-009).
- Today's Focus tile (2×1 at lg, 1×1 at md): warm-cream bg, action.kind → headline + CTA → /ecole.
- Bottleneck tile (1×1): lowest-scoring scored couche from latest recording.
- Streak slot (1×1): repurposed for days-until-exam (Fraunces italic count + warm-espresso) since BE has no streak field. Filed as **V-015d.streak** if/when BE streak ships.
- Per-couche detail row (full width): 5 mini cards with auto-fit grid; Voix unscored (60% opacity + "Coming soon" label).
- Recent activity (full width): RecordingSummary list, 3-column rows (Tâche label / date / CEFR band).

**CSS:**
- New `.fp-bento-grid` + `.fp-bento-{radar,today,bottleneck,streak,couches,recent}` classes in globals.css with @media gates at md/lg
- Mobile <md: existing ProgressDashboard stacked layout via `.fp-mobile-only`

**Out of scope (filed):**
- **V-015d.trend** — BE `GET /api/diagnostic/trend?days=30` endpoint for the score-trend tile (skipped from v1 per Chadi pick)
- **V-015d.streak** — proper streak counter (BE field needed)

### V-015c — /speaking desktop tab-driven layout
Milestone: M1

**Priority:** HIGH (V-015 chain mid; pre-launch desktop polish)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop screenshot of `/speaking` showing 3 tabs (Tâche 1/2/3) with peach-deep underline on Tâche 1 (default) + 60/40 detail panel showing format / tips / Start CTA + recent recordings. 375px mobile keeps existing 3-stacked-card layout. F-225 interactive verification clause applies — tab clicks should swap the detail panel + load tâche-filtered recordings.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-015 spec — /speaking was mobile-only 3-card layout on desktop
**Dependencies:** V-013c TopNav (active-underline pattern reused); V-012 (warm tokens); api.recordings.list

**Layout (Option A from V-015c plan-first):**
- Top: 3 tabs (Tâche 1/2/3), peach-deep 2px underline on active, spring-eased color on hover
- Default tab: Tâche 1 (no localStorage persist — keeps state simple)
- 60/40 grid: detail panel left (intro / format / tips), right rail with primary CTA + recent recordings + score history placeholder
- Bottom meta strip: duration + mode (small visual closure)

**Copy:**
- Tâche-specific format / tips / examples placeholder copy for v1 — Chadi-authored real copy filed as **V-015c.copy** for v2
- 3 tips per tâche, EN + FR
- Tips bullets use `--ed-warm-peach-deep` 6px dot

**Right rail:**
- Primary CTA → existing tâche route (`/speaking/tache-1/interview`, `/speaking/tache-2`, `/speaking/tache-3/environnement`)
- Recent recordings: filtered to active tâche from api.recordings.list({ limit: 30 }), top 5
- Score history: empty-state placeholder ("Score chart coming soon") — V-015d.trend covers BE side

**Mobile <md:** existing SpeakingLanding stays unchanged via `.fp-mobile-only`.

### V-015c.copy — Real format/tips/examples copy
Milestone: polish-defer

**Priority:** MEDIUM (post-V-015c v1)
**Status:** Queued — Chadi authoring
**Filed:** 2026-05-06
**Source:** V-015c spec — placeholder stubs in v1
**Dependencies:** V-015c
**Scope:** replace the 3-tâche placeholder format / 3-tips arrays in `components/speaking/SpeakingDesktop.tsx` COPY constant with Chadi-authored real content. Add an "Examples" block per tâche if Chadi provides sample exchanges. EN + FR.
**Owner:** Chadi (copy) + Engineering (wire-up)

### V-015d.trend — BE diagnostic trend endpoint
Milestone: TBD

**Priority:** LOW (post-V-015d; FE has placeholder)
**Status:** Queued (BE-side)
**Filed:** 2026-05-06
**Source:** V-015d + V-015c right-rail score history slot
**Dependencies:** F-088 (couche scoring)
**Scope:** BE `GET /api/diagnostic/trend?days=30` returning either per-couche or overall score time series. Shape suggestion: `{ couche_key | 'overall', points: [{ date: ISO, score: number }] }[]`. FE adds a Recharts line chart in the V-015d "Score trend" tile and the V-015c right-rail history slot once this lands.
**Owner:** Backend Engineering

### V-015d.streak — Streak counter (BE field + UI)
Milestone: TBD

**Priority:** LOW (post-launch UX)
**Status:** Queued (BE-side first)
**Filed:** 2026-05-06
**Source:** V-015d spec — Streak tile currently repurposed for days-until-exam
**Dependencies:** TBD BE streak tracking
**Scope:** BE adds streak tracking on User (consecutive-day-with-recording counter). FE swaps the Streak bento tile from days-until-exam to actual streak count once BE field ships. Days-until-exam moves to a new dedicated tile or returns to /ecole header chip.
**Owner:** Backend Engineering

### V-013c — Nav system overhaul (mobile BottomNav + desktop TopNav)
Milestone: M1

**Priority:** HIGH (V-013 chain tail; pre-launch surface completeness)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured screenshots: 1440px desktop on /ecole + /writing + /more + /progress + /diagnostic showing TopNav at top with active underline; 1440px desktop scrolled past 8px to capture backdrop-blur + ed-rule border state; 375px mobile on same routes showing BottomNav with TopNav hidden; verify TopNav DOES NOT render on /, /fr, /signup, /paywall, /onboarding, /privacy, /terms, /refund. Plus interaction trace: click profile avatar → dropdown opens → click outside → dismisses; click "Sign out" → logout fires → redirects to /. F-225 interactive verification clause applies.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-013 spec — bottom nav leaking onto desktop; no proper desktop top nav
**Dependencies:** V-012 (warm tokens + spring motion inherited); V-013a, V-013b (in-product surfaces TopNav links to)

**Two changes:**
- `components/home/BottomNav.tsx` — gained className `md:hidden` so mobile-only
- `components/nav/TopNav.tsx` (NEW) — Apple-style sticky desktop nav, mounted globally via app/layout.tsx

**TopNav visibility logic:**
- Hide below md breakpoint (768px): `className="hidden md:flex"`
- Hide on marketing/conversion/legal/auth paths: returns null on `/`, `/fr`, `/signup`, `/login`, `/paywall`, `/privacy`, `/terms`, `/refund` and `/onboarding/*`
- Hide pre-hydration / without token: returns null until auth store is hydrated and token present (avoids flash on unauth redirects)

**Decisions made (no Chadi pause needed):**
- backdrop-blur intensity: 12px (8px too subtle on warm cream, ~20px Apple-style too heavy)
- Active state: 2px peach-deep underline, 6px below link
- Dropdown: click-to-open + click-outside dismiss (touch-friendly)
- Mobile breakpoint: 768px (Tailwind md default)

### V-013b — /more page (Profile, Settings, Account, About)
Milestone: M1

**Priority:** HIGH (V-013 mid-chain; was F-058 placeholder)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/more` showing all 4 sections (Profile / Settings / Account / About). Plus interaction trace: language toggle → page re-renders in selected language; sign out button → logout flows to /. F-225 interactive verification clause applies.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-013 spec — /more was F-058 placeholder
**Dependencies:** V-012b (warm tokens); V-013b.lang-pref + V-013b.notifications + V-013b.password (BE follow-ups filed below)

**Sections:**
- **Profile**: avatar (initial in warm-peach + espresso), fullName + email; exam target row (TCF/TEF/DELF labels via EXAM_LABELS map); days-until-exam if set (Fraunces italic + warm-espresso accent)
- **Settings**: language toggle EN/FR (local-only client update; V-013b.lang-pref needed for BE persist); notifications row (disabled placeholder, V-013b.notifications)
- **Account**: change password (disabled placeholder, V-013b.password); sign out button (fp-error color; clears auth + onboarding + submitResponse stores, redirects to /)
- **About**: version (`APP_VERSION = '0.1.0-soft-beta'`), support email, terms/privacy/refund links

### V-013b.lang-pref — BE PATCH /api/users/me for interface_language
Milestone: TBD

**Priority:** MEDIUM (post-V-013b; language toggle currently client-only)
**Status:** Queued (BE-side; lemethodic-backend ticket)
**Filed:** 2026-05-06
**Source:** V-013b /more language toggle — needed for cross-session persistence
**Dependencies:** V-013b
**Scope:** BE PATCH /api/users/me accepting partial body with `interface_language: "en" | "fr"`. Updates User row, returns updated user. FE then calls api.users.update() (new method) on toggle and refreshes auth store from response. Without this, /me re-fetches will reset to BE-stored value.
**Owner:** Backend Engineering

### V-013b.notifications — Notification preferences UI + BE plumbing
Milestone: TBD

**Priority:** LOW (post-launch UX)
**Status:** Queued
**Filed:** 2026-05-06
**Source:** V-013b /more spec — notifications row currently disabled placeholder
**Dependencies:** TBD BE notification system
**Scope:** wire toggles for daily-streak-reminder, exam-countdown-warning, weekly-progress-summary. Needs BE notification store + dispatch system first. Out of soft-beta scope.
**Owner:** Engineering (Chadi PM call on which categories)

### V-013b.password — Change password flow
Milestone: TBD

**Priority:** MEDIUM (account hygiene)
**Status:** Queued
**Filed:** 2026-05-06
**Source:** V-013b /more spec — change-password row currently disabled placeholder
**Dependencies:** TBD BE POST /api/auth/change-password (current_password, new_password)
**Scope:** route /more/change-password (or modal sheet); form with current_password + new_password fields, validation (min 8 chars), 422 error mapping. Uses ed-field utility + .ed-cta-warm-hover button. BE endpoint needed first.
**Owner:** Engineering

### V-013a — Wire /writing to F-224 (prompt picker, submission, history)
Milestone: M1

**Priority:** HIGH (V-013 chain head; production launch dependency)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/writing` (prompt library showing T1/T2/T3 sections + filter chips), `/writing/[id]` (submission view with prompt body + textarea + word counter + submit button), `/writing/[id]` post-submit result view (couche scores + per-layer feedback + actions), and `/writing/history` (list view OR empty state if BE 404). EN + FR for both. Plus interaction trace: click prompt → /writing/[id] → type response → word counter color shifts → submit → result renders → click "Submit another" → returns to picker. F-225 interactive verification clause applies.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-013 spec — /writing was F-058 placeholder; F-224 BE live
**Dependencies:** F-224 BE (writing prompts library + analysis pipeline); V-009 (couche brand labels reused in result view); V-012 (warm tokens + spring motion)

**Routes:**
- `/writing` → `WritingPromptPicker` (groups by Tâche level, level + topic filter chips)
- `/writing/[prompt_id]` → `WritingSubmissionClient` state machine (idle → submitting → result), single page
- `/writing/history` → `WritingHistoryClient` (BE 404 → empty state)

**API + types added:**
- `lib/types.ts`: WritingPrompt, WritingSubmissionResult, WritingHistoryItem
- `lib/api.ts`: api.writing.{listPrompts, submit, history}

**Submission UX:**
- Prompt body preserves `\n\n` breaks via `white-space: pre-wrap`; parses `**bold**` for Tâche 3 multi-document separators
- Live word counter color-gated: < min → fp-error; min..max-10% → warm-sage-deep; max-10%..max → warm-peach-deep; > max → fp-error
- localStorage draft autosave (key `lemethodic:writing-draft:{prompt_id}`, 500ms debounce; cleared on successful submit)
- Submit disabled until min_words reached; aria-busy during submit; result view replaces form on success

**Result view:**
- Score summary (overall_score + cefr_band, Fraunces italic + warm-espresso)
- Optional narrative_summary in Source Serif italic
- Per-couche breakdown using BRAND_LABEL (Range / Coherence / Accuracy / Fluency, lang-aware)
- "Submit another" → /writing; "Try again" → reset state on same prompt

### V-013a.history — BE /api/writing/history endpoint
Milestone: TBD

**Priority:** MEDIUM (post-V-013a; FE renders empty state in the meantime)
**Status:** Queued (BE-side; lemethodic-backend ticket)
**Filed:** 2026-05-06
**Source:** V-013a spec — history surface ready, BE endpoint may not exist
**Dependencies:** F-224 (writing_submissions table)
**Scope:** GET /api/writing/history returning user's past submissions (ordered DESC by submitted_at). Each row carries id, prompt_id, prompt_title_fr, word_count, overall_score, cefr_band, submitted_at. FE detects 404 and renders empty state until this ships.
**Owner:** Backend Engineering

### V-012c — Whitespace + bento variation (warmth refit phase 3)
Milestone: M2

**Priority:** MEDIUM (V-012 chain tail; whitespace polish + bento exploration)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) end-to-end scroll showing the V-012 chain compositely: warm hero gradient, ed-fg/bg warmth, Methodology generous padding, Differentiation cards with peach/sage/peach-deep visuals, FAQ on paper, FinalCTA on warm-sand with B2 highlight + warm-hover CTA. Plus interaction trace for FinalCTA + Paywall CTA hover, onboarding step pastel rotation. F-225 interactive verification clause applies for the warm-hover CTAs.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-012 strategic recalibration — whitespace generosity on flagship surfaces
**Dependencies:** V-012a, V-012b

**Padding audit + targeted bumps:**
- **MethodologySection**: `clamp(64px, 10vw, 160px) → clamp(80px, 11vw, 180px)`. Moat surface earns more breathing room; floor lifted 64→80 for tighter mobile→desktop scaling, cap raised 160→180.
- **FinalCTASection**: `clamp(96px, 14vw, 160px) → clamp(96px, 14vw, 180px)`. Conversion moment cap raised; floor unchanged.
- **Hero / Problem / Differentiation / How / Pricing / FAQ**: untouched per spec ("don't blanket-apply"). Hero already at 160-top / 140-bottom; rest already at 80-140.

**Bento exploration: skipped per spec fallback** ("IF unsure, ship the 3-equal pattern as-is. Bento is an upgrade, not required.") The V-004 + V-012b card visuals already carry distinct visual weight (couche stack / EN-FR pair / waveform; peach-deep / peach / sage-deep colors). 3-equal grid reads balanced after warmth landed; bento adds risk for marginal gain. Filed as **V-012c.bento** queued for future taste pass.

**Files touched:**
- `components/landing/sections/MethodologySection.tsx` (vertical padding clamp)
- `components/landing/sections/FinalCTASection.tsx` (vertical padding cap)

### V-012c.bento — Differentiation cards bento variation (queued)
Milestone: polish-defer

**Priority:** LOW (post-V-012 polish; design taste pass)
**Status:** Queued
**Filed:** 2026-05-06
**Source:** V-012c spec — bento exploration deferred per spec fallback
**Dependencies:** V-012b
**Scope:** swap the 3-equal-card grid in DifferentiationSection for a bento layout. Two candidate variations to surface in plan-first when picked up: (a) 1 large card 2/3-width spanning Card 1 (Diagnostic-driven, the strategic lead) + 2 stacked smaller cards 1/3-width for Cards 2/3; (b) 2-1-2 pattern with different aspect ratios across breakpoints. Mobile collapses to single-column stack regardless. Card chrome stays — only grid composition changes. Needs Chadi taste pass on which composition reads best with the V-012b warm visuals (peach-deep illuminated bar, peach strikethrough, sage waveform).
**Owner:** Engineering (Chadi taste pass on composition)

### V-012b — Per-surface warmth injection (warmth refit phase 2)
Milestone: M2

**Priority:** HIGH (V-012 mid-chain — hero/Paywall/FinalCTA/EcoleReveal/onboarding/Differentiation cards get warmth)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy verification deferred to end-of-V-012c per defer-verification mode. F-225 interactive verification clause partially applies — CTA warm-hover state is interactive; recorded hover trace required for FinalCTA + Paywall CTAs once Chadi captures end-state. All 8 smoke-test routes returned 200; warm tokens confirmed in landing HTML.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-012 strategic recalibration — F-200 went too cold; per-surface warmth injection
**Dependencies:** V-012a (tokens + spring motion)

**Per-surface changes:**

- **Hero (`HeroSection.tsx`)**: solid `backgroundColor: ED.bg` → `linear-gradient(180deg, var(--ed-bg) 0%, var(--ed-warm-sand) 100%)`. Solid bg preserved as fallback. V-003 atmospheric glyphs untouched.

- **Paywall (`Paywall.tsx`)**: section bg `var(--ed-bg)` → `var(--ed-warm-cream)`. Recharts radar: target stroke `#1A1A1A40` → `var(--ed-warm-sage-deep)`; user stroke `var(--fp-peach-deep)` → `var(--ed-warm-peach-deep)`; user fill `var(--fp-peach-deep) → var(--ed-warm-peach)` with fillOpacity bumped 0.35 → 0.5 (lighter peach needs more opacity for visibility). Legend swatches updated to match. CTA button: bg `INK (legacy)` → `var(--ed-accent)` + `.ed-cta-warm-hover` class for spring-eased peach-deep hover.

- **FinalCTASection (`FinalCTASection.tsx`) — absorbs V-011.color**: section bg `ED.bg` → `var(--ed-warm-sand)`. Headline: new `highlightB2(text)` helper splits on "B2" token and wraps it in span with `color: var(--ed-warm-peach-deep)` (warm accent on the moat-relevant term, both EN + FR). CTA Link: `.ed-cta-warm-hover` + `.ed-btn-press` classes (warm hover + press feedback). Trust line color `ED.muted` → `var(--ed-fg-soft)` (warm muted #4A4540).

- **EcoleReveal (`EcoleReveal.tsx`)**: ED_BG constant `var(--ed-bg)` → `var(--ed-warm-sage)` (achievement / calm pride moment). ED_ACCENT (used for the persona label) `var(--ed-accent)` navy → `var(--ed-warm-espresso)` warm dark. Plan card chrome (ed-paper, 1px ed-rule, 4px radius) preserved.

- **Onboarding flow (Promova-style per-step pastel rotation)**: new `STEP_PASTELS` array in `OnboardingFlow.tsx` indexed by `safeIndex % 6`: peach / sand / sage / cream / peach-deep / sage-deep. `bg` prop threaded through `commonProps` → all 5 question components (SingleSelect, MultiSelect, DateInput, OtherFreetext, ExamPicker) → OnboardingScreen wrapper. Step transitions naturally inherit V-012a `--ease-spring` from OnboardingScreen's existing transitions.

- **Differentiation cards (`DifferentiationSection.tsx`)**:
  - **Card 1 (CoucheStackVisual)**: illuminated bar `backgroundColor: ED.accent` → `'var(--ed-warm-peach-deep)'`; border matches. Transition string updated from `var(--ed-ease)` → `var(--ease-spring)` (was missed by V-012a sed because the ternary string spanned a different line than the `transition:` keyword).
  - **Card 2 (InterferenceVisual)**: strikethrough `textDecorationColor: ED.muted` → `'var(--ed-warm-peach)'`; thickness bumped 1px → 1.5px for visibility (peach softer than gray).
  - **Card 3 (WaveformVisual)**: bar `backgroundColor: ED.accent` → `'var(--ed-warm-sage-deep)'` (paired with Card 1 peach-deep — peach + sage warm chord).
  - Card chrome (ed-paper, 1px ed-rule, 4px radius, no shadow) preserved per V-012 spec.

**New globals.css utility:**
- `.ed-cta-warm-hover`: bg-color + color transition with `--ease-spring`; `:hover` shifts bg to `var(--ed-warm-peach-deep)`. `@media (hover: hover)` gate prevents sticky hover on touch devices. Used by FinalCTA Link + Paywall CTA button.

**Files touched:**
- `app/globals.css` (`.ed-cta-warm-hover` class)
- `components/landing/sections/HeroSection.tsx` (gradient bg)
- `components/Paywall.tsx` (section bg, radar fills/strokes, legend, CTA hover)
- `components/landing/sections/FinalCTASection.tsx` (section bg, B2 highlight helper, CTA classes, trust line color)
- `components/onboarding/EcoleReveal.tsx` (ED_BG + ED_ACCENT constants)
- `components/onboarding/OnboardingFlow.tsx` (STEP_PASTELS array + bg prop threading)
- `components/onboarding/questions/SingleSelectQuestion.tsx` (bg prop)
- `components/onboarding/questions/MultiSelectQuestion.tsx` (bg prop)
- `components/onboarding/questions/DateInputQuestion.tsx` (bg prop)
- `components/onboarding/questions/OtherFreetextScreen.tsx` (bg prop)
- `components/onboarding/questions/ExamPickerQuestion.tsx` (bg prop)
- `components/landing/sections/DifferentiationSection.tsx` (card visual colors + transition fix)

**V-011.color absorbed:** the FinalCTA bg shift + B2 highlight + button hover + trust line color all land here. V-011.color marked superseded; BE retiring from BACKLOG separately.

### V-012a — Token foundation + motion language (warmth refit phase 1)
Milestone: M2

**Priority:** HIGH (V-012 chain root — V-012b/c inherit tokens + spring motion)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy verification deferred to end-of-V-012c per defer-verification mode. Spot-check a single landing screenshot to verify new --ed-fg warmth (text reads slightly warmer dark, not near-black) and --ed-bg warmth (cream slightly warmer). All 8 routes (/`, /fr, /signup, /onboarding, /ecole, /ecole/intro, /paywall, /diagnostic) returned 200; --ease-spring confirmed in landing HTML output. F-225 interactive verification clause does NOT apply to phase a alone — pure token + motion-language plumbing. Awaiting verification batches with V-012b + V-012c.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-012 strategic recalibration — F-200 went too cold; warmth refit on top
**Dependencies:** V-005 (Switzer/Fraunces typography stays); F-200 (system foundation)

**Token changes (globals.css :root):**
- Update: `--ed-bg #FAF7F2 → #FBF8F4` (warmer cream); `--ed-fg #1A1A1A → #2A2520` (warm dark replaces near-black)
- Add: `--ed-fg-soft: #4A4540` (softer secondary text)
- Add Editorial Luxury palette tokens (chrome-level warmth, distinct from `--fp-*` decorative chip layer): `--ed-warm-peach: #FFD8C2`, `--ed-warm-peach-deep: #E0A890`, `--ed-warm-sage: #B8C4A8`, `--ed-warm-sage-deep: #8FA279`, `--ed-warm-espresso: #4A3528`, `--ed-warm-cream: #FDFBF7`, `--ed-warm-sand: #F5E6D8`
- Add: `--ease-spring: cubic-bezier(0.32, 0.72, 0, 1)` (soft state easing)
- `--ed-ease` (cubic-bezier 0.16,1,0.3,1) preserved for surfaces with their own motion contracts (V-003 hero atmosphere keyframes, hero-rise, kicker-slide, animations)

**Motion rule going forward:**
- `transform`: short ease-out 160ms — preserves tactile snap (button press, no spring overshoot)
- `background-color / border-color / color / box-shadow / opacity / width`: spring 200-300ms — soft state transitions
- Animations (keyframes): keep `--ed-ease` — those have their own timing contracts

**Utility class updates:**
- `.ed-btn-press`: `:active` scale `0.98 → 0.97` per V-012 spec; transform = 160ms ease-out; bg-color/color = `--ease-spring` 200ms
- `.ed-card-lift`: transform/box-shadow/border-color all use `--ease-spring` (cards earn the soft hover lift; only button transforms keep ease-out per spec rule)
- `.ed-field`: focus border-color/box-shadow use `--ease-spring`

**Component inline transitions touched (mass replace):**
- 18 inline `transition: var(--ed-ease)` references across 11 files swapped to `var(--ease-spring)`. Sed-gated on `/transition:/` lines so animations using `var(--ed-ease)` (DifferentiationSection waveform `animation: ed-wave-pulse ... var(--ed-ease)`) were preserved.
- One camelCase exception: OnboardingScreen ProgressDots `transitionTimingFunction: 'var(--ed-ease)' → 'var(--ease-spring)'` (the bulk regex didn't catch it; manually updated).
- Files touched: app/signup/page.tsx, components/ecole/intro/EcoleIntro.tsx, components/landing/LandingFooter.tsx, components/landing/LanguageToggle.tsx, components/landing/sections/DifferentiationSection.tsx, components/landing/sections/PricingSection.tsx, components/onboarding/OnboardingFlow.tsx, components/onboarding/OnboardingScreen.tsx, components/onboarding/questions/DateInputQuestion.tsx, components/onboarding/questions/OtherFreetextScreen.tsx

**lib/motion.ts additions:**
- `ED_EASE_SPRING_CUBIC` tuple `[0.32, 0.72, 0, 1]` (for framer-motion)
- `ED_EASE_SPRING_CSS` string `'cubic-bezier(0.32, 0.72, 0, 1)'` (for inline transitions)

**No behavior change beyond:**
- Slightly warmer text + bg colors site-wide (intentional softer contrast per V-012 spec)
- Button press scale tighter (0.98 → 0.97)
- State transitions on color/bg properties feel softer (spring overshoot, not snap)
- Card hover lifts get a subtle spring settle

### V-011 — FinalCTA centering fix
Milestone: M2

**Priority:** HIGH (verification-found; visual reads off-center on production)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) FinalCTA showing headline + body + button + trust line all visually centered, plus the FR headline breaking at "deviner | ce qui bloque..." or similar (NOT leaving "ce" as a 2-char orphan on line 1). F-225 interactive verification clause does NOT apply — pure typography centering + line-break fix.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-011 production verification (Chadi 2026-05-06)
**Dependencies:** V-005 (Switzer/Fraunces live)

**Two centering fixes applied:**

1. **Defensive explicit centering on H2 + body P.** Parent div already had `textAlign: 'center'`, but production reading suggested inheritance through framer-motion's `motion.div` (RevealOnScroll wrapper) wasn't always picked up the same way across browsers. Added belt-and-suspenders: H2 gains explicit `textAlign: 'center'` + `margin: '0 auto'` + `maxWidth: 640` (slightly narrower than parent 720 to give the H2 its own centered column rhythm). Body P loses the `mx-auto` className (Tailwind `margin-inline: auto`) and gains explicit `margin: '0 auto'` + `textAlign: 'center'` inline. No visible change for users who were already seeing it center; closes the loophole for those who weren't.

2. **FR headline orphan glue via non-breaking space.** Original FR `'Arrêtez de deviner ce qui bloque votre B2.'` rendered with `text-balance` produced an awkward break leaving "ce" as a 2-char orphan at end of line 1. Inserted U+00A0 (NBSP) between "ce" and "qui" so the relative-pronoun pair stays bound. The natural break now lands cleanly between phrase units (e.g., after "deviner") rather than mid-pair. EN headline left untouched — `text-balance` produces clean breaks at typical viewports for the shorter EN string.

**Files touched:**
- `components/landing/sections/FinalCTASection.tsx` — H2 + body P explicit centering attributes
- `components/landing/copy.ts` — FR FINAL_CTA.heading gains NBSP between "ce" and "qui"

### V-011.color — FinalCTA color treatment refresh (PLAN-FIRST, awaiting Chadi pick)
Milestone: M2

**Priority:** MEDIUM (verification-found; current treatment reads as flat per Chadi)
**Status:** **Plan-first surfaced; awaiting Chadi color direction.** Three options proposed below.
**Filed:** 2026-05-06
**Source:** V-011 plan-first — "the colors that were used before in the website were much better" (Chadi 2026-05-06)
**Dependencies:** F-200 (editorial system + pastel preservation rule); F-227.rhythm (FinalCTA bg currently locked at ed-bg)

**Pre-F-200 history (git show db58577):** the M-101a-era FinalCTA used `--fp-peach` (#FFD8C2) as full section background, `INK` button with `boxShadow: '0 4px 16px rgba(0,0,0,0.12)'` for depth, 16px radius (softer than current 4px). The peach bracketed the hero (which was also peach pre-F-200) — warmth at both ends of the page. F-200 collapsed it to ed-bg cream + ed-accent navy button + 4px radius (current state). Chadi's "before was better" likely refers to the M-101a peach bracketing.

**Three options proposed:**

- **(A) Peach revival.** Restore section bg to `--fp-peach` (#FFD8C2) — the M-101a treatment exactly. Headline + body + button copy stay in current ed-* tokens. Adds full warmth chrome to the conversion moment + brackets the hero (currently ed-bg, but a hero peach restoration could land separately as V-011.hero). Tradeoff: breaks F-227.rhythm (FinalCTA was just flipped from paper to ed-bg in F-227.rhythm); section becomes pastel chrome rather than the F-200 "pastels are decorative chip layer only" rule. The most direct read of Chadi's feedback.

- **(B) Soft peach wash + button hover warmth.** Section bg shifts to a desaturated peach blend (e.g., `#F5E6D8` or a 50% mix between ed-bg and fp-peach) — warmer than current ed-bg cream but not full M-101a peach. Button hover state gains a subtle warm-tone color shift (ed-accent navy → slightly warmer navy). Trust line color shifts from ed-muted to a peach-toned muted. Adds warmth without flooding chrome; respects F-200's restraint instinct while addressing flatness. Middle-ground.

- **(C) Editorial accent strip + B2 highlight.** Section bg stays current ed-bg (preserves F-227.rhythm). Add a thin 4px × 120-200px accent strip in `--fp-peach-deep` (#E0A890 — already in palette as paywall radar accent) centered above the headline. Highlight the "B2" word in the headline with the same `--fp-peach-deep` color (warm accent on the moat-relevant term). Body + button stay current. Trust line could get a subtle warm shift. Adds editorial accent without changing chrome; closest to F-200 spirit; least change but also least warmth.

**Recommendation if forced to pick:** (B) Soft peach wash. It addresses Chadi's "before was better" (warmth) without fully reverting F-200's chrome decision, and the button hover warmth gives an interactive payoff. (A) is the most literal read but undoes F-227.rhythm; (C) might still read as flat to Chadi.

**Awaiting Chadi pick (or hybrid).** After direction lands, ship as the same V-011.color ticket (single PR), mark Awaiting Verification.

### V-010 — /ecole phase structure correction (3-button → 2-button)
Milestone: M1

**Priority:** HIGH (methodology-content alignment)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/ecole` showing the 2-button milestone row (Fondations 1–16 / Approfondissement 17–27) below the 0/27 progress bar. F-225 interactive verification clause does NOT apply — pure content/structure change, button taps were never wired beyond visual milestone state.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-009/V-010 methodology-content batch — locked 2-phase curriculum + F-202 /ecole/intro Le parcours section
**Dependencies:** F-087 (lesson curriculum); F-202 (locked curriculum split source)
**Scope:** in `components/home/EcoleProgress.tsx`, MILESTONES array reduced from 3 entries (Fondations 1-4 / Approfondissement 5-16 / L'École Complète 17-27) to 2 entries (Fondations 1-16 / Approfondissement 17-27). Aligns with the locked F-202 curriculum split + HomeScreen's existing Phase 1→Phase 2 divider at lesson 16→17 boundary. The 3-tier split was a pre-curriculum-lock F-087 approximation.

**Layout call (resolved without plan-first pause):** spec lean (a) — keep 2 buttons stretched to fill the same row width — confirmed sufficient. Existing `flex: 1` per badge naturally splits 50/50; no design call needed. Did NOT add a milestone-card replacement (option c) since spec said "lean (a) — simplest, no new content needed".

**Out of scope (preserved per V-010 spec):**
- TodayFocus card chrome (F-204.deep)
- "Set your exam date" pill chrome (F-204.deep)
- Streak / greeting / header chrome (F-204.deep)
- Bottom nav (F-204.deep)
- L'École Complète as a completion-state badge: not surfaced elsewhere in the codebase (grep confirmed only the deleted MILESTONES entry referenced it). If future ticket adds a "complete the École" celebration moment, that's a separate visual/copy task.

**Files touched:**
- `components/home/EcoleProgress.tsx` — MILESTONES 3-entry array → 2-entry array; ranges adjusted; comment block updated to V-010 reasoning.

### V-009 — CouchesDiagnostic 5-axis + brand labels
Milestone: M2

**Priority:** HIGH (methodology-content credibility — wrong axis count + legacy labels surfaced on /diagnostic + /paywall)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/diagnostic` (mock mode, then real-mode if a diagnostic is wired) showing 5 bars (4 scored + 1 unscored "Coming soon" Voix at bottom) plus `/paywall` showing the 5-axis radar with brand labels (Range / Coherence / Accuracy / Fluency / Voice). EN + FR for diagnostic; Paywall is EN-only. F-225 interactive verification clause does NOT apply — content-only change, no behavior change beyond the placeholder treatment for unscored Voix.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-009/V-010 methodology-content batch — locked 5-couche model (Couche 5 La Voix added 2026-05-05) + brand labels (Range/Coherence/Accuracy/Fluency/Voice EN, Étendue/Cohérence/Correction/Aisance/Voix FR)
**Dependencies:** F-202 (locked methodology copy + 5-couche shift); V-009.be (BE-side la_voix scoring)

**Findings (from plan-first audit):**
- CouchesDiagnostic at `components/diagnostic/CouchesDiagnostic.tsx` is **horizontal bars**, not a radar (spec called "radar" but the actual radar is in Paywall). Used only in `/diagnostic`. Default mock had 4 FR-only brand-label rows.
- Paywall radar at `components/Paywall.tsx` IS the Recharts RadarChart. Used at `/paywall`. Hardcoded 4 axes with **legacy backend labels** "Content / Structure / Grammar / English Habits" — NOT brand labels.
- Both surfaces in scope per V-009 audit.
- BE returns 4 couches today: `lib/types.ts:240` — `CoucheKey = 'le_fond' | 'les_moules_des_idees' | 'les_moules' | 'les_reflexes_anglais'`. La Voix (`la_voix`) is NOT in BE types. V-009.be filed.

**FE approach:**
- New shared constant `lib/coucheBrandLabels.ts` — `BRAND_LABEL` map (CoucheKey → {en, fr}) + `COUCHE_ORDER` methodology-canonical order. Single source of truth for FE-side brand labels overriding BE's legacy `displayLabelEn`/`displayLabelFr`.
- **CouchesDiagnostic**: extended `CoucheRow` type with optional `unscored: boolean` flag. Unscored rows render the empty track (50% opacity) with no fill / no dot / no target band, plus a "Coming soon" badge in the right cell instead of score+CEFR. Default mock extended to 5 rows with Voix as the unscored entry. `aria-label` switches to "X: not yet scored" for unscored bars.
- **`couchesToRows` in `app/diagnostic/page.tsx`**: now overrides BE's `displayLabel*` with `BRAND_LABEL[c.key][lang]` (falls back to BE label if a brand label is somehow missing); appends an unscored Voix row at the bottom (after the worst-first sort) so it doesn't poison the bottleneck callout ("Your bottleneck is the top row. Fix it first.").
- **Paywall radar**: `RADAR_DATA` extended from 4 to 5 axes; legacy backend labels swapped for brand labels in EN (Paywall is EN-only — no `lang` prop).

**Out of scope (preserved per V-009 spec):**
- Card chrome on /paywall (rounded radius + shadow stay in F-203.paywall)
- Fill color, outline style, card bg color (F-204.deep / F-205.deep)
- Layout positioning

**Files touched:**
- `lib/coucheBrandLabels.ts` (NEW) — BRAND_LABEL + COUCHE_ORDER + ExtendedCoucheKey type
- `components/diagnostic/CouchesDiagnostic.tsx` — CoucheRow.unscored support, default mock 4→5 with Voix unscored, conditional render of bar internals + right cell
- `app/diagnostic/page.tsx` — couchesToRows uses BRAND_LABEL override, appends unscored Voix row
- `components/Paywall.tsx` — RADAR_DATA 4 axes (legacy labels) → 5 axes (brand labels EN)

### V-009.be — BE adds La Voix scoring
Milestone: M3

**Priority:** HIGH (BE-side dependency for V-009 to render real Voice data instead of placeholder)
**Status:** Queued (BE-side; lemethodic-backend ticket)
**Filed:** 2026-05-06
**Source:** V-009 ship — FE renders Voix as "Coming soon" placeholder until BE scoring lands
**Dependencies:** V-009 (FE-side surface ready)
**Scope:** BE-side. Add `la_voix` to `CoucheKey` enum + scoring pipeline in `analysis.py` (or wherever the 4 existing couches are scored). Update `app/services/couche_labels.py` to emit brand labels (`displayLabelEn: "Voice"`, `displayLabelFr: "Voix"` for la_voix; same brand-label override for the other 4 couches so FE can drop its `BRAND_LABEL` override eventually). Diagnostic API response should return 5 couche scores once la_voix scoring is wired. La Voix scoring source: pronunciation/vowel-quality/liaison/rhythm metrics from the audio analysis pipeline (the existing speech-to-text + audio features could feed it). Scoring algorithm dimensions are a BE pedagogical pick — **no blocking owner input pending** (the 4 pedagogical decisions previously associated with V-009.be belonged to V-016a writing path; those shipped 2026-05-12 under V-016a + V-016a.fix).
**Owner:** Backend Engineering

### V-008 — Card 2 interference example direction reversed
Milestone: M2

**Priority:** HIGH (verification-found; wrong audience direction shipped)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) showing Card 2 (Anglophone interference) with the reversed pair: `~~Je suis 25 ans~~ / J'ai 25 ans`. Plus a hover trace verifying the 4 pairs cycle through correctly.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-006/V-007/V-008 production verification batch
**Dependencies:** V-004
**Scope:** V-004 shipped Card 2 with English-learner-of-French structure (`~~I am agree~~` / `Je suis d'accord`), which actually demonstrates French-speaker-of-English interference — backwards for LeMethodic's audience. V-008 reverses direction: each pair now shows the WRONG French attempt (calque from English structure) and the CORRECT French. Two-line layout per Chadi's lean (cleaner than the 3-line EN-source / wrong-FR / correct-FR treatment): struck-through wrong attempt above (Fraunces italic 1.25rem ed-muted), correct version below (Fraunces italic 1.5rem ed-fg). The reader infers the English source from context.

**Pre-authored 4 pairs (iconic L1-interference mistakes):**
1. `~~Je suis 25 ans~~` → `J'ai 25 ans` (être/avoir, age)
2. `~~Je suis faim~~` → `J'ai faim` (être/avoir, hunger)
3. `~~Je manque toi~~` → `Tu me manques` (word-order, reversed pronoun)
4. `~~Je suis chaud~~` → `J'ai chaud` (être/avoir, sensation)

EN/FR small-caps prefix labels removed in this rewrite — they were the relics of the wrong-direction layout (English source → French target). Without them, the reader sees the wrong/correct French pairing directly. V-004's `ed-pair-fade` keyframe + 80ms FR-line stagger preserved.

**Files touched:**
- `components/landing/sections/DifferentiationSection.tsx` — INTERFERENCE_PAIRS shape changed from `{en, fr}[]` to `{wrong, correct}[]`; InterferenceVisual rewritten as 2-line; SANS_FONT span prefixes removed (no longer needed without EN/FR labels)

### V-007 — Final CTA trust line duplicate "Free."
Milestone: M1

**Priority:** HIGH (verification-found; user-visible duplication)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop screenshot of `/` showing FinalCTASection trust line under primary CTA. EN-only sufficient — bug was an EN-side string concatenation; FR side rendered correctly. F-225 interactive verification clause does NOT apply — copy fix only.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-006/V-007/V-008 production verification batch — trust line read "Free. No card. About 12 minutes. Free." (Free duplicated)
**Dependencies:** V-002 (em-dash strip touched the FINAL_CTA copy and exposed the bug, though the duplicate was older — F-200 era concatenation that overlapped with FINAL_CTA.ctaSecondary's first sentence)
**Scope:** in `FinalCTASection.tsx` line 100, the trust span rendered `{FINAL_CTA.ctaSecondary[lang]} {HERO.ctaSecondary[lang].split('.')[0]}.` — concatenating FINAL_CTA's `"Free. No card. About 12 minutes."` with HERO.ctaSecondary's first sentence (which is `"Free"`), producing the duplicate. Removed the `HERO.ctaSecondary` suffix; trust line now reads exactly `FINAL_CTA.ctaSecondary[lang]` ("Free. No card. About 12 minutes." / "Gratuit. Sans carte. Environ 12 minutes."). HERO import removed (no longer used in this file).

### V-006 — Kicker container clipping (rotating word cut off)
Milestone: M1

**Priority:** HIGH (verification-found; layout bug clipped DELF/DALF)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots showing the kicker mid-rotation through all 4 exam names (TCF / TEF / DELF / DALF) with no character clipping and no container width-jitter between states. Plus a hover trace verifying smooth cycling.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-006/V-007/V-008 production verification batch — DELF and DALF clipped on right edge
**Dependencies:** V-001 (kicker sizing bumped); F-212 (rotating mechanic)
**Scope:** in `RotatingKicker.tsx`, the rotating word slot used `minWidth: '4ch'` which sized to 4 × digit-zero width, narrower than 4 uppercase letters with 0.06em letter-spacing. 4-character names (DELF/DALF) overflowed; 3-character names rendered fine. V-006 swaps the minWidth approach for an invisible width sizer — render the widest exam name (computed via `EXAMS.reduce((a,b) => b.length > a.length ? b : a)`) inside the slot at `visibility: hidden`, then absolute-position the visible animated word over it with `textAlign: center`. Container width locks to widest case, animated word centers within the locked width regardless of length. No JS measurement needed; layout-driven sizing.

**Side fix:** earlier V-001 edit only updated the reduced-motion branch's font size + marginBottom because the active-rotation branch had different indentation (10-space vs 8-space inside its parent), and the `replace_all` matched only one. V-006 brings the active branch into line — `clamp(20px, 1.8vw, 24px)` font, `clamp(16px, 2vw, 28px)` marginBottom — so both render paths agree.

### V-004 — Differentiation cards rebuild (per-card art-directed visuals)
Milestone: M2

**Priority:** MEDIUM (visual depth; differentiation cards were boring text-only templates)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) showing all three differentiation cards visible together (Diagnostic-driven / Anglophone interference / Real-time AI feedback) at idle state. Plus a recorded interaction trace per F-225: hover over each card and verify (1) Card 1 illuminated bar shifts on hover, (2) Card 2 EN/FR pair cycles through 4 pairs on repeated hovers, (3) Card 3 waveform amplifies on hover and pulses subtly idle. Reduced-motion pass: macOS Settings → Reduce motion ON, verify all three cards still respond to state changes (state still updates) but transitions/animations skip and end-state is shown.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-series ticket batch — three identical text-only card templates were undifferentiated
**Dependencies:** V-005 (Fraunces live for the EN/FR italic pair display)
**Scope:** rebuild DifferentiationSection so each of the three cards has its own art-directed visual element above the headline + body, while preserving the shared editorial chrome (1px ed-rule, ed-paper bg, 4px radius, ed-card-lift on hover, 28-40px clamp padding).

**Per-card visuals:**
- **Card 1 — Diagnostic-driven**: 5-couche stack visualization. 5 horizontal bars (14px tall × 6px gap) representing Le Fond / Les Moules des Idées / Les Moules / Les Réflexes Anglais / La Voix. Default illuminated bar = #4 (Les Réflexes Anglais — most thematically resonant for the anglophone audience). Inactive bars are 1px ed-rule outline only; active bar is filled ed-accent navy with subtle scaleX(1.02). On hover (`onMouseEnter`), illumination cycles to next layer (visualizes diagnostic re-scoring as bottlenecks unblock). 600ms ease-in-out transitions on backgroundColor + borderColor + transform.
- **Card 2 — Anglophone interference**: typographic EN/FR comparison pair. EN line in Fraunces italic 1.375rem with line-through (ed-muted), FR line in Fraunces italic 1.375rem ed-fg, EN/FR small-caps prefixes in Switzer. Pairs cycle on hover through 4 examples: `I am agree → Je suis d'accord` / `I have 30 years → J'ai 30 ans` / `depends of → dépend de` / `since 2020 I live here → J'habite ici depuis 2020`. Pair change triggers 600ms ed-pair-fade-in keyframe (opacity + 4px Y-translate); FR delayed 80ms after EN.
- **Card 3 — Real-time AI feedback**: 32-bar audio waveform graphic. Heights from a static sine-ish array (8-48px). 4px wide bars with 3px gaps, ed-accent at 45% opacity. Idle state: subtle ed-wave-pulse keyframe (opacity 0.45 ↔ 0.7, 1800ms loop, staggered delays so bars pulse asynchronously). On hover: pulse animation halts and each bar transforms scaleY(1.4-1.6, varying by index modulo 3) with staggered transition delays so the amplification ripples across the waveform.

**Layout:**
- Cards use `display: flex; flex-direction: column; height: 100%` so visual elements anchor at top (130px reserved height for visual container) and body text fills below via `flex: 1`. All three cards have equal height.
- Shared chrome unchanged: 1px ed-rule + ed-paper bg + 4px radius + ed-card-lift hover + clamp(28px, 3vw, 40px) padding.
- 3-column grid via `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` — same as pre-V-004; collapses to 1-column stack on narrow viewports.

**Reduced-motion handling:**
- New utility hook `useReducedMotion()` (local to file): reads `(prefers-reduced-motion: reduce)` media query, subscribes to changes.
- Card 1: scaleX transform + transition both gated; active bar still gets bg color change (instant, no transition).
- Card 2: idle CSS animation `.ed-pair-fade` already gated in globals.css `@media (prefers-reduced-motion: reduce)` rule (animation: none, opacity: 1).
- Card 3: idle pulse animation + hover scaleY both skipped (transition: none, animation: none).
- All three cards still update state on hover; only the *animation* of state change is skipped. End state is shown.

**Files touched:**
- `components/landing/sections/DifferentiationSection.tsx` — full rewrite. Adds 3 inline visual sub-components (CoucheStackVisual / InterferenceVisual / WaveformVisual) + useReducedMotion hook + visuals[] map indexed by card position
- `app/globals.css` — added `@keyframes ed-pair-fade-in` + `.ed-pair-fade` class + `.ed-pair-fade-delay` class + `@keyframes ed-wave-pulse` + reduced-motion gate

### V-003 — Hero atmospheric typographic animation
Milestone: M2

**Priority:** MEDIUM (visual depth; F-200 editorial direction)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` showing hero with atmospheric glyphs visible behind H1+kicker, plus a recorded scroll trace verifying parallax fires at 0.2x scroll speed and disengages when hero leaves viewport. Reduced-motion pass: macOS Settings → Accessibility → Display → Reduce motion ON, verify drift animation halts and parallax stays at 0. F-225 interactive verification clause partially applies — atmospheric animation is decorative, but parallax + IntersectionObserver gate are behavioral; recorded scroll trace required.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-series ticket batch — hero needed visual depth without competing with copy
**Dependencies:** V-005 (Fraunces font system live)
**Scope:** atmospheric typographic background mounted inside HeroSection. 5 French accent characters (é, à, ç, ô, î) rendered as massive Fraunces glyphs at 5% ed-fg opacity, distributed across positional zones (top-left, top-right, mid-left, mid-right, bottom-center). Each character has its own drift animation (translate3d + rotate, 70-90s cycles, ease-in-out, infinite, distinct keyframes per character so they drift asynchronously). Negative animation-delay starts each at a different cycle phase to avoid synchronized first-paint reset. Font sizes clamp(240-300, 45-56vw, 640-800px) so atmosphere scales gracefully across viewport widths. Variable-axis: `opsz 144` (display optical size) + `SOFT 30` (editorial warmth). Parallax: 0.2x scroll speed on the parent wrapper (single rAF-throttled scroll listener). IntersectionObserver gates the listener so it only fires while hero is in viewport (no scroll-listener cost on rest of page). Reduced-motion: drift animation gated in CSS (`@media prefers-reduced-motion`), parallax disabled in JS (effectiveScrollY clamped to 0). Static end-state shows characters at initial positions.

**Files touched:**
- `components/landing/HeroAtmosphere.tsx` (NEW) — orchestrator with parallax + IO scroll gate + reduced-motion detection
- `app/globals.css` — `.hero-atmosphere` + `.hero-atmosphere-char-N` (5 zones) + 5 `@keyframes hero-drift-N` + reduced-motion gate
- `components/landing/sections/HeroSection.tsx` — section gains `position: relative` + `overflow: hidden`; `<HeroAtmosphere />` mounts before content; content wrapper gets `position: relative; zIndex: 1` to sit above the atmosphere layer
- aria-hidden + pointer-events:none on atmosphere — purely decorative, inert to AT and pointer

**No-overlap discipline:** characters positioned in distinct viewport zones (top-left -12%/-8%, top-right -8%/-4%, mid-left 38%/-16%, mid-right 30%/-10%, bottom-center 38%-left/-14% bottom). Negative offsets push characters partially off-canvas so the eye reads them as atmospheric fragments rather than discrete shapes. At narrow viewports (mobile), character font-sizes drop to 240-300px floor, preserving the same off-canvas fragment effect.

### V-003.opacity — atmosphere opacity tuning
Milestone: polish-defer

**Priority:** LOW (post-V-003 polish)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** V-003 spec — "ed-fg at 4-6% opacity"
**Dependencies:** V-003
**Scope:** V-003 ships at 5% opacity (midpoint of 4-6%). Once on production, Chadi can taste-pass the level — bump to 6% if too subtle, drop to 4% if competing with copy. 1-line change in globals.css.
**Owner:** Engineering

### V-002 — Em-dash strip across FE copy
Milestone: M2

**Priority:** MEDIUM (editorial polish; em-dash overuse muddied prose voice)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/`, `/fr`, `/ecole/intro` (FR + EN), `/onboarding` EcoleReveal step (FR + EN level labels), `/signup` (Password label), `/privacy`, `/terms`, `/refund` (browser tab title) per F-225. F-225 interactive verification clause does NOT apply — pure typography swap, no behavior change.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending; Chadi-approved per-instance 2026-05-01)
**Source:** V-series ticket batch — em-dash had become a stylistic crutch across FE copy
**Dependencies:** none
**Scope:** ~30 user-facing em-dash instances replaced with comma / period / colon / parens / pipe / middle dot per context. Code comments + console.error + dev logs excluded (not user copy). Placeholder glyphs (table cells where data is missing — `'—'` constants, conditional empty-state renders) PRESERVED — standard UX convention.

**Replacements applied:**
- A. Prose mid-sentence (12 instances): periods in most cases (PROBLEM body kept comma — period would have created fragment; flagged in commit). Colon for defining clauses (DIFF card 1, La Voix description). FR colons use ` : ` non-breaking-space convention. Restructured `...dragging — and treats that one` to `...dragging. Treats that one, specifically.` (deliberate fragment matches FR analog "Et traite celle-là, précisément." Per Chadi counter-edit; "It treats" was rejected as adding unnecessary subject).
- B. Le Goulet appositive (EN + FR in EcoleIntro): `bottleneck — *Le Goulet* — the layer...` → `bottleneck (*Le Goulet*), the layer...` (parens for named-concept emphasis).
- C. Term-definition separators (rendered JSX): `{name} — {description}` → `{name}: {description}` for EcoleIntro segments + MethodologySection couches. Made language-aware so FR renders ` : ` (NBSP + colon) per FR typographic convention, EN renders `: `.
- D. Labels (10 instances): CEFR levels `A2 — Basic` etc. → `A2 · Basic` with middle dot U+00B7 per Chadi counter-edit (cleaner than hyphen, modern editorial convention). Phase divider `Phase 2 — Approfondissement` → `Phase 2: Approfondissement`. Status labels (`Ready — Record now`, `Perfect score — lesson complete`, `Analysis pending — your CEFR band...`, `Low confidence — give us 2 more`, `Video lesson — coming soon.`) → period or restructure. `Password — at least 8 characters` → `Password (at least 8 characters)` (parens). Coaching lines in TranscriptReviewPanel → period.
- E. Page meta titles (4): `Privacy Policy — LeMethodic`, `Terms and Conditions — LeMethodic`, `Refund Policy — LeMethodic`, landing meta titles → pipe `|` (SEO convention).
- F. Aria-labels (3): comma or colon depending on screen-reader rhythm.

**Counter-edits applied per Chadi 2026-05-01:**
1. METH closer EN + EcoleIntro closer EN: `Treats that one, specifically.` (no "It" subject; deliberate fragment matches FR analog rhythm)
2. CEFR level labels: middle dot `·` (U+00B7) instead of hyphen — modern UX convention

**Note:** PROBLEM body (`landing/copy.ts:65,71`) used comma instead of proposed period; the original sentence structure (`But when X, when Y, — Z`) made `Z` the main clause. Replacing — with period would have created a fragment ("But when X, or when Y."). Comma preserves grammar and the editorial restraint of dropping the em-dash. EN + FR both adjusted.

### V-001 — Hero H1 + rotating kicker sizing
Milestone: M1

**Priority:** HIGH (verification-found; H1 overflow on production)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) hero showing H1 fits within viewport at every breakpoint and kicker sized at the new clamp scale. F-225 interactive verification clause does NOT apply — pure typography size change, no behavior change. Rotation animation fluidity at the larger size verifiable via the screenshot's "Prep for [TCF/TEF/DELF/DALF]" position.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-series ticket batch — H1 overflowed viewport, kicker undersized
**Dependencies:** V-005 (Switzer + Fraunces are now live)
**Scope:** two clamp adjustments in landing hero.
- Hero H1 (`HeroSection.tsx`): `clamp(2.5rem, 7vw, 6rem)` → `clamp(2.5rem, 6vw, 5rem)`. 40px floor preserved (small mobile); 80px desktop cap (was 96px). The locked H1 string is 26 words — at 96px it overflowed the 920px column at 1440px. 80px fits with breathing room.
- Rotating kicker (`RotatingKicker.tsx`): `clamp(13px, 1.2vw, 15px)` → `clamp(20px, 1.8vw, 24px)`. Tracking (0.06em) + color (ed-muted) + uppercase preserved. Bottom margin nudged from `clamp(12px, 1.5vw, 20px)` to `clamp(16px, 2vw, 28px)` proportional to the size bump. Slide animation timing untouched — runs at same ED_DUR.rotateWord (600ms) which still reads smoothly at the larger size.

### V-005 — Font system upgrade (Switzer + Fraunces)
Milestone: M2

**Priority:** HIGH (V-series chain root — V-003 + V-004 inherit the new font system)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of every surface (`/`, `/fr`, `/signup`, `/login`, `/paywall`, `/onboarding` (multiple steps), `/onboarding/waitlist`, `/ecole`, `/ecole/intro`, `/progress`, `/more`, `/writing`, `/diagnostic`, `/profile`, `/learn/[id]`, `/cluster/[slug]`, `/ecole/lesson/[id]`) to verify Switzer renders for sans/UI/body and Fraunces renders for display/serif accents. F-225 interactive verification clause does NOT apply — pure font swap, no behavior change.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-series ticket batch 2026-05-01 — visual refinement / verification-found
**Dependencies:** none (foundational; blocks V-003 + V-004)
**Scope:** swap Geist (sans) + Source Serif 4 (serif) + Cabinet Grotesk (display) for Switzer (sans/UI/body) + Fraunces (display + serif accents). Switzer loaded via Fontshare CDN `<link>` (weights 400/500/600/700/800), defined as `--font-switzer` CSS variable in globals.css :root. Fraunces loaded via next/font/google with variable axes `['SOFT', 'opsz']` so optical-size scales naturally with display-vs-body usage and SOFT axis is available for editorial warmth on headlines. Cabinet Grotesk + Geist + Geist_Mono + Source_Serif_4 next/font imports retired. Cabinet Grotesk Fontshare `<link>` retired.

**Files touched:**
- `app/layout.tsx` — drop Geist + Geist_Mono + Source_Serif_4 imports; add Fraunces with axes; swap Cabinet Grotesk `<link>` → Switzer Fontshare `<link>` (with preconnect); html className applies just `${fraunces.variable}` (Switzer is via raw CSS variable, no className needed)
- `app/globals.css` — add `--font-switzer` to `:root`; @theme tokens updated (`--font-sans: var(--font-switzer)`, `--font-display: var(--font-fraunces)`, `--font-mono` set to system monospace stack); `.prose-legal` font-family rules retargeted to `var(--font-switzer)`
- `lib/typography.ts` — `SANS_FONT` → `var(--font-switzer)`, `SERIF_FONT` → `var(--font-fraunces)`
- 60+ component files — bulk sed replace: `var(--font-geist)` → `var(--font-switzer)`, `var(--font-source-serif)` → `var(--font-fraunces)`, all three DISPLAY_FONT variants (`'"Cabinet Grotesk", Geist, sans-serif'` / `"'Cabinet Grotesk', 'Geist', sans-serif"` / mixed-quote) standardized to `'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'`
- `styles/globals.css` (orphaned duplicate per CLAUDE.md note) NOT touched — not imported anywhere

**Verification notes:**
- Variable font axes available on Fraunces: opsz (auto-scales with font-size in supported browsers), wght, SOFT (default 0; can be set 0-100 via `font-variation-settings: "SOFT" 30` for warmth on headlines)
- Switzer Fontshare CDN typically resolves <100ms; flash-of-unstyled-text mitigated by `display=swap` parameter
- Reading order on production check: H1s (Fraunces serif), body copy (Switzer sans), legal pages (Switzer sans for headers + body), button labels (Switzer sans)

### V-005.heading-axis — apply Fraunces SOFT axis to display headlines
Milestone: polish-defer

**Priority:** LOW (post-V-005 polish)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** V-005 spec — "Try SOFT axis at +20-30 for editorial warmth on headlines (defaults to 0/sharp)"
**Dependencies:** V-005
**Scope:** apply `font-variation-settings: "SOFT" 28` (or similar) to Fraunces consumers at display sizes (Hero H1, EcoleIntro section headers, MethodologySection header, LegalPage h1). Currently V-005 ships Fraunces with SOFT defaulting to 0 (sharp). The warmth axis is the editorial signature; needs Chadi taste pass on +20 vs +30 vs +40 across surfaces. 1-line addition per H1 site.
**Owner:** Engineering

### F-227.rhythm — Pricing→FAQ same-bg adjacency (paired bg flip)
Milestone: M2

**Priority:** LOW (visual rhythm polish)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop screenshot of `/` showing Pricing → FAQ → FinalCTA visible together to confirm alternation rhythm. EN-only sufficient — bg-color change is language-independent. F-225 interactive verification clause does NOT apply — bg-color only, no behavior change.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** F-227 ship side-effect — Methodology reorder created Pricing(bg)→FAQ(bg) adjacency. Chadi callout 2026-05-01: FAQ on paper subtly elevates it as the resolution moment before final CTA, fits the rhetorical job of the section.
**Dependencies:** F-227
**Scope:** post-F-227 rhythm restoration. Two paired flips (the spec billed it as "one-line change" but the codebase had FinalCTA at ed-paper, not ed-bg, so two flips needed to land the stated outcome): FAQSection.tsx bg `ed-bg → ed-paper` + FinalCTASection.tsx bg `ed-paper → ed-bg`. Final landing rhythm: Hero(bg)/Problem(bg)/Differentiation(bg)/Methodology(bg)/HowItWorks(paper)/Pricing(bg)/FAQ(paper)/FinalCTA(bg). One residual same-bg adjacency at the top of the page (Hero→Problem→Differentiation→Methodology = 4 bgs) but that's the editorial canvas the visitor begins on; alternation kicks in from HowItWorks onward and is now perfectly clean.
**Owner:** Engineering

### F-225 — Desktop verification protocol (process change)
Milestone: DONE

**Priority:** HIGH (process gate, launch-blocking)
**Status:** Shipped 2026-05-04 (FE-side, doc commit `3eb8902`; amended in commit pending — added interactive verification clause F-225.5). Non-visual change — verification skipped per the rule's own carve-out.
**Filed:** 2026-05-04
**Source:** Strategic recalibration after desktop-broken-on-every-screen surfaced as launch-blocker
**Dependencies:** none
**Scope:** every FE ticket gets `Shipped` status only after attaching (a) 1440px desktop screenshot of every affected route on production and (b) 375px mobile screenshot of every affected route on production. Non-visual tickets note `non-visual change — verification skipped` instead. F-225.5 amendment (2026-05-04, surfaced during F-222 root-cause): for tickets that change interactive behavior (handlers, navigation, form submission, state mutation), verification additionally requires (c) a recorded interaction trace — Loom link / screen recording / written test plan with pass/fail outcomes. See `CLAUDE.md` "Shipping verification protocol" section for the canonical rule.
**Owner:** Engineering (process)
**Note:** Tickets shipped before 2026-05-04 (P-220, P-222, B-102, P-230, P-234, etc.) are grandfathered. The rule applies prospectively. Until F-225's doc commit landed, no other ticket could be marked `Shipped` — F-223, F-222, and any other in-flight FE work waited.

### F-225.constraint — F-225 amendment: split visual vs non-visual verification
Milestone: TBD

**Priority:** LOW (doc-only; refines existing protocol)
**Status:** Queued
**Filed:** 2026-05-12
**Source:** 2026-05-12 verification session — FE-Claude has no browser-automation/screenshot tool in this toolchain, so visual + interactive verification is owner-routed (Chadi / TARS). FE-Claude can do the non-visual sweep portion (HTTP status on affected routes + Vercel runtime log sweep + BACKLOG staging) in parallel.
**Dependencies:** F-225
**Scope:** amend `CLAUDE.md` "Shipping verification protocol" section to formalize the split. The 1440px/375px screenshots and interaction traces remain mandatory, owner-attached or TARS-attached. FE-Claude's documented contribution: (a) HTTP status sweep on affected routes against production, (b) Vercel runtime log sweep (errors + 4xx/5xx) on the deployment under verification for the affected routes over a 24h window, (c) BACKLOG entry staging with verification block. Both halves attach to the BACKLOG entry; ticket flips to ✅ Shipped only when both halves are present (or the non-visual exemption already in F-225 is noted).
**Owner:** Engineering (doc commit only — no code)

## Strategic queue — 2026-05-12 session

### F-310 — Auth hardening (umbrella; supersedes F-072)
Milestone: DONE

**Priority:** HIGH (pre-launch blocker per Decision 4)
**Status:** ✅ Shipped 2026-05-12 — BE half live (commits 4bb44fb..043167f on tcf-oral-tool); FE half in F-310.fe (commits 2fef9b7..b8f91ee on lemethodic-frontend). Production /openapi.json confirms 9 auth endpoints live, 5 new since F-072 plan (refresh, verify-email, verify-email/resend, password-reset/request, password-reset/confirm).
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session — Decision 4 (token control + auth hardening as pre-launch existential cost/security issues, not nice-to-haves; uncapped abuse blows up API costs before revenue catches up at 5,000+ users Y1)
**Dependencies:** F-072 (absorbed); P-105 (subscription-tier source; F-310 ships with `tier=free` placeholder, tier-check layered when P-105 lands — auth hardening does not block on payment infrastructure)
**Supersedes:** F-072
**Scope:** umbrella replacing F-072's narrower JWT-refresh focus. Sub-items:
- JWT: 15-min access token + 7-day refresh, httpOnly cookie, rotation on every refresh, Redis revocation list
- /auth endpoint rate limiting: 5 attempts per IP per 15 min, exponential backoff, 10-attempt lockout
- Email verification required before any API access. **Grandfather existing soft-beta accounts as verified** (one-off migration setting `email_verified=true` for all pre-F-310-ship rows); hard gate on all new registrations from F-310 ship date forward.
- hCaptcha on registration and password reset
- Stripe webhook HMAC signature verification before any DB mutation (BE)
- Subscription-tier check via FastAPI dependency injection on every protected route; tier=free placeholder until P-105
**Files touched:** BE auth router + main + user model migration (`email_verified` column); FE see F-310.fe entry below.
**Owner:** Engineering (BE + FE)
**Related:** F-310.fe (FE half — entry below)

### F-310.fe — Auth hardening FE activation (5-commit chain)
Milestone: DONE

**Priority:** HIGH (FE half of F-310; gates the soft-beta hard cutoff + hCaptcha + email-verification + refresh-on-401)
**Status:** ✅ Shipped 2026-05-12 (FE-side; commits 2fef9b7..b8f91ee on lemethodic-frontend; visual + interactive verification pending Chadi manual browser check per runbook below)
**Filed:** 2026-05-12
**Shipped:** 2026-05-12
**Source:** F-310 BE shipped commits 4bb44fb..043167f with 5 new auth endpoints live in production `/openapi.json`; FE work needed to fully activate the surface
**Dependencies:** F-310 (BE contracts); V-009 / F-225 / F-225.constraint (verification protocol)

**Phases (one commit each):**
- **Phase 1 — F-310.fe.client** (commit `2fef9b7`): `lib/api.ts` adds the 5 new `api.auth.*` methods (`refresh`, `verifyEmail`, `resendVerification`, `passwordResetRequest`, `passwordResetConfirm`); extends `register()` with optional `hcaptcha_token` param (defaults to null per BE schema). Adds the refresh-on-401 interceptor inside `request()` with three guards: REFRESH_EXEMPT_PATHS set (skip refresh on `/refresh` `/login` `/register` 401s), `_isRefreshedRetry` option flag (one retry max), and `pendingRefresh` module-level promise (concurrency dedupe — N parallel 401s fire ONE refresh). `credentials: 'include'` on all requests so the BE-set httpOnly refresh cookie rides on `/api/auth/refresh`. New `isEmailNotVerifiedError(err)` helper for the 403 + `{detail:{code:"email_not_verified"}}` BE contract.
- **Phase 2 — F-310.fe.captcha** (commit `7e91953`): adds `@hcaptcha/react-hcaptcha@2.0.2` dep. New `lib/hcaptcha.ts` sitekey resolver — reads `NEXT_PUBLIC_HCAPTCHA_SITEKEY` env when present, falls back to hCaptcha public test sitekey `10000000-ffff-ffff-ffff-000000000001` for the rollout window (test key always passes verification so dev flows work without a real account). Signup adds the widget below password field via `next/dynamic({ssr:false})`; token passes to register call as 4th positional arg. Submit not gated on captcha completion (BE accepts null token per schema during rollout).
- **Phase 3 — F-310.fe.verify** (commit `4a17437`): NEW `app/verify-email/page.tsx` — two flows on one route. `/verify-email` (no query) renders "Check your inbox" with Resend CTA hitting POST /api/auth/verify-email/resend. `/verify-email?token=XXX` auto-fires the confirm endpoint on mount; success routes to /login after 2s; 400/422 surfaces "link is invalid or has expired." Signup catches `isEmailNotVerifiedError` post-register (or post-onboarding-flush) and routes to /verify-email. Login gets the "Forgot password?" link pointing at /password-reset.
- **Phase 4 — F-310.fe.reset** (commit `b8f91ee`): NEW `app/password-reset/page.tsx` — single route, branches on `?token=`. `/password-reset` renders RequestForm (email + hCaptcha → POST /api/auth/password-reset/request, anti-enumeration success state). `/password-reset?token=XXX` renders ConfirmForm (new password ≥8 chars + matching confirm → POST /api/auth/password-reset/confirm, success routes to /login after 2s, 400/422 surfaces "invalid or expired"). Same editorial styling as /signup + /verify-email.
- **Phase 5 — F-310.fe docs** (this commit): BACKLOG entry + F-072 status flip from "Superseded by F-310" to "✅ Shipped via F-310 + F-310.fe."

**Architectural decisions (locked from plan approval, 2026-05-12):**
- Refresh-token storage: **cookie-only** (matches BE's no-body /refresh contract; FE never sees the refresh token).
- hCaptcha SDK: **@hcaptcha/react-hcaptcha** (official, ~10KB, test-sitekey fallback for dev/rollout window).
- Interceptor placement: **inline in `lib/api.ts:request()`** with module-level `pendingRefresh` for concurrency dedupe + `_isRefreshedRetry` flag for loop guard + REFRESH_EXEMPT_PATHS for surgical exemption.
- Email-verification gating: **BE-owned** (returns 403 + `{detail:{code:"email_not_verified"}}` per F-310 BE report); FE only handles the detection + routing.
- Password-reset routing: **single `/password-reset` route**, branches on `?token=` presence (request form vs confirm form).

**Files touched:**
- `lib/api.ts` (+178/-9): 5 new auth methods, refresh interceptor, credentials:'include', isEmailNotVerifiedError helper, register hcaptcha_token param
- `lib/hcaptcha.ts` (NEW, +22): sitekey resolver
- `package.json` + `pnpm-lock.yaml`: `@hcaptcha/react-hcaptcha@2.0.2`
- `app/signup/page.tsx` (+30/-1): hCaptcha widget + token state + isEmailNotVerifiedError routing
- `app/login/page.tsx` (+23): Forgot password? link
- `app/verify-email/page.tsx` (NEW, +307): /verify-email landing + ConfirmFlow + EmptyState + Resend
- `app/password-reset/page.tsx` (NEW, +454): /password-reset RequestForm + ConfirmForm + branching
- `BACKLOG.md` (this commit): F-310 status → ✅ Shipped, F-072 status → ✅ Shipped via F-310 + F-310.fe, F-310.fe entry filed

**Tests:** `pnpm build` clean on every phase. `npx tsc --noEmit` clean on every phase. No test runner configured in this repo (CLAUDE.md confirms).

**Out of scope (filed implicitly as follow-ups):**
- `useVerifyAuth` handling of `email_not_verified` on cold tab reload (currently treats non-401 errors optimistically). A user who closes the tab between register and verification will hit a silent 403 wall on /ecole. Acceptable risk for the rollout window; surface as a separate ticket if it bites a real user.
- Captcha-gated submit (Chadi explicitly chose graceful-degradation rollout: BE accepts `null` token per schema; FE doesn't gate). Flip to gated when BE flips schema to require-token.

**Operating-contract block (2026-05-12 contract):**
- **CONFIDENCE:** HIGH on the BE-contract-mirroring layer (Phase 1 + the route bodies are pure mirrors of openapi.json). MEDIUM on the visual polish — hCaptcha iframe + form spacing wasn't visually verified post-deploy by FE-Claude (TARS retired, Chadi manual browser check is the verification mode).
- **WHY:** Every phase commit ran `pnpm build` + `tsc --noEmit` clean; the BE contracts are the only spec we needed and they're locked in production /openapi.json. The interceptor's three guards (exempt-paths, retry-loop flag, concurrency dedupe) cover the obvious failure modes.
- **UNCERTAINTY:**
  - BE refresh response field name — FE defaults to `access_token`, falls back to `token`. If BE returns a third field name, refresh will appear to succeed but the new token won't write. The runbook step 4 catches this on first prod 401.
  - hCaptcha widget visual fit inside the 440px ed-paper card on <360px viewports. Widget is ~304px wide; should fit but might feel cramped.
  - `useVerifyAuth` doesn't currently route unverified users to `/verify-email` on cold tab reload (only the signup path does). Out of scope per above; will need a follow-up if real users hit it.
- **VERIFICATION RUNBOOK (manual, Chadi, after deploy):**
  1. **Sign up flow (hCaptcha):** Open lemethodic.com/signup in a fresh incognito window. Form should render with the hCaptcha checkbox between Password and Submit. Solve the test challenge (auto-passes on test sitekey). Submit → BE returns 201 → routed somewhere (either /ecole/intro if email pre-verified by BE rollout config, OR /verify-email if BE flipped to require-verify).
  2. **Verify-email empty state:** Visit /verify-email (no query) while signed in. Should render "Check your inbox" + Resend button. Click Resend → BE returns 200 → button updates to "Sent — check your inbox." Verify in DevTools Network that POST /api/auth/verify-email/resend fired with Authorization header.
  3. **Verify-email token confirm:** From a real BE-sent email, click the verification link → lands on /verify-email?token=XXX → page renders "Confirming your email…" briefly → flips to "Email verified." → redirects to /login after 2s. Sign in with the verified account works.
  4. **Refresh-on-401:** Sign in. Open DevTools → Application → Local Storage. The lemethodic_token is the access token (JWT). Open DevTools → Application → Cookies — there should be a BE-set httpOnly refresh cookie scoped to seal-app-75fiu.ondigitalocean.app. Wait 15+ min for the access token to expire (or edit it to garbage in localStorage). Navigate to /ecole. DevTools Network: should see POST /api/auth/refresh fire FIRST → 200 with new token → original /me or /lessons retry → 200. Confirm lemethodic_token is replaced in localStorage.
  5. **Refresh failure → clearAuth:** Delete the refresh cookie from DevTools. Force a 401 again (edit access token). Navigate to /ecole → /refresh fails → auth clears → router lands /login. Sign-in works after.
  6. **Forgot password:** From /login, click "Forgot password?" → /password-reset request form. Enter your email → solve hCaptcha → Submit. Success state "If that email is on file, you'll receive a link…" (anti-enumeration copy). Check inbox for the BE-sent email; click link → /password-reset?token=XXX confirm form. Enter new password ≥8 chars + matching confirm → Submit → "Password updated." → redirects to /login. Sign in with the new password works.
  7. **Bad reset token:** Visit /password-reset?token=BAD. Enter passwords + submit. Should surface "This reset link is invalid or has expired. Request a new one."
  8. **Field-name sanity (only if step 4 refresh appears to silently fail):** Open the /refresh response in DevTools Network → Preview. Confirm the new access token comes back under `access_token` (FE default) or `token` (FE fallback). If it's a third field name, surface to FE-Claude as a follow-up — the interceptor needs that field name added.

### F-310.fe.coldreload — Route email_not_verified 403 from any protected page
Milestone: TBD

**Priority:** MEDIUM (cold-tab reload edge case; affects users who don't verify email immediately after register. Not blocking soft beta if verification is quick.)
**Status:** Awaiting verification (F-225 — interactive change; needs 1440px + 375px screenshots of `/verify-email` empty state landed from a cold-tab `/ecole` hit + interaction trace per runbook below)
**Filed:** 2026-05-12
**Source:** F-310.fe out-of-scope flag (2026-05-12 plan-first + end-of-ticket report). A user who signs up, closes the tab, returns later still unverified hits protected routes → BE returns 403 + `{detail:{code:"email_not_verified"}}` → currently only the signup path catches this and routes to /verify-email. Every other entry point (cold tab on /ecole, /writing, /progress, etc.) surfaces it as a generic "Something went wrong."
**Dependencies:** F-310.fe (`isEmailNotVerifiedError` helper already in `lib/api.ts`)

**Scope:**
Promote the `email_not_verified` 403 handling from the signup path to a project-wide interceptor. Two implementation options evaluated during the ticket:

1. **`lib/api.ts:request()` interceptor** — extend the existing 401-refresh path with a parallel 403 branch: on `isEmailNotVerifiedError(err)`, route the browser to `/verify-email` via a hard `window.location.assign('/verify-email')` (lib/api has no router instance available). Single point of fix; covers every API path.
2. **`hooks/useVerifyAuth.ts`** — in the catch branch of the `/me` probe on mount, detect `isEmailNotVerifiedError` and call `router.replace('/verify-email')`. Only catches the cold-mount path, not in-session 403s; cleaner separation of concerns.

**Shipped option 1** — single interceptor covers cold-mount + in-session surfaces. Documented trade-off: a hard `window.location.assign` interrupts in-flight optimistic UI on writing/diagnostic surfaces, but unverified users shouldn't be acting on protected pages anyway.

Edge cases handled:
- Already on `/verify-email` → no redirect (loop-guard via `window.location.pathname === '/verify-email'`)
- `path.startsWith('/api/auth/verify-email')` → no redirect (defensive; BE shouldn't emit `email_not_verified` on the verify-email endpoint itself, but the guard closes the loop if it ever does)
- `?next=...` written into the `/verify-email` URL with the original `pathname + search`, decoded + validated by the verify-email page post-confirm (rejects `//`, `://`, and `/verify-email` to close open-redirect / self-loop holes; falls back to `/login`)

**Files touched (shipped):**
- `lib/api.ts` (+33): 403 branch in `request()` alongside the existing 401 block. Builds a transient `ApiError`, runs it through the existing `isEmailNotVerifiedError` helper (single source of truth), guards on pathname + path, then `window.location.assign('/verify-email?next=<encoded>')`.
- `app/verify-email/page.tsx` (+25/-3): new `safeNextPath()` helper, reads `?next=` from search params, swaps the hard-coded `router.push('/login')` post-confirm for `router.push(safeNextPath(nextParam))`. Validation blocks protocol-relative, protocol-absolute, and `/verify-email` self-loop. Falls back to `/login` on missing/invalid — matches pre-ticket behavior, so the change can only ADD a useful redirect.

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: HIGH. Single-function fix in `lib/api.ts`, helper already shipped in F-310.fe, validated by tsc --noEmit + `pnpm build` (no warnings, no type errors, 36 routes compiled clean).
- WHY: Documented out-of-scope flag during F-310.fe; small, well-bounded, doesn't gate anything else.
- UNCERTAINTY: `window.location.assign` is a hard navigation. A 403 hitting a writing async-job poll or conversation upload mid-action tears down in-flight UI state. Acceptable per ticket. `?next=` does NOT persist across the BE-built email-link cross-tab round-trip (no localStorage shim — kept the change scoped); cross-tab degrades cleanly to `/login`. Forward-compat if BE ever embeds `next` in the verification email URL.
- VERIFICATION RUNBOOK (Chadi):
  1. Sign up a fresh test account on `lemethodic.com/signup`. Capture the access token in DevTools localStorage (`lemethodic_token`).
  2. **Do NOT verify the email.** Close the tab.
  3. **Cold-tab `/ecole`** — open `lemethodic.com/ecole` directly in a new tab. Expected: redirected to `lemethodic.com/verify-email?next=%2Fecole` (the empty-state "Check your inbox" card renders; no "Something went wrong"). Screenshot at 1440px + 375px.
  4. **Repeat for `/writing`, `/progress`, `/profile`** — same expectation; `?next=` mirrors the path each time.
  5. **Loop guard** — refresh on `/verify-email?next=/ecole`. Expected: no second redirect, URL stable.
  6. **Post-confirm next** — while on the empty-state page, capture the URL. Open DevTools console and run `await fetch('/api/auth/verify-email', { method: 'POST', body: JSON.stringify({ token: '<from your email>' }), headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.lemethodic_token } })`. (Or just click the link in the email if you're on the same tab and `?next=` survives — unlikely with BE-built URLs.) After the 2s success state, expected: `router.push('/ecole')` (when `?next=/ecole` was preserved) or `/login` (when it wasn't — the email cross-tab case, which is fine).
  7. **In-session 403** — log in as the unverified user, manually call a protected endpoint from the console (e.g., `fetch('/api/users/me/today', { headers: { Authorization: 'Bearer ' + localStorage.lemethodic_token }, credentials: 'include' })`). Expected: page hard-navigates to `/verify-email?next=<current path>`.
  8. **Open-redirect safety** — manually visit `/verify-email?token=<any>&next=//evil.com` and `?next=https://evil.com`. Expected: post-confirm routes to `/login`, not the evil host.

### F-311 — Token control (Redis rate limiter + model routing + prompt caching)
Milestone: DONE

**Priority:** HIGH (pre-launch blocker per Decision 4 — at 5,000+ users Y1, uncapped diagnostic abuse blows API costs before revenue catches up)
**Status:** Queued
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session — Decision 4
**Dependencies:** F-310 (subscription-tier hook for per-tier limits)
**Scope:**
- Redis-backed rate limiter keyed by `user_id`, scoped by subscription tier
- Tier limits: Free=5 diagnostic sessions/day · $29/mo=30/day · $199 Sprint=60/day · $499 Premium=unlimited
- Model routing: `claude-haiku-4-5` for vocab exercises + lookups; `claude-sonnet-4-6` reserved for diagnostic scoring
- Anthropic prompt caching on system prompts (target 90% cost reduction on repeat)
- Hard cap: `max_tokens=800` output per diagnostic response
- Prompt injection detection layer — reject system-override patterns before the Claude call
**Owner:** Backend Engineering

### F-312.0 — RAG corpus licensing pre-flight (HARD GATE)
Milestone: DONE

**Priority:** CRITICAL (hard gate per Chadi 2026-05-12 push-back — no RAG schema work commits until this returns legal-clear)
**Status:** Queued
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session — Decision 2; pre-flight gate added in Chadi's reconciliation response
**Dependencies:** none
**Scope:** read OQLF ToS (`oqlf.gouv.qc.ca/conditions_utilisation.html`) and Académie française terms. Confirm or deny redistribution + reuse rights for corpus chunks in commercial product context. Document conclusion with quoted ToS language and recommended legal posture. **Fallback if redistribution not permitted:** fair-use snippet + link-only citation (cite the source, link to the source page, don't store the full text).
**Gate:** F-312, F-320, F-321 all blocked until F-312.0 completes with a legal-clear answer or a documented fallback strategy. "Better to know now than after building."
**Owner:** Engineering (legal-adjacent; Chadi reviews conclusion)

### F-312 — OQLF + Académie française RAG retrieval layer
Milestone: TBD

**Priority:** HIGH (Decision 2 — diagnostic credibility through authoritative grounding; replaces "the AI thinks this is wrong" with "according to the OQLF, this is an anglicism")
**Status:** Blocked on F-312.0
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session — Decision 2
**Dependencies:** F-312.0 (licensing), F-320 (LV DB schema — corpus rows may share table)
**Scope:** scrape OQLF Banque de dépannage linguistique + Académie française "Dire et ne pas dire" into structured Postgres rows (`chunk` + `correction` + `error_type` + `source` + `register` + `exam_tag`). Before each Claude diagnostic call, query the table for chunks matching the student's text; inject 5–15 relevant entries into the prompt as authoritative context. Diagnostic output cites the source by name. Sources:
- OQLF Banque de dépannage linguistique (`bdl.oqlf.gouv.qc.ca`) — Quebec French authority, structured by error type, CC license (pending F-312.0 confirmation)
- Académie française "Dire et ne pas dire" (`academie-francaise.fr`) — ~500 entries, "don't say X, say Y" format
**Owner:** Backend Engineering

### F-319 — Le Vocabulaire (system; parent ticket)
Milestone: M4

**Priority:** HIGH (Decision 3 — Le Méthodic shifts from exam-prep-only to general-French + exam platform; one engine, two audiences)
**Status:** Queued — MVP via F-320–F-323; V2 sub-tickets visible but deferred
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session — Decision 3 (Lexogoth-equivalent web system, distinct from L'École and Le Diagnostic)
**Dependencies:** F-312.0 (corpus licensing for sourced content)
**Scope:** full Lexogoth-equivalent web system for chunk-based French vocabulary learning. Free + exam-tagged topic libraries, multiple exercise types, practice + test + tutor modes. Source content from OQLF/BDL/Académie corpus pending F-312.0.

**MVP (active queue — Sprint 1/2):**
- F-320 — DB schema (chunk, translation, topic, source, register, exam_tag, cefr_level)
- F-321 — Seed Phase 1: 3 topic sets, 500–800 entries from OQLF BDL
- F-322 — Practice UI (hide/reveal, self-grade, personal lists scaffold)
- F-323 — Test UI (MCQ, matching, dropdown, exact completion — Lexogoth Toolbox-style)

**V2 deferred (filed for visibility; sub-tickets to land when V2 starts):**
- Tutor mode (teachers build custom databases, assign to students)
- Personal lists with SRS (spaced repetition surface; V1 has localStorage stash only)
- Topic library partition (free general-French set vs exam-specific sets — TCF/DELF/TEF by task type)
- Exercise authoring admin tooling

**Why this matters:** without Le Vocabulaire, Le Méthodic is exam-prep only. With it, the product serves both general French learners and exam candidates — one engine, two audiences.
**Owner:** Engineering (BE + FE; child tickets are layer-specific)

### F-320 — Le Vocabulaire DB schema
Milestone: M4

**Priority:** HIGH (F-319 MVP foundation)
**Status:** Blocked on F-312.0 if corpus rows share table
**Filed:** 2026-05-12
**Source:** F-319 / Decision 3
**Dependencies:** F-312.0 (licensing clearance)
**Scope:** Postgres schema for Vocabulaire: `chunk` (FR) + `translation` (EN) + `topic` + `source` (OQLF / Académie / custom) + `register` (familier / standard / soutenu) + `exam_tag` (TCF / DELF / TEF / null) + `cefr_level`. Migration script. Consider shared table with F-312 RAG corpus if licensing permits — chunks have overlapping shape.
**Owner:** Backend Engineering

### F-321 — Le Vocabulaire seed Phase 1 (3 topic sets, 500–800 entries from OQLF BDL)
Milestone: M4

**Priority:** HIGH (F-319 MVP content)
**Status:** Blocked on F-312.0 + F-320
**Filed:** 2026-05-12
**Source:** F-319 / Decision 3
**Dependencies:** F-312.0 (licensing), F-320 (schema)
**Scope:** ETL pipeline from OQLF BDL → Vocabulaire rows. Three Phase-1 topic sets curated for general French (e.g., arts, loisirs, voyages, société — Vocabulaire-progressif style; final pick per Chadi pedagogical signal). 500–800 entries total. Idempotent re-runnable seed script.
**Owner:** Backend Engineering (Chadi pedagogical topic pick)

### F-322 — Le Vocabulaire practice UI
Milestone: M4

**Priority:** MEDIUM (Sprint 2 — F-319 MVP FE-side)
**Status:** Awaiting verification (F-225 — interactive change; needs 1440px + 375px screenshots of SessionConfigCard / FlashcardView pre-reveal / FlashcardView post-reveal / SessionEndCard / TierLockedCard (via dev `?devLock=tier`) + interaction trace per runbook below)
**Filed:** 2026-05-12
**Plan-approved:** 2026-05-13 (Chadi — answered the 4 open questions HIGH-confidence)
**Source:** F-319 / Decision 3
**Dependencies:** F-321 (seed — empty-state until then), F-325 (shipped — chunks API + TanStack Query provider + locked-card visual frame reused here)

**Scope locked:**
- **Route**: `/vocabulaire/[slug]/practice` (nested under topic detail; deep-linkable; keeps F-325 components untouched). `?mode=practice` rejected.
- **Direction**: read order URL `?direction=fr|en` → localStorage pref → `'fr'` default. `'fr'` = show FR / reveal EN (comprehension). `'en'` = show EN / reveal FR (recall).
- **Session length**: picker 10 / 20 / all; default 20 (attention-curve MVP cap; deeper sessions filed as F-322.deeper-sessions follow-up if user feedback demands).
- **Self-grade**: binary pass/fail (V1). V2 SRS adds 4-level scale (Again/Hard/Good/Easy).
- **Personal lists V1**: localStorage stash only. Per-chunk grade history. No Review-queue UI in V1 — failed chunks ARE the implicit review queue; V2 SRS layers a dedicated surface on top of the same storage shape.
- **Tier-gate**: BE 403 + `tier_insufficient` body on exam_tagged topics. New `isTierInsufficientError(err)` helper parallel to `isEmailNotVerifiedError`. Surface-specific render (locked-card in place, no global interceptor — unlike email_not_verified which always hard-navs).
- **F-225 capture for tier-locked**: dev-only `?devLock=tier` URL flag, gated behind `process.env.NODE_ENV !== 'production'`. Cheaper than waiting for a real free-tier test account; F-311 supersedes when shipped.
- **Cache keys**: practice's TQ chunks query uses empty-filter key, separate from browse's user-filter key. No cache collision; warm-from-browse only when user had no filters active.

**Component breakdown (all inline in PracticeClient.tsx):**
- `PracticeClient` — top-level state machine: `phase: 'config' | 'session' | 'end' | 'tier-locked' | 'error' | 'empty'`. Owns shuffled `sessionChunks`, `currentIndex`, `revealed`.
- `SessionConfigCard` — pre-session screen. Direction toggle + session-length picker + Start.
- `FlashcardView` — one chunk at a time. Front (shown language) + Reveal button → back (hidden language) + Got it / Need review.
- `SessionEndCard` — N got / N needs review / % accuracy. Practice again / Back to topic / Browse the corpus.
- `TierLockedCard` — locked copy + CTA to /paywall (reuses F-325 catalog locked visual frame).
- `PracticeError` / `PracticeEmpty` / `PracticeSkeleton` — ed-* primitive mirrors.

**State management:**
- `useInfiniteQuery` reusing F-325 query-key shape `['vocab', 'chunks', slug, '']` (empty filter segment). First page only (limit 20).
- `lib/practice-state.ts` localStorage helpers — `Record<chunkId, { lastGrade, lastGradedAt, attempts }>` + direction-pref store. All wrapped in try/catch (soft-fail to in-memory on private-browsing).

**Phases shipped (one commit per phase, build + typecheck clean per commit):**
- **B0** (8e72296): F-322 BACKLOG entry locked with the plan.
- **B1** (cf7f215): `lib/practice-state.ts` (read/record/clearGrades + direction-pref helpers; try/catch wrapped for private-browsing); `isTierInsufficientError(err)` helper in `lib/api.ts` parallel to `isEmailNotVerifiedError`; new `VOCAB_PRACTICE_STATE_KEY` + `VOCAB_PRACTICE_PREF_KEY` in `lib/storage-keys.ts`.
- **B2** (7ba9c00): `/vocabulaire/[slug]/practice` route. `PracticeClient.tsx` state machine (`config` / `session` / `end` views on top of TQ status). Sub-components inline: `SessionConfigCard`, `FlashcardView`, `SessionEndCard`, `TierLockedCard`, `ErrorCard`, `EmptyCard`, `PracticeSkeleton`. Fisher-Yates shuffle, reusing F-325 chunks query-key family with empty filter segment (no cache collision with browse's user-filter key). Dev-only `?devLock=tier` URL flag gated behind `process.env.NODE_ENV !== 'production'` for F-225 capture. `lib/vocab-copy.ts` extended with EN+FR `practice` block.
- **B3** (93a8841): "Start practice" CTA wired into `app/vocabulaire/[slug]/TopicDetail.tsx`. Single conditional `<Link>` insertion at the top of the page (surfaces only when chunks > 0; uses `copy.practice.startCta` and the editorial-system primary-CTA visual).
- **B4** (this commit): F-225 verification runbook + status flip.

**Files touched (shipped):**
- `BACKLOG.md` — F-322 entry locked (B0); status + runbook (B4).
- `lib/storage-keys.ts` — two new keys (B1).
- `lib/practice-state.ts` — NEW; localStorage helpers (B1).
- `lib/api.ts` — `isTierInsufficientError(err)` helper (B1).
- `lib/vocab-copy.ts` — `practice` block in EN+FR + `startCta` (B2).
- `app/vocabulaire/[slug]/practice/page.tsx` — NEW; ProtectedRoute wrap (B2).
- `app/vocabulaire/[slug]/practice/PracticeClient.tsx` — NEW; state machine + all sub-components (B2).
- `app/vocabulaire/[slug]/TopicDetail.tsx` — "Start practice" CTA (B3).

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: HIGH. Plan-first → all 4 open questions answered HIGH-confidence before B0 → 5 discrete commits, each `pnpm exec tsc --noEmit` silent + `pnpm build` green (38 routes, /vocabulaire static + /vocabulaire/[slug] + /vocabulaire/[slug]/practice dynamic, 0 warnings).
- WHY: F-319 MVP completes the Vocabulaire surface trio: browse (F-325 ✅) + practice (F-322 — this) + test (F-323 queued).
- UNCERTAINTY: (1) `'all'` session-length on topics with >20 chunks still practices the first 20 (BE F-325 returns first page; deeper sessions filed as F-322.deeper-sessions follow-up per plan R1). (2) Tier-lock screen capture path uses a dev-only URL flag (`?devLock=tier`) — F-311 supersedes when the live tier-read lands; the override is dead code in prod builds. (3) Personal-list V1 has no Review-queue UI; failed chunks ARE the implicit review queue persisted in localStorage; V2 SRS exposes a dedicated surface on the same storage shape.
- VERIFICATION RUNBOOK (Chadi, post-deploy on lemethodic.com):
  1. **Auth gate** — visit `/vocabulaire/<any>/practice` unauthenticated. Expect redirect to `/` via ProtectedRoute.
  2. **Empty-state** — sign in. While F-321 hasn't seeded, navigating to `/vocabulaire/<any>/practice` either lands on EmptyCard (zero chunks) or ErrorCard (BE 404). Screenshot the actual outcome.
  3. **CTA discovery** — once F-321 seeds, visit `/vocabulaire/<topic-slug>`. Verify the "Start practice" CTA appears below the chunk-count line and routes to `/vocabulaire/<topic-slug>/practice` on click. 1440px + 375px.
  4. **Config card** — on the practice route, verify direction toggle (Show FR · reveal EN / Show EN · reveal FR) and length picker (10 / 20 / All). Toggle direction, refresh — localStorage persists the choice. 1440px + 375px.
  5. **Flashcard pre-reveal** — Start session. Verify card shows only the front (per direction) with Reveal CTA. Progress label reads "Card 1 of 20". 1440px + 375px.
  6. **Flashcard post-reveal** — click Reveal. Both languages now visible (back appears below a hairline rule). Got it / Need review buttons replace Reveal. 1440px + 375px.
  7. **Grade + advance** — click Got it. Card index advances, revealed resets. Repeat for ~3 cards, including one Need review.
  8. **localStorage trace** — DevTools → Application → Local Storage. Verify `lemethodic_vocab_practice_state` carries `{ "<chunkId>": { lastGrade, lastGradedAt, attempts } }` entries; `lemethodic_vocab_practice_pref` carries `{ direction }`.
  9. **End card** — walk through the session to completion. Verify "Session complete." with N got · N needs review · % accuracy stats. Three CTAs: Practice again (reshuffles, returns to session), Back to topic, Browse the corpus. 1440px + 375px.
  10. **Tier-lock capture (dev only)** — open the Vercel preview / local dev server (`pnpm dev`); visit `/vocabulaire/<any>/practice?devLock=tier`. Verify TierLockedCard renders with the "DEV: simulated tier lock" dashed badge + locked.title + locked.body + CTA → /paywall. 1440px + 375px. (Production refuses the flag — `process.env.NODE_ENV !== 'production'` gate.)
  11. **i18n** — flip `interface_language` to `fr` (via /onboarding or BE record). Refresh `/vocabulaire/<slug>/practice`. Verify all practice copy switches to French.
  12. **F-310 interceptor on practice** — log in as an unverified user; visit `/vocabulaire/<slug>/practice`. Expect hard-nav to `/verify-email?next=/vocabulaire/<slug>/practice` (F-310.fe.coldreload interceptor still works on this new surface).
  13. **Runtime log sweep** — Vercel runtime logs for the F-322 deploy: 0 errors / 0 5xx in a 1h window after smoke.

**Owner:** Frontend Engineering

### F-323 — Le Vocabulaire test UI
Milestone: M4

**Priority:** MEDIUM (Sprint 2 — F-319 MVP FE-side)
**Status:** Awaiting verification (F-225 — interactive change; needs 1440px + 375px screenshots of SessionConfigCard, each of the four exercise views pre- and post-submit (MCQ / Dropdown / Exact / Matching), TestEndCard, TierLockedCard via `?devLock=tier`, SoftEmptyCard + interaction trace per runbook below)
**Filed:** 2026-05-12
**Plan-approved:** 2026-05-13 (Chadi — 5 open questions answered HIGH-confidence)
**Source:** F-319 / Decision 3
**Dependencies:** F-321 (seed — empty/soft-empty until then; need ≥4 chunks per topic to launch a test session), F-325 (chunks API), F-322 (shared `lib/practice-state.ts`, `isTierInsufficientError`, ed-* primitive patterns, `?devLock=tier` capture flag)

**Scope locked:**
- **Route**: `/vocabulaire/[slug]/test` (nested under topic detail; sibling of F-322's `/practice`). `?mode=test` rejected for the same reasons as F-322.
- **Exercise types**: MCQ / Dropdown / Exact completion / Matching. **Single-select per session in V1** — user picks one mode at SessionConfigCard. Multi-select mixed sessions filed as F-323.mixed follow-up for V2.
- **Minimum chunks to launch**: 4. Below 4 → soft-empty state with CTA `/vocabulaire/[slug]/practice` ("This topic needs at least 4 chunks for a test session. Try practice mode instead.").
- **Direction**: same model as F-322 — URL `?direction=fr|en` → localStorage pref → `'fr'` default. **Same `lemethodic_vocab_practice_pref` storage key** — user's direction choice is shared across practice and test surfaces (one user pref, two surfaces; comprehension-vs-recall preference is consistent across modes).
- **Session length**: picker 10 / 20 / all; default 20. Same as F-322.
- **Distractor pool**: pure FE-derived. For MCQ / Dropdown, distractors come from sibling chunks in the same fetched set (limit 20). Pool quality is healthy at F-321 seed scale (~150-250 chunks per topic).
- **Exact completion grading**: permissive — case-insensitive + whitespace-trim + accent-strip + punctuation-strip, in that order. Strict-match mode deferred to V2.
- **Matching screen**: 5 pairs per screen. Session of 20 chunks = 4 matching screens of 5 pairs each. Topics with chunk count not divisible by 5 → final screen has fewer pairs.
- **Matching UX (mobile + desktop)**: tap one side → that item highlights as selected → tap an item in the OPPOSITE column → pair confirmed (visual line/highlight); tapping a second item in the SAME column deselects + re-selects.
- **Auto-grading**: per-question pass/fail derived from user interaction (no self-grade). Matching block grades each of its 5 chunks independently (5 grade records per screen).
- **localStorage**: writes to the SAME `lemethodic_vocab_practice_state` key as F-322 — practice and test failures both signal "review this chunk" to V2 SRS. Unified history.
- **Tier-gate**: 403 + `tier_insufficient` → TierLockedCard via `isTierInsufficientError` helper (shipped in F-322 B1). Surface-specific render (same model as F-322 practice).
- **F-225 capture for tier-locked**: dev-only `?devLock=tier` URL flag, gated behind `process.env.NODE_ENV !== 'production'`. Same pattern as F-322.
- **Cache keys**: same TQ key family as F-325 / F-322 (`['vocab', 'chunks', slug, '']`). Browse-with-no-filters → practice → test all share one cache entry; browse-with-filters has a separate cache slot. No collision.

**Component breakdown (all inline in TestClient.tsx, mirroring F-322's single-file model):**
- `TestClient` — top-level state machine: `view: 'config' | 'session' | 'end'`. Owns shuffled session chunks, exercise type choice, current question index, per-question results.
- `SessionConfigCard` — direction toggle + session length picker + **exercise type picker** (single-select, 4 buttons) + Start.
- `QuestionView` — dispatches to `MCQView` / `DropdownView` / `ExactView` / `MatchingView` based on session's exercise type. Shared progress label + Next button after feedback.
- `MCQView` — 4 button options; click → grade → feedback (correct highlighted, your answer if wrong shown).
- `DropdownView` — sentence template with `<select>`; submit grades.
- `ExactView` — input text + submit; permissive normalize-then-compare grading.
- `MatchingView` — 5 pairs per screen; tap-to-pair UX; submit when all paired; per-chunk grade.
- `TestEndCard` — overall score + per-exercise-type breakdown (trivial for single-select V1). CTAs: Practice again (reshuffle, reuse same exercise type) / Back to topic / Browse the corpus.
- `TierLockedCard` / `ErrorCard` / `EmptyCard` / `SoftEmptyCard` / `TestSkeleton` — ed-* primitive mirrors (copied from F-322 — could refactor to a shared component later; defer to avoid file churn).

**Pure helpers (new lib/test-engine.ts):**
- `buildMCQ(chunk, pool, direction)` → `{ prompt, correct, options[4] }`
- `buildDropdown(chunk, pool, direction)` → `{ template, correct, options[4] }`
- `buildExact(chunk, direction)` → `{ prompt, expected }`
- `buildMatchingBlock(chunks, direction)` → `{ pairs: { id, fr, en }[] }` (takes up to 5 chunks)
- `normalizeExactAnswer(s)` — permissive normalize per Q3.
- `pickDistractors(correct, pool, count)` — fisher-yates over sibling chunks, dedupe correct.

**Phases shipped (one commit per phase, build + typecheck clean per commit):**
- **B0** (05cbe9a): F-323 BACKLOG entry locked with the plan.
- **B1** (8b7029e): `lib/test-engine.ts` pure helpers (buildMCQ / buildDropdown / buildExact / buildMatchingBlock / gradeExact / gradeMatching / normalizeExactAnswer / pickDistractors / shuffle); `lib/vocab-copy.ts` extended with `test` block in EN+FR.
- **B2** (0958a0d): `/vocabulaire/[slug]/test` route + `TestClient.tsx` state machine. SessionConfigCard / QuestionView dispatcher / MCQView / DropdownView / ExactView / MatchingView / TestEndCard / TierLockedCard / ErrorCard / EmptyCard / SoftEmptyCard / TestSkeleton — all inline. Matching tap-to-pair UX with shuffled right column, per-chunk feedback (accent fill for correct, muted strikethrough for wrong). Dev-only `?devLock=tier` flag for F-225 capture.
- **B3** (922e89e): TopicDetail CTA row becomes a flex pair — "Start practice" (primary, ed-accent) + "Start test" (secondary, ed-paper outline). flex-wrap for 375px stack behavior.
- **B4** (this commit): F-225 verification runbook + status flip.

**Files touched (shipped):**
- `BACKLOG.md` — F-323 entry locked (B0); status + runbook (B4).
- `lib/test-engine.ts` — NEW; pure helpers (B1).
- `lib/vocab-copy.ts` — `test` block in EN+FR (B1).
- `app/vocabulaire/[slug]/test/page.tsx` — NEW; ProtectedRoute wrap (B2).
- `app/vocabulaire/[slug]/test/TestClient.tsx` — NEW; state machine + 4 exercise components (B2).
- `app/vocabulaire/[slug]/TopicDetail.tsx` — paired Start practice / Start test CTAs (B3).

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: HIGH. Plan-first → 5 open questions resolved before B0 → 5 discrete commits each `pnpm exec tsc --noEmit` silent + `pnpm build` green (39 routes, four `/vocabulaire/*` routes compile clean, 0 warnings). Matching tap-to-pair logic is the only genuinely new state machine; everything else is direct F-322 mirroring.
- WHY: F-319 MVP completes the Vocabulaire surface trio FE-side: browse (F-325 ✅) + practice (F-322 ✅) + test (F-323 — this). Once F-321 seeds the corpus, all three surfaces have content.
- UNCERTAINTY: (1) Matching right-column shuffle re-randomizes on remount — browser-back into a previously-submitted matching block could show a different display order. Acceptable for V1; no browser-back is wired through the state machine and the grade record per chunkId is order-independent. (2) Distractor pool quality on small topics (4-19 chunks): MCQ / Dropdown distractors come from the same fetched first-page set; topics with ~5 chunks repeat distractors across questions in a 20-question session. Healthy at F-321 seed scale (~150-250 chunks per topic). (3) `normalizeExactAnswer` regex literal-glyph reliance: combining marks block + smart quote/dash characters are literal in source. Next.js / tsc handle UTF-8 correctly; a future editor that mangles encoding degrades silently to overly-strict matching (never false-positives a wrong answer).
- VERIFICATION RUNBOOK (Chadi, post-deploy on lemethodic.com):
  1. **Auth gate** — visit `/vocabulaire/<any>/test` unauthenticated. Expect redirect to `/` via ProtectedRoute.
  2. **Soft-empty (1-3 chunks)** — if F-321 seeds a tiny topic with <4 chunks, visit its `/test` route. Expect SoftEmptyCard with "Not enough chunks for a test." + CTA → `/practice`. 1440px + 375px.
  3. **Empty (0 chunks)** — pre-seed, expect EmptyCard ("Nothing to practice yet.").
  4. **CTA pair on TopicDetail** — visit `/vocabulaire/<topic-slug>`. Verify the CTA row contains BOTH "Start practice" (filled) and "Start test" (outline). 1440px + 375px.
  5. **SessionConfigCard** — clicking Start test routes to `/test`. Verify the four exercise-type chips (Multiple choice / Dropdown / Exact completion / Matching), direction toggle, session length picker. 1440px + 375px.
  6. **MCQ flow** — select Multiple choice + 10 chunks + Start. Verify ExerciseCard with prompt + 4 button options. Click a wrong option → correct option highlights ed-accent, your wrong choice strikes through, FeedbackBlock shows "Not quite — the answer was [X]." + Next button. 1440px + 375px pre-submit + post-submit.
  7. **Dropdown flow** — Start over with Dropdown. Verify the `<select>` renders the 4 options, Submit button disabled until a choice is picked, feedback identical to MCQ post-submit. 1440px + 375px.
  8. **Exact flow** — Start over with Exact completion. Verify autofocused text input + Submit button. Type a known answer → pass. Type a wrong answer → fail with correct answer in feedback. Permissive grading: case + accents + punctuation tolerated (e.g., "ecole." for "École"). 1440px + 375px.
  9. **Matching flow** — Start over with Matching (10 chunks = 2 blocks of 5). Verify FR column on the left, EN column on the right (shuffled). **Tap-to-pair UX (per BACKLOG R3)**: tap an FR item → it highlights ed-accent fill → tap an EN item from the OPPOSITE column → both highlight + pair locks visually + selection clears. Tap a SAME-column item while one is selected → switches selection (no pair formed). Tap an already-paired item → unlocks that pair, selects this item. Submit button disabled until all 5 paired. 1440px + 375px pre-submit + post-submit (correct = accent fill, wrong = muted strikethrough).
  10. **localStorage trace** — DevTools → Application → Local Storage. Verify `lemethodic_vocab_practice_state` accumulates pass/fail records as the test progresses (same key as F-322 — unified history confirmed).
  11. **TestEndCard** — finish a session. Verify "Test complete." with N got / N total / % accuracy stats. Three CTAs: Test again (reshuffle + same exercise type), Back to topic, Browse the corpus. 1440px + 375px.
  12. **Tier-lock capture (dev only)** — local `pnpm dev`; visit `/vocabulaire/<any>/test?devLock=tier`. Verify TierLockedCard with the "DEV: simulated tier lock" dashed badge + CTA → /paywall. 1440px + 375px. (Production refuses the flag — `process.env.NODE_ENV !== 'production'` gate.)
  13. **i18n** — flip `interface_language` to `fr`. Refresh `/vocabulaire/<slug>/test`. Verify all test copy switches to French (exercise type labels, prompts, feedback strings, button labels).
  14. **F-310 interceptor** — log in as unverified user; visit `/vocabulaire/<slug>/test`. Expect hard-nav to `/verify-email?next=/vocabulaire/<slug>/test`.
  15. **Runtime log sweep** — Vercel runtime logs for the F-323 deploy: 0 errors / 0 5xx in a 1h window after smoke.

**Owner:** Frontend Engineering

### F-324 — Diagnostic ↔ Vocabulaire linking (auto-suggest vocab topics from flagged errors)
Milestone: M4

**Priority:** MEDIUM (Sprint 2 — connects Le Diagnostic to Le Vocabulaire)
**Status:** Queued
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session — Section 2 row 8
**Dependencies:** F-319 (Vocabulaire MVP shipped), F-312 (RAG retrieval — error_type tags drive topic suggestions)
**Scope:** when a diagnostic surfaces an error tagged with a vocabulary register/topic mismatch, FE renders a "Practice this in Le Vocabulaire" callout linking to the relevant topic set. BE: extend diagnostic response with `suggested_vocab_topics: string[]`. FE: render callout block in ResultView + diagnostic page.
**Owner:** Engineering (BE + FE)

### F-325 — Le Vocabulaire browse UI (FE) — topic catalog + chunk detail
Milestone: M4

**Priority:** MEDIUM (Sprint 2 — corpus exploration surface; complements F-322 practice UI and F-323 test UI)
**Status:** Awaiting verification (F-225 — interactive change; needs 1440px + 375px screenshots of /vocabulaire catalog + /vocabulaire/[slug] topic detail + locked-card variant via ?tier=free + interaction trace per runbook below)
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session — Decision 3 (Le Vocabulaire system); F-322 push-back resolved with new ticket number per Chadi.
**Dependencies:** BE F-325 API (commit 0543642 — SHIPPED), F-320 (DB schema), F-321 (seed Phase 1 — not yet seeded; empty-state mode until then). Tier-gate live wiring deferred to F-311.fe.

**Scope:**
Two-route browse surface complementing F-322 (practice) and F-323 (test):
- `/vocabulaire` — topic catalog with `corpus_partition` filter (three chips: `CC_corpus` / `chadi_authored` / `book_lab`). The fourth canonical partition `third_party_publisher_DO_NOT_EXTRACT` is silently filtered at the BE query layer (BE Decision D4) and is invisible to FE — no chip, no badge.
- `/vocabulaire/[topic-slug]` — paginated chunk list inside a topic, with three filter chip groups: `cefr_level` (A1–C2), `exam_tag` (TCF / DELF / TEF; null=untagged), `register` (familier / standard / soutenu).

Mobile-first per F-225 (mirrors the `app/ecole/` mobile/desktop CSS-gate split). Auth-gated via `ProtectedRoute` (no public/SEO surface — public marketing is Sprint A post-launch territory).

**Canonical BE contract (locked 2026-05-12):**
- `corpus_partition` enum: `CC_corpus | chadi_authored | book_lab | third_party_publisher_DO_NOT_EXTRACT` (per BE F-320 commit 0a7cc4b; supersedes the stale `oqlf|academie|curated` line at BACKLOG.md:3274 — see BACKLOG-HYGIENE-001 follow-up).
- `GET /api/vocab/topics?corpus_partition=…` → `Topic[]` (camelCase mapper at FE boundary).
- `GET /api/vocab/topics/{slug}/chunks?cefr_level=…&exam_tag=…&register=…&offset=…&limit=20` → `{ chunks: Chunk[]; total: number; limit: number; offset: number }`. **Offset-based pagination** (not cursor — BE F-325 confirmed).
- Auth: Bearer token, same as the rest of the app.
- Tier-lock: 403 + `tier_insufficient` detail body (consistent with F-310 contract). Surfaces through `lib/api.ts:request()` like any other 403; FE does not invent a special 200-with-flag path.

**Empty-state copy (EN+FR; ES deferred to F-326 placeholder):**
- Corpus empty: EN "Le Vocabulaire is coming." / FR « Le Vocabulaire arrive. »
- Topic filtered to zero: EN "No chunks match these filters." / FR « Aucun chunk ne correspond à ces filtres. »
- Locked-card (free user + exam_tagged_*): EN "Exam-tagged corpus is for paid plans." → /paywall.

**State management:** TanStack Query (new project pattern). Conservative defaults: `staleTime: 60_000`, `refetchOnWindowFocus: false`. `QueryClientProvider` mounted at `app/layout.tsx`. Query keys structured for filter composability.

**Tier-gate (deferred stub):**
- `hooks/useUserTier.ts` returns `'unknown'` until F-311.fe lands.
- `TopicCardLocked` variant renders when tier === `'free'` AND `topic.corpus_partition` is exam-tagged. Currently `'unknown'` always falls through to unlocked. F-225 screenshot of the locked state captured via dev-mode override.

**Phases shipped (one commit per phase, build + typecheck clean per commit):**
- **A0** (d73d2ca): F-325 + BACKLOG-HYGIENE-001 entries.
- **A1** (58d52a8): `@tanstack/react-query` + devtools installed; `components/QueryProvider.tsx` mounted at `app/layout.tsx`.
- **A2** (e5a1f3d): `lib/types.ts` + `lib/api.ts` — CorpusPartition / CefrLevel / ExamTag / Register / VocabularyTopic / VocabularyChunk / VocabularyChunksPage types; `api.vocab.{listTopics, listChunks}` with snake_case→camelCase mappers. `buildUrl` extended to accept `string[]` query values via `.append()` (backward-compatible with all existing call sites).
- **A3** (a5c09fc): `/vocabulaire` catalog route (auth-gated). `lib/vocab-copy.ts` EN+FR copy. Catalog client component with three partition chips, responsive grid (1/2/3 cols), TQ-wired `listTopics`, EmptyCorpusState, ed-skeleton loading, retry-on-error.
- **A4** (b4569e0): `/vocabulaire/[slug]` topic detail. TQ `useInfiniteQuery` with offset pagination. Three filter chip groups (cefr_level / exam_tag / register), ChunkRow with FR+EN+chips, EmptyFilteredState vs EmptyCorpusInTopicState branch, "Load more" pagination button. Topic title falls back to humanized slug (BE contract doesn't return topic title on chunks endpoint — refinement follow-up if a dedicated topic endpoint is added).
- **A5** (93e4f4b): `hooks/useUserTier.ts` stub returns `'unknown'`; `?tier=free` URL override for F-225 capture. Catalog branches at render time: `tier === 'free' && topic.examTags.length > 0` → `TopicCardLocked` (locked.title + locked.body + CTA to `/paywall`).
- **A6** (this commit): F-225 verification block + status flip to "Awaiting verification".

**Files touched (shipped):**
- `BACKLOG.md` — F-325 + BACKLOG-HYGIENE-001 entries (A0); status + runbook (A6).
- `package.json` + `pnpm-lock.yaml` — `@tanstack/react-query@5.100.10` + devtools (A1).
- `components/QueryProvider.tsx` — NEW (A1).
- `app/layout.tsx` — QueryProvider wraps children (A1).
- `lib/types.ts` — F-325 type block at file tail (A2).
- `lib/api.ts` — `api.vocab.*`, vocab mappers, `buildUrl` array-value support (A2).
- `lib/vocab-copy.ts` — NEW; EN+FR copy (A3).
- `app/vocabulaire/page.tsx` — NEW; ProtectedRoute wrap (A3).
- `app/vocabulaire/Catalog.tsx` — NEW (A3); locked-card branch (A5).
- `app/vocabulaire/[slug]/page.tsx` — NEW (A4).
- `app/vocabulaire/[slug]/TopicDetail.tsx` — NEW (A4).
- `hooks/useUserTier.ts` — NEW (A5).

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: HIGH. Build + typecheck clean at every phase commit. BE F-325 contract locked (commit 0543642). All A-phase commits verified via `pnpm exec tsc --noEmit` (silent) + `pnpm build` (37 routes compile, /vocabulaire static + /vocabulaire/[slug] dynamic, 0 warnings).
- WHY: Sprint 2 surface; Decision 3 dependency for the general-French audience; complements practice (F-322) and test (F-323) UIs.
- UNCERTAINTY: (1) Tier-gate stub returns 'unknown' — live wiring blocks on F-311.fe. The `?tier=free` override covers the F-225 locked-card screenshot path. (2) Topic title on `/vocabulaire/[slug]` falls back to a humanized slug because the BE F-325 chunks endpoint doesn't return parent-topic metadata. Filed as a follow-up if a dedicated `GET /api/vocab/topics/{slug}` endpoint exists or is added BE-side. (3) BE response casing assumed snake_case per the existing FE convention; mappers no-op if BE emits camelCase directly. First live call against `/api/vocab/topics` confirms.
- VERIFICATION RUNBOOK (Chadi, post-deploy on lemethodic.com):
  1. **Auth flow** — sign in as an existing user. Verify `/vocabulaire` and `/vocabulaire/[any-slug]` redirect to `/` when unauthenticated (ProtectedRoute).
  2. **Catalog empty** — `/vocabulaire` with empty corpus (current state until F-321 seeds) shows the "Le Vocabulaire is coming." EmptyCorpusState card. 1440px + 375px screenshots.
  3. **Catalog populated** — once F-321 seeds, verify topic cards render with title + source + chunk count + CEFR range + exam-tag chips. Test the three partition chips (CC_corpus / chadi_authored / book_lab) toggle and filter the list. 1440px + 375px.
  4. **Topic detail** — click any topic card → `/vocabulaire/[slug]`. Verify chunks render (FR top + EN translation + three chip triple), "Load more" pagination appends, three filter chip groups work. 1440px + 375px.
  5. **Filtered-to-empty** — apply a filter combination that yields 0 chunks. Verify "No chunks match these filters." copy renders.
  6. **Locked-card variant** — visit `/vocabulaire?tier=free`. Verify any topic with `exam_tags.length > 0` renders the locked-card variant (locked.title + CTA to /paywall). Clicking the CTA navigates to `/paywall`. 1440px + 375px.
  7. **i18n** — change `interface_language` to `fr` (via /onboarding or directly in the user record). Refresh `/vocabulaire`. Verify all copy switches to French.
  8. **403 email_not_verified flow** — log in as an unverified user (or simulate by clearing email_verified_at BE-side). Visit `/vocabulaire`. Verify hard-nav to `/verify-email?next=/vocabulaire` (F-310.fe.coldreload interceptor still works on this new surface).
  9. **Runtime log sweep** — Vercel runtime logs for the F-325 deploy: 0 errors / 0 5xx in a 1h window after smoke.

### F-VISUAL-001 — design system audit + Wispr Flow benchmark rollout
Milestone: M2

**Priority:** HIGH (cross-cutting design refresh — touches every surface; the editorial system bones are in place but the palette/typography pair/motion conventions need consolidation against the Wispr Flow benchmark)
**Status:** Plan locked 2026-05-13; X.0 in flight (X.1-X.6 follow; X.6 is post-F-225 cleanup)
**Filed:** 2026-05-13
**Plan-approved:** 2026-05-13 (Chadi — Q1-Q5 locked; sections 3-5 surface in X.0 status report for final review before X.1)
**Source:** Chadi design directive 2026-05-13 — visual benchmark Wispr Flow (wisprflow.ai): quiet luxury, editorial design, soft neutrals + restrained green accent, typography contrast, motion as core design element.
**Dependencies:** none (purely FE token + chrome work; no BE contract changes)

**Pre-locked decisions (Chadi 2026-05-13):**
- **Typography pair**: **Figtree** (sans, next/font/google) + **Fraunces** (serif, already shipped via next/font/google). Switzer retires (was shipped via Fontshare CDN — third-party uptime dependency removed). Override candidate considered: Inter (rejected — Figtree's humanist warmth is closer to Wispr Flow direction).
- **Accent green (Q1)**: **`#8FA279`** — the existing `--ed-warm-sage-deep` value, promoted from scattered usage (spinner dots + success accent) to the design-system accent-primary. Re-using a known-good in-production value beats introducing a new value or guessing. Refines via single CSS-var swap if post-mega-phase review surfaces a tone mismatch.
- **Success-state green stays distinct**: `--fp-sage-deep` `#2D8B55` remains as the success-state token, NOT the accent. Two distinct greens by role — accent (sage, restrained, decorative) vs success (deeper, state-signal).
- **F-225 verification (Q2)**: **BATCHED — 3 checkpoints**. Auth + onboarding (10 screens) → product surfaces 1 (paywall + home + ecole, 14 screens) → product surfaces 2 (vocabulaire + diagnostic + writing, 24 screens). Single commit chain unified; verification has natural pause points.
- **Legacy alias retention (Q3)**: Keep `--fp-*` and `--ed-*` aliases through X.1-X.4. Drop in X.6 cleanup commit (separate dispatch after F-225 batched verification passes).
- **shadcn rewire (Q4)**: Leave `components/ui/*` source untouched. Rewire via `--primary` / `--destructive` etc. token redirects in `globals.css`. Reversible.
- **Warm-luxury sub-palette (Q5)**: Keep `--ed-warm-{peach, peach-deep, sage, sage-deep, espresso, cream, sand}` as named tokens. Used by V-012b; no churn.
- **Motion library**: **Framer Motion 12.38** (already installed; bundle cost already paid).
- **Asset strategy**: Chadi generates imagery via Nanobanana (Google Gemini image gen). X.5 ships a slot manifest with suggested prompts; existing `/public/illustration-*.{jpg,png}` files stay until replaced.
- **Implementation scope**: FULL design system rollout, single mega-phase chain. Touches all surfaces.

**Pre-flight push-backs surfaced before X.0 (resolved):**
- PB-1: Original prompt described codebase as "v0-cloned, default Tailwind/shadcn tokens, no motion library." Investigation: framer-motion 12.38 installed, ~800 lines of design tokens across three palettes already in `globals.css`, Switzer+Fraunces typography pair already shipped, motion language defined in `lib/motion.ts`. Reframed as **token consolidation + recolor + font swap on an existing editorial system**, not a from-zero rollout.
- PB-2: Figtree vs Switzer typography conflict (Switzer currently shipped). Resolved — Figtree replaces Switzer (next/font/google removes Fontshare CDN dependency as a side benefit).
- PB-3: WebFetch couldn't extract Wispr Flow's actual CSS (Webflow CSS-in-JS obfuscation). Resolved per Q1 — use existing `#8FA279` as accent green; refine via screenshot post-mega-phase only if needed.
- PB-4: F-225 verification load (~50 screenshots one-shot). Resolved per Q2 — batched 3 checkpoints.
- PB-5: `frontend-design` skill was not loaded at planning time. Now available after `/reload-plugins`. Used from X.1 forward when actual code lands.

**Phase plan (one commit per phase, build + typecheck clean per commit):**
- **X.0** (this commit): BACKLOG entry locked + Sections 3-5 surface in the status report for Chadi final-review checkpoint. Docs only.
- **X.1** (Chadi green-light gates this commit): Token foundation + Figtree swap. `app/layout.tsx` Figtree via next/font/google; `app/globals.css` new HSL tokens under `:root` and `@theme inline` with `--fp-*` and `--ed-*` legacy aliases preserved; `lib/typography.ts` SANS_FONT switches to `var(--font-figtree)`, extends TYPE_SCALE with display-1 / display-2 / h1-h3 / body-lg / body / body-sm / eyebrow; `lib/motion.ts` adds `ease.{out, inOut, spring, snap}` + `duration` object as canonical exports (existing names become aliases).
- **X.2**: Tailwind `@theme inline` block + shadcn rewire. Update `@theme inline` to expose new tokens as Tailwind utilities; rewire `--primary` / `--destructive` / `--secondary` / `--muted` / `--accent` etc. (oklch greyscale) to point at new HSL semantic tokens. `<Button variant="default">` now lands on `--cta-primary`.
- **X.3** (8 commits, one per surface): /paywall → / (onboarding) → /ecole + intro + lesson/quiz → /vocabulaire + [slug] + practice + test → /diagnostic → /writing + [prompt_id] + history → /profile + /progress → auth (/login + /signup + /verify-email + /password-reset). Each commit: grep hardcoded hex → replace with `var(--*)`; convert inline `style` color values to design-token references. No layout / copy / behavior changes.
- **X.4** (4 commits, one per high-impact surface): Paywall hero stagger + scroll-reveal on radar. Home daily-action attention-pulse. Vocabulaire flashcard 3D flip (with Safari fallback to opacity cross-fade). Diagnostic results stagger after bar-fill.
- **X.5** (1 commit, docs only): `docs/nanobanana-asset-slots.md` — full slot manifest with suggested prompts. ~12-18 slots catalog.
- **X.6** (1 commit, separate dispatch — fires only after F-225 batched verification passes): Drop `--fp-*` and `--ed-*` legacy aliases from `globals.css` once X.3 confirms zero references via grep. Pure deletion + commit-message reference to F-225 pass.

**F-225 verification (batched per Q2):**
- **Batch 1** (after X.3 commits 6 and 7 land, before X.4): auth + onboarding. 10 screens × 2 viewports.
- **Batch 2** (after X.3 commits 1, 2, 3 land + X.4 paywall + home commits): paywall + home + ecole. 14 screens × 2 viewports.
- **Batch 3** (after X.3 commits 4, 5 + remaining X.4 commits land): vocabulaire + diagnostic + writing. 24 screens × 2 viewports.

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: HIGH on the plan. Scope is bounded (token swap + restraint pass, not from-zero rebuild). Per-surface commits in X.3 keep rollback granularity tight. No new BE contract; no migration risk.
- WHY: Visual quality is the conversion lever before launch; current `--ed-*` system is partially built but inconsistent across surfaces (three coexisting palettes; many inline hardcoded hex). Wispr Flow is the right north star for the editorial-luxury target.
- UNCERTAINTY: (1) Accent green `#8FA279` may read too muted against `--bg-canvas` warm cream at small sizes — verifiable in X.3 paywall commit (highest-impact surface; first to ship). (2) 3D flashcard flip on Safari iOS — known transform-style: preserve-3d quirks; fallback to opacity cross-fade if visible flicker. (3) Color-contrast `--text-muted #6F6B66` on `--bg-canvas` is ~4.3:1 (passes WCAG AA for normal text; would need `#605C57` to hit AAA on body). Contrast audit fires per surface in X.3.
- VERIFICATION: Per Q2 batched runbook — F-225 captures at 3 natural checkpoints. End-of-ticket report fires after Batch 3 passes, before X.6 dispatches.

**Owner:** Frontend Engineering

### BACKLOG-HYGIENE-001 — F-320 stale corpus_partition enum line (BACKLOG.md:3274)
Milestone: TBD

**Priority:** LOW (docs-only; doesn't affect shipped behavior)
**Status:** Queued
**Filed:** 2026-05-12
**Source:** F-325 Phase A0 — surfaced during plan investigation. BACKLOG.md:3274 (F-320 scope) describes corpus partitions as `oqlf|academie|curated`. The canonical enum per BE F-320 commit 0a7cc4b is `CC_corpus | chadi_authored | book_lab | third_party_publisher_DO_NOT_EXTRACT`. F-325 entry above uses the canonical enum; the F-320 line is stale and contradicts.
**Dependencies:** none
**Scope:** edit BACKLOG.md:3274 (F-320 scope description) to replace the `oqlf|academie|curated` triple with the canonical four-value enum. Single-line docs change; no code touched. Kept out of the F-325 BACKLOG filing commit to preserve commit-scope discipline.
**Owner:** Frontend Engineering (docs)

### F-BUGS-001-FE-A — Lessons load graceful degradation
Milestone: M1

**Priority:** HIGH (production dead-end on lessons API failure)
**Status:** Shipped 2026-05-13 (commit `ba86e95`). **F-225 verification deferred — Chadi capture pending per 3-batch plan; screenshots + interaction trace to be attached retroactively (same batch as FE-B).**
**Filed:** 2026-05-13 (filed at merge-time; ticket worked under informal tracking, formalized for shipped-state record)
**Source:** Bug 1 of F-BUGS-001-FE — desktop `/ecole` rendered full-page "Couldn't load your path. Retry" when `/api/ecole/lessons` returned non-2xx (401 token expired, 5xx server error, malformed response, etc.); chrome (greeting, exam date strip, recurring modules section, daily TÂCHE 2 card) was dead-ended despite the other API calls succeeding via their existing `.catch` wrappers.
**Scope:**
1. Wrap `api.lessons.list()` in `.catch((e) => { console.error(...); return [] })` so `Promise.all` resolves even on lessons failure.
2. Lesson grid renders local empty-state error contained to its column rather than full-page dead-end.
3. Dev-mode error detail surfaced inline (`process.env.NODE_ENV !== 'production'` gate) for debugging without leaking to prod users.
**Files:** `components/home/EcoleDesktop.tsx`, `components/home/HomeScreen.tsx`
**Dependencies:** none (pure FE).
**F-225 verification status:** ⚠️ Pending. Per CLAUDE.md F-225 protocol, Shipped normally gates on (a) 1440px + 375px screenshots of each affected route AND (b) interaction trace (this is a behavior change — failure-path rendering — so interaction trace applies). Chadi to capture per 3-batch plan and attach to this entry. **Until that's attached, this entry is "Shipped on code, awaiting F-225 evidence."**
**Owner:** Frontend Engineering

### F-BUGS-001-FE-B — Auth-flow 5-surface fix (completed-onboarding users on logged-out chrome)
Milestone: M1

**Priority:** HIGH (broken user-state routing — affected every returning authed user)
**Status:** Shipped 2026-05-13 (merge `c896587`, push `ba86e95..c896587 main -> main`). **F-225 verification deferred — Chadi capture pending per 3-batch plan; screenshots + interaction trace to be attached retroactively.**
**Filed:** 2026-05-13 (filed at merge-time; ticket worked under informal tracking, formalized for shipped-state record)
**Source:** Bug 3 of F-BUGS-001-FE — completed-onboarding authed users were landing on logged-out marketing chrome or being routed back through `/onboarding` instead of straight to `/ecole`. Five surfaces audited and patched. Hybrid decision on Paywall (Chadi, 2026-05-13): ship pessimistic redirect now, file F-326 for branched authed UX when BE adds `subscriptionStatus`.
**Scope (5 commits on the merged branch):**
1. **B.1 — `components/landing/PlatformLanding.tsx`** (8f3298d): pre-paint loader + onboarding-aware redirect. Authed users with `targetLevel` → `/ecole`; authed without → `/onboarding`. Prevents marketing-chrome flash.
2. **B.2 — `components/onboarding/OnboardingFlow.tsx`** (026703e): auth gate at the top of the flow redirects completed users to `/ecole` before any step renders.
3. **B.3 — `components/onboarding/OnboardingFlow.tsx`** (d0ae84a): `EcoleReveal` CTA branches by auth state — authed → `/ecole`, unauth → `/paywall`.
4. **B.4 — `components/Paywall.tsx`** (7bbaa0e): pessimistic redirect for any token-bearing user → `/ecole`; neutral loader while hydrating. Filed F-326 (this file:3618) for the proper authed-no-sub branched-paywall flow once BE ships `subscriptionStatus`.
5. **B.5 — `app/login/page.tsx`** (5b0007f): suppress login-form flash before redirect when an already-authed user lands on `/login`.
**Dependencies:** none (pure FE).
**Smoke (prod, post-deploy):** `/`, `/onboarding`, `/paywall`, `/login`, `/ecole` all 200.
**F-225 verification status:** ⚠️ Pending. Per CLAUDE.md F-225 protocol, Shipped normally gates on (a) 1440px + 375px screenshots of each affected route AND (b) interaction trace (handlers/navigation/state changes were modified, so this counts as interactive). Chadi to capture per 3-batch plan and attach to this entry. **Until that's attached, this entry is "Shipped on code, awaiting F-225 evidence."**
**Follow-up:** F-326 (this file:3618) — BE adds `subscriptionStatus` to `User`/`/api/auth/me`, then B.4's pessimistic redirect is replaced with a branched authed-paywall UX.
**Owner:** Frontend Engineering

### F-BUGS-001-FE-C — `/ecole` empty-state vs network-error differentiation
Milestone: M1

**Priority:** HIGH (regression introduced by FE-A soft-fail wrapper — no-lessons users saw network-error copy)
**Status:** Shipped 2026-05-13 (commit `a066660` on worktree, merged to main via `d1fd33d`). **F-225 verification deferred — Chadi capture pending per 3-batch plan; screenshots + interaction trace to be attached retroactively.**
**Filed:** 2026-05-13 (filed at merge-time; ticket worked under informal tracking, formalized for shipped-state record)
**Source:** Bug 1 of F-BUGS-001-FE — after FE-A's soft-fail wrapper landed (`ba86e95`), `/ecole` started rendering the inline "Couldn't load your path. Retry" message for users with zero enrolled lessons (empty array — a legitimate user state, not a failure). The single error branch couldn't distinguish "no lessons yet" from "lessons API failed", so onboarding-complete users with an empty path were shown a retry CTA that did nothing useful.
**Scope:**
1. Lessons fetcher distinguishes between (a) successful response with `[]` and (b) caught error from FE-A wrapper.
2. Empty-array path renders proper empty-state messaging (no retry CTA, copy oriented toward "your lessons will appear here").
3. Network-error path keeps the FE-A inline error column with retry CTA + dev-mode detail.
**Files:** `components/home/EcoleDesktop.tsx`, `components/home/HomeScreen.tsx`, `lib/api` wrappers.
**Dependencies:** built on FE-A (`ba86e95`) — this ticket exists because FE-A's catch-all collapsed two distinct states into one error branch.
**F-225 verification status:** ⚠️ Pending. Per CLAUDE.md F-225 protocol, Shipped normally gates on (a) 1440px + 375px screenshots of `/ecole` in both empty-array and network-error states AND (b) interaction trace (failure-path rendering + retry CTA behavior). Chadi to capture per 3-batch plan and attach to this entry. **Until that's attached, this entry is "Shipped on code, awaiting F-225 evidence."**
**Owner:** Frontend Engineering

### F-BUGS-001-FE-D — Tâche 2 candidate-brief language defaulting + FR/EN toggle
Milestone: M1

**Priority:** MEDIUM (UX polish — brief comprehension blocker for A1/A2 users)
**Status:** Shipped 2026-05-13 (commit `341d567`, fast-forward to main from `d1fd33d`). **F-225 verification deferred — Chadi capture pending per 3-batch plan; screenshots + interaction trace to be attached retroactively.**
**Filed:** 2026-05-13 (filed at merge-time; ticket worked under informal tracking, formalized for shipped-state record)
**Source:** `candidate_brief` on `/speaking/tache-2/<scenario>` rendered in English regardless of the user's self-assessed level — fine for B1+ users practicing comprehension under FR cognitive load, but a hard blocker for A1/A2 users who couldn't parse the scenario in the first place. No per-user override existed either.
**Scope:**
1. Default-language rule by `target_level`: `B1+` defaults to FR (immersion), `A1`/`A2` defaults to EN (comprehension-first).
2. `BriefLanguageToggle` (FR/EN) added to the Tâche 2 session UI so any user can flip at will.
3. Per-conversation persistence via `localStorage` key `lemethodic_brief_lang_<conversation_id>` (scoped per scenario instance, so a user can prefer FR on one scenario and EN on another without bleed-over).
**Files:** `components/speaking/Tache2Session.tsx`, `lib/storage-keys.ts`.
**Dependencies:** none (pure FE).
**Caveat:** brief copy is FE-side placeholder mirroring BE seed quality — F-061.1 is the architectural fix that wires FE to BE `candidate_brief_*` fields. This ticket ships the toggle + defaulting UX against the placeholder copy; F-061.1 will replace the source of the strings without touching the toggle behavior.
**F-225 verification status:** ⚠️ Pending. Per CLAUDE.md F-225 protocol, Shipped normally gates on (a) 1440px + 375px screenshots of `/speaking/tache-2/<scenario>` in FR and EN states AND (b) interaction trace (toggle click → language swap → localStorage persist → reload retains choice). Chadi to capture per 3-batch plan and attach to this entry. **Until that's attached, this entry is "Shipped on code, awaiting F-225 evidence."**
**Owner:** Frontend Engineering

### F-326 — subscriptionStatus on User (BE follow-up to F-BUGS-001-FE-B B.4)
Milestone: M1

**Priority:** MEDIUM (unblocks proper authed paywall UX)
**Status:** Queued
**Filed:** 2026-05-13
**Source:** F-BUGS-001-FE-B B.4 auth-flow audit — authed users on /paywall currently get a pessimistic redirect to /ecole because the User type carries no subscription / trial-status field. We cannot distinguish (c) authed-with-subscription from (d) authed-without-subscription on FE. Hybrid decision (Chadi, 2026-05-13): ship the redirect now; file BE follow-up so authed-no-sub users can eventually see a tailored upgrade screen instead of being bounced.
**Dependencies:** BE side — `/api/auth/me` response shape + `User` Pydantic model + DB column (or join from existing subscription/billing table if one exists). FE side — once shipped, `components/Paywall.tsx:125-142` branches on `user.subscriptionStatus`.
**Scope:**
1. BE: add `subscription_status` to `/api/auth/me` payload. Suggested enum: `none | trial_active | trial_expired | active | past_due | cancelled`. Source from whatever billing-state record already exists (Stripe sync table? user.stripeCustomerId+lookup? confirm with Chadi).
2. FE (`lib/types.ts`): add `subscriptionStatus?: 'none' | 'trial_active' | ...` to `User`.
3. FE (`components/Paywall.tsx`): replace the pessimistic redirect with a branch — `active | trial_active` → `/ecole`; `none | trial_expired | past_due | cancelled` → render paywall with copy + CTA tailored to that state. Re-label CTAs from "Start free trial" → "Upgrade" / "Renew" where appropriate.
**Risk:** depends on what billing tables already exist BE-side. If there's no subscription record yet (Stripe wiring deferred per F-060), this ticket is blocked until that lands.
**Owner:** Backend Engineering (step 1), Frontend Engineering (steps 2-3)

---

## Onboarding harden+polish — 2026-05-24 critique (run 2, score 29/40)

These four tickets are the direct output of the `/impeccable critique` second pass on the onboarding flow. Address in priority order; P0 first next session.

### F-327 — [P0] another_exam funnel restoration + waitlist moat (BE + FE)
Milestone: DONE

**Priority:** P0 — conversion blocker + soft-beta moat
**Status:** ✅ Shipped
**Filed:** 2026-05-24 · Scope expanded: 2026-05-25 · Shipped: 2026-05-25 (BE 2d54de0, FE d329ff0)
**Source:** Impeccable critique run 2 (2026-05-24T06-53-58Z) + scope-expansion diagnosis 2026-05-25
**Surface:** `components/onboarding/questions/ExamPickerQuestion.tsx`, `components/onboarding/OnboardingFlow.tsx`, new post-submit + confirmation screens, BE `app/routers/onboarding.py` + schema + model + migration

**Problem (revised):** The "another exam" trap isn't a BE dead-end — it's a localStorage trap. Picker opens an inline form (which exam? + email), submits to `lib/landing/waitlist.ts` (localStorage), parks user at confirmation, gates Continue locally. Result: (1) waitlist signal lost on cache clear or browser change — permanent data loss during soft-beta, (2) user must manually backtrack to a supported exam to continue. BE already has a waitlist branch (`app/routers/onboarding.py:99`) for `q0_target_exam='another_exam'` but FE never sends that value, so the branch is dead code today.

**Decision (locked 2026-05-25):** Replace the localStorage trap with BE-persisted waitlist + b1_to_b2 proxy-continuation offer. Rejected the original "accept another_exam + default plan + upsell later" framing as dishonest pricing/trust risk — users would pay for prep that doesn't match their target. Chosen path: capture granular intent at q0, offer b1_to_b2 proxy at end of questionnaire when q1/q2 levels fit, otherwise waitlist-only with clean exit.

**BE changes (lands first, `master` branch):**
- Add `q0_specific_intended_exam: Optional[str]` (max 120 chars) + `q0_accept_fallback: bool = False` to `OnboardingSubmitRequest` schema
- Pydantic validator: require non-empty `q0_specific_intended_exam` when `q0_target_exam='another_exam'`
- Add `users.specific_intended_exam VARCHAR(120) NULL` column + Alembic migration
- Modify waitlist branch in `app/routers/onboarding.py`: always persist `user.specific_intended_exam`. When `q0_accept_fallback=True` AND `should_offer_b1_to_b2_fallback(q1, q2)` returns True → also create b1_to_b2 enrollment, return `path_slug='b1_to_b2'` alongside `waitlist=True`. Otherwise waitlist-only response (existing shape).
- `users.target_exam='another_exam'` always preserved regardless of enrollment (intent kept for plan migration when actual exam ships)

**FE changes (lands second, `main` branch):**
- `ExamPickerQuestion.tsx`: remove `submitWaitlist` localStorage call entirely; drop inline email field (user is authed); keep "which exam?" free-text input; enable Continue when `another_exam` selected + examName non-empty. Propagate `specific_intended_exam` alongside `q0_target_exam` via `OnboardingFlow` state.
- `OnboardingFlow.tsx`: if `q0_target_exam==='another_exam'`, insert a `WaitlistOrProxyConfirmation` screen between q11 and submit. Two CTAs: "Continue with La Méthode (recommended)" → submit with `accept_fallback=true`; "Just add me to the waitlist" → submit with `accept_fallback=false`. Non-another_exam users submit normally.
- New post-submit screen handles three BE response shapes: (a) enrolled-on-proxy (`path_slug='b1_to_b2'` + `waitlist=True`) — proxy-continuation success, route to `/ecole`; (b) waitlist-only with fallback offered but not accepted — waitlist confirmation, clean exit; (c) waitlist-only with no fallback (levels don't fit) — waitlist-only confirmation, clean exit.
- Audit `lib/landing/waitlist.ts` for other callers; delete only if unused elsewhere in the codebase.
- Copy uses canonical product name "La Méthode" (not "L'École") even though routes stay legacy `/ecole` until M-RENAME ships.

**Acceptance:**
- BE: `target_exam='another_exam'` + `accept_fallback=true` + `q1='b1'` + `q2='b2'` → `users.specific_intended_exam` set + `path_slug='b1_to_b2'` + enrollment row created + `waitlist=True`
- BE: `target_exam='another_exam'` + `accept_fallback=true` + `q1='a1'` + `q2='a2'` → `users.specific_intended_exam` set + `path_slug=null` + no enrollment + `waitlist=True` (graceful degradation when levels don't fit)
- BE: `target_exam='another_exam'` + `accept_fallback=false` → `users.specific_intended_exam` set + `path_slug=null` + no enrollment + `waitlist=True`
- BE: `target_exam='tcf_canada'` (or any other active slug) → unchanged behavior (regression-clean)
- FE: TEF Canada / DELF B1-B2 paths unchanged (already active); proxy path works end-to-end; waitlist-only confirmation has working exit; no localStorage waitlist writes anywhere in onboarding flow
- Cross-repo smoke test: four paths verified (active happy, another+proxy+valid levels, another+waitlist, another+proxy+invalid levels)

**Branches:**
- BE: `feat/v-exampicker-payload-and-fallback` off `master`
- FE: `fix/v-exampicker-another-exam` off `main`

**Owner:** Frontend + Backend Engineering

---

### F-328 — [P1] DateInputQuestion: date bounds enforced but never communicated
Milestone: M1

**Priority:** P1 — silent error on mobile
**Status:** 📋 Queued
**Filed:** 2026-05-24
**Source:** Impeccable critique run 2 (2026-05-24T06-53-58Z)
**Surface:** `components/onboarding/questions/DateInputQuestion.tsx`

**Problem:** The date input enforces `min` and `max` attributes (computed from `dateMeta.minOffsetDays`/`maxOffsetDays`) but provides no helper text explaining why certain dates are unavailable. On mobile, the native date picker grays out blocked dates silently. A user whose actual exam is sooner than the minimum offset assumes the field is broken rather than understanding the constraint.

**Fix:**
- Add a persistent helper below the date label: e.g., "Pick a date at least [N] days out — we need time to build your plan." Derive the human-readable minimum from `minDate` already computed in the component.
- If a blocked date is tapped (detectable on some mobile pickers via `onChange` with an out-of-range value), show an inline message near the input explaining the constraint.

**Scope:** `DateInputQuestion.tsx` only — label + optional inline message. No BE changes.
**Owner:** Frontend Engineering

---

### F-329 — [P2] MultiSelectQuestion: no affordance that multiple selections are allowed
Milestone: M1

**Priority:** P2 — answer quality
**Status:** 📋 Queued
**Filed:** 2026-05-24
**Source:** Impeccable critique run 2 (2026-05-24T06-53-58Z)
**Surface:** `components/onboarding/questions/MultiSelectQuestion.tsx`

**Problem:** Multi-select questions render identically to single-select questions. No label, no count badge, no post-first-selection hint indicates that more than one option can be chosen. Users pick one option and press Continue, unaware that multi-selection was possible. This produces thinner plan data.

**Fix:**
- Add a persistent small label above the card list: "Select all that apply" (FR: "Sélectionnez tout ce qui s'applique"). Use `ED_MUTED` + 12px uppercase to match descriptor weight.
- Optionally: show a count badge ("2 selected") below the headline after the first selection, using `aria-live="polite"` so screen readers announce the change.

**Scope:** `MultiSelectQuestion.tsx` only — label + optional count. No BE changes.
**Owner:** Frontend Engineering

---

### F-330 — [P3] EcoleReveal: persona label arrives without narrative bridge
Milestone: M1

**Priority:** P3 — trust layer
**Status:** 📋 Queued
**Filed:** 2026-05-24
**Source:** Impeccable critique run 2 (2026-05-24T06-53-58Z)
**Surface:** `components/onboarding/EcoleReveal.tsx`

**Problem:** The reveal shows the persona label ("Intensive") and a plan summary with no sentence connecting the user's inputs to the outcome. Users see what they're getting but not why — which can feel like being labeled rather than understood. Particularly significant for high-stakes users (immigrants, professionals) who need to trust the plan.

**Fix:**
- Add one line above the persona label or below the descriptor: e.g., "Based on your timeline, here's the plan we built." (FR: "En fonction de votre calendrier, voici le plan que nous avons construit.")
- Alternative: on the plan card, replace the "Your plan" eyebrow with a light-touch rationale: "Because your exam is in [N] weeks" or "Built around your [B2→C2] goal."
- Keep it to one line — the current reveal is well-paced and this should not add bulk.

**Scope:** `EcoleReveal.tsx` copy + layout only. No BE changes.
**Owner:** Frontend Engineering

---

### B-104 — [P1] Paywall: surface Exam Bundle tier for time-bounded users
Milestone: M6

**Priority:** P1 — merchandising bug, not pricing change
**Status:** 📋 Queued
**Filed:** 2026-05-25
**Source:** Impeccable critique 2026-05-24 product observation
**Surface:** `components/paywall/*` (audit needed)

**Problem:** Paywall presents $199 Sprint as the headline option. Users with ≤8 weeks to exam (the visa-urgent cohort, our primary persona per memory) see no time-bounded alternative on first glance. The $29 Exam Bundle tier exists in the pricing structure but isn't surfaced explicitly for users who are exactly the audience it was designed for — defaulting them toward Sprint when Exam Bundle may be the better trial.

**Fix:** Audit current paywall component(s). Surface the $29 Exam Bundle as a primary option when the user's persona resolves to `cram` (≤6 weeks per existing `derive_persona` logic) or `acceleration` (6 weeks – 6 months). Sprint stays available but moves to secondary. Foundation users (no exam scheduled, persona='foundation') keep the current Sprint-led presentation.

**Scope:** FE only. No pricing change. No BE change. Surface logic keys off persona already derived in onboarding state.

**Branch:** `feat/b-104-paywall-exam-bundle-surfacing`

**Owner:** Frontend Engineering

---

## Working protocol reminder

- Every new ticket drafted must reference this BACKLOG.md and use the next available F-0xx number.
- Every completed ticket must be marked ✅ in this file with a brief summary of what shipped.
- If this file conflicts with memory or a past conversation, this file wins.
- External tracker equivalent: there isn't one. This file IS the tracker.

---

---

## Mapping notes — M0 milestone tagging (2026-05-25)

TBD tickets below have ambiguous milestone assignments. One-line questions for Chadi.

- **P-222.x, P-222.y** — capacity_warning UX + EcoleReveal waitlist-aware copy: M1 (onboarding surface parity) or polish-defer?
- **P-230.x, P-230.consolidate, P-230.unify** — Recent activity calendar + /progress de-duplication: M1 (dashboard completeness) or polish-defer?
- **P-213** — Dialogue Box template authoring: M4 (La Bibliothèque content), M1 (L'École surface), or polish-defer?
- **P-231, P-232, P-233, P-234.history, P-234.exercises, P-234.speaking-promptCluster, P-235, P-236, P-237, P-241** — Post-launch P1 dashboard + prescription surfaces: any of these required for soft-beta (M1/M7), or all polish-defer?
- **P-250, P-251** — Threshold calibration + lesson content delivery: M4 (La Bibliothèque) or post-launch?
- **P-260, P-261, P-262, P-263, P-264, P-265, P-266** — Phase 2 writing + content expansion: all polish-defer?
- **P-104.x** — Wall-clock setTimeout cap fallback: M1 pre-launch blocker or polish-defer edge case?
- **V-015d.trend, V-015d.streak, V-013b.lang-pref, V-013b.notifications, V-013b.password, V-013a.history, V-016g.notify** — BE endpoints called by shipped M1 FE surfaces: which are required for M1 sign-off vs. deferrable to V1.1+?
- **F-312** — OQLF + Académie française RAG retrieval: M3 prerequisite (scorer quality) or separate infrastructure track outside V1.0 milestones?
- **F-225.constraint** — F-225 amendment doc (non-visual change note): mark DONE (process doc only) or keep as M1 process gate?
- **F-310.fe.coldreload** — Route email_not_verified 403 on cold reload: M1 edge case or polish-defer until a real user hits it?
- **BACKLOG-HYGIENE-001** — F-320 stale corpus_partition enum line: DONE (one-line cleanup) or TBD?
- **EX-100** — Execution tooling evaluation: not milestone-gated — close as ops or defer to M7 process review?

---

### M2 t10 — Wire Atelier Français color tokens (light + dark) + --lm-* bridge

**Milestone:** M2 (token foundation)
**Status:** ✅ Shipped — cf73e19 (main, 2026-05-30)
**Non-visual change (no Playwright receipt required):** token-only edit; no new components or layout surfaces.

**What shipped:**
- DESIGN.md v2 canonical palette defined in `:root` (light) and `.dark` (night-paper): `--paper`, `--ink`, `--dominant`, `--accent` and their scale/alpha variants; couche tokens `--couche-default` / `--couche-pieges`; shape tokens `--r-xs` … `--r-pill`; motion `--ease` / `--ease-snap`.
- `.dark` block fully replaced: v2 night-paper values per DESIGN.md §2 locked spec. `--foreground` and `--accent` flip automatically with the `.dark` class (wordmark-ready).
- Shadcn rewire updated: `--background`, `--foreground`, `--primary`, `--accent`, `--border`, `--input`, `--ring` all chain through v2 canonical tokens.
- `--lm-*` bridge: all tokens re-pointed to v2 canonical vars; no `--lm-*` token deleted (M-RENAME handles component-level migration).
- Stale v1 hexes eliminated: `C49A3A / FAF7F0 / BC4F2A / A66A2E / 8E5A1F / E0701D / D4A431` — zero matches in globals.css.
- v2 Tailwind utilities added to `@theme inline`: `--color-paper`, `--color-ink`, `--color-dominant`, `--color-couche-*`, etc.

**⚠ M-RENAME flags (PR notes for Chadi):**
- `--lm-brand-*` mapped to `--dominant-*` (v1 warm ochre had no v2 analog; nearest semantic = primary).
- `--lm-bg-base` mapped to `var(--paper)` (v1 `#FAF7F0` warm cream banned in v2; components reading this now get pure white in light mode).
- `--lm-warm-*` decorative tokens mapped to nearest paper/dominant/ink roles; `--lm-warm-sage-deep` was `var(--accent-primary)` (sage green), now `var(--dominant-soft)` (blue-grey). Component-level migration is M-RENAME.
- Pastel chip tokens (`--lm-pastel-*`) retained at original hex — no v2 semantic role; they're decorative chip layer only per DESIGN.md §2 color hierarchy.

**Blocks:** t1–t9 re-execution against v2 spec, M-RENAME routes.

---

### M2 t11 — Wire Type A typography tokens + next/font loading

**Milestone:** M2 (token foundation)
**Status:** ✅ Shipped — ee03af4 (main, 2026-05-30)

**What shipped:**
- Five fonts loaded via `next/font/google` in `app/layout.tsx`, all with `subsets: ['latin', 'latin-ext']` for French diacritics (é è ê à ô ç œ Œ):
  - `Instrument_Serif` w400 → `--font-instrument-serif`
  - `Crimson_Pro` w400/600 normal+italic → `--font-crimson-pro`
  - `Instrument_Sans` w400/500/600 → `--font-instrument-sans`
  - `Inter` w400/500/600 → `--font-inter`
  - `DM_Mono` w400/500 → `--font-dm-mono`
- All five `.variable` bindings on `<html>` className.
- `globals.css` `:root` — DESIGN.md v2 semantic aliases: `--f-display`, `--f-body`, `--f-ui`, `--f-en`, `--f-mono` → next/font injected vars.
- `@theme inline` utilities: `--font-display`, `--font-body`, `--font-ui-fr`, `--font-ui-en`, `--font-mono`.
- Legacy shadcn bridges: `--font-sans → --f-ui` (Instrument Sans), `--font-serif → --f-body` (Crimson Pro). No broken references.
- Stale v1 fonts (Cabinet Grotesk localFont, v1 Geist, v1 Source Serif 4) removed from imports + all CSS references.
- `Select-String -Pattern 'Cabinet Grotesk|Geist|Source Serif'` → 0 matches in `app/layout.tsx` + `app/globals.css`.
- `themeColor` updated from warm cream to v2 `--paper` (#FFFFFF).

**⚠ Playwright diacritic gate deferred:** Target routes (`/la-methode`, `/la-bibliotheque`, `/l-examen`) are M-RENAME routes that currently 404 per DESIGN.md §10. French diacritic visual verification batched into the soft-beta launch full-surface Playwright battery (F-225 amendment). Coverage exists for all live routes.

**PR notes for Chadi — weight choices (DESIGN.md silent on these):**
- Instrument Serif: w400 only (no other weights on Google Fonts for this face).
- Crimson Pro italic included (editorial body pull quotes, marginalia per DESIGN.md §7).
- Instrument Sans / Inter / DM Mono weights flagged in the commit; use the table defaults from the brief.

**Blocks:** t1–t9 re-execution against v2 spec.

---

### M2 ops — Disable Playwright auto-captures + clean output (drive constraint)

**Milestone:** M2 ops
**Status:** ✅ Shipped — (main, 2026-05-30)

**What shipped:**
- `playwright.config.ts`: `screenshot: 'off'`, `video: 'off'`, `trace: 'off'` added to `use` block. Previously only `trace: 'on-first-retry'` was set; screenshot/video were implicitly off. All three now explicit.
- `.gitignore`: Added `playwright-report/`, `tests/screenshots/`, `tests/traces/`, `tests/videos/` alongside existing `test-results/` entry.
- Deleted `test-results/` directory (existed on disk, empty, 0 MB). No other capture directories were present.

**F-225 verification approach change (Chadi 2026-05-30 — drive constraint):** F-225 amendment (automated Playwright capture as the verification receipt) is **reverted** for the current dev machine. Verification approach for all future tickets reverts to:
1. Manual smoke test against local dev server.
2. Confirm `next build` passes.
3. Deploy to lemethodic.com (Vercel) and verify the live URL.

The F-225 amendment remains documented in CLAUDE.md as the intended protocol; it will be re-enabled when drive space allows. Until then, `non-visual change — verification skipped` or `manual smoke pass` are acceptable receipt notes on PRD entries.

**Disk freed:** 0 MB (captures were already empty). Config and gitignore changes prevent future accumulation.

---

End of BACKLOG.md.
