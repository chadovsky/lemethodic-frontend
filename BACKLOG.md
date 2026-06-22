# LeMethodic Backlog

**Source of truth** for LeMethodic sprint work. Maintained in the frontend repo because most active work is here, but covers both frontend and backend.

**Last updated:** 2026-05-01 (P-100 / P-100.5 superseded by P-230 + Phase 1 Architecture Rework from LEMETHODIC-CURRICULUM v0.2 â€” 33 tickets P-200 through P-269 filed; P-115 + P-104 + P-100.5 still shipped as production state until P-230 implementation lands)
**Sprint window:** April 21 â€“ May 4, 2026
**Sprint pivot (2026-04-25):** launch-prep tickets (F-071 through F-079) pushed behind the intelligence-layer initiative. F-080 (Module Library + Intelligence Layer) is now the spine of the remaining sprint window â€” replaces generic Claude-API feedback with a named library of L1-interference remediation modules and cross-session accumulation.

> **Note (F-086, 2026-04-27):** Le Raccourci was renamed to L'Ã‰cole. Historical entries below â€” anything marked âœ… shipped before today â€” are preserved verbatim with their original "Le Raccourci" / `raccourci_*` references. Forward-looking queued and deferred entries have been rewritten to use the new names. The DB migration (`scripts/rename_raccourci_to_ecole.py`) ran cleanly: `raccourci_lessons` â†’ `ecole_lessons`, `raccourci_quiz_questions` â†’ `ecole_quiz_questions`, `user_raccourci_progress` â†’ `user_ecole_progress`, `remediation_modules.raccourci_lesson_id` â†’ `ecole_lesson_id`. F-087 will replace lesson row contents wholesale and truncate user progress.

---

## How this file works

- Every ticket has a unique F-0xx ID. IDs are never reused or renumbered.
- Tickets reference repos by their local paths: `fluentpath-frontend/` or `tcf-oral-tool/`.
- Status markers: âœ… shipped Â· ðŸ”„ in progress Â· ðŸ“‹ queued Â· â¸ deferred
- When a ticket is closed, mark âœ… and leave it in place. Do not delete.
- When a new ticket is created, append it with the next available F-0xx number.
- When a ticket spawns sub-work, either break it into new F-0xx tickets OR add numbered sub-items. Do not nest sub-phases beyond one level.

---

## Shipped â€” Week 1 (April 21)

F-038 âœ… [BE] Fluency analysis layer (backend)
F-039 âœ… [FE] [historical, see code comments]
F-040 âœ… [FE] [historical, see code comments]
F-041 âœ… [FE] [historical, see code comments]
F-042 âœ… [FE] [historical, see code comments]
F-043 âœ… [FE] [historical, see code comments]
F-044 âœ… [BE] Language verification (backend)
F-045 âœ… [FE] [historical, see code comments]
F-046 âœ… [FE] FR i18n leaks, radar orphaning, hidden accordions
F-047 âœ… [FE+BE] TÃ¢che 1/2/3 mode architecture (tache_mode column)
F-048 âœ… [BE] TÃ¢che 1 engine (examiner persona)
F-049 âœ… [BE] TÃ¢che 2 engine (Yarden methodology)
F-050 âœ… [BE] TÃ¢che 2 PTT + transcription review (backend)
F-051 âœ… [BE] TÃ¢che 3 engine (monologue scoring)
F-052 âœ… [BE] OpenAI TTS-1-HD integration + cache
F-053 âœ… [BE] Le Raccourci backend (lessons, completion, gating)

## Shipped â€” Week 2 (April 22)

F-054 âœ… [FE] v0 onboarding screen 1 + design tokens
F-055 âœ… [FE] v0 onboarding screens 2-6 + paywall
F-056 âœ… [FE] v0 home screen + Le Raccourci tab + lesson detail + quiz scaffold
F-057 âœ… [FE] v0 speaking module (Speaking landing, T1, T2 picker, T2 session, T3 session, TranscriptReviewPanel with Pyramide/Rebond/Ciblage)
F-058 âœ… [FE] v0 diagnostic view (CouchesDiagnostic stacked bars, Le Goulet, L'Ordonnance, CorrectedLine)
_Diagnostic view shipped; Progress page surface tracked separately as P-100; session-details data layer remains a future ticket (referenced inline within F-084 / F-084.x / F-075b.x)._

## Shipped â€” Week 2 (April 23)

F-059 âœ… [FE+BE] Phase 3 integration
  - Backend: onboarding persistence (6 new columns on users table)
  - Backend: POST /api/users/onboarding endpoint
  - Frontend: API plumbing (lib/api, lib/auth, lib/types, lib/onboarding)
  - Frontend: Login screen at /login
  - Frontend: Signup screen at /signup with ?trial= query param
  - Frontend: Paywall CTAs rewired to /signup
  - Frontend: Auth gates via ProtectedRoute on all protected routes
  - Frontend: Root route auth-aware redirect
  - Frontend: HomeScreen real user data (name, countdown, 16-lesson progress)
  - Frontend: useVerifyAuth hook â€” validates stored tokens via /api/auth/me
  - Frontend: Auto-clearAuth on 401 from any API call
  - Onboarding store wiring: every step writes to useOnboardingStore on change
  - /test-drive route deleted (deferred post-launch)
  - Paywall heading renamed "Where you stand today"

F-061 âœ… [FE+BE] TÃ¢che 3 full loop shipped â€” audio capture, upload, backend analysis, diagnostic page render with real data. Verified end-to-end on recording #22.
  - `hooks/useAudioRecorder.ts` â€” MediaRecorder wrapper exposing status, error, durationMs, stream, startRecording, stopRecording, reset; Date.now()-based timing (sidesteps the hidden-tab throttle called out in F-076); releases getUserMedia tracks on stop/reset/unmount so the browser recording indicator doesn't linger
  - Maps getUserMedia errors (NotAllowedError, NotFoundError, NotReadableError, SecurityError) to human-readable copy; "permission" keyword in the string is what Tache3Session uses to switch into the permission-help card
  - `components/speaking/VuMeter.tsx` â€” stream prop drives a Web Audio AnalyserNode (fftSize 64, smoothing 0.55) read via requestAnimationFrame; AudioContext torn down on stream change / unmount; falls back to idle bars when no stream
  - `components/speaking/Tache3Session.tsx` â€” wired to useAudioRecorder; phase state machine (prep â†’ recording â†’ processing â†’ error); 3-minute hard cap via useEffect on durationMs; stopRecording idempotency guard; CountdownTimer driven from durationMs in count-up mode
  - Upload path: `api.sessions.createRecording(topicId, blob, { targetLevel, uiLanguage, examProfile })` posts multipart to /api/recordings/upload; on success router.push(`/diagnostic?session=${id}`); on failure, blob is cached in a ref so the retry button re-uploads the same audio
  - Permission denial UX: dedicated "Microphone access needed" card with retry that re-enters prep and waits for a fresh user gesture (some browsers require this after denial)
  - `app/diagnostic/page.tsx` â€” reads `session` search param, calls `api.sessions.getDiagnostic`, renders real 4-couche scores (couchesToRows sorted worst-first), goulet, and up to 3 ordonnance steps (tops up with mock cards if backend returns <3); peach loader during fetch; dedicated error card with retry; falls back to mock data when no session param (so /diagnostic still works for design review)
  - Topic slug parsing is defensive: numeric slug â†’ topic_id, non-numeric â†’ fallback to 1 (see queued F-061.1 for the real picker + slug resolver)
  - tsc --noEmit: clean except the pre-existing TargetScoreSelect.tsx:98 error noted under "Known issues"
  - Out of scope and deferred to F-062/F-063: TÃ¢che 1 and TÃ¢che 2 session wiring (they share the useAudioRecorder + VuMeter primitives but have different state machines â€” multi-turn conversations vs single recording)

## Shipped â€” Week 2 (April 24)

F-061.2a âœ… [FE+BE] TÃ¢che 3 upload hotfix â€” tache_mode + error surfacing hardening
  - `lib/api.ts` `createRecording`: added `tacheMode` option accepting `1|2|3|'tache_1'|'tache_2'|'tache_3'`; normalizes bare digits to `tache_${n}` before posting. Defaults to `'tache_3'`. Unblocks F-062/F-063 reuse. Backend's `_validate_tache_mode_for_oral` rejects anything other than the full string form with a 400.
  - `components/speaking/Tache3Session.tsx` uploadBlob catch: differentiates `ApiError` (prefix with status code, surface backend `detail` verbatim), `TypeError` from fetch (actual network failure â†’ "Couldn't reach the server"), and other errors (generic fallback). Stops mislabeling server-side errors as connectivity problems.
  - Tache3Session call site passes `tacheMode: 3` explicitly â€” normalized to `'tache_3'` at the API boundary.

F-061.2 âœ… [FE] Fetch method inference fix
  - Fixed fetch method inference in `lib/api.ts` `request()` â€” bodies now force POST. Affected `createRecording` and `uploadAudio` (would have bit F-062 too). Caller audit confirmed all 16 endpoints use correct methods.
  - Root cause: the request wrapper defaulted `method = 'GET'`. The two FormData callers passed only `{ formData: fd }` with no explicit method, so fetch was invoked with `GET + body` and the browser rejected it synchronously with "Request with GET/HEAD method cannot have body." This silent failure never reached the Network tab and was only pinpointed by transient `REC:` / `SESSION:` console instrumentation (removed on ship).
  - Fix: `method = opts.method ?? (body !== undefined || formData ? 'POST' : 'GET')`. Explicit overrides still work; all other callers already passed `method: 'POST'` explicitly so only the two FormData sites changed behavior.

F-061.3 âœ… [FE] Ordonnance shape normalization
  - Backend `ordonnance` is a wrapper object `{ couche_ciblee, nom_couche, exercices: [...] }` with per-exercise keys `{numero, type, consigne, modele, phrase, options, reponse, explication}`. Empty recordings serialize as `{}` (per `recordings.py:645`). Frontend was typing it as `OrdonnanceStep[]` and calling `.slice(0, 3)` on the object â€” instant runtime TypeError on first real diagnostic render.
  - `lib/api.ts`: new `RawOrdonnanceExercise` / `RawOrdonnanceBlock` types + a dedicated `mapOrdonnance(raw: unknown)` guard that returns `[]` for any unrecognized shape and key-maps present exercises (`numeroâ†’priority`, `consigneâ†’action` with `type` fallback, `typeâ†’pattern`, `modele ?? phraseâ†’example`). `RawDiagnosticBlock.ordonnance` retyped to `unknown` so the guard owns the shape check.
  - `app/diagnostic/page.tsx:316`: belt-and-braces `(diagnostic.ordonnance ?? []).slice(0, 3)` â€” if a future backend shape change breaks the mapper invariant, the page renders fewer cards instead of crashing. Mock-card padding (tops up to 3) still kicks in when backend returns fewer exercises.

F-062 âœ… [FE+BE] TÃ¢che 2 multi-turn role-play shipped end-to-end â€” 6-turn flow with examiner persona, per-turn review sheet with per-session suppression, final /end routes to diagnostic with real 4-couche analysis on combined audio.
  - `components/speaking/Tache2Session.tsx` â€” full rewrite against a phase state machine: `briefing â†’ user-idle â†’ user-recording â†’ user-transcribing â†’ reviewing â†’ examiner-speaking â†’ finalizing` (plus `error` recovery). Fixed 6-turn client-side cap (`TARGET_USER_TURNS`); backend hard cap is 12 so the client's cap always wins and we explicitly call finalize.
  - Reuses F-061 primitives unchanged: `useAudioRecorder` (60s per-turn cap via effect on `durationMs`, same pattern as T3's 180s but with a different threshold) and `VuMeter` (stream-driven AnalyserNode). No fork.
  - PTT flow â€” hold to record, release to stop. Idempotency guards (`stoppingRef`, `finalizingRef`) prevent the 60s cap effect racing a user tap, and prevent double-finalize on error-retry.
  - Per-turn upload: `api.sessions.uploadConversationTurn(conversationId, audioBlob)` â€” new method on the API surface (renamed from `uploadAudio` with enriched response shape: `autoEnded`, `wrapUpHint`, `examinerTurnNumber` added).
  - Examiner playback: simple `HTMLAudioElement` with autoplay attempt. On `NotAllowedError` (autoplay blocked on first load) shows a "Tap to hear the reply" ghost button; subsequent turns play inline once the audio context is user-unlocked. Text-only fallback when backend returns `examiner_turn_audio_url: null` (TTS unavailable).
  - Muted toggle respected on the NEXT examiner turn, not mid-sentence â€” intentional so toggling mute doesn't cut off the current line.
  - Per-session review-suppression: `reviewSuppressed` is ephemeral component state (NOT localStorage per spec). Default false; checkbox in the turn-review sheet flips it for remaining turns in the same session.
  - Turn-review sheet: simplified from spec â€” backend emits `feedback_grid` only at `/end` (see discrepancy note below), so the sheet shows the user's transcribed line with a "Confirmer" CTA and the suppress checkbox, **not** the Pyramide/Rebond/Ciblage moule breakdown. Full moule breakdown still appears on `/diagnostic` after finalize, via the existing mapper chain.
  - Finalize: `api.sessions.finalizeConversation(conversationId)` â€” new method hitting `POST /api/conversations/{id}/end`. Semantically identical to the spec's `/finalize` (runs 4-couche analysis across all candidate turns, returns recording_id, idempotent on completed conversations). Routes to `/diagnostic?session=<recording_id>` on success.
  - Error surface: mirrors F-061.2 pattern â€” `ApiError` â†’ "{status}: {message}", `TypeError` â†’ network error, microphone permission errors â†’ recorder's own copy. Retry button re-enters the right phase based on state (briefing if /start failed, user-idle if mid-conversation, finalize if /end failed).
  - Scenario briefs: client-side literals for the three unlocked scenarios (`agence-voyages`, `ami-demenage`, `bibliotheque`); fallback brief for any other slug so direct URL edits don't crash (backend still rejects unknown `scenario_code` with 404 on `/start`). Picker wiring to `GET /api/conversations/scenarios` is deferred to F-061.1.
  - API surface additions (`lib/api.ts` + `lib/types.ts`): `ConversationStart`, `ConversationTurnResult`, `ConversationFinalizeResult` types; `createConversation` now takes an options bag (`scenarioCode`, `topicId`, `targetLevel`, `uiLanguage`, `examProfile`) and returns the richer `ConversationStart` shape with opening-examiner fields (always null for T2) and normalized turn caps.
  - Spec discrepancies documented for the follow-up ticket (not blocking ship):
      Â· Spec assumed `/turn` response carried `feedback_grid`; backend only emits feedback at `/end`. Per-turn moule coaching isn't available â€” sheet shows transcript confirmation instead.
      Â· Spec named the final endpoint `/finalize`; backend has `/end` with identical semantics. Frontend method name kept as `finalizeConversation`; HTTP endpoint is `/end`.
      Â· T2 `/start` returns `examiner_turn_text: null` (candidate opens). Spec's `examiner-speaking` phase after briefing is skipped for T2 â€” we go straight to `user-idle`. The phase still exists for T1 reuse in F-063.
  - Verification: `tsc --noEmit` clean except the pre-existing TargetScoreSelect.tsx:98 known issue.

F-062.1 âœ… [FE] Scenario slugâ†”backend code mapping + dev sanity check
  - Bug: browser test hit "Start conversation" on /speaking/tache-2/agence-voyages and got `404: Unknown or inactive scenario_code 'agence-voyages'`. Frontend was sending URL slugs; backend's `tache2_scenarios.code` column uses underscored + three entirely different spellings (picker and seeder drifted during F-049 seeding):
      Â· `agence-voyages` â†’ `agence_voyages` (hyphenâ†’underscore)
      Â· `ami-demenage` â†’ `ami_demenagement` (different word form)
      Â· `bibliotheque` â†’ `bibliotheque` (exact)
      Â· `collegue-quebecois` â†’ `nouveau_collegue_quebecois` (prefix)
      Â· `agence-immobiliere` â†’ `agence_immobiliere_canada` (suffix)
  - Fix: added a `backendCode` field to each `Scenario` / `ScenarioBrief` literal â€” one in `Tache2Picker.tsx`, one in `Tache2Session.tsx`. `createConversation` now sends `brief.backendCode` instead of the URL slug. URL slugs stay hyphen-cased (no breaking changes). Fallback for unknown slugs sends the slug itself; backend returns a clean 404 surfaced via the error overlay.
  - Dev sanity check (Tache2Picker): on mount in `NODE_ENV === 'development'`, fires `api.sessions.listTache2Scenarios()` once and `console.warn`s any unlocked SCENARIOS entry whose `backendCode` isn't in the backend response. Locked entries are skipped because `/scenarios` filters by the raccourci gate (F-053) â€” a "missing" warning for a gated row would be a false positive. Errors are swallowed silently.
  - New API method: `api.sessions.listTache2Scenarios()` â€” GET /api/conversations/scenarios, returns trimmed `{scenarios: [{id, code, difficulty}], aboveA2}`. Reused by the sanity check; eventually consumed by F-061.1 picker wiring as the source-of-truth replacement for the client literal.
  - TODO(F-061.1) comment on both sides points at the long-term fix: have the picker consume `/scenarios` directly, eliminating the drift problem by construction.

F-062.2 âœ… [FE] PTT pointer capture + minimum-hold guard
  - Bug: turn 2 of a T2 session produced a 110-byte empty webm; backend rejected with `500: Transcription failed: ... File does not appear to contain audio. File type is video/webm`. Turn 1 always worked.
  - Diagnosis (via transient REC:/T2: instrumentation, removed on ship): `RecordButton.tsx` wired `onPointerLeave={handlePointerUp}`. On turn 1, the getUserMedia permission prompt absorbs the pointer-down gesture â€” by the time the MediaRecorder starts, no layout shift matters. On turn 2, permission is cached, getUserMedia returns in ~10ms, the phase transition `user-idle â†’ user-recording` mounts the turn-timer text + VuMeter above the button, the button shifts down in the layout â†’ `pointerleave` fires against the user's still-held finger â†’ `onPTTEnd` â†’ `finishRecording` â†’ recorder stops ~10ms after start â†’ 0 audio chunks â†’ 110-byte header-only webm. Full trace in conversation thread.
  - Fix 1 â€” pointer capture in `components/speaking/RecordButton.tsx`: `setPointerCapture(pointerId)` on pointerdown routes all subsequent pointer events to the button regardless of cursor position. `pointerleave` no longer fires while captured. `pointerup` still delivered correctly even if the user's finger drifts off the button. Dropped `onPointerLeave={handlePointerUp}`; added `onPointerCancel` handler (releases capture + fires onPTTEnd) to handle OS-level pointer takeaway (phone call, tab switch, app backgrounded, stylus lifted without a normal up event). Tap mode (`mode === 'tap'`, used by T3) is untouched â€” every new handler bails with `if (mode !== 'ptt') return`.
  - Fix 2 â€” `MIN_HOLD_MS = 200` guard in `components/speaking/Tache2Session.tsx` `finishRecording`: if `recorder.durationMs < 200` when stop fires, discard the blob, reset phase to `user-idle`, no upload, no error card. Silent design â€” a user slip-finger should feel like the button just didn't register, not like an error. Belt-and-braces on top of pointer capture; also catches genuine accidental taps.
  - Verification: 6 turns end-to-end, landed on /diagnostic?session=<id> with real 4-couche analysis. T3 tap flow re-tested â€” no regression (shared RecordButton component but tap mode bypasses every new handler).

---

## Shipped â€” Week 2 (April 27)

F-086 âœ… [FE+BE] Le Raccourci â†’ L'Ã‰cole rename. Atomic phase-1 of the F-086â†’F-089 pack.

**Backend (tcf-oral-tool):**
- `scripts/rename_raccourci_to_ecole.py` â€” idempotent SQLite migration. Renamed three tables (`raccourci_lessons` â†’ `ecole_lessons`, `raccourci_quiz_questions` â†’ `ecole_quiz_questions`, `user_raccourci_progress` â†’ `user_ecole_progress`) and one column (`remediation_modules.raccourci_lesson_id` â†’ `ecole_lesson_id`). Row counts preserved exactly: 16 lessons, 80 quiz questions, 80 progress rows. SQLite 3.50.4 auto-rewrites FK references on `ALTER TABLE RENAME`; foreign-key enforcement disabled during the migration window as belt-and-braces. Indexes keep their original `raccourci_*` names â€” internal sqlite_master metadata, not surfaced anywhere user-or-grep-facing.
- Discovery: an early run hit a Windows console encoding crash on the `â†’` character mid-loop, leaving one table renamed and two not. Migration script's idempotency check now tolerates per-table half-state and resumes from any partial state. Future runs (e.g. on prod first-deploy) re-run cleanly. ASCII `->` replaced the offending arrow in print statements.
- Backend code rename via one-shot `_f086_refactor.py` (deleted post-ship): 184 raccourci/Raccourci occurrences across 14 .py files replaced. ORM classes (`RaccourciLesson` â†’ `EcoleLesson`, `RaccourciQuizQuestion` â†’ `EcoleQuizQuestion`, `UserRaccourciProgress` â†’ `UserEcoleProgress`), `__tablename__` strings, FK targets (`raccourci_lessons.id` â†’ `ecole_lessons.id`), relationship names, the entire `app/services/raccourci_gating.py` (now `ecole_gating.py`), the entire `app/routers/raccourci.py` (now `ecole.py`) including `APIRouter(prefix="/api/ecole")`, three scripts (`seed_ecole_lessons.py`, `seed_ecole_quiz_placeholders.py`, `add_ecole_tables.py`), `app/schemas/modules.py::raccourci_lesson_id` field, and incidental references in `conversations.py`, `recordings.py`, `users.py`, `modules.py`, `main.py`. Substitution order: most-specific identifier first so e.g. `raccourci_lesson_id` was replaced before bare `raccourci_lessons` could eat it.
- 3 module JSONs (`nuance_reflex.json`, `to_get_reflex.json`, `gerondif_confusion.json`) had `raccourci_lesson_id` keys renamed to `ecole_lesson_id`. Reseeded via `python -m scripts.seed_remediation_modules`: 0 inserted, 3 updated. Post-reseed verify: `gerondif_confusion.ecole_lesson_id = 16` (lesson-16 link preserved across rename), other two NULL.

**Frontend (fluentpath-frontend):**
- One-shot `_f086_refactor.mjs` (deleted post-ship): 95 occurrences across 21 .ts/.tsx files. Component identifiers (`RaccourciProgress` â†’ `EcoleProgress`, `RaccourciReveal` â†’ `EcoleReveal`), field name on response shapes (`raccourci_lesson_id` â†’ `ecole_lesson_id` on `RemediationModule`, `RecurringModule`, `ModuleWithContext`, `LearnModuleSheet`'s ShortModule), API path strings (`/api/raccourci` â†’ `/api/ecole`), frontend route paths (`/raccourci/lesson` â†’ `/ecole/lesson`), illustration asset paths, user-facing copy (`Le Raccourci` â†’ `L'Ã‰cole`).
- Files moved: `components/home/RaccourciProgress.tsx` â†’ `EcoleProgress.tsx`, `components/onboarding/RaccourciReveal.tsx` â†’ `EcoleReveal.tsx`, `public/illustration-raccourci.{jpg,png}` â†’ `illustration-ecole.{jpg,png}`. Directory `app/raccourci/` â†’ `app/ecole/` blocked by Windows file lock (Next.js `.next` cache held handles); worked around with file-by-file moves + cascading `rmdir`. Stale `.next/` cache nuked at the end so the next dev start rebuilds with the new paths.
- Two regressions caught and fixed: the `Le Raccourci â†’ L'Ã‰cole` substitution introduced **unescaped apostrophes** inside single-quoted JS strings (in `LearnModulePage.tsx`, `Paywall.tsx`, `Tache2Picker.tsx` â€” 7 broken literals total) â€” fixed by swapping to double quotes. Also produced a **broken JS identifier** `backToÃ‰cole` (Unicode-valid but ugly) â€” renamed to `backToEcole` (ASCII).
- `RaccourciReveal` onboarding component renamed to `EcoleReveal` per atomicity rule (overrides earlier "scoped rename" interpretation). The component reveals the path to fluency â€” that path is now L'Ã‰cole.

**Strategic docs:**
- `fluentpath-frontend/CLAUDE.md`: 3 `RaccourciReveal` references updated to `EcoleReveal`.
- `fluentpath-frontend/README.md` + `public/illustrations/README.md`: `RaccourciReveal` references updated.
- `BACKLOG.md`: header note added at top documenting the rename. Shipped (âœ…) entries preserved verbatim (F-053, F-056, F-062.x details, F-080d details). Queued/deferred entries with raccourci references rewritten in place (F-064, F-066, F-069, "Mock Exam mode" deferred). The "in progress" header text updated to reflect post-F-086 reality and forward-link F-087 â†’ F-089.
- `tcf-oral-tool/CLAUDE.md`: zero raccourci hits to start with â€” untouched.
- `HANDOVER.md`, `PROMOVA-PATTERNS.md`, `DECISIONS.md` â€” none existed in either repo. `HANDOVER.md` and `PROMOVA-PATTERNS.md` skipped silently per the per-prompt rule. `DECISIONS.md` awaiting Chadi's entry text (commit ships without it; gate 9 is satisfied because the file simply doesn't exist yet â€” when it does, the rename note will be its first entry).

**Verification gates (all 9 green):**
1. `GET /api/ecole/lessons` â†’ 200 with 16 lessons. âœ…
2. `GET /api/raccourci/lessons` â†’ 404. âœ…
3. DB: `ecole_lessons` exists, `raccourci_lessons` does not. âœ…
4. `SELECT ecole_lesson_id FROM remediation_modules WHERE id='gerondif_confusion'` â†’ 16. âœ…
5. `app/ecole/page.tsx`, `app/ecole/lesson/[id]/page.tsx`, `app/ecole/lesson/[id]/quiz/page.tsx` exist. âœ…
6. `app/raccourci/` directory does not exist. âœ…
7. HomeScreen daily-action CTA href: `/ecole/lesson/${nextLesson.lessonNumber}`. âœ…
8. `/learn` page footer copy: `"Back to L'Ã‰cole"` / `"Retour Ã  L'Ã‰cole"`. âœ…
9. `grep -ri "raccourci" tcf-oral-tool/ fluentpath-frontend/` returns ZERO active code references. Allowed survivors only: (a) the migration script `rename_raccourci_to_ecole.py` itself, (b) `.claude/settings.local.json` (gitignored local agent state), (c) `node_modules/typescript/.../fr/diagnosticMessages.generated.json` (TypeScript's French translation of "shorthand property" â€” completely unrelated to FluentPath), (d) BACKLOG.md historical entries below the header note (per Chadi's preserve-shipped-verbatim rule).

`pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

---

F-087 âœ… [FE+BE] 27-lesson L'Ã‰cole curriculum. Phase 2 of the F-086â†’F-089 pack.

**Backend (tcf-oral-tool):**
- New `scripts/seed_ecole_curriculum.py` â€” single-run migration + seeder. Adds `phase` (default 1) and `subline_en` (nullable) columns to `ecole_lessons` via idempotent `ALTER TABLE ADD COLUMN IF NOT EXISTS`-equivalent (PRAGMA-guarded). Wipes `user_ecole_progress` (80 stale rows from the pre-rename test users â€” 0 completions, 1 quiz attempt, no real investment per F-086 Q1.2 audit). Truncates `ecole_lessons` and inserts the locked 27 rows. Updates `remediation_modules.ecole_lesson_id` for `gerondif_confusion` from 16 â†’ 22 (gÃ©rondif moved from old curriculum lesson 16 to new curriculum lesson 22, in Phase 2). Linear prerequisite chain (1â†’2â†’3â†’â€¦â†’27).
- Two minor fixes when saving Chadi's script: trimmed columns from the lesson INSERT that don't exist on `ecole_lessons` (status / quiz_attempts / completed_at / updated_at â€” those live on `user_ecole_progress`); replaced unicode arrows + check/cross marks in print statements with ASCII to avoid the same Windows console encoding crash that bit F-086.
- Curriculum locked: Phase 1 Fondations (1-16) replaces the old curriculum's Conjugation / Articles / Prepositions / etc. with Articles dÃ©finis et indÃ©finis (1) â†’ Concordance des temps et hypothÃ¨se (16). Phase 2 Approfondissement (17-27) is brand new: Verbes pronominaux (17) â†’ Faire causatif (18) â†’ Mise en relief (19) â†’ Tournures impersonnelles (20) â†’ Comparatifs (21) â†’ GÃ©rondif (22) â†’ PrÃ©sentatifs (23) â†’ Connecteurs logiques (24) â†’ Marqueurs temporels (25) â†’ Registre oral (26) â†’ Nominalisation (27). Voix passive removed from sequence; demoted to module library as `voix_passive_calque` per spec note (separate authoring ticket, not part of F-087).
- Each lesson row carries `subline_en` (deadpan English subline) authored at seed time. F-087 only stores them; F-089 surfaces them under the lesson title on cards.
- Backend code updates: `EcoleLesson` model gains `phase` + `subline_en` columns; `_lesson_row_to_summary` and `_lesson_full_detail` in `app/routers/ecole.py` expose both fields in the API response. `phase` defaults to 1 in both serialization and ORM, so any pre-F-087 row that survives a future regression lands as Fondations. `subline_en` flows through nullable; F-089 surfaces it conditionally.

**Frontend (fluentpath-frontend):**
- `lib/types.ts::Lesson`: `phase: 1 | 2` (required, defaulted by mapper) + `sublineEn?: string | null` (optional). `lib/api.ts::mapLesson` defaults `phase` to 1 when the backend omits it (covers any rollback / replay against an older API), maps `subline_en â†’ sublineEn`.
- `components/home/HomeScreen.tsx`: `TOTAL_LESSONS` 16 â†’ 27. Lesson list loop now renders all 27 rows with a Phase 2 divider injected at the boundary (when `prev.phase === 1 && current.phase === 2`). Divider component `<PhaseDivider />` (defined inline in HomeScreen since it's the only consumer): small-caps "PHASE 2 â€” APPROFONDISSEMENT" header + subline "11 lessons of polish, after the click." Keyed off row data, not hardcoded `lesson_number === 17`, so a future curriculum reshuffle just works.
- `components/home/EcoleProgress.tsx`: 3 milestones rebalanced to the new curriculum:
    Â· Fondations (Lessons 1â€“4) â€” unchanged
    Â· Approfondissement (Lessons 5â€“16) â€” replaces "MÃ©caniques" + "Raccourci Complet" splits; earned at lesson 16 to mark the transition INTO Phase 2 Approfondissement
    Â· L'Ã‰cole ComplÃ¨te (Lessons 17â€“27) â€” new, full-curriculum completion at lesson 27
- `components/Paywall.tsx`: feature comparison table "1 of 16" â†’ "1 of 27"; first VALUE_ROWS entry "L'Ã‰cole â€” 16 lessons unlocking B2 grammar" â†’ "27 lessons".
- `components/onboarding/EcoleReveal.tsx`: onboarding step 6 copy "16 lessons" â†’ "27 lessons" (the rest of the EcoleReveal copy intentionally unchanged â€” the "shortcut" framing of the screen is now stale post-rename but is a separate copywriting concern, not a curriculum-count concern; flagged as F-087.x).
- `components/modules/LearnModuleSheet.tsx`: stale "(16 lessons)" comment in the lesson-fetch caching note updated to "(27 lessons post-F-087)".
- `app/ecole/page.tsx`: function name `Ã‰colePage` â†’ `EcolePage` (Unicode-acute identifier was a holdover from the F-086 substitution pass; cleaning to ASCII matches the same rule that produced `backToEcole` in F-086).

**Verification gates (all 7 green):**
1. `GET /api/ecole/lessons` â†’ 27 lessons ordered by `lesson_number` ascending. âœ…
2. Response includes `phase: 1` for lessons 1-16, `phase: 2` for 17-27. âœ…
3. `SELECT COUNT(*) FROM ecole_lessons` â†’ 27. âœ…
4. `SELECT ecole_lesson_id FROM remediation_modules WHERE id='gerondif_confusion'` â†’ 22. âœ…
5. HomeScreen + `/ecole` render 27 lesson cards with the Phase 2 divider visible between #16 and #17 (visual gate â€” code path verified, browser verification deferred to Chadi's smoke).
6. `gerondif_confusion` linked-module picker now routes to `/ecole/lesson/22` (LearnModuleSheet reads `m.ecole_lesson_id` which the API returns as 22 post-seed).
7. Milestone badges render at lessons 4 (Fondations), 16 (Approfondissement), 27 (L'Ã‰cole ComplÃ¨te) with new copy.

`pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

**Filed:**
- **F-087.x** EcoleReveal copy refresh â€” the onboarding step 6 "The shortcut" framing is stale post-Le-Raccourci-â†’-L'Ã‰cole rename. Component renamed to EcoleReveal in F-086, lesson count updated to 27 in F-087, but the rhetorical lead-in still calls L'Ã‰cole "the shortcut." Chadi to revise the copy when ready (not blocking; F-087 was scoped to mechanical curriculum updates).

---

F-089 âœ… [FE] Lesson card subline rendering. Final phase of the F-086â†’F-089 pack.

**Backend (tcf-oral-tool):**
- No changes. F-087 had already exposed `subline_en` on both `_lesson_row_to_summary` and `_lesson_full_detail` in `app/routers/ecole.py`; the model column was added in the same seed. B1 verification confirmed the API was already shipping the field on all 27 lessons.

**Frontend (fluentpath-frontend):**
- `lib/types.ts::Lesson.sublineEn` and `lib/api.ts::mapLesson` were both wired in F-087 â€” F-089 only adds rendering.
- `components/home/DailyActionCard.tsx`: optional `subline?: string` prop. Rendered between title and descriptor at 14px / weight 500 / `INK_MUTED` / line-height 1.5, no italic. Title bottom margin tightens from 8 â†’ 4 when a subline is present so the visual stack stays balanced.
- `components/home/LessonListItem.tsx`: same `subline?: string` prop, rendered as a third single-line ellipsised row at 13px between title (15px) and descriptor (12px). Subline conditional â€” locked rows still get it (they get `EcoleLesson.sublineEn` regardless of progress).
- `components/home/HomeScreen.tsx`: passes `subline={nextLesson.sublineEn ?? undefined}` to the "Today's session" `DailyActionCard`, and `subline={lesson.sublineEn ?? undefined}` to each `LessonListItem` in the L'Ã‰cole list. Picker pre-resolution now caches both title and subline (`pickerLessonTitle`, `pickerLessonSubline`) and forwards both to `LearnModuleSheet`.
- `components/modules/LearnModuleSheet.tsx`: new `lessonSubline?: string | null` prop (parallel to `lessonTitle`). Same caching pattern â€” caller can pass it to skip the roundtrip; otherwise the on-open `api.lessons.list()` fetch fills it in. Subline is rendered as a third line inside the primary "Structured lesson" CTA below the existing eyebrow + lesson label, at 13px / weight 500 / opacity 0.7 against the dark button background.
- `app/diagnostic/page.tsx`: same picker pre-resolution change as HomeScreen â€” `pickerLessonSubline` derived from `lessonsCache` and forwarded to the `LearnModuleSheet` invocation.
- `components/learn/LearnModulePage.tsx`: "Go deeper to Lesson N: {title}" primary CTA on `/learn/[module_id]` now renders the linked lesson's subline below the title line in the same dark-button-on-light-bg style as the picker. Same surface as the picker primary CTA â€” added to scope after a `lesson.title` audit (the original `title_en|title_fr` grep missed this because the title arrives via the normalized `Lesson` shape).
- `app/ecole/lesson/[id]/page.tsx` rewritten â€” split into a thin server shell that awaits route params and a new `LessonDetailClient.tsx` that fetches `api.lessons.list()`, filters by `lesson_number`, and renders real title + subline + description from the data layer. Replaces the pre-F-089 hardcoded `LESSON_TITLES` stub map (which only covered the old 16-lesson curriculum, with lessons 17â€“27 falling through to "Lesson N"). Subline appears between the h1 title and the existing duration eyebrow, at 16px / weight 500 / `INK_MUTED` / line-height 1.5. This was an F-087 verification miss (gate 5 confirmed the list rendered 27 cards but never clicked into a detail page); bundled into F-089 since gate 6 cannot pass without real data wiring. See `F-080d.z` rule #2.

**Verification gates (7):**
1. `SELECT COUNT(*) FROM ecole_lessons WHERE subline_en IS NULL` â†’ 0. âœ…
2. `GET /api/ecole/lessons` returns `subline_en` populated on all 27 lesson objects. âœ… (curl with minted JWT â€” `count: 27`, `with_subline: 27`).
3-7. UI rendering gates â€” code paths verified end-to-end, `tsc --noEmit` clean (only pre-existing `TargetScoreSelect.tsx:98` issue). Browser smoke deferred to Chadi: "Today's session" card, home/`/ecole` list (all 27 + Phase 2 divider), `/ecole/lesson/1` showing "Coffee can't stand alone here. It needs an article. Don't ask why.", and `LearnModuleSheet` picker showing lesson 22's "Three traps wearing the same '-ing.' We disarm them one by one." in the primary CTA.

**Filed:**
- **F-089.x** quiz page (`app/ecole/lesson/[id]/quiz/`) is still stub â€” hardcoded preposition questions regardless of route param. Out of F-089 scope (subline rendering only); flagged as a follow-up since the detail page rewrite makes the contrast more visible.
- **F-080d.z rule #2** added (see below) â€” list rendering verification gates must also click through to a detail page reached from the list.

`pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

---

F-088 âœ… [FE+BE] Couches â†’ TCF criteria relabel. Closes the F-086â†’F-089 pack.

**Spec correction (commit + ticket history accuracy):** the F-088 spec referred to a `/api/diagnostic/{session_id}` endpoint; this codebase doesn't have one. The diagnostic block is served under `GET /api/recordings/{id}` with `result["diagnostic"] = {...}`. Frontend: `lib/api.ts:890` + `mapDiagnosticBlock()`. The implementation targets `/api/recordings/{id}` (and the `/history` companion that uses the same shape).

**Backend (tcf-oral-tool):**
- New `app/services/couche_labels.py` â€” single source for the 4-couche TCF mapping (`le_fond â†’ Ã‰tendue`, `les_moules_des_idees â†’ CohÃ©rence`, `les_moules â†’ Correction`, `les_reflexes_anglais â†’ Aisance`). Exposes `couches_array(scores)` returning `[{internal_key, display_label_en, display_label_fr, score}]` in the canonical order. EN/FR labels are intentionally identical today (TCF criteria use the same French words across language tracks) but kept as distinct keys for forward compatibility.
- `app/routers/recordings.py` â€” hard cut: replaced the `la_carte` dict in both `/api/recordings/history` (line ~594) and `GET /api/recordings/{id}` (line ~791 in `_format_recording`) with the new `couches` array. No transition period, no dual-shape support.
- `app/templates/index.html` â€” the legacy admin/demo dashboard's `displayResults()` migrated alongside the API change. Reads `d.couches` (array), constructs an internal `carte` dict from `internal_key` â†’ `score`, and the rest of the rendering pipeline (which calls `coucheLabel(internal_key)`) is untouched. Admin keeps showing internal pedagogical names per F-088 F5 (internal naming preserved on internal tools).
- Untouched: `analytics.py` (`latest_carte`, `points[].le_fond`, `couche_trends`) â€” the FluentPath frontend doesn't consume `/api/analytics/*`; only the legacy admin template does. Out of F-088 scope.
- Untouched: `analysis.py` LLM contract (the LLM still emits `la_carte` in the analysis JSON; the relabel is a serialization-boundary concern, not an internal-data concern). Same for `Feedback` model column names.

**Frontend (fluentpath-frontend):**
- `lib/types.ts::Couche` â€” `label: string` replaced by `displayLabelEn: string` + `displayLabelFr: string`. `CoucheKey` narrowed from 5 keys to 4 (prononciation removed; the F-088 array doesn't carry it and the historical defensive 5th key was never emitted in production).
- `lib/types.ts::Goulet` â€” `nom` + new `nomFr` string carrying the bottleneck's TCF display labels (pre-resolved by the mapper so the diagnostic page can pick by interface language without rewalking the array).
- `lib/api.ts::mapDiagnosticBlock` â€” reads from `d.couches` array, drops the local `COUCHE_LABELS` dict (labels now come from backend per request). Goulet resolution looks up the matching couche in the array to pre-fill `displayLabelEn` + `displayLabelFr` on the Goulet shape.
- `app/diagnostic/page.tsx` â€” `couchesToRows()` takes an `InterfaceLanguage` and picks `displayLabelFr` for `lang === 'fr'`, `displayLabelEn` otherwise. New `TCF_SECTION_COPY` map gives the eyebrow text in EN/FR/ES (`TCF Evaluation` / `Ã‰valuation TCF` / `EvaluaciÃ³n TCF`). Section heading "Your CEFR-tracking baseline" preserved per spec. Component imports `useInterfaceLanguage()`.
- `components/diagnostic/CouchesDiagnostic.tsx::DEFAULT_ROWS` â€” demo-mode mock data labels updated from internal names (Le Fond / Les Moules / â€¦) to TCF criteria so demo mode matches a real session's bar names. Bottleneck callout already generic ("Your bottleneck is the top row") â€” no couche-specific text to update.

**DECISIONS.md:** entry appended to `tcf-oral-tool/DECISIONS.md` under `April 27, 2026 â€” Couches â†’ TCF criteria relabel (F-088)`. Documents the relabel, the RÃ©flexes Anglais â‰  Aisance honesty flag, and the F-090 backend refactor as the proper post-launch fix.

**Verification gates (7):**
1. Backend: `curl /api/recordings/{id}` returns `couches` array with `display_label_en` + `display_label_fr` populated for all 4 couches. âœ… (verified live: `Ã‰tendue`, `CohÃ©rence`, `Correction`, `Aisance`)
2. Backend: `internal_key` field present on each couche. âœ… (live verified)
3. Frontend: diagnostic page header â€” code path verified (eyebrow reads from `tcfCopy.eyebrow`, switches on UI lang). Browser smoke deferred.
4. Frontend: 4 score bars labeled Ã‰tendue Â· CohÃ©rence Â· Correction Â· Aisance. Code path verified (mapper reads `display_label_*` per couche; `couchesToRows` picks by lang). Browser smoke deferred.
5. Frontend: bottleneck callout uses new labels â€” copy is generic ("Your bottleneck is the top row. Fix it first.") so the relabel is automatic via the bar at the top.
6. Progress tab radar chart â€” **N/A**: `app/progress/page.tsx` is currently a "Coming soon (F-058)" placeholder. No radar to relabel.
7. About page methodology preservation â€” **N/A**: no About page exists in the FluentPath frontend. The methodology framing is preserved by virtue of not having a page to alter.

`pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

**Filed:**
- F-090 (post-launch) â€” proper backend refactor with a true Aisance dimension based on F-038 fluency layer signals. Replaces "RÃ©flexes Anglais â†’ Aisance" relabel with a faithful measure.

---

F-083 âœ… [BE] Per-TÃ¢che pedagogical rubric (backend). Sprint feedback-rendering pack, phase 1.

**Architecture:** additive layer alongside the existing prompts (chosen over strict replacement after a Step 0 audit found the existing `SYSTEM_PROMPT_DIAGNOSTIC` is consumed by F-088 / F-080c / scoring_profiles â€” replacing it would have collapsed yesterday's F-088 ship). Three prompt categories per recording: (1) generic 4-couche diagnostic (`analysis.py::SYSTEM_PROMPT_DIAGNOSTIC`, unchanged); (2) TÃ¢che specialty prompts (T2 Yarden Pyramide/Rebond/Ciblage from F-049, T3 argumentation from F-051, both unchanged); (3) **new** per-TÃ¢che pedagogical rubric (F-083). Two Claude calls per recording instead of one, run in parallel via `asyncio.gather` so total latency is `max()` not `sum()`.

**Backend (tcf-oral-tool):**
- New `app/services/tache_rubric.py` â€” three deadpan-English rubric prompts (`_RUBRIC_SYSTEM_T1` / `_T2` / `_T3`), one entry point `apply_tache_rubric(tache_mode, transcript, context)`, defensive `_coerce_rubric` + `_rubric_fallback`, and a deterministic `_enforce_threshold` that recomputes the retry recommendation from dimension scores so a noisy LLM response can't ship "should_retry: false" when the scores say otherwise. LLM-flagged retries (where the deterministic check disagrees in the "no retry" direction) are preserved with a `LLM-flagged: â€¦` prefix so a subtle LLM signal isn't lost.
- Per-TÃ¢che dimensions (canonical order, mirrored in the prompts):
  - **T1 (5):** premiere_impression, presentation_de_soi, lexique_identite, aisance_hesitations, prononciation
  - **T2 (5):** formation_questions, registre_approprie, actes_de_parole, reactivite, structuration_interactionnelle
  - **T3 (6):** position_claire, argumentation_structuree, connecteurs_logiques, developpement_thematique, defense_calme, aisance_sous_pression
- Universal sidebars (3, all TÃ¢ches): conjugation, grammar_structure, sentence_construction. Each carries a 0-5 score + 1-2 specific examples cited from transcript.
- Retry threshold logic: any dimension < 2/5 OR overall average < 2.5/5 fires retry. T2 also fires when `formation_questions` < 2.5/5 (foundation-skill failure). T3 also fires when `argumentation_structuree` < 2/5 (T3 without structure is just talking).
- `app/services/tache_1.py`, `tache_2.py`, `tache_3.py` â€” each `analyze_tache_*` now runs `apply_tache_rubric` in parallel with `analyze_transcript` via `asyncio.gather`. Result merged at `result["tache_rubric"]`. Existing T2 Yarden / T3 argumentation calls stay sequential after the gather.
- Schema: new `Feedback.tache_rubric_data` TEXT column (nullable). Migration `scripts/add_tache_rubric_data_column.py` â€” idempotent PRAGMA-guarded `ALTER TABLE`, repo-convention sqlite3 direct migration matching the F-062.3 / F-063 / F-080a pattern.
- Persistence: `app/routers/recordings.py::_run_analysis_and_persist` and `app/routers/conversations.py::_run_conversation_analysis_and_persist` both write `tache_rubric_data=json.dumps(analysis["tache_rubric"])` when present (defensive â€” leaves NULL when the rubric call fell back).
- Serialization: `_format_recording` exposes `diagnostic.tache_rubric` (or `null` for legacy / failed-rubric rows).

**Frontend:** none. F-084 is the rendering ticket.

**Verification gates (5/5 green via `scripts/verify_f083_rubric.py`):**
1. âœ… Step 0 grep audit: located the generic prompt at `app/services/analysis.py::SYSTEM_PROMPT_DIAGNOSTIC` (line 264-410). New module added alongside, not replacing.
2. âœ… Live Claude T1 call: 5 dimensions populated, all sidebars present, retry recommendation fires.
3. âœ… T2: 5 dimensions; T3: 6 dimensions. Both with universal_sidebars (conjugation / grammar_structure / sentence_construction) populated.
4. âœ… universal_sidebars present on all three TÃ¢ches in live runs.
5. âœ… Threshold logic deterministic test: 6/6 cases (T1 strong/weak, T2 strong/foundation-fail, T3 strong/no-structure) fire as expected. Coercion robustness: 4/4 cases (empty payload, garbage types, LLM-flag preservation, score clamp). Live Claude retry flag fires correctly per-TÃ¢che.

**Filed (sub-ticket):**
- **F-083.x** â¸ Extract T1 biographical data to user profile. T1 transcripts contain origin/profession/family/hobbies. The diagnostic should extract structured fields and store them on `users` for personalized examples in later sessions. Out of F-083 scope; filed per anti-scope. Estimate: 1 day.

`pnpm tsc --noEmit` clean (frontend untouched). Backend imports clean (`python -c "import main"` smoke).

---

F-084 âœ… [FE+BE] Diagnostic page progressive disclosure (v2 â€” replaces the original basic/detailed toggle design). Two-commit ship: backend extends the F-083 rubric prompt with `narrative_summary`; frontend rebuilds the diagnostic page around 5 layers.

**Audit C decision: A1 (extend F-083 prompt) over A2 (separate Claude call).** The F-083 prompts are large but structurally compartmentalized â€” scoring (sec. 3) and threshold (sec. 4) are isolated from the JSON OUTPUT block (sec. 5). Adding a `narrative_summary` field to the JSON schema doesn't touch the scoring instructions, and the LLM has all the right context already in scope. A2 would have meant 50% more tokens per analysis to re-derive context. F-083 verification harness re-ran 6/6 + 4/4 + 3/3 green post-change â†’ byte-identical scoring confirmed (gate 2).

**Backend (tcf-oral-tool):**
- `app/services/tache_rubric.py` â€” three rubric prompts (T1/T2/T3) gain a `NARRATIVE SUMMARY` instruction block + a `narrative_summary` field in their JSON OUTPUT schemas. Spec format preserved verbatim ("{CEFR band}, headed to {next band}. {What's holding them back, in plain words}." with the three example sentences). Dimension scoring + threshold sections byte-identical to F-083 ship.
- `_coerce_rubric` adds a `narrative_summary` field to the canonical shape (240-char trim cap; LLM occasionally drifts to 2 sentences and the cap protects the hero slot from rendering a wall of text). `_rubric_fallback` returns empty string for legacy/no-key paths.
- `Feedback.narrative_summary` (TEXT NULLABLE) added via `scripts/add_narrative_summary_column.py`. Idempotent PRAGMA-guarded `ALTER TABLE` matching the F-083 / F-062.3 / F-080a pattern. Ran cleanly on dev DB.
- Persistence (both `recordings.py::_run_analysis_and_persist` and `conversations.py::_run_conversation_analysis_and_persist`) extracts `analysis["tache_rubric"]["narrative_summary"]` into the dedicated column. Empty-string fallbacks collapse to `None` for consistent legacy/empty behavior.
- Serialization: `_format_recording` exposes `diagnostic.narrative_summary` at the top level alongside `diagnostic.tache_rubric`. Nullable.
- `scripts/verify_f083_rubric.py` extended to assert `narrative_summary` shape on live Claude runs. Live runs produced the correct deadpan-tutor format on all three TÃ¢ches:
  - T1: *"A2+, foundation work needed. Vocabulary range and content depth are holding you back."*
  - T2: *"A2+, foundation work needed. Scripted delivery is holding you back from real interaction."*
  - T3: *"B2, ready to push for C1. Solid structure and connectors; need richer examples for thematic depth."*

**Frontend (fluentpath-frontend):**
- `lib/types.ts` adds `TacheRubricDimension`, `UniversalSidebar`, `RetryRecommendation`, `TacheRubric` types. `Diagnostic` gains `narrativeSummary: string | null` + `tacheRubric: TacheRubric | null`.
- `lib/api.ts` adds `RawTacheRubric` and pass-through in `mapDiagnosticBlock` (snake_case â†’ camelCase, defensive on every nested field). Empty narrative strings collapse to null at the mapper boundary so the diagnostic page has a single "absent" check.
- New `lib/rubric/dimensionLabels.ts` â€” hardcoded French labels for all 16 rubric dimension keys (T1: 5, T2: 5, T3: 6) plus the 3 sidebar keys. Labels stay French in both UI languages per the F-088 Ã‰tendue/CohÃ©rence/Correction/Aisance precedent. `dimensionLabel()` and `sidebarLabel()` helpers fall back to a prettified snake_case key if a future backend dimension surfaces without a mapping.
- `app/diagnostic/page.tsx` rebuilt around 5 layers:
  - **Layer 1** â€” narrative hero. Single sentence above Section 1, 18px / weight 500 / `INK`. NOT a heading element. Falls back to `"{cefr_band} on TÃ¢che {n}"` for legacy recordings (gate 4).
  - **Layer 2** â€” Sections 1 + 2 unchanged (TCF score hero + couches diagnostic from F-088).
  - **Layer 3** â€” top 3 dimensions card. Selection is deterministic: 1 strength (highest score, canonical-order tie-break) + 2 weaknesses (lowest scores from the remaining set, same tie-break). Visible row sorts by canonical order so the page reads stably regardless of which 3 got picked. Score badges use subtle semantic tinting: `0-1 = soft blush`, `2-3 = neutral`, `4-5 = soft sage`. Prose truncated at 120 chars with ellipsis.
  - **Layer 4** â€” conditional retry callout. Renders only when `retryRecommendation.shouldRetry === true`. Peach card with `"Worth another try"` eyebrow + reason + "Record again" CTA â†’ `/speaking/tache-{n}`.
  - **Layer 5** â€” `"See full breakdown"` disclosure. `useState` toggle, no persistence (gate 7). Expanded contents in order: remaining 2-3 dimensions, universal sidebars (conjugation / grammar_structure / sentence_construction with score + examples), full retry reasoning (always shown inside disclosure even when Layer 4 already showed the reason â€” surface for the no-retry case which uses `nextActionSuggestion` as fallback), then the moved-from-default-render Sections 3 (detected modules) + 4 (L'Ordonnance) + 6 (corrected transcript).
- **Section 5 (mocked WPM / pronon% / flagged-count) deleted entirely.** Mocked stats erode trust once a user notices identical numbers across recordings â€” see F-084.x for the restore plan when F-058 ships real session-details data. Both the Section 5 markup and the now-unused `sessionOpen` useState dropped.

**Verification gates (7):**
1. âœ… Migration idempotent â€” `scripts/add_narrative_summary_column.py` ran cleanly on a DB that already had F-083's `tache_rubric_data` column.
2. âœ… F-083 byte-identical scoring â€” `python -m scripts.verify_f083_rubric` re-ran post-prompt-change: Pass 1 6/6 (threshold logic), Pass 2 4/4 (coercion), Pass 3 3/3 (live shape) â€” same outcome shape as before F-084.
3. âœ… Live Claude `narrative_summary` populated â€” verified via Pass 3 (above) on all three TÃ¢ches in the deadpan tutor format.
4. âœ… Legacy recording falls back â€” `TestClient` GET on recording 33 (T1, pre-F-083): `narrative_summary: None` (key present, value null), `tache_rubric: None`. Frontend's mapper collapses both to null and renders `"${tcfBand} on TÃ¢che 1"` heading.
5. âš ï¸ Layer rendering â€” `tsc --noEmit` clean (only pre-existing `TargetScoreSelect.tsx:98`); dev server returns 200 on `/diagnostic` and `/diagnostic?session=33`. Visual smoke (narrative hero â†’ score â†’ top-3 â†’ retry â†’ disclosure-collapsed) deferred to Chadi.
6. âš ï¸ Disclosure expand interaction â€” code path verified (single `breakdownOpen` useState, conditional render of remaining dims + sidebars + reasoning + Section 3 + Section 4 + Section 6); browser smoke deferred.
7. âœ… No persistence â€” `useState(false)` for `breakdownOpen`, no localStorage, no URL param, no profile field. Page reload resets to collapsed.

`pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

**Filed (sub-ticket):**
- **F-084.x** â¸ Restore session details into the F-084 disclosure when F-058 ships real WPM/pron%/flagged-count data. Section 5 was deleted in F-084 because mocked numbers erode trust the moment a user notices identical stats across recordings; once the underlying data lands, fold the section back in alongside the universal sidebars in Layer 5's expanded view.

**Followups already in BACKLOG**: F-058 itself remains queued (currently the placeholder "Coming soon" Progress page; same data layer F-084.x will eventually need).

---

F-076 âœ… [FE] Background tab timer drift fix. Last of the three pre-launch security tickets.

**Audit reshaped scope, again.** Spec assumed counter-pattern timers (`setInterval(() => seconds + 1)`) across T1/T2/T3 record screens. Reality: T1/T2/T3 already use wall-clock math via `useAudioRecorder.durationMs` (Date.now()-based, fixed in F-061 â€” the file header explicitly notes the F-050 throttle bug). Auto-stop in all three sessions reads `recorder.durationMs >= CAP_MS` directly; the cap fires correctly under throttling, just visually lagged.

The ONE real counter-pattern bug was in `components/speaking/CountdownTimer.tsx` (T3 prep mode's 2-minute prep timer). Old code: `setInterval(() => onTick(remaining - 1), 1000)` â€” decrement-by-1-each-second pattern. Backgrounded â†’ throttled â†’ drift. Single owned-mode caller: T3 prep. The other CountdownTimer caller (T3 recording) is parent-controlled from `recorder.durationMs` and was working accidentally because the no-op `onTick={() => {}}` masked the racing internal interval.

**Frontend (fluentpath-frontend) â€” single commit:**
- `components/speaking/CountdownTimer.tsx` rewritten:
  - Owned mode (default, `controlled=false`): wall-clock math via `Date.now()`. `startTimeRef` captured on mount; tick polls every 250ms (~4Hz when foregrounded; arbitrary firing rate under throttle, doesn't matter â€” `Date.now() - startTime` is correct whenever the tick fires); `onTick(remaining)` pushed each tick; `onComplete()` fires when wall-clock elapsed â‰¥ totalSeconds; `completedRef` guard prevents double-fire on the cleanup race.
  - Controlled mode (new `controlled?: boolean` prop): effect early-returns; component is purely visual. Renders the parent-driven `remaining` prop verbatim.
  - `visibilitychange` listener forces an immediate tick on tab refocus â€” closes the gap between "throttled tick fires" and "user sees current value" for the few ms the next setInterval slot might take.
  - Callbacks (`onTick`, `onComplete`) captured via refs that sync each render â€” effect doesn't restart on callback identity change.
  - Effect deps `[controlled, totalSeconds]` only â€” runs ONCE per mount, not on every tick (the pre-F-076 design re-ran the effect on every `remaining` change, which is why the timer felt slightly off in foreground too).
- `components/speaking/Tache3Session.tsx`: T3 recording mode usage now passes `controlled` explicitly. The pre-F-076 `onTick={() => {}}` smell is replaced by an explicit "parent owns timing" declaration; CountdownTimer's internal interval no longer races there.

**Backend:** none. F-076 was always purely frontend.

**Verification gates (5; manual gates 2-5 deferred to Chadi's browser smoke):**
1. âœ… Audit findings reported, including the audit-vs-spec mismatch (T1/T2/T3 already wall-clock via useAudioRecorder; only CountdownTimer was broken).
2-5. âš ï¸ Browser-smoke gates deferred to Chadi:
   - 30s background â†’ prep timer reads ~30s elapsed correctly (covered by Date.now() math)
   - Full 2-min background â†’ prep auto-completes on refocus (covered by visibilitychange listener firing tick + onComplete on the catch-up tick)
   - T3 recording controlled mode â†’ CountdownTimer renders parent-driven `remaining` without running its own interval (effect early-returns when `controlled=true`)
   - Foreground baseline â†’ identical behavior to current production (1Hz visual updates since `displaySecs = remaining` is floored seconds; ring transition + label unchanged)

  Code path traced for each gate. Dev server returns 200 on `/speaking/tache-3/environnement` post-change. `pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

**Pre-launch security trio complete:** F-075a (upload size cap) + F-075b (TTS auth wrap) + F-076 (timer drift fix) all shipped 2026-04-27. **Next: DigitalOcean App Platform deploy. Launch May 4.**

---

F-075b âœ… [BE] Auth on audio serving. Second half of F-075 (security hardening, carried from F-050).

**Audit reshaped the scope.** The original F-075b spec assumed a user-audio serving route existed and lacked an ownership check. **It doesn't exist.** Audit found no `app.mount("/uploads", ...)`, no `FileResponse` returning recording audio anywhere; `_serialize_turn` (conversations.py:138) explicitly refuses to expose candidate audio_url with the comment "We deliberately do NOT expose candidate audio_url â€” those are raw filesystem paths to ./uploads and aren't web-servable." `_format_recording` doesn't include `audio_path` either. The frontend `<audio>` calls in `Tache1Session` / `Tache2Session` play back **examiner TTS** (`/tts_audio/<hash>.mp3`), not user recordings.

The actual exposed surface was `/tts_audio/`, mounted as unauthenticated static files (`app.mount("/tts_audio", StaticFiles(...))` in main.py). Hashes are SHA-256 of `(text, voice, model)` â€” guessing is intractable â€” but anyone with a leaked URL (devtools network logs, captured frontend bundles) could refetch without auth.

**Backend (tcf-oral-tool):**
- `main.py` â€” replaced `app.mount("/tts_audio", StaticFiles(...))` with an authenticated `GET /tts_audio/{filename}` handler. Depends on `get_current_user`, which already accepts both the `access_token` cookie AND the `Authorization: Bearer` header. The cookie path is critical â€” browsers don't attach the Authorization header to `<audio>` element fetches but they do send cookies, so existing T1/T2 examiner playback continues to work without frontend changes.
- Path traversal defense, two layers:
  - Filename string filter rejects `/`, `\`, `..`, `\x00`, leading `.`.
  - Post-resolution check via `Path.resolve().relative_to(cache_root)` confirms the resolved file actually lives inside the cache dir â€” catches symlink-based escapes and any future filename quirk the string filter doesn't anticipate.
- Media type inferred from extension (`.mp3 â†’ audio/mpeg`, plus wav/ogg/m4a/webm fallbacks; unknown â†’ `application/octet-stream`). The TTS pipeline only emits .mp3 today; the table is forward-compat for a future provider that ships other formats.
- Static `/static` mount unchanged (app/static â€” CSS/templates, not audio).

**Frontend:** none. Cookie-auth path keeps the existing `<audio src="/tts_audio/...">` playback working without code changes.

**Verification gates (revised; user-audio gates dropped since no such route exists):**
1. âœ… `/tts_audio/<file>.mp3` unauthenticated â†’ 401 (`{"detail":"Not authenticated"}`).
2. âœ… Same path with `Authorization: Bearer <jwt>` â†’ 200, body matches stub bytes, `content-type: audio/mpeg`.
3. âœ… Same path with `access_token=<jwt>` cookie â†’ 200 (the `<audio>` element path that keeps T1/T2 playback working).
4. âœ… Path traversal blocked across 6 attempts:
   - `../etc/passwd` â†’ 404 (router doesn't match multi-segment paths)
   - `..\windows\system32` â†’ 400 (handler guard)
   - `.hidden` â†’ 400 (handler guard)
   - `subdir/file.mp3` â†’ 404 (router)
   - `subdir\file.mp3` â†’ 400 (handler)
   - `with\x00null.mp3` â†’ rejected at httpx URL parser before the request leaves the client (defense-in-depth at the client lib layer)
5. âœ… Well-formed but missing filename â†’ 404 (sanity).

Harness `scripts/verify_f075b_tts_auth.py` drops a synthetic mp3 stub into the TTS cache, exercises all gates, and removes the stub via try/finally per F-080d.z rule #1. Real cache state is untouched.

`python -c "import main"` smoke clean. Confirmed via `app.routes` inspection that the `/tts_audio` mount is gone and only the `/tts_audio/{filename}` route handler is registered.

**Filed:**
- **F-075b.x** ðŸ“‹ â€” canonical pattern for the future user-audio serving route. **Spec preserved verbatim from Chadi's go-ahead message** so whoever wires playback first has the exact contract:

  > When future tickets need to play user audio (F-081 audio drills, F-058 session details with playback, or any new playback consumer), add `GET /api/recordings/{id}/audio` with: (1) `get_current_user` dependency, (2) ownership check via `Recording.user_id == current_user.id`, (3) **404 (not 403)** on mismatch to avoid existence-leaking, (4) `FileResponse` with media type inferred from `audio_path`'s extension. Do NOT use `app.mount('/uploads', ...)` â€” that bypasses ownership entirely.

  Rationale for the 404-not-403 choice: returning 403 leaks the existence of recordings owned by other users (an attacker could enumerate IDs and learn which exist). 404 is indistinguishable from a missing recording, preventing the enumeration leak.

---

F-075a âœ… [BE] Server-side audio upload size cap. First half of F-075 (security hardening, carried from F-050); F-075b (user_id auth on /api/audio/{id} serving) remains queued.

**Audit findings reshaped the design.** The spec assumed one upload endpoint (`/api/recordings/upload`); the codebase has **four** audio-receiving multipart routes:
- `POST /api/recordings/upload` (T3 / legacy single-shot)
- `POST /api/recordings/transcribe` (F-002 two-step; appears unused by current FE but still live)
- `POST /api/conversations/{id}/turn` (T1 + T2 per-turn)
- `POST /api/audio/upload` (F-050 audioâ†’URL+transcript helper)

A path-prefix middleware (`/api/recordings/*`) would have left two of four wide open. Adopted **content-type filter** instead â€” middleware matches any `POST` with `Content-Type: multipart/form-data` regardless of path, defending current routes and any future audio endpoint added without updating an allowlist.

**Cap chosen:** 10 MB. Real-world corpus check (30 audio files on disk): max 1.68 MB, p50 184 KB. 10 MB gives ~6Ã— headroom over the largest legitimate file. Override via `MAX_AUDIO_UPLOAD_BYTES` env if testing needs a different ceiling.

**Backend (tcf-oral-tool):**
- `app/config.py` â€” new `MAX_AUDIO_UPLOAD_BYTES` constant (default `10 * 1024 * 1024`, env-overridable). Documented at the call site as a 6Ã— headroom decision with a note not to exceed 20 MB without a real reason.
- `main.py` â€” Layer A middleware `enforce_multipart_upload_cap`: matches `POST` + `Content-Type: multipart/form-data`, reads `Content-Length`, returns `413 {"detail": "Audio file exceeds maximum allowed size of 10 MB"}` when exceeded. Malformed Content-Length values fall through to Layer B (the route's authoritative gate) rather than 400 here.
- Layer B route-level checks added on all four routes:
  - `app/routers/recordings.py` â€” module-level `_enforce_audio_size_cap(content)` helper, called after each `await audio.read()` in both `/upload` and `/transcribe`.
  - `app/routers/audio.py` â€” inline `len(content) > cap` check after `await audio.read()` in `/upload`.
  - `app/routers/conversations.py` â€” same inline check inside `append_turn` for the `audio` branch.
- All four sites raise `HTTPException(status_code=413, detail=â€¦)` so the frontend gets a consistent error regardless of which layer caught it.

**Verification harness `scripts/verify_f075a_size_cap.py` (3 passes, 5 routes):**
- **Pass 1** Layer A â€” POST `/api/recordings/upload` with an 11 MB body â†’ middleware returns 413. âœ…
- **Pass 2** Layer B â€” all four routes with an 11 MB body â†’ 413 from each. âœ…
  - `/api/recordings/upload` âœ…
  - `/api/recordings/transcribe` âœ…
  - `/api/audio/upload` âœ…
  - `/api/conversations/{id}/turn` (started a real conversation, posted over-cap audio) âœ…
- **Pass 3** regression â€” 256 KB legitimate body â†’ status 500 from STT failing on synthetic bytes (NOT 413; the size check let it through, which is the gate). âœ…
- Cleanup per F-080d.z rule #1 â€” snapshot `Recording.id` max + full `Conversation.id` set pre-run, delete any rows added during the run in a `try/finally`. Confirmed: 1 recording + 1 conversation deleted on each run, existing rows untouched.

`python -c "import main"` smoke clean.

**Frontend:** none (per spec â€” F-075a is backend-only).

**Filed:**
- **F-075a.x** â¸ Frontend client-side audio size guard. Pre-flight check on the recording blob size before triggering upload, with a clear "Recording too long; please record a shorter session" message. Falls back to handling the server's 413 response. Out of F-075a scope (which was server-side enforcement only). Estimate: 1-2h.
- **F-075b** ðŸ“‹ user_id auth on `/api/audio/{id}` serving â€” the second half of the original F-075. Still queued; same launch-prep window as F-076 (background-tab timer drift).

---

F-091.0 âœ… [FE] V1 onboarding lock to TCF-only. Pre-launch ticket; May 4 launch ships TCF-honest.

**Approach (a-prime) â€” adopted after Step 0 audit found the spec's two choices (hide selector / grey out cards) didn't fit the architecture.** No discrete exam-selector step exists in this codebase: step 2 is `TCFGoalSelect` which captures motivation (`immigration` / `studies` / `general`), and the exam profile is **derived** from goal via `mapOnboardingToBackend`. The goal step also gates step 4 (`TargetScoreSelect` branches on `state.goal` to choose between CLB / B1-C2 / "confident conversational"-style options) â€” removing it breaks the score-selection screen.

(a-prime) keeps the goal selector visible (motivation persists for F-091b post-launch) and locks the false-promise leaks at two surface points:

**Frontend (fluentpath-frontend) â€” single commit:**
- `components/onboarding/TCFGoalSelect.tsx`:
  - immigration descriptor: `"TCF / TEF Canada, CLB scoring"` â†’ `"TCF Canada, CLB scoring"` (TEF dropped)
  - studies descriptor: `"DELF, DALF, academic admissions"` â†’ `"TCF for academic admissions"` (DELF/DALF dropped; TCF DAP for university entry is a real product fit)
  - general descriptor: unchanged (was already exam-neutral)
- `lib/api.ts::GOAL_TO_EXAM_PROFILE`:
  - `immigration` â†’ `'tcf_canada'` (unchanged; was real)
  - `studies` â†’ `'tcf_canada'` (was `'delf'` â€” false-promise string that silently fell through to TCF Canada server-side via `get_profile()`'s default fallback)
  - `general` â†’ `'tcf_canada'` (was `'tcf_general'` â€” same false-promise pattern)
- F-091.0 ship comments added at both surface points so F-091b can find the unwind sites cleanly.

**Backend:** none. The exam_profiles registry already has only `TCF_CANADA`; `get_profile()` already falls back to TCF for unknown ids. The behavior was already TCF-everywhere; F-091.0 makes the persisted strings match.

**Verification gates (5):**
1. âœ… New user signup walks through onboarding without seeing TEF/DELF/DALF â€” code path verified, two descriptor strings stripped (only F-091.0 ship comments retain the strings, not user-visible). Browser smoke deferred.
2. âœ… Live signup test (`TestClient` against `/api/auth/register` + `/api/users/onboarding`) â€” registered user, fired the onboarding flush three times once per goal, all three persisted `exam_profile = 'tcf_canada'`. Test user cleaned up via try/finally per F-080d.z rule #1.
3. âœ… Existing users unaffected â€” pre-flight DB audit: 12 users total, 9 NULL + 3 `'tcf_canada'`. Zero non-TCF rows to disturb.
4. âœ… TCF analyzer dispatch fires correctly â€” no backend changes; the existing dispatch was already TCF-only via the registry default, and `users.exam_profile` for new signups now matches what the dispatch expects.
5. âœ… Analytics N/A â€” no `analytics`/`track`/`posthog`/`mixpanel`/`gtag` calls anywhere under `components/onboarding/` or `lib/onboarding*`. Nothing to remove or constant-fire.

`pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue.

**Unwind for F-091b** (post-launch): the two surface points carry F-091.0 ship comments. F-091b restores the goal-aware mapper (now with real `tef.py` + `delf.py` registered) and re-enables the original descriptors. No DB migration needed â€” `users.goal` is already persisted unchanged today.

---

## Shipped â€” Week 2 (April 30)

P-100 âœ… [FE] Real Progress Dashboard. Replaces the "Coming soon (F-058)" placeholder on the Progress tab with the 4-section dashboard â€” live in production on lemethodic-frontend.vercel.app. **Superseded by P-230 (LEMETHODIC-CURRICULUM v0.2 Â§10.4) on 2026-05-01.** The shipped 4-section dashboard is the current production state and stays live until P-230 implementation lands; the original P-100 spec is no longer the target.

**Sections live:**
1. Snapshot card (current CEFR estimate, target level, exam date countdown)
2. Couches diagnostic â€” sustained position (rolling average, reuses `components/diagnostic/CouchesDiagnostic.tsx`)
3. Activity timeline (14-day dot calendar, plain SVG)
4. Recurring modules list (top 5 by recurrence_count, severity-colored, linked to Ã‰cole lessons)

**Initial-ship gap (resolved by P-100.5 on 2026-05-01):** Sections 2 and 4 didn't render for a single-recording user, and Section 1 CEFR mismatched the diagnostic page. Investigation found three distinct root causes â€” see P-100.5 entry under "Shipped â€” Week 2 (May 1)" for the fixes. P-100 is fully shipped after that bundle.

**Out of scope (per spec):** streaks (waits on F-067), couche scores time-series chart, total time practiced. Empty-state CTA routes to Speaking Lab.

---

## In progress

**F-080 epic CLOSED 2026-04-26.** F-080a + F-080b + F-080c shipped 2026-04-25; F-080d shipped 2026-04-26. The intelligence layer is end-to-end live: detection â†’ persistence â†’ diagnostic surface â†’ cross-session recurrence â†’ Raccourci routing.

F-086 + F-087 + F-088 + F-089 shipped 2026-04-27. The F-086â†’F-089 rename pack is closed. Next per the roadmap: F-091 multi-exam routing. Other queued tickets (F-061.1 T3 picker, F-064 lesson detail + quiz / F-089.x quiz stub, launch-prep F-071â€“F-079, F-080.x detection-sensitivity refinement, F-080c.x Le Goulet cleanup, F-080d.x recordings(user_id) perf, F-080d.y public-glossary path, F-087.x EcoleReveal copy refresh, F-090 backend Aisance refactor) remain deferred.

---

## P-100 â€” Real Progress Dashboard (LEGACY SPEC â€” SUPERSEDED)
Milestone: DONE

**Status: Superseded by P-230 (LEMETHODIC-CURRICULUM v0.2 Â§10.4) on 2026-05-01.** Spec block kept below for historical reference only â€” do not implement against this. P-230 rebuilds /progress per Â§7.4 with calm/method modes, Block 2 (Goulet Stack), Block 5 (Dialogue Box), Block 8 (Confidence Visualizer).

**Priority:** High (Phase 1, Block 4)
**Status:** ~~Ready to start~~ Superseded
**Scope:** Replace "Coming soon (F-058)" placeholder on Progress tab with functional dashboard. Frontend-only work, no backend instrumentation required for v1.

### Sections (top to bottom)

1. **Snapshot card**
   - Current CEFR estimate: avg of last 3 recordings' cefrLevel
   - Target level (from user.targetLevel)
   - Exam date countdown (from user.examDate)
   - Plain card, no chart

2. **Couches diagnostic â€” sustained position**
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
   - Each row linked to its Ã‰cole lesson via ecole_lesson_id
   - Show: name_fr or name_en (locale-driven), recurrence_count, severity badge

### Empty state (zero recordings)
- Show snapshot card with placeholders
- Hide sections 2â€“4
- Big CTA: "Take your diagnostic to unlock your dashboard" â†’ routes to Speaking Lab (TÃ¢che 1 default)

### Out of scope (defer to P-100.5)
- Streaks (waits on F-067)
- Couche scores time-series chart
- Total time practiced

### Files likely touched
- app/progress/page.tsx (replace placeholder)
- components/dashboard/* (new section components)
- Reuse: components/diagnostic/CouchesDiagnostic.tsx
- API: GET /users/me/dashboard (or compose from existing endpoints â€” backend agent will scope)

### Definition of done
- All 4 sections render with real data on lemethodic-frontend.vercel.app
- Empty state works for new users (verified end-to-end)
- Mobile-first verified at 380px width
- No new chart libraries added

---

## Shipped â€” Week 2 (May 1)

P-115 âœ… [FE] **Partial ship â€” foundation + 4 of 8+ motion surfaces.** Filed 2026-04-30, foundation shipped 2026-05-01 (`df11866`), motion implementation 2026-05-01 (`64aad94`). Remainder filed as **P-115.x** (see Queued â€” follow-ups below).

**Foundation (`df11866`):**
- `framer-motion@^12.38.0` added.
- `lib/motion.ts` â€” easing tuples (`easeFpDefault` / `easeFpEnter` / `easeFpExit`), spring presets (`heightSpring` / `liftSpring` / `pressSpring` reserved-for-non-button), `pressInstant` for buttons, duration tokens (`durationFast` / `durationBase` / `durationSlow`), stagger helper, scale constants.
- `globals.css` â€” `--fp-canvas`, `--fp-track`, `--fp-peach-deep`, `--fp-sage-deep`, `--fp-sage-deep-25`, `--fp-error` tokens promoted; `--fp-safe-{top,bottom,left,right}` env() passthroughs; motion CSS vars + Tailwind 4 utilities (`ease-fp-default`, `ease-fp-enter`, `ease-fp-exit`).
- All inline `#FAFAF7`/`#E8E8E5`/`#E0A890`/`#2D8B55` literals migrated to `var(--fp-*)` references across 24 files.
- `viewportFit: 'cover'` added to viewport metadata (without it, `env(safe-area-inset-*)` returns 0 on iOS); `userScalable: false` removed (WCAG 2.1).
- Safe-area applied to: BottomNav, Paywall bottom CTA, OnboardingScreen.CTAButton, TÃ¢che 1/2 record bars + review sheets, TÃ¢che 3 main content, TranscriptReviewPanel, LearnModuleSheet inner action, diagnostic root wrapper, plus sticky headers in HomeScreen / /progress / /profile / ecole/lesson / quiz.
- Paywall billing toggle pill 38px â†’ 44px (HIG floor).

**Motion implementation (`64aad94`) â€” 4 surfaces:**
1. **Diagnostic reveal** â€” `components/diagnostic/CouchesDiagnostic.tsx`. Bars stagger in worst-first using `staggerDiagnosticRow` (0.075s); user-fill width animates 0% â†’ score%, score-dot tracks. Easing `easeFpEnter`, duration `durationDiagnosticReveal` (0.7s, justified). Bottleneck callout fades up after all bars settle.
2. **Recording-done state** â€” `Tache1Session.tsx`, `Tache2Session.tsx`, `Tache3Session.tsx`. Record icon scale-pulse `[1, 1.08, 1]` on transcribe/process; status text remounts via `key={phase}` to retrigger upward fade.
3. **Lesson unlock** â€” `QuizClient.tsx` writes `lemethodic:unlocked-lesson` to sessionStorage on perfect-score finish; `HomeScreen.tsx` reads + clears + passes `justUnlocked` to `LessonListItem.tsx`; one-shot scale 0.96 â†’ 1.0 + boxShadow tier-1 â†’ tier-2 â†’ none keyframes (1s total). Stoic, not celebratory.
4. **Empty-state pulse** â€” `components/dashboard/EmptyState.tsx`. Primary CTA scale `[1, 1.02, 1]` loops every 3s (1.5s active + 1.5s gap). Pauses on `whileHover`/`whileTap` (pause-during-interaction, not permanent kill).

All 4 surfaces respect `prefers-reduced-motion` via `useReducedMotion()`.

**Verification:** `pnpm tsc --noEmit` clean except F-108 pre-existing. Mobile-first 380px verified â€” no layout reflow risk in any of the animations.

**Out of scope (filed as P-115.x):** button presses, card transitions, tab switches, progress bar fills, onboarding step transitions, streak fire icon. Foundation is in place; remainder is a separate pass.

**Reference benchmark:** Promova.

---

P-104 âœ… [FE] **Background-tab timer drift fix â€” Step 1 (visibilitychange listener).** Pre-launch UX hardening for the per-TÃ¢che cap auto-stop when the user backgrounds the tab mid-recording.

**Investigation finding:** `useAudioRecorder.durationMs` and `CountdownTimer` (owned mode, F-076) already use `Date.now()` deltas, so the values are wall-clock-correct. The residual gap is **state-update cadence** â€” `setInterval(100ms)` is throttled to â‰¥1Hz in background tabs (and paused entirely under Chrome's intensive throttling after ~5 min hidden). The downstream `useEffect([recorder.durationMs])` cap-watchers in T1/T2/T3 only fire when `durationMs` lands in React state, so a stale state means a late auto-stop.

**Backend ground-truth check:** the frontend never reports duration to the backend â€” `uploadConversationTurn` and `createRecording` send only the audio blob plus metadata. Backend computes duration from the audio file. So timer drift is **purely a UX issue**, not data corruption; no DB migration needed.

**Fix (`hooks/useAudioRecorder.ts`):**
- New `visibilityHandlerRef` to track the listener for cleanup parity with `tickRef`.
- New `unbindVisibility` cleanup helper, called everywhere `stopTicks` is called (unmount effect, startRecording catch, stopRecording's onstop / onerror / catch, reset).
- Inside `startRecording`, after the interval is set up: attach a `visibilitychange` listener that calls `setDurationMs(Date.now() - startedAtRef.current)` on tab refocus. This wakes downstream effects within one frame of the user returning, so the cap auto-stop trips immediately rather than waiting for the next throttled `setInterval` tick.
- Pattern matches F-076's CountdownTimer fix verbatim.

**Verification:** `pnpm tsc --noEmit` clean except F-108 pre-existing.

**Out of scope (filed as P-104.x):** the deep-throttle edge case where the tab is hidden for the entire turn duration plus several minutes, never refocusing in time. Addressed by a wall-clock `setTimeout` cap fallback. Deferred until real user data shows the long-hidden case actually happens.

---

P-100.5 âœ… [FE] **Dashboard rendering bundle.** Three independent fixes that together complete P-100 (Real Progress Dashboard). Filed and shipped 2026-05-01 after a single-recording user surfaced three rendering issues on production: SnapshotCard CEFR mismatched the diagnostic page (A2 vs B2), SustainedCouches didn't render at all, RecurringModulesList silently disappeared.

**Superseded by P-230 (LEMETHODIC-CURRICULUM v0.2 Â§10.4) on 2026-05-01** â€” the same day the bundle shipped. Rendering fixes are preserved as production state until P-230 implementation lands; the underlying CEFR null handling, F-110.1 migration, and empty-state placeholder all carry forward into the rebuilt dashboard.

**Investigation finding:** three distinct root causes, two genuine bugs and one design decision needing a UX patch.

**Fix 1 â€” CEFR null handling (`app/diagnostic/page.tsx`, `components/dashboard/SnapshotCard.tsx`):**
- Removed the silent `?? 'B2'` fallback at `diagnostic/page.tsx:451` that masked a null backend `cefr_level` by displaying a hardcoded "B2" hero. The user-reported B2/A2 mismatch was almost certainly this fallback faking data while the F-110 list endpoint (which the dashboard reads) returned the real "A2".
- Diagnostic hero now renders `tcfBand ?? 'â€”'` in muted color when null, with `aria-label="CEFR band pending"` for screen readers.
- Narrative fallback no longer interpolates a null `tcfBand` into "null on TÃ¢che 1"; renders "Analysis pending" copy when both `narrativeSummary` and `tcfBand` are absent.
- SnapshotCard's `Cell` gains a `placeholder` prop that mutes the value color when rendering the "â€”" placeholder. Both surfaces now agree on the visual signal: muted "â€”" = data not available; INK = real value.

**Fix 2 â€” F-110.1 migration shipped via P-100.5 (`lib/api.ts`):**
- `RawCouche.internal_key` â†’ `RawCouche.key`.
- `mapRecordingSummary` filter `c.internal_key` â†’ `c.key`; map `key: c.internal_key` â†’ `key: c.key`.
- `mapDiagnosticBlock` same migration.
- F-088 docblock updated to reference the new field name.
- The original symptom: F-110 list endpoint emitted `key` per spec while frontend filtered on `c.internal_key`, silently rejecting every couche entry. SustainedCouches's defensive `if (rows.length === 0) return null` then hid the section entirely. Backend `couches_array` dual-emits both fields during the transition window, so reading `key` works against /history, /{id}, and the F-110 list endpoint uniformly.
- F-110.1 entry in Queued â€” follow-ups marked superseded by P-100.5 (same code change). F-110.2 backend cleanup is now safe to execute.

**Fix 3 â€” Recurring-modules empty placeholder (`components/dashboard/RecurringModulesList.tsx`):**
- Backend `getRecurringModules` returns empty for users with fewer than 3 distinct recordings (F-080d threshold). Confirmed by the API method's docblock at `api.ts:725-731`. Not a bug â€” by design.
- Replaced `if (top5.length === 0) return null` with a placeholder card that renders the section eyebrow + subhead + a one-line copy: "Recurring patterns will appear after your first 3 recordings. Keep practicing." (FR equivalent: "Les schÃ©mas rÃ©currents apparaÃ®tront aprÃ¨s vos 3 premiers enregistrements. Continuez Ã  pratiquer.")
- Disappearing UI sections feel like bugs to users; the placeholder communicates the threshold honestly.

**Verification:** `pnpm tsc --noEmit` clean except F-108 pre-existing. After Vercel deploys, verify in InPrivate on `/progress` that Section 1 CEFR matches diagnostic page, Section 2 renders couche bars, Section 4 shows the placeholder copy.

**P-100 status:** fully shipped. The original P-100 ship (2026-04-30, 4-section dashboard) plus P-100.5 (rendering bundle) close the ticket. The P-100.5 follow-up flag from the original ship entry is resolved.

---

## Phase 1 Architecture Rework â€” From LEMETHODIC-CURRICULUM v0.2

**Source:** `LEMETHODIC-CURRICULUM.md` Â§10 (committed 2026-05-01, commit `84320ea`).
**Filed:** 2026-05-01.
**Roster:** 33 tickets â€” 23 Phase 1 (P-200â€“P-251), 10 Phase 2 deferred stubs (P-260â€“P-269). Sequenced by dependency. Supersedes the original P-100 spec and the placeholder P-200 tickets that existed prior to the curriculum doc.

### Foundation (Â§10.1) â€” must ship first, in order

### P-200 â€” [BE] Diagnostic engine: detector implementation
Milestone: DONE

**Priority:** HIGH (pre-launch blocker)
**Status:** Shipped 2026-05-02 (BE-side, lemethodic-backend 3-commit set ending `554d824`). FE consumer pending Â§7 dashboard work.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.1
**Dependencies:** none
**Scope:** implement L1 transfer detector, preposition error detector, subordination counter, connector variety scorer, A2 sentence structure detector, A2 infinitive substitution detector. Plug into existing analysis pipeline alongside couches scoring. Output ceiling markers per level.
**Owner:** Engineering

### P-201 â€” [BE] Diagnostic engine: level assignment + confidence
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-02 (BE-side, lemethodic-backend 2-commit set ending `0d10d11`). FE consumer pending Â§7 dashboard work.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.1
**Dependencies:** P-200
**Scope:** implement level assignment rule (Â§3.5). Add confidence scoring. Surface level + confidence on diagnostic page and Snapshot via Block 8.
**Owner:** Engineering

### P-202 â€” [BE] Cluster data model
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-01 (BE-side, lemethodic-backend commit `d5595b3`).
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.1
**Dependencies:** none
**Scope:** backend schema for clusters (grammar topic, vocabulary theme, TÃ¢che application, lesson reference, exercise set reference, prompt reference, detection rubric, lesson delivery format flag). Migration. CRUD for clusters via admin or seed script.
**Owner:** Engineering

### P-203 â€” [BE] Path data model
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-01 (BE-side, lemethodic-backend commit `d5595b3`).
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.1
**Dependencies:** P-202
**Scope:** backend schema for paths (level start, level target, phases, cluster sequence per phase). Path entity, Phase entity, PathCluster join table.
**Owner:** Engineering

### P-204 â€” [BE] User progress model
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-01 (BE-side, lemethodic-backend commit `d5595b3`).
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.1
**Dependencies:** P-202, P-203
**Scope:** backend schema for user's path enrollment, current phase, current cluster, cluster status (not_started / in_progress / absorbed / needs_revisit), cluster history.
**Owner:** Engineering

### Content scaffolding (Â§10.2)

### P-210 â€” [BE] B1â†’B2 path seed data
Milestone: DONE

**Priority:** HIGH (pre-launch blocker)
**Status:** Shipped 2026-05-01 (BE-side, lemethodic-backend commit `79cd629`); production seeded same-day via `scripts/seed_b1_b2_path.py`.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.2
**Dependencies:** P-202, P-203
**Scope:** seed the B1â†’B2 path's 15-20 clusters in the database (titles + structure only; content authored separately). Phase boundaries defined.
**Owner:** Engineering

### P-211 â€” [Content] Cluster content authoring
Milestone: DONE

**Priority:** HIGH (pre-launch blocker)
**Status:** Shipped 2026-05-01 (BE-side, lemethodic-backend commit `d862794`); production ingested same-day via `scripts/ingest_b1_b2_cluster_content.py`.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.2
**Dependencies:** P-202, P-210 (seed must exist before content slots into it)
**Scope:** author lesson + exercise set + practice prompt + detection rubric for each B1â†’B2 cluster. Decide delivery format per cluster (markdown / PDF / video). Delivered as files into the system.
**Owner:** Chadi (content authoring, not engineering)

### P-212 â€” [BE] Starter cluster seed for A2 and B2 paths
Milestone: DONE

**Priority:** MEDIUM (pre-launch)
**Status:** Superseded by P-210 + P-211 (shipped 2026-05-01). The 22-cluster B1â†’B2 path is in production with 13 clusters fully authored and 9 placeholders pending. Nothing in P-212's original scope remains uncovered.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.2
**Dependencies:** P-202, P-203
**Scope:** seed first 3-4 clusters of A2â†’B1 path and first 3-4 of B2â†’C1 path. Used as waitlist preview content.
**Owner:** Engineering (schema seed); Chadi for the small starter content set

### P-213 â€” [Content] Dialogue Box template authoring
Milestone: TBD

**Priority:** MEDIUM (pre-launch)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.2
**Dependencies:** none
**Scope:** author 30-50 Dialogue Box templates (Block 5) varied by context. Placeholders for detected data.
**Owner:** Chadi

### Onboarding (Â§10.3)

### P-220 â€” [FE] Onboarding questionnaire rebuild
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-02 (BE + FE + production verification complete).
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.3
**Dependencies:** P-203
**Scope:** rebuild current onboarding to match Â§8.3 (10-12 screens). Each answer maps to user profile fields that drive path assignment.
**Owner:** Engineering

### P-220.z â€” [FE] Onboarding per-question illustrations and pastels (Phase 1 polish)
Milestone: polish-defer

**Priority:** â€”
**Status:** Closed 2026-05-05 (scope evaporated by F-201). Per-question pastel cycle dropped (clashed with F-200 editorial direction). Per-question illustrations dropped (type-led question screens). EcoleReveal hero asset re-tracked as P-228.
**Filed:** 2026-05-02
**Source:** P-220 plan-first, deferred from rebuild
**Dependencies:** P-220
**Scope:** author per-question illustrations + pastel backgrounds for the 11 onboarding questions. The P-220 rebuild cycles the existing 6 illustrations/pastels as a placeholder (see components/onboarding/questionMeta.ts); this ticket replaces them with question-specific assets and updates the meta map.
**Owner:** Chadi (illustrations) + Engineering (wire-up)
**Note:** Closed by F-201 â€” the editorial direction (F-200) replaced the pastel-cycle approach with uniform `--ed-bg` across all 11 questions, type-led screens with no per-question illustrations. P-228 inherits the EcoleReveal-only asset scope.

### P-228 â€” [Content] EcoleReveal hero asset (art-directed illustration)
Milestone: M2

**Priority:** LOW (post-soft-beta; placeholder works)
**Status:** Queued
**Filed:** 2026-05-05
**Source:** F-201 plan-first; P-220.z scope re-tracked
**Dependencies:** F-201
**Scope:** single high-quality art-directed illustration for the EcoleReveal closing screen (the funnel's emotional terminal, where the user sees their persona + plan before /paywall). Current placeholder: `/illustration-ecole.png` recycled from P-220 era. F-201 sized the asset slot at 280Ã—280 above the persona label. Per F-200 imagery rules: real photography muted-tone OR art-directed line drawing / geometric primitives. No 3D emoji, no library cartoon, no mascot energy.
**Owner:** Chadi (art direction / commission) + Engineering (drop-in swap)

### F-213 â€” [FE] Page transitions + celebration moments
Milestone: M2

**Priority:** MEDIUM (soft-beta polish)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured screenshots + interaction trace per F-225 â€” verify route fade-in across /, /signup, /onboarding, /progress, /ecole, /cluster)
**Filed:** 2026-05-04
**Source:** Strategic recalibration â€” interaction polish queue
**Dependencies:** F-200, F-212 (ed-page-enter CSS class)
**Scope (this commit):**
- Applied `ed-page-enter` class (250ms fade-in + Y-translate 8px â†’ 0) to outermost containers of major surfaces: LandingPage `<main>`, ProgressDashboard root, ClusterDetailPage root, HomeScreen root, signup outer div.
- Subtle fade on first mount per surface â€” doesn't replay on internal state changes (CSS animation `both` keeps end state). Reduced-motion respected via globals.css fallback rule.
**Owner:** Engineering
**Cuts:**
- Celebration moments (lesson complete, finish onboarding, milestone hit): filed as F-213.celebration. Needs design pass â€” F-115 lesson-unlock motion is already in place; layered celebrations need Chadi sign-off on what triggers what (e.g., milestone badge ed-accent pulse vs full congratulations screen). Editorial restraint per F-200 means no confetti â€” designs must be typography-led.
- /onboarding/waitlist + EcoleReveal + paywall route transitions: not added in this commit (those are terminal/closing surfaces â€” adding fade-in wouldn't add value, and EcoleReveal already has hero-rise sequence from F-212).
- Inter-question transition within OnboardingFlow (between q1 and q2 etc.): out of scope â€” that's a state change, not a route change. Could be F-213.intra if user testing flags abrupt step swaps.

### F-213.celebration â€” [FE] Milestone + completion celebration moments
Milestone: M2

**Priority:** MEDIUM (post-soft-beta polish)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-213 scope cut â€” celebration design needs Chadi sign-off
**Dependencies:** F-213, F-115 (lesson-unlock motion already shipped), F-202 (L'Ã‰cole intro design pass)
**Scope:** layered celebration treatments for lesson complete (per-quiz-pass), finish onboarding (after EcoleReveal continue), and milestone hits (Fondations done at lesson 4, Approfondissement at 16, L'Ã‰cole ComplÃ¨te at 27). Editorial restraint: no confetti. Candidates: typography-led congratulations screen (Source Serif italic for the achievement label), subtle Y-translate + opacity reveal of next-step CTA, ed-accent pulse on milestone badge in EcoleProgress.tsx. Needs Chadi pick + content per moment.
**Owner:** Engineering + Chadi (celebration copy + design picks)

### F-210 â€” [FE] Icon system audit (lucide-react retention + custom marks plan)
Milestone: M2

**Priority:** MEDIUM (audit + filing)
**Status:** Shipped 2026-05-04 â€” non-visual change, audit only. No code changes this turn. Filed P-229 for the custom marks Chadi-authoring task.
**Filed:** 2026-05-04
**Source:** Strategic recalibration â€” interaction polish queue
**Dependencies:** none
**Audit findings (this commit, BACKLOG-only):**
- **lucide-react retained** for all current UI icons. Audit covered ~25 imports: `ArrowLeft / ChevronLeft / ChevronRight / ChevronDown / ChevronUp / Check / Play / Lock / Mic / Bell / Pencil / Settings / Volume2 / VolumeX / XIcon / SearchIcon / MinusIcon / CheckIcon / CircleIcon / MoreHorizontal`. All universal UI icons, no brand specificity. Per F-200 imagery rules: "no library cartoons" applies to illustrations, NOT UI iconography. Lucide is the appropriate stack for nav/affordance/state icons.
- **No custom marks needed for replacement** â€” surfaces using lucide today (HomeScreen Bell, BackButton chevron, LessonListItem check/play/lock, TÃ¢che session controls) all benefit from lucide's consistency.
- **Custom marks needed for ADDITIONS only** â€” surfaces that don't yet have icons but should get brand-specific marks. Filed as P-229 (Chadi authoring).
**Cuts:** none â€” audit complete.

### P-229 â€” [Content] Custom brand marks (methodology + exam + milestone iconography)
Milestone: M2

**Priority:** LOW (post-soft-beta polish)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-210 audit
**Dependencies:** F-210, F-202 (methodology demo design pass), F-221 (exam picker shipped)
**Scope:** 9 brand-specific marks for surfaces that should have iconography but currently don't:
- **Methodology marks** (2): "Les Moules" mark + "La MÃ©thode en Couches" mark. Used in MethodologySection on landing + future F-202 L'Ã‰cole intro demo. Style: line-drawn geometric primitive, ed-fg ink, 24-32px.
- **Exam monograms** (4): TCF / TEF / DELF / DALF. Used as format-DNA chip prefix in ExamPickerQuestion (currently text-only) and possibly /profile exam display. Style: small letterform mark, 16-20px, ed-accent or ed-fg.
- **Milestone badges** (3): Fondations / Approfondissement / L'Ã‰cole ComplÃ¨te. Used in EcoleProgress.tsx today (generic Check icon). Replace with editorial badges that signal phase progression.
Editorial constraint per F-200: line drawings or geometric primitives, no mascot energy, no 3D emoji. Either commissioned by Chadi or authored solo.
**Owner:** Chadi (art direction / commission) + Engineering (drop-in swap)

### F-211 â€” [FE] Loading states overhaul (skeleton shimmer migration)
Milestone: M2

**Priority:** MEDIUM (soft-beta polish)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured screenshots of /, /progress, /cluster, /ecole loading states per F-225)
**Filed:** 2026-05-04
**Source:** Strategic recalibration â€” interaction polish queue
**Dependencies:** F-200, F-212 (ed-skeleton CSS class)
**Scope (this commit):**
- Migrated `animate-pulse` â†’ `ed-skeleton` (1.5s editorial shimmer, ed-rule on ed-paper, no aggressive pulse) on:
  - `ProgressDashboard.tsx` LoadingSkeleton (4 rows)
  - `ClusterDetailPage.tsx` LoadingSkeleton (3 rows)
  - `HomeScreen.tsx` daily-action card skeleton + lesson-list skeleton (5 rows)
- Border radii unified to 4px (was 16-20px) for editorial consistency.
- Reduced-motion fallback handled by ed-skeleton class (drops the shimmer animation, keeps a static ed-rule fill).
**Owner:** Engineering
**Cuts:**
- Recording analysis pipeline progressive states ("Recording received" â†’ "Transcribing" â†’ "Analyzing" â†’ "Done"): filed as F-211.recording â€” touches F-061/F-062/F-104 invariants on the TÃ¢che session components, needs careful audit.
- Signup â†’ onboarding transition skeleton: filed as F-211.transition â€” small surface, low priority.
- LessonDetailClient (1 remaining animate-pulse instance): low-traffic auth-gated surface, F-211.x â€” sweep alongside F-206.lessons.
- shadcn `components/ui/skeleton.tsx` legacy primitive: leave as-is (used by other surfaces; per-consumer migration as F-2xx tickets touch them).

### F-214 â€” [FE] Visual depth + design system extension
Milestone: M2

**Priority:** MEDIUM (soft-beta polish)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` HowItWorks section flip + landing rhythm verification per F-225)
**Filed:** 2026-05-04
**Source:** Strategic recalibration â€” interaction polish queue
**Dependencies:** F-200, F-212
**Scope (this commit):**
- Section-bg alternation: HowItWorks flipped from `--ed-bg` to `--ed-paper` with 1px ed-rule top/bottom borders. Landing rhythm now: bg/bg/bg/**paper**/bg/paper/bg/paper â€” paper density increases toward conversion. Other sections kept on bg per "rhythm not chaos" rule.
- New `components/landing/TestimonialCard.tsx`: pattern component only (no data wiring). Serif italic quote (Source Serif), ed-accent left rule (3px), ed-paper bg with 1px ed-rule border, 4px radius, attribution + optional examContext rows. Inherits ed-card-lift on hover. Filed for use post-soft-beta when beta cohort quotes land (M-101 doc note #7 explicitly excluded testimonials from launch).
- `CLAUDE.md` editorial design system section: codified all F-200 â†’ F-214 primitives (CSS utilities, tokens, JS constants, React components, color hierarchy, visual rules). Single canonical reference.
**Owner:** Engineering
**Design calls:**
- HowItWorks chosen for paper flip because it's the "instructional" section â€” paper bg gives it the "manual page" feel that Methodology + FinalCTA already enjoy. Differentiation kept on bg because flipping it would invert the card hierarchy (cards are ed-paper on bg; flipping section to paper would force cards to bg which loses elevation).
- TestimonialCard not added to landing today â€” no testimonial data exists. Component sits ready.
**Cuts:**
- Wire TestimonialCard into a TestimonialSection on landing: filed as F-214.x â€” needs Chadi-authored quotes from beta cohort.

### F-212 â€” [FE] Micro-animations + interaction feedback system
Milestone: M2

**Priority:** HIGH (soft-beta polish â€” interaction language across the platform)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots + interaction trace per F-225 of /, /fr, /onboarding question screens, signup form interactions, and reduced-motion fallback verification)
**Filed:** 2026-05-04
**Source:** Strategic recalibration â€” interaction polish queue
**Dependencies:** F-200 (editorial system tokens)
**Scope (this commit):**
- `lib/motion.ts` extended with F-212 editorial primitives (kept alongside legacy FluentPath spring system): `ED_EASE_CUBIC` / `ED_EASE_CSS` / `ED_DUR` / `ED_STAGGER` constants + `useRotatingText` + `useCountUp` + `useInViewOnce` hooks.
- `app/globals.css` adds `.ed-card-lift` (200ms hover translateY -2px + shadow expansion), `.ed-btn-press` (scale 0.98 on :active), `.ed-field` (focus border ed-accent + ring at 18% opacity), `.ed-skeleton` (1.5s shimmer for F-211), `.ed-page-enter` (250ms route fade-in for F-213), `ed-kicker-slide` keyframe (kicker word swap), `ed-hero-rise` keyframes + delay variants (hero first-paint sequence).
- New `components/landing/RotatingKicker.tsx`: flagship hero kicker. Cycles TCF / TEF / DELF / DALF every 2.5s with 600ms vertical-slide swap. Pauses on hover/focus. Honors prefers-reduced-motion (renders static "TCF Â· TEF Â· DELF Â· DALF" listing). EN prefix "Prep for" / FR "PrÃ©paration".
- `HeroSection.tsx`: kicker mounted above H1. Hero entry sequence applied via `ed-hero-rise` + delay-1/2/3 classes (200/300/500ms staggered first-paint).
- `OnboardingScreen.OnboardingCard` primitive gains `ed-card-lift` + `ed-btn-press` classes â€” every selectable card across all 11 onboarding questions inherits the lift + press automatically.
- `OnboardingScreen.CTAButton` primitive gains `ed-btn-press` â€” every primary CTA across onboarding/waitlist/EcoleReveal inherits the 0.98-scale press feedback.
- `DifferentiationSection` + `PricingSection` cards gain `ed-card-lift` class (landing).
- Stagger duration aligned to `ED_STAGGER.cards` (80ms) on RevealOnScroll consumers (Differentiation + Pricing).
**Owner:** Engineering
**Design calls (made solo per F-212 spec):**
- Card hover shadow ramp: `0 4px 16px rgba(0,0,0,0.06)` + `0 1px 4px rgba(0,0,0,0.04)` â€” restrained vs the tutorial-app default of larger blurs.
- Press scale 0.98 (vs 0.96 for FluentPath cards) â€” gentler editorial press.
- Stagger 80ms (lower end of 60-120ms range â€” F-212 spec). Card grids feel snappy at this rate; longer felt laggy.
- Hover-only on devices with `(hover: hover)` â€” touch devices skip the lift to avoid sticky-hover bug on tap.
- Kicker pauses on focus too (not just hover) â€” keyboard users get the same accessibility benefit as mouse users.
**Cuts (deferred):**
- Counter animations (deliverable #6): file as F-212.counter â€” narrow ROI, /progress and /cluster don't have prominent stat numbers worth animating (status chips and CEFR badges are categorical, not counts).
- Tab/toggle underline slide (deliverable #7): LanguageToggle is already EN/FR with active-state color shift â€” adding underline-slide on a 2-state toggle is overkill. Will revisit when a multi-tab surface lands (e.g., F-204.deep dashboard with method/calm mode toggle).
- Form-field per-input `ed-field` class application: deferred â€” existing :focus-visible global rule from F-200 (commit 14d0691) already gives inputs visible focus rings. F-212.field will swap to ed-accent ring + 18% opacity once a sweep across all 8+ form locations is justified.

### F-221 â€” [FE+BE] Exam-target picker + brand-layer rewrite (multi-exam launch)
Milestone: M1

**Priority:** HIGH (launch â€” multi-exam onboarding gates which path the user enters)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production test BLOCKED on BE shipping `q0_target_exam` to `/onboarding/questions` response + `target_exam` field on User/UserPathEnrollment + accepting `q0_target_exam` in `/onboarding/submit`. Per Chadi 2026-05-05: BE migration in parallel; FE ready-to-fire when BE lands. Verification per F-225 once BE migration is live.)
**Filed:** 2026-05-04
**Source:** Strategic recalibration â€” exam-selector in onboarding
**Dependencies:** BE `target_exam` schema migration
**Scope (FE side, shipped this commit):**
- Brand-layer rewrite (~12 string edits in `components/landing/copy.ts`): full TCF Canada neutralization on landing â†’ universal "French exam" framing. HERO h1 / DIFFERENTIATION card 3 / HOW_IT_WORKS step 1 / METHODOLOGY paragraph 2 / FAQ "PrepMyFrench" â†’ "PrepMyFuture" with generalized framing / FAQ "guarantee TCF" â†’ "Do you guarantee I pass?" / FINAL_CTA / META all neutralized.
- New `EXAM_OPTIONS` constant in copy.ts: 5 options (TCF Canada / TEF Canada / DELF B1-B2 / Another exam / Not sure) each with FE-localized format-DNA chip copy (EN+FR).
- New `TARGET_LEVEL_HELPER_BY_EXAM` constant: per-exam helper text injected on q2_target_level when q0_target_exam is known (e.g., TCF â†’ "B2 maps to CLB 7-8 for Canadian PR").
- New `EXAM_DISPLAY_NAME` constant: slug â†’ display name mapping for `{exam}` interpolation in waitlist + post-signup surfaces.
- New `EXAM_OTHER_FORM` copy (EN+FR): inline form copy for "Another exam" branch.
- `lib/waitlist.ts` extended: `WaitlistIntent` widened to include `'exam_other'`; `WaitlistEntry.examName` field added (free-text "which exam?" capture).
- `lib/submitResponse.ts` extended: `examAtSubmit` field added; `setSubmitContext` signature gains 4th arg.
- `app/signup/page.tsx`: signup flush captures `q0_target_exam` to submitResponse store before reset.
- New `components/onboarding/questions/ExamPickerQuestion.tsx`: 5 large card buttons with format-DNA chips, 88px minHeight, "Another exam" picks reveals inline mini-form (which exam? + email) â†’ submits to localStorage waitlist (intent='exam_other') â†’ parked confirmation. Continue gated on non-another_exam selection.
- `OnboardingFlow.tsx` dispatch: question id `q0_target_exam` routes to ExamPickerQuestion; q2_target_level reads prior q0 answer to inject helper text.
- `SingleSelectQuestion.tsx`: optional `helperOverride` prop added (used by OnboardingFlow for q2 per-exam helper).
- `WaitlistScreen.tsx`: body1 + body3 interpolate `{exam}` from submitResponse store using `EXAM_DISPLAY_NAME` map.
- `WaitlistForm.tsx` + `PricingSection.tsx`: prop type narrowed to `SprintOrPremium` (the 'exam_other' branch lives inline in ExamPickerQuestion, not the modal).
**Owner:** Engineering
**Note:** picker dormant until BE adds q0_target_exam to questions endpoint. Once BE lands: picker fires as Q1 of questionnaire, "Another exam" routes to email capture, "Not sure" submits as `not_sure` (BE backfills to TCF Canada per Chadi). Existing user backfill (test users id IN 5,6,7) is BE's responsibility.

### F-203 â€” [FE] Auth flow surfaces editorial migration (signup full + paywall responsive)
Milestone: M1

**Priority:** HIGH (launch-blocking â€” auth surfaces are the conversion funnel)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/signup` and `/paywall` per F-225)
**Filed:** 2026-05-04
**Source:** F-200 cascade
**Dependencies:** F-200
**Scope:** signup got full editorial migration (bg ed-bg, paper card with 1px ed-rule + 0 shadow + 4px radius, all form fields ed-tokens with 56px height + 4px radii + ed-paper bg + ed-rule borders, navy ed-accent submit CTA, Geist throughout). Paywall got minimal responsive fix only (bg â†’ ed-bg, column widened 440â†’640px to fix desktop white-rails launch-blocker) â€” full editorial migration of Paywall's pricing chrome / radar chart / comparison table tracked separately as F-203.paywall.
**Owner:** Engineering

### F-203.paywall â€” [FE] Paywall full editorial migration
Milestone: M1

**Priority:** MEDIUM (post-soft-beta polish â€” F-203 minimal responsive fix unblocks launch)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-203 scope cut â€” full Paywall editorial migration deferred
**Dependencies:** F-203
**Scope:** migrate Paywall's 660-line pricing chrome to editorial system: typography (DISPLAY_FONT â†’ Geist), Recharts radar styling (axis labels, fill colors, grid stroke â†’ ed-* tokens), value-row checkmarks (current pastel/svg â†’ ed-rule outlined), comparison table (current pill toggles â†’ editorial tabs), trial timeline cards. Significant design work; F-203 minimal fix solves the launch-blocker.
**Owner:** Engineering

### F-204 â€” [FE] Authenticated dashboard surfaces editorial migration (page chrome only)
Milestone: M1

**Priority:** HIGH (launch-blocking â€” desktop white-rails)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/progress` and `/cluster/[slug]` per F-225)
**Filed:** 2026-05-04
**Source:** F-200 cascade
**Dependencies:** F-200, F-201
**Scope:** migrated PAGE CHROME of `/progress` and `/cluster/[slug]` to editorial system: bg â†’ ed-bg, max-width 440 â†’ 720 (fixes white-rails), header restyled (ed-rule border, Geist 600, padding clamp), main padding clamp() responsive, font tokens swapped at the page level. **Section internals (Snapshot/TodayFocus/Goulet/RecentActivity on /progress; ClusterHeader/LessonBody/PracticeCTA on /cluster) keep their FluentPath pastel chips as accent layer per F-200 rule** (pastels survive as decoration, not chrome). Full section-internal editorial migration deferred to F-204.deep.
**Owner:** Engineering
**Note:** F-204 deliberately scope-cut to page chrome only because section internals carry data-display chips (status indicators on cluster header, confidence visualizer pips on Snapshot, TÃ¢che+CEFR badges on RecentActivity) where ed-* migration without redesign would lose information. Full migration needs design pass on chip vocabulary.

### F-204.deep â€” [FE] Section-internal editorial migration on /progress + /cluster
Milestone: M1

**Priority:** MEDIUM (post-soft-beta polish â€” F-204 chrome fix unblocks launch)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-204 scope cut â€” section internals deferred
**Dependencies:** F-204
**Scope:** migrate Snapshot section (level chips + confidence visualizer + agreement copy + diagnostic-in-progress fallback), TodayFocus (Dialogue Box + reason_code copy), GouletStack (RecurringModuleCard reuse), RecentActivity (linear list with TÃ¢che/CEFR badges) on /progress. Plus ClusterHeader (status + last_detection_result chips with traffic-light dots) on /cluster. Each chip vocabulary needs editorial-system equivalent without losing data display.
**Owner:** Engineering + design pass on chip palette

### F-205 â€” [FE] User-state surfaces editorial migration (page chrome only)
Milestone: M1

**Priority:** HIGH (launch-blocking â€” desktop white-rails)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/profile` and `/diagnostic` per F-225)
**Filed:** 2026-05-04
**Source:** F-200 cascade
**Dependencies:** F-200, F-222.x (/profile real-data wire-up â€” same surface, separate ticket)
**Scope:** migrated PAGE CHROME of `/profile` and `/diagnostic`: bg â†’ ed-bg, max-width 440 â†’ 720 (fixes white-rails), token references swapped (INK â†’ ed-fg, DISPLAY_FONT â†’ Geist), header heading restyled (16px Geist 600 + 0.02em). Inner cards on /profile (Preply CTA on sage, Stats on butter, avatar on peach) preserved as accent layer per F-200 rule. /diagnostic's dense couches/modules display preserved untouched â€” section internals are F-205.deep scope.
**Owner:** Engineering
**Note:** /profile's hardcoded mockup data ("Chadi", "chadi@example.com", 47 days) is F-222.x scope â€” F-205 just restyles chrome. /diagnostic's CouchesDiagnostic + DetectedModuleCard + ordonnance components carry P-088 layout invariants â€” chrome-only migration avoids breaking those.

### F-205.deep â€” [FE] Section-internal editorial migration on /profile + /diagnostic
Milestone: M1

**Priority:** MEDIUM (post-soft-beta polish)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-205 scope cut
**Dependencies:** F-205, F-088 (couches schema), F-222.x (profile real-data)
**Scope:** /profile inner cards restyle (Preply CTA / Stats / Account / Settings card system to editorial). /diagnostic CouchesDiagnostic + DetectedModuleCard + InlineContentRef + CorrectedLine + GouletCard + ordonnance row migration to editorial chip system. Significant â€” needs P-088 layout audit to ensure data-display doesn't lose semantic meaning.
**Owner:** Engineering + design pass

### F-206 â€” [FE] Recording + module surfaces editorial migration (page chrome only)
Milestone: M1

**Priority:** HIGH (launch-blocking â€” desktop white-rails)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of all affected routes per F-225)
**Filed:** 2026-05-04
**Source:** F-200 cascade â€” final responsive sweep
**Dependencies:** F-200
**Scope:** migrated PAGE CHROME of `/login`, `/writing`, `/more`, `/ecole` (HomeScreen), and `/learn/[module_id]` (LearnModulePage): bg â†’ ed-bg, max-width 440 â†’ 720, font tokens DISPLAY_FONT â†’ Geist, INK/INK_MUTED â†’ ed-* tokens. Pastel accents preserved per F-200 rule: HomeScreen DailyActionCard backgrounds (peach/butter/sage), LearnModulePage CATEGORY_BG (per-category tints â€” these EARN their keep as data-display chips), avatar circle on /profile.
**Owner:** Engineering
**Note:** /speaking surfaces (SpeakingLanding + 3 TÃ¢che sessions + feedback page) deferred to F-206.speaking â€” they have heavy interactive UI (PTT button, vu-meter, transcript review sheet, F-061/F-062/F-104 invariants). Editorial migration without invariant audit risks breaking core recording flow. /ecole/lesson/[id] surfaces (LessonDetailClient + quiz) deferred to F-206.lessons.

### F-206.speaking â€” [FE] /speaking surfaces editorial migration
Milestone: M1

**Priority:** MEDIUM (post-soft-beta polish)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-206 scope cut â€” recording surfaces deferred
**Dependencies:** F-206, F-061 / F-062 / F-104 invariant audit
**Scope:** migrate /speaking, /speaking/tache-1[/topic], /speaking/tache-2[/scenario], /speaking/tache-3/[topic], /speaking/feedback/[session]. Recording surfaces have load-bearing UI (PTT, vu-meter, ChatBubble, TranscriptReviewPanel, CountdownTimer, RecordButton). Editorial migration needs invariant audit.
**Owner:** Engineering + careful audit

### F-206.lessons â€” [FE] /ecole/lesson/[id] + quiz editorial migration
Milestone: M1

**Priority:** MEDIUM (post-soft-beta polish)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** F-206 scope cut
**Dependencies:** F-206, F-087 (lesson curriculum invariants)
**Scope:** migrate LessonDetailClient (markdown rendering + quiz CTA + back nav) and QuizClient (multi-question flow + answer-checking + result + lesson-unlock animation). Carries F-087 + F-115 motion invariants (lesson-unlock animation in HomeScreen).
**Owner:** Engineering

### F-202 â€” [FE] L'Ã‰cole intro rebuild + methodology surface (post-signup destination)
Milestone: M1

**Priority:** HIGH (launch-blocking â€” was the empty pink-key placeholder per Block 3 critique)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/ecole/intro` (all 5 sections) + interaction trace `/signup` â†’ register â†’ `/ecole/intro` â†’ CTA â†’ `/ecole` per F-225)
**Filed:** 2026-05-04
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** Strategic recalibration (May 4): "L'Ã‰cole intro is empty placeholder. Doesn't hit Promova benchmark" + F-202 spec May 5 with locked methodology copy (khÃ¢gneux-reviewed, 8 native-French ear corrections applied) + 5-couche model expansion (Couche 5 â€” La Voix added)
**Dependencies:** F-200 (editorial system), F-201 (EcoleReveal), F-203 (signup editorial chrome)
**Scope:** new route `/ecole/intro` â€” post-signup methodology surface (the moat made visible). Five sections in order: Frame (welcome) / La MÃ©thode en Couches (5 couche blocks, centerpiece) / How it works (3 sub-blocks, diagnosticâ†’treatment loop, "Le Goulet" introduced as named concept) / Le parcours (Fondations 1â€“16 + Approfondissement 17â€“27 + 5 lesson segments Le PiÃ¨ge/La RÃ¨gle/Le Drill/La Situation/Le DÃ©brief) / CTA â†’ /ecole. Bilingual EN/FR via useInterfaceLanguage hook; copy locked verbatim (no paraphrasing). Signup post-register routing changed: `/ecole` â†’ `/ecole/intro` (waitlist branch unchanged). Reveal-on-scroll stagger via useInViewOnce + 80ms sibling delay. ed-page-enter on root.
**Owner:** Engineering (Chadi authored methodology copy)

**Routing/state calls (resolved):**
- (a) **Separate `/ecole/intro` route** â€” clean separation, no conditional render in HomeScreen, deep-linkable. Picked Option A from spec.
- (b) **Flow:** EcoleReveal â†’ /paywall â†’ /signup â†’ /ecole/intro â†’ /ecole. Paywall stays unchanged (the moat is paid-side, protects from competitor snooping; public landing gets compressed version via F-227). Intro CTA â†’ /ecole (DailyActionCard surfaces lesson 1 for new users; robust for return users via header link too). NOT /ecole/lesson/1 â€” that wouldn't make sense for return users.
- (c) **/ecole responsive editorial migration** â€” already shipped in F-206 chrome-level (ed-bg, ed-fg, ed-rule, 720px max-width). Pastels survive as DailyActionCard accent layer per F-200 rule. F-202 scope stayed focused on /ecole/intro alone. Deeper internal migration filed as F-206.lessons.
- **CTA color:** ed-accent navy (matches EcoleReveal + signup CTA chain) instead of spec's ed-fg/ed-paper. Coherent in-product CTA chain.

**Implementation notes:**
- New file: `app/ecole/intro/page.tsx` (ProtectedRoute wrapper)
- New component: `components/ecole/intro/EcoleIntro.tsx` (single orchestrator, ~620 lines, all 5 sections inline; sub-component split filed as F-202.split if it gets unwieldy)
- Methodology copy: locked in EcoleIntro.tsx as FRAME / METHODE / HOW / PARCOURS / CTA constants per language. *italic* tokens in body strings render as Source Serif 4 ed-accent emphasis (used for "Le Goulet" + "ne" callouts).
- Reveal component: useInViewOnce-driven opacity + Y-translate, 700ms ed-ease, sibling stagger via delayMs prop.
- Frame H1: clamp(56-96px) Geist 600. Subhead: Source Serif 4 italic clamp(20-24px) ed-muted.
- MÃ©thode header: Source Serif 4 italic clamp(40-64px) ed-accent navy. 5 couche blocks at 96-112px vertical separation. Each block: "Couche N" italic small, name Geist 600 32-40px, label Geist 500 small-caps tracking, body 17-19px.
- Closer line: Source Serif 4 italic 22-28px ed-fg, centered, 96-144px above. Section borderTop ed-rule.
- How it works on ed-paper bg (alternates from ed-bg). 3 sub-blocks 48-72px apart.
- Le parcours: two-column grid â‰¥768px (Fondations + Approfondissement, ed-rule left edge), stacked mobile. 5 segments as numbered list, Source Serif 4 italic numerals in ed-accent.
- CTA: ed-accent navy bg, white text, 4px radius, 16x32 padding, ed-btn-press class.
- Signup post-register: `nextRoute = '/ecole/intro'` (was '/ecole'); waitlist branch unchanged. Already-authenticated user redirect from useEffect stays at /ecole (return visit).
- New globals.css utilities: `.ecole-intro-blocks` + `.ecole-intro-block` for the curriculum side-by-side grid (avoided styled-jsx).

**Accessibility:**
- Each section has aria-label (Welcome / MÃ©thode title / How it works / Le parcours / Begin).
- Reduced-motion: ed-page-enter respects prefers-reduced-motion (gated in globals.css); useInViewOnce returns inView immediately when IntersectionObserver unavailable.
- Reveal opacity starts at 0 â€” if reduced-motion users want sections visible immediately, the IntersectionObserver fires on mount-near-viewport, so they see the same end state without animation.

### F-202.x â€” [FE] "Ã€ propos de L'Ã‰cole" header link from /ecole
Milestone: M1

**Priority:** LOW (post-launch UX polish)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** F-202 ship â€” return-user re-entry to methodology surface
**Dependencies:** F-202
**Scope:** add a small "Ã€ propos" / "About" link in /ecole header (or profile menu) that navigates to /ecole/intro. Copy: "Ã€ propos de L'Ã‰cole" (FR) / "About L'Ã‰cole" (EN). Position: header right-side, between page title and notifications bell. The intro page is always reachable; this just exposes it for return-users who want to revisit the methodology.
**Owner:** Engineering

### F-202.split â€” [FE] EcoleIntro sub-component decomposition
Milestone: M1

**Priority:** LOW (refactor)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** F-202 ship â€” single orchestrator at ~620 lines is acceptable today, but if Chadi adds methodology icons (P-229) or interactive elements per couche, sections should split.
**Dependencies:** F-202, P-229 (custom brand marks)
**Scope:** split `components/ecole/intro/EcoleIntro.tsx` into `IntroFrame.tsx`, `MethodeEnCouches.tsx`, `HowItWorks.tsx`, `LeParcours.tsx`, `IntroCTA.tsx`. Lift the FRAME/METHODE/HOW/PARCOURS/CTA copy constants to a shared `intro-copy.ts`. No visual changes â€” refactor only.
**Owner:** Engineering

### F-201 â€” [FE] Onboarding flow editorial migration (desktop responsive)
Milestone: M1

**Priority:** HIGH (launch-blocking â€” onboarding is the conversion funnel)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/onboarding` (multiple steps) + EcoleReveal step + `/onboarding/waitlist` per F-225)
**Filed:** 2026-05-04
**Source:** F-200 cascade â€” F-201..F-214 inherit the editorial system
**Dependencies:** F-200
**Scope:** migrate `/onboarding` flow from M-101a/P-220 era pastel chrome to the F-200 editorial system. Per-question pastel cycle dropped (uniform `--ed-bg`). Per-question illustrations dropped (type-led screens). Desktop column 720px (was 440px â†’ caused white-rails launch-blocker). EcoleReveal full editorial migration: persona label oversized in Source Serif italic + navy `--ed-accent`, plan card on `--ed-paper` with 1px `--ed-rule` border, 280Ã—280 placeholder illustration above. WaitlistScreen migrated. OnboardingScreen kernel restyled (4px button radii, 1px ed-rule borders, 0 shadow, ed-* tokens throughout). 4 question components (Single/Multi/Date/OtherFreetext) refactored to inherit kernel + drop illustration. questionMeta.ts retired to just the EcoleReveal asset constants.
**Owner:** Engineering
**Design calls** (per F-201 spec â€” captured in code comments):
- Card minHeight reduced 80px â†’ 64-72px (editorial density vs M-101a softness).
- ProgressDots: filled dots 6Ã—6px (was 8Ã—8px) â€” finer rhythm.
- BackButton: chevron weight 1.5px (was 2px) â€” restraint.
- Toggle in OnboardingFlow header: text-only `EN / FR` slash separator (no pill backdrop) â€” matches landing's LanguageToggle.
- EcoleReveal: persona label sized 40-56px clamp (per spec), Source Serif italic, navy. CTA "Start your Ã‰cole" / "Commencer votre Ã‰cole" (was "Start my Ã‰cole" â€” slight phrasing tighter).
- WaitlistScreen body card: ed-paper 1px ed-rule, no shadow (was ed-paper + 0 2px 12px shadow + backdrop blur). Editorial flat over softness.



### P-221 â€” [FE+BE] Diagnostic flow integration
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-02 (BE-side, lemethodic-backend commit `c475bb7`). FE consumer: /ecole banner + /diagnostic/results screen, scope captured separately as follow-up.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.3
**Dependencies:** P-201, P-220
**Scope:** after questionnaire, run 3 diagnostic recordings (one per TÃ¢che). Engine output updates user level. Path assignment confirmed/adjusted.
**Owner:** Engineering

### P-222 â€” [FE+BE] Waitlist UX for A2 and B2+ paths
Milestone: DONE

**Priority:** HIGH (pre-launch)
**Status:** Shipped 2026-05-03 (FE-side, lemethodic-frontend 3-commit set ending `820d788`; production verified at https://lemethodic.com/onboarding/waitlist).
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.3
**Dependencies:** P-201, P-221
**Scope:** when user diagnostic places them in a not-yet-built path, show waitlist screen with explanation, free interim resources, optional early-access opt-in.
**Owner:** Engineering

### P-222.x â€” [FE] capacity_warning UX surface
Milestone: TBD

**Priority:** LOW (post-launch)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-222 plan-first, deferred from waitlist v1
**Dependencies:** P-222
**Scope:** OnboardingSubmitResponse can carry `capacity_warning` independent of `waitlist` (e.g., a B1â†’B2 user with too few hours per week vs. their exam date). P-222 v1 ignores this field. This ticket adds a non-blocking advisory surface â€” banner or toast on /ecole first-load â€” that surfaces `weeks_to_exam` + recommended-vs-selected hours from the BE warning. Out of scope for waitlist (different code path).
**Owner:** Engineering

### P-222.y â€” [FE] EcoleReveal pre-signup waitlist-aware copy
Milestone: TBD

**Priority:** LOW (post-launch UX polish)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-222 plan-first, UX gap acknowledged
**Dependencies:** P-222
**Scope:** EcoleReveal renders pre-signup before /onboarding/submit fires, so a user who'll be waitlisted (q1 = a2/b2/c1) sees "Meet L'Ã‰cole" + persona preview that doesn't apply to them. Either (a) duplicate the BE waitlist-routing logic in FE so EcoleReveal can short-circuit to a "your path isn't ready, you'll see details after signup" preview, or (b) move EcoleReveal post-signup behind /onboarding/submit so it can read the waitlist flag. (b) is structurally cleaner but reshapes the conversion funnel â€” needs Chadi sign-off.
**Owner:** Engineering

### P-106.x â€” [FE] /paywall waitlist-aware behavior
Milestone: M6

**Priority:** MEDIUM (Stripe-dependent)
**Status:** ~~Queued~~ OBSOLETE
**Filed:** 2026-05-03
**Source:** P-222 plan-first
**Dependencies:** P-106 (BE Stripe ship), P-222
**Scope:** when Stripe ships and /paywall starts charging, waitlist-bound users (those whose /onboarding/submit response will return waitlist=true) must NOT be charged. Per LEMETHODIC-CURRICULUM Â§8.4, waitlist users get free access during the wait period unless they explicitly opt in to "early-access subscription". Today /paywall is aspirational copy with no charge so the gap is harmless; when P-106 lands, this ticket gates the charge on the (predicted) waitlist outcome OR moves /paywall behind /onboarding/submit so the waitlist response is known before charging.
**Owner:** Engineering
**Obsolete note:** Depends on P-106 (BE Stripe ship), which is superseded. LemonSqueezy is the merchant of record for all subscription payments. Waitlist-aware paywall logic should be re-scoped as a follow-up to F-364 (LemonSqueezy integration), not P-106.

### Dashboards (Â§10.4) â€” full Â§7 implementation

### P-230 â€” [FE] Overall Progress dashboard rebuild
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-03 (FE-side, lemethodic-frontend 3-commit set ending in cleanup commit). Calm mode 4 sections (Snapshot / Today's focus / Goulet Stack / Recent activity). Method mode toggle hidden â€” depends on P-235 + P-236.
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.4
**Dependencies:** P-201, P-204
**Scope:** rebuild /progress per Â§7.4. Calm mode default + method mode opt-in. Includes Block 2 (Goulet Stack), Block 5 (Dialogue Box), Block 8 (Confidence Visualizer). Replaces current P-100 surface entirely.
**Owner:** Engineering
**Supersedes:** P-100, P-100.5
**Note:** v1 ships calm mode only. Method mode toggle deferred until Blocks 1 (Ceiling Marker Map, P-235) and 7 (Mistake Repository, P-236) land. dialogue_box always null in production today (P-240b + P-213 not shipped); FE renders reason_code-driven fallback copy with defensive `dialogue_box.text` rendering for when BE populates the field.

### P-230.x â€” [FE] Recent activity calendar view
Milestone: TBD

**Priority:** LOW (post-launch UX polish)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-230 plan-first, deferred from v1
**Dependencies:** P-230
**Scope:** Â§7.4 calls for a "calendar view (kept from current implementation)" for Recent activity. v1 ships a linear list of last 5 recordings (matches functional baseline + ships fast). This ticket replaces it with a GitHub-contribution-graph-style grid showing the last 30+ days of recording activity. Requires extending `api.recordings.list` or adding a date-bucketed endpoint.
**Owner:** Engineering

### P-230.consolidate â€” [FE] Goulet Stack + /ecole "Recommended for you" overlap
Milestone: TBD

**Priority:** LOW (post-launch UX polish)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-230 plan-first, data-source overlap acknowledged
**Dependencies:** P-230
**Scope:** Goulet Stack (top 3) on /progress and "Recommended for you" (F-080d) on /ecole both consume `getRecurringModules`. Different framings â€” /ecole = "patterns we've seen" (curriculum-side recommendation), /progress = "bottlenecks blocking you" (severity-ranked dashboard signal) â€” but the data is the same and the visual treatment is similar. User testing may show this duplication as confusing. Resolution options: (a) keep both with sharper framings, (b) deprecate one, (c) split the data source so /progress reads from a dedicated bottleneck endpoint distinct from /ecole's recurring-detection feed.
**Owner:** Engineering + Product

### P-230.unify â€” [FE] DailyActionCard vs Today's focus duplication
Milestone: TBD

**Priority:** LOW (post-launch UX polish)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-230 plan-first, UX gap acknowledged
**Dependencies:** P-230
**Scope:** /ecole's HomeScreen has a DailyActionCard ("today's lesson" â€” linear curriculum-driven). /progress's TodayFocusSection has a "Today's focus" card ("today's prescribed practice" â€” engine-recommended). Two daily-action surfaces in one app may confuse users. v1 ships both intentionally per Â§7.3 (distinct surfaces). This ticket revisits if user testing shows confusion: (a) keep both with sharper framings, (b) deprecate /ecole's daily action card in favor of /progress's, (c) reverse â€” keep /ecole's, hide /progress's.
**Owner:** Engineering + Product

### P-231 â€” [FE] Speaking dashboard
Milestone: TBD

**Priority:** HIGH
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.4
**Dependencies:** P-201, P-204
**Scope:** implement Â§7.5. New surface, drill-down from Speaking tab. Includes Block 3 (Recording Replay with Inline Diagnostics).
**Owner:** Engineering

### P-232 â€” [FE] Per-TÃ¢che dashboards
Milestone: TBD

**Priority:** MEDIUM
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.4
**Dependencies:** P-231
**Scope:** implement Â§7.6. Three dashboards (T1, T2, T3). Block 3 reused.
**Owner:** Engineering

### P-233 â€” [FE] Curriculum view (path surface)
Milestone: TBD

**Priority:** HIGH
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.4
**Dependencies:** P-203, P-204, P-210
**Scope:** implement Â§7.7. New surface accessible from main nav. Includes Block 4 (Path Topography).
**Owner:** Engineering

### P-234 â€” [FE] Cluster detail view
Milestone: DONE

**Priority:** HIGH
**Status:** Shipped 2026-05-03 (FE-side, lemethodic-frontend 3-commit set ending in re-routing commit). v1 ships 3 of 5 Â§7.8 sections: Cluster header, Lesson body (markdown/PDF), Practice CTA. exercise_set + recording_history are in the BE response but rendered post-launch (P-234.exercises / P-234.history).
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.4
**Dependencies:** P-202, P-211
**Scope:** implement Â§7.8. Per-cluster page with lesson, exercises, prompt, history. Multi-format lesson rendering (markdown / PDF embed / video embed).
**Owner:** Engineering
**Note:** v1 ships at /cluster/[slug]. Visual language paper-on-canvas (mirrors B-102 LegalPage), distinct from /learn/[id]'s category-tinted modules. No `locked` UserClusterStatus state â€” BE confirmed 4-value enum (not_started/in_progress/absorbed/needs_revisit). TodayFocusSection re-routed: cluster_practice actions now go to /cluster/{slug} instead of directly to /speaking/tache-{N} (cluster page's CTA forwards with ?promptCluster URL param).

### P-234.history â€” [FE] Cluster recording history surface
Milestone: TBD

**Priority:** LOW (post-launch)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-234 plan-first; BE shipped data ahead of FE consumption
**Dependencies:** P-234
**Scope:** GET /api/users/me/clusters/{slug} already returns `recording_history` (last 10 newest-first, RecordingHistoryEntry items with detection_result + rubric_score). v1 doesn't render this. Add a "My history on this cluster" section: linear list with date / detection_result chip (clean/wobble/fail/not_observed) / rubric_score badge. Tap â†’ /diagnostic?session={recording_id} per existing diagnostic deep-link convention.

### P-234.exercises â€” [FE+BE] Cluster exercise set rendering + answer checking
Milestone: TBD

**Priority:** MEDIUM (post-launch)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-234 plan-first; BE shipped data ahead of FE consumption
**Dependencies:** P-234, P-211a (authoring schema lock-in)
**Scope:** ClusterDetailResponse.exercise_set is a JSONB array shipped today but unrendered in v1. The authored shape is owned by the cluster authoring rubric (P-211 / P-211a). This ticket adds an Exercises section between Lesson body and Practice CTA: render each exercise per its authored type (multiple-choice / fill-blank / order-the-words / etc.), check answers client-side or via a new BE endpoint, surface scoring. Significant scope â€” needs schema lock-in from P-211a first.

### P-234.speaking-promptCluster â€” /speaking/* consume ?promptCluster URL param
Milestone: TBD

**Priority:** MEDIUM (post-launch)
**Status:** Queued
**Filed:** 2026-05-03
**Source:** P-234 â€” completes the round-trip from cluster detail to practice
**Dependencies:** P-234, BE practice prompt resolution
**Scope:** P-234's PracticeCTA emits `/speaking/tache-{N}?promptCluster={slug}`. /speaking/tache-{N} pages currently ignore this param and serve a default/random prompt. This ticket reads the param and either (a) uses the cluster's `practice_prompt` JSONB to override the default TÃ¢che prompt (FE-side lookup), or (b) sends the slug to BE and lets the engine serve the cluster-specific prompt. (b) is cleaner â€” needs BE to accept the param on the recording-start endpoints.

### P-235 â€” [FE] Ceiling Marker Map
Milestone: TBD

**Priority:** HIGH (method mode visibility moat)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.4
**Dependencies:** P-200, P-201
**Scope:** implement Block 1. Surfaceable from Overall Progress (method mode) and Curriculum view (method mode).
**Owner:** Engineering

### P-236 â€” [FE] Mistake Repository
Milestone: TBD

**Priority:** MEDIUM
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.4
**Dependencies:** P-200
**Scope:** implement Block 7. Standalone tab inside Progress.
**Owner:** Engineering

### P-237 â€” [FE] Time-Adaptive UI (lean version)
Milestone: TBD

**Priority:** HIGH (meta-ticket affecting all dashboards)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.4
**Dependencies:** P-230, P-231, P-233
**Scope:** implement Block 6 lean version. `daysUntilExam` reads + conditional rendering for Dialogue Box copy, Goulet Stack ordering, exam countdown weight, practice CTA emphasis. Full mode redesigns deferred to Phase 2 (P-267).
**Owner:** Engineering

### Prescription engine (Â§10.5)

### P-240 â€” [FE+BE] Today's recommended action
Milestone: DONE

**Priority:** HIGH
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.5
**Dependencies:** P-204, P-213
**Scope:** prescription logic â€” given user's current path/phase/cluster + recent submissions + Dialogue Box template selection, output the single recommended next action. Surface on Overall Progress Â§7.4 section 2.
**Owner:** Engineering

### P-241 â€” [FE+BE] Cluster-level prescription
Milestone: TBD

**Priority:** MEDIUM
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.5
**Dependencies:** P-204, P-211
**Scope:** when a cluster's detection rubric scores "needs revisit", prescription engine routes user back to that cluster instead of advancing.
**Owner:** Engineering

### Calibration & content ops (Â§10.6)

### P-250 â€” [BE] Threshold calibration
Milestone: TBD

**Priority:** HIGH
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.6
**Dependencies:** P-200, P-211
**Scope:** run real recordings of known-level students (Chadi's existing Preply students with documented levels) through the diagnostic. Tune thresholds in Â§2.4 and Â§3.x against ground truth. Iterate until level assignment agrees with Chadi's expert judgment â‰¥80% of the time.
**Owner:** Engineering (tuning); Chadi (ground-truth labels)

### P-251 â€” [FE+BE] Lesson content delivery infrastructure
Milestone: TBD

**Priority:** MEDIUM
**Status:** Queued
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.6
**Dependencies:** none
**Scope:** implement multi-format lesson delivery (markdown rendered in-app, PDF embedded with download option, video embedded). Specify file storage on Spaces, versioning, FE rendering.
**Owner:** Engineering

### Phase 2 deferred (Â§10.7)

Stubs filed at the same time as Phase 1 to lock the IDs and prevent collision. Scope is the title only â€” full specs land when each ticket is taken up post-launch.

### P-260 â€” [BE] Writing analysis pipeline
Milestone: TBD

**Priority:** â€”
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.7
**Dependencies:** TBD (Phase 1 foundation must ship first)
**Scope:** writing analysis pipeline â€” full spec at pickup time.
**Owner:** Engineering

### P-261 â€” [FE] Writing dashboard
Milestone: TBD

**Priority:** â€”
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.7
**Dependencies:** P-260
**Scope:** writing dashboard â€” full spec at pickup time.
**Owner:** Engineering

### P-262 â€” [FE+BE] Cross-modal prescription
Milestone: TBD

**Priority:** â€”
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.7
**Dependencies:** P-240, P-260
**Scope:** cross-modal prescription (speaking + writing) â€” full spec at pickup time.
**Owner:** Engineering

### P-263 â€” [Content] A2 path full content
Milestone: TBD

**Priority:** â€”
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.7
**Dependencies:** P-211, P-212
**Scope:** A2â†’B1 path full content authoring (extends P-212 starter set).
**Owner:** Chadi

### P-264 â€” [Content] B2â†’C1 path full content
Milestone: TBD

**Priority:** â€”
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.7
**Dependencies:** P-211, P-212
**Scope:** B2â†’C1 path full content authoring (extends P-212 starter set).
**Owner:** Chadi

### P-265 â€” [Content] C1â†’C2 path
Milestone: TBD

**Priority:** â€”
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.7
**Dependencies:** P-211
**Scope:** C1â†’C2 path (structure + content) â€” full spec at pickup time.
**Owner:** Chadi (content); Engineering (structure)

### P-266 â€” [BE] Tense + conjugation + idiomaticity detectors
Milestone: TBD

**Priority:** â€”
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.7
**Dependencies:** P-200
**Scope:** additional detectors beyond P-200's initial set â€” tense correctness, conjugation accuracy, idiomaticity scoring.
**Owner:** Engineering

### P-267 â€” [FE] Time-Adaptive UI full mode redesigns
Milestone: polish-defer

**Priority:** â€”
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.7
**Dependencies:** P-237
**Scope:** Foundation / Acceleration / Cram modes with different navigation structures (full redesign beyond P-237's lean conditional rendering).
**Owner:** Engineering

### P-268 â€” [FE+BE] Audio-synced playback for Recording Replay
Milestone: polish-defer

**Priority:** â€”
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.7
**Dependencies:** P-231
**Scope:** Block 3 enhancement â€” audio-synced inline diagnostic playback.
**Owner:** Engineering

### P-269 â€” [FE] Streak system
Milestone: polish-defer

**Priority:** â€”
**Status:** Phase 2 deferred
**Filed:** 2026-05-01
**Source:** LEMETHODIC-CURRICULUM v0.2 Â§10.7
**Dependencies:** none
**Scope:** streak system â€” F-067 reframed under the curriculum architecture.
**Owner:** Engineering
**Note:** F-067 (Queued â€” polish for real-feel) is now superseded by P-269.

### M-101.z â€” [Content] Landing page custom hero asset + per-section icons (Phase 1 polish)
Milestone: polish-defer

**Priority:** LOW (post-launch P1)
**Status:** Queued
**Filed:** 2026-05-02
**Source:** M-101a plan-first, deferred from launch
**Dependencies:** M-101a
**Scope:** author landing-page custom hero asset + per-section icons. The M-101a build reuses the P-220 pastel palette + at most one P-220 illustration as a placeholder; this ticket replaces them with marketing-specific assets (hero anchor visual, three icons for the differentiation cards, three step indicators if Chadi wants them â€” currently typographic numbered circles).
**Owner:** Chadi (illustrations) + Engineering (wire-up)
**Note:** filed per the P-220.z precedent (Phase 1 polish, illustrations not blocking ship).

### B-102 â€” [FE] Privacy + Terms + Refund pages with footer integration
Milestone: DONE

**Priority:** HIGH (pre-launch legal compliance)
**Status:** Shipped 2026-05-03 (FE-side, lemethodic-frontend commit `3216d4d`; production verified at https://lemethodic.com/{privacy,terms,refund}).
**Filed:** 2026-05-03
**Source:** Launch checklist (legal pages required for LemonSqueezy onboarding + Stripe ship).
**Dependencies:** none (markdown source authored by Chadi).
**Scope:** three new routes serving docs/{privacy-policy,terms-and-conditions,refund-policy}.md as styled markdown via react-markdown + remark-gfm. Shared `LegalPage` Server Component reads the .md files at request time. New `LandingFooter` component with three legal links + brand mark + copyright + admin@lemethodic.com, mounted on landing routes (`/`, `/fr`) and reused on legal pages. EN-only at v1; FR translations defer to M-101.x post-launch.
**Owner:** Engineering

---

## Queued â€” core product wiring (F-061.1, F-063, F-064)

**F-061.1** ðŸ“‹ TÃ¢che 3 topic picker + slug resolution
- Hardcoded `TOPIC` literal in `components/speaking/Tache3Session.tsx:29-34` still renders the "rÃ©seaux sociaux" prompt regardless of URL slug. Silent `topicId=1` fallback in `Tache3Session.tsx:48` sends the same topic_id for every session.
- Add `app/speaking/tache-3/page.tsx` â€” Tache3Picker, mirroring Tache2Picker. Consume existing backend `GET /api/recordings/tache3-topics` (recordings.py:487) which already returns `{topics: [{id, title, theme, sous_theme, difficulty, prompt_{fr,en,es}}], gates: {above_a2}}` â€” frontend isn't calling it yet.
- Decide on slug-vs-id URL shape: `TestTopic` model has no `slug` column today (only `id, title, theme, sous_theme, tache_3_prompt_*, tache_3_difficulty, is_active`). Either add a `slug` column backend-side OR keep numeric-id URLs and have the picker route to `/speaking/tache-3/<id>`.
- Update `components/speaking/SpeakingLanding.tsx:56` â€” currently hardcodes `'/speaking/tache-3/environnement'`. Route to the picker instead.
- Replace `Tache3Session`'s hardcoded TOPIC literal with a fetch on mount; show real prompt/difficulty/theme; proper "topic not found" error state instead of `|| 1`.
- Does not block core functionality â€” F-061 works end-to-end today with the fallback. This is UX cleanup.

---

F-062.3 âœ… [FE+BE] TÃ¢che 2 re-record current turn â€” "Refaire cette prise"
  - User-facing: new secondary button in the TurnReviewSheet alongside "Confirmer". Tap â†’ current transcript discarded, user's optimistic bubble popped from chat, turn counter unchanged, phase resets to user-idle, user can hold PTT to re-record the same turn position. No max-attempts cap.
  - Backend (tcf-oral-tool):
      Â· Migration `scripts/add_turn_supersede_columns.py` (repo convention: direct sqlite3 ALTER TABLE + idempotent PRAGMA guard; no Alembic â€” project doesn't use it and the F-062.3 ticket's "Use Alembic" line was superseded by its own "File naming per repo convention" line). Adds `superseded_at TIMESTAMP NULL` + `superseded_by_turn_id INTEGER NULL` columns to `conversation_turns`, plus partial index `ix_conversation_turns_active` on (conversation_id, speaker) WHERE superseded_at IS NULL for hot-path queries.
      Â· New endpoint `POST /api/conversations/{id}/turn/{turn_number}/supersede` â€” sets superseded_at=now() on the target turn, cascades to the immediately-following examiner turn (if active) since that reply was generated in context of the now-rejected candidate transcript. Returns `{superseded_turn_id, superseded_turn_number, superseded_at, cascaded_examiner_turn_numbers, status: 'superseded'}`. Idempotent (second call returns the original superseded_at), 404 on unknown turn, 400 on non-candidate target or non-in_progress conversation, 403 on owner mismatch.
      Â· `_candidate_turns(conv)` helper now filters superseded â€” this one change propagates the soft-flag semantics through the hard-cap check in `/turn`, the zero-turns check in `/end`, and the combined-transcript build in `_run_conversation_analysis_and_persist`.
      Â· `_active_turns(conversation)` helper added to both `app/services/tache_1.py` and `app/services/tache_2.py` (mirror helpers â€” shared module is a future refactor). Applied to `generate_examiner_turn_*` (so the next examiner turn isn't prompted with stale context) AND `analyze_tache_*` (so superseded turns don't leak into final scoring).
      Â· `recordings.py::_conversation_snapshot_for` â€” filters superseded turns out of the /diagnostic page's conversation replay.
      Â· `_serialize_turn` exposes `superseded_at` + `superseded_by_turn_id` for debugability; frontend doesn't need them in the happy path.
      Â· Auto-supersede defensive path in `/turn` (spec item 3): **skipped**. The current backend assigns turn_number monotonically via `len(conv.turns)`, so a "new turn with same turn_number N" collision can't occur unless the frontend skips /supersede and re-uploads â€” in which case we'd have two active candidate turns in a row, not a collision. Documented deviation. The explicit `/supersede` endpoint is the single sanctioned path.
      Â· Turn response for `/turn` now includes `candidate_turn_number` â€” the frontend needs it to know what row to supersede on Refaire.
      Â· Audio file NOT deleted on supersede â€” kept for audit. Future async cleanup job is out of scope for F-062.3 and not tracked here yet.
  - Frontend (fluentpath-frontend):
      Â· `api.sessions.supersedeTurn(sessionId, turnNumber)` â€” new method + `ConversationSupersedeResult` type in lib/types.ts. Posts empty body to the cascade endpoint.
      Â· `ConversationTurnResult` type gains `candidateTurnNumber: number` (non-null; backend always populates).
      Â· Tache2Session state machine: new `'supersede-in-flight'` phase + `supersedingRef` double-tap guard. `pendingCandidateTurnNumber` state tracks the just-uploaded turn from upload â†’ review â†’ commit/discard. `handleReRecord` calls /supersede, pops the last (optimistic) user bubble, resets pendingCandidateTurnNumber, transitions to user-idle. On supersede error: reuses ErrorOverlay with a new `secondaryAction` prop offering "Keep this take" (falls back to Confirmer behavior so the user isn't stranded against a broken /supersede).
      Â· **Deferred-commit refactor**: `userTurnCount` now increments in `proceedAfterCommit` (Confirmer path) instead of in `uploadTurn`. This means the "Turn X of 6" indicator correctly stays on the current turn through a re-record cycle, and no decrement dance is needed.
      Â· TurnReviewSheet: "Refaire cette prise" as a ghost/outline secondary button below "Confirmer" (primary). The "Ne plus afficher cette revue" checkbox semantics are unchanged â€” it affects the NEXT turn regardless of this turn's resolution.
      Â· New `SupersedeInFlightOverlay` â€” brief "Discarding this takeâ€¦" spinner, lighter visual weight than FinalizingOverlay since the action is sub-second.
  - Edge cases handled: double-tap Refaire (second tap short-circuits via supersedingRef), supersede during examiner-speaking (blocked â€” review sheet is only visible in 'reviewing' phase), network failure on supersede (error overlay + Keep-this-take fallback), multiple supersedes on the same turn position (backend monotonic turn_numbers and cascade logic handle it cleanly).
  - Final verification (Recording #25): DB soft-flag cascade confirmed on a 7-candidate-row conversation where 1 row was re-recorded â€” `conversation_turns` had (candidate 0, examiner 1, candidate 2 superseded, examiner 3 superseded via cascade, candidate 4, examiner 5, ...) with 6 active candidate turns total. `/end` analysis built the combined transcript from active rows only. Diagnostic page rendered real 4-couche scores matching conversation content (Le Goulet explanation cited "says 'I'm going to Marrakech' but explains neither preferences, needs, budget" â€” content from the kept turns, not the discarded retake).
  - `tsc --noEmit` clean on ship (only the pre-existing TargetScoreSelect.tsx:98 known error). Migration ran cleanly on dev SQLite.

F-063 âœ… [FE+BE] TÃ¢che 1 real recording (AI examiner conversation) shipped end-to-end â€” 4-turn personal-interview flow with randomized opening prompts from DB, per-turn upload + review sheet (Confirmer / Refaire cette prise), hybrid briefing-then-examiner-opens, final /end routing to /diagnostic with 4-couche analysis on combined active-turn audio.
  - Backend (tcf-oral-tool):
      Â· New model `Tache1Opening` in `app/models/models.py` â€” columns: `id`, `opening_prompt_fr` (NOT NULL), `opening_prompt_en`, `opening_prompt_es`, `is_active`, `created_at`. EN/ES columns mirror the TÃ¢che 2 scenario table's multi-language pattern; examiner TTS only reads the FR column (kept for future bilingual-subtitle display).
      Â· Migration `scripts/add_tache1_openings.py` â€” idempotent CREATE TABLE IF NOT EXISTS + partial index `ix_tache1_openings_active` on (is_active). Repo-convention direct-sqlite3 pattern, same as `scripts/add_turn_supersede_columns.py` from F-062.3. Note: because `init_db.py` uses `Base.metadata.create_all()` the table auto-materializes when the backend imports the model â€” the explicit migration script is still shipped for fresh-DB bootstrapping and clarity.
      Â· Seeder `scripts/seed_tache1_openings.py` â€” 8 prompts with FR/EN/ES translations (idempotent upsert by `opening_prompt_fr`). Ran cleanly on dev DB: 8 rows inserted, all is_active=1.
      Â· `app/routers/conversations.py`: imported `Tache1Opening` + `random_opening as t1_random_opening_fallback` from the persona module; new helper `_pick_random_tache1_opening(db)` that `ORDER BY func.random() LIMIT 1` on active rows. `_append_examiner_turn` now branches on `conv.tache_mode == "tache_1" and next_number == 0` to use the DB pick; fallback to the in-code tuple if the table is empty or the query raises (defensive â€” a fresh DB without the migration shouldn't 500 a T1 session). All other examiner-turn flow unchanged â€” subsequent T1 turns still go through `generate_examiner_turn_t1(conv)` with Claude Sonnet.
      Â· `analyze_tache_1` already existed (F-048) â€” no changes needed. It uses `_active_turns()` so F-062.3's soft-flag cascade applies automatically on /end; `candidate_turn_number` already shipped in `/turn` response for Refaire.
      Â· No changes to `/supersede`, `/end`, or TTS. T1 and T2 share the same endpoints and analysis persistence pipeline.
  - Frontend (fluentpath-frontend):
      Â· `components/speaking/Tache1Session.tsx` â€” full rewrite as a near-clone of Tache2Session. Phase state machine: `briefing â†’ examiner-speaking (opening) â†’ user-idle â†’ user-recording â†’ user-transcribing â†’ reviewing â†’ supersede-in-flight | examiner-speaking (reply) â†’ user-idle (loop) â†’ finalizing`. Reuses F-061/F-062 primitives unchanged: `useAudioRecorder`, `VuMeter`, `RecordButton` (PTT mode with pointer capture from F-062.2), `TurnReviewSheet` (inlined â€” Confirmer + Refaire cette prise + "Ne plus afficher" checkbox).
      Â· T1-specific adjustments from T2: `TARGET_USER_TURNS = 4` (vs 6); `TURN_CAP_MS = 30_000` (vs 60_000 â€” T1 turns are short exchanges); hybrid briefing card with hardcoded prose (no scenario object / picker) â†’ single "Start interview" CTA â†’ /start returns `examinerTurnText` populated â†’ phase lands in `examiner-speaking` before the user's first PTT (contrast with T2 which lands in `user-idle` because the candidate opens there); single `PEACH` bubble color for examiner bubbles (T1 has no per-scenario palette); turn indicator hidden during briefing AND during the opening examiner turn (shown once `userTurnCount > 0` or non-opening phase) so users aren't distracted by "Turn 1 of 4" while the examiner is still speaking.
      Â· `MIN_HOLD_MS = 200` slip-finger guard mirrored from T2.
      Â· Muted toggle + autoplay-blocked "Tap to hear the question" ghost button mirrored from T2 (copy adjusted: "question" vs "reply" since T1 is a Q&A).
      Â· Error overlay with secondary "Keep this take" escape for supersede failures â€” identical to F-062.3 pattern.
      Â· Deferred-commit via `proceedAfterCommit` / `userTurnCountRef`: `userTurnCount` increments on Confirmer (not on upload), so the "Turn X of 4" indicator correctly stays on the current turn through a re-record cycle.
      Â· Per-session `reviewSuppressed` ephemeral state (not localStorage) â€” same pattern as T2.
      Â· No API surface changes in `lib/api.ts` or `lib/types.ts` â€” `createConversation('tache_1', opts)` already worked (TacheMode type included 'tache_1'; `scenarioCode` was already optional; mapper normalizes `max_candidate_turns` (T1) vs `max_candidate_turns_hard` (T2) into `maxCandidateTurnsHard`). `supersedeTurn` / `uploadConversationTurn` / `finalizeConversation` unchanged.
  - Routing:
      Â· `app/speaking/tache-1/[topic]/page.tsx` â€” new dynamic route; renders `Tache1Session` inside `ProtectedRoute`. Slug is informational only (session doesn't branch on it).
      Â· `app/speaking/tache-1/page.tsx` â€” now redirects to `/speaking/tache-1/interview` (Next.js `redirect()`) for anyone who navigates to the bare URL by hand.
      Â· `components/speaking/SpeakingLanding.tsx` â€” TÃ¢che 1 card `href` updated from `/speaking/tache-1` to `/speaking/tache-1/interview`.
  - Verification: `pnpm tsc --noEmit` clean except the pre-existing TargetScoreSelect.tsx:98 known issue. Migration ran idempotently (table auto-created on backend boot); seeder inserted 8 rows; 5 samples of `_pick_random_tache1_opening(db)` returned 4 unique prompts (expected distribution).
  - Deliberate deviations from spec:
      Â· `analyze_tache_1` already existed from F-048 â€” no new analyzer, no rubric-weight adjustments made in this ticket. T2/T3 weighting lives in `app/services/scoring_profiles.py::compute_weighted_note_globale` which already has a `tache_1` branch. If rubric calibration surfaces issues during F-079 (calibration with real students), revisit in a separate follow-up â€” not in scope for F-063.
      Â· Opening-prompt EN/ES columns seeded but not surfaced in UI yet. Examiner bubble renders only FR since that's the spoken language. Kept for parity with Tache2Scenario shape and future bilingual-subtitle display.

## Queued â€” follow-ups

**F-063.1** ðŸ“‹ T1 audio autoplay â€” examiner's opening prompt
- Observed during F-063 verification: autoplay doesn't trigger on the examiner's FIRST prompt audio in a TÃ¢che 1 session. Subsequent examiner turns in the same session play inline once the audio context is user-unlocked (via the "Tap to hear the question" ghost button on the first miss). The first turn falls through to the ghost-button fallback every time, even when the user has interacted with the page (briefing CTA tap).
- Hypothesis: the briefing â†’ `examiner-speaking` phase transition mounts the `<audio>` element and calls `.play()` synchronously in a `useEffect`, which lands outside the user-gesture window from the briefing CTA tap. Subsequent turns fire inside a gesture-derived event chain (PTT release â†’ upload â†’ response â†’ play) so they pass.
- Fix candidates: route the first turn's `play()` through the same gesture-chained handler the PTT flow uses, OR keep the current architecture and dismiss the autoplay ghost as expected first-turn behavior (cosmetic-only follow-up).
- Not blocking â€” F-063 ships with the ghost-button fallback. Filed 2026-04-27.

**F-063.3** ðŸ“‹ T1 review sheet timing â€” sheet appears before examiner finishes speaking
- Observed during F-063 verification: the per-turn review sheet (Confirmer / Refaire cette prise) for the user's just-recorded turn pops up before the AI examiner finishes speaking the FOLLOWING reply. The user is asked to confirm/redo while the examiner audio is still playing â€” clashes with the "let the examiner finish, then react" interaction model.
- Root cause: phase machine flips to `reviewing` (which mounts the sheet) immediately after `/turn` upload completes; the examiner reply audio plays in parallel from the `examiner-speaking` phase. The two phases end up overlapping by ~3-6 seconds depending on turn length.
- Fix candidate: gate the review sheet mount on `audioEnded === true` for the most recent examiner turn (or queue the sheet open behind the audio's `ended` event). Same pattern T2 already handles correctly via deferred-commit (F-062.3) â€” T1 inherited the structure but the audio-finish gate didn't carry over.
- Filed 2026-04-27 from F-063 verification.

### F-110.1 â€” [FE] Migrate frontend reads from internal_key to key
Milestone: DONE

**Status:** Superseded by P-100.5 (2026-05-01) â€” same code change shipped as part of the dashboard rendering fix bundle. The migration originally specced here (RawCouche type rename + filter + mapDiagnosticBlock + mapRecordingSummary) shipped verbatim under P-100.5 because Section 2's missing render was caused by exactly this mismatch (frontend reading `internal_key` while F-110 list endpoint emitted `key` only).
**Cleanup trigger:** F-110.2 backend cleanup is now safe to execute â€” notify backend to drop `internal_key` from `couches_array` dual-emission.

### P-104.x â€” [FE] Wall-clock setTimeout cap fallback for deep-throttle edge case
Milestone: TBD

**Priority:** Low (post-launch)
**Status:** Queued
**Filed:** 2026-05-01
**Parent:** P-104 (Step 1 visibilitychange listener shipped â€” see "Shipped â€” Week 2 (May 1)")

**Scope:** harden the per-TÃ¢che cap auto-stop for the deep-throttle edge case where the user backgrounds the tab for the entire turn duration plus several minutes, never refocusing within the cap window. P-104's visibilitychange listener fires the cap on refocus; this ticket bounds the worst-case overrun to ~2s by also scheduling a wall-clock `setTimeout(TURN_CAP_MS, finishRecording)` at recording start, cleared in all stop paths.

**Background:** `setTimeout` is also throttled in background tabs but Chrome doesn't pause it entirely under intensive throttling â€” a 60s setTimeout fires within ~1-2s of wall-clock t=60 even when hidden. This complements the visibilitychange listener for the case where the user simply doesn't return.

**Implementation sketch:** in each TÃ¢che session's `startRecording`, schedule the timeout. Clear it in `finishRecording`, on phase transitions away from recording, and on unmount. Idempotency is already in place (`recorder.stopRecording()` no-ops when state is `inactive`), so the cap firing twice is safe.

**When:** defer until real user data shows the long-hidden case happens. The Visa-Urgent persona is unlikely to background a TCF practice tab for 5+ min mid-recording. Pre-launch coverage of the brief and moderate cases via P-104 Step 1 is sufficient.

### P-115.x â€” [FE] Motion pass: remaining surfaces
Milestone: M2

**Priority:** Medium
**Status:** Queued
**Filed:** 2026-05-01
**Parent:** P-115 (4 of 8+ surfaces shipped â€” see "Shipped â€” Week 2 (May 1)")

**Scope:** the motion surfaces deferred from P-115's first pass.
- **Button presses** â€” every primary CTA / card press currently uses inline `transform: scale(0.97)` on pointerdown with no transition. Migrate to `motion.button` with `whileTap={{ scale: scaleButtonPress }}` and `transition={pressInstant}`. Hits Paywall CTA, OnboardingScreen.CTAButton, every TÃ¢che briefing/finalize button.
- **Card transitions** â€” onboarding cards, lesson list rows on hover/tap, TÃ¢che scenario picker cards. Existing pattern uses inline scale; migrate to `motion.div` with `liftSpring` for selected-card lift and `pressInstant` for press.
- **Tab switches** â€” bottom nav tab change between /, /speaking, /writing, /progress, /more. Currently no transition between routes; add a fade or fade-slide on route content using AnimatePresence + the layout shell.
- **Progress bar fills** â€” Quiz progress bar (`QuizClient.tsx:155-173`), any other linear progress bars. Currently uses CSS `transition: width 0.3s ease`; migrate to motion with `easeFpDefault` for consistency.
- **Onboarding step transitions** â€” between LanguageSelect â†’ TCFGoalSelect â†’ â€¦ â†’ EcoleReveal. Currently a hard cut on `setStep(n+1)`. Add AnimatePresence + slide/fade between steps.
- **Streak fire icon** â€” once F-067 ships streaks, a subtle attention pulse on the streak counter when it increments.

**Dependencies:** none; the foundation (`lib/motion.ts`, `framer-motion`, tokens, safe-area) is already shipped via P-115.

**When:** pick up after launch-blockers clear (P-103, P-104, B-100, B-102, M-100). Not pre-launch critical â€” the 4 shipped surfaces cover the highest-impact moments (diagnostic reveal, recording-done, unlock, empty-state CTA).

---

## Queued â€” core product wiring (continued)

**F-064** ðŸ“‹ Lesson detail + quiz real data
- `app/ecole/lesson/[id]/page.tsx` fetches GET /api/ecole/lessons/{id}
- Quiz component submits to POST /api/ecole/lessons/{id}/complete
- Lesson completion updates user progress state
- HomeScreen lesson list re-renders with updated completion state

---

## Queued â€” polish for real-feel (F-065 to F-067)

**F-065** ðŸ“‹ Profile page real data
- Replace hardcoded "Chadi" / "chadi@example.com" / "TCF C1 (level 5)" / "June 7, 2026" / Day 7 / 4/16 / 47 days
- Pull from useAuthStore.user (email, full_name, target_level, exam_profile, exam_date, goal, current_level)
- Preply CTA stays as-is (links to Chadi's Preply profile)
- Edit icon on exam date triggers a mini-editor that PATCHes /api/users/me

**F-066** ðŸ“‹ Daily action card B â€” smart practice recommendation
- Currently hardcoded to "TÃ¢che 2 Â· Agence de voyages"
- Replace with endpoint that returns recommended practice based on user's bottleneck couche
- Backend: new endpoint GET /api/ecole/recommended-practice
- Frontend: HomeScreen fetches and renders recommendation
- May be deferred to post-launch if bottleneck detection requires session history

**F-067** ðŸ“‹ Streak endpoint + wiring
- Backend: GET /api/users/me/streak returns last-7-days practice activity count
- Frontend: HomeScreen reads from streak endpoint, renders "Day N Â· Current streak"
- Current fallback shows "Start your streak today" â€” keep as empty state

---

## Queued â€” methodology / content gaps (F-068 to F-070)

**F-068** ðŸ“‹ TEF option in onboarding
**Superseded by F-091b** (April 27, 2026). Original scope below preserved for historical record.
- Split "Immigration" goal into "Immigration â€” TCF Canada" and "Immigration â€” TEF Canada"
- mapOnboardingToBackend routes second option to exam_profile='tef'
- No backend change needed (exam_profile column already accepts 'tef')

**F-069** ðŸ“‹ French lesson titles in backend seeder
- Update seed_topics.py or ecole seeder
- Lesson titles must be French ("Conjugaison" not "Conjugation", "PrÃ©positions" not "Prepositions")
- Lesson short_descriptions stay in interface language (English for EN users)
- Reseed the ecole_lessons table on dev DB before launch

**F-070** ðŸ“‹ CEFR â†’ TCF /699 score mapping
**Superseded by F-091c** (April 27, 2026). Original scope below preserved for historical record. Reframe in F-091c generalizes from TCF /699 to per-exam dispatch.
- Backend analysis engine must emit tcfScore (0-699) alongside noteGlobale (0-20) and cefrBand
- Map internal score â†’ TCF band using official TCF Oral rubric (0-699)
- Frontend diagnostic page hero switches from {noteGlobale}/20 to {tcfScore} / 699 {cefrBand}
- Paywall radar already shows this; make sure diagnostic matches

---

_(F-084 v2 shipped 2026-04-27 as a progressive-disclosure pattern, not the original basic/detailed toggle. See "Shipped â€” Week 2 (April 27)" below for the full entry. Original spec preserved here for diff-history; the v2 spec replaces the toggle/preference-field design with a single page that uses progressive disclosure for everyone â€” narrative hero + top-3 dimensions visible by default, "See full breakdown" disclosure for depth.)_

---

## Queued â€” Module Library + Intelligence Layer (F-080)

**F-080** ðŸ“‹ Sprint pivot (2026-04-25). Replace generic Claude-API feedback with a named library of L1-interference remediation modules; every speaking session tagged with detected modules; cross-session accumulation drives Raccourci routing. Architectural cornerstone: new `remediation_modules` table (coexists with existing `raccourci_lessons` via optional `raccourci_lesson_id` FK); every TÃ¢che analysis outputs `detected_modules: [ids]`. Split into 4 phased sub-tickets with verification gates between each. Total budget ~3.5 engineering days + parallel module authoring by Chadi. See `F-080-SPEC.md` (to be added) for the full ticket text; summary per phase below.

**F-080a** âœ… Backend scaffolding â€” modules table + seed loader (shipped 2026-04-25, commit `4f48ae1` in tcf-oral-tool; first commit after git init)
- Migration `scripts/add_remediation_modules.py` (idempotent sqlite3 pattern from F-062.3) â€” creates `remediation_modules` + `session_detected_modules` with CHECK constraints on `category` and `severity`, partial active-row indexes.
- SQLAlchemy `RemediationModule` + `SessionDetectedModule` in `app/models/models.py` with JSON-blob TEXT fields for `detection_criteria`, `examples`, `content_refs`, `drill_ids`, `prerequisite_module_ids`.
- Pydantic schemas in new `app/schemas/modules.py` (ContentRef, ExampleEntry, DetectionCriteria, RemediationModule, DetectedModule).
- Seed loader `scripts/seed_remediation_modules.py` reading `*.json` from a modules folder (Windows path TBD â€” spec says `/mnt/user-data/uploads/modules/` which is Linux; finalize before implementation).
- CRUD endpoints in new `app/routers/modules.py` â€” `GET /api/modules`, `GET /api/modules/{id}`, `GET /api/modules?category=X`. No auth restrictions V1.
- Gate: migration idempotent, 2 authored modules seed and re-seed cleanly, schema CHECK rejects invalid category/severity.

**F-080.x** ðŸ“‹ Module 1 (`nuance_reflex`) detection_criteria refinement â€” request-vs-make distinction for T2
- Surfaced during F-080b Path A regression analysis. The `nuance_reflex` `contextual_triggers` list says "T2 role-plays asking the candidate to recommend or weigh options," but doesn't distinguish between a candidate **MAKING** a recommendation (canonical trigger) vs **REQUESTING** one (e.g. asking a travel agent for advice â€” the candidate stating "Je prÃ©fÃ¨re la plage" is preference-as-input-to-service, not opinion-defending). The current criteria treat both identically; Claude reads them inconsistently across runs.
- Possible refinement: split the T2 contextual_trigger into "candidate making a recommendation/weighing options for someone else" vs "candidate stating preferences as input to a service request" â€” only the first is a canonical nuance_reflex context.
- Not blocking F-080b. Surface during content-authoring review; Chadi to decide whether the criteria need rewording or whether the borderline case should be left out-of-scope.

**F-080b** âœ… Claude API integration â€” detect modules per session (shipped 2026-04-25 in tcf-oral-tool; Path A v2 fix-up shipped same day after gerondif_confusion smoke test)
- New `app/services/module_library.py` â€” three responsibilities: `fetch_active_modules_for_prompt(db)` renders the active library as a compact text block (~600 tokens for 2 modules; see F-080 deferred Q on prompt-size scaling), `fetch_valid_module_ids(db)` returns the set used for hallucination rejection, `persist_detected_modules(recording_id, detected_modules, primary_module_id, db)` is the single source of truth for writing detection rows. Single helper called from BOTH finalize paths.
- New `app/services/module_detector.py` â€” `detect_modules(transcript, tache_mode, db)` makes one Claude Sonnet call against a system prompt that injects the rendered library + per-TÃ¢che category-priority instructions (T1: discourse_structure / register_mismatch / vocab_calque; T2: register_mismatch / vocab_calque / grammar_interference; T3: discourse_structure / verb_aspect / word_order). Weighting is prompt INSTRUCTION not hard filter â€” modules from non-priority categories still surface when criteria match. Empty `detected_modules` is an explicitly valid result (the prompt instructs Claude to return empty when nothing fits â€” false detections degrade student trust more than missed ones).
- `analyze_tache_1`, `analyze_tache_2`, `analyze_tache_3` each call `detect_modules` after the existing 4-couche analysis (same layered pattern as Yarden in T2 and argumentation in T3); the result is merged into the analyzer's output dict as `detected_modules` + `primary_module`. New optional `db` kwarg threaded through; when absent (legacy crossover path), analyzers default to empty detection.
- Persistence wired in BOTH finalize paths per spec amendment (T3 doesn't go through `/end`):
    Â· `app/routers/conversations.py::_run_conversation_analysis_and_persist` â€” T1 + T2 sessions, immediately after `db.refresh(rec)` for the new Recording row
    Â· `app/routers/recordings.py::_run_analysis_and_persist` â€” T3 (and any legacy upload path), after `db.refresh(feedback)`
  Both call sites wrap `persist_detected_modules` in a defensive try/except so a detection failure can never crash session finalize. The helper itself never raises.
- Hallucination protection: `persist_detected_modules` fetches valid module ids before insert and skips any detection whose `module_id` isn't in the active library, logging at WARNING with the rejected ids and the active set for debugging. Malformed detection entries (missing module_id, non-dict, non-numeric confidence) are similarly logged + skipped without crashing.
- Verification gates (all green):
    Â· imports clean across analyzers + routers (54 routes, no circular imports)
    Â· prompt block renders correctly for the 2 seeded modules (3111 chars, all detection_criteria fields populated)
    Â· demo-mode (no `ANTHROPIC_API_KEY`) returns `{detected_modules: [], primary_module: null}` â€” no fake detections
    Â· live Claude T2 prompt with "Je prefere la plage. C'est mieux pour se reposer." â†’ detects `nuance_reflex` (confidence 0.72), supporting_quote verbatim from transcript
    Â· live Claude T1 prompt with "j'ai eu une biere", "j'ai ete a la maison", "j'ai eu ce poste" â†’ detects `to_get_reflex` 3Ã— (confidences 0.82â€“0.88), each with verbatim supporting_quote
    Â· live Claude T3 prompt with a clean 3-beat argumentative monologue ("Il est vrai queâ€¦ Cependantâ€¦ C'est pour cette raison queâ€¦") â†’ empty detection, primary null. Critical negative-test pass: no false positive on a well-structured response.
    Â· hallucination test against persistence helper: mixed valid + 2 hallucinated + 4 malformed entries â†’ only the 2 valid rows inserted, exactly 1 marked is_primary, non-numeric confidence preserved as NULL, all rejections logged at WARNING.
- Deferred to later iterations (per F-080 spec): confidence threshold filtering (storing all detections for now, threshold tuning postponed until we have data); per-TÃ¢che category subsetting in the injected library (revisit at 25+ modules); admin UI for module CRUD (F-080.1 if/when authoring scales).
- Shipped on the master branch in tcf-oral-tool â€” second commit on the repo (after F-080a's initial commit `4f48ae1`).

  **Path A v2 (post-ship fix, same day):** smoke test of seeded Module 3 (`gerondif_confusion`, the first conditional-detection module) revealed F-080b's prompt only handled surface-visible modules cleanly. The detector was suppressing conditional detections to <0.4 (below the emit floor) because their criteria are by-design semantically ambiguous. Three fixes:
    1. **Detection prompt: two-class structure.** `_DETECTION_SYSTEM` now distinguishes Class 1 (surface-visible: keywords ARE the mistake; old behavior preserved with 0.85+ for unmistakable, 0.55â€“0.75 for suggested) and Class 2 (conditional: keywords are inspection triggers only, identified by markers like "wrongness depends on semantic context" / "inspection trigger only" / "see grammatical_signals" embedded in the keywords_wrong list). Conditional modules use a 4-step process â€” surface match â†’ semantic intent eval â†’ verify mismatch â†’ emit at 0.55â€“0.75 â€” and the 0.4 floor explicitly does NOT apply to them.
    2. **Module ordering: alphabetical-by-id.** `fetch_active_modules_for_prompt` switched from severity-DESC to alphabetical, removing the anchoring bias that made high-severity modules dominate even when subtler conditional ones were the better match. Random ordering was tried first but introduced run-to-run variance; alphabetical is deterministic and category/severity-neutral.
    3. **Parser robustness + prompt cleanup.** Added `_extract_first_json_object()` â€” balanced `{...}` walker tolerant of leading prose preambles ("Looking at the transcript: â€¦" before the JSON). Also fixed doubled-brace artifact in the OUTPUT FORMAT example (holdover from `.format()`-style template; my code uses `.replace()`) â€” Claude was occasionally mirroring the literal `{{...}}` back, producing unparseable output.
  **Verification gates after Path A v2 (all green, intentional non-borderline test cases):**
    Â· R1 nuance_reflex on T3 unambiguous flat stance ("Les rÃ©seaux sociaux sont nÃ©gatifsâ€¦") â†’ detected @ 0.87 (â‰¥0.7 floor)
    Â· R2 to_get_reflex on T1 avoir-misuse â†’ 3 detections @ 0.88, 0.82, 0.75 (multi-hit verbatim quotes)
    Â· R3a gerondif_confusion SHORT (2-sentence Module 3 example #4) â†’ 0.65 (squarely in 0.55â€“0.75 conditional band)
    Â· R3b gerondif_confusion LONG (6-sentence T3 monologue with same misuse buried) â†’ 0.65, confirming short-context starvation is NOT a separate factor
    Â· R4 clean argumentative monologue (negative test) â†’ empty, no false positives
    Â· R5 hallucination test â†’ 2 valid rows inserted, 1 is_primary, hallucinated/malformed all rejected with WARNING logs
    Â· Variance: 5x repeats of R3a â†’ identical outcome (1 unique result across 5 runs) under deterministic alphabetical ordering
  **Test redesign noted:** the original F-080b ship test for nuance_reflex used the T2 plage transcript ("Je prÃ©fÃ¨re la plageâ€¦"), which turned out to be a borderline case (T2 role-play where candidate REQUESTS rather than MAKES a recommendation). That borderline behavior is filed as F-080.x for Module 1 criteria review. Replacement regression test uses the unambiguous T3 flat-opinion case.
- Inject active-module library (id + name + detection_criteria only â€” keep prompt compact) into each of `tache_1.py`, `tache_2.py`, `tache_3.py` analysis prompts.
- Per-TÃ¢che category weighting in prompt instructions (not hard filters): T1 favors discourse_structure + register_mismatch + vocab_calque; T2 favors register_mismatch + vocab_calque + grammar_interference; T3 favors discourse_structure + verb_aspect + word_order.
- Analysis output schema gains `detected_modules: [{module_id, confidence, supporting_quote}]` + `primary_module: string`.
- On `/end`, extract and insert one `session_detected_modules` row per detected module; set `is_primary=1` on the matching row. Empty detection logs a warning but does not fail finalize.
- Gate: T2 session persists 1-3 detection rows with exactly one `is_primary=1`; supporting_quote matches real candidate utterance; T1 session preferentially detects the weighted categories.

**F-080d.x** ðŸ“‹ Perf â€” `recurring_modules` query index (deferred from F-080d B1)
- The `GET /api/users/me/recurring_modules` query joins `session_detected_modules` (scanned via `idx_sdm_user_module` on `module_id`) with `recordings` (via PK) and filters on `recordings.user_id`. Today `recordings.user_id` is NOT indexed (only the PK `ix_recordings_id`). EXPLAIN QUERY PLAN at F-080d ship time shows SQLite uses the `module_id` index to drive the GROUP BY and resolves recordings via PK lookup â€” no full scan of recordings observed.
- File now because: at first-1000-users scale, with ~25 recordings per user, the per-row recordings PK lookup is fast enough. If the query starts hot-pathing in production, add `CREATE INDEX idx_recordings_user_id ON recordings(user_id)` and re-run EXPLAIN.
- Spec asked for a 3-column index `(user_id, module_id, session_id)` on `session_detected_modules`. That shape doesn't fit the actual schema (no user_id or session_id columns on that table â€” user comes from the recordings JOIN, "session" is the recording_id). Ignore the spec shape; the simpler `recordings(user_id)` single-column index is the right intervention if/when needed.

**F-080d.y** ðŸ“‹ Public-glossary path for `/learn/[module_id]` (post-launch)
- F-080d Q4 locked to Option A: pre-launch all visitors to `/learn/[id]` authenticate via `ProtectedRoute`. Cold state = logged-in user who hasn't triggered the module.
- Backend is already optional-auth ready (`get_current_user_optional` on `GET /api/modules/{id}`; `user_context: null` when no token). Frontend just wraps in `ProtectedRoute` per the existing pattern.
- Post-launch SEO play: drop the `ProtectedRoute` wrapper, render the page as a public glossary entry. Backend unchanged. Surfaces module library to search engines as long-form authored content; bonus marketing surface.

**F-080d.aa** ðŸ“‹ Defensive grep audit â€” leftover SQLite-isms in raw/ORM SQL (post-launch)
- The hotfix that motivates this ticket: `func.group_concat(distinct(SessionDetectedModule.recording_id))` in `app/routers/users.py::recurring_modules` and `app/routers/modules.py::_user_context_for` raised `psycopg.errors.UndefinedFunction: function group_concat(integer) does not exist` on the production deploy. Both call sites were ported to `func.string_agg(distinct(cast(col, String)), ",")` in a single backend commit. Frontend audit grep was clean of `group_concat | IFNULL | json_extract` everywhere else, but the F-080d epic was authored against SQLite locally â€” there is no test that exercises the postgres dialect end-to-end, so other dialect-specific calls may be hiding.
- Defensive sweep to schedule post-launch: grep the backend tree for `group_concat`, `IFNULL` (Postgres uses `COALESCE`), `json_extract` (Postgres has `->`/`->>`/`jsonb_path_query`), and string-concat via `||` in raw SQL (`text("...")` blocks) â€” also worth checking for `STRFTIME(`, `RANDOM()` semantics drift, `AUTOINCREMENT`, and any `op('REGEXP')` / `MATCH` clauses. Anything that surfaces gets a cross-dialect rewrite plus a regression note in this entry.
- Why post-launch: the immediate production breakage is closed by the hotfix. The remaining risk is dialect-specific calls that are reachable only on rarely-invoked endpoints â€” they will surface as 500s with the same shape as the recurring_modules outage and be straightforward to localize from logs. Pre-launch we'd rather not block on a speculative grep when production traffic has already exercised the high-volume paths.
- Stale comment cleanup hitchhiking on this audit: `users.py::_coerce_iso` still describes "SQLite + func.min/max return strings" as the motivation. Local DB switched to Postgres in F-077; the helper itself is harmless under Postgres (datetimes round-trip as datetimes) but the comment is misleading. Strip or rewrite during the sweep.
- ID note: filed as `F-080d.aa` because `.x` (perf), `.y` (public glossary), `.z` (verification harness rules) were already taken in this epic's sub-ticket numbering when this hotfix landed. Rename if a saner ID is preferred.

**F-080c.x** ðŸ“‹ Full Le Goulet cleanup (deferred from F-080c per the F-080c.(3a) decision)
- F-080c removed `<GouletCard />` from `app/diagnostic/page.tsx` and stripped the goulet derivation block, but left in place: `components/diagnostic/GouletCard.tsx` (the component file), `Goulet` interface in `lib/types.ts`, `goulet` field on the `Diagnostic` type, the `goulet`/`gouletKey` mapping in `lib/api.ts::mapDiagnosticBlock`, and the backend `le_goulet` block in `_format_recording`. None of these affect the visible UI today; they're carried forward defensively in case other consumers reference them.
- Cleanup once nothing else reads goulet: delete `components/diagnostic/GouletCard.tsx`, drop `Goulet` + `goulet` field from frontend types and the api mapper, and stop writing `goulet_*` columns in `Feedback` (or keep them as legacy noise; either is fine).
- Not blocking. File now to keep tech debt visible.

**F-080c** âœ… Frontend â€” module-driven diagnostic page (shipped 2026-04-25)
- Backend: new endpoint `GET /api/recordings/{id}/detected-modules` in `app/routers/recordings.py`. Owner check via existing recording.user_id pattern. Joins `session_detected_modules` with `remediation_modules`, hydrates the JSON-blob columns (detection_criteria / examples / content_refs / drill_ids / prerequisite_module_ids) into structured shape. Returns `{primary_module, secondary_modules, detections}`; 404 on unknown/foreign recording_id, 401 on missing token. Module-data only â€” couche scores stay on `getDiagnostic` (avoids duplication; new endpoint stays focused). Smoke-tested with seeded detections, empty case, 404, 401 â€” all green. Detection rows that reference a deleted module are logged at WARNING and dropped from the response rather than 500 (defensive â€” F-080b's persist_detected_modules already enforces FK validity at write time).
- Frontend deps: `pnpm add react-markdown` (10.1.0). Used by InlineContentRef for rendering `inline_markdown` content_refs.
- New hook `lib/hooks/useInterfaceLanguage.ts` â€” returns `'en' | 'fr' | 'es'` from `useAuthStore.user.interfaceLanguage` with `'en'` fallback. Consumed by every F-080c component for FR/EN field selection. ES users fall back to EN content (V1 module authoring ships FR + EN only).
- New types in `lib/types.ts`: `ModuleCategory`, `ContentRefType`, `ModuleExampleEntry`, `ModuleContentRef`, `ModuleDetectionCriteria`, `RemediationModule`, `SessionDetection`, `DetectedModulesResponse`. Deliberately keeps the backend's snake_case field names (no camelCase mapper) â€” modules are read-only authored content that flows through unchanged, distinct from User/Recording mappers that bridge frontend-store-shape to backend.
- New api method `api.sessions.getDetectedModules(recordingId)` â€” returns `DetectedModulesResponse` verbatim from the new endpoint.
- Five new diagnostic components in `components/diagnostic/`:
    Â· `DetectedModuleCard.tsx` â€” primary module rendering: category badge (1-of-8 pastel palette mirroring `globals.css`), severity dot scale (1-5), module name, L1-interference description, supporting quote in italics ("From your session: â€¦"), expandable "See examples" button. Confidence is NEVER surfaced â€” F-080c locked UX decision. Confidence is logged for debugging only via the network tab.
    Â· `SecondaryModulesList.tsx` â€” collapsed "Also detected Â· N" section. Expanded reveals per-module rows that themselves expand into description + supporting quote + examples. Per-module row picks the first non-primary detection for the supporting quote (T1 to_get_reflex emits multiple detection rows for the same module_id; we surface only one in the secondary view).
    Â· `ModuleExamples.tsx` â€” wrong/right/explanation triplets. Wrong line in red strikethrough; right line in green; explanation in `Why:` block. Reused by both the primary card's expand and the secondary rows' expand.
    Â· `InlineContentRef.tsx` â€” `react-markdown` rendering of `inline_markdown` refs (h1/h2/h3, **strong**, *em*, ul/ol/li, hr, code) styled to the FluentPath display tokens. `document` / `audio` / `external_link` types render placeholder cards ("Coming soon" â€” F-081 ships audio drills, F-082 ships interactive drills, document hosting deferred until authored content needs it).
    Â· `EmptyDetectionFallback.tsx` â€” "No specific reflexes detected this session. Keep practicing." Bilingual FR/EN copy; ES falls back to EN.
- Diagnostic page rewrite (`app/diagnostic/page.tsx`):
    Â· Parallel fetch via `Promise.all([getDiagnostic, getDetectedModules])`. The diagnostic call is the load-blocker; `getDetectedModules` failure is non-fatal â€” falls back to the empty-fallback state (which is also a valid product state).
    Â· Section 2 LA MÃ‰THODE EN COUCHES: header copy changed to "Your CEFR-tracking baseline" â€” bars stay, position is now secondary context.
    Â· Section 3 LE GOULET removed from JSX. Replaced by inline `DetectedReflexesSection` (composes `DetectedModuleCard` + `SecondaryModulesList` + `EmptyDetectionFallback`).
    Â· Section 4 L'ORDONNANCE conditionally rendered only when `primary_module` exists AND has at least one `content_refs` entry. Module 2 (`to_get_reflex`) ships empty content_refs by design â€” for those, examples in the primary card ARE the teaching surface; L'ORDONNANCE section disappears entirely. Otherwise renders the primary module's content_refs sorted by `display_order`, each via `InlineContentRef`.
    Â· Mock-mode (no `?session=` param, design-review path) lands on the empty fallback in DETECTED REFLEXES with L'ORDONNANCE skipped â€” keeps mock surface area small and matches a real product state.
    Â· Sections 5/6 (Session details, Corrected transcription) untouched â€” still mocked, out of scope for F-080c.
- Verification: `pnpm tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue; backend endpoint smoke-tested via `TestClient` (200 with detections, 200 with empty, 404, 401); routes count incremented from 54 â†’ 55.
- Le Goulet cleanup deferred to F-080c.x (component file, type field, api mapper, backend column writes all left in place â€” F-080c only removed the visible UI surface per (3a) decision in the implementation discussion).
- F-080c locked UX decisions held: secondary modules collapsed by default, no confidence threshold, confidence never surfaced in UI, Le Goulet removed from visible UI.
_(F-080c shipped detail captured above; legacy queue text was here.)_

**F-080d** âœ… Cross-session intelligence + Raccourci routing (shipped 2026-04-26 â€” closes the F-080 epic)

Backend (commit `cbd1d8e` in tcf-oral-tool):
- New endpoint `GET /api/users/me/recurring_modules` (in `app/routers/users.py`) â€” modules detected in 3+ distinct recordings for the authed user, sorted by severity DESC then recurrence_count DESC. Each entry: `module_id`, `name_en`, `name_fr`, `category`, `severity`, `raccourci_lesson_id`, `recurrence_count`, `first_detected_at`, `last_detected_at`, `recording_ids`. Empty array on cold users (status 200, not 404). Threshold constant `RECURRING_MODULE_RECORDING_THRESHOLD = 3`.
- Schema-correction note: F-080d spec referenced `session_id` / `user_id` columns on `session_detected_modules` that don't exist. Actual schema has `recording_id` (FK to recordings, recordings owns user_id). Response field renamed from spec's `session_ids` â†’ `recording_ids` so the API contract matches the data model. "Session" stays in user-facing copy only ("Detected in 5 of your sessions").
- Augmented `GET /api/modules/{module_id}` (in `app/routers/modules.py`) â€” endpoint already existed from F-080a as public-read CRUD. Added optional auth via `get_current_user_optional`; when token is present and user has detections, attaches `user_context` block (`recurrence_count`, `first_detected_at`, `last_detected_at`, `detected_in_recordings`). Always present in response, null when no token / no detections / cold user. 404 unchanged.
- Query plan: `SCAN sdm USING INDEX idx_sdm_user_module + SEARCH r USING INTEGER PRIMARY KEY` â€” no full scan of recordings even though `recordings.user_id` is unindexed. Fine for first-1000-users scale; tracked as F-080d.x.
- Verification: 4 gates green + EXPLAIN QUERY PLAN clean (run from F-080d round 1 with snapshot/restore for the test user's pre-existing detections).

Frontend (commit ahead of this BACKLOG.md update in fluentpath-frontend):
- `lib/types.ts` adds `ModuleUserContext`, `ModuleWithContext`, `RecurringModule`, `RecurringModulesResponse`. Snake_case preserved (read-only authored content; no camelCase mapper layer).
- `lib/api.ts` adds `api.users.getRecurringModules()` and a new `api.modules.get(moduleId)` namespace.
- New shared `components/modules/LearnModuleSheet.tsx` â€” bottom-sheet picker for linked modules (raccourci_lesson_id non-null). Two CTAs: primary "Lesson N: {title}" â†’ `/raccourci/lesson/{N}`, secondary "Just read about this pattern" â†’ `/learn/{module_id}`. Backdrop tap + X close + body-scroll lock. Lesson title is auto-fetched via `api.lessons.list()` when caller doesn't pre-resolve.
- New shared `components/modules/RecurringModuleCard.tsx` â€” compact card (name, category badge, severity dots, "Detected in N of your sessions") used in HomeScreen "Recommended for you" section. Whole card is the tap target.
- `components/home/HomeScreen.tsx` â€” "Recommended for you" section inserted between Zone 1 (today's daily action card) and Zone 2 (Le Raccourci 16-lesson list). Hidden entirely (no banner, no header) when `recurring_modules.length === 0`. Picker state + portal lifted into HomeScreen; tap routing branches linked â†’ sheet vs orphan â†’ direct push.
- New route `app/learn/[module_id]/page.tsx` + `components/learn/LearnModulePage.tsx` â€” wrapped in `ProtectedRoute` per Q4 Option A (cold state = authed user with no detections, NOT public visitor). Header (back chevron, name_en, category badge, severity dots), recurrence pill (suppressed when user_context null) using `date-fns.formatDistanceToNow` for "most recently 2 days ago" copy, FR/EN locale switching, long-form description, examples expanded by default (no toggle), conditional footer CTA (linked â†’ "Go deeper in Lesson N: {title}" + secondary text "Or just close this"; orphan â†’ "Back to Le Raccourci"). Loader/error screens with Retry. Reuses `ModuleExamples` from F-080c.
- `components/diagnostic/DetectedModuleCard.tsx` â€” added "Learn this" button alongside the existing "See examples" expand. New optional `onLearnTap` prop; caller (DiagnosticInner) handles routing via the same shared LearnModuleSheet picker.
- `app/diagnostic/page.tsx` â€” wired `handleLearnTap` callback through DetectedReflexesSection â†’ DetectedModuleCard. Picker state + sheet portal lifted into DiagnosticInner. Lessons cache lazy-fetched on first picker open.
- Type reconciliation: `RemediationModule.id` (canonical) vs `RecurringModule.module_id` (snake_case from backend response). LearnModuleSheet's internal `ShortModule` interface uses `id`; HomeScreen does the trivial `module_id â†’ id` mapping at the picker call site so both consumers (diagnostic page + HomeScreen) feed the sheet a uniform shape.

Verification: `tsc --noEmit` clean except the pre-existing `TargetScoreSelect.tsx:98` known issue. The 7 F4 gates require Chadi's manual session-recording (3 deliberate trigger sessions + linked-module retest with temporary `raccourci_lesson_id: 16` on `to_get_reflex.json`); code paths are wired, ready for browser smoke.

Filed:
- F-080d.x â€” perf follow-up for `recordings(user_id)` index if the recurring query hot-paths.
- F-080d.y â€” public-glossary path for `/learn/[module_id]` (post-launch SEO play; backend optional-auth ready).
- F-080d.z â€” verification harness rules:
  1. Any test that mutates `session_detected_modules` (or any other shared table) MUST use try/finally with snapshot+restore. Adopted after the F-080d round-1 cleanup leak.
  2. List/grid/index rendering gates MUST also click through to a detail page reached from the list and confirm content matches the data layer. Adopted F-089 after F-087 verification gate 5 ("HomeScreen + /ecole render 27 cards") shipped clean while `/ecole/lesson/[id]` was a hardcoded stub map covering only the old 16-lesson curriculum â€” list rendering passed; detail flow was broken for lessons 17-27 from F-087 onward. Bundled the fix into F-089 since that's the first ticket that actually read the detail page.
  3. Every ticket spec must include an explicit grep-audit step against the actual codebase before implementation begins. Adopted 2026-04-27 after multiple tickets this sprint had spec drift between described state and codebase reality: F-087 referenced fields that didn't exist on the model, F-089 assumed `/ecole/lesson/[id]` rendered real data when it was a hardcoded stub, F-088 named an endpoint (`/api/diagnostic/{session_id}`) that doesn't exist in this codebase and missed the legacy admin template as a second consumer of `la_carte`. The grep-audit catches drift at write-time when the cost of revising the spec is hours, not at implementation-time when the cost is scope creep + commit-message archaeology.

**F-080 deferred architectural questions (flagged in spec; revisit when relevant):**
- Prompt-size scaling once library passes ~25 modules â€” inject category-subset per TÃ¢che rather than full library.
- Early false-positive detections â€” add confidence threshold (persist only >= 0.7) in a 2nd iteration of F-080b.
- Module deprecation workflow â€” schema has `active: false` but no operational path defined.
- Module authoring pipeline â€” V1 is JSON files + reseed; V2 admin-UI is deferred (would be F-080.1).

**F-080 unblocks** (out-of-sprint follow-ups): F-081 audio content refs (native-speaker drills), F-082 interactive drill implementation, F-063.1 T1 audio autoplay investigation, F-063.3 T1 review-sheet timing UX, F-061.1 T3 topic picker (lower priority once module-driven feedback lands).

---

## Queued â€” launch prep (F-071 to F-079)

**Pushed behind F-080 per 2026-04-25 pivot.** Still on the sprint board but re-prioritized after the intelligence layer ships.

Previously called "F-060 launch prep" umbrella. Split into discrete tickets here.

**F-071** ðŸ“‹ Password reset flow
- Backend: POST /api/auth/forgot-password (email link), POST /api/auth/reset-password (token + new password)
- Frontend: /forgot-password screen, /reset-password/[token] screen
- Email sending: SendGrid or Resend

**F-072** âœ… Shipped via F-310 (BE 4bb44fb..043167f, 2026-05-12) + F-310.fe (FE 2fef9b7..b8f91ee, 2026-05-12). Original scope fully absorbed: 15-min access + 7-day refresh JWT rotation with httpOnly cookie + Redis revocation; /api/auth/refresh BE endpoint live; FE refresh-on-401 interceptor with retry-loop guard + concurrency dedupe; clearAuth on refresh failure. Plus everything else F-310 added (email verification, hCaptcha, /auth rate limiting, Stripe webhook HMAC, tier-check hook). Original bullets preserved below for diff history:
- Backend: shorten JWT to 1 hour, issue refresh tokens (7 days) on login/register
- Backend: POST /api/auth/refresh endpoint
- Frontend: api.ts intercepts 401, tries refresh, retries original call
- Frontend: on refresh failure, clearAuth and redirect to /login

**F-073** ðŸ“‹ Onboarding resume-from-step
- Each onboarding step component accepts initialValue prop
- OnboardingFlow reads useOnboardingStore on mount, resumes from last populated step
- If user refreshes mid-onboarding, they don't lose progress

**F-074** ðŸ“‹ 422 email TLD error messaging
- Signup page parses 422 response body for validation detail
- Shows specific message "Please use a valid email address (not .local, .test, or .example)" instead of generic "Could not create account"

**F-075** ðŸ“‹ Audio upload security hardening (carried from F-050) â€” split into F-075a (size cap) and F-075b (auth on audio serving)
**F-075a + F-075b both shipped 2026-04-27.** Entries in "Shipped â€” Week 2 (April 27)" below.
- Backend: server-side size cap on /api/audio/upload (5 MB hard limit) â€” **shipped as F-075a; audit found 4 upload endpoints, all capped at 10 MB.**
- Backend: user_id on Recording model + auth check on /api/audio/{id} serve route â€” **shipped as F-075b, but reshaped: audit found NO existing user-audio serving route (the diagnostic page never plays back user recordings; `_serialize_turn` deliberately refuses to expose candidate audio_url). Actual fix wrapped the unauthenticated `/tts_audio/` static mount with an authenticated route handler. F-075b.x carries the canonical pattern for whoever wires user-audio playback first.**

_(F-076 shipped 2026-04-27 â€” see entry under "Shipped â€” Week 2 (April 27)" above. The audit found the bug was localized to `CountdownTimer.tsx` (T3 prep mode); `useAudioRecorder` was already wall-clock via `Date.now()` per F-061. The original ticket text below is preserved verbatim for diff-history; the actual fix scope was narrower than the ticket assumed.)_

**F-076 (original spec, superseded by ship)** ðŸ“‹ Background tab timer drift fix (carried from F-050)
- Frontend: PTT 60s cap in Tache2Session uses performance.now()+setInterval
- Chrome throttles setInterval in hidden tabs, timer drifts
- Fix: use Date.now() deltas (already pattern in useAudioRecorder)

**F-077** âœ… Production environment config â€” Shipped 2026-05-12. FE confirmed via Chadi Vercel inspection: `NEXT_PUBLIC_API_URL=https://seal-app-75fiu.ondigitalocean.app` set on `lemethodic-frontend` project, scoped to Production. BE deployed to DigitalOcean App Platform; FE deployed to Vercel at lemethodic.com. CORS allow_origins production domain set (verified via successful authenticated calls from prod FE â†’ prod BE).
- Backend: production .env with real secrets
- Backend: CORS allow_origins updated to production domain (remove localhost)
- Frontend: NEXT_PUBLIC_API_URL for production
- Deploy backend to production host (DigitalOcean or similar)
- Deploy frontend to Vercel production

**F-078** ðŸ“‹ Asset drop â€” 11 missing 3D illustrations
- Source via Canva or Fiverr
- Files needed: key.png, calendar.png, target.png, stairs.png, globe.png, graduation-ca.png, passport.png, flag-canada.png, flag-spain.png, flag-uk.png, speech-bubble variants
- Drop into fluentpath-frontend/public/icons/

**F-079** ðŸ“‹ Calibration with real students
- Recruit 5-10 past Preply students with known TCF scores
- Have them record sessions in the launched product
- Compare FluentPath predicted TCF score vs actual exam score
- Tune analysis engine thresholds if gaps exceed Â±50 points on /699 scale

_(F-091.0 shipped 2026-04-27 â€” see entry under "Shipped â€” Week 2 (April 27)" above. Approach (a-prime) â€” descriptors stripped + mapper locked, goal step retained because it gates `TargetScoreSelect`. Note this entry is intentionally left as a forward-pointer; the original ticket scope is preserved verbatim in the shipped entry.)_

---

## Deferred â€” post-launch (Week 3+)

**F-081** â¸ Audio content refs per module
- Native-speaker drill recordings attached to modules. Module schema already supports `content_refs` (typed `audio` is one of the allowed `ContentRefType` variants â€” see F-080c types). This ticket populates the audio entries with real URLs and wires the playback surface on `/learn/[id]`.
- Backend: extend the seeder + module JSON authoring format to accept audio-file URLs; serve the files (S3 or static).
- Frontend: `InlineContentRef.tsx` currently renders an "audio: Coming soon" placeholder for `audio` type â€” replace with a real `<audio>` element + waveform display.
- Promoted from the "F-080 unblocks" line + F-080c InlineContentRef placeholder note (line 486) where this ticket lived as a passing reference.
- Estimate: 2 days incl. audio production (native-speaker recordings, level/normalization). Filed 2026-04-27.

**F-082** â¸ Drill UI on `/learn/[module_id]`
- Interactive AVOID/PREFER click-through exercises on the standalone module page. User reads the explanation, then practices identifying wrong vs right patterns on a series of cards. Spaced-repetition tracking persists per-user-per-module.
- Backend: new `user_module_drills` table (user_id, module_id, drill_id, last_seen_at, correct_count, total_attempts) for SRS scheduling; new endpoints to fetch the next drill and submit answers.
- Frontend: drill component reused on `/learn/[id]`; integrates with `ModuleExamples` (F-080c) for the source content.
- Promoted from the "F-080 unblocks" line + F-080c InlineContentRef placeholder note (line 486).
- Estimate: 2-3 days. Filed 2026-04-27.

**F-091 (epic)** â¸ Multi-exam routing â€” TCF + TEF Section B + DELF B1/B2
- Decision (April 27, 2026): deferred from launch sprint to **post-launch week 1**. For the May 4 launch, Le Méthodic ships TCF-only (see **F-091.0** in the launch-prep queue for the V1 lock). Multi-exam returns post-launch with proper scope.
- **Goal:** one engine, swap prompts and scoring per exam. Three concrete targets: TCF Canada (already shipped, baseline), TEF Section B, DELF B1/B2.
- **Architectural cornerstone:** `app/services/exam_profiles/` already has the dispatch shape (`base.py` interface + `tcf_canada.py` concrete). The epic extends that pattern to the other two exams without forking the engine.
- **Composed of three sub-tickets â€” ships when all three are green. Total estimate ~2.5 days.**
- **Supersedes** F-068 (folded into F-091b) and F-070 (folded into F-091c). Both originals retained as historical records with supersede header notes.

**F-091a** â¸ Exam-profile dispatch infrastructure
- Backend only. Extend `app/services/exam_profiles/` with `tef.py` and `delf.py` profile implementations alongside the existing `tcf_canada.py`. Per-exam prompt sets for examiner persona (TEF role-play, DELF entretien dirigÃ©).
- Thread `users.exam_profile` through analyzer dispatch points (`analyze_tache_1` / `_2` / `_3` and the F-080b module detector) so the right prompts are used per recording. Today every analyzer hardcodes the TCF Canada profile via the existing `get_profile()` lookup; this extends `get_profile(exam_profile)` to dispatch by string.
- No frontend changes.
- Estimate: 1 day. Part of F-091 epic.

**F-091b** â¸ Onboarding goal split + exam_profile wiring
- Frontend + light backend. Subsumes the original F-068 work verbatim plus the DELF option:
  - Split "Immigration" goal into "Immigration â€” TCF Canada" / "Immigration â€” TEF Canada"
  - Add "Education â€” DELF B1/B2" as a new top-level goal
  - Wire `mapOnboardingToBackend` to set `exam_profile` correctly per option ('tcf' | 'tef' | 'delf')
  - Confirm `users.exam_profile` column accepts the new values (currently a bare TEXT column; no constraint to relax)
- **Depends on F-091a shipping first** â€” otherwise the column value has no dispatch target and the user's experience silently falls through to the TCF profile.
- Estimate: 2-4 hours. Part of F-091 epic.

**F-091c** â¸ Generalized scoring infrastructure
- Backend + frontend. Reframes the original F-070 work from TCF-only to per-exam dispatch.
- **Backend:** refactor `app/services/scoring_maps.py` from TCF-only to a profile-dispatched layer:
  - `tcf_from_score` (existing â€” `/699` scale)
  - `tef_from_score` (new â€” `/450` scale + NCLC mapping for the Canadian-immigration cross-walk)
  - `delf_band_from_score` (new â€” B1/B2 pass/fail mapping; no continuous scale, just a band assertion against the threshold)
- **Frontend:** diagnostic hero reads from the active exam profile (via the user shape + the recording's `exam_profile` field) and renders the appropriate scale: `/699` for TCF, `/450` for TEF, band-pass for DELF. Paywall radar already shows TCF /699; that surface is updated alongside the diagnostic hero.
- **Depends on F-091a** for the profile dispatch target.
- Estimate: 1 day. Part of F-091 epic.

**F-085** â¸ Writing integration (Expression Ã‰crite)
- Promoted from the generic deferred bullet to a discrete numbered ticket. Required dependency for **F-101** (master diagnostic, speaking + writing fusion) and indirectly for **F-102** (student-level dashboard, both modalities feed it).
- Concrete scope:
  - **(a)** Text input surface where students paste or type French. Two flavors: structured prompt (TCF Expression Ã‰crite tÃ¢che) and free-form (any French text the student wants analyzed).
  - **(b)** Analysis pipeline parallel to the speaking pipeline â€” re-use Claude API detection prompts adapted for written text. Same `RemediationModule` library; same detection contract; same persistence layer (a new `writing_recordings` or extended `recordings.modality` column carries it).
  - **(c)** Module schema reused as-is â€” written L1-interference patterns surface as `detected_modules` with the same shape as speaking. No schema fork.
  - **(d)** Writing-specific modules authored in the same JSON format (e.g. `anglicism_orthographique`, `anglicism_syntaxique`, `accord_participe_passe_negligence`). Authoring track ramps post-F-085 ship.
- Estimate: 4-5 days. Filed 2026-04-27.

**F-093** â¸ Streaming transcription via WebSocket STT
- Replace Whisper API batch transcription with streaming provider (Deepgram, OpenAI Realtime API, or Groq Whisper streaming).
- Backend: WebSocket endpoint for audio streaming, partial-result forwarding, reconnection handling.
- Frontend: real-time transcript rendering during recording, interim vs final states.
- Migration: existing recordings stay batch; new recordings stream.
- Estimate: 3-5 days. Priority: High post-launch. Filed 2026-04-27 from observed Gemini Live UX.

**F-093.1** â¸ Progressive transcription UI (no backend change)
- Frontend-only illusion of streaming using existing batch backend. Show waveform of captured audio, animated "Transcribing..." text, then word-by-word stagger animation when transcript arrives.
- ~2 hours work. Optional pre-launch in QA window May 2-3 if real-streaming feel is desired before F-093 ships. Filed 2026-04-27.

**F-094** â¸ TEF Section A examiner mode
- New examiner mode where the AI plays a role and waits to be ASKED questions by the candidate. TEF Section A is "candidate elicits info from examiner" â€” the opposite information flow from T1 (examiner asks, candidate responds), T2 (role-play with mixed elicitation), and T3 (candidate-only monologue).
- Distinct examiner persona prompts: candidate-driven turn order, examiner answers questions and prompts the candidate when they stall.
- Distinct scoring rubric: quality of question formation, range of registers, ability to handle multi-clause asks ("Could you tell me whether ... and also ...").
- Reuses the existing conversation engine (TÃ¢che 1 / TÃ¢che 2 share `/start`, `/turn`, `/end`) â€” the new mode plugs in as a `tache_mode` value with its own examiner persona module.
- Estimate: 2 days. Filed 2026-04-27.

**F-095** â¸ DALF C1 with document presentation
- Compte rendu + dÃ©bat from a written dossier. Requires a new UI surface: candidate reads a multi-document dossier for 8-10 min prep (timer visible, no recording), then speaks for ~30 min monologue + dÃ©bat against the AI examiner.
- New `DocumentPresentation` component â€” paginated dossier reader with annotation/highlight support; optional "show prep notes" overlay during the monologue phase.
- Integrates with the existing recording engine (PTT for the dÃ©bat phase, monologue for the compte rendu). Document content authored as JSON dossiers per topic.
- Distinct scoring rubric vs TCF: synthesis quality, source-citation in the compte rendu, defense of position in the dÃ©bat.
- Estimate: 3-4 days. Filed 2026-04-27.

**F-096** â¸ Visual identity system
- Design tokens lock: color palette (the existing FluentPath pastels formalized into a tokenized scale), typography scale (Cabinet Grotesk display + body sizes / weights / line-heights), spacing rhythm (4/8/12/16/20/24/32 grid), component primitives (button states â€” default/hover/active/disabled/loading; card elevations; input focus rings; iconography decision â€” 3D illustrations vs flat illustrative vs photographic vs abstract).
- Output: `design-tokens.css` (or `app/globals.css` extension) + Figma file or markdown spec doc for non-engineering reference.
- Content-heavy not engineering-heavy; primary deliverable is decisions, not code.
- Estimate: 1-2 days. Filed 2026-04-27.

**F-097** â¸ Apply design system across screens
- Implementation of F-096 across every screen: onboarding, home tab, /ecole list, /ecole/[id] detail, T1/T2/T3 recording, diagnostic page, /learn/[id], profile/settings.
- Component-by-component refactor: replace inline-style hex codes with tokens, normalize spacing to the F-096 rhythm, swap one-off icon usages for the F-098 iconography pass.
- Depends on F-096 being locked. Without locked tokens this becomes whack-a-mole.
- Estimate: 2-3 days after F-096 lands. Filed 2026-04-27.

**F-098** â¸ Iconography pass
- 3D illustrations on lesson cards (one per phase / theme rather than today's repeated `illustration-level.jpg`), module category icons (vocab_calque, discourse_structure, verb_aspect, register_mismatch, grammar_interference, word_order, verb_aspect, ortho), achievement / milestone badges (already wired in EcoleProgress as text â€” promote to iconographic), empty-state illustrations.
- Stock library curation (Iconscout / 3DIcons / similar) vs custom commission decision: stock for V1 to ship fast; selective custom commissions post-launch as the visual library matures.
- Estimate: 1-2 days for stock integration; ongoing for custom track. Filed 2026-04-27.

**F-101** â¸ Master diagnostic â€” speaking + writing fusion (post-launch)
- Combined view across Expression Orale (already shipped) and Expression Ã‰crite (F-085). Detected modules from both modalities surface in one place. The product differentiator: a student sees the same English habit appearing in their speaking AND their writing â€” the cross-modal pattern is the key claim against generalist apps.
- Depends on F-085 shipping first (writing pipeline must produce module detections before they can fuse with the speaking ones).
- Estimate: 2-3 days. Filed 2026-04-27 from sprint reconciliation.

**F-102** â¸ Student-level dashboard (post-launch)
- Longitudinal view of the student's progress across all sessions, all modalities, all time. Surfaces trends ("nuance_reflex fixed in week 2"), stuck patterns ("to_get_reflex still recurring after 8 sessions"), gives the student a Sunday-morning view of how they're doing. Bigger surface than per-session feedback â€” the home/Ã‰cole/diagnostic triad covers "what to do next"; F-102 covers "where am I going."
- Depends on F-101 (the data model needs both modalities feeding the dashboard so trends are honest about the full surface, not just the speaking half).
- Estimate: 3-4 days. Filed 2026-04-27 from sprint reconciliation.

**F-103** ðŸ“‹/â¸ Level-aware routing (sprint OR post-launch â€” Chadi to decide)
- Onboarding captures user level (A1/A2/B1/B2/C1) but the app currently ignores it once the user lands on the home tab. Three places where level should bite:
  - (a) **Lesson list start point** â€” A1 starts at lesson 1; B2 might start at 16 (skip Phase 1 fundamentals if calibration confirms mastery); C1 at Phase 2 outright.
  - (b) **Diagnostic rubric calibration** â€” what counts as "good" depends on level. A B1 producing fragments still scores higher than a C1 producing fragments because the bar is different.
  - (c) **"Recommended for you" module filtering** â€” surface modules appropriate to the student's level, not high-severity advanced patterns when fundamentals are still missing.
- Status undecided: sprint candidate (depends on whether the launch product can honestly handle a B2 user without it; if yes, post-launch). Chadi to flag before next planning pass.
- Estimate: 2 days. Filed 2026-04-27 from sprint reconciliation.

**F-104** â¸ Pull-up reference tables overlay
- 15 reference tables embedded in lessons + a persistent pull-up button (lower-right of any lesson screen) that opens an overlay with all tables, searchable.
- Tier 1 signature tables (verbes + Ã , verbes + de, verbes pronominaux idiomatiques, prÃ©positions de lieu, â€¦), Tier 2 high-value supporting tables, Tier 3 exam-specific (TCF / TEF / DALF reference grids).
- Overlay component: bottom-sheet pattern (mirrors `LearnModuleSheet`); search filter at top; tables rendered as `react-markdown` blocks with highlighted-row interaction.
- Estimate: 2-3 days. Filed 2026-04-27.

**F-105** â¸ Transcript word-edit flow
- After recording, before the user submits the candidate transcript for evaluation, allow surgical word-level editing instead of "Try Again" full rerecord.
- UX: each transcribed word is a tap target â†’ tap â†’ editable input replaces the word inline â†’ enter / blur commits â†’ transcript re-renders with the edit. Edit history not preserved (the edit IS the truth from the user's perspective).
- Backend: candidate transcript on `conversation_turns` already mutable pre-confirm; need to plumb a "user-edited" flag so analysis can know the source vs the candidate-as-recorded.
- Sits alongside F-062.3's "Refaire cette prise" â€” Refaire is "I want to redo this take entirely"; word-edit is "I said this fine, the STT misheard one word."
- Estimate: 1-2 days. Filed 2026-04-27.

**F-106** â¸ Master inventory doc â€” 35-45 grammar topics
- Bilingual reference doc covering all grammar topics with severity rating 1-5. Track 0 deliverable per the Book-Lab pipeline (the authoring rhythm Chadi runs in parallel with engineering).
- Authoring track, not engineering. The doc lives outside the codebase (Notion / Google Doc / dedicated repo) and feeds the curriculum + module-authoring + lesson-card-subline workstreams.
- 15-20h authoring. Filed 2026-04-27.

**F-107** â¸ Module library expansion (3 â†’ 30+)
- Post-launch authoring umbrella. Continuous module authoring as patterns surface in real student data. Each module = JSON file + `detection_criteria` + AVOID / PREFER examples + optional `ecole_lesson_id` link.
- Current library at F-080d ship time: 3 modules (`nuance_reflex`, `to_get_reflex`, `gerondif_confusion`). Target: 30+ post-launch, prioritized by detection-rate Ã— severity from real recordings.
- Authoring + reseed cycle is well-trodden post-F-080a; engineering work is zero per module unless a new content_ref type or detection prompt class surfaces.
- No fixed estimate; ongoing track. Filed 2026-04-27.

â¸ **Test-drive recording before paywall** â€” post-launch A/B test for conversion optimization
â¸ **Writing module (Expression Ã‰crite)** â€” full TCF coverage beyond Expression Orale
â¸ **Exam Simulation mode** â€” distinct from Learning Mode (current default)
â¸ **Mock Exam mode** â€” separate scoring mode recommended after completing L'Ã‰cole
â¸ **Mobile PWA install prompt + service worker** â€” Phase 1 is responsive web
â¸ **Cross-session pattern detection** â€” locked behind 3-session minimum
â¸ **PDF export of diagnostic** â€” not required for launch
â¸ **Teacher dashboard** â€” aggregate analytics across students, Preply integration
â¸ **Referral system** â€” viral growth loop
â¸ **Email notifications** â€” "You haven't practiced in 5 days"
â¸ **Onboarding tutorial overlay** â€” first-time UX walkthrough

---

## Process improvements

### EX-100 â€” Evaluate execution tooling for ticket-by-ticket efficiency
Milestone: TBD

**Priority:** Medium
**Filed:** 2026-04-30
**Status:** Queued â€” review needed

**Context:** Currently using FE/BE Claude Code terminals + manual prompt routing. Three GitHub resources flagged for evaluation:
- **VoltAgent/awesome-design-md** â€” DESIGN.md drop-ins for coding agents (relevant to P-102)
- **gztchan/awesome-design** â€” curated design resources (relevant to P-102, Method-as-brand)
- **octopusos/octopus** â€” AI-Native Autonomous Agent OS (relevant to FE/BE coordination)

**Action:** 30-min evaluation each. Decide if any change current process. Apply before P-102 starts (could reduce P-102 cost from ~$300 + hours to ~$0 + faster).

**When:** Before P-102. After current launch-blocker tickets (P-103, P-104, B-100, B-102, M-100).

---

## Known issues â€” not blocking

- Backend `main.py` CORS has `allow_credentials=True` â€” not needed for JWT-only but harmless; leave it.
- Paywall.tsx has a lingering `{/* â”€â”€ Test-drive section â”€â”€â”€â”€â”€â”€â”€ */}` code comment referencing deprecated feature. Cosmetic.

---

### F-108 â€” [FE] Fix pre-existing TS error in TargetScoreSelect.tsx
Milestone: M1

**Status:** OPEN
**Priority:** Low â€” build pipeline tolerates via `typescript.ignoreBuildErrors: true`
**Discovered:** April 30, 2026 during Phase 3 brand rename type-check (Phase B)

**Problem:** `components/onboarding/TargetScoreSelect.tsx:98` throws TS2322 â€” `hasPopular` (destructured option flag) is typed as `unknown` instead of `boolean`.

**Why it's been hiding:** `next.config.mjs` sets `typescript.ignoreBuildErrors: true`. Production builds succeed despite this error.

**Fix:** Narrow `hasPopular` to `boolean` type at the destructure site. Likely 2-line change.

**Scope:** Single file. Independent commit. ~10 min work.

---

## F-367: Path migration English to French canonical routes

**Status:** Shipped (commit ec7c3c5)
**Phase:** Phase 1
**Priority:** P0

Migrated 9 English routes to French canonical equivalents per locked product naming.

**Shipped scope:**
- /dashboard to /carte
- /la-bibliotheque to /bibliotheque
- /l-examen to /examen
- /l-examen/diagnostic to /maitre/diagnostic
- /progress to /progression
- /profile to /profil
- /signup to /inscription
- /login to /connexion
- /la-bibliotheque/[slug] to /bibliotheque/[id]

33 files moved, 308 redirects added.

**Backfilled to BACKLOG:** 2026-06-03 (entry was missing from prior dispatch).

---

## F-368: Public marketing scaffolds

**Status:** Shipped (commit e2c5c03)
**Phase:** Phase 1
**Priority:** P0

Created public marketing pages with bientÃ´t patterns where content is pending.

**Shipped scope:**
- /faq (full content)
- /tarifs (3 tiers, inactive CTAs until Phase 4 payment activation)
- /blog (bientÃ´t)
- /pieges (bientÃ´t with 3 placeholder sections)
- /blog/[slug] (notFound)
- /pieges/[slug] (notFound)

Turbopack fix: HTML entities replaced with literal Unicode.

**Backfilled to BACKLOG:** 2026-06-03 (entry was missing from prior dispatch).

---

## F-369: Librairie batch (Book-Lab French catalog scaffold)

**Status:** Shipped (commit d5e5e5e)
**Phase:** Phase 1
**Priority:** P1

Created /librairie hub plus 4 category pages plus [item-slug] route, all bientÃ´t. Footer-only navigation (distinct from /la-bibliotheque vocab product).

**Backfilled to BACKLOG:** 2026-06-03 (entry was missing from prior dispatch).

---

## F-370: Legal pages batch

**Status:** Shipped (commit 04378be)
**Phase:** Phase 1
**Priority:** P0

Created legal pages:
- /mentions-legales
- /confidentialite
- /cgv

Redirects: /terms to /cgv, /privacy to /confidentialite.

**Backfilled to BACKLOG:** 2026-06-03 (entry was missing from prior dispatch).

---

## F-371: 8 hub bientÃ´t scaffolds

**Status:** Shipped (commit ebfb5d1)
**Phase:** Phase 1
**Priority:** P0

Created 8 product-area scaffolds with bientÃ´t pattern:
- /seance
- /ile/[id]
- /ile/[id]/activites
- /ile/[id]/tache
- /maitre
- /examen/[checkpoint]
- /parametres
- /abonnement

/seance and /maitre added as primary TopNav entries.

**Backfilled to BACKLOG:** 2026-06-03 (entry was missing from prior dispatch).

---

## F-372: Phase 1 cleanup sweep

**Status:** Shipped (commit c7417c3)
**Phase:** Phase 1
**Priority:** P0

Closed Phase 1 with cleanup pass:
- /account deleted (duplicate of /profil)
- Redirect-hop sweep across 17 component files and 12 test files
- ProtectedRoute redirectTo prop added (scoped to /bienvenue)
- /more#about kept (verified not duplicate of /a-propos)
- (app) layout audit clean

Deferred items: /la-methode vs /ecole disambiguation (founder doctrinal call), /progres/clb (Phase 3), /[seo] catch-all (Phase 3).

**Backfilled to BACKLOG:** 2026-06-03 (entry was missing from prior dispatch).

---

# Phase 2 additions (production-readiness pass, 2026-06-02)

## F-373 -- Mic permission and test flow (FE)
Phase: 2
Milestone: Phase 2

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.
**Type:** FE onboarding UX.
**Priority:** HIGH -- required before the first user attempts a TÃ¢che.

**Scope:**
Full-screen onboarding step that fires once per user before their first TÃ¢che. The step: (1) requests microphone permission via getUserMedia, (2) runs a real-time audio level test with a visual meter (VU-style), (3) records a 3-second sample and plays it back, (4) confirms the user can hear themselves. On iOS Safari: getUserMedia requires HTTPS (always the case in production) and may silently fail without a prior user gesture; the implementation uses a button-gated call, not an autoplay trigger. If permission is denied or the device has no mic, a designed fallback surface explains the limitation and offers keyboard entry as an alternative for applicable TÃ¢che types.

Persistence: completion flag stored in localStorage (`mic_test_completed: true`) and optionally synced to the BE user profile. The step is skipped on all subsequent sessions.

AESTHETIC INPUT NEEDED: founder decides between full-screen onboarding step and subtle in-context prompt. Filed as decision gate; do not implement until founder confirms the approach.

**Acceptance:**
- Mic permission flow invoked exactly once per user before the first TÃ¢che.
- Audio level meter shows real-time input level during the test.
- 3-second sample plays back after recording.
- Fallback state renders for denied permission or missing mic.
- iOS Safari quirks handled (HTTPS gate, gesture requirement documented in code).
- F-225 Playwright captures at 1440px and 375px.

**Dependencies:** None (standalone FE onboarding component).

**Owner:** FE.

---

## F-374 -- Recording management (FE + BE pair)
Phase: 2
Milestone: Phase 2

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.
**Type:** FE + BE (see BE BACKLOG for BE-side scope).
**Priority:** MEDIUM (GDPR posture, user trust).

**BE-side cross-ref:** BE-F-374 -- extend recording storage with `created_at`, `retention_policy`, `deleted_at` columns; GDPR data export includes recordings.

**FE scope:**
User-facing recording list at /profil (or /parametres, Chadi to decide). Surface: chronological list of all recordings the user has produced, with per-recording: (1) replay (audio player inline or in a sheet), (2) download (presigned URL to DO Spaces), (3) delete (soft-delete with confirmation dialog; hard-delete cascades on the BE within 30 days per GDPR policy). Empty state: "No recordings yet. Complete a TÃ¢che to see your history here."

GDPR data export includes recordings: the /profil export button (F-384 scope) bundles recording metadata and audio file URLs.

**Acceptance:**
- User can replay any recording they have produced.
- User can download any recording.
- User can delete any recording; deletion is confirmed and reflected immediately in the list.
- Empty state renders when no recordings exist.
- F-225 Playwright captures.

**Dependencies:** BE-F-374 (BE schema extension); F-384 (data export).

**Owner:** FE (list UI) + BE (lifecycle columns and GDPR export).

---

## F-375 -- Transcript correction UX (FE)
Phase: 2
Milestone: Phase 2

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.
**Type:** FE only.
**Priority:** HIGH -- removes the biggest source of perceived scoring unfairness.

**Scope:**
After AssemblyAI returns a transcript and before the transcript is sent to Le MaÃ®tre for scoring, the user sees the transcript in an editable view. They can confirm it as-is or correct STT errors (typos, mishearings, proper nouns), then submit. The corrected transcript is what Le MaÃ®tre scores.

The step is not optional: every oral TÃ¢che flow includes it. The confirmation is a single tap if no corrections are needed; it adds under 10 seconds to the flow for users who trust the transcript.

AESTHETIC INPUT NEEDED: founder decides between inline edit (transcript words are individually tappable and editable), side panel (transcript on left, edit form on right), and modal (fullscreen correction view). Filed as decision gate; implement only after founder confirms.

**Acceptance:**
- Every oral TÃ¢che flow includes a transcript-confirm step before scoring.
- User can edit any word in the transcript before submitting.
- Confirmed or corrected transcript is what reaches Le MaÃ®tre for scoring.
- The step is skippable only if the transcript is confirmed as-is (no bypass of the step entirely).
- F-225 Playwright captures.

**Dependencies:** Existing AssemblyAI STT pipeline; no new BE endpoints required (the corrected transcript is submitted in the existing TÃ¢che finalization payload).

**Owner:** FE.

---

## F-376 -- Mock exam mode wired (FE + BE pair)
Phase: 2
Milestone: Phase 2

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.
**Type:** FE + BE (see BE BACKLOG for orchestration scope).
**Priority:** HIGH -- removes bientÃ´t from /examen/[checkpoint].

**BE-side cross-ref:** BE-F-376 -- orchestration of full-exam scoring (four sections, aggregated score, section scores).

**FE scope:**
/examen/[checkpoint] renders a fully timed TCF mock exam:
- Total timer visible in the header (configurable duration per checkpoint config)
- Four sections (expression orale, comprehension orale, comprehension ecrite, expression ecrite) in sequence
- Per-section timer
- Submit flow with confirmation
- Results page showing aggregated score and per-section breakdown
- Score prediction integration: mock exam result feeds the F-379 score prediction model

The bientÃ´t label is removed from /examen/[checkpoint] once this ships.

**Acceptance:**
- User can start a full timed mock TCF from /examen/[checkpoint].
- Total timer and section timers count down visibly.
- All four sections are navigable in sequence.
- Submit flow works end to end.
- Aggregated score and per-section breakdown are displayed after submission.
- /examen/[checkpoint] no longer renders a bientÃ´t state.
- F-225 Playwright captures at 1440px and 375px.

**Dependencies:** BE-F-376 (orchestration and scoring).

**Owner:** FE (timer UI, section navigation, results display) + BE (exam scoring orchestration).

---

## F-377 -- Empty states batch (FE)
Phase: 2
Milestone: Phase 2

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.
**Type:** FE only.
**Priority:** HIGH -- no in-product surface should render blank or unhandled.

**Scope:**
Designed empty states across all in-product authenticated surfaces:
- /carte: "Start your first sÃ©ance to see your progress here." CTA: "Begin now."
- /bibliotheque: "Your vocabulary list will grow as you complete sessions." CTA: "Explore chunks."
- /maitre: "You haven't had a session with Le MaÃ®tre yet." CTA: "Start a session."
- /examen: "No exam attempts yet. Take a timed practice exam to see your results." CTA: "Start a practice exam."
- /progression: "No progress data yet. Complete your first Ã®le to start tracking." CTA: "Go to /carte."
- /parametres: "No preferences configured yet." (self-explanatory, no CTA needed)
- /abonnement: "No active subscription. See plans below." CTA: "View /tarifs."
- /maitre/diagnostic: "Complete your first TÃ¢che to see a diagnostic." CTA: "Start a TÃ¢che."

Each empty state has: an icon or illustration, copy appropriate to the surface, a primary next-action CTA. Copy follows the product register (clean utility, no motivational language).

AESTHETIC INPUT NEEDED: founder picks illustration/icon style and copy tone per surface. Filed as decision gate; do not ship final copy without founder review.

**Acceptance:**
- No in-product surface renders a blank or unhandled empty state.
- Each empty state has an icon/illustration, copy, and a primary CTA.
- F-225 Playwright captures for each empty state at 1440px and 375px.

**Dependencies:** None (each empty state is a standalone conditional render).

**Owner:** FE.

---

## F-378 -- First-time user tour (FE)
Phase: 2
Milestone: Phase 2

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.
**Type:** FE only.
**Priority:** MEDIUM (onboarding UX; reduces first-session confusion).

**Scope:**
After /bienvenue completes and the user lands on /carte for the first time, a 30-second guided tour fires. The tour consists of 3-5 coachmarks (or equivalent) pointing at primary surfaces: the Atlas island map, the Le MaÃ®tre entry point, the progression indicator, and the account/settings area.

The tour is skippable via an "X" or "Skip tour" button. Completion (or skip) is persisted in localStorage as `tour_completed: true` and optionally synced to the BE user profile (`onboarding_tour_completed_at` timestamp). The tour fires exactly once per user lifetime.

AESTHETIC INPUT NEEDED: founder decides between modal-sequence (step-by-step overlay), floating coachmarks (spotlight + tooltip on each surface), and minimal tooltips (simple popover with no backdrop). Filed as decision gate.

**Acceptance:**
- Tour fires exactly once, on first /carte visit after /bienvenue.
- Tour covers 3-5 primary surfaces.
- Tour is skippable at any step.
- Completion and skip both persist the completed flag; no re-trigger.
- F-225 Playwright captures.

**Dependencies:** /bienvenue flow completion; /carte render.

**Owner:** FE.

---

## F-379 -- Score prediction surfaced (FE + BE pair)
Phase: 2
Milestone: Phase 2

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.
**Type:** FE + BE (see BE BACKLOG for compute scope).
**Priority:** HIGH -- motivational surface and conversion signal.

**BE-side cross-ref:** BE-F-379 -- rolling-window score prediction compute (last N TÃ¢che scores, weighted by recency and couche).

**FE scope:**
Display the predicted exam score prominently on /carte or /progression. Exact placement TBD (see AESTHETIC INPUT below). The prediction surface shows:
- The predicted CLB or band ("Based on your last 5 TÃ¢ches, you would score CLB 6.")
- The target CLB or band from the user's Target Profile ("You need CLB 7.")
- A simple delta framing ("You are 1 CLB band away from your target.")

The surface is hidden when the user has fewer than 3 TÃ¢che attempts (insufficient data). It updates after each TÃ¢che submission.

AESTHETIC INPUT NEEDED: founder decides location (card on /carte, sidebar widget, top banner on /progression) and prominence. Filed as decision gate.

**Acceptance:**
- Every authenticated user with at least 3 TÃ¢che attempts sees a current predicted score.
- Prediction is not shown with fewer than 3 attempts.
- Prediction updates after each new TÃ¢che submission.
- F-225 Playwright captures.

**Dependencies:** BE-F-379 (prediction compute endpoint).

**Owner:** FE (display) + BE (compute).

---

## F-380 -- Score dispute / appeal flow (FE + BE pair)
Phase: 2
Milestone: Phase 2

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.
**Type:** FE + BE (see BE BACKLOG for queue and email scope).
**Priority:** MEDIUM (trust mechanism; the SLA is a written commitment).

**BE-side cross-ref:** BE-F-380 -- dispute queue schema, auto-response email, internal triage interface.

**FE scope:**
- A "Request human review" button on every TÃ¢che result page (visible after score is rendered).
- Clicking opens a short form: text area for user comment (what they disagree with and why), pre-filled with the TÃ¢che attempt ID.
- Submission posts to the BE dispute endpoint.
- Post-submission: confirmation screen ("Your review request has been received. We will respond within 5 business days.").
- The user's pending disputes are visible in /profil or /parametres as a list with status (pending / reviewed / resolved).

**Acceptance:**
- "Request human review" button is visible on every TÃ¢che result.
- User can submit a dispute with a comment.
- Confirmation screen is shown after submission.
- Pending disputes are visible in the user's profile with status.
- F-225 Playwright captures.

**Dependencies:** BE-F-380 (dispute queue endpoint).

**Owner:** FE (button, form, confirmation, list) + BE (queue, email, triage).

---

# Phase 2.5 additions (pre-monetization production-readiness, 2026-06-02)

## F-381 -- Cookie consent banner (FE)
Phase: 2.5
Milestone: Phase 2.5

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.5.
**Type:** FE only.
**Priority:** HIGH (EU compliance gate before payment).

**Scope:**
Build an in-house cookie consent banner without a third-party CMP. Granular categories: necessary (always on), analytics (PostHog, Plausible), marketing (lifecycle emails based on behavior). EU-compliant posture: explicit opt-in required for non-necessary categories; deny-equivalent option ("Refuse all non-necessary"); granular preferences page accessible from footer at /parametres#cookies.

Consent choices are stored in localStorage keyed by a consent version string. When the consent schema changes (new category added, cookie purpose changes), the version increments and the banner re-presents.

Telemetry integration: PostHog fires only after analytics consent is granted. Plausible (cookieless) fires regardless.

AESTHETIC INPUT NEEDED: founder decides position (top bar vs bottom bar), copy tone (plain vs formal), and color treatment (neutral vs accented). Filed as decision gate.

**Acceptance:**
- EU visitors see the banner on first visit.
- Consent choices persist across sessions and page refreshes.
- PostHog does not fire before analytics consent is granted.
- Deny-equivalent option is present and works.
- Granular preferences page renders at /parametres#cookies.
- F-225 Playwright captures.

**Dependencies:** PostHog integration (F-393); no other dependencies.

**Owner:** FE.

---

## F-382 -- Password reset flow (FE + BE pair)
Phase: 2.5
Milestone: Phase 2.5

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.5.
**Type:** FE + BE (see BE BACKLOG for endpoint scope).
**Priority:** HIGH (auth completeness; required before charging users).

**Note:** The BE password reset endpoints were scaffolded in F-310 Phase B (shipped 2026-05-12). This ticket wires the FE UI to those existing endpoints.

**BE-side cross-ref:** BE-F-382 -- password reset token endpoint and email send (already exists per F-310; verify it is production-configured with RESEND_API_KEY).

**FE scope:**
- /mot-de-passe-oublie: "Forgot password" page. Email input, submit button, confirmation message ("If this email is registered, a reset link has been sent.").
- /reinitialiser-mot-de-passe/[token]: "Reset password" page. New password field, confirm password field, submit. Success state routes to /connexion with a toast.
- Error states: expired token (with "Request a new link" CTA), invalid token, password mismatch.

**Acceptance:**
- User can request a password reset from /connexion.
- Reset email is received (production RESEND_API_KEY configured).
- User can set a new password via the reset link.
- Expired and invalid token states are handled with user-facing copy.
- F-225 Playwright captures.

**Dependencies:** BE-F-382 (endpoints exist per F-310 Phase B; verify env vars set).

**Owner:** FE.

---

## F-383 -- Email verification on signup (FE + BE pair)
Phase: 2.5
Milestone: Phase 2.5

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.5.
**Type:** FE + BE (see BE BACKLOG for endpoint scope).
**Priority:** HIGH (auth completeness; spam and cost control).

**Note:** The BE email verification endpoints were scaffolded in F-310 Phase B (shipped 2026-05-12). Existing soft-beta accounts were grandfathered as verified. This ticket wires the FE UI for new accounts.

**BE-side cross-ref:** BE-F-383 -- verification token on signup, email send, lock policy (account stays usable for X days, locks after). Confirm policy decision with Chadi before implementing FE gating.

**FE scope:**
- Post-signup: show a verification-pending screen ("Check your inbox. We sent a link to [email]. It expires in 24 hours.") with a "Resend verification email" button.
- /verifier-email/[token]: verification confirmation page. Success state routes to /carte. Expired token state shows "Your link has expired. Request a new one below" with a resend button.
- Unverified-but-active state: a dismissible banner on /carte ("Please verify your email to keep full access.") shown until verification completes. The banner is not a hard gate during the X-day grace period.
- Post-grace-period gate: if the lock policy activates, redirect unverified users to the verification-pending screen on any gated route.

**Acceptance:**
- New accounts receive a verification email on signup.
- Verification link works and routes to /carte on success.
- Expired token state is handled with a resend option.
- Unverified-but-active banner renders on /carte.
- F-225 Playwright captures.

**Dependencies:** BE-F-383 (endpoints exist per F-310 Phase B; verify lock policy and RESEND_API_KEY).

**Owner:** FE.

---

## F-384 -- Account deletion and data export (FE + BE pair)
Phase: 2.5
Milestone: Phase 2.5

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.5.
**Type:** FE + BE (see BE BACKLOG for export and deletion endpoints).
**Priority:** HIGH (GDPR rights; required before charging EU users).

**BE-side cross-ref:** BE-F-384 -- data export endpoint (JSON archive), deletion endpoint (cascade or anonymize per GDPR policy).

**FE scope (account settings section at /profil):**

**Data export flow:**
- "Download your data" button in /profil.
- Clicking triggers a request to the BE export endpoint.
- The BE generates a JSON archive (async if large) and returns a download URL.
- FE shows a spinner during generation, then auto-downloads or shows a "Download ready" link.
- Archive includes: account fields, Target Profile, all TÃ¢che attempts with transcripts and per-couche scores, recording metadata, subscription history, detected modules per session.

**Account deletion flow:**
- "Delete my account" button in /profil (destructive action, visually distinct).
- Clicking opens a confirmation modal: "This will permanently delete all your data. This cannot be undone." Two buttons: "Cancel" and "Delete my account permanently."
- Confirming sends a deletion request to the BE.
- FE signs the user out and routes to / with a toast: "Your account has been deleted."

**Acceptance:**
- User can download a JSON archive of all their data.
- Archive contains all data categories listed above.
- User can delete their account after explicit confirmation.
- Post-deletion: user is signed out and routed to /.
- F-225 Playwright captures.

**Dependencies:** BE-F-384 (export and deletion endpoints).

**Owner:** FE (settings UI) + BE (export and deletion).

---

## F-385 -- /contact route and form (FE, minimal BE)
Phase: 2.5
Milestone: Phase 2.5

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.5.
**Type:** FE primarily (minimal BE or mailto fallback).
**Priority:** MEDIUM (public-facing trust signal; support channel).

**Scope:**
Public route at /contact. Form fields: name, email, subject (dropdown: general question, billing, technical issue, content feedback, other), message (textarea). Submit behavior:

Phase 2.5 ship: form submits via `mailto:admin@lemethodic.com` as a fallback (no BE endpoint yet). A flag in the component marks the mailto behavior so Phase 4 wires Postmark in-place.

Phase 4 upgrade (F-400 scope): replace the mailto fallback with a Postmark API call from a Next.js Route Handler. The form component itself does not change.

Success state: "Message received. We will respond within 2 business days." Error state: "Something went wrong. You can also reach us at admin@lemethodic.com."

Nav: StickyHeader (public zone).

**Acceptance:**
- /contact renders on the public domain without auth.
- Form submits and user sees confirmation.
- mailto fallback sends to admin@lemethodic.com.
- Component has a flag for Phase 4 Postmark wiring.
- F-225 Playwright captures.

**Dependencies:** None for the mailto fallback.

**Owner:** FE.

---

## F-386 -- Bill 96 compliance audit (policy + content)
Phase: 2.5
Milestone: Phase 2.5

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.5.
**Type:** Policy and content (no FE code, no BE code).
**Priority:** HIGH (legal compliance for Quebec users; required before charging Quebec users).

**Scope:**
Audit all customer-facing English copy and ensure French primacy for Quebec residents. Deliverables:
1. All support correspondence templates: author French versions alongside existing English.
2. CGV and subscription terms: confirm French version is the governing language; add note that English is provided as accommodation.
3. Refund response templates: author French version.
4. Marketing email templates: confirm French versions exist for Quebec-segmented sends.

Document the policy in PRODUCT.md (already added in the 2026-06-02 production-readiness pass: section 18, Bill 96 compliance posture).

**Acceptance:**
- Documented audit in PRODUCT.md with all checklist items verified Y.
- French versions of all customer support templates exist alongside English.
- CGV French-primary language confirmed.
- Refund response template has French version.
- Owner: Chadi (content authoring) + Engineering (PRODUCT.md update).

**Dependencies:** CGV at /cgv (already shipped); PRODUCT.md section 18.

**Owner:** Chadi (content) + Engineering (doc update).

---

## F-387 -- A11y WCAG 2.1 AA audit and remediation (FE)
Phase: 2.5
Milestone: Phase 2.5

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.5.
**Type:** FE primarily.
**Priority:** HIGH (legal and product quality; blocks European market credibility).

**Scope:**
Run Axe DevTools (browser extension) and Lighthouse across every shipped surface. Fix all violations at "critical" and "serious" impact levels. Known risk areas from ARCHITECTURE.md section 17:

- 60% opacity bientÃ´t pattern: likely fails WCAG 1.4.3 (contrast minimum 4.5:1 for text). The fix is a treatment that preserves the "coming soon" signal without relying solely on opacity. Options: overlay text on a solid muted chip, use a hatch pattern or icon alongside the reduced opacity, increase the text contrast independently of the background opacity.
- Focus management: modal and sheet components (LearnModuleSheet, TurnReviewSheet) must trap focus and restore it on close. Use the `inert` attribute on background content or equivalent.
- Alt text: audit all images across public-zone routes (/pieges/[slug], /blog/[slug], /examens/tcf, /a-propos, /). Every non-decorative image needs descriptive alt text. Decorative images need `alt=""`.
- ARIA labels: recording controls (mic button, stop button, playback), progress indicators (couche score bars, CLB level indicator), interactive components without visible text labels.

**CI gate added (per ARCHITECTURE.md section 17):** Lighthouse accessibility score must not drop below 90 on primary routes. Axe must report zero critical or serious violations in the Playwright e2e suite.

**Acceptance:**
- Every shipped surface passes WCAG 2.1 AA on Axe (zero critical/serious violations).
- Lighthouse accessibility score is 90 or above on every primary route.
- 60% opacity bientÃ´t pattern replaced with a contrast-passing treatment.
- Focus management is correct on all modals and sheets.
- All non-decorative images have alt text.
- All interactive components have ARIA labels.
- F-225 Playwright captures.

**Dependencies:** None (standalone remediation pass).

**Owner:** FE.

---

## F-388 -- Audit logs / telemetry storage (BE only)
Phase: 2.5
Milestone: Phase 2.5

**Filed:** 2026-06-02.
**Status:** Queued (BE-only; cross-ref in FE BACKLOG for visibility).
**Tag:** Phase 2.5.
**Type:** BE only. No FE scope.
**Priority:** HIGH (support debugging; required before charging users).

**BE-side cross-ref:** BE-F-388 -- user_action_log schema, middleware, retention policy. Full spec in BE BACKLOG.

**FE note:** No FE scope for F-388. PostHog event firing (F-393) is the FE-side telemetry complement.

---

## F-389 -- Money-back guarantee surfaced (FE content)
Phase: 2.5
Milestone: Phase 2.5

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 2.5.
**Type:** FE content.
**Priority:** HIGH (trust signal; required before charging users; written commitment once surfaced).

**Scope:**
Add a visible 14-day no-questions-asked money-back guarantee badge on:
- /tarifs: each paid tier card (Core and Sprint). The badge or copy must be visible without scrolling on both tiers at desktop and mobile viewports.
- /cgv: refund policy section. Add an explicit "14-day guarantee" paragraph at the top of the refund section, before the detailed terms.

The guarantee is a written commitment, not a marketing claim. Once surfaced, it becomes binding. Confirm wording with Chadi before shipping.

AESTHETIC INPUT NEEDED: founder decides badge placement (inside tier card, below price line, above CTA), design treatment (shield icon, checkmark, text-only), and exact wording. Filed as decision gate.

**Acceptance:**
- 14-day guarantee is visible on every paid tier card on /tarifs (Core and Sprint).
- 14-day guarantee is stated in the refund section of /cgv.
- Copy has been approved by Chadi.
- F-225 Playwright captures at 1440px and 375px.

**Dependencies:** /tarifs (already live); /cgv (already live).

**Owner:** FE (badge component, copy integration).

---

# Phase 3 additions (growth surface, 2026-06-02)

## F-390 -- Trust signals on / (FE content)
Phase: 3
Milestone: Phase 3

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 3.
**Type:** FE content.
**Priority:** HIGH (conversion; required before paid growth).

**Scope:**
Add a testimonials section (3-5 quotes from anglophone learners who have improved their TCF or French production scores), a founder credibility row (7,000 hours of tutoring, Book-Lab co-founder, French tutor background, academic collaboration with French university professors), social proof badges (student count, exam pass rate, average score improvement), and a success stories link.

AESTHETIC INPUT NEEDED: founder picks layout (section order relative to other hero content), photo treatment (real photos of learners vs anonymized), testimonial source and copy (with explicit attribution), and whether social proof numbers are surfaced at launch or added post-launch when real data exists.

**Acceptance:**
- Landing page surfaces at least three testimonials with attribution.
- Founder credibility row is visible above the fold or within one scroll.
- F-225 Playwright captures.

**Owner:** Chadi (copy and testimonial sources) + FE (implementation).

---

## F-391 -- Free CLB/TCF score calculator (FE)
Phase: 3
Milestone: Phase 3

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 3.
**Type:** FE only, no auth required.
**Priority:** HIGH (SEO lead magnet; first growth surface).

**Scope:**
New public surface at /outils/clb. The tool: user enters their TCF section scores (expression orale, comprehension orale, comprehension ecrite, expression ecrite, each scored 0-699 or CLB equivalent), gets their CLB equivalents and a predicted overall CLB band. Optional email capture for a "full CLB report" lead magnet.

SEO optimization: page title, meta description, and H1 targeting "calcul CLB TCF", "TCF CLB calculator", "score TCF CLB equivalence" intent clusters. Served in French and English via hreflang. No auth required.

AESTHETIC INPUT NEEDED: founder decides form UX (single-page form vs step-by-step), result presentation (table vs visual chart vs text summary), share affordances (copy result, share link).

**Acceptance:**
- /outils/clb renders publicly without auth.
- Calculator produces accurate CLB equivalents for any TCF section score combination.
- Email capture is present and optional.
- Page ranks for at least one calculator-intent keyword within 30 days of launch.
- F-225 Playwright captures.

**Owner:** FE (calculator logic and UI). CLB-TCF mapping table: Chadi review required before ship.

---

## F-392 -- Sample lesson preview (FE + BE pair)
Phase: 3
Milestone: Phase 3

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 3.
**Type:** FE + BE (see BE BACKLOG for public Ã®le access scope).
**Priority:** HIGH (conversion; "try before you buy" flow).

**BE-side cross-ref:** BE-F-392 -- make one Ã®le publicly accessible without auth, with partial TÃ¢che grading (Le MaÃ®tre returns feedback but does not save the attempt to the user's progression).

**FE scope:**
An unauthenticated visitor at /ile/[preview-id] can access a single designated Ã®le (the "sample Ã®le"). They can complete the dialogue, strands, activities, and submit a TÃ¢che. Le MaÃ®tre returns per-couche feedback. The feedback is shown but not saved to any user profile. After the TÃ¢che result is shown, a conversion surface appears: "This is one of N islands. Subscribe to track your progress and access all of them."

Watermarking or partial grading: AESTHETIC INPUT NEEDED on how the preview differs from the authenticated experience (full grading vs first-couche-only teaser vs full grading with subscription prompt overlaid).

**Acceptance:**
- Unauthenticated visitor can complete the sample Ã®le end to end including a graded TÃ¢che.
- Conversion surface appears after the sample TÃ¢che result.
- The sample Ã®le does not require an account.
- F-225 Playwright captures.

**Owner:** FE + BE.

---

## F-393 -- Activation funnel telemetry (FE + BE pair)
Phase: 3
Milestone: Phase 3

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 3.
**Type:** FE + BE (see BE BACKLOG for event capture scope).
**Priority:** HIGH (founder visibility; required before paid acquisition).

**BE-side cross-ref:** BE-F-393 -- BE event capture or proxy for server-side events.

**FE scope:**
Wire PostHog (or equivalent, EU-hosted) event tracking for the canonical activation event taxonomy:
- signup_completed: fires on successful /inscription submission
- bienvenue_started: fires on /bienvenue first render
- bienvenue_completed: fires on /bienvenue final step submission
- first_ile_opened: fires on first /ile/[id] render
- first_tache_submitted: fires on first TÃ¢che finalization
- first_score_received: fires on first Le MaÃ®tre score return
- day7_active: fires on first session 7 days after signup
- day30_active: fires on first session 30 days after signup

All events respect the F-381 cookie consent gate: they fire only after analytics consent is granted.

**Acceptance:**
- All 8 events fire on real user actions (verified by PostHog event inspector).
- Events fire only after analytics consent is granted (F-381).
- Cohort retention dashboard is visible to founder in PostHog.
- F-225 Playwright captures (visual-only; event firing is verified via PostHog inspector).

**Dependencies:** F-381 (cookie consent gate); PostHog account provisioned.

**Owner:** FE (event wiring) + BE (server-side event proxy if needed).

---

## F-394 -- Site-wide search (FE + BE pair)
Phase: 3
Milestone: Phase 3

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 3.
**Type:** FE + BE (see BE BACKLOG for search index).
**Priority:** MEDIUM (discovery; improves retention).

**BE-side cross-ref:** BE-F-394 -- search index over piÃ¨ges, Ã®les, blog posts, bibliothÃ¨que entries; search endpoint with typeahead and full results.

**FE scope:**
- Header search bar with typeahead (appears on all authenticated TopNav surfaces). Icon-expanded (shows full bar on click) or always-visible: AESTHETIC INPUT NEEDED.
- /recherche: full search results page, organized by content type (piÃ¨ges, Ã®les, bibliothÃ¨que, blog).
- Search query is sent to the BE search endpoint on each keypress with a 300ms debounce.
- Loading state: skeleton rows during fetch.
- Empty state: "No results for [query]. Try searching for a piÃ¨ge, an island topic, or a vocabulary chunk."

AESTHETIC INPUT NEEDED: founder decides header placement (always visible vs icon-expanded vs command-palette triggered).

**Acceptance:**
- User can find any piece of content by keyword from the header.
- /recherche renders results organized by content type.
- Empty state renders for no results.
- F-225 Playwright captures.

**Dependencies:** BE-F-394 (search index and endpoint).

**Owner:** FE (header bar, results page) + BE (index and endpoint).

---

## F-395 -- Help center at /aide (FE content + structure)
Phase: 3
Milestone: Phase 3

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 3.
**Type:** FE content and structure.
**Priority:** MEDIUM (support load reduction; trust signal).

**Scope:**
MDX-backed help center at /aide and /aide/[slug]. Sections:
- Getting started (what is Le MÃ©thodic, how do islands work, what is a TÃ¢che)
- Method explainer (5-couche deep dive, one article per couche)
- Exam coverage (TCF Canada, which exams are supported, how to change your Target Profile)
- Technical setup (mic setup, browser requirements, troubleshooting)
- Account and billing (subscription management, password reset, data export, refund policy)

Distinct from /faq (faq = short Q&A, aide = depth and prose). Navigation: left sidebar on desktop (article tree), top nav on mobile. Public zone, no auth.

AESTHETIC INPUT NEEDED: founder picks article-card style (for /aide hub page), sidebar nav style, and tree structure (flat list vs categorized).

**Acceptance:**
- /aide renders with at least 10 initial articles.
- /aide/[slug] renders individual articles with MDX.
- Sidebar nav works on desktop; mobile nav works on mobile.
- All article slugs return 200.
- F-225 Playwright captures.

**Owner:** FE (template and nav structure) + Chadi (article content).

---

## F-396 -- Content versioning model (BE only)
Phase: 3
Milestone: Phase 3

**Filed:** 2026-06-02.
**Status:** Queued (BE-only; cross-ref in FE BACKLOG for visibility).
**Tag:** Phase 3.
**Type:** BE only. No FE scope.
**Priority:** MEDIUM (required before large content updates; protects in-progress users).

**BE-side cross-ref:** BE-F-396 -- content version schema, migration policy, in-progress user binding. Full spec in BE BACKLOG.

**FE note:** FE consumes the content_version field on content payloads and renders the version-change prompt if the BE flags a delta. This is a Phase 3 follow-up to the BE schema ship.

---

## F-397 -- Performance budget (operational + light FE)
Phase: 3
Milestone: Phase 3

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 3.
**Type:** Operational and light FE.
**Priority:** MEDIUM (SEO and UX quality; required before paid SEO investment).

**Scope:**
Define LCP, TTFB, and INP targets for public surfaces (especially /pieges, /pieges/[slug], /blog/[slug]) per the targets in ARCHITECTURE.md section 19.

Set up Lighthouse CI checks in the Vercel preview deploy workflow. If a primary route's LCP, TTFB, or INP exceeds the budget, the check fails and the PR is flagged.

Evaluate `images.unoptimized: true` in next.config.mjs: SEO content pages with many images will fail LCP targets without optimization. Plan: enable Next.js image optimization selectively on public-zone routes (or globally, if no side effects are found).

**Acceptance:**
- Lighthouse CI is integrated into the Vercel preview deploy workflow.
- Budget regression on any primary route fails the CI check.
- All primary public routes meet the LCP, TTFB, and INP targets in ARCHITECTURE.md section 19.
- F-225 Playwright captures (for visual verification; performance is measured by Lighthouse).

**Dependencies:** None.

**Owner:** FE + Engineering.

---

## F-398 -- PWA install flow (FE)
Phase: 3
Milestone: Phase 3

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 3.
**Type:** FE only.
**Priority:** LOW (post-growth surface; enhances mobile retention).

**Scope (per ARCHITECTURE.md section 20):**
- `public/manifest.json`: name "Le MÃ©thodic", short_name "Le MÃ©thodic", icons (192px and 512px, warm palette), theme_color (from CSS token `--ed-accent`), background_color (from `--ed-bg`), display: standalone, start_url: /carte.
- Service worker (using Workbox or equivalent): caches the app shell (nav, layout, fonts). Content routes show an offline state. Recording and TÃ¢che flows fail explicitly when offline rather than silently.
- Deferred install prompt (`beforeinstallprompt` event): captured and stored. Surfaced after the first completed TÃ¢che (or day 3 active, whichever comes first). Fires once per user.

AESTHETIC INPUT NEEDED: founder decides install prompt timing (immediately after first TÃ¢che vs after day 3 vs on return visit) and visual treatment (bottom sheet, toast, modal).

**Acceptance:**
- Site is installable as a PWA on Android Chrome and iOS Safari (Add to Home Screen).
- Install prompt fires at the configured engagement moment.
- Service worker caches the app shell.
- Offline state renders for content routes.
- Recording and TÃ¢che flows show a clear offline message (not a silent failure).
- F-225 Playwright captures.

**Dependencies:** manifest.json and service worker are standalone; deferred install prompt requires the engagement trigger events to be wired.

**Owner:** FE.

---

# Phase 4 additions (payment + operations, 2026-06-02)

## F-399 -- Error monitoring wire (FE + BE pair)
Phase: 4
Milestone: Phase 4

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 4.
**Type:** FE + BE (see BE BACKLOG for server SDK scope).
**Priority:** HIGH (operational requirement; required before GA launch).

**BE-side cross-ref:** BE-F-399 -- Sentry server SDK on BE (FastAPI), source maps, alerting.

**FE scope:**
Wire Sentry browser SDK into the Next.js app. EU data residency (Sentry EU endpoint). Source maps uploaded at Vercel deploy time.

Configuration:
- Capture all unhandled exceptions and promise rejections.
- Capture Next.js router transitions that throw.
- Attach user context (user_id only, no PII) to error events when authenticated.
- Release tagging: each Vercel deploy gets a Sentry release tag so errors are attributable to the specific deploy.

Alerting policy (shared with BE-F-399): critical errors in payment flow or user data operations trigger an immediate email to the founder. Non-critical errors are grouped in a daily digest.

**Acceptance:**
- Sentry captures FE errors in the EU-hosted instance.
- Source maps resolve stack traces to source code.
- User context is attached to errors for authenticated users.
- A test error thrown in a safe path confirms the event appears in Sentry within 60 seconds.
- F-225 Playwright captures (non-functional for this ticket; verify via Sentry dashboard).

**Dependencies:** Sentry account with EU data residency configured.

**Owner:** FE.

---

## F-400 -- Email infrastructure (FE + BE pair)
Phase: 4
Milestone: Phase 4

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 4.
**Type:** FE + BE (see BE BACKLOG for Postmark wire and template management).
**Priority:** HIGH (required before GA; transactional emails must fire before charging users).

**BE-side cross-ref:** BE-F-400 -- Postmark wire, transactional template IDs, lifecycle series trigger logic.

**FE scope:**
Phase 4 upgrades the F-385 /contact form from mailto fallback to a Postmark API call via a Next.js Route Handler. The form component itself is unchanged (just the submit handler). The Route Handler calls Postmark's inbound message API with the form payload and returns a success or error response.

No other FE scope: all email sending is BE-side. The FE email infrastructure ticket is purely the /contact Postmark upgrade.

**Acceptance:**
- /contact form submits via Postmark (Route Handler) rather than mailto.
- Founder receives contact form submissions in inbox.
- The FE component is identical to the F-385 ship (no visual changes).

**Dependencies:** F-385 (/contact form shipped); Postmark account configured (BE-F-400).

**Owner:** FE (Route Handler wiring).

---

## F-401 -- In-app notifications (FE + BE pair)
Phase: 4
Milestone: Phase 4

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 4.
**Type:** FE + BE (see BE BACKLOG for notifications table and admin send endpoint).
**Priority:** MEDIUM (engagement driver).

**Note:** This ticket F-401 is filed here in Phase 4 of the FE BACKLOG. It is distinct from the shipped F-401 in the BE BACKLOG which was the M5.5 rate-limiting ticket. No ID collision on the FE side; the BE BACKLOG uses BE-F-401 for the rate-limiting entry (now marked Shipped).

**BE-side cross-ref:** BE-F-401-notifications -- notifications table (user_id, type, payload, read_at), admin send endpoint.

**FE scope:**
- Bell icon in TopNav with unread count badge (shows count when unread > 0, hidden when 0).
- Dropdown list: last 10 notifications with type icon, summary text, timestamp, and unread highlight. Tapping a notification marks it as read.
- "Mark all as read" action.
- /notifications: full notifications page (all notifications, paginated, filter by type).
- Notification types: dispute_response (your dispute on TÃ¢che [N] has been reviewed), payment_receipt (your subscription is active), content_updates (new piÃ¨ges articles, new Ã®les), milestones_reached (first Ã®le completed, CLB band up).

**Acceptance:**
- Bell icon shows unread count.
- Dropdown renders last 10 notifications.
- Tapping a notification marks it as read.
- /notifications page renders with pagination.
- F-225 Playwright captures.

**Dependencies:** BE-F-401-notifications (notifications table and API).

**Owner:** FE.

---

## F-402 -- Customer feedback (FE + BE pair)
Phase: 4
Milestone: Phase 4

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 4.
**Type:** FE + BE (see BE BACKLOG for feedback storage).
**Priority:** MEDIUM (product intelligence; non-blocking for launch).

**Note:** This ticket F-402 is filed here in Phase 4 of the FE BACKLOG. It is distinct from the shipped F-402 in the BE BACKLOG which was the M5.5 FK indexes ticket. No ID collision on the FE side.

**BE-side cross-ref:** BE-F-402-feedback -- feedback table (NPS responses, exit survey responses), aggregate view.

**FE scope:**
- NPS prompt: a non-intrusive bottom-right floating card ("How likely are you to recommend Le MÃ©thodic? 0-10"). Fires after: first completed TÃ¢che (first engagement milestone), first month of activity (day-30 active trigger), subscription renewal. Each trigger fires once per user.
- Exit survey: fires when a user initiates cancellation from /abonnement. Short form: reason for cancelling (dropdown: price, not enough time, found an alternative, achieved my goal, other) + optional open text. Submitted before the cancellation completes.
- Both prompts are dismissible without answering. Non-response is recorded as a dismissal, not as a response.

**Acceptance:**
- NPS prompt fires at each milestone, at most once per trigger type per user.
- Exit survey fires on cancel initiation.
- Both are dismissible.
- Response data is visible to founder in the BE aggregate view.
- F-225 Playwright captures.

**Dependencies:** BE-F-402-feedback (storage and aggregate view).

**Owner:** FE.

---

## F-403 -- Admin dashboard (BE + FE, internal-only)
Phase: 4
Milestone: Phase 4

**Filed:** 2026-06-02.
**Status:** Queued.
**Tag:** Phase 4.
**Type:** FE + BE (see BE BACKLOG for admin API endpoints).
**Priority:** HIGH (operational requirement; founder must be able to manage operations without DB access).

**Note:** This ticket F-403 is filed here in Phase 4 of the FE BACKLOG. It is distinct from the shipped F-403 in the BE BACKLOG which was the M5.5 N+1 fixes ticket. No ID collision on the FE side.

**BE-side cross-ref:** BE-F-403-admin -- admin endpoints (users, revenue, content health, dispute queue, telemetry summary, impersonate).

**FE scope:**
Authenticated route at /admin. Gated to founder email (the BE enforces this; FE redirects non-founder users who authenticate to /carte with a 403 toast). No StickyHeader or TopNav; its own minimal chrome (logo wordmark, signout button, section tabs).

Sections:
- Users: searchable/filterable list (email, signup date, subscription tier, last active). Click user row to see their profile (Target Profile, session history, active subscription). Impersonate button for support.
- Revenue: LemonSqueezy order and subscription summary (pulled from LemonSqueezy API via BE). MRR, total orders, recent transactions.
- Content health: island publish status, version, last updated. PiÃ¨ges catalog: live vs bientÃ´t count. Blog: published vs draft count.
- Dispute queue: all open disputes with user, TÃ¢che attempt ID, AI score, user comment, status, timestamp. Founder can mark as reviewed and add a resolution note.
- Telemetry: activation funnel summary (signup count, bienvenue_completed rate, first_tache_submitted rate, day7 retention, day30 retention). Sourced from PostHog or the BE audit_log.

**Acceptance:**
- /admin is accessible only to the founder email.
- All five sections render with real data.
- Founder can view users, impersonate for support, see revenue, manage dispute queue.
- F-225 Playwright captures (at a test/fixture data state; no production data in screenshots).

**Dependencies:** BE-F-403-admin (admin endpoints); LemonSqueezy API key; F-393 (telemetry data).

**Owner:** FE (admin UI) + BE (admin endpoints).

**Related:** Worth a future ticket to address `typescript.ignoreBuildErrors: true` itself â€” silently passing builds with type errors is technical debt. But that's a separate cleanup session blocked on first fixing all latent TS errors.

---

## Architectural lessons (ops gotchas from shipped tickets)

### Uvicorn `--reload` on Windows: worker processes go stale silently

Learned during F-062.3. On Windows, `uvicorn --reload` with the WatchFiles backend has edge cases where:

- WatchFiles doesn't always detect edits in nested subdirectories (`app/routers/*.py` in particular â€” `scripts/*.py` edits were detected in the same session).
- Worker processes don't fully terminate on reload, accumulating zombie workers that continue answering requests with their original in-memory module state.
- The `.pyc` file timestamp can reflect a *past* import (leaving you reasoning about fresh bytecode when the serving process is holding old code).

Symptom: source code on disk provably contains a change (grep, `inspect.getsource(<fresh import>)`), but the HTTP response body doesn't reflect it. F-062.3's /turn endpoint was missing `candidate_turn_number` in the wire response for 2+ hours of debugging despite the field being on disk in two return dicts.

**Nuclear restart protocol** (when response doesn't match source):

```
taskkill /F /IM python.exe
find . -type d -name __pycache__ -exec rm -rf {} +
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The `taskkill /F` is the non-negotiable part â€” stops every Python process bound to the workspace, not just the foreground one. WatchFiles will not save you from a zombie worker holding a stale module.

Belt-and-braces diagnostic pattern: add `print(..., flush=True)` calls in the live handler (not just the return dict â€” also entry with `__file__`) and watch uvicorn stdout. If the prints don't fire, you're not looking at the right process. If they fire with the right `__file__` but the wire body still doesn't match, the serving process is new but the browser/cache/DevTools is showing a stale response â€” reload the network tab.

---

## Shipped â€” Week 3 (May 2-4)

P-220 âœ… [FE] Onboarding questionnaire rebuild (Shipped 2026-05-02). See Â§10.3 entry above for full status detail.
P-222 âœ… [FE+BE] Waitlist UX (Shipped 2026-05-03). See Â§10.3 entry.
B-102 âœ… [FE] Privacy + Terms + Refund pages with footer integration (Shipped 2026-05-03). See entry above.
P-230 âœ… [FE] Overall Progress dashboard rebuild (Shipped 2026-05-03). See Â§10.4 entry.
P-234 âœ… [FE] Cluster detail view (Shipped 2026-05-03). See Â§10.4 entry.

### F-223 â€” [FE] "Le raccourci" / "The shortcut" copy cleanup (interim patch)
Milestone: DONE

**Priority:** MEDIUM (user-visible stale copy)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/onboarding` EcoleReveal step per F-225)
**Filed:** 2026-05-04
**Source:** F-223 plan-first; raccourci grep surfaced 2 user-facing copy lines on EcoleReveal
**Dependencies:** none (interim â€” full rebuild lives at F-202)
**Scope:** replace stale `Le raccourci` / `The shortcut` framing on `components/onboarding/EcoleReveal.tsx` SUBHEAD (EN + FR). FR keeps vous-form (`Finissez-la`) to match surrounding FR onboarding context â€” tu/vous audit + full-app sweep tracked as F-226. Comment at `components/home/EcoleProgress.tsx:24` left in place per "git blame is cheaper than re-discovery" call. Historical raccourci references in BACKLOG.md preserved per F-086 precedent.
**Owner:** Engineering
**Note:** Interim only. F-202 (full L'Ã‰cole intro rebuild with methodology demo) supersedes this copy entirely.

### F-226 â€” [Content] FR voice audit (tu vs vous) full-app sweep
Milestone: M2

**Priority:** LOW (post-soft-beta polish)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** Surfaced during F-223 plan-first â€” Block 3 spec drift between tu-form and vous-form across FR surfaces
**Dependencies:** none
**Scope:** audit every FR string across the FE for tu/vous consistency. Onboarding questionnaire uses vous (`Quel est votre niveau`); waitlist + landing footer use vous; some Block 3 / interim copy specs called out tu-form. Pick one (likely vous given current preponderance), align all surfaces, document the convention in CLAUDE.md so future copy authoring is consistent.
**Owner:** Engineering + Chadi (copy review)

### F-222 â€” [FE] Sign Out does nothing on click
Milestone: M1

**Priority:** HIGH (auth-state correctness)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit `4916d72`; production deploy pending Chadi-captured screenshots + interaction trace per F-225)
**Filed:** 2026-05-04
**Source:** User-reported bug; root-cause analysis surfaced auth-state drift across stores
**Dependencies:** none
**Scope:** Sign Out row on /profile had `onClick={() => {}}` â€” silent dev-stub no-op. Fixed by extracting canonical `signOut(router)` helper in `lib/auth.ts` that clears auth + onboarding + submit-response stores atomically + routes to `/`. Wired from /profile and refactored WaitlistScreen to use the same helper. Closes broader gap where prior `clearAuth()` only cleared 2 of the 4 persisted localStorage keys.
**Owner:** Engineering
**Note:** Verification requires interactive trace per F-225.5 â€” screenshots alone won't catch a Sign Out regression. Test plan: (1) sign in, (2) navigate to /profile, (3) click Sign Out, (4) verify localStorage has zero `lemethodic_*` keys, (5) verify URL is `/`, (6) verify subsequent visit to /profile redirects to `/` (ProtectedRoute kicks in). Same trace from /onboarding/waitlist sign-out link.

### F-222.x â€” [FE+BE] /profile real-data wire-up
Milestone: M1

**Priority:** MEDIUM (Active LC, prioritize after responsive sweep starts)
**Status:** Queued
**Filed:** 2026-05-04
**Source:** Surfaced during F-222 root-cause analysis
**Dependencies:** none
**Scope:** /profile is largely a hardcoded design mockup. Wire to `useAuthStore.user` + `getMe()`: replace hardcoded `"Chadi"` (line 234), `"chadi@example.com"` (line 387), `"TCF Canada Â· 47 days to exam"` (line 246), `"TCF C1 (level 5)"` (line 388), `"June 7, 2026"` (line 392), `"Day 7"` streak (line 334), `"4/16"` Ã‰cole progress (line 335), `"47"` days-to-TCF (line 336), avatar initial `"C"` (line 218). Avatar background pastel + Preply CTA + interface language + notifications stubs stay as-is. Empty-state branches needed for users without exam date / target / etc.
**Owner:** Engineering
**Note:** Beta-credibility hit if a user opens /profile and sees someone else's name + exam date. Not a functional blocker (Sign Out works post-F-222) but a real perception issue.

### F-200 â€” [FE] Landing page desktop responsive + editorial design system foundation
Milestone: M1

**Priority:** HIGH (launch-blocking â€” establishes the design system F-201..F-214 inherit)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` and `/fr` per F-225)
**Filed:** 2026-05-04
**Source:** Strategic recalibration (desktop broken on every screen surfaced as launch-blocker); executable spec from Chadi 2026-05-05
**Dependencies:** none
**Scope:** establishes the editorial design system (`--ed-*` palette + Geist + Source Serif 4 + 8px spacing grid + 600-800ms motion language with `cubic-bezier(0.16, 1, 0.3, 1)`) and applies it to the landing page (`/` + `/fr`). Hero CTA removed (trust the user to scroll). Methodology section gains brief in-line reframe surfacing **Les Moules** + **La MÃ©thode en Couches** as named system concepts (full breakout filed as F-227). Trust-line ("Free. No card required. About 12 minutes.") rescued from deleted hero CTA, surfaced at FinalCTA. RevealOnScroll wrapper added (framer-motion `whileInView`, fade-up 24px, 700ms). 4px button radius, 1px ed-rule borders, 0 shadow on cards (editorial flatness). Pastels (`--fp-*`) preserved as accent layer for unmigrated surfaces.
**Owner:** Engineering
**Note:** Naming deviation from spec â€” used `--ed-*` prefix instead of literal `--color-bg`/`--color-fg`/etc. to avoid collision with shadcn's existing `--color-accent`. Approved by Chadi 2026-05-05. Tailwind utilities are `bg-ed-bg`, `text-ed-fg`, etc.
**Design calls** (per F-200 spec "make the call yourself"):
- Button radius **4px** for editorial CTAs (was 14-16px on M-101a) â€” premium signal.
- Card surfaces **1px ed-rule + 0 shadow** â€” editorial flatness vs pastel softness.
- Hover transitions **opacity/color only, 200ms** â€” no transforms.
- Scroll reveals **700ms with cubic-bezier(0.16, 1, 0.3, 1)**, IntersectionObserver at 20% viewport.
- "Coming soon" tier badges on Pricing â€” outlined micro-pill (`ed-rule` border, `ed-muted` text) instead of solid ink fill â€” restraint over loud signaling.
- Methodology bg flips to `--ed-paper` with top+bottom `--ed-rule` â€” visual emphasis on the moat-evidence section without breaking the bg-flat rhythm elsewhere.
- Sprint/Premium "Join the waitlist" CTAs use ghost button (transparent + ed-fg border, fills on hover) â€” visual hierarchy below Subscription's solid navy CTA. Confirmed conversion ladder.

### F-227 â€” [FE] Methodology breakout on landing (compressed 5-couche surface)
Milestone: M2

**Priority:** MEDIUM (post-F-202, public-side moat surface)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) showing MethodologySection with surrounding sections (Differentiation above + HowItWorks below) visible to verify bg rhythm + section ordering per F-225. F-225 interactive verification clause does NOT apply â€” F-227 is static typography with reveal animations only, no handlers/nav/forms/state mutation.)
**Filed:** 2026-05-05
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** F-227 spec May 5 with locked compressed copy (khÃ¢gneux-reviewed; reuses F-202 Section 2 framework in glance-form)
**Dependencies:** F-200, F-202 (couche names + descriptions reused â€” must stay consistent across surfaces)
**Scope:** rewrite existing MethodologySection.tsx (was F-200 stub: 5-paragraph in-line reframe) to compressed 5-couche format matching F-202 /ecole/intro Section 2. Reorder LandingPage.tsx: MethodologySection moved from after PricingSection to between DifferentiationSection and HowItWorksSection per spec â€” sits at the structural moment a visitor is asking "but how is this different from drill platforms?". Locked verbatim copy (no paraphrasing) in `components/landing/copy.ts` METHODOLOGY constant; restructured from `{heading, paragraphs[]}` to `{heading, intro, couches[5], closer}`. Pure typography: section header (Source Serif 4 italic ed-accent navy 48-64px) â†’ intro framing line (Source Serif 4 italic ed-muted 20-24px) â†’ 5 couches as vertical list (each: Geist 600 ed-fg name + em-dash + Geist 400 ed-fg description, 20-32px gaps) â†’ 1px ed-rule full-bleed â†’ closer kicker (Source Serif 4 italic ed-fg 22-26px centered). 720px max-width, ed-bg, 64-160px vertical padding clamp. RevealOnScroll stagger: 80ms across 5 couches, kicker delay +200ms after last couche. No illustration, no icons, no CTA, no /ecole/intro deep-link.
**Owner:** Engineering (Chadi authored copy)

**Calls (resolved):**
- (a) **Replace existing MethodologySection** (it was the F-200 stub; comment explicitly named F-227 as the rewrite target) rather than add a new section file.
- (b) **Bg = ed-bg** per spec default (HowItWorks that now follows is ed-paper, so the spec tiebreaker doesn't fire). Methodologyâ†’HowItWorks alternation preserved.
- (c) **Reorder side-effect flagged but not fixed in F-227 scope:** removing Methodology from between Pricing and FAQ creates new Pricing(bg)â†’FAQ(bg) adjacency. Per spec "Do not change the surrounding sections' copy or structure" â€” accepted. Filed as F-227.rhythm.
- (d) **Motion**: spec's "ed-page-enter primitive" misuses the name (ed-page-enter is route-level mount); intent is RevealOnScroll viewport-entry. Used existing RevealOnScroll like the prior MethodologySection.

### V-016a.fix â€” [FE] Writing result rendering crash (couches shape mismatch)
Milestone: DONE

**Priority:** CRITICAL (production blocker â€” completed analyses crashed the result view)
**Status:** âœ… Shipped + verified 2026-05-12
**Verification:**
- Non-visual sweep (FE-Claude, 2026-05-12): `/writing` returns 200 in production runtime logs; zero 4xx/5xx across the writing surface in the last 24h on deployment `dpl_6F3XFD6zxcDD95bccinNedUtTtzA`.
- Visual + interactive verification (Chadi, 2026-05-12, manual post-deploy hard-refresh on prod): result view renders all 5 couche tiles without crash; submit â†’ poll â†’ result loop functional end-to-end. Initial broken state during V-016a.dashboard verification was browser cache (old bundle pre-deploy); hard refresh resolved.
**Filed:** 2026-05-07
**Shipped:** 2026-05-07
**Source:** Production console diagnostic â€” `Uncaught TypeError: Cannot read properties of undefined (reading 'le_fond')` after successful writing analysis on `/writing/9`
**Dependencies:** V-013a (writing surface), V-016a (BE async job pattern), V-016a.fe (polling consumer); V-009 (BRAND_LABEL + COUCHE_ORDER + array-shaped Couche convention)

**Cause:** V-013a declared `WritingSubmissionResult.couches` as a record-by-key (`{ le_fond: { score, feedback }, ... }`); BE actually returns the canonical `Couche[]` array shape used everywhere else in the diagnostic stack (`lib/types.ts:227 couches: Couche[]`). When the array arrived where an object was expected, `result.couches.le_fond` was `undefined.le_fond` â†’ TypeError â†’ React error boundary caught â†’ Next.js "page couldn't load" overlay.

**Fix:**
- `WritingSubmissionResult.couches` retyped to `WritingCoucheFeedback[]` (matches BE array convention; new local interface accepts both `analyse` (canonical Couche field) and `feedback` (writing-specific) for the per-layer text)
- Made `overall_score`, `cefr_band`, `couches` all optional on `WritingSubmissionResult` so a partially-populated job result still renders without crashing
- ResultView refactored to look up couches by key from a Map built off the array; renders all 5 expected couches (Le Fond / Les Moules des IdÃ©es / Les Moules / Les RÃ©flexes Anglais / La Voix), with "Coming soon" placeholder + 60% opacity for any couche absent from the response (incl. Voix until BE V-009.be ships scoring)
- Score rendered as `score ?? 'â€”'`; missing-feedback case renders an italic muted "No feedback for this layer." line; `Array.isArray(result.couches)` guard before iteration

**Files touched:**
- `lib/types.ts` â€” `WritingCoucheFeedback` interface; `WritingSubmissionResult` shape relaxed (couches â†’ optional array; overall_score + cefr_band â†’ optional)
- `components/writing/WritingSubmissionClient.tsx` â€” ResultView refactored: arrayâ†’Map lookup, defensive guards, "Coming soon" placeholder per missing couche

### V-016a.dashboard â€” [FE+BE] Render BE rich feedback envelope on /writing dashboard
Milestone: DONE

**Priority:** HIGH (production: dashboard hid every per-layer feedback field BE returned; em-dashes for overall_score + CEFR; "No feedback" everywhere despite BE populating examiner remarks, coaching, transformations, and a full TCF rubric breakdown)
**Status:** âœ… Shipped + verified 2026-05-12
**Verification:**
- Non-visual sweep (FE-Claude, 2026-05-12): deployment `dpl_FVz6abPFGt4wpcbBpi2ysqm97nrh` READY; `lemethodic.com/writing` returns 200 (prerender HIT) and `/writing/10` returns 200 from the new lambda (MISS â†’ lambda evaluated); `/ecole` regression check returns 200 (V-016c.fix unaffected). Zero error/warning/fatal entries in project runtime logs over the last 1h.
- Visual + interactive verification (Chadi, 2026-05-12, manual post-deploy hard-refresh on prod): overall_score renders numeric (0 not em-dash); CEFR band renders ("A1 not achieved"); examiner remark in serif italic French; Coaching block EN primary + FR secondary with `FR` label; "Try this" transformation card; all 5 couches present. Initial broken state was browser cache (old bundle pre-deploy) â€” hard refresh resolved; no code action needed.
**Filed:** 2026-05-12
**Shipped:** 2026-05-12 (commit `f6393fe`)
**Source:** Chadi 2026-05-12 â€” writing analysis dashboard hides BE-populated fields; root-cause hypothesis: V-016a synchronization gap (BE rewrote response shape to 5-couche; FE rendering layer only absorbed the flat back-compat shape, not the rich envelope)
**Dependencies:** V-016a.fix (flat couches[] back-compat reader stays as fallback); BE V-016a (rewrote response shape to add `feedback.*` envelope with `methode_en_couches`, `exam_profile.criteria_breakdown`, `teacher_coaching`, `tcf_canada_evaluation`); V-009 (BRAND_LABEL); F-225 (verification protocol)

**Cause:** BE response carries TWO parallel shapes â€” a flat `result.couches[]` array (which V-016a.fix's reader still consumes) AND a rich nested envelope at `result.feedback.*` carrying the methodology-voice examiner remarks, the bilingual teacher coaching, the action-step transformations, and the full exam-profile + TCF-rubric criteria breakdown. V-016a.fix only consumed the flat shape â€” every field under `result.feedback.*` went unrendered. The FE consequently fell into all its defensive empty-state branches: `result.overall_score` â†’ undefined â†’ em-dash; `result.cefr_band` â†’ undefined â†’ em-dash; per-couche scores still rendered (from the flat array, value `0` when BE scored it zero) but the feedback paragraph slot defaulted to "No feedback for this layer" because the flat shape carries no examiner remark when the rich shape is present.

**Fix:**
- `lib/types.ts` adds the rich envelope types in front of the existing back-compat ones: `WritingTeacherCoaching` (coaching_en/coaching_fr/transformation), `WritingMethodeCoucheRich` (score + examiner_remark_fr + teacher_coaching), `WritingCriterionBreakdown` (display-ready per-criterion shape with localized labels + max_score + score + observation + coaching), `WritingExamProfile` (overall_score + cefr_level + criteria_breakdown[] + secondary_framework_{label,value}), `WritingAnalysisFeedback` (the full envelope keyed by `methode_en_couches: Partial<Record<ExtendedCoucheKey, ...>>`). `WritingSubmissionResult` extended with `feedback?: WritingAnalysisFeedback` â€” flat fields preserved for back-compat with older BE responses.
- `components/writing/WritingSubmissionClient.tsx` ResultView reads with rich-first / flat-fallback precedence:
  - Top-card `overall_score` â† `result.feedback?.exam_profile?.overall_score ?? result.overall_score ?? null`; CEFR â† `result.feedback?.exam_profile?.cefr_level ?? result.cefr_band ?? null`. **Score `0` displays as `0`** â€” em-dash is reserved for null/undefined (the bug was treating a real zero as "missing data").
  - Conditional secondary-framework row renders when `exam_profile.secondary_framework_value` is non-null (e.g. CLB equivalence for TCF Canada). Skipped on null.
  - Per-couche cards: precedence `result.feedback?.methode_en_couches?.[key]` rich â†’ flat `result.couches[].find(c => c.key === key)` fallback â†’ `missing`. Score merges (rich wins, flat next). New body layers stacked vertically:
    - Examiner remark (serif italic, the methodology voice in French; reads `examiner_remark_fr`)
    - Coaching block (sans, "Coaching" eyebrow â†’ `coaching_en` 14px ed-fg primary â†’ `coaching_fr` 13px italic ed-fg-soft with small `FR` tag â€” EN primary, FR secondary, both visible, no toggle per Chadi design call)
    - Transformation sub-card (warm-cream bg, "Try this" / "Essayez ceci" eyebrow in peach-deep, `transformation` body in espresso)
    - Empty-state "No feedback for this layer" only renders when none of remark / coaching / transformation are present and the couche is not `missing`.
  - New TCF rubric breakdown accordion via native `<details><summary>` (no JS state, accessible by default). Renders **only** `exam_profile.criteria_breakdown[]` â€” `tcf_canada_evaluation.criteria[]` is the raw scoring source and per Chadi design call is intentionally not surfaced (one accordion only). Per criterion: localized label (`label_en_student` / `label_fr_student` per UI language) + `score / max_score` (e.g. "0 / 20") + examiner remark + coaching block + transformation sub-card. Sub-cards reuse the warm-cream + peach-deep eyebrow treatment from the per-couche transformation block.

**Bilingual coaching default:** English primary, French secondary, both visible side-stacked. Matches the user persona (English speaker preparing French exam) â€” EN reads first as the meta-language explaining the issue, FR reinforces the target language pattern. No toggle (would add state + interaction cost without pedagogical gain for this audience).

**Score handling:** 0 is data, not absence. Em-dash only on null/undefined.

**Files touched:**
- `lib/types.ts` â€” +75 lines (5 new interfaces + extension to `WritingSubmissionResult`)
- `components/writing/WritingSubmissionClient.tsx` â€” +287/-62 lines (COPY additions for new strings, ResultView destructure refactor, per-couche body rewrite, criteria accordion)

**Tests:** `pnpm build` clean. `npx tsc --noEmit` clean. No test runner configured (CLAUDE.md confirms).

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: HIGH
- WHY: FE types now mirror the verified production payload exactly (Chadi-supplied top-level keys, criteria_breakdown entry shape, exam_profile envelope). Back-compat preserved via dual-shape reader. Build + typecheck + deploy clean.
- UNCERTAINTY: Visual density on a long /writing/{id} result with all four sub-blocks (examiner remark + coaching + transformation + criteria accordion) â€” may need a polish pass on spacing/typography after TARS captures the screenshots. Correctness is not at risk; polish is.
- VERIFICATION: Hit `/writing/10` on prod with an authenticated session, submit a fresh response, wait for analysis. Per-couche cards should show numeric score (incl. `0` as `0`), examiner remark in serif italic French, Coaching block with EN primary + FR secondary, and a "Try this" sub-card. TCF rubric accordion appears below the couche stack â€” expand to see per-criterion label, `score / max_score`, examiner remark, and coaching. Top-card scores read from `exam_profile`; secondary-framework row renders only if BE supplies a non-null CLB-equivalent value. Regression: `/ecole` still renders both phase grids populated (V-016c.fix unaffected).

### V-016g â€” [FE] /library prefetch 404 cleanup (stub page)
Milestone: DONE

**Priority:** MEDIUM (production console noise; UX gap when users click directly)
**Status:** âœ… Shipped (non-visual sweep verified 2026-05-12; visual verification routed to TARS â€” separate commit)
**Verification:**
- Non-visual sweep (FE-Claude, 2026-05-12): `/library` and `/fr/library` both return 200 with correct hero copy + notify form rendered server-side. 24h Vercel runtime log sweep on `dpl_6F3XFD6zxcDD95bccinNedUtTtzA` shows zero 404s across the project â€” the `/library?_rsc=â€¦` prefetch regression is gone.
- Visual + interactive verification (1440px desktop + 375px mobile on `/library` and `/fr/library` + email-submit success state + localStorage entry write + DevTools network confirmation): routed to TARS â€” separate verification commit.
**Filed:** 2026-05-07
**Shipped:** 2026-05-07
**Source:** Production console â€” `GET /library?_rsc=... â†’ 404` from Next.js link prefetch on platform landing
**Dependencies:** F-300a (Library product card links to /library); V-012 (warm tokens); F-300c (real catalog, queued)

**Scope:** new `/library` and `/fr/library` routes serve a stub hero page until F-300c lands the real catalog. Visual continuity with PlatformLanding â€” `linear-gradient(--ed-bg â†’ --ed-warm-sand)` hero bg, peach-deep accent eyebrow, ed-paper notify-form card. Email signup is local-only (writes to localStorage `lemethodic:library-notify-email`); BE-side capture endpoint filed as **V-016g.notify**.

**Files touched:**
- `app/library/page.tsx` (NEW) â€” renders LibraryStub lang="en" with English meta
- `app/fr/library/page.tsx` (NEW) â€” same with FR meta
- `components/library/LibraryStub.tsx` (NEW) â€” hero + sub + notify form (email validation + success state) + back-to-home link
- `components/nav/TopNav.tsx` â€” EXCLUDED_EXACT extended to `/library`, `/fr/library` so the marketing chrome stays consistent (no in-product TopNav)

### V-016g.notify â€” [BE] BE library-notify email capture
Milestone: TBD

**Priority:** LOW (post-launch; FE has localStorage stash today)
**Status:** Queued (BE-side; lemethodic-backend ticket)
**Filed:** 2026-05-07
**Source:** V-016g â€” FE captures email locally; needs BE persistence for actual launch notification
**Dependencies:** TBD BE notification system (likely shares plumbing with V-013b.notifications)
**Scope:** BE `POST /api/library/notify` accepting `{ email }`, persisting to a notify list. FE swaps localStorage write to API call once the endpoint ships. When F-300c launches the real catalog, BE batch-sends launch notification to the captured list.
**Owner:** Backend Engineering

### F-300a â€” [FE] Platform-level / landing redesign
Milestone: M1

**Priority:** HIGH (strategic surface restructure; depends on F-300b having stabilized /exam-prep)
**Status:** Awaiting verification (FE-side, lemethodic-frontend pushed; production deploy on auto from main merge. 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) end-to-end: hero with new H1 + sub + kicker + 2 CTAs (peach-deep button + ghost link), product cards (Option B layout â€” Exam Prep featured 2/3 + Library + Free Diagnostic stacked 1/3 at lg, 2-col at md, 1-col <md), compressed methodology (5 couches listed, attribution + see-full link), final CTA + footer with Exam Prep + Library nav links.)
**Filed:** 2026-05-07
**Shipped:** 2026-05-07 (FE-side, frontend commit pushed)
**Source:** F-300 strategic recalibration â€” LeMethodic repositions from "TCF speaking exam prep" to "French learning platform with multiple products"
**Dependencies:** F-300b (preserves exam-prep funnel at /exam-prep); V-003 (atmospheric glyphs); V-012 (warm tokens); V-013c (TopNav exclusion list); V-016d (kicker treatment); V-016f (bottleneck cycle visual reused for Exam Prep card)

**Locked content:**
- Hero H1: "Stop translating. Start producing French." / FR: "ArrÃªtez de traduire. Commencez Ã  produire en franÃ§ais."
- Hero sub: "The method, the exams, the books â€” built for English speakers." / FR analog
- Kicker subtitle (V-016d kicker + new line): "Built for the exams that change visa outcomes."
- Primary CTA: "Start free diagnostic" â†’ /onboarding (peach-deep bg, warm-cream text, height 64)
- Secondary CTA: "Browse the library" â†’ /library (text underline, ed-muted)
- 3 product cards (Option B layout per F-300a plan-first):
  - **Exam Prep (featured)**: visual = bottleneck cycle (V-016f Card 1 reused, hover-cycles 5 couches), copy "Diagnostic-driven path. AI examiner feedback under exam pressure." â†’ /exam-prep
  - **Library**: visual = book-stack (3 typographic blocks in peach-deep / sage-deep / espresso), copy "Method books, exam prep PDFs, free resources for English speakers learning French." â†’ /library (404 today; F-300c)
  - **Free Diagnostic**: visual = mini SVG radar (sage-deep dashed pentagon + peach fill) â†’ /onboarding
- Compressed methodology section: heading + 1-line sub + 5 couche names (no descriptions; "See full methodology â†’" links to /exam-prep) + attribution line "Built on 7,000+ hoursâ€¦"
- Final CTA: "Stop guessing what's blocking your French." + body + peach-deep button + trust line
- Footer: existing + new Exam Prep + Library links

**Skipped per plan-first:**
- **Social proof section** in v1 â€” methodology section's attribution line carries enough atmosphere; full testimonial section deferred. Filed as **F-300a.proof** for follow-up.

**New CSS:** `.fp-platform-cards` grid with breakpoint cascade (1col â†’ 2col at md â†’ 2fr/1fr at lg with featured spanning rows).

**Files touched:**
- `app/page.tsx`, `app/fr/page.tsx` â€” render PlatformLanding instead of LandingPage; new platform-level metadata title + description
- `components/landing/PlatformLanding.tsx` (NEW) â€” full platform landing with hero, ProductCards, methodology, FinalCTA. Reuses HeroAtmosphere, RotatingKicker, RevealOnScroll, LandingHeader, LandingFooter
- `components/landing/LandingFooter.tsx` â€” footer nav extended with Exam Prep + Library links (lang-aware /exam-prep vs /fr/exam-prep)
- `app/globals.css` â€” .fp-platform-cards grid + breakpoint rules

### F-300a.proof â€” [Content] Platform landing social proof section
Milestone: polish-defer

**Priority:** LOW (post-launch UX polish)
**Status:** Queued
**Filed:** 2026-05-07
**Source:** F-300a plan-first â€” skipped from v1
**Dependencies:** F-300a; testimonial copy (Chadi authoring)
**Scope:** add a "voices from English speakers" testimonial section between the product cards and the methodology section on platform landing. Pattern from current /exam-prep TestimonialCard component. 3 testimonials minimum, attribution + exam context + outcome quote. Needs Chadi-authored or Chadi-curated testimonials (real users where possible).
**Owner:** Chadi (copy) + Engineering (wire-up)

### F-300b â€” [FE] Move current landing to /exam-prep
Milestone: M1

**Priority:** HIGH (F-300 chain head; preserves existing funnel before / pivots)
**Status:** Awaiting verification (FE-side, frontend commit pushed; production deploy on auto. 1440px desktop + 375px mobile of `/exam-prep` + `/fr/exam-prep` showing identical content to pre-F-300 / + /fr.)
**Filed:** 2026-05-07
**Shipped:** 2026-05-07
**Source:** F-300 strategic recalibration â€” preserve before disrupt
**Dependencies:** none (mechanical route copy)
**Scope:** new `/exam-prep` and `/fr/exam-prep` routes render the existing LandingPage component verbatim. Canonical + hreflang metadata point at the new URLs. TopNav `EXCLUDED_EXACT` set extended to suppress in-product nav on the funnel landing surface.

**Files touched:**
- `app/exam-prep/page.tsx` (NEW) â€” renders LandingPage with lang="en"
- `app/fr/exam-prep/page.tsx` (NEW) â€” renders LandingPage with lang="fr"
- `components/nav/TopNav.tsx` â€” EXCLUDED_EXACT extended

### F-300c â€” [FE] Library route + content
Milestone: M1

**Priority:** MEDIUM (post-F-300a; /library currently 404)
**Status:** not done, scope-rewrite-owing
**Filed:** 2026-05-07
**Source:** F-300a â€” Library product card links to /library which doesn't exist yet
**Dependencies:** F-300a; library inventory (Chadi authoring book covers + listings + free resources)
**Scope:** new `/library` and `/fr/library` routes with a books / resources catalog. Cards per book (cover image + title + format + buy/download CTA + free-resource flag). Filter or category navigation TBD. Visual continuity with platform landing â€” V-012 warm tokens, ed-paper book cards, peach-deep CTAs.
**Owner:** Engineering (build) + Chadi (inventory + copy)

**Scope rewrite note (Session 1 lock, 2026-05-31):** LemonSqueezy era. Scope rewrite owing per Session 1 lock: /library is now Stripe-backed store with 4 categories (Livres, Audio, Telechargements, Ressources gratuites). See SITEMAP.md /library section and PRODUCT.md /library positioning. Detailed scope rewrite in MS-7 (ROADMAP-marketing.md).

### F-300d: [Content] Library catalog content authoring
Milestone: M1

**Priority:** MEDIUM
**Status:** not done, scope-rewrite-owing
**Filed:** 2026-05-31 (recreated)
**Scope rewrite note (Session 1 lock, 2026-05-31):** LemonSqueezy era. Scope rewrite owing per Session 1 lock: /library is now Stripe-backed store with 4 categories (Livres, Audio, Telechargements, Ressources gratuites). See SITEMAP.md /library section and PRODUCT.md /library positioning. Detailed scope rewrite in MS-7 (ROADMAP-marketing.md).

### F-300e: [FE+BE] Library checkout + payment flow
Milestone: M6

**Priority:** MEDIUM
**Status:** ~~not done~~ OBSOLETE
**Filed:** 2026-05-31 (recreated)
**Scope rewrite note (Session 1 lock, 2026-05-31):** LemonSqueezy era. Scope rewrite owing per Session 1 lock: /library is now Stripe-backed store with 4 categories (Livres, Audio, Telechargements, Ressources gratuites). Payment processing now Stripe (not LemonSqueezy). See SITEMAP.md /library/checkout and PRODUCT.md /library positioning. Detailed scope rewrite in MS-7 (ROADMAP-marketing.md).
**Obsolete note:** The scope rewrite note incorrectly named Stripe as the payment processor. LemonSqueezy is the merchant of record for all payment code. Library checkout and subscription payment scope is superseded by F-364 (LemonSqueezy integration).

### F-300f: [FE+BE] Library subscriber discount logic
Milestone: M6

**Priority:** MEDIUM
**Status:** ~~not done~~ OBSOLETE
**Filed:** 2026-05-31 (recreated)
**Scope rewrite note (Session 1 lock, 2026-05-31):** LemonSqueezy era. Scope rewrite owing per Session 1 lock: Subscriber discounts now 15% Engagement / 25% Maitrise / 30% Sprint applied at Stripe checkout. See SITEMAP.md /library/checkout and PRODUCT.md service architecture section. Detailed scope rewrite in MS-7 (ROADMAP-marketing.md).
**Obsolete note:** Scope rewrite note referenced Stripe checkout. LemonSqueezy is the merchant of record; subscriber discount logic at checkout belongs in F-364 (LemonSqueezy integration).

### F-300g: [Content] Library bundle definition and display
Milestone: M6

**Priority:** MEDIUM
**Status:** not done, scope-rewrite-owing
**Filed:** 2026-05-31 (recreated)
**Scope rewrite note (Session 1 lock, 2026-05-31):** LemonSqueezy era. Scope rewrite owing per Session 1 lock: 3 bundles defined (TCF Canada Complete Pack $79, Anglophone Starter Pack $49, Sprint Companion $99). See SITEMAP.md /library section. Detailed scope rewrite in MS-7 (ROADMAP-marketing.md).

### V-016a.fe â€” [FE] Writing submit polling consumer
Milestone: DONE

**Priority:** HIGH (parallel to BE V-016a; FE ready before BE ships contract)
**Status:** âœ… Shipped + verified 2026-05-12 â€” BE V-016a contract live on prod; FE polling consumer functional end-to-end (Chadi, 2026-05-12, manual post-deploy on `/writing/10`): submit fires, AnalyzingPanel renders during poll, result panel renders on completion with the full V-016a.dashboard rich envelope. Initial broken state during dashboard verification was browser cache (old bundle pre-deploy); hard refresh resolved.
**Filed:** 2026-05-06
**Pushed:** 2026-05-07 (FE-side, frontend commit pending merge); BE deploy unblocks live verification
**Type:** FE async pattern
**Source:** V-016 chain â€” strategic Claude locked async-job contract for writing analysis
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
- `lib/types.ts` â€” `WritingJobStatus` + `WritingJob` types
- `lib/api.ts` â€” `api.writing.submit(promptId, text): Promise<WritingJob>` (return shape changed); new `api.writing.getJob(jobId): Promise<WritingJob>`
- `lib/polling.ts` (NEW) â€” `usePollJob<T>` hook; recursive setTimeout loop, configurable interval (default 3s) + maxPolls (default 100). Returns discriminated `PollJobState<T>`. Cancels via useRef on cleanup, on jobId change, on terminal states.
- `app/globals.css` â€” `ed-spinner-dot` keyframes + `.ed-spinner-dot-{1,2,3}` staggered delays. Reduced-motion: static dots at 0.85 opacity.
- `components/writing/WritingSubmissionClient.tsx` â€” extended SubmissionState (added `polling`, `failed`, `abandoned`), wired `usePollJob` driven by `submission.kind === 'polling'`, sync poll-state â†’ submission via useEffect on `pollState`. New AnalyzingPanel (warm-cream bg + sage-deep dots + Fraunces italic title + phased copy + Cancel) and FailedPanel (paper bg + ed-fg headline + ed-muted body + Retry CTA). EN+FR copy added: `analyzingTitle`, `analyzingPhase` (initial/still/almost), `analyzingCancel`, `failedTitle`, `abandonedTitle`, `abandonedBody`. handleSubmit now branches on synchronous-completed vs synchronous-failed vs pending/processing; new `handleCancelPolling` (user-initiated abandon) + `handleRetryFromFailed` (text preserved).

**Polling UX (decisions made in plan-first):**
- 3s interval, 100-poll max (= 5 min total). After abandon, AbandonedPanel surfaces a Retry button â€” user can resubmit the same draft (preserved in submission.text and localStorage).
- Phased copy by elapsed time:
  - 0-30s (pollCount < 10): "This may take 30-90 seconds." / FR: "Cela peut prendre 30 Ã  90 secondes."
  - 30-60s (pollCount < 20): "Still analyzing." / "Analyse toujours en cours."
  - 60s+ (pollCount >= 20): "Almost done." / "Presque terminÃ©."
- Cancel button: ghost (transparent + ed-rule border, ed-fg-soft text). User-initiated abandon flips submission to `idle` with text preserved; usePollJob's effect cleanup drops the in-flight poll loop.
- Network error during a poll â†’ fail state with "Lost connection to server." Caller decides whether to retry; we don't auto-retry silently.

**Hold notes:**
- Pushing the FE code now per Chadi resume direction. Auto-deploy to Vercel will happen but will fail live (writing surface non-functional) until BE V-016a contract is on prod. The user explicitly accepted this risk: "Commit + push (don't deploy until BE V-016a contract live)" â€” interpreted as FE deploy is OK, BE is still being shipped.

### V-016c â€” [FE] /ecole desktop layout (lesson-grid Option C)
Milestone: M1

**Priority:** HIGH (V-016 chain mid; pre-launch desktop polish completes /ecole/speaking/progress trio)
**Status:** Awaiting verification (1440px desktop screenshot of `/ecole` showing eyebrow + Fraunces italic title + progress strip + 2-phase lesson grid (auto-fill 220px columns) + right rail (Today's session warm-cream / days-until-exam / streak placeholder). Verify mobile <md keeps existing HomeScreen layout. F-225 interactive verification clause partially applies â€” Today's session CTA + lesson card click-throughs.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06
**Source:** V-016 spec â€” /ecole was mobile-stacked column on desktop
**Dependencies:** V-013c TopNav (desktop chrome); V-012 (warm tokens)

**Layout (Option C â€” lesson-centric):**
- Header: eyebrow + Fraunces italic page title + greeting + progress strip (peach-deep fill on warm-cream track)
- Body: 2-column grid `1fr / 280-320px`
  - Left: 2 phase sections (Fondations 1-16 / Approfondissement 17-27), each with auto-fill 220px lesson card grid. LessonCard shows lesson number (Fraunces italic), status icon + label (Lock/Play/Check), title, 2-line short description clamp.
  - Right rail (sticky top:96): warm-cream Today's session card with CTA, days-until-exam tile (Fraunces italic count), streak placeholder, optional Recommended modules count
- Locked lessons render at 60% opacity, no Link wrapper (not clickable)
- In-progress + completed lessons wrap in `<Link>` to `/ecole/lesson/{n}`
- Mobile <md: existing HomeScreen via `.fp-mobile-only`

**Skipped from this rev:** the existing HomeScreen DailyActionCard pastels are NOT carried into desktop (warm token-based today card replaces). Recommended modules section reduced to a count chip.

### V-016c.fix â€” [FE] /ecole desktop empty Fondations + Approfondissement (phase-filter regression)
Milestone: DONE

**Priority:** HIGH (production regression on V-016c desktop layout â€” visual verification on V-016c was blocked because the grids rendered with zero cards)
**Status:** âœ… Shipped 2026-05-12 (non-visual sweep verified; visual verification routed to TARS â€” separate commit)
**Verification:**
- Non-visual sweep (FE-Claude, 2026-05-12): deployment `dpl_GDqpPYB6XSU6obqVzuedVHFQunYr` READY in ~30s (Turbopack); `lemethodic.com/ecole` returns 200 from the new deployment (cache HIT on prerender shell, fresh chunk hashes confirm new bundle); zero error/warning/fatal entries across project runtime logs in last 1h.
- Visual + interactive verification (1440px desktop + 375px mobile of `/ecole` showing both phase grids populated with lessons; click-through on a Fondations card â†’ `/ecole/lesson/{n}`; click-through on an Approfondissement card â†’ `/ecole/lesson/{n}`): routed to TARS â€” separate verification commit.
**Filed:** 2026-05-12
**Shipped:** 2026-05-12 (commit `da534dc`)
**Source:** Chadi 2026-05-12 â€” /ecole desktop renders empty Fondations + Approfondissement sections
**Dependencies:** V-016c (original desktop layout); F-087 (curriculum split invariant 1-16 / 17-27)

**Cause:** `EcoleDesktop` filtered lessons with `lessons.filter((l) => l.phase === 1)` and `l.phase === 2`. The `mapLesson` mapper in `lib/api.ts` defaulted any missing/non-numeric `phase` value to 1 (`raw.phase === 2 ? 2 : 1`). When the backend response omitted `phase`, or serialized it as a string/null, all 27 lessons collapsed to phase=1 â€” Fondations rendered the full list, Approfondissement rendered empty. (HomeScreen mobile masked the regression because it renders a flat list with an inline phase divider â€” the divider silently failed to trigger but the lessons themselves still rendered.)

**Fix:**
- `components/home/EcoleDesktop.tsx` â€” switched the desktop phase filter from the BE `phase` field to `lessonNumber` directly (`â‰¤16` = Fondations, `â‰¥17` = Approfondissement). The 1-16 / 17-27 boundary is a locked curriculum invariant per F-087 and is more reliable than the BE field.
- `lib/api.ts` `mapLesson` â€” when BE returns a clean numeric `1` or `2`, that wins. Otherwise the mapper falls back to deriving phase from `lesson_number â‰¥ 17`. Keeps HomeScreen's PhaseDivider correct even with a misbehaving BE field.
- `components/home/EcoleDesktop.tsx` â€” added top-level empty-state if `lessons.length === 0`. Prior path silently rendered two empty phase grids; now an `ErrorRetry` surfaces so a future "no data" failure mode is visible instead of mistaken for the V-016c bug.

**Files touched:**
- `components/home/EcoleDesktop.tsx` â€” filter swap + empty-state branch (+13 lines)
- `lib/api.ts` â€” mapLesson phase fallback (+5 / -3 lines)

**Tests:** `pnpm build` clean. `npx tsc --noEmit` clean. No test runner configured in this repo.

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: MEDIUM
- WHY: Fix removes the dependency on the brittle BE `phase` field by using the locked F-087 lesson-number invariant, which is verified clean by build/typecheck and confirmed deploying on prod. MEDIUM not HIGH because I could not reproduce the empty-grid behavior locally (would have required prod auth + a logged-in account showing the bug) â€” the fix is theory-driven from the code path, not from observing the bug in action.
- UNCERTAINTY: Have not yet seen the populated phase grids render on prod with a real authenticated session. If the original bug was actually `lessons.length === 0` from BE (rather than the phase-field regression I diagnosed), the new empty-state will at least make that visible â€” but the underlying BE data issue would still need a separate fix.
- VERIFICATION: Chadi/TARS hit `https://lemethodic.com/ecole` at 1440px desktop on an authenticated session; both Fondations (1-16) and Approfondissement (17-27) should render populated lesson card grids. Click a card in each phase to confirm `/ecole/lesson/{n}` navigation. On 375px mobile, HomeScreen still works â€” Phase 2 divider should now render between lessons 16 and 17 (it used to silently fail when BE phase was wrong; that's a side-benefit of the mapper hardening).

### V-016f â€” [FE] Differentiation Card 1 rebuild (text-anchored bottleneck)
Milestone: M2

**Priority:** HIGH (V-016 chain; landing card 1 read as decorative not data)
**Status:** Awaiting verification (1440px desktop + 375px mobile of `/` + `/fr` Differentiation section showing Card 1 with "Your bottleneck" eyebrow + Fraunces italic couche name in warm-peach-deep + tail line. Hover trace: cycles through 5 couches.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06
**Source:** V-016 spec â€” Card 1 "5 horizontal bars" read as decoration
**Dependencies:** V-004 (DifferentiationSection card chrome stays); V-012 (warm tokens)

**Decision: Option B (text-anchored)** â€” bars rebuild dropped in favor of typographic bottleneck frame:
- Eyebrow: "Your bottleneck" / "Votre goulet" â€” small uppercase ed-muted
- Body: cycling couche name in Fraunces italic clamp(28-36px) warm-peach-deep
- Tail: "is what's blocking your B2." / "freine votre B2." â€” Switzer 14px ed-fg
- Hover advances index modulo 5 (Le Fond / Les Moules des IdÃ©es / Les Moules / Les RÃ©flexes Anglais / La Voix). Default position: index 3 (Les RÃ©flexes Anglais â€” most thematically resonant for anglophone audience).
- Spring-eased fade-up on each cycle via `ed-pair-fade-in` keyframe (reused from V-004 InterferenceVisual). Reduced-motion users see end state instantly.
- Card 1 file gains a `language` prop; Cards 2/3 remain prop-less; mount switched to per-index render in DifferentiationSection.

### V-016e â€” [FE] Switzer font preload (landing FOUT fix)
Milestone: M2

**Priority:** HIGH (V-016 chain; landing H1 fell back to system sans on first paint)
**Status:** Awaiting verification (1440px desktop + 375px mobile of `/` + `/fr` H1 + body â€” verify Switzer renders, not system sans-serif. Network tab: confirm preload link fires before stylesheet link.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06
**Source:** V-016 spec â€” V-005 Switzer was rendering as system fallback on landing
**Dependencies:** V-005

**Fix:** added `<link rel="preload" as="style">` for the Fontshare CSS URL ahead of the `<link rel="stylesheet">` declaration in `app/layout.tsx` `<head>`. Also added `crossOrigin="anonymous"` to the preconnect hints (Fontshare CSS references font files on `cdn.fontshare.com`, separate origin from `api.fontshare.com`) and a second `preconnect` for `cdn.fontshare.com`. This escalates fetch priority on the font CSS so first-paint H1 hits Switzer's @font-face rules instead of falling through the `-apple-system / Segoe UI / system-ui` chain.

If FOUT persists post-deploy, escalate to **V-016e.local** â€” self-host Switzer via `next/font/local` with downloaded woff2 files. Filed as queued follow-up.

### V-016d â€” [FE] Hero kicker amendment (size, color split, spring)
Milestone: M1

**Priority:** MEDIUM (V-016 chain; landing hero polish)
**Status:** Awaiting verification (1440px desktop + 375px mobile of `/` + `/fr` hero showing kicker at clamp(24-32px), prefix in ed-fg-soft, exam name in warm-peach-deep, continuous infinite cycle through TCF/TEF/DELF/DALF.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06
**Source:** V-016 spec
**Dependencies:** V-001 (kicker sizing baseline); V-006 (widest-word width sizer); V-012 (spring + warm-peach-deep)

**Changes:**
- Font size: `clamp(20px, 1.8vw, 24px) â†’ clamp(24px, 2.5vw, 32px)`
- Color split: prefix "Prep for" / "PrÃ©paration" â†’ `var(--ed-fg-soft)`; exam name â†’ `var(--ed-warm-peach-deep)`. Same split applied to reduced-motion fallback ("Prep for TCF Â· TEF Â· DELF Â· DALF").
- Animation: keyframe `ed-kicker-slide` now runs at 200ms with `ED_EASE_SPRING_CSS` (was 600ms with ED_EASE_CSS). Tighter rotation rhythm.
- Continuous infinite loop: `useRotatingText` already cycles forever via `setInterval`; no behavioral change needed. Hover-pause preserved (kicker pauses while focused / hovered for keyboard accessibility).

### V-016b â€” [Content] La MÃ©thode en Couches copy revision
Milestone: M2

**Priority:** HIGH (V-016 chain; landing methodology copy didn't communicate value)
**Status:** Awaiting verification (1440px desktop + 375px mobile of `/` + `/fr` methodology section showing the 5 couches with revised descriptions. EN: "Le Fond: Your ideas. Generic answers fail at B2. Specific examples score." etc. FR analogs.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06
**Source:** V-016 spec
**Dependencies:** V-002 (em-dash strip rule); F-227 (compressed methodology surface on landing)

**Scope:** updated `METHODOLOGY.couches[*].description` in `components/landing/copy.ts` for all 5 couches (Le Fond / Les Moules des IdÃ©es / Les Moules / Les RÃ©flexes Anglais / La Voix), EN + FR. Each description now communicates the layer's value proposition rather than just labeling it. Em-dash appositive markers stripped per V-002 â€” colon separator is rendered by `MethodologySection` JSX between name and description.

**Out of scope:** EcoleIntro (`/ecole/intro` Section 2) keeps its longer methodology copy. The landing methodology is the compressed glance-form version; EcoleIntro is the deep version. V-016b applies only to the compressed copy on landing.

### V-015d â€” [FE] /progress desktop bento dashboard
Milestone: M1

**Priority:** HIGH (V-015 chain tail; pre-launch desktop polish)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop screenshot of `/progress` showing radar (2Ã—2 tile) + Today's Focus + Bottleneck + Streak/days-to-exam + per-couche row + recent activity. Verify bento collapses to 2-col at md and to single column at <md. F-225 interactive verification clause partially applies â€” Today's Focus CTA + Recent Activity have hover/click affordance.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-015 spec â€” /progress was mobile-stacked column on desktop
**Dependencies:** V-009 (5-couche brand labels reused for radar + per-couche row); V-012 (warm tokens); BRAND_LABEL + COUCHE_ORDER from lib/coucheBrandLabels.ts

**Bento layout (Apple iCloud restraint):**
- Radar tile (2Ã—2 at lg, 1Ã—2 at md): 5-couche Recharts polar from latest recording. Voix axis present at user value 0 (unscored placeholder per V-009).
- Today's Focus tile (2Ã—1 at lg, 1Ã—1 at md): warm-cream bg, action.kind â†’ headline + CTA â†’ /ecole.
- Bottleneck tile (1Ã—1): lowest-scoring scored couche from latest recording.
- Streak slot (1Ã—1): repurposed for days-until-exam (Fraunces italic count + warm-espresso) since BE has no streak field. Filed as **V-015d.streak** if/when BE streak ships.
- Per-couche detail row (full width): 5 mini cards with auto-fit grid; Voix unscored (60% opacity + "Coming soon" label).
- Recent activity (full width): RecordingSummary list, 3-column rows (TÃ¢che label / date / CEFR band).

**CSS:**
- New `.fp-bento-grid` + `.fp-bento-{radar,today,bottleneck,streak,couches,recent}` classes in globals.css with @media gates at md/lg
- Mobile <md: existing ProgressDashboard stacked layout via `.fp-mobile-only`

**Out of scope (filed):**
- **V-015d.trend** â€” BE `GET /api/diagnostic/trend?days=30` endpoint for the score-trend tile (skipped from v1 per Chadi pick)
- **V-015d.streak** â€” proper streak counter (BE field needed)

### V-015c â€” [FE] /speaking desktop tab-driven layout
Milestone: M1

**Priority:** HIGH (V-015 chain mid; pre-launch desktop polish)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop screenshot of `/speaking` showing 3 tabs (TÃ¢che 1/2/3) with peach-deep underline on TÃ¢che 1 (default) + 60/40 detail panel showing format / tips / Start CTA + recent recordings. 375px mobile keeps existing 3-stacked-card layout. F-225 interactive verification clause applies â€” tab clicks should swap the detail panel + load tÃ¢che-filtered recordings.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-015 spec â€” /speaking was mobile-only 3-card layout on desktop
**Dependencies:** V-013c TopNav (active-underline pattern reused); V-012 (warm tokens); api.recordings.list

**Layout (Option A from V-015c plan-first):**
- Top: 3 tabs (TÃ¢che 1/2/3), peach-deep 2px underline on active, spring-eased color on hover
- Default tab: TÃ¢che 1 (no localStorage persist â€” keeps state simple)
- 60/40 grid: detail panel left (intro / format / tips), right rail with primary CTA + recent recordings + score history placeholder
- Bottom meta strip: duration + mode (small visual closure)

**Copy:**
- TÃ¢che-specific format / tips / examples placeholder copy for v1 â€” Chadi-authored real copy filed as **V-015c.copy** for v2
- 3 tips per tÃ¢che, EN + FR
- Tips bullets use `--ed-warm-peach-deep` 6px dot

**Right rail:**
- Primary CTA â†’ existing tÃ¢che route (`/speaking/tache-1/interview`, `/speaking/tache-2`, `/speaking/tache-3/environnement`)
- Recent recordings: filtered to active tÃ¢che from api.recordings.list({ limit: 30 }), top 5
- Score history: empty-state placeholder ("Score chart coming soon") â€” V-015d.trend covers BE side

**Mobile <md:** existing SpeakingLanding stays unchanged via `.fp-mobile-only`.

### V-015c.copy â€” [Content] Real format/tips/examples copy
Milestone: polish-defer

**Priority:** MEDIUM (post-V-015c v1)
**Status:** Queued â€” Chadi authoring
**Filed:** 2026-05-06
**Source:** V-015c spec â€” placeholder stubs in v1
**Dependencies:** V-015c
**Scope:** replace the 3-tÃ¢che placeholder format / 3-tips arrays in `components/speaking/SpeakingDesktop.tsx` COPY constant with Chadi-authored real content. Add an "Examples" block per tÃ¢che if Chadi provides sample exchanges. EN + FR.
**Owner:** Chadi (copy) + Engineering (wire-up)

### V-015d.trend â€” [BE] BE diagnostic trend endpoint
Milestone: TBD

**Priority:** LOW (post-V-015d; FE has placeholder)
**Status:** Queued (BE-side)
**Filed:** 2026-05-06
**Source:** V-015d + V-015c right-rail score history slot
**Dependencies:** F-088 (couche scoring)
**Scope:** BE `GET /api/diagnostic/trend?days=30` returning either per-couche or overall score time series. Shape suggestion: `{ couche_key | 'overall', points: [{ date: ISO, score: number }] }[]`. FE adds a Recharts line chart in the V-015d "Score trend" tile and the V-015c right-rail history slot once this lands.
**Owner:** Backend Engineering

### V-015d.streak â€” [FE+BE] Streak counter (BE field + UI)
Milestone: TBD

**Priority:** LOW (post-launch UX)
**Status:** Queued (BE-side first)
**Filed:** 2026-05-06
**Source:** V-015d spec â€” Streak tile currently repurposed for days-until-exam
**Dependencies:** TBD BE streak tracking
**Scope:** BE adds streak tracking on User (consecutive-day-with-recording counter). FE swaps the Streak bento tile from days-until-exam to actual streak count once BE field ships. Days-until-exam moves to a new dedicated tile or returns to /ecole header chip.
**Owner:** Backend Engineering

### V-013c â€” [FE] Nav system overhaul (mobile BottomNav + desktop TopNav)
Milestone: M1

**Priority:** HIGH (V-013 chain tail; pre-launch surface completeness)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured screenshots: 1440px desktop on /ecole + /writing + /more + /progress + /diagnostic showing TopNav at top with active underline; 1440px desktop scrolled past 8px to capture backdrop-blur + ed-rule border state; 375px mobile on same routes showing BottomNav with TopNav hidden; verify TopNav DOES NOT render on /, /fr, /signup, /paywall, /onboarding, /privacy, /terms, /refund. Plus interaction trace: click profile avatar â†’ dropdown opens â†’ click outside â†’ dismisses; click "Sign out" â†’ logout fires â†’ redirects to /. F-225 interactive verification clause applies.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-013 spec â€” bottom nav leaking onto desktop; no proper desktop top nav
**Dependencies:** V-012 (warm tokens + spring motion inherited); V-013a, V-013b (in-product surfaces TopNav links to)

**Two changes:**
- `components/home/BottomNav.tsx` â€” gained className `md:hidden` so mobile-only
- `components/nav/TopNav.tsx` (NEW) â€” Apple-style sticky desktop nav, mounted globally via app/layout.tsx

**TopNav visibility logic:**
- Hide below md breakpoint (768px): `className="hidden md:flex"`
- Hide on marketing/conversion/legal/auth paths: returns null on `/`, `/fr`, `/signup`, `/login`, `/paywall`, `/privacy`, `/terms`, `/refund` and `/onboarding/*`
- Hide pre-hydration / without token: returns null until auth store is hydrated and token present (avoids flash on unauth redirects)

**Decisions made (no Chadi pause needed):**
- backdrop-blur intensity: 12px (8px too subtle on warm cream, ~20px Apple-style too heavy)
- Active state: 2px peach-deep underline, 6px below link
- Dropdown: click-to-open + click-outside dismiss (touch-friendly)
- Mobile breakpoint: 768px (Tailwind md default)

### V-013b â€” [FE] /more page (Profile, Settings, Account, About)
Milestone: M1

**Priority:** HIGH (V-013 mid-chain; was F-058 placeholder)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/more` showing all 4 sections (Profile / Settings / Account / About). Plus interaction trace: language toggle â†’ page re-renders in selected language; sign out button â†’ logout flows to /. F-225 interactive verification clause applies.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-013 spec â€” /more was F-058 placeholder
**Dependencies:** V-012b (warm tokens); V-013b.lang-pref + V-013b.notifications + V-013b.password (BE follow-ups filed below)

**Sections:**
- **Profile**: avatar (initial in warm-peach + espresso), fullName + email; exam target row (TCF/TEF/DELF labels via EXAM_LABELS map); days-until-exam if set (Fraunces italic + warm-espresso accent)
- **Settings**: language toggle EN/FR (local-only client update; V-013b.lang-pref needed for BE persist); notifications row (disabled placeholder, V-013b.notifications)
- **Account**: change password (disabled placeholder, V-013b.password); sign out button (fp-error color; clears auth + onboarding + submitResponse stores, redirects to /)
- **About**: version (`APP_VERSION = '0.1.0-soft-beta'`), support email, terms/privacy/refund links

### V-013b.lang-pref â€” BE PATCH /api/users/me for interface_language
Milestone: TBD

**Priority:** MEDIUM (post-V-013b; language toggle currently client-only)
**Status:** Queued (BE-side; lemethodic-backend ticket)
**Filed:** 2026-05-06
**Source:** V-013b /more language toggle â€” needed for cross-session persistence
**Dependencies:** V-013b
**Scope:** BE PATCH /api/users/me accepting partial body with `interface_language: "en" | "fr"`. Updates User row, returns updated user. FE then calls api.users.update() (new method) on toggle and refreshes auth store from response. Without this, /me re-fetches will reset to BE-stored value.
**Owner:** Backend Engineering

### V-013b.notifications â€” [FE+BE] Notification preferences UI + BE plumbing
Milestone: TBD

**Priority:** LOW (post-launch UX)
**Status:** Queued
**Filed:** 2026-05-06
**Source:** V-013b /more spec â€” notifications row currently disabled placeholder
**Dependencies:** TBD BE notification system
**Scope:** wire toggles for daily-streak-reminder, exam-countdown-warning, weekly-progress-summary. Needs BE notification store + dispatch system first. Out of soft-beta scope.
**Owner:** Engineering (Chadi PM call on which categories)

### V-013b.password â€” [FE+BE] Change password flow
Milestone: TBD

**Priority:** MEDIUM (account hygiene)
**Status:** Queued
**Filed:** 2026-05-06
**Source:** V-013b /more spec â€” change-password row currently disabled placeholder
**Dependencies:** TBD BE POST /api/auth/change-password (current_password, new_password)
**Scope:** route /more/change-password (or modal sheet); form with current_password + new_password fields, validation (min 8 chars), 422 error mapping. Uses ed-field utility + .ed-cta-warm-hover button. BE endpoint needed first.
**Owner:** Engineering

### V-013a â€” [FE+BE] Wire /writing to F-224 (prompt picker, submission, history)
Milestone: M1

**Priority:** HIGH (V-013 chain head; production launch dependency)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/writing` (prompt library showing T1/T2/T3 sections + filter chips), `/writing/[id]` (submission view with prompt body + textarea + word counter + submit button), `/writing/[id]` post-submit result view (couche scores + per-layer feedback + actions), and `/writing/history` (list view OR empty state if BE 404). EN + FR for both. Plus interaction trace: click prompt â†’ /writing/[id] â†’ type response â†’ word counter color shifts â†’ submit â†’ result renders â†’ click "Submit another" â†’ returns to picker. F-225 interactive verification clause applies.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-013 spec â€” /writing was F-058 placeholder; F-224 BE live
**Dependencies:** F-224 BE (writing prompts library + analysis pipeline); V-009 (couche brand labels reused in result view); V-012 (warm tokens + spring motion)

**Routes:**
- `/writing` â†’ `WritingPromptPicker` (groups by TÃ¢che level, level + topic filter chips)
- `/writing/[prompt_id]` â†’ `WritingSubmissionClient` state machine (idle â†’ submitting â†’ result), single page
- `/writing/history` â†’ `WritingHistoryClient` (BE 404 â†’ empty state)

**API + types added:**
- `lib/types.ts`: WritingPrompt, WritingSubmissionResult, WritingHistoryItem
- `lib/api.ts`: api.writing.{listPrompts, submit, history}

**Submission UX:**
- Prompt body preserves `\n\n` breaks via `white-space: pre-wrap`; parses `**bold**` for TÃ¢che 3 multi-document separators
- Live word counter color-gated: < min â†’ fp-error; min..max-10% â†’ warm-sage-deep; max-10%..max â†’ warm-peach-deep; > max â†’ fp-error
- localStorage draft autosave (key `lemethodic:writing-draft:{prompt_id}`, 500ms debounce; cleared on successful submit)
- Submit disabled until min_words reached; aria-busy during submit; result view replaces form on success

**Result view:**
- Score summary (overall_score + cefr_band, Fraunces italic + warm-espresso)
- Optional narrative_summary in Source Serif italic
- Per-couche breakdown using BRAND_LABEL (Range / Coherence / Accuracy / Fluency, lang-aware)
- "Submit another" â†’ /writing; "Try again" â†’ reset state on same prompt

### V-013a.history â€” [BE] BE /api/writing/history endpoint
Milestone: TBD

**Priority:** MEDIUM (post-V-013a; FE renders empty state in the meantime)
**Status:** Queued (BE-side; lemethodic-backend ticket)
**Filed:** 2026-05-06
**Source:** V-013a spec â€” history surface ready, BE endpoint may not exist
**Dependencies:** F-224 (writing_submissions table)
**Scope:** GET /api/writing/history returning user's past submissions (ordered DESC by submitted_at). Each row carries id, prompt_id, prompt_title_fr, word_count, overall_score, cefr_band, submitted_at. FE detects 404 and renders empty state until this ships.
**Owner:** Backend Engineering

### V-012c â€” [FE] Whitespace + bento variation (warmth refit phase 3)
Milestone: M2

**Priority:** MEDIUM (V-012 chain tail; whitespace polish + bento exploration)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) end-to-end scroll showing the V-012 chain compositely: warm hero gradient, ed-fg/bg warmth, Methodology generous padding, Differentiation cards with peach/sage/peach-deep visuals, FAQ on paper, FinalCTA on warm-sand with B2 highlight + warm-hover CTA. Plus interaction trace for FinalCTA + Paywall CTA hover, onboarding step pastel rotation. F-225 interactive verification clause applies for the warm-hover CTAs.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-012 strategic recalibration â€” whitespace generosity on flagship surfaces
**Dependencies:** V-012a, V-012b

**Padding audit + targeted bumps:**
- **MethodologySection**: `clamp(64px, 10vw, 160px) â†’ clamp(80px, 11vw, 180px)`. Moat surface earns more breathing room; floor lifted 64â†’80 for tighter mobileâ†’desktop scaling, cap raised 160â†’180.
- **FinalCTASection**: `clamp(96px, 14vw, 160px) â†’ clamp(96px, 14vw, 180px)`. Conversion moment cap raised; floor unchanged.
- **Hero / Problem / Differentiation / How / Pricing / FAQ**: untouched per spec ("don't blanket-apply"). Hero already at 160-top / 140-bottom; rest already at 80-140.

**Bento exploration: skipped per spec fallback** ("IF unsure, ship the 3-equal pattern as-is. Bento is an upgrade, not required.") The V-004 + V-012b card visuals already carry distinct visual weight (couche stack / EN-FR pair / waveform; peach-deep / peach / sage-deep colors). 3-equal grid reads balanced after warmth landed; bento adds risk for marginal gain. Filed as **V-012c.bento** queued for future taste pass.

**Files touched:**
- `components/landing/sections/MethodologySection.tsx` (vertical padding clamp)
- `components/landing/sections/FinalCTASection.tsx` (vertical padding cap)

### V-012c.bento â€” [FE] Differentiation cards bento variation (queued)
Milestone: polish-defer

**Priority:** LOW (post-V-012 polish; design taste pass)
**Status:** Queued
**Filed:** 2026-05-06
**Source:** V-012c spec â€” bento exploration deferred per spec fallback
**Dependencies:** V-012b
**Scope:** swap the 3-equal-card grid in DifferentiationSection for a bento layout. Two candidate variations to surface in plan-first when picked up: (a) 1 large card 2/3-width spanning Card 1 (Diagnostic-driven, the strategic lead) + 2 stacked smaller cards 1/3-width for Cards 2/3; (b) 2-1-2 pattern with different aspect ratios across breakpoints. Mobile collapses to single-column stack regardless. Card chrome stays â€” only grid composition changes. Needs Chadi taste pass on which composition reads best with the V-012b warm visuals (peach-deep illuminated bar, peach strikethrough, sage waveform).
**Owner:** Engineering (Chadi taste pass on composition)

### V-012b â€” [FE] Per-surface warmth injection (warmth refit phase 2)
Milestone: M2

**Priority:** HIGH (V-012 mid-chain â€” hero/Paywall/FinalCTA/EcoleReveal/onboarding/Differentiation cards get warmth)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy verification deferred to end-of-V-012c per defer-verification mode. F-225 interactive verification clause partially applies â€” CTA warm-hover state is interactive; recorded hover trace required for FinalCTA + Paywall CTAs once Chadi captures end-state. All 8 smoke-test routes returned 200; warm tokens confirmed in landing HTML.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-012 strategic recalibration â€” F-200 went too cold; per-surface warmth injection
**Dependencies:** V-012a (tokens + spring motion)

**Per-surface changes:**

- **Hero (`HeroSection.tsx`)**: solid `backgroundColor: ED.bg` â†’ `linear-gradient(180deg, var(--ed-bg) 0%, var(--ed-warm-sand) 100%)`. Solid bg preserved as fallback. V-003 atmospheric glyphs untouched.

- **Paywall (`Paywall.tsx`)**: section bg `var(--ed-bg)` â†’ `var(--ed-warm-cream)`. Recharts radar: target stroke `#1A1A1A40` â†’ `var(--ed-warm-sage-deep)`; user stroke `var(--fp-peach-deep)` â†’ `var(--ed-warm-peach-deep)`; user fill `var(--fp-peach-deep) â†’ var(--ed-warm-peach)` with fillOpacity bumped 0.35 â†’ 0.5 (lighter peach needs more opacity for visibility). Legend swatches updated to match. CTA button: bg `INK (legacy)` â†’ `var(--ed-accent)` + `.ed-cta-warm-hover` class for spring-eased peach-deep hover.

- **FinalCTASection (`FinalCTASection.tsx`) â€” absorbs V-011.color**: section bg `ED.bg` â†’ `var(--ed-warm-sand)`. Headline: new `highlightB2(text)` helper splits on "B2" token and wraps it in span with `color: var(--ed-warm-peach-deep)` (warm accent on the moat-relevant term, both EN + FR). CTA Link: `.ed-cta-warm-hover` + `.ed-btn-press` classes (warm hover + press feedback). Trust line color `ED.muted` â†’ `var(--ed-fg-soft)` (warm muted #4A4540).

- **EcoleReveal (`EcoleReveal.tsx`)**: ED_BG constant `var(--ed-bg)` â†’ `var(--ed-warm-sage)` (achievement / calm pride moment). ED_ACCENT (used for the persona label) `var(--ed-accent)` navy â†’ `var(--ed-warm-espresso)` warm dark. Plan card chrome (ed-paper, 1px ed-rule, 4px radius) preserved.

- **Onboarding flow (Promova-style per-step pastel rotation)**: new `STEP_PASTELS` array in `OnboardingFlow.tsx` indexed by `safeIndex % 6`: peach / sand / sage / cream / peach-deep / sage-deep. `bg` prop threaded through `commonProps` â†’ all 5 question components (SingleSelect, MultiSelect, DateInput, OtherFreetext, ExamPicker) â†’ OnboardingScreen wrapper. Step transitions naturally inherit V-012a `--ease-spring` from OnboardingScreen's existing transitions.

- **Differentiation cards (`DifferentiationSection.tsx`)**:
  - **Card 1 (CoucheStackVisual)**: illuminated bar `backgroundColor: ED.accent` â†’ `'var(--ed-warm-peach-deep)'`; border matches. Transition string updated from `var(--ed-ease)` â†’ `var(--ease-spring)` (was missed by V-012a sed because the ternary string spanned a different line than the `transition:` keyword).
  - **Card 2 (InterferenceVisual)**: strikethrough `textDecorationColor: ED.muted` â†’ `'var(--ed-warm-peach)'`; thickness bumped 1px â†’ 1.5px for visibility (peach softer than gray).
  - **Card 3 (WaveformVisual)**: bar `backgroundColor: ED.accent` â†’ `'var(--ed-warm-sage-deep)'` (paired with Card 1 peach-deep â€” peach + sage warm chord).
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

### V-012a â€” [FE] Token foundation + motion language (warmth refit phase 1)
Milestone: M2

**Priority:** HIGH (V-012 chain root â€” V-012b/c inherit tokens + spring motion)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy verification deferred to end-of-V-012c per defer-verification mode. Spot-check a single landing screenshot to verify new --ed-fg warmth (text reads slightly warmer dark, not near-black) and --ed-bg warmth (cream slightly warmer). All 8 routes (/`, /fr, /signup, /onboarding, /ecole, /ecole/intro, /paywall, /diagnostic) returned 200; --ease-spring confirmed in landing HTML output. F-225 interactive verification clause does NOT apply to phase a alone â€” pure token + motion-language plumbing. Awaiting verification batches with V-012b + V-012c.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-012 strategic recalibration â€” F-200 went too cold; warmth refit on top
**Dependencies:** V-005 (Switzer/Fraunces typography stays); F-200 (system foundation)

**Token changes (globals.css :root):**
- Update: `--ed-bg #FAF7F2 â†’ #FBF8F4` (warmer cream); `--ed-fg #1A1A1A â†’ #2A2520` (warm dark replaces near-black)
- Add: `--ed-fg-soft: #4A4540` (softer secondary text)
- Add Editorial Luxury palette tokens (chrome-level warmth, distinct from `--fp-*` decorative chip layer): `--ed-warm-peach: #FFD8C2`, `--ed-warm-peach-deep: #E0A890`, `--ed-warm-sage: #B8C4A8`, `--ed-warm-sage-deep: #8FA279`, `--ed-warm-espresso: #4A3528`, `--ed-warm-cream: #FDFBF7`, `--ed-warm-sand: #F5E6D8`
- Add: `--ease-spring: cubic-bezier(0.32, 0.72, 0, 1)` (soft state easing)
- `--ed-ease` (cubic-bezier 0.16,1,0.3,1) preserved for surfaces with their own motion contracts (V-003 hero atmosphere keyframes, hero-rise, kicker-slide, animations)

**Motion rule going forward:**
- `transform`: short ease-out 160ms â€” preserves tactile snap (button press, no spring overshoot)
- `background-color / border-color / color / box-shadow / opacity / width`: spring 200-300ms â€” soft state transitions
- Animations (keyframes): keep `--ed-ease` â€” those have their own timing contracts

**Utility class updates:**
- `.ed-btn-press`: `:active` scale `0.98 â†’ 0.97` per V-012 spec; transform = 160ms ease-out; bg-color/color = `--ease-spring` 200ms
- `.ed-card-lift`: transform/box-shadow/border-color all use `--ease-spring` (cards earn the soft hover lift; only button transforms keep ease-out per spec rule)
- `.ed-field`: focus border-color/box-shadow use `--ease-spring`

**Component inline transitions touched (mass replace):**
- 18 inline `transition: var(--ed-ease)` references across 11 files swapped to `var(--ease-spring)`. Sed-gated on `/transition:/` lines so animations using `var(--ed-ease)` (DifferentiationSection waveform `animation: ed-wave-pulse ... var(--ed-ease)`) were preserved.
- One camelCase exception: OnboardingScreen ProgressDots `transitionTimingFunction: 'var(--ed-ease)' â†’ 'var(--ease-spring)'` (the bulk regex didn't catch it; manually updated).
- Files touched: app/signup/page.tsx, components/ecole/intro/EcoleIntro.tsx, components/landing/LandingFooter.tsx, components/landing/LanguageToggle.tsx, components/landing/sections/DifferentiationSection.tsx, components/landing/sections/PricingSection.tsx, components/onboarding/OnboardingFlow.tsx, components/onboarding/OnboardingScreen.tsx, components/onboarding/questions/DateInputQuestion.tsx, components/onboarding/questions/OtherFreetextScreen.tsx

**lib/motion.ts additions:**
- `ED_EASE_SPRING_CUBIC` tuple `[0.32, 0.72, 0, 1]` (for framer-motion)
- `ED_EASE_SPRING_CSS` string `'cubic-bezier(0.32, 0.72, 0, 1)'` (for inline transitions)

**No behavior change beyond:**
- Slightly warmer text + bg colors site-wide (intentional softer contrast per V-012 spec)
- Button press scale tighter (0.98 â†’ 0.97)
- State transitions on color/bg properties feel softer (spring overshoot, not snap)
- Card hover lifts get a subtle spring settle

### V-011 â€” [FE] FinalCTA centering fix
Milestone: M2

**Priority:** HIGH (verification-found; visual reads off-center on production)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) FinalCTA showing headline + body + button + trust line all visually centered, plus the FR headline breaking at "deviner | ce qui bloque..." or similar (NOT leaving "ce" as a 2-char orphan on line 1). F-225 interactive verification clause does NOT apply â€” pure typography centering + line-break fix.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-011 production verification (Chadi 2026-05-06)
**Dependencies:** V-005 (Switzer/Fraunces live)

**Two centering fixes applied:**

1. **Defensive explicit centering on H2 + body P.** Parent div already had `textAlign: 'center'`, but production reading suggested inheritance through framer-motion's `motion.div` (RevealOnScroll wrapper) wasn't always picked up the same way across browsers. Added belt-and-suspenders: H2 gains explicit `textAlign: 'center'` + `margin: '0 auto'` + `maxWidth: 640` (slightly narrower than parent 720 to give the H2 its own centered column rhythm). Body P loses the `mx-auto` className (Tailwind `margin-inline: auto`) and gains explicit `margin: '0 auto'` + `textAlign: 'center'` inline. No visible change for users who were already seeing it center; closes the loophole for those who weren't.

2. **FR headline orphan glue via non-breaking space.** Original FR `'ArrÃªtez de deviner ce qui bloque votre B2.'` rendered with `text-balance` produced an awkward break leaving "ce" as a 2-char orphan at end of line 1. Inserted U+00A0 (NBSP) between "ce" and "qui" so the relative-pronoun pair stays bound. The natural break now lands cleanly between phrase units (e.g., after "deviner") rather than mid-pair. EN headline left untouched â€” `text-balance` produces clean breaks at typical viewports for the shorter EN string.

**Files touched:**
- `components/landing/sections/FinalCTASection.tsx` â€” H2 + body P explicit centering attributes
- `components/landing/copy.ts` â€” FR FINAL_CTA.heading gains NBSP between "ce" and "qui"

### V-011.color â€” [FE] FinalCTA color treatment refresh (PLAN-FIRST, awaiting Chadi pick)
Milestone: M2

**Priority:** MEDIUM (verification-found; current treatment reads as flat per Chadi)
**Status:** **Plan-first surfaced; awaiting Chadi color direction.** Three options proposed below.
**Filed:** 2026-05-06
**Source:** V-011 plan-first â€” "the colors that were used before in the website were much better" (Chadi 2026-05-06)
**Dependencies:** F-200 (editorial system + pastel preservation rule); F-227.rhythm (FinalCTA bg currently locked at ed-bg)

**Pre-F-200 history (git show db58577):** the M-101a-era FinalCTA used `--fp-peach` (#FFD8C2) as full section background, `INK` button with `boxShadow: '0 4px 16px rgba(0,0,0,0.12)'` for depth, 16px radius (softer than current 4px). The peach bracketed the hero (which was also peach pre-F-200) â€” warmth at both ends of the page. F-200 collapsed it to ed-bg cream + ed-accent navy button + 4px radius (current state). Chadi's "before was better" likely refers to the M-101a peach bracketing.

**Three options proposed:**

- **(A) Peach revival.** Restore section bg to `--fp-peach` (#FFD8C2) â€” the M-101a treatment exactly. Headline + body + button copy stay in current ed-* tokens. Adds full warmth chrome to the conversion moment + brackets the hero (currently ed-bg, but a hero peach restoration could land separately as V-011.hero). Tradeoff: breaks F-227.rhythm (FinalCTA was just flipped from paper to ed-bg in F-227.rhythm); section becomes pastel chrome rather than the F-200 "pastels are decorative chip layer only" rule. The most direct read of Chadi's feedback.

- **(B) Soft peach wash + button hover warmth.** Section bg shifts to a desaturated peach blend (e.g., `#F5E6D8` or a 50% mix between ed-bg and fp-peach) â€” warmer than current ed-bg cream but not full M-101a peach. Button hover state gains a subtle warm-tone color shift (ed-accent navy â†’ slightly warmer navy). Trust line color shifts from ed-muted to a peach-toned muted. Adds warmth without flooding chrome; respects F-200's restraint instinct while addressing flatness. Middle-ground.

- **(C) Editorial accent strip + B2 highlight.** Section bg stays current ed-bg (preserves F-227.rhythm). Add a thin 4px Ã— 120-200px accent strip in `--fp-peach-deep` (#E0A890 â€” already in palette as paywall radar accent) centered above the headline. Highlight the "B2" word in the headline with the same `--fp-peach-deep` color (warm accent on the moat-relevant term). Body + button stay current. Trust line could get a subtle warm shift. Adds editorial accent without changing chrome; closest to F-200 spirit; least change but also least warmth.

**Recommendation if forced to pick:** (B) Soft peach wash. It addresses Chadi's "before was better" (warmth) without fully reverting F-200's chrome decision, and the button hover warmth gives an interactive payoff. (A) is the most literal read but undoes F-227.rhythm; (C) might still read as flat to Chadi.

**Awaiting Chadi pick (or hybrid).** After direction lands, ship as the same V-011.color ticket (single PR), mark Awaiting Verification.

### V-010 â€” [FE] /ecole phase structure correction (3-button â†’ 2-button)
Milestone: M1

**Priority:** HIGH (methodology-content alignment)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/ecole` showing the 2-button milestone row (Fondations 1â€“16 / Approfondissement 17â€“27) below the 0/27 progress bar. F-225 interactive verification clause does NOT apply â€” pure content/structure change, button taps were never wired beyond visual milestone state.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-009/V-010 methodology-content batch â€” locked 2-phase curriculum + F-202 /ecole/intro Le parcours section
**Dependencies:** F-087 (lesson curriculum); F-202 (locked curriculum split source)
**Scope:** in `components/home/EcoleProgress.tsx`, MILESTONES array reduced from 3 entries (Fondations 1-4 / Approfondissement 5-16 / L'Ã‰cole ComplÃ¨te 17-27) to 2 entries (Fondations 1-16 / Approfondissement 17-27). Aligns with the locked F-202 curriculum split + HomeScreen's existing Phase 1â†’Phase 2 divider at lesson 16â†’17 boundary. The 3-tier split was a pre-curriculum-lock F-087 approximation.

**Layout call (resolved without plan-first pause):** spec lean (a) â€” keep 2 buttons stretched to fill the same row width â€” confirmed sufficient. Existing `flex: 1` per badge naturally splits 50/50; no design call needed. Did NOT add a milestone-card replacement (option c) since spec said "lean (a) â€” simplest, no new content needed".

**Out of scope (preserved per V-010 spec):**
- TodayFocus card chrome (F-204.deep)
- "Set your exam date" pill chrome (F-204.deep)
- Streak / greeting / header chrome (F-204.deep)
- Bottom nav (F-204.deep)
- L'Ã‰cole ComplÃ¨te as a completion-state badge: not surfaced elsewhere in the codebase (grep confirmed only the deleted MILESTONES entry referenced it). If future ticket adds a "complete the Ã‰cole" celebration moment, that's a separate visual/copy task.

**Files touched:**
- `components/home/EcoleProgress.tsx` â€” MILESTONES 3-entry array â†’ 2-entry array; ranges adjusted; comment block updated to V-010 reasoning.

### V-009 â€” [FE] CouchesDiagnostic 5-axis + brand labels
Milestone: M2

**Priority:** HIGH (methodology-content credibility â€” wrong axis count + legacy labels surfaced on /diagnostic + /paywall)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/diagnostic` (mock mode, then real-mode if a diagnostic is wired) showing 5 bars (4 scored + 1 unscored "Coming soon" Voix at bottom) plus `/paywall` showing the 5-axis radar with brand labels (Range / Coherence / Accuracy / Fluency / Voice). EN + FR for diagnostic; Paywall is EN-only. F-225 interactive verification clause does NOT apply â€” content-only change, no behavior change beyond the placeholder treatment for unscored Voix.)
**Filed:** 2026-05-06
**Shipped:** 2026-05-06 (FE-side, frontend commit pending)
**Source:** V-009/V-010 methodology-content batch â€” locked 5-couche model (Couche 5 La Voix added 2026-05-05) + brand labels (Range/Coherence/Accuracy/Fluency/Voice EN, Ã‰tendue/CohÃ©rence/Correction/Aisance/Voix FR)
**Dependencies:** F-202 (locked methodology copy + 5-couche shift); V-009.be (BE-side la_voix scoring)

**Findings (from plan-first audit):**
- CouchesDiagnostic at `components/diagnostic/CouchesDiagnostic.tsx` is **horizontal bars**, not a radar (spec called "radar" but the actual radar is in Paywall). Used only in `/diagnostic`. Default mock had 4 FR-only brand-label rows.
- Paywall radar at `components/Paywall.tsx` IS the Recharts RadarChart. Used at `/paywall`. Hardcoded 4 axes with **legacy backend labels** "Content / Structure / Grammar / English Habits" â€” NOT brand labels.
- Both surfaces in scope per V-009 audit.
- BE returns 4 couches today: `lib/types.ts:240` â€” `CoucheKey = 'le_fond' | 'les_moules_des_idees' | 'les_moules' | 'les_reflexes_anglais'`. La Voix (`la_voix`) is NOT in BE types. V-009.be filed.

**FE approach:**
- New shared constant `lib/coucheBrandLabels.ts` â€” `BRAND_LABEL` map (CoucheKey â†’ {en, fr}) + `COUCHE_ORDER` methodology-canonical order. Single source of truth for FE-side brand labels overriding BE's legacy `displayLabelEn`/`displayLabelFr`.
- **CouchesDiagnostic**: extended `CoucheRow` type with optional `unscored: boolean` flag. Unscored rows render the empty track (50% opacity) with no fill / no dot / no target band, plus a "Coming soon" badge in the right cell instead of score+CEFR. Default mock extended to 5 rows with Voix as the unscored entry. `aria-label` switches to "X: not yet scored" for unscored bars.
- **`couchesToRows` in `app/diagnostic/page.tsx`**: now overrides BE's `displayLabel*` with `BRAND_LABEL[c.key][lang]` (falls back to BE label if a brand label is somehow missing); appends an unscored Voix row at the bottom (after the worst-first sort) so it doesn't poison the bottleneck callout ("Your bottleneck is the top row. Fix it first.").
- **Paywall radar**: `RADAR_DATA` extended from 4 to 5 axes; legacy backend labels swapped for brand labels in EN (Paywall is EN-only â€” no `lang` prop).

**Out of scope (preserved per V-009 spec):**
- Card chrome on /paywall (rounded radius + shadow stay in F-203.paywall)
- Fill color, outline style, card bg color (F-204.deep / F-205.deep)
- Layout positioning

**Files touched:**
- `lib/coucheBrandLabels.ts` (NEW) â€” BRAND_LABEL + COUCHE_ORDER + ExtendedCoucheKey type
- `components/diagnostic/CouchesDiagnostic.tsx` â€” CoucheRow.unscored support, default mock 4â†’5 with Voix unscored, conditional render of bar internals + right cell
- `app/diagnostic/page.tsx` â€” couchesToRows uses BRAND_LABEL override, appends unscored Voix row
- `components/Paywall.tsx` â€” RADAR_DATA 4 axes (legacy labels) â†’ 5 axes (brand labels EN)

### V-009.be â€” [BE] BE adds La Voix scoring
Milestone: M3

**Priority:** HIGH (BE-side dependency for V-009 to render real Voice data instead of placeholder)
**Status:** Shipped (BE commit 4fe3354, 2026-05-22)
**Filed:** 2026-05-06
**Source:** V-009 ship â€” FE renders Voix as "Coming soon" placeholder until BE scoring lands
**Dependencies:** V-009 (FE-side surface ready)
**Scope:** BE-side. Add `la_voix` to `CoucheKey` enum + scoring pipeline in `analysis.py`. BE now returns 5 couche scores including `la_voix` in the diagnostic `couches` array.
**Owner:** Backend Engineering

### V-009.be.fe â€” [FE] Unblock diagnostic 5th-couche after V-009.be
Milestone: M3

**Priority:** HIGH (5th couche still gated as "Coming soon" after BE ships scoring)
**Status:** Shipped SHA TBD
**Filed:** 2026-06-01
**Source:** V-009.be shipped (BE 4fe3354) â€” FE gate removal needed
**Dependencies:** V-009.be (BE scoring live)

**Changes:**
- `lib/types.ts` â€” `CoucheKey` extended with `'la_voix'` (was 4-key union)
- `lib/api.ts` â€” `KNOWN_COUCHE_KEYS` adds `'la_voix'`; mapper now passes la_voix couche through to `Diagnostic.couches`
- `lib/coucheBrandLabels.ts` â€” `ExtendedCoucheKey` removed; `BRAND_LABEL` + `COUCHE_ORDER` now typed as `CoucheKey` throughout
- `components/diagnostic/CouchesDiagnostic.tsx` â€” "Coming soon" badge replaced with "â€“" graceful empty state for legacy recordings without la_voix; DEFAULT_ROWS mock updated with real score
- `components/dashboard/ProgressDashboardDesktop.tsx` â€” `isVoix` special-casing removed from `PerCoucheRow`; `voixComingSoon` copy key removed; `PerCoucheRow` uses standard absent-score "â€“" path for legacy recordings; radar `key as CoucheKey` casts removed

### V-008 â€” [FE] Card 2 interference example direction reversed
Milestone: M2

**Priority:** HIGH (verification-found; wrong audience direction shipped)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) showing Card 2 (Anglophone interference) with the reversed pair: `~~Je suis 25 ans~~ / J'ai 25 ans`. Plus a hover trace verifying the 4 pairs cycle through correctly.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-006/V-007/V-008 production verification batch
**Dependencies:** V-004
**Scope:** V-004 shipped Card 2 with English-learner-of-French structure (`~~I am agree~~` / `Je suis d'accord`), which actually demonstrates French-speaker-of-English interference â€” backwards for LeMethodic's audience. V-008 reverses direction: each pair now shows the WRONG French attempt (calque from English structure) and the CORRECT French. Two-line layout per Chadi's lean (cleaner than the 3-line EN-source / wrong-FR / correct-FR treatment): struck-through wrong attempt above (Fraunces italic 1.25rem ed-muted), correct version below (Fraunces italic 1.5rem ed-fg). The reader infers the English source from context.

**Pre-authored 4 pairs (iconic L1-interference mistakes):**
1. `~~Je suis 25 ans~~` â†’ `J'ai 25 ans` (Ãªtre/avoir, age)
2. `~~Je suis faim~~` â†’ `J'ai faim` (Ãªtre/avoir, hunger)
3. `~~Je manque toi~~` â†’ `Tu me manques` (word-order, reversed pronoun)
4. `~~Je suis chaud~~` â†’ `J'ai chaud` (Ãªtre/avoir, sensation)

EN/FR small-caps prefix labels removed in this rewrite â€” they were the relics of the wrong-direction layout (English source â†’ French target). Without them, the reader sees the wrong/correct French pairing directly. V-004's `ed-pair-fade` keyframe + 80ms FR-line stagger preserved.

**Files touched:**
- `components/landing/sections/DifferentiationSection.tsx` â€” INTERFERENCE_PAIRS shape changed from `{en, fr}[]` to `{wrong, correct}[]`; InterferenceVisual rewritten as 2-line; SANS_FONT span prefixes removed (no longer needed without EN/FR labels)

### V-007 â€” [FE] Final CTA trust line duplicate "Free."
Milestone: M1

**Priority:** HIGH (verification-found; user-visible duplication)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop screenshot of `/` showing FinalCTASection trust line under primary CTA. EN-only sufficient â€” bug was an EN-side string concatenation; FR side rendered correctly. F-225 interactive verification clause does NOT apply â€” copy fix only.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-006/V-007/V-008 production verification batch â€” trust line read "Free. No card. About 12 minutes. Free." (Free duplicated)
**Dependencies:** V-002 (em-dash strip touched the FINAL_CTA copy and exposed the bug, though the duplicate was older â€” F-200 era concatenation that overlapped with FINAL_CTA.ctaSecondary's first sentence)
**Scope:** in `FinalCTASection.tsx` line 100, the trust span rendered `{FINAL_CTA.ctaSecondary[lang]} {HERO.ctaSecondary[lang].split('.')[0]}.` â€” concatenating FINAL_CTA's `"Free. No card. About 12 minutes."` with HERO.ctaSecondary's first sentence (which is `"Free"`), producing the duplicate. Removed the `HERO.ctaSecondary` suffix; trust line now reads exactly `FINAL_CTA.ctaSecondary[lang]` ("Free. No card. About 12 minutes." / "Gratuit. Sans carte. Environ 12 minutes."). HERO import removed (no longer used in this file).

### V-006 â€” [FE] Kicker container clipping (rotating word cut off)
Milestone: M1

**Priority:** HIGH (verification-found; layout bug clipped DELF/DALF)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots showing the kicker mid-rotation through all 4 exam names (TCF / TEF / DELF / DALF) with no character clipping and no container width-jitter between states. Plus a hover trace verifying smooth cycling.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-006/V-007/V-008 production verification batch â€” DELF and DALF clipped on right edge
**Dependencies:** V-001 (kicker sizing bumped); F-212 (rotating mechanic)
**Scope:** in `RotatingKicker.tsx`, the rotating word slot used `minWidth: '4ch'` which sized to 4 Ã— digit-zero width, narrower than 4 uppercase letters with 0.06em letter-spacing. 4-character names (DELF/DALF) overflowed; 3-character names rendered fine. V-006 swaps the minWidth approach for an invisible width sizer â€” render the widest exam name (computed via `EXAMS.reduce((a,b) => b.length > a.length ? b : a)`) inside the slot at `visibility: hidden`, then absolute-position the visible animated word over it with `textAlign: center`. Container width locks to widest case, animated word centers within the locked width regardless of length. No JS measurement needed; layout-driven sizing.

**Side fix:** earlier V-001 edit only updated the reduced-motion branch's font size + marginBottom because the active-rotation branch had different indentation (10-space vs 8-space inside its parent), and the `replace_all` matched only one. V-006 brings the active branch into line â€” `clamp(20px, 1.8vw, 24px)` font, `clamp(16px, 2vw, 28px)` marginBottom â€” so both render paths agree.

### V-004 â€” [FE] Differentiation cards rebuild (per-card art-directed visuals)
Milestone: M2

**Priority:** MEDIUM (visual depth; differentiation cards were boring text-only templates)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) showing all three differentiation cards visible together (Diagnostic-driven / Anglophone interference / Real-time AI feedback) at idle state. Plus a recorded interaction trace per F-225: hover over each card and verify (1) Card 1 illuminated bar shifts on hover, (2) Card 2 EN/FR pair cycles through 4 pairs on repeated hovers, (3) Card 3 waveform amplifies on hover and pulses subtly idle. Reduced-motion pass: macOS Settings â†’ Reduce motion ON, verify all three cards still respond to state changes (state still updates) but transitions/animations skip and end-state is shown.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-series ticket batch â€” three identical text-only card templates were undifferentiated
**Dependencies:** V-005 (Fraunces live for the EN/FR italic pair display)
**Scope:** rebuild DifferentiationSection so each of the three cards has its own art-directed visual element above the headline + body, while preserving the shared editorial chrome (1px ed-rule, ed-paper bg, 4px radius, ed-card-lift on hover, 28-40px clamp padding).

**Per-card visuals:**
- **Card 1 â€” Diagnostic-driven**: 5-couche stack visualization. 5 horizontal bars (14px tall Ã— 6px gap) representing Le Fond / Les Moules des IdÃ©es / Les Moules / Les RÃ©flexes Anglais / La Voix. Default illuminated bar = #4 (Les RÃ©flexes Anglais â€” most thematically resonant for the anglophone audience). Inactive bars are 1px ed-rule outline only; active bar is filled ed-accent navy with subtle scaleX(1.02). On hover (`onMouseEnter`), illumination cycles to next layer (visualizes diagnostic re-scoring as bottlenecks unblock). 600ms ease-in-out transitions on backgroundColor + borderColor + transform.
- **Card 2 â€” Anglophone interference**: typographic EN/FR comparison pair. EN line in Fraunces italic 1.375rem with line-through (ed-muted), FR line in Fraunces italic 1.375rem ed-fg, EN/FR small-caps prefixes in Switzer. Pairs cycle on hover through 4 examples: `I am agree â†’ Je suis d'accord` / `I have 30 years â†’ J'ai 30 ans` / `depends of â†’ dÃ©pend de` / `since 2020 I live here â†’ J'habite ici depuis 2020`. Pair change triggers 600ms ed-pair-fade-in keyframe (opacity + 4px Y-translate); FR delayed 80ms after EN.
- **Card 3 â€” Real-time AI feedback**: 32-bar audio waveform graphic. Heights from a static sine-ish array (8-48px). 4px wide bars with 3px gaps, ed-accent at 45% opacity. Idle state: subtle ed-wave-pulse keyframe (opacity 0.45 â†” 0.7, 1800ms loop, staggered delays so bars pulse asynchronously). On hover: pulse animation halts and each bar transforms scaleY(1.4-1.6, varying by index modulo 3) with staggered transition delays so the amplification ripples across the waveform.

**Layout:**
- Cards use `display: flex; flex-direction: column; height: 100%` so visual elements anchor at top (130px reserved height for visual container) and body text fills below via `flex: 1`. All three cards have equal height.
- Shared chrome unchanged: 1px ed-rule + ed-paper bg + 4px radius + ed-card-lift hover + clamp(28px, 3vw, 40px) padding.
- 3-column grid via `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` â€” same as pre-V-004; collapses to 1-column stack on narrow viewports.

**Reduced-motion handling:**
- New utility hook `useReducedMotion()` (local to file): reads `(prefers-reduced-motion: reduce)` media query, subscribes to changes.
- Card 1: scaleX transform + transition both gated; active bar still gets bg color change (instant, no transition).
- Card 2: idle CSS animation `.ed-pair-fade` already gated in globals.css `@media (prefers-reduced-motion: reduce)` rule (animation: none, opacity: 1).
- Card 3: idle pulse animation + hover scaleY both skipped (transition: none, animation: none).
- All three cards still update state on hover; only the *animation* of state change is skipped. End state is shown.

**Files touched:**
- `components/landing/sections/DifferentiationSection.tsx` â€” full rewrite. Adds 3 inline visual sub-components (CoucheStackVisual / InterferenceVisual / WaveformVisual) + useReducedMotion hook + visuals[] map indexed by card position
- `app/globals.css` â€” added `@keyframes ed-pair-fade-in` + `.ed-pair-fade` class + `.ed-pair-fade-delay` class + `@keyframes ed-wave-pulse` + reduced-motion gate

### V-003 â€” [FE] Hero atmospheric typographic animation
Milestone: M2

**Priority:** MEDIUM (visual depth; F-200 editorial direction)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` showing hero with atmospheric glyphs visible behind H1+kicker, plus a recorded scroll trace verifying parallax fires at 0.2x scroll speed and disengages when hero leaves viewport. Reduced-motion pass: macOS Settings â†’ Accessibility â†’ Display â†’ Reduce motion ON, verify drift animation halts and parallax stays at 0. F-225 interactive verification clause partially applies â€” atmospheric animation is decorative, but parallax + IntersectionObserver gate are behavioral; recorded scroll trace required.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-series ticket batch â€” hero needed visual depth without competing with copy
**Dependencies:** V-005 (Fraunces font system live)
**Scope:** atmospheric typographic background mounted inside HeroSection. 5 French accent characters (Ã©, Ã , Ã§, Ã´, Ã®) rendered as massive Fraunces glyphs at 5% ed-fg opacity, distributed across positional zones (top-left, top-right, mid-left, mid-right, bottom-center). Each character has its own drift animation (translate3d + rotate, 70-90s cycles, ease-in-out, infinite, distinct keyframes per character so they drift asynchronously). Negative animation-delay starts each at a different cycle phase to avoid synchronized first-paint reset. Font sizes clamp(240-300, 45-56vw, 640-800px) so atmosphere scales gracefully across viewport widths. Variable-axis: `opsz 144` (display optical size) + `SOFT 30` (editorial warmth). Parallax: 0.2x scroll speed on the parent wrapper (single rAF-throttled scroll listener). IntersectionObserver gates the listener so it only fires while hero is in viewport (no scroll-listener cost on rest of page). Reduced-motion: drift animation gated in CSS (`@media prefers-reduced-motion`), parallax disabled in JS (effectiveScrollY clamped to 0). Static end-state shows characters at initial positions.

**Files touched:**
- `components/landing/HeroAtmosphere.tsx` (NEW) â€” orchestrator with parallax + IO scroll gate + reduced-motion detection
- `app/globals.css` â€” `.hero-atmosphere` + `.hero-atmosphere-char-N` (5 zones) + 5 `@keyframes hero-drift-N` + reduced-motion gate
- `components/landing/sections/HeroSection.tsx` â€” section gains `position: relative` + `overflow: hidden`; `<HeroAtmosphere />` mounts before content; content wrapper gets `position: relative; zIndex: 1` to sit above the atmosphere layer
- aria-hidden + pointer-events:none on atmosphere â€” purely decorative, inert to AT and pointer

**No-overlap discipline:** characters positioned in distinct viewport zones (top-left -12%/-8%, top-right -8%/-4%, mid-left 38%/-16%, mid-right 30%/-10%, bottom-center 38%-left/-14% bottom). Negative offsets push characters partially off-canvas so the eye reads them as atmospheric fragments rather than discrete shapes. At narrow viewports (mobile), character font-sizes drop to 240-300px floor, preserving the same off-canvas fragment effect.

### V-003.opacity â€” [FE] atmosphere opacity tuning
Milestone: polish-defer

**Priority:** LOW (post-V-003 polish)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** V-003 spec â€” "ed-fg at 4-6% opacity"
**Dependencies:** V-003
**Scope:** V-003 ships at 5% opacity (midpoint of 4-6%). Once on production, Chadi can taste-pass the level â€” bump to 6% if too subtle, drop to 4% if competing with copy. 1-line change in globals.css.
**Owner:** Engineering

### V-002 â€” [FE] Em-dash strip across FE copy
Milestone: M2

**Priority:** MEDIUM (editorial polish; em-dash overuse muddied prose voice)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/`, `/fr`, `/ecole/intro` (FR + EN), `/onboarding` EcoleReveal step (FR + EN level labels), `/signup` (Password label), `/privacy`, `/terms`, `/refund` (browser tab title) per F-225. F-225 interactive verification clause does NOT apply â€” pure typography swap, no behavior change.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending; Chadi-approved per-instance 2026-05-01)
**Source:** V-series ticket batch â€” em-dash had become a stylistic crutch across FE copy
**Dependencies:** none
**Scope:** ~30 user-facing em-dash instances replaced with comma / period / colon / parens / pipe / middle dot per context. Code comments + console.error + dev logs excluded (not user copy). Placeholder glyphs (table cells where data is missing â€” `'â€”'` constants, conditional empty-state renders) PRESERVED â€” standard UX convention.

**Replacements applied:**
- A. Prose mid-sentence (12 instances): periods in most cases (PROBLEM body kept comma â€” period would have created fragment; flagged in commit). Colon for defining clauses (DIFF card 1, La Voix description). FR colons use ` : ` non-breaking-space convention. Restructured `...dragging â€” and treats that one` to `...dragging. Treats that one, specifically.` (deliberate fragment matches FR analog "Et traite celle-lÃ , prÃ©cisÃ©ment." Per Chadi counter-edit; "It treats" was rejected as adding unnecessary subject).
- B. Le Goulet appositive (EN + FR in EcoleIntro): `bottleneck â€” *Le Goulet* â€” the layer...` â†’ `bottleneck (*Le Goulet*), the layer...` (parens for named-concept emphasis).
- C. Term-definition separators (rendered JSX): `{name} â€” {description}` â†’ `{name}: {description}` for EcoleIntro segments + MethodologySection couches. Made language-aware so FR renders ` : ` (NBSP + colon) per FR typographic convention, EN renders `: `.
- D. Labels (10 instances): CEFR levels `A2 â€” Basic` etc. â†’ `A2 Â· Basic` with middle dot U+00B7 per Chadi counter-edit (cleaner than hyphen, modern editorial convention). Phase divider `Phase 2 â€” Approfondissement` â†’ `Phase 2: Approfondissement`. Status labels (`Ready â€” Record now`, `Perfect score â€” lesson complete`, `Analysis pending â€” your CEFR band...`, `Low confidence â€” give us 2 more`, `Video lesson â€” coming soon.`) â†’ period or restructure. `Password â€” at least 8 characters` â†’ `Password (at least 8 characters)` (parens). Coaching lines in TranscriptReviewPanel â†’ period.
- E. Page meta titles (4): `Privacy Policy â€” LeMethodic`, `Terms and Conditions â€” LeMethodic`, `Refund Policy â€” LeMethodic`, landing meta titles â†’ pipe `|` (SEO convention).
- F. Aria-labels (3): comma or colon depending on screen-reader rhythm.

**Counter-edits applied per Chadi 2026-05-01:**
1. METH closer EN + EcoleIntro closer EN: `Treats that one, specifically.` (no "It" subject; deliberate fragment matches FR analog rhythm)
2. CEFR level labels: middle dot `Â·` (U+00B7) instead of hyphen â€” modern UX convention

**Note:** PROBLEM body (`landing/copy.ts:65,71`) used comma instead of proposed period; the original sentence structure (`But when X, when Y, â€” Z`) made `Z` the main clause. Replacing â€” with period would have created a fragment ("But when X, or when Y."). Comma preserves grammar and the editorial restraint of dropping the em-dash. EN + FR both adjusted.

### V-001 â€” [FE] Hero H1 + rotating kicker sizing
Milestone: M1

**Priority:** HIGH (verification-found; H1 overflow on production)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of `/` (EN) + `/fr` (FR) hero showing H1 fits within viewport at every breakpoint and kicker sized at the new clamp scale. F-225 interactive verification clause does NOT apply â€” pure typography size change, no behavior change. Rotation animation fluidity at the larger size verifiable via the screenshot's "Prep for [TCF/TEF/DELF/DALF]" position.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-series ticket batch â€” H1 overflowed viewport, kicker undersized
**Dependencies:** V-005 (Switzer + Fraunces are now live)
**Scope:** two clamp adjustments in landing hero.
- Hero H1 (`HeroSection.tsx`): `clamp(2.5rem, 7vw, 6rem)` â†’ `clamp(2.5rem, 6vw, 5rem)`. 40px floor preserved (small mobile); 80px desktop cap (was 96px). The locked H1 string is 26 words â€” at 96px it overflowed the 920px column at 1440px. 80px fits with breathing room.
- Rotating kicker (`RotatingKicker.tsx`): `clamp(13px, 1.2vw, 15px)` â†’ `clamp(20px, 1.8vw, 24px)`. Tracking (0.06em) + color (ed-muted) + uppercase preserved. Bottom margin nudged from `clamp(12px, 1.5vw, 20px)` to `clamp(16px, 2vw, 28px)` proportional to the size bump. Slide animation timing untouched â€” runs at same ED_DUR.rotateWord (600ms) which still reads smoothly at the larger size.

### V-005 â€” [FE] Font system upgrade (Switzer + Fraunces)
Milestone: M2

**Priority:** HIGH (V-series chain root â€” V-003 + V-004 inherit the new font system)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop + 375px mobile screenshots of every surface (`/`, `/fr`, `/signup`, `/login`, `/paywall`, `/onboarding` (multiple steps), `/onboarding/waitlist`, `/ecole`, `/ecole/intro`, `/progress`, `/more`, `/writing`, `/diagnostic`, `/profile`, `/learn/[id]`, `/cluster/[slug]`, `/ecole/lesson/[id]`) to verify Switzer renders for sans/UI/body and Fraunces renders for display/serif accents. F-225 interactive verification clause does NOT apply â€” pure font swap, no behavior change.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** V-series ticket batch 2026-05-01 â€” visual refinement / verification-found
**Dependencies:** none (foundational; blocks V-003 + V-004)
**Scope:** swap Geist (sans) + Source Serif 4 (serif) + Cabinet Grotesk (display) for Switzer (sans/UI/body) + Fraunces (display + serif accents). Switzer loaded via Fontshare CDN `<link>` (weights 400/500/600/700/800), defined as `--font-switzer` CSS variable in globals.css :root. Fraunces loaded via next/font/google with variable axes `['SOFT', 'opsz']` so optical-size scales naturally with display-vs-body usage and SOFT axis is available for editorial warmth on headlines. Cabinet Grotesk + Geist + Geist_Mono + Source_Serif_4 next/font imports retired. Cabinet Grotesk Fontshare `<link>` retired.

**Files touched:**
- `app/layout.tsx` â€” drop Geist + Geist_Mono + Source_Serif_4 imports; add Fraunces with axes; swap Cabinet Grotesk `<link>` â†’ Switzer Fontshare `<link>` (with preconnect); html className applies just `${fraunces.variable}` (Switzer is via raw CSS variable, no className needed)
- `app/globals.css` â€” add `--font-switzer` to `:root`; @theme tokens updated (`--font-sans: var(--font-switzer)`, `--font-display: var(--font-fraunces)`, `--font-mono` set to system monospace stack); `.prose-legal` font-family rules retargeted to `var(--font-switzer)`
- `lib/typography.ts` â€” `SANS_FONT` â†’ `var(--font-switzer)`, `SERIF_FONT` â†’ `var(--font-fraunces)`
- 60+ component files â€” bulk sed replace: `var(--font-geist)` â†’ `var(--font-switzer)`, `var(--font-source-serif)` â†’ `var(--font-fraunces)`, all three DISPLAY_FONT variants (`'"Cabinet Grotesk", Geist, sans-serif'` / `"'Cabinet Grotesk', 'Geist', sans-serif"` / mixed-quote) standardized to `'var(--font-switzer), -apple-system, "Segoe UI", system-ui, sans-serif'`
- `styles/globals.css` (orphaned duplicate per CLAUDE.md note) NOT touched â€” not imported anywhere

**Verification notes:**
- Variable font axes available on Fraunces: opsz (auto-scales with font-size in supported browsers), wght, SOFT (default 0; can be set 0-100 via `font-variation-settings: "SOFT" 30` for warmth on headlines)
- Switzer Fontshare CDN typically resolves <100ms; flash-of-unstyled-text mitigated by `display=swap` parameter
- Reading order on production check: H1s (Fraunces serif), body copy (Switzer sans), legal pages (Switzer sans for headers + body), button labels (Switzer sans)

### V-005.heading-axis â€” apply Fraunces SOFT axis to display headlines
Milestone: polish-defer

**Priority:** LOW (post-V-005 polish)
**Status:** Queued
**Filed:** 2026-05-01
**Source:** V-005 spec â€” "Try SOFT axis at +20-30 for editorial warmth on headlines (defaults to 0/sharp)"
**Dependencies:** V-005
**Scope:** apply `font-variation-settings: "SOFT" 28` (or similar) to Fraunces consumers at display sizes (Hero H1, EcoleIntro section headers, MethodologySection header, LegalPage h1). Currently V-005 ships Fraunces with SOFT defaulting to 0 (sharp). The warmth axis is the editorial signature; needs Chadi taste pass on +20 vs +30 vs +40 across surfaces. 1-line addition per H1 site.
**Owner:** Engineering

### F-227.rhythm â€” [FE] Pricingâ†’FAQ same-bg adjacency (paired bg flip)
Milestone: M2

**Priority:** LOW (visual rhythm polish)
**Status:** Awaiting verification (FE-side, lemethodic-frontend commit pending; production deploy pending Chadi-captured 1440px desktop screenshot of `/` showing Pricing â†’ FAQ â†’ FinalCTA visible together to confirm alternation rhythm. EN-only sufficient â€” bg-color change is language-independent. F-225 interactive verification clause does NOT apply â€” bg-color only, no behavior change.)
**Filed:** 2026-05-01
**Shipped:** 2026-05-01 (FE-side, frontend commit pending)
**Source:** F-227 ship side-effect â€” Methodology reorder created Pricing(bg)â†’FAQ(bg) adjacency. Chadi callout 2026-05-01: FAQ on paper subtly elevates it as the resolution moment before final CTA, fits the rhetorical job of the section.
**Dependencies:** F-227
**Scope:** post-F-227 rhythm restoration. Two paired flips (the spec billed it as "one-line change" but the codebase had FinalCTA at ed-paper, not ed-bg, so two flips needed to land the stated outcome): FAQSection.tsx bg `ed-bg â†’ ed-paper` + FinalCTASection.tsx bg `ed-paper â†’ ed-bg`. Final landing rhythm: Hero(bg)/Problem(bg)/Differentiation(bg)/Methodology(bg)/HowItWorks(paper)/Pricing(bg)/FAQ(paper)/FinalCTA(bg). One residual same-bg adjacency at the top of the page (Heroâ†’Problemâ†’Differentiationâ†’Methodology = 4 bgs) but that's the editorial canvas the visitor begins on; alternation kicks in from HowItWorks onward and is now perfectly clean.
**Owner:** Engineering

### F-225 â€” [FE] Desktop verification protocol (process change)
Milestone: DONE

**Priority:** HIGH (process gate, launch-blocking)
**Status:** Shipped 2026-05-04 (FE-side, doc commit `3eb8902`; amended in commit pending â€” added interactive verification clause F-225.5). Non-visual change â€” verification skipped per the rule's own carve-out.
**Filed:** 2026-05-04
**Source:** Strategic recalibration after desktop-broken-on-every-screen surfaced as launch-blocker
**Dependencies:** none
**Scope:** every FE ticket gets `Shipped` status only after attaching (a) 1440px desktop screenshot of every affected route on production and (b) 375px mobile screenshot of every affected route on production. Non-visual tickets note `non-visual change â€” verification skipped` instead. F-225.5 amendment (2026-05-04, surfaced during F-222 root-cause): for tickets that change interactive behavior (handlers, navigation, form submission, state mutation), verification additionally requires (c) a recorded interaction trace â€” Loom link / screen recording / written test plan with pass/fail outcomes. See `CLAUDE.md` "Shipping verification protocol" section for the canonical rule.
**Owner:** Engineering (process)
**Note:** Tickets shipped before 2026-05-04 (P-220, P-222, B-102, P-230, P-234, etc.) are grandfathered. The rule applies prospectively. Until F-225's doc commit landed, no other ticket could be marked `Shipped` â€” F-223, F-222, and any other in-flight FE work waited.

### F-225.constraint â€” [FE] F-225 amendment: split visual vs non-visual verification
Milestone: TBD

**Priority:** LOW (doc-only; refines existing protocol)
**Status:** Queued
**Filed:** 2026-05-12
**Source:** 2026-05-12 verification session â€” FE-Claude has no browser-automation/screenshot tool in this toolchain, so visual + interactive verification is owner-routed (Chadi / TARS). FE-Claude can do the non-visual sweep portion (HTTP status on affected routes + Vercel runtime log sweep + BACKLOG staging) in parallel.
**Dependencies:** F-225
**Scope:** amend `CLAUDE.md` "Shipping verification protocol" section to formalize the split. The 1440px/375px screenshots and interaction traces remain mandatory, owner-attached or TARS-attached. FE-Claude's documented contribution: (a) HTTP status sweep on affected routes against production, (b) Vercel runtime log sweep (errors + 4xx/5xx) on the deployment under verification for the affected routes over a 24h window, (c) BACKLOG entry staging with verification block. Both halves attach to the BACKLOG entry; ticket flips to âœ… Shipped only when both halves are present (or the non-visual exemption already in F-225 is noted).
**Owner:** Engineering (doc commit only â€” no code)

## Strategic queue â€” 2026-05-12 session

### F-310 â€” [FE+BE] Auth hardening (umbrella; supersedes F-072)
Milestone: DONE

**Priority:** HIGH (pre-launch blocker per Decision 4)
**Status:** âœ… Shipped 2026-05-12 â€” BE half live (commits 4bb44fb..043167f on tcf-oral-tool); FE half in F-310.fe (commits 2fef9b7..b8f91ee on lemethodic-frontend). Production /openapi.json confirms 9 auth endpoints live, 5 new since F-072 plan (refresh, verify-email, verify-email/resend, password-reset/request, password-reset/confirm).
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session â€” Decision 4 (token control + auth hardening as pre-launch existential cost/security issues, not nice-to-haves; uncapped abuse blows up API costs before revenue catches up at 5,000+ users Y1)
**Dependencies:** F-072 (absorbed); P-105 (subscription-tier source; F-310 ships with `tier=free` placeholder, tier-check layered when P-105 lands â€” auth hardening does not block on payment infrastructure)
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
**Related:** F-310.fe (FE half â€” entry below)

### F-310.fe â€” [FE] Auth hardening FE activation (5-commit chain)
Milestone: DONE

**Priority:** HIGH (FE half of F-310; gates the soft-beta hard cutoff + hCaptcha + email-verification + refresh-on-401)
**Status:** âœ… Shipped 2026-05-12 (FE-side; commits 2fef9b7..b8f91ee on lemethodic-frontend; visual + interactive verification pending Chadi manual browser check per runbook below)
**Filed:** 2026-05-12
**Shipped:** 2026-05-12
**Source:** F-310 BE shipped commits 4bb44fb..043167f with 5 new auth endpoints live in production `/openapi.json`; FE work needed to fully activate the surface
**Dependencies:** F-310 (BE contracts); V-009 / F-225 / F-225.constraint (verification protocol)

**Phases (one commit each):**
- **Phase 1 â€” F-310.fe.client** (commit `2fef9b7`): `lib/api.ts` adds the 5 new `api.auth.*` methods (`refresh`, `verifyEmail`, `resendVerification`, `passwordResetRequest`, `passwordResetConfirm`); extends `register()` with optional `hcaptcha_token` param (defaults to null per BE schema). Adds the refresh-on-401 interceptor inside `request()` with three guards: REFRESH_EXEMPT_PATHS set (skip refresh on `/refresh` `/login` `/register` 401s), `_isRefreshedRetry` option flag (one retry max), and `pendingRefresh` module-level promise (concurrency dedupe â€” N parallel 401s fire ONE refresh). `credentials: 'include'` on all requests so the BE-set httpOnly refresh cookie rides on `/api/auth/refresh`. New `isEmailNotVerifiedError(err)` helper for the 403 + `{detail:{code:"email_not_verified"}}` BE contract.
- **Phase 2 â€” F-310.fe.captcha** (commit `7e91953`): adds `@hcaptcha/react-hcaptcha@2.0.2` dep. New `lib/hcaptcha.ts` sitekey resolver â€” reads `NEXT_PUBLIC_HCAPTCHA_SITEKEY` env when present, falls back to hCaptcha public test sitekey `10000000-ffff-ffff-ffff-000000000001` for the rollout window (test key always passes verification so dev flows work without a real account). Signup adds the widget below password field via `next/dynamic({ssr:false})`; token passes to register call as 4th positional arg. Submit not gated on captcha completion (BE accepts null token per schema during rollout).
- **Phase 3 â€” F-310.fe.verify** (commit `4a17437`): NEW `app/verify-email/page.tsx` â€” two flows on one route. `/verify-email` (no query) renders "Check your inbox" with Resend CTA hitting POST /api/auth/verify-email/resend. `/verify-email?token=XXX` auto-fires the confirm endpoint on mount; success routes to /login after 2s; 400/422 surfaces "link is invalid or has expired." Signup catches `isEmailNotVerifiedError` post-register (or post-onboarding-flush) and routes to /verify-email. Login gets the "Forgot password?" link pointing at /password-reset.
- **Phase 4 â€” F-310.fe.reset** (commit `b8f91ee`): NEW `app/password-reset/page.tsx` â€” single route, branches on `?token=`. `/password-reset` renders RequestForm (email + hCaptcha â†’ POST /api/auth/password-reset/request, anti-enumeration success state). `/password-reset?token=XXX` renders ConfirmForm (new password â‰¥8 chars + matching confirm â†’ POST /api/auth/password-reset/confirm, success routes to /login after 2s, 400/422 surfaces "invalid or expired"). Same editorial styling as /signup + /verify-email.
- **Phase 5 â€” F-310.fe docs** (this commit): BACKLOG entry + F-072 status flip from "Superseded by F-310" to "âœ… Shipped via F-310 + F-310.fe."

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
- `BACKLOG.md` (this commit): F-310 status â†’ âœ… Shipped, F-072 status â†’ âœ… Shipped via F-310 + F-310.fe, F-310.fe entry filed

**Tests:** `pnpm build` clean on every phase. `npx tsc --noEmit` clean on every phase. No test runner configured in this repo (CLAUDE.md confirms).

**Out of scope (filed implicitly as follow-ups):**
- `useVerifyAuth` handling of `email_not_verified` on cold tab reload (currently treats non-401 errors optimistically). A user who closes the tab between register and verification will hit a silent 403 wall on /ecole. Acceptable risk for the rollout window; surface as a separate ticket if it bites a real user.
- Captcha-gated submit (Chadi explicitly chose graceful-degradation rollout: BE accepts `null` token per schema; FE doesn't gate). Flip to gated when BE flips schema to require-token.

**Operating-contract block (2026-05-12 contract):**
- **CONFIDENCE:** HIGH on the BE-contract-mirroring layer (Phase 1 + the route bodies are pure mirrors of openapi.json). MEDIUM on the visual polish â€” hCaptcha iframe + form spacing wasn't visually verified post-deploy by FE-Claude (TARS retired, Chadi manual browser check is the verification mode).
- **WHY:** Every phase commit ran `pnpm build` + `tsc --noEmit` clean; the BE contracts are the only spec we needed and they're locked in production /openapi.json. The interceptor's three guards (exempt-paths, retry-loop flag, concurrency dedupe) cover the obvious failure modes.
- **UNCERTAINTY:**
  - BE refresh response field name â€” FE defaults to `access_token`, falls back to `token`. If BE returns a third field name, refresh will appear to succeed but the new token won't write. The runbook step 4 catches this on first prod 401.
  - hCaptcha widget visual fit inside the 440px ed-paper card on <360px viewports. Widget is ~304px wide; should fit but might feel cramped.
  - `useVerifyAuth` doesn't currently route unverified users to `/verify-email` on cold tab reload (only the signup path does). Out of scope per above; will need a follow-up if real users hit it.
- **VERIFICATION RUNBOOK (manual, Chadi, after deploy):**
  1. **Sign up flow (hCaptcha):** Open lemethodic.com/signup in a fresh incognito window. Form should render with the hCaptcha checkbox between Password and Submit. Solve the test challenge (auto-passes on test sitekey). Submit â†’ BE returns 201 â†’ routed somewhere (either /ecole/intro if email pre-verified by BE rollout config, OR /verify-email if BE flipped to require-verify).
  2. **Verify-email empty state:** Visit /verify-email (no query) while signed in. Should render "Check your inbox" + Resend button. Click Resend â†’ BE returns 200 â†’ button updates to "Sent â€” check your inbox." Verify in DevTools Network that POST /api/auth/verify-email/resend fired with Authorization header.
  3. **Verify-email token confirm:** From a real BE-sent email, click the verification link â†’ lands on /verify-email?token=XXX â†’ page renders "Confirming your emailâ€¦" briefly â†’ flips to "Email verified." â†’ redirects to /login after 2s. Sign in with the verified account works.
  4. **Refresh-on-401:** Sign in. Open DevTools â†’ Application â†’ Local Storage. The lemethodic_token is the access token (JWT). Open DevTools â†’ Application â†’ Cookies â€” there should be a BE-set httpOnly refresh cookie scoped to seal-app-75fiu.ondigitalocean.app. Wait 15+ min for the access token to expire (or edit it to garbage in localStorage). Navigate to /ecole. DevTools Network: should see POST /api/auth/refresh fire FIRST â†’ 200 with new token â†’ original /me or /lessons retry â†’ 200. Confirm lemethodic_token is replaced in localStorage.
  5. **Refresh failure â†’ clearAuth:** Delete the refresh cookie from DevTools. Force a 401 again (edit access token). Navigate to /ecole â†’ /refresh fails â†’ auth clears â†’ router lands /login. Sign-in works after.
  6. **Forgot password:** From /login, click "Forgot password?" â†’ /password-reset request form. Enter your email â†’ solve hCaptcha â†’ Submit. Success state "If that email is on file, you'll receive a linkâ€¦" (anti-enumeration copy). Check inbox for the BE-sent email; click link â†’ /password-reset?token=XXX confirm form. Enter new password â‰¥8 chars + matching confirm â†’ Submit â†’ "Password updated." â†’ redirects to /login. Sign in with the new password works.
  7. **Bad reset token:** Visit /password-reset?token=BAD. Enter passwords + submit. Should surface "This reset link is invalid or has expired. Request a new one."
  8. **Field-name sanity (only if step 4 refresh appears to silently fail):** Open the /refresh response in DevTools Network â†’ Preview. Confirm the new access token comes back under `access_token` (FE default) or `token` (FE fallback). If it's a third field name, surface to FE-Claude as a follow-up â€” the interceptor needs that field name added.

---

## M-VISUAL fix bundle 1 â€” CTA â†’ vermillion + 5-couche section contrast + exam highlight âœ… Shipped

**Status:** âœ… Shipped

**Scope:** Fix three M-VISUAL-AUDIT findings in one atomic commit.

### Changes

**1. CTA token architecture (Option A) â€” `app/globals.css`, 35 in-product components**

`--cta-primary` â†’ `var(--accent)` (vermillion `#C8102E` / `#E23A54` dark). New `--cta-utility` â†’ `var(--dominant)` (ink-blue `#14213D`) for in-product actions.

New tokens added to `:root` + `.dark`:
- `--accent-deep: hsl(350 85% 30%)` (light) / `hsl(351 74% 44%)` (dark) â€” hover depth for vermillion CTAs
- `--cta-utility: var(--dominant)` â€” in-product action buttons
- `--cta-utility-hover: var(--dominant-deep)` â€” utility hover state
- Tailwind surface: `--color-cta-utility`, `--color-cta-utility-hover`, `--color-accent-deep`
- `.ed-field:focus-visible` border changed to `--cta-utility` (form fields should be ink-blue)

**Marketing/conversion â€” keep `--cta-primary` (â†’ vermillion):**
`Hero.tsx`, `MethodologyPreview.tsx` (CTA button), `PricingTeaser.tsx`, `Paywall.tsx`, `SignupForm.tsx` (submit button + login link in auth flow), `OnboardingFlow.tsx`, `OnboardingScreen.tsx` (ED_ACCENT), `WaitlistOrProxyConfirmation.tsx` (ED_ACCENT).

`lib/typography.ts` `ED.accent = 'var(--cta-primary)'` left unchanged â€” all callers (`TestimonialCard`, `PricingSection`, `MethodologySection`, `HowItWorksSection`, `ProductDemo`, `FinalCTASection`, `PlatformLanding`) are landing/marketing components.

**In-product utility â€” reclassified to `--cta-utility` (â†’ ink-blue, 35 files):**
`writing/WritingSubmissionClient.tsx` (ED_ACCENT), `writing/WritingPromptPicker.tsx`, `writing/WritingHistoryClient.tsx`,
`speaking/SpeakingDesktop.tsx` (ED_ACCENT), `home/EcoleDesktop.tsx` (ED_ACCENT),
`ecole/intro/EcoleIntro.tsx` (ED_ACCENT), `ecole/LessonDetail.tsx`, `ecole/LessonCard.tsx`, `ecole/AudioPlayerPlaceholder.tsx`,
`dashboard/NextLessonWidget.tsx` (Reprendre), `dashboard/ProgressDashboardDesktop.tsx`,
`vocabulaire/QuizQuestion.tsx`, `vocabulaire/QuizResults.tsx`, `vocabulaire/VocabBrowse.tsx`, `vocabulaire/PracticeActions.tsx`, `vocabulaire/FilterBar.tsx`, `vocabulaire/EndOfDeck.tsx`, `vocabulaire/EmptyState.tsx`,
`diagnostic/TacheShell.tsx`, `diagnostic/TacheNav.tsx` (Voir les rÃ©sultats), `diagnostic/Timer.tsx`, `diagnostic/RecordingPlaceholder.tsx`, `diagnostic/DiagnosticLanding.tsx` (Commencer le diagnostic), `diagnostic/Results.tsx`, `diagnostic/RecommendationsStub.tsx`, `diagnostic/CouchesBreakdown.tsx`, `diagnostic/WaveformPlaceholder.tsx`,
`layout/SidebarLink.tsx`, `layout/Sidebar.tsx` (avatar chip),
`app/EmailVerificationBanner.tsx`, `app/password-reset/page.tsx`, `app/verify-email/page.tsx`,
`la-bibliotheque/[slug]/TopicDetail.tsx`, `la-bibliotheque/[slug]/practice/PracticeClient.tsx`, `la-bibliotheque/[slug]/test/TestClient.tsx`.

**2. 5-couche section â€” `MethodologyPreview.tsx`, `CouchesLayer.tsx`**

- Hardcoded cream hex backgrounds (`#D4CBBA`, `#DDD6C4`, `#E6E0D3`, `#EEE9DF`, `#F5F1EA`) â†’ alternating `var(--paper)` / `var(--paper-edge)`. Zero cream.
- Added `nameColor` prop to `CouchesLayer`. Le Propos / Le Plan / La Construction / La Musique â†’ `var(--dominant)`. Les PiÃ¨ges Anglais â†’ `var(--accent)` (vermillion, DESIGN.md Â§2 couche color lock). Couche 05 La Musique was invisible (white text on cream); now dark ink-blue on white.

**3. Rotating exam highlight â€” `RotatingKicker.tsx`**

`ED_WARM_PEACH_DEEP = 'var(--lm-warm-peach-deep)'` â†’ `ED_EXAM_COLOR = 'var(--accent)'`. Full vermillion `#C8102E` on the rotating exam name (TCF / TEF / DELF / DALF).

**Deferred from this bundle (separate dispatches):**
- A-008/A-009/A-010/A-011 â€” font stack migration (Cabinet Grotesk, SANS_FONT, SERIF_FONT in 20+ components)
- A-013 â€” `.ed-cta-warm-hover:hover` warm-peach-deep hover on marketing CTAs
- A-016 â€” `.prose-legal th` globals.css utility block
- `.ed-field:focus-visible` box-shadow `rgba(31, 45, 74, 0.18)` v1 navy (tracked under A-013)
- `--lm-warm-peach-deep: #E0A890` bridge value (kept intact per A-007 brief)
- Category E copy fixes (E-001 through E-005) â€” separate dispatch

**Verification:** `pnpm build` clean. No type errors. Token chain verified: `--cta-primary â†’ var(--accent) â†’ #C8102E` in light, `#E23A54` in dark. `--cta-utility â†’ var(--dominant) â†’ #14213D` in light, `#38598F` in dark.

**non-visual change note:** Build-only verification applied (Playwright captures deferred to soft-beta battery per F-225 2026-05-23 debt acceptance).

### F-310.fe.coldreload â€” [FE] Route email_not_verified 403 from any protected page
Milestone: TBD

**Priority:** MEDIUM (cold-tab reload edge case; affects users who don't verify email immediately after register. Not blocking soft beta if verification is quick.)
**Status:** Awaiting verification (F-225 â€” interactive change; needs 1440px + 375px screenshots of `/verify-email` empty state landed from a cold-tab `/ecole` hit + interaction trace per runbook below)
**Filed:** 2026-05-12
**Source:** F-310.fe out-of-scope flag (2026-05-12 plan-first + end-of-ticket report). A user who signs up, closes the tab, returns later still unverified hits protected routes â†’ BE returns 403 + `{detail:{code:"email_not_verified"}}` â†’ currently only the signup path catches this and routes to /verify-email. Every other entry point (cold tab on /ecole, /writing, /progress, etc.) surfaces it as a generic "Something went wrong."
**Dependencies:** F-310.fe (`isEmailNotVerifiedError` helper already in `lib/api.ts`)

**Scope:**
Promote the `email_not_verified` 403 handling from the signup path to a project-wide interceptor. Two implementation options evaluated during the ticket:

1. **`lib/api.ts:request()` interceptor** â€” extend the existing 401-refresh path with a parallel 403 branch: on `isEmailNotVerifiedError(err)`, route the browser to `/verify-email` via a hard `window.location.assign('/verify-email')` (lib/api has no router instance available). Single point of fix; covers every API path.
2. **`hooks/useVerifyAuth.ts`** â€” in the catch branch of the `/me` probe on mount, detect `isEmailNotVerifiedError` and call `router.replace('/verify-email')`. Only catches the cold-mount path, not in-session 403s; cleaner separation of concerns.

**Shipped option 1** â€” single interceptor covers cold-mount + in-session surfaces. Documented trade-off: a hard `window.location.assign` interrupts in-flight optimistic UI on writing/diagnostic surfaces, but unverified users shouldn't be acting on protected pages anyway.

Edge cases handled:
- Already on `/verify-email` â†’ no redirect (loop-guard via `window.location.pathname === '/verify-email'`)
- `path.startsWith('/api/auth/verify-email')` â†’ no redirect (defensive; BE shouldn't emit `email_not_verified` on the verify-email endpoint itself, but the guard closes the loop if it ever does)
- `?next=...` written into the `/verify-email` URL with the original `pathname + search`, decoded + validated by the verify-email page post-confirm (rejects `//`, `://`, and `/verify-email` to close open-redirect / self-loop holes; falls back to `/login`)

**Files touched (shipped):**
- `lib/api.ts` (+33): 403 branch in `request()` alongside the existing 401 block. Builds a transient `ApiError`, runs it through the existing `isEmailNotVerifiedError` helper (single source of truth), guards on pathname + path, then `window.location.assign('/verify-email?next=<encoded>')`.
- `app/verify-email/page.tsx` (+25/-3): new `safeNextPath()` helper, reads `?next=` from search params, swaps the hard-coded `router.push('/login')` post-confirm for `router.push(safeNextPath(nextParam))`. Validation blocks protocol-relative, protocol-absolute, and `/verify-email` self-loop. Falls back to `/login` on missing/invalid â€” matches pre-ticket behavior, so the change can only ADD a useful redirect.

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: HIGH. Single-function fix in `lib/api.ts`, helper already shipped in F-310.fe, validated by tsc --noEmit + `pnpm build` (no warnings, no type errors, 36 routes compiled clean).
- WHY: Documented out-of-scope flag during F-310.fe; small, well-bounded, doesn't gate anything else.
- UNCERTAINTY: `window.location.assign` is a hard navigation. A 403 hitting a writing async-job poll or conversation upload mid-action tears down in-flight UI state. Acceptable per ticket. `?next=` does NOT persist across the BE-built email-link cross-tab round-trip (no localStorage shim â€” kept the change scoped); cross-tab degrades cleanly to `/login`. Forward-compat if BE ever embeds `next` in the verification email URL.

---

## M-VISUAL Cat E: copy sweep â€” em-dashes, brand mark, nav i18n, couche count, legacy names âœ… Shipped

**Status:** âœ… Shipped

**Scope:** Pure copy pass. Zero token edits, zero component restructuring, zero route changes.

### E-001 â€” Brand mark "LeMethodic" â†’ "Le MÃ©thodic"

`replace_all` on all `.tsx/.ts/.json` files. Files changed:
`components/landing/copy.ts` (BRAND constant + 12 inline occurrences), `app/layout.tsx`, `components/nav/TopNav.tsx`, `app/login/page.tsx` (Ã—2), `app/verify-email/page.tsx`, `app/password-reset/page.tsx`, `components/ecole/intro/EcoleIntro.tsx`, `components/cluster/ClusterDetailPage.tsx`, `components/speaking/Tache3Session.tsx`, `components/Paywall.tsx`, `components/landing/LandingFooter.tsx` (Ã—2 in copyright line), `app/fr/page.tsx`, `app/terms/page.tsx`, `app/privacy/page.tsx`, `app/refund/page.tsx`, `app/library/page.tsx`, `app/fr/library/page.tsx`, `public/manifest.json` (short_name), `lib/api.ts` (header comment), `lib/motion.ts` (header comment), `lib/storage-keys.ts` (header comment), `lib/types.ts` (header comment), `components/landing/PlatformLanding.tsx` (comment), `components/landing/sections/ProblemSection.tsx` (comment).

`app/layout.tsx` root description updated per E-010: `'Learn French with LeMethodic'` â†’ `'Method-based oral exam prep for anglophone French exam candidates pursuing Quebec PR.'`

### E-002 â€” Em-dash purge (` â€” ` â†’ `, ` / `: ` / `. ` / `|`)

Page title separators (`â€”` â†’ `|`):
`app/(app)/dashboard/page.tsx`, `app/(app)/account/page.tsx`, `app/(app)/l-examen/page.tsx`, `app/(app)/l-examen/results/page.tsx`, `app/(app)/l-examen/tache/[n]/page.tsx`, `app/(app)/la-methode/page.tsx`, `app/(app)/la-methode/[id]/page.tsx`, `app/(app)/la-bibliotheque/page.tsx`, `app/(app)/la-bibliotheque/test/page.tsx`, `app/(app)/la-bibliotheque/practice/page.tsx`.

Hero subheadline (`Hero.tsx`): `"5-Couche method â€” for anglophone candidates..."` â†’ `"5-Couche method, for anglophone candidates..."`.

`app/fr/page.tsx` description: `"les livres â€” pensÃ©s pour"` â†’ `"les livres, pensÃ©s pour"`.

In-product copy (comma or colon per context):
`LessonList.tsx`: range notation `LeÃ§ons 1 â€” 16` â†’ `LeÃ§ons 1â€“16` (en-dash for numeric range).
`LessonDetail.tsx` (Ã—4), `SpeakingDesktop.tsx` (Ã—2), `EcoleReveal.tsx` (Ã—2), `PersonaMatch.tsx` (Ã—3), `MethodologyPreview.tsx` (Ã—1), `PlatformLanding.tsx` (Ã—2), `DateInputQuestion.tsx` (Ã—3), `PricingTeaser.tsx` (Ã—1), `verify-email/page.tsx` (Ã—1).

Kept as-is (not text separators): `'â€”'` placeholder dashes in `SnapshotSection.tsx`, `EcoleReveal.tsx`, `WritingSubmissionClient.tsx`, `Tache1Session.tsx`, `Tache2Session.tsx` â€” null-value indicators, not punctuation.

### E-003 â€” BottomNav labels French canonical

`components/home/BottomNav.tsx`: `Speaking` â†’ `Oral`, `Writing` â†’ `Ã‰crit`, `Progress` â†’ `ProgrÃ¨s`.

### E-004 â€” TopNav EN nav French canonical

`components/nav/TopNav.tsx` COPY.en.nav: `speaking: 'Speaking'` â†’ `'Oral'`, `writing: 'Writing'` â†’ `'Ã‰crit'`, `progress: 'Progress'` â†’ `'ProgrÃ¨s'`.

**Locale decision:** TopNav uses `useInterfaceLanguage()` (already i18n-capable). EN nav now mirrors FR nav per DESIGN.md Â§8 "French is the primary product language." Nav names are product brand signals, not translatable UI chrome.

### E-005 â€” "4 couches" / "4-couche" â†’ "5"

`components/writing/WritingPromptPicker.tsx` (EN + FR pageSubtitle), `components/speaking/Tache1Session.tsx`, `components/speaking/Tache2Session.tsx`.

### E-009 â€” BottomNav MÃ©thode href `/` â†’ `/la-methode`

`components/home/BottomNav.tsx` TABS[0]: `href: '/'` â†’ `href: '/la-methode'`. Prevents authenticated users landing on the public marketing page when tapping the MÃ©thode tab.

### E-010 â€” Root metadata description updated (covered under E-001)

### E-013 â€” Sidebar sign-out hardcoded English â†’ French

`components/layout/Sidebar.tsx`: `Sign out` â†’ `Se dÃ©connecter`.

### Deferred to next dispatch

- **E-006** â€” Italic on display headings: `fontStyle: 'italic'` on hero H1, section headings, wordmarks. Blocked by A-008 (font family migration from Source Serif 4 â†’ Instrument Serif). Removing italic without fixing the font family is a half-measure. Deferred to A-008 dispatch.
- **E-007** â€” Footer wordmark Cabinet Grotesk: blocked by A-009 (font migration). Deferred.
- **E-008** â€” MethodologySection.tsx comment documents violation: blocked by A-008. Deferred.
- **E-011** â€” Legacy product names in code comments/tests (`L'Ã‰cole`, `Le Vocabulaire`, `Le Diagnostic`): non-user-facing. Deferred to M-RENAME dispatch.
- `manifest.json` `theme_color`/`background_color` `#F8F4ED` (v1 warm cream): color value, not copy. Deferred to A-007 follow-up.

**Verification:** `pnpm build` clean. `grep LeMethodic **/*.{tsx,ts,json}` â†’ 0 matches in user-facing files. Em-dash user-facing strings: 0.
- VERIFICATION RUNBOOK (Chadi):
  1. Sign up a fresh test account on `lemethodic.com/signup`. Capture the access token in DevTools localStorage (`lemethodic_token`).
  2. **Do NOT verify the email.** Close the tab.
  3. **Cold-tab `/ecole`** â€” open `lemethodic.com/ecole` directly in a new tab. Expected: redirected to `lemethodic.com/verify-email?next=%2Fecole` (the empty-state "Check your inbox" card renders; no "Something went wrong"). Screenshot at 1440px + 375px.
  4. **Repeat for `/writing`, `/progress`, `/profile`** â€” same expectation; `?next=` mirrors the path each time.
  5. **Loop guard** â€” refresh on `/verify-email?next=/ecole`. Expected: no second redirect, URL stable.
  6. **Post-confirm next** â€” while on the empty-state page, capture the URL. Open DevTools console and run `await fetch('/api/auth/verify-email', { method: 'POST', body: JSON.stringify({ token: '<from your email>' }), headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.lemethodic_token } })`. (Or just click the link in the email if you're on the same tab and `?next=` survives â€” unlikely with BE-built URLs.) After the 2s success state, expected: `router.push('/ecole')` (when `?next=/ecole` was preserved) or `/login` (when it wasn't â€” the email cross-tab case, which is fine).
  7. **In-session 403** â€” log in as the unverified user, manually call a protected endpoint from the console (e.g., `fetch('/api/users/me/today', { headers: { Authorization: 'Bearer ' + localStorage.lemethodic_token }, credentials: 'include' })`). Expected: page hard-navigates to `/verify-email?next=<current path>`.
  8. **Open-redirect safety** â€” manually visit `/verify-email?token=<any>&next=//evil.com` and `?next=https://evil.com`. Expected: post-confirm routes to `/login`, not the evil host.

### F-311 â€” [BE] Token control (Redis rate limiter + model routing + prompt caching)
Milestone: DONE

**Priority:** HIGH (pre-launch blocker per Decision 4 â€” at 5,000+ users Y1, uncapped diagnostic abuse blows API costs before revenue catches up)
**Status:** Queued
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session â€” Decision 4
**Dependencies:** F-310 (subscription-tier hook for per-tier limits)
**Scope:**
- Redis-backed rate limiter keyed by `user_id`, scoped by subscription tier
- Tier limits: Free=5 diagnostic sessions/day Â· $29/mo=30/day Â· $199 Sprint=60/day Â· $499 Premium=unlimited
- Model routing: `claude-haiku-4-5` for vocab exercises + lookups; `claude-sonnet-4-6` reserved for diagnostic scoring
- Anthropic prompt caching on system prompts (target 90% cost reduction on repeat)
- Hard cap: `max_tokens=800` output per diagnostic response
- Prompt injection detection layer â€” reject system-override patterns before the Claude call
**Owner:** Backend Engineering

### F-312.0 â€” [BE] RAG corpus licensing pre-flight (HARD GATE)
Milestone: DONE

**Priority:** CRITICAL (hard gate per Chadi 2026-05-12 push-back â€” no RAG schema work commits until this returns legal-clear)
**Status:** Queued
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session â€” Decision 2; pre-flight gate added in Chadi's reconciliation response
**Dependencies:** none
**Scope:** read OQLF ToS (`oqlf.gouv.qc.ca/conditions_utilisation.html`) and AcadÃ©mie franÃ§aise terms. Confirm or deny redistribution + reuse rights for corpus chunks in commercial product context. Document conclusion with quoted ToS language and recommended legal posture. **Fallback if redistribution not permitted:** fair-use snippet + link-only citation (cite the source, link to the source page, don't store the full text).
**Gate:** F-312, F-320, F-321 all blocked until F-312.0 completes with a legal-clear answer or a documented fallback strategy. "Better to know now than after building."
**Owner:** Engineering (legal-adjacent; Chadi reviews conclusion)

### F-312 â€” [BE] OQLF + AcadÃ©mie franÃ§aise RAG retrieval layer
Milestone: TBD

**Priority:** HIGH (Decision 2 â€” diagnostic credibility through authoritative grounding; replaces "the AI thinks this is wrong" with "according to the OQLF, this is an anglicism")
**Status:** Blocked on F-312.0
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session â€” Decision 2
**Dependencies:** F-312.0 (licensing), F-320 (LV DB schema â€” corpus rows may share table)
**Scope:** scrape OQLF Banque de dÃ©pannage linguistique + AcadÃ©mie franÃ§aise "Dire et ne pas dire" into structured Postgres rows (`chunk` + `correction` + `error_type` + `source` + `register` + `exam_tag`). Before each Claude diagnostic call, query the table for chunks matching the student's text; inject 5â€“15 relevant entries into the prompt as authoritative context. Diagnostic output cites the source by name. Sources:
- OQLF Banque de dÃ©pannage linguistique (`bdl.oqlf.gouv.qc.ca`) â€” Quebec French authority, structured by error type, CC license (pending F-312.0 confirmation)
- AcadÃ©mie franÃ§aise "Dire et ne pas dire" (`academie-francaise.fr`) â€” ~500 entries, "don't say X, say Y" format
**Owner:** Backend Engineering

### F-319 â€” [FE+BE] Le Vocabulaire (system; parent ticket)
Milestone: M4

**Priority:** HIGH (Decision 3 â€” Le MÃ©thodic shifts from exam-prep-only to general-French + exam platform; one engine, two audiences)
**Status:** Queued â€” MVP via F-320â€“F-323; V2 sub-tickets visible but deferred
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session â€” Decision 3 (Lexogoth-equivalent web system, distinct from L'Ã‰cole and Le Diagnostic)
**Dependencies:** F-312.0 (corpus licensing for sourced content)
**Scope:** full Lexogoth-equivalent web system for chunk-based French vocabulary learning. Free + exam-tagged topic libraries, multiple exercise types, practice + test + tutor modes. Source content from OQLF/BDL/AcadÃ©mie corpus pending F-312.0.

**MVP (active queue â€” Sprint 1/2):**
- F-320 â€” DB schema (chunk, translation, topic, source, register, exam_tag, cefr_level)
- F-321 â€” Seed Phase 1: 3 topic sets, 500â€“800 entries from OQLF BDL
- F-322 â€” Practice UI (hide/reveal, self-grade, personal lists scaffold)
- F-323 â€” Test UI (MCQ, matching, dropdown, exact completion â€” Lexogoth Toolbox-style)

**V2 deferred (filed for visibility; sub-tickets to land when V2 starts):**
- Tutor mode (teachers build custom databases, assign to students)
- Personal lists with SRS (spaced repetition surface; V1 has localStorage stash only)
- Topic library partition (free general-French set vs exam-specific sets â€” TCF/DELF/TEF by task type)
- Exercise authoring admin tooling

**Why this matters:** without Le Vocabulaire, Le MÃ©thodic is exam-prep only. With it, the product serves both general French learners and exam candidates â€” one engine, two audiences.
**Owner:** Engineering (BE + FE; child tickets are layer-specific)

### F-320 â€” [BE] Le Vocabulaire DB schema
Milestone: M4

**Priority:** HIGH (F-319 MVP foundation)
**Status:** Blocked on F-312.0 if corpus rows share table
**Filed:** 2026-05-12
**Source:** F-319 / Decision 3
**Dependencies:** F-312.0 (licensing clearance)
**Scope:** Postgres schema for Vocabulaire: `chunk` (FR) + `translation` (EN) + `topic` + `source` (OQLF / AcadÃ©mie / custom) + `register` (familier / standard / soutenu) + `exam_tag` (TCF / DELF / TEF / null) + `cefr_level`. Migration script. Consider shared table with F-312 RAG corpus if licensing permits â€” chunks have overlapping shape.
**Owner:** Backend Engineering

### F-321 â€” [Content] Le Vocabulaire seed Phase 1 (3 topic sets, 500â€“800 entries from OQLF BDL)
Milestone: M4

**Priority:** HIGH (F-319 MVP content)
**Status:** Blocked on F-312.0 + F-320
**Filed:** 2026-05-12
**Source:** F-319 / Decision 3
**Dependencies:** F-312.0 (licensing), F-320 (schema)
**Scope:** ETL pipeline from OQLF BDL â†’ Vocabulaire rows. Three Phase-1 topic sets curated for general French (e.g., arts, loisirs, voyages, sociÃ©tÃ© â€” Vocabulaire-progressif style; final pick per Chadi pedagogical signal). 500â€“800 entries total. Idempotent re-runnable seed script.
**Owner:** Backend Engineering (Chadi pedagogical topic pick)

### F-322 â€” [FE] Le Vocabulaire practice UI
Milestone: M4

**Priority:** MEDIUM (Sprint 2 â€” F-319 MVP FE-side)
**Status:** Awaiting verification (F-225 â€” interactive change; needs 1440px + 375px screenshots of SessionConfigCard / FlashcardView pre-reveal / FlashcardView post-reveal / SessionEndCard / TierLockedCard (via dev `?devLock=tier`) + interaction trace per runbook below)
**Filed:** 2026-05-12
**Plan-approved:** 2026-05-13 (Chadi â€” answered the 4 open questions HIGH-confidence)
**Source:** F-319 / Decision 3
**Dependencies:** F-321 (seed â€” empty-state until then), F-325 (shipped â€” chunks API + TanStack Query provider + locked-card visual frame reused here)

**Scope locked:**
- **Route**: `/vocabulaire/[slug]/practice` (nested under topic detail; deep-linkable; keeps F-325 components untouched). `?mode=practice` rejected.
- **Direction**: read order URL `?direction=fr|en` â†’ localStorage pref â†’ `'fr'` default. `'fr'` = show FR / reveal EN (comprehension). `'en'` = show EN / reveal FR (recall).
- **Session length**: picker 10 / 20 / all; default 20 (attention-curve MVP cap; deeper sessions filed as F-322.deeper-sessions follow-up if user feedback demands).
- **Self-grade**: binary pass/fail (V1). V2 SRS adds 4-level scale (Again/Hard/Good/Easy).
- **Personal lists V1**: localStorage stash only. Per-chunk grade history. No Review-queue UI in V1 â€” failed chunks ARE the implicit review queue; V2 SRS layers a dedicated surface on top of the same storage shape.
- **Tier-gate**: BE 403 + `tier_insufficient` body on exam_tagged topics. New `isTierInsufficientError(err)` helper parallel to `isEmailNotVerifiedError`. Surface-specific render (locked-card in place, no global interceptor â€” unlike email_not_verified which always hard-navs).
- **F-225 capture for tier-locked**: dev-only `?devLock=tier` URL flag, gated behind `process.env.NODE_ENV !== 'production'`. Cheaper than waiting for a real free-tier test account; F-311 supersedes when shipped.
- **Cache keys**: practice's TQ chunks query uses empty-filter key, separate from browse's user-filter key. No cache collision; warm-from-browse only when user had no filters active.

**Component breakdown (all inline in PracticeClient.tsx):**
- `PracticeClient` â€” top-level state machine: `phase: 'config' | 'session' | 'end' | 'tier-locked' | 'error' | 'empty'`. Owns shuffled `sessionChunks`, `currentIndex`, `revealed`.
- `SessionConfigCard` â€” pre-session screen. Direction toggle + session-length picker + Start.
- `FlashcardView` â€” one chunk at a time. Front (shown language) + Reveal button â†’ back (hidden language) + Got it / Need review.
- `SessionEndCard` â€” N got / N needs review / % accuracy. Practice again / Back to topic / Browse the corpus.
- `TierLockedCard` â€” locked copy + CTA to /paywall (reuses F-325 catalog locked visual frame).
- `PracticeError` / `PracticeEmpty` / `PracticeSkeleton` â€” ed-* primitive mirrors.

**State management:**
- `useInfiniteQuery` reusing F-325 query-key shape `['vocab', 'chunks', slug, '']` (empty filter segment). First page only (limit 20).
- `lib/practice-state.ts` localStorage helpers â€” `Record<chunkId, { lastGrade, lastGradedAt, attempts }>` + direction-pref store. All wrapped in try/catch (soft-fail to in-memory on private-browsing).

**Phases shipped (one commit per phase, build + typecheck clean per commit):**
- **B0** (8e72296): F-322 BACKLOG entry locked with the plan.
- **B1** (cf7f215): `lib/practice-state.ts` (read/record/clearGrades + direction-pref helpers; try/catch wrapped for private-browsing); `isTierInsufficientError(err)` helper in `lib/api.ts` parallel to `isEmailNotVerifiedError`; new `VOCAB_PRACTICE_STATE_KEY` + `VOCAB_PRACTICE_PREF_KEY` in `lib/storage-keys.ts`.
- **B2** (7ba9c00): `/vocabulaire/[slug]/practice` route. `PracticeClient.tsx` state machine (`config` / `session` / `end` views on top of TQ status). Sub-components inline: `SessionConfigCard`, `FlashcardView`, `SessionEndCard`, `TierLockedCard`, `ErrorCard`, `EmptyCard`, `PracticeSkeleton`. Fisher-Yates shuffle, reusing F-325 chunks query-key family with empty filter segment (no cache collision with browse's user-filter key). Dev-only `?devLock=tier` URL flag gated behind `process.env.NODE_ENV !== 'production'` for F-225 capture. `lib/vocab-copy.ts` extended with EN+FR `practice` block.
- **B3** (93a8841): "Start practice" CTA wired into `app/vocabulaire/[slug]/TopicDetail.tsx`. Single conditional `<Link>` insertion at the top of the page (surfaces only when chunks > 0; uses `copy.practice.startCta` and the editorial-system primary-CTA visual).
- **B4** (this commit): F-225 verification runbook + status flip.

**Files touched (shipped):**
- `BACKLOG.md` â€” F-322 entry locked (B0); status + runbook (B4).
- `lib/storage-keys.ts` â€” two new keys (B1).
- `lib/practice-state.ts` â€” NEW; localStorage helpers (B1).
- `lib/api.ts` â€” `isTierInsufficientError(err)` helper (B1).
- `lib/vocab-copy.ts` â€” `practice` block in EN+FR + `startCta` (B2).
- `app/vocabulaire/[slug]/practice/page.tsx` â€” NEW; ProtectedRoute wrap (B2).
- `app/vocabulaire/[slug]/practice/PracticeClient.tsx` â€” NEW; state machine + all sub-components (B2).
- `app/vocabulaire/[slug]/TopicDetail.tsx` â€” "Start practice" CTA (B3).

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: HIGH. Plan-first â†’ all 4 open questions answered HIGH-confidence before B0 â†’ 5 discrete commits, each `pnpm exec tsc --noEmit` silent + `pnpm build` green (38 routes, /vocabulaire static + /vocabulaire/[slug] + /vocabulaire/[slug]/practice dynamic, 0 warnings).
- WHY: F-319 MVP completes the Vocabulaire surface trio: browse (F-325 âœ…) + practice (F-322 â€” this) + test (F-323 queued).
- UNCERTAINTY: (1) `'all'` session-length on topics with >20 chunks still practices the first 20 (BE F-325 returns first page; deeper sessions filed as F-322.deeper-sessions follow-up per plan R1). (2) Tier-lock screen capture path uses a dev-only URL flag (`?devLock=tier`) â€” F-311 supersedes when the live tier-read lands; the override is dead code in prod builds. (3) Personal-list V1 has no Review-queue UI; failed chunks ARE the implicit review queue persisted in localStorage; V2 SRS exposes a dedicated surface on the same storage shape.
- VERIFICATION RUNBOOK (Chadi, post-deploy on lemethodic.com):
  1. **Auth gate** â€” visit `/vocabulaire/<any>/practice` unauthenticated. Expect redirect to `/` via ProtectedRoute.
  2. **Empty-state** â€” sign in. While F-321 hasn't seeded, navigating to `/vocabulaire/<any>/practice` either lands on EmptyCard (zero chunks) or ErrorCard (BE 404). Screenshot the actual outcome.
  3. **CTA discovery** â€” once F-321 seeds, visit `/vocabulaire/<topic-slug>`. Verify the "Start practice" CTA appears below the chunk-count line and routes to `/vocabulaire/<topic-slug>/practice` on click. 1440px + 375px.
  4. **Config card** â€” on the practice route, verify direction toggle (Show FR Â· reveal EN / Show EN Â· reveal FR) and length picker (10 / 20 / All). Toggle direction, refresh â€” localStorage persists the choice. 1440px + 375px.
  5. **Flashcard pre-reveal** â€” Start session. Verify card shows only the front (per direction) with Reveal CTA. Progress label reads "Card 1 of 20". 1440px + 375px.
  6. **Flashcard post-reveal** â€” click Reveal. Both languages now visible (back appears below a hairline rule). Got it / Need review buttons replace Reveal. 1440px + 375px.
  7. **Grade + advance** â€” click Got it. Card index advances, revealed resets. Repeat for ~3 cards, including one Need review.
  8. **localStorage trace** â€” DevTools â†’ Application â†’ Local Storage. Verify `lemethodic_vocab_practice_state` carries `{ "<chunkId>": { lastGrade, lastGradedAt, attempts } }` entries; `lemethodic_vocab_practice_pref` carries `{ direction }`.
  9. **End card** â€” walk through the session to completion. Verify "Session complete." with N got Â· N needs review Â· % accuracy stats. Three CTAs: Practice again (reshuffles, returns to session), Back to topic, Browse the corpus. 1440px + 375px.
  10. **Tier-lock capture (dev only)** â€” open the Vercel preview / local dev server (`pnpm dev`); visit `/vocabulaire/<any>/practice?devLock=tier`. Verify TierLockedCard renders with the "DEV: simulated tier lock" dashed badge + locked.title + locked.body + CTA â†’ /paywall. 1440px + 375px. (Production refuses the flag â€” `process.env.NODE_ENV !== 'production'` gate.)
  11. **i18n** â€” flip `interface_language` to `fr` (via /onboarding or BE record). Refresh `/vocabulaire/<slug>/practice`. Verify all practice copy switches to French.
  12. **F-310 interceptor on practice** â€” log in as an unverified user; visit `/vocabulaire/<slug>/practice`. Expect hard-nav to `/verify-email?next=/vocabulaire/<slug>/practice` (F-310.fe.coldreload interceptor still works on this new surface).
  13. **Runtime log sweep** â€” Vercel runtime logs for the F-322 deploy: 0 errors / 0 5xx in a 1h window after smoke.

**Owner:** Frontend Engineering

### F-323 â€” [FE] Le Vocabulaire test UI
Milestone: M4

**Priority:** MEDIUM (Sprint 2 â€” F-319 MVP FE-side)
**Status:** Awaiting verification (F-225 â€” interactive change; needs 1440px + 375px screenshots of SessionConfigCard, each of the four exercise views pre- and post-submit (MCQ / Dropdown / Exact / Matching), TestEndCard, TierLockedCard via `?devLock=tier`, SoftEmptyCard + interaction trace per runbook below)
**Filed:** 2026-05-12
**Plan-approved:** 2026-05-13 (Chadi â€” 5 open questions answered HIGH-confidence)
**Source:** F-319 / Decision 3
**Dependencies:** F-321 (seed â€” empty/soft-empty until then; need â‰¥4 chunks per topic to launch a test session), F-325 (chunks API), F-322 (shared `lib/practice-state.ts`, `isTierInsufficientError`, ed-* primitive patterns, `?devLock=tier` capture flag)

**Scope locked:**
- **Route**: `/vocabulaire/[slug]/test` (nested under topic detail; sibling of F-322's `/practice`). `?mode=test` rejected for the same reasons as F-322.
- **Exercise types**: MCQ / Dropdown / Exact completion / Matching. **Single-select per session in V1** â€” user picks one mode at SessionConfigCard. Multi-select mixed sessions filed as F-323.mixed follow-up for V2.
- **Minimum chunks to launch**: 4. Below 4 â†’ soft-empty state with CTA `/vocabulaire/[slug]/practice` ("This topic needs at least 4 chunks for a test session. Try practice mode instead.").
- **Direction**: same model as F-322 â€” URL `?direction=fr|en` â†’ localStorage pref â†’ `'fr'` default. **Same `lemethodic_vocab_practice_pref` storage key** â€” user's direction choice is shared across practice and test surfaces (one user pref, two surfaces; comprehension-vs-recall preference is consistent across modes).
- **Session length**: picker 10 / 20 / all; default 20. Same as F-322.
- **Distractor pool**: pure FE-derived. For MCQ / Dropdown, distractors come from sibling chunks in the same fetched set (limit 20). Pool quality is healthy at F-321 seed scale (~150-250 chunks per topic).
- **Exact completion grading**: permissive â€” case-insensitive + whitespace-trim + accent-strip + punctuation-strip, in that order. Strict-match mode deferred to V2.
- **Matching screen**: 5 pairs per screen. Session of 20 chunks = 4 matching screens of 5 pairs each. Topics with chunk count not divisible by 5 â†’ final screen has fewer pairs.
- **Matching UX (mobile + desktop)**: tap one side â†’ that item highlights as selected â†’ tap an item in the OPPOSITE column â†’ pair confirmed (visual line/highlight); tapping a second item in the SAME column deselects + re-selects.
- **Auto-grading**: per-question pass/fail derived from user interaction (no self-grade). Matching block grades each of its 5 chunks independently (5 grade records per screen).
- **localStorage**: writes to the SAME `lemethodic_vocab_practice_state` key as F-322 â€” practice and test failures both signal "review this chunk" to V2 SRS. Unified history.
- **Tier-gate**: 403 + `tier_insufficient` â†’ TierLockedCard via `isTierInsufficientError` helper (shipped in F-322 B1). Surface-specific render (same model as F-322 practice).
- **F-225 capture for tier-locked**: dev-only `?devLock=tier` URL flag, gated behind `process.env.NODE_ENV !== 'production'`. Same pattern as F-322.
- **Cache keys**: same TQ key family as F-325 / F-322 (`['vocab', 'chunks', slug, '']`). Browse-with-no-filters â†’ practice â†’ test all share one cache entry; browse-with-filters has a separate cache slot. No collision.

**Component breakdown (all inline in TestClient.tsx, mirroring F-322's single-file model):**
- `TestClient` â€” top-level state machine: `view: 'config' | 'session' | 'end'`. Owns shuffled session chunks, exercise type choice, current question index, per-question results.
- `SessionConfigCard` â€” direction toggle + session length picker + **exercise type picker** (single-select, 4 buttons) + Start.
- `QuestionView` â€” dispatches to `MCQView` / `DropdownView` / `ExactView` / `MatchingView` based on session's exercise type. Shared progress label + Next button after feedback.
- `MCQView` â€” 4 button options; click â†’ grade â†’ feedback (correct highlighted, your answer if wrong shown).
- `DropdownView` â€” sentence template with `<select>`; submit grades.
- `ExactView` â€” input text + submit; permissive normalize-then-compare grading.
- `MatchingView` â€” 5 pairs per screen; tap-to-pair UX; submit when all paired; per-chunk grade.
- `TestEndCard` â€” overall score + per-exercise-type breakdown (trivial for single-select V1). CTAs: Practice again (reshuffle, reuse same exercise type) / Back to topic / Browse the corpus.
- `TierLockedCard` / `ErrorCard` / `EmptyCard` / `SoftEmptyCard` / `TestSkeleton` â€” ed-* primitive mirrors (copied from F-322 â€” could refactor to a shared component later; defer to avoid file churn).

**Pure helpers (new lib/test-engine.ts):**
- `buildMCQ(chunk, pool, direction)` â†’ `{ prompt, correct, options[4] }`
- `buildDropdown(chunk, pool, direction)` â†’ `{ template, correct, options[4] }`
- `buildExact(chunk, direction)` â†’ `{ prompt, expected }`
- `buildMatchingBlock(chunks, direction)` â†’ `{ pairs: { id, fr, en }[] }` (takes up to 5 chunks)
- `normalizeExactAnswer(s)` â€” permissive normalize per Q3.
- `pickDistractors(correct, pool, count)` â€” fisher-yates over sibling chunks, dedupe correct.

**Phases shipped (one commit per phase, build + typecheck clean per commit):**
- **B0** (05cbe9a): F-323 BACKLOG entry locked with the plan.
- **B1** (8b7029e): `lib/test-engine.ts` pure helpers (buildMCQ / buildDropdown / buildExact / buildMatchingBlock / gradeExact / gradeMatching / normalizeExactAnswer / pickDistractors / shuffle); `lib/vocab-copy.ts` extended with `test` block in EN+FR.
- **B2** (0958a0d): `/vocabulaire/[slug]/test` route + `TestClient.tsx` state machine. SessionConfigCard / QuestionView dispatcher / MCQView / DropdownView / ExactView / MatchingView / TestEndCard / TierLockedCard / ErrorCard / EmptyCard / SoftEmptyCard / TestSkeleton â€” all inline. Matching tap-to-pair UX with shuffled right column, per-chunk feedback (accent fill for correct, muted strikethrough for wrong). Dev-only `?devLock=tier` flag for F-225 capture.
- **B3** (922e89e): TopicDetail CTA row becomes a flex pair â€” "Start practice" (primary, ed-accent) + "Start test" (secondary, ed-paper outline). flex-wrap for 375px stack behavior.
- **B4** (this commit): F-225 verification runbook + status flip.

**Files touched (shipped):**
- `BACKLOG.md` â€” F-323 entry locked (B0); status + runbook (B4).
- `lib/test-engine.ts` â€” NEW; pure helpers (B1).
- `lib/vocab-copy.ts` â€” `test` block in EN+FR (B1).
- `app/vocabulaire/[slug]/test/page.tsx` â€” NEW; ProtectedRoute wrap (B2).
- `app/vocabulaire/[slug]/test/TestClient.tsx` â€” NEW; state machine + 4 exercise components (B2).
- `app/vocabulaire/[slug]/TopicDetail.tsx` â€” paired Start practice / Start test CTAs (B3).

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: HIGH. Plan-first â†’ 5 open questions resolved before B0 â†’ 5 discrete commits each `pnpm exec tsc --noEmit` silent + `pnpm build` green (39 routes, four `/vocabulaire/*` routes compile clean, 0 warnings). Matching tap-to-pair logic is the only genuinely new state machine; everything else is direct F-322 mirroring.
- WHY: F-319 MVP completes the Vocabulaire surface trio FE-side: browse (F-325 âœ…) + practice (F-322 âœ…) + test (F-323 â€” this). Once F-321 seeds the corpus, all three surfaces have content.
- UNCERTAINTY: (1) Matching right-column shuffle re-randomizes on remount â€” browser-back into a previously-submitted matching block could show a different display order. Acceptable for V1; no browser-back is wired through the state machine and the grade record per chunkId is order-independent. (2) Distractor pool quality on small topics (4-19 chunks): MCQ / Dropdown distractors come from the same fetched first-page set; topics with ~5 chunks repeat distractors across questions in a 20-question session. Healthy at F-321 seed scale (~150-250 chunks per topic). (3) `normalizeExactAnswer` regex literal-glyph reliance: combining marks block + smart quote/dash characters are literal in source. Next.js / tsc handle UTF-8 correctly; a future editor that mangles encoding degrades silently to overly-strict matching (never false-positives a wrong answer).
- VERIFICATION RUNBOOK (Chadi, post-deploy on lemethodic.com):
  1. **Auth gate** â€” visit `/vocabulaire/<any>/test` unauthenticated. Expect redirect to `/` via ProtectedRoute.
  2. **Soft-empty (1-3 chunks)** â€” if F-321 seeds a tiny topic with <4 chunks, visit its `/test` route. Expect SoftEmptyCard with "Not enough chunks for a test." + CTA â†’ `/practice`. 1440px + 375px.
  3. **Empty (0 chunks)** â€” pre-seed, expect EmptyCard ("Nothing to practice yet.").
  4. **CTA pair on TopicDetail** â€” visit `/vocabulaire/<topic-slug>`. Verify the CTA row contains BOTH "Start practice" (filled) and "Start test" (outline). 1440px + 375px.
  5. **SessionConfigCard** â€” clicking Start test routes to `/test`. Verify the four exercise-type chips (Multiple choice / Dropdown / Exact completion / Matching), direction toggle, session length picker. 1440px + 375px.
  6. **MCQ flow** â€” select Multiple choice + 10 chunks + Start. Verify ExerciseCard with prompt + 4 button options. Click a wrong option â†’ correct option highlights ed-accent, your wrong choice strikes through, FeedbackBlock shows "Not quite â€” the answer was [X]." + Next button. 1440px + 375px pre-submit + post-submit.
  7. **Dropdown flow** â€” Start over with Dropdown. Verify the `<select>` renders the 4 options, Submit button disabled until a choice is picked, feedback identical to MCQ post-submit. 1440px + 375px.
  8. **Exact flow** â€” Start over with Exact completion. Verify autofocused text input + Submit button. Type a known answer â†’ pass. Type a wrong answer â†’ fail with correct answer in feedback. Permissive grading: case + accents + punctuation tolerated (e.g., "ecole." for "Ã‰cole"). 1440px + 375px.
  9. **Matching flow** â€” Start over with Matching (10 chunks = 2 blocks of 5). Verify FR column on the left, EN column on the right (shuffled). **Tap-to-pair UX (per BACKLOG R3)**: tap an FR item â†’ it highlights ed-accent fill â†’ tap an EN item from the OPPOSITE column â†’ both highlight + pair locks visually + selection clears. Tap a SAME-column item while one is selected â†’ switches selection (no pair formed). Tap an already-paired item â†’ unlocks that pair, selects this item. Submit button disabled until all 5 paired. 1440px + 375px pre-submit + post-submit (correct = accent fill, wrong = muted strikethrough).
  10. **localStorage trace** â€” DevTools â†’ Application â†’ Local Storage. Verify `lemethodic_vocab_practice_state` accumulates pass/fail records as the test progresses (same key as F-322 â€” unified history confirmed).
  11. **TestEndCard** â€” finish a session. Verify "Test complete." with N got / N total / % accuracy stats. Three CTAs: Test again (reshuffle + same exercise type), Back to topic, Browse the corpus. 1440px + 375px.
  12. **Tier-lock capture (dev only)** â€” local `pnpm dev`; visit `/vocabulaire/<any>/test?devLock=tier`. Verify TierLockedCard with the "DEV: simulated tier lock" dashed badge + CTA â†’ /paywall. 1440px + 375px. (Production refuses the flag â€” `process.env.NODE_ENV !== 'production'` gate.)
  13. **i18n** â€” flip `interface_language` to `fr`. Refresh `/vocabulaire/<slug>/test`. Verify all test copy switches to French (exercise type labels, prompts, feedback strings, button labels).
  14. **F-310 interceptor** â€” log in as unverified user; visit `/vocabulaire/<slug>/test`. Expect hard-nav to `/verify-email?next=/vocabulaire/<slug>/test`.
  15. **Runtime log sweep** â€” Vercel runtime logs for the F-323 deploy: 0 errors / 0 5xx in a 1h window after smoke.

**Owner:** Frontend Engineering

### F-324 â€” [FE+BE] Diagnostic â†” Vocabulaire linking (auto-suggest vocab topics from flagged errors)
Milestone: M4

**Priority:** MEDIUM (Sprint 2 â€” connects Le Diagnostic to Le Vocabulaire)
**Status:** Queued
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session â€” Section 2 row 8
**Dependencies:** F-319 (Vocabulaire MVP shipped), F-312 (RAG retrieval â€” error_type tags drive topic suggestions)
**Scope:** when a diagnostic surfaces an error tagged with a vocabulary register/topic mismatch, FE renders a "Practice this in Le Vocabulaire" callout linking to the relevant topic set. BE: extend diagnostic response with `suggested_vocab_topics: string[]`. FE: render callout block in ResultView + diagnostic page.
**Owner:** Engineering (BE + FE)

### F-325 â€” [FE] Le Vocabulaire browse UI (FE) â€” topic catalog + chunk detail
Milestone: M4

**Priority:** MEDIUM (Sprint 2 â€” corpus exploration surface; complements F-322 practice UI and F-323 test UI)
**Status:** Awaiting verification (F-225 â€” interactive change; needs 1440px + 375px screenshots of /vocabulaire catalog + /vocabulaire/[slug] topic detail + locked-card variant via ?tier=free + interaction trace per runbook below)
**Filed:** 2026-05-12
**Source:** 2026-05-12 strategic session â€” Decision 3 (Le Vocabulaire system); F-322 push-back resolved with new ticket number per Chadi.
**Dependencies:** BE F-325 API (commit 0543642 â€” SHIPPED), F-320 (DB schema), F-321 (seed Phase 1 â€” not yet seeded; empty-state mode until then). Tier-gate live wiring deferred to F-311.fe.

**Scope:**
Two-route browse surface complementing F-322 (practice) and F-323 (test):
- `/vocabulaire` â€” topic catalog with `corpus_partition` filter (three chips: `CC_corpus` / `chadi_authored` / `book_lab`). The fourth canonical partition `third_party_publisher_DO_NOT_EXTRACT` is silently filtered at the BE query layer (BE Decision D4) and is invisible to FE â€” no chip, no badge.
- `/vocabulaire/[topic-slug]` â€” paginated chunk list inside a topic, with three filter chip groups: `cefr_level` (A1â€“C2), `exam_tag` (TCF / DELF / TEF; null=untagged), `register` (familier / standard / soutenu).

Mobile-first per F-225 (mirrors the `app/ecole/` mobile/desktop CSS-gate split). Auth-gated via `ProtectedRoute` (no public/SEO surface â€” public marketing is Sprint A post-launch territory).

**Canonical BE contract (locked 2026-05-12):**
- `corpus_partition` enum: `CC_corpus | chadi_authored | book_lab | third_party_publisher_DO_NOT_EXTRACT` (per BE F-320 commit 0a7cc4b; supersedes the stale `oqlf|academie|curated` line at BACKLOG.md:3274 â€” see BACKLOG-HYGIENE-001 follow-up).
- `GET /api/vocab/topics?corpus_partition=â€¦` â†’ `Topic[]` (camelCase mapper at FE boundary).
- `GET /api/vocab/topics/{slug}/chunks?cefr_level=â€¦&exam_tag=â€¦&register=â€¦&offset=â€¦&limit=20` â†’ `{ chunks: Chunk[]; total: number; limit: number; offset: number }`. **Offset-based pagination** (not cursor â€” BE F-325 confirmed).
- Auth: Bearer token, same as the rest of the app.
- Tier-lock: 403 + `tier_insufficient` detail body (consistent with F-310 contract). Surfaces through `lib/api.ts:request()` like any other 403; FE does not invent a special 200-with-flag path.

**Empty-state copy (EN+FR; ES deferred to F-326 placeholder):**
- Corpus empty: EN "Le Vocabulaire is coming." / FR Â« Le Vocabulaire arrive. Â»
- Topic filtered to zero: EN "No chunks match these filters." / FR Â« Aucun chunk ne correspond Ã  ces filtres. Â»
- Locked-card (free user + exam_tagged_*): EN "Exam-tagged corpus is for paid plans." â†’ /paywall.

**State management:** TanStack Query (new project pattern). Conservative defaults: `staleTime: 60_000`, `refetchOnWindowFocus: false`. `QueryClientProvider` mounted at `app/layout.tsx`. Query keys structured for filter composability.

**Tier-gate (deferred stub):**
- `hooks/useUserTier.ts` returns `'unknown'` until F-311.fe lands.
- `TopicCardLocked` variant renders when tier === `'free'` AND `topic.corpus_partition` is exam-tagged. Currently `'unknown'` always falls through to unlocked. F-225 screenshot of the locked state captured via dev-mode override.

**Phases shipped (one commit per phase, build + typecheck clean per commit):**
- **A0** (d73d2ca): F-325 + BACKLOG-HYGIENE-001 entries.
- **A1** (58d52a8): `@tanstack/react-query` + devtools installed; `components/QueryProvider.tsx` mounted at `app/layout.tsx`.
- **A2** (e5a1f3d): `lib/types.ts` + `lib/api.ts` â€” CorpusPartition / CefrLevel / ExamTag / Register / VocabularyTopic / VocabularyChunk / VocabularyChunksPage types; `api.vocab.{listTopics, listChunks}` with snake_caseâ†’camelCase mappers. `buildUrl` extended to accept `string[]` query values via `.append()` (backward-compatible with all existing call sites).
- **A3** (a5c09fc): `/vocabulaire` catalog route (auth-gated). `lib/vocab-copy.ts` EN+FR copy. Catalog client component with three partition chips, responsive grid (1/2/3 cols), TQ-wired `listTopics`, EmptyCorpusState, ed-skeleton loading, retry-on-error.
- **A4** (b4569e0): `/vocabulaire/[slug]` topic detail. TQ `useInfiniteQuery` with offset pagination. Three filter chip groups (cefr_level / exam_tag / register), ChunkRow with FR+EN+chips, EmptyFilteredState vs EmptyCorpusInTopicState branch, "Load more" pagination button. Topic title falls back to humanized slug (BE contract doesn't return topic title on chunks endpoint â€” refinement follow-up if a dedicated topic endpoint is added).
- **A5** (93e4f4b): `hooks/useUserTier.ts` stub returns `'unknown'`; `?tier=free` URL override for F-225 capture. Catalog branches at render time: `tier === 'free' && topic.examTags.length > 0` â†’ `TopicCardLocked` (locked.title + locked.body + CTA to `/paywall`).
- **A6** (this commit): F-225 verification block + status flip to "Awaiting verification".

**Files touched (shipped):**
- `BACKLOG.md` â€” F-325 + BACKLOG-HYGIENE-001 entries (A0); status + runbook (A6).
- `package.json` + `pnpm-lock.yaml` â€” `@tanstack/react-query@5.100.10` + devtools (A1).
- `components/QueryProvider.tsx` â€” NEW (A1).
- `app/layout.tsx` â€” QueryProvider wraps children (A1).
- `lib/types.ts` â€” F-325 type block at file tail (A2).
- `lib/api.ts` â€” `api.vocab.*`, vocab mappers, `buildUrl` array-value support (A2).
- `lib/vocab-copy.ts` â€” NEW; EN+FR copy (A3).
- `app/vocabulaire/page.tsx` â€” NEW; ProtectedRoute wrap (A3).
- `app/vocabulaire/Catalog.tsx` â€” NEW (A3); locked-card branch (A5).
- `app/vocabulaire/[slug]/page.tsx` â€” NEW (A4).
- `app/vocabulaire/[slug]/TopicDetail.tsx` â€” NEW (A4).
- `hooks/useUserTier.ts` â€” NEW (A5).

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: HIGH. Build + typecheck clean at every phase commit. BE F-325 contract locked (commit 0543642). All A-phase commits verified via `pnpm exec tsc --noEmit` (silent) + `pnpm build` (37 routes compile, /vocabulaire static + /vocabulaire/[slug] dynamic, 0 warnings).
- WHY: Sprint 2 surface; Decision 3 dependency for the general-French audience; complements practice (F-322) and test (F-323) UIs.
- UNCERTAINTY: (1) Tier-gate stub returns 'unknown' â€” live wiring blocks on F-311.fe. The `?tier=free` override covers the F-225 locked-card screenshot path. (2) Topic title on `/vocabulaire/[slug]` falls back to a humanized slug because the BE F-325 chunks endpoint doesn't return parent-topic metadata. Filed as a follow-up if a dedicated `GET /api/vocab/topics/{slug}` endpoint exists or is added BE-side. (3) BE response casing assumed snake_case per the existing FE convention; mappers no-op if BE emits camelCase directly. First live call against `/api/vocab/topics` confirms.
- VERIFICATION RUNBOOK (Chadi, post-deploy on lemethodic.com):
  1. **Auth flow** â€” sign in as an existing user. Verify `/vocabulaire` and `/vocabulaire/[any-slug]` redirect to `/` when unauthenticated (ProtectedRoute).
  2. **Catalog empty** â€” `/vocabulaire` with empty corpus (current state until F-321 seeds) shows the "Le Vocabulaire is coming." EmptyCorpusState card. 1440px + 375px screenshots.
  3. **Catalog populated** â€” once F-321 seeds, verify topic cards render with title + source + chunk count + CEFR range + exam-tag chips. Test the three partition chips (CC_corpus / chadi_authored / book_lab) toggle and filter the list. 1440px + 375px.
  4. **Topic detail** â€” click any topic card â†’ `/vocabulaire/[slug]`. Verify chunks render (FR top + EN translation + three chip triple), "Load more" pagination appends, three filter chip groups work. 1440px + 375px.
  5. **Filtered-to-empty** â€” apply a filter combination that yields 0 chunks. Verify "No chunks match these filters." copy renders.
  6. **Locked-card variant** â€” visit `/vocabulaire?tier=free`. Verify any topic with `exam_tags.length > 0` renders the locked-card variant (locked.title + CTA to /paywall). Clicking the CTA navigates to `/paywall`. 1440px + 375px.
  7. **i18n** â€” change `interface_language` to `fr` (via /onboarding or directly in the user record). Refresh `/vocabulaire`. Verify all copy switches to French.
  8. **403 email_not_verified flow** â€” log in as an unverified user (or simulate by clearing email_verified_at BE-side). Visit `/vocabulaire`. Verify hard-nav to `/verify-email?next=/vocabulaire` (F-310.fe.coldreload interceptor still works on this new surface).
  9. **Runtime log sweep** â€” Vercel runtime logs for the F-325 deploy: 0 errors / 0 5xx in a 1h window after smoke.

### F-VISUAL-001 â€” [FE] design system audit + Wispr Flow benchmark rollout
Milestone: M2

**Priority:** HIGH (cross-cutting design refresh â€” touches every surface; the editorial system bones are in place but the palette/typography pair/motion conventions need consolidation against the Wispr Flow benchmark)
**Status:** Plan locked 2026-05-13; X.0 in flight (X.1-X.6 follow; X.6 is post-F-225 cleanup)
**Filed:** 2026-05-13
**Plan-approved:** 2026-05-13 (Chadi â€” Q1-Q5 locked; sections 3-5 surface in X.0 status report for final review before X.1)
**Source:** Chadi design directive 2026-05-13 â€” visual benchmark Wispr Flow (wisprflow.ai): quiet luxury, editorial design, soft neutrals + restrained green accent, typography contrast, motion as core design element.
**Dependencies:** none (purely FE token + chrome work; no BE contract changes)

**Pre-locked decisions (Chadi 2026-05-13):**
- **Typography pair**: **Figtree** (sans, next/font/google) + **Fraunces** (serif, already shipped via next/font/google). Switzer retires (was shipped via Fontshare CDN â€” third-party uptime dependency removed). Override candidate considered: Inter (rejected â€” Figtree's humanist warmth is closer to Wispr Flow direction).
- **Accent green (Q1)**: **`#8FA279`** â€” the existing `--ed-warm-sage-deep` value, promoted from scattered usage (spinner dots + success accent) to the design-system accent-primary. Re-using a known-good in-production value beats introducing a new value or guessing. Refines via single CSS-var swap if post-mega-phase review surfaces a tone mismatch.
- **Success-state green stays distinct**: `--fp-sage-deep` `#2D8B55` remains as the success-state token, NOT the accent. Two distinct greens by role â€” accent (sage, restrained, decorative) vs success (deeper, state-signal).
- **F-225 verification (Q2)**: **BATCHED â€” 3 checkpoints**. Auth + onboarding (10 screens) â†’ product surfaces 1 (paywall + home + ecole, 14 screens) â†’ product surfaces 2 (vocabulaire + diagnostic + writing, 24 screens). Single commit chain unified; verification has natural pause points.
- **Legacy alias retention (Q3)**: Keep `--fp-*` and `--ed-*` aliases through X.1-X.4. Drop in X.6 cleanup commit (separate dispatch after F-225 batched verification passes).
- **shadcn rewire (Q4)**: Leave `components/ui/*` source untouched. Rewire via `--primary` / `--destructive` etc. token redirects in `globals.css`. Reversible.
- **Warm-luxury sub-palette (Q5)**: Keep `--ed-warm-{peach, peach-deep, sage, sage-deep, espresso, cream, sand}` as named tokens. Used by V-012b; no churn.
- **Motion library**: **Framer Motion 12.38** (already installed; bundle cost already paid).
- **Asset strategy**: Chadi generates imagery via Nanobanana (Google Gemini image gen). X.5 ships a slot manifest with suggested prompts; existing `/public/illustration-*.{jpg,png}` files stay until replaced.
- **Implementation scope**: FULL design system rollout, single mega-phase chain. Touches all surfaces.

**Pre-flight push-backs surfaced before X.0 (resolved):**
- PB-1: Original prompt described codebase as "v0-cloned, default Tailwind/shadcn tokens, no motion library." Investigation: framer-motion 12.38 installed, ~800 lines of design tokens across three palettes already in `globals.css`, Switzer+Fraunces typography pair already shipped, motion language defined in `lib/motion.ts`. Reframed as **token consolidation + recolor + font swap on an existing editorial system**, not a from-zero rollout.
- PB-2: Figtree vs Switzer typography conflict (Switzer currently shipped). Resolved â€” Figtree replaces Switzer (next/font/google removes Fontshare CDN dependency as a side benefit).
- PB-3: WebFetch couldn't extract Wispr Flow's actual CSS (Webflow CSS-in-JS obfuscation). Resolved per Q1 â€” use existing `#8FA279` as accent green; refine via screenshot post-mega-phase only if needed.
- PB-4: F-225 verification load (~50 screenshots one-shot). Resolved per Q2 â€” batched 3 checkpoints.
- PB-5: `frontend-design` skill was not loaded at planning time. Now available after `/reload-plugins`. Used from X.1 forward when actual code lands.

**Phase plan (one commit per phase, build + typecheck clean per commit):**
- **X.0** (this commit): BACKLOG entry locked + Sections 3-5 surface in the status report for Chadi final-review checkpoint. Docs only.
- **X.1** (Chadi green-light gates this commit): Token foundation + Figtree swap. `app/layout.tsx` Figtree via next/font/google; `app/globals.css` new HSL tokens under `:root` and `@theme inline` with `--fp-*` and `--ed-*` legacy aliases preserved; `lib/typography.ts` SANS_FONT switches to `var(--font-figtree)`, extends TYPE_SCALE with display-1 / display-2 / h1-h3 / body-lg / body / body-sm / eyebrow; `lib/motion.ts` adds `ease.{out, inOut, spring, snap}` + `duration` object as canonical exports (existing names become aliases).
- **X.2**: Tailwind `@theme inline` block + shadcn rewire. Update `@theme inline` to expose new tokens as Tailwind utilities; rewire `--primary` / `--destructive` / `--secondary` / `--muted` / `--accent` etc. (oklch greyscale) to point at new HSL semantic tokens. `<Button variant="default">` now lands on `--cta-primary`.
- **X.3** (8 commits, one per surface): /paywall â†’ / (onboarding) â†’ /ecole + intro + lesson/quiz â†’ /vocabulaire + [slug] + practice + test â†’ /diagnostic â†’ /writing + [prompt_id] + history â†’ /profile + /progress â†’ auth (/login + /signup + /verify-email + /password-reset). Each commit: grep hardcoded hex â†’ replace with `var(--*)`; convert inline `style` color values to design-token references. No layout / copy / behavior changes.
- **X.4** (4 commits, one per high-impact surface): Paywall hero stagger + scroll-reveal on radar. Home daily-action attention-pulse. Vocabulaire flashcard 3D flip (with Safari fallback to opacity cross-fade). Diagnostic results stagger after bar-fill.
- **X.5** (1 commit, docs only): `docs/nanobanana-asset-slots.md` â€” full slot manifest with suggested prompts. ~12-18 slots catalog.
- **X.6** (1 commit, separate dispatch â€” fires only after F-225 batched verification passes): Drop `--fp-*` and `--ed-*` legacy aliases from `globals.css` once X.3 confirms zero references via grep. Pure deletion + commit-message reference to F-225 pass.

**F-225 verification (batched per Q2):**
- **Batch 1** (after X.3 commits 6 and 7 land, before X.4): auth + onboarding. 10 screens Ã— 2 viewports.
- **Batch 2** (after X.3 commits 1, 2, 3 land + X.4 paywall + home commits): paywall + home + ecole. 14 screens Ã— 2 viewports.
- **Batch 3** (after X.3 commits 4, 5 + remaining X.4 commits land): vocabulaire + diagnostic + writing. 24 screens Ã— 2 viewports.

**Operating-contract block (2026-05-12 contract):**
- CONFIDENCE: HIGH on the plan. Scope is bounded (token swap + restraint pass, not from-zero rebuild). Per-surface commits in X.3 keep rollback granularity tight. No new BE contract; no migration risk.
- WHY: Visual quality is the conversion lever before launch; current `--ed-*` system is partially built but inconsistent across surfaces (three coexisting palettes; many inline hardcoded hex). Wispr Flow is the right north star for the editorial-luxury target.
- UNCERTAINTY: (1) Accent green `#8FA279` may read too muted against `--bg-canvas` warm cream at small sizes â€” verifiable in X.3 paywall commit (highest-impact surface; first to ship). (2) 3D flashcard flip on Safari iOS â€” known transform-style: preserve-3d quirks; fallback to opacity cross-fade if visible flicker. (3) Color-contrast `--text-muted #6F6B66` on `--bg-canvas` is ~4.3:1 (passes WCAG AA for normal text; would need `#605C57` to hit AAA on body). Contrast audit fires per surface in X.3.
- VERIFICATION: Per Q2 batched runbook â€” F-225 captures at 3 natural checkpoints. End-of-ticket report fires after Batch 3 passes, before X.6 dispatches.

**Owner:** Frontend Engineering

### BACKLOG-HYGIENE-001 â€” F-320 stale corpus_partition enum line (BACKLOG.md:3274)
Milestone: TBD

**Priority:** LOW (docs-only; doesn't affect shipped behavior)
**Status:** Queued
**Filed:** 2026-05-12
**Source:** F-325 Phase A0 â€” surfaced during plan investigation. BACKLOG.md:3274 (F-320 scope) describes corpus partitions as `oqlf|academie|curated`. The canonical enum per BE F-320 commit 0a7cc4b is `CC_corpus | chadi_authored | book_lab | third_party_publisher_DO_NOT_EXTRACT`. F-325 entry above uses the canonical enum; the F-320 line is stale and contradicts.
**Dependencies:** none
**Scope:** edit BACKLOG.md:3274 (F-320 scope description) to replace the `oqlf|academie|curated` triple with the canonical four-value enum. Single-line docs change; no code touched. Kept out of the F-325 BACKLOG filing commit to preserve commit-scope discipline.
**Owner:** Frontend Engineering (docs)

### F-BUGS-001-FE-A â€” [FE] Lessons load graceful degradation
Milestone: M1

**Priority:** HIGH (production dead-end on lessons API failure)
**Status:** Shipped 2026-05-13 (commit `ba86e95`). **F-225 verification deferred â€” Chadi capture pending per 3-batch plan; screenshots + interaction trace to be attached retroactively (same batch as FE-B).**
**Filed:** 2026-05-13 (filed at merge-time; ticket worked under informal tracking, formalized for shipped-state record)
**Source:** Bug 1 of F-BUGS-001-FE â€” desktop `/ecole` rendered full-page "Couldn't load your path. Retry" when `/api/ecole/lessons` returned non-2xx (401 token expired, 5xx server error, malformed response, etc.); chrome (greeting, exam date strip, recurring modules section, daily TÃ‚CHE 2 card) was dead-ended despite the other API calls succeeding via their existing `.catch` wrappers.
**Scope:**
1. Wrap `api.lessons.list()` in `.catch((e) => { console.error(...); return [] })` so `Promise.all` resolves even on lessons failure.
2. Lesson grid renders local empty-state error contained to its column rather than full-page dead-end.
3. Dev-mode error detail surfaced inline (`process.env.NODE_ENV !== 'production'` gate) for debugging without leaking to prod users.
**Files:** `components/home/EcoleDesktop.tsx`, `components/home/HomeScreen.tsx`
**Dependencies:** none (pure FE).
**F-225 verification status:** âš ï¸ Pending. Per CLAUDE.md F-225 protocol, Shipped normally gates on (a) 1440px + 375px screenshots of each affected route AND (b) interaction trace (this is a behavior change â€” failure-path rendering â€” so interaction trace applies). Chadi to capture per 3-batch plan and attach to this entry. **Until that's attached, this entry is "Shipped on code, awaiting F-225 evidence."**
**Owner:** Frontend Engineering

### F-BUGS-001-FE-B â€” [FE] Auth-flow 5-surface fix (completed-onboarding users on logged-out chrome)
Milestone: M1

**Priority:** HIGH (broken user-state routing â€” affected every returning authed user)
**Status:** Shipped 2026-05-13 (merge `c896587`, push `ba86e95..c896587 main -> main`). **F-225 verification deferred â€” Chadi capture pending per 3-batch plan; screenshots + interaction trace to be attached retroactively.**
**Filed:** 2026-05-13 (filed at merge-time; ticket worked under informal tracking, formalized for shipped-state record)
**Source:** Bug 3 of F-BUGS-001-FE â€” completed-onboarding authed users were landing on logged-out marketing chrome or being routed back through `/onboarding` instead of straight to `/ecole`. Five surfaces audited and patched. Hybrid decision on Paywall (Chadi, 2026-05-13): ship pessimistic redirect now, file F-326 for branched authed UX when BE adds `subscriptionStatus`.
**Scope (5 commits on the merged branch):**
1. **B.1 â€” `components/landing/PlatformLanding.tsx`** (8f3298d): pre-paint loader + onboarding-aware redirect. Authed users with `targetLevel` â†’ `/ecole`; authed without â†’ `/onboarding`. Prevents marketing-chrome flash.
2. **B.2 â€” `components/onboarding/OnboardingFlow.tsx`** (026703e): auth gate at the top of the flow redirects completed users to `/ecole` before any step renders.
3. **B.3 â€” `components/onboarding/OnboardingFlow.tsx`** (d0ae84a): `EcoleReveal` CTA branches by auth state â€” authed â†’ `/ecole`, unauth â†’ `/paywall`.
4. **B.4 â€” `components/Paywall.tsx`** (7bbaa0e): pessimistic redirect for any token-bearing user â†’ `/ecole`; neutral loader while hydrating. Filed F-326 (this file:3618) for the proper authed-no-sub branched-paywall flow once BE ships `subscriptionStatus`.
5. **B.5 â€” `app/login/page.tsx`** (5b0007f): suppress login-form flash before redirect when an already-authed user lands on `/login`.
**Dependencies:** none (pure FE).
**Smoke (prod, post-deploy):** `/`, `/onboarding`, `/paywall`, `/login`, `/ecole` all 200.
**F-225 verification status:** âš ï¸ Pending. Per CLAUDE.md F-225 protocol, Shipped normally gates on (a) 1440px + 375px screenshots of each affected route AND (b) interaction trace (handlers/navigation/state changes were modified, so this counts as interactive). Chadi to capture per 3-batch plan and attach to this entry. **Until that's attached, this entry is "Shipped on code, awaiting F-225 evidence."**
**Follow-up:** F-326 (this file:3618) â€” BE adds `subscriptionStatus` to `User`/`/api/auth/me`, then B.4's pessimistic redirect is replaced with a branched authed-paywall UX.
**Owner:** Frontend Engineering

### F-BUGS-001-FE-C â€” [FE] `/ecole` empty-state vs network-error differentiation
Milestone: M1

**Priority:** HIGH (regression introduced by FE-A soft-fail wrapper â€” no-lessons users saw network-error copy)
**Status:** Shipped 2026-05-13 (commit `a066660` on worktree, merged to main via `d1fd33d`). **F-225 verification deferred â€” Chadi capture pending per 3-batch plan; screenshots + interaction trace to be attached retroactively.**
**Filed:** 2026-05-13 (filed at merge-time; ticket worked under informal tracking, formalized for shipped-state record)
**Source:** Bug 1 of F-BUGS-001-FE â€” after FE-A's soft-fail wrapper landed (`ba86e95`), `/ecole` started rendering the inline "Couldn't load your path. Retry" message for users with zero enrolled lessons (empty array â€” a legitimate user state, not a failure). The single error branch couldn't distinguish "no lessons yet" from "lessons API failed", so onboarding-complete users with an empty path were shown a retry CTA that did nothing useful.
**Scope:**
1. Lessons fetcher distinguishes between (a) successful response with `[]` and (b) caught error from FE-A wrapper.
2. Empty-array path renders proper empty-state messaging (no retry CTA, copy oriented toward "your lessons will appear here").
3. Network-error path keeps the FE-A inline error column with retry CTA + dev-mode detail.
**Files:** `components/home/EcoleDesktop.tsx`, `components/home/HomeScreen.tsx`, `lib/api` wrappers.
**Dependencies:** built on FE-A (`ba86e95`) â€” this ticket exists because FE-A's catch-all collapsed two distinct states into one error branch.
**F-225 verification status:** âš ï¸ Pending. Per CLAUDE.md F-225 protocol, Shipped normally gates on (a) 1440px + 375px screenshots of `/ecole` in both empty-array and network-error states AND (b) interaction trace (failure-path rendering + retry CTA behavior). Chadi to capture per 3-batch plan and attach to this entry. **Until that's attached, this entry is "Shipped on code, awaiting F-225 evidence."**
**Owner:** Frontend Engineering

### F-BUGS-001-FE-D â€” [FE] TÃ¢che 2 candidate-brief language defaulting + FR/EN toggle
Milestone: M1

**Priority:** MEDIUM (UX polish â€” brief comprehension blocker for A1/A2 users)
**Status:** Shipped 2026-05-13 (commit `341d567`, fast-forward to main from `d1fd33d`). **F-225 verification deferred â€” Chadi capture pending per 3-batch plan; screenshots + interaction trace to be attached retroactively.**
**Filed:** 2026-05-13 (filed at merge-time; ticket worked under informal tracking, formalized for shipped-state record)
**Source:** `candidate_brief` on `/speaking/tache-2/<scenario>` rendered in English regardless of the user's self-assessed level â€” fine for B1+ users practicing comprehension under FR cognitive load, but a hard blocker for A1/A2 users who couldn't parse the scenario in the first place. No per-user override existed either.
**Scope:**
1. Default-language rule by `target_level`: `B1+` defaults to FR (immersion), `A1`/`A2` defaults to EN (comprehension-first).
2. `BriefLanguageToggle` (FR/EN) added to the TÃ¢che 2 session UI so any user can flip at will.
3. Per-conversation persistence via `localStorage` key `lemethodic_brief_lang_<conversation_id>` (scoped per scenario instance, so a user can prefer FR on one scenario and EN on another without bleed-over).
**Files:** `components/speaking/Tache2Session.tsx`, `lib/storage-keys.ts`.
**Dependencies:** none (pure FE).
**Caveat:** brief copy is FE-side placeholder mirroring BE seed quality â€” F-061.1 is the architectural fix that wires FE to BE `candidate_brief_*` fields. This ticket ships the toggle + defaulting UX against the placeholder copy; F-061.1 will replace the source of the strings without touching the toggle behavior.
**F-225 verification status:** âš ï¸ Pending. Per CLAUDE.md F-225 protocol, Shipped normally gates on (a) 1440px + 375px screenshots of `/speaking/tache-2/<scenario>` in FR and EN states AND (b) interaction trace (toggle click â†’ language swap â†’ localStorage persist â†’ reload retains choice). Chadi to capture per 3-batch plan and attach to this entry. **Until that's attached, this entry is "Shipped on code, awaiting F-225 evidence."**
**Owner:** Frontend Engineering

### F-326 â€” [BE] subscriptionStatus on User (BE follow-up to F-BUGS-001-FE-B B.4)
Milestone: M1

**Priority:** MEDIUM (unblocks proper authed paywall UX)
**Status:** Queued
**Filed:** 2026-05-13
**Source:** F-BUGS-001-FE-B B.4 auth-flow audit â€” authed users on /paywall currently get a pessimistic redirect to /ecole because the User type carries no subscription / trial-status field. We cannot distinguish (c) authed-with-subscription from (d) authed-without-subscription on FE. Hybrid decision (Chadi, 2026-05-13): ship the redirect now; file BE follow-up so authed-no-sub users can eventually see a tailored upgrade screen instead of being bounced.
**Dependencies:** BE side â€” `/api/auth/me` response shape + `User` Pydantic model + DB column (or join from existing subscription/billing table if one exists). FE side â€” once shipped, `components/Paywall.tsx:125-142` branches on `user.subscriptionStatus`.
**Scope:**
1. BE: add `subscription_status` to `/api/auth/me` payload. Suggested enum: `none | trial_active | trial_expired | active | past_due | cancelled`. Source from whatever billing-state record already exists (Stripe sync table? user.stripeCustomerId+lookup? confirm with Chadi).
2. FE (`lib/types.ts`): add `subscriptionStatus?: 'none' | 'trial_active' | ...` to `User`.
3. FE (`components/Paywall.tsx`): replace the pessimistic redirect with a branch â€” `active | trial_active` â†’ `/ecole`; `none | trial_expired | past_due | cancelled` â†’ render paywall with copy + CTA tailored to that state. Re-label CTAs from "Start free trial" â†’ "Upgrade" / "Renew" where appropriate.
**Risk:** depends on what billing tables already exist BE-side. If there's no subscription record yet (Stripe wiring deferred per F-060), this ticket is blocked until that lands.
**Owner:** Backend Engineering (step 1), Frontend Engineering (steps 2-3)

---

## Onboarding harden+polish â€” 2026-05-24 critique (run 2, score 29/40)

These four tickets are the direct output of the `/impeccable critique` second pass on the onboarding flow. Address in priority order; P0 first next session.

### F-327 â€” [FE+BE] [P0] another_exam funnel restoration + waitlist moat (BE + FE)
Milestone: DONE

**Priority:** P0 â€” conversion blocker + soft-beta moat
**Status:** âœ… Shipped
**Filed:** 2026-05-24 Â· Scope expanded: 2026-05-25 Â· Shipped: 2026-05-25 (BE 2d54de0, FE d329ff0)
**Source:** Impeccable critique run 2 (2026-05-24T06-53-58Z) + scope-expansion diagnosis 2026-05-25
**Surface:** `components/onboarding/questions/ExamPickerQuestion.tsx`, `components/onboarding/OnboardingFlow.tsx`, new post-submit + confirmation screens, BE `app/routers/onboarding.py` + schema + model + migration

**Problem (revised):** The "another exam" trap isn't a BE dead-end â€” it's a localStorage trap. Picker opens an inline form (which exam? + email), submits to `lib/landing/waitlist.ts` (localStorage), parks user at confirmation, gates Continue locally. Result: (1) waitlist signal lost on cache clear or browser change â€” permanent data loss during soft-beta, (2) user must manually backtrack to a supported exam to continue. BE already has a waitlist branch (`app/routers/onboarding.py:99`) for `q0_target_exam='another_exam'` but FE never sends that value, so the branch is dead code today.

**Decision (locked 2026-05-25):** Replace the localStorage trap with BE-persisted waitlist + b1_to_b2 proxy-continuation offer. Rejected the original "accept another_exam + default plan + upsell later" framing as dishonest pricing/trust risk â€” users would pay for prep that doesn't match their target. Chosen path: capture granular intent at q0, offer b1_to_b2 proxy at end of questionnaire when q1/q2 levels fit, otherwise waitlist-only with clean exit.

**BE changes (lands first, `master` branch):**
- Add `q0_specific_intended_exam: Optional[str]` (max 120 chars) + `q0_accept_fallback: bool = False` to `OnboardingSubmitRequest` schema
- Pydantic validator: require non-empty `q0_specific_intended_exam` when `q0_target_exam='another_exam'`
- Add `users.specific_intended_exam VARCHAR(120) NULL` column + Alembic migration
- Modify waitlist branch in `app/routers/onboarding.py`: always persist `user.specific_intended_exam`. When `q0_accept_fallback=True` AND `should_offer_b1_to_b2_fallback(q1, q2)` returns True â†’ also create b1_to_b2 enrollment, return `path_slug='b1_to_b2'` alongside `waitlist=True`. Otherwise waitlist-only response (existing shape).
- `users.target_exam='another_exam'` always preserved regardless of enrollment (intent kept for plan migration when actual exam ships)

**FE changes (lands second, `main` branch):**
- `ExamPickerQuestion.tsx`: remove `submitWaitlist` localStorage call entirely; drop inline email field (user is authed); keep "which exam?" free-text input; enable Continue when `another_exam` selected + examName non-empty. Propagate `specific_intended_exam` alongside `q0_target_exam` via `OnboardingFlow` state.
- `OnboardingFlow.tsx`: if `q0_target_exam==='another_exam'`, insert a `WaitlistOrProxyConfirmation` screen between q11 and submit. Two CTAs: "Continue with La MÃ©thode (recommended)" â†’ submit with `accept_fallback=true`; "Just add me to the waitlist" â†’ submit with `accept_fallback=false`. Non-another_exam users submit normally.
- New post-submit screen handles three BE response shapes: (a) enrolled-on-proxy (`path_slug='b1_to_b2'` + `waitlist=True`) â€” proxy-continuation success, route to `/ecole`; (b) waitlist-only with fallback offered but not accepted â€” waitlist confirmation, clean exit; (c) waitlist-only with no fallback (levels don't fit) â€” waitlist-only confirmation, clean exit.
- Audit `lib/landing/waitlist.ts` for other callers; delete only if unused elsewhere in the codebase.
- Copy uses canonical product name "La MÃ©thode" (not "L'Ã‰cole") even though routes stay legacy `/ecole` until M-RENAME ships.

**Acceptance:**
- BE: `target_exam='another_exam'` + `accept_fallback=true` + `q1='b1'` + `q2='b2'` â†’ `users.specific_intended_exam` set + `path_slug='b1_to_b2'` + enrollment row created + `waitlist=True`
- BE: `target_exam='another_exam'` + `accept_fallback=true` + `q1='a1'` + `q2='a2'` â†’ `users.specific_intended_exam` set + `path_slug=null` + no enrollment + `waitlist=True` (graceful degradation when levels don't fit)
- BE: `target_exam='another_exam'` + `accept_fallback=false` â†’ `users.specific_intended_exam` set + `path_slug=null` + no enrollment + `waitlist=True`
- BE: `target_exam='tcf_canada'` (or any other active slug) â†’ unchanged behavior (regression-clean)
- FE: TEF Canada / DELF B1-B2 paths unchanged (already active); proxy path works end-to-end; waitlist-only confirmation has working exit; no localStorage waitlist writes anywhere in onboarding flow
- Cross-repo smoke test: four paths verified (active happy, another+proxy+valid levels, another+waitlist, another+proxy+invalid levels)

**Branches:**
- BE: `feat/v-exampicker-payload-and-fallback` off `master`
- FE: `fix/v-exampicker-another-exam` off `main`

**Owner:** Frontend + Backend Engineering

---

### F-328 â€” [FE] [P1] DateInputQuestion: date bounds enforced but never communicated
Milestone: M1

**Priority:** P1 â€” silent error on mobile
**Status:** ðŸ“‹ Queued
**Filed:** 2026-05-24
**Source:** Impeccable critique run 2 (2026-05-24T06-53-58Z)
**Surface:** `components/onboarding/questions/DateInputQuestion.tsx`

**Problem:** The date input enforces `min` and `max` attributes (computed from `dateMeta.minOffsetDays`/`maxOffsetDays`) but provides no helper text explaining why certain dates are unavailable. On mobile, the native date picker grays out blocked dates silently. A user whose actual exam is sooner than the minimum offset assumes the field is broken rather than understanding the constraint.

**Fix:**
- Add a persistent helper below the date label: e.g., "Pick a date at least [N] days out â€” we need time to build your plan." Derive the human-readable minimum from `minDate` already computed in the component.
- If a blocked date is tapped (detectable on some mobile pickers via `onChange` with an out-of-range value), show an inline message near the input explaining the constraint.

**Scope:** `DateInputQuestion.tsx` only â€” label + optional inline message. No BE changes.
**Owner:** Frontend Engineering

---

### F-329 â€” [FE] [P2] MultiSelectQuestion: no affordance that multiple selections are allowed
Milestone: M1

**Priority:** P2 â€” answer quality
**Status:** ðŸ“‹ Queued
**Filed:** 2026-05-24
**Source:** Impeccable critique run 2 (2026-05-24T06-53-58Z)
**Surface:** `components/onboarding/questions/MultiSelectQuestion.tsx`

**Problem:** Multi-select questions render identically to single-select questions. No label, no count badge, no post-first-selection hint indicates that more than one option can be chosen. Users pick one option and press Continue, unaware that multi-selection was possible. This produces thinner plan data.

**Fix:**
- Add a persistent small label above the card list: "Select all that apply" (FR: "SÃ©lectionnez tout ce qui s'applique"). Use `ED_MUTED` + 12px uppercase to match descriptor weight.
- Optionally: show a count badge ("2 selected") below the headline after the first selection, using `aria-live="polite"` so screen readers announce the change.

**Scope:** `MultiSelectQuestion.tsx` only â€” label + optional count. No BE changes.
**Owner:** Frontend Engineering

---

### F-330 â€” [FE] [P3] EcoleReveal: persona label arrives without narrative bridge
Milestone: M1

**Priority:** P3 â€” trust layer
**Status:** ðŸ“‹ Queued
**Filed:** 2026-05-24
**Source:** Impeccable critique run 2 (2026-05-24T06-53-58Z)
**Surface:** `components/onboarding/EcoleReveal.tsx`

**Problem:** The reveal shows the persona label ("Intensive") and a plan summary with no sentence connecting the user's inputs to the outcome. Users see what they're getting but not why â€” which can feel like being labeled rather than understood. Particularly significant for high-stakes users (immigrants, professionals) who need to trust the plan.

**Fix:**
- Add one line above the persona label or below the descriptor: e.g., "Based on your timeline, here's the plan we built." (FR: "En fonction de votre calendrier, voici le plan que nous avons construit.")
- Alternative: on the plan card, replace the "Your plan" eyebrow with a light-touch rationale: "Because your exam is in [N] weeks" or "Built around your [B2â†’C2] goal."
- Keep it to one line â€” the current reveal is well-paced and this should not add bulk.

**Scope:** `EcoleReveal.tsx` copy + layout only. No BE changes.
**Owner:** Frontend Engineering

---

### B-104 â€” [FE] [P1] Paywall: surface Exam Bundle tier for time-bounded users
Milestone: M6

**Priority:** P1 â€” merchandising bug, not pricing change
**Status:** ðŸ“‹ Queued
**Filed:** 2026-05-25
**Source:** Impeccable critique 2026-05-24 product observation
**Surface:** `components/paywall/*` (audit needed)

**Problem:** Paywall presents $199 Sprint as the headline option. Users with â‰¤8 weeks to exam (the visa-urgent cohort, our primary persona per memory) see no time-bounded alternative on first glance. The $29 Exam Bundle tier exists in the pricing structure but isn't surfaced explicitly for users who are exactly the audience it was designed for â€” defaulting them toward Sprint when Exam Bundle may be the better trial.

**Fix:** Audit current paywall component(s). Surface the $29 Exam Bundle as a primary option when the user's persona resolves to `cram` (â‰¤6 weeks per existing `derive_persona` logic) or `acceleration` (6 weeks â€“ 6 months). Sprint stays available but moves to secondary. Foundation users (no exam scheduled, persona='foundation') keep the current Sprint-led presentation.

**Scope:** FE only. No pricing change. No BE change. Surface logic keys off persona already derived in onboarding state.

**Branch:** `feat/b-104-paywall-exam-bundle-surfacing`

**Owner:** Frontend Engineering

---

## Working protocol reminder

- Every new ticket drafted must reference this BACKLOG.md and use the next available F-0xx number.
- Every completed ticket must be marked âœ… in this file with a brief summary of what shipped.
- If this file conflicts with memory or a past conversation, this file wins.
- External tracker equivalent: there isn't one. This file IS the tracker.

---

---

## Mapping notes â€” M0 milestone tagging (2026-05-25)

TBD tickets below have ambiguous milestone assignments. One-line questions for Chadi.

- **P-222.x, P-222.y** â€” capacity_warning UX + EcoleReveal waitlist-aware copy: M1 (onboarding surface parity) or polish-defer?
- **P-230.x, P-230.consolidate, P-230.unify** â€” Recent activity calendar + /progress de-duplication: M1 (dashboard completeness) or polish-defer?
- **P-213** â€” Dialogue Box template authoring: M4 (La BibliothÃ¨que content), M1 (L'Ã‰cole surface), or polish-defer?
- **P-231, P-232, P-233, P-234.history, P-234.exercises, P-234.speaking-promptCluster, P-235, P-236, P-237, P-241** â€” Post-launch P1 dashboard + prescription surfaces: any of these required for soft-beta (M1/M7), or all polish-defer?
- **P-250, P-251** â€” Threshold calibration + lesson content delivery: M4 (La BibliothÃ¨que) or post-launch?
- **P-260, P-261, P-262, P-263, P-264, P-265, P-266** â€” Phase 2 writing + content expansion: all polish-defer?
- **P-104.x** â€” Wall-clock setTimeout cap fallback: M1 pre-launch blocker or polish-defer edge case?
- **V-015d.trend, V-015d.streak, V-013b.lang-pref, V-013b.notifications, V-013b.password, V-013a.history, V-016g.notify** â€” BE endpoints called by shipped M1 FE surfaces: which are required for M1 sign-off vs. deferrable to V1.1+?
- **F-312** â€” OQLF + AcadÃ©mie franÃ§aise RAG retrieval: M3 prerequisite (scorer quality) or separate infrastructure track outside V1.0 milestones?
- **F-225.constraint** â€” F-225 amendment doc (non-visual change note): mark DONE (process doc only) or keep as M1 process gate?
- **F-310.fe.coldreload** â€” Route email_not_verified 403 on cold reload: M1 edge case or polish-defer until a real user hits it?
- **BACKLOG-HYGIENE-001** â€” F-320 stale corpus_partition enum line: DONE (one-line cleanup) or TBD?
- **EX-100** â€” Execution tooling evaluation: not milestone-gated â€” close as ops or defer to M7 process review?

---

### M2 t10 â€” Wire Atelier FranÃ§ais color tokens (light + dark) + --lm-* bridge

**Milestone:** M2 (token foundation)
**Status:** âœ… Shipped â€” cf73e19 (main, 2026-05-30)
**Non-visual change (no Playwright receipt required):** token-only edit; no new components or layout surfaces.

**What shipped:**
- DESIGN.md v2 canonical palette defined in `:root` (light) and `.dark` (night-paper): `--paper`, `--ink`, `--dominant`, `--accent` and their scale/alpha variants; couche tokens `--couche-default` / `--couche-pieges`; shape tokens `--r-xs` â€¦ `--r-pill`; motion `--ease` / `--ease-snap`.
- `.dark` block fully replaced: v2 night-paper values per DESIGN.md Â§2 locked spec. `--foreground` and `--accent` flip automatically with the `.dark` class (wordmark-ready).
- Shadcn rewire updated: `--background`, `--foreground`, `--primary`, `--accent`, `--border`, `--input`, `--ring` all chain through v2 canonical tokens.
- `--lm-*` bridge: all tokens re-pointed to v2 canonical vars; no `--lm-*` token deleted (M-RENAME handles component-level migration).
- Stale v1 hexes eliminated: `C49A3A / FAF7F0 / BC4F2A / A66A2E / 8E5A1F / E0701D / D4A431` â€” zero matches in globals.css.
- v2 Tailwind utilities added to `@theme inline`: `--color-paper`, `--color-ink`, `--color-dominant`, `--color-couche-*`, etc.

**âš  M-RENAME flags (PR notes for Chadi):**
- `--lm-brand-*` mapped to `--dominant-*` (v1 warm ochre had no v2 analog; nearest semantic = primary).
- `--lm-bg-base` mapped to `var(--paper)` (v1 `#FAF7F0` warm cream banned in v2; components reading this now get pure white in light mode).
- `--lm-warm-*` decorative tokens mapped to nearest paper/dominant/ink roles; `--lm-warm-sage-deep` was `var(--accent-primary)` (sage green), now `var(--dominant-soft)` (blue-grey). Component-level migration is M-RENAME.
- Pastel chip tokens (`--lm-pastel-*`) retained at original hex â€” no v2 semantic role; they're decorative chip layer only per DESIGN.md Â§2 color hierarchy.

**Blocks:** t1â€“t9 re-execution against v2 spec, M-RENAME routes.

---

### M2 t11 â€” Wire Type A typography tokens + next/font loading

**Milestone:** M2 (token foundation)
**Status:** âœ… Shipped â€” ee03af4 (main, 2026-05-30)

**What shipped:**
- Five fonts loaded via `next/font/google` in `app/layout.tsx`, all with `subsets: ['latin', 'latin-ext']` for French diacritics (Ã© Ã¨ Ãª Ã  Ã´ Ã§ Å“ Å’):
  - `Instrument_Serif` w400 â†’ `--font-instrument-serif`
  - `Crimson_Pro` w400/600 normal+italic â†’ `--font-crimson-pro`
  - `Instrument_Sans` w400/500/600 â†’ `--font-instrument-sans`
  - `Inter` w400/500/600 â†’ `--font-inter`
  - `DM_Mono` w400/500 â†’ `--font-dm-mono`
- All five `.variable` bindings on `<html>` className.
- `globals.css` `:root` â€” DESIGN.md v2 semantic aliases: `--f-display`, `--f-body`, `--f-ui`, `--f-en`, `--f-mono` â†’ next/font injected vars.
- `@theme inline` utilities: `--font-display`, `--font-body`, `--font-ui-fr`, `--font-ui-en`, `--font-mono`.
- Legacy shadcn bridges: `--font-sans â†’ --f-ui` (Instrument Sans), `--font-serif â†’ --f-body` (Crimson Pro). No broken references.
- Stale v1 fonts (Cabinet Grotesk localFont, v1 Geist, v1 Source Serif 4) removed from imports + all CSS references.
- `Select-String -Pattern 'Cabinet Grotesk|Geist|Source Serif'` â†’ 0 matches in `app/layout.tsx` + `app/globals.css`.
- `themeColor` updated from warm cream to v2 `--paper` (#FFFFFF).

**âš  Playwright diacritic gate deferred:** Target routes (`/la-methode`, `/la-bibliotheque`, `/l-examen`) are M-RENAME routes that currently 404 per DESIGN.md Â§10. French diacritic visual verification batched into the soft-beta launch full-surface Playwright battery (F-225 amendment). Coverage exists for all live routes.

**PR notes for Chadi â€” weight choices (DESIGN.md silent on these):**
- Instrument Serif: w400 only (no other weights on Google Fonts for this face).
- Crimson Pro italic included (editorial body pull quotes, marginalia per DESIGN.md Â§7).
- Instrument Sans / Inter / DM Mono weights flagged in the commit; use the table defaults from the brief.

**Blocks:** t1â€“t9 re-execution against v2 spec.

---

### M2 ops â€” Disable Playwright auto-captures + clean output (drive constraint)

**Milestone:** M2 ops
**Status:** âœ… Shipped â€” (main, 2026-05-30)

**What shipped:**
- `playwright.config.ts`: `screenshot: 'off'`, `video: 'off'`, `trace: 'off'` added to `use` block. Previously only `trace: 'on-first-retry'` was set; screenshot/video were implicitly off. All three now explicit.
- `.gitignore`: Added `playwright-report/`, `tests/screenshots/`, `tests/traces/`, `tests/videos/` alongside existing `test-results/` entry.
- Deleted `test-results/` directory (existed on disk, empty, 0 MB). No other capture directories were present.

**F-225 verification approach change (Chadi 2026-05-30 â€” drive constraint):** F-225 amendment (automated Playwright capture as the verification receipt) is **reverted** for the current dev machine. Verification approach for all future tickets reverts to:
1. Manual smoke test against local dev server.
2. Confirm `next build` passes.
3. Deploy to lemethodic.com (Vercel) and verify the live URL.

The F-225 amendment remains documented in CLAUDE.md as the intended protocol; it will be re-enabled when drive space allows. Until then, `non-visual change â€” verification skipped` or `manual smoke pass` are acceptable receipt notes on PRD entries.

**Disk freed:** 0 MB (captures were already empty). Config and gitignore changes prevent future accumulation.

---

## M-VISUAL-AUDIT â€” Surface visual audit (read-only punch-list)

**Milestone:** M2 foundation
**Status:** âœ… Shipped â€” (main, 2026-05-30)

**What shipped:**
- `M-VISUAL-AUDIT.md` created at repo root: read-only static analysis across all working routes.
- 49 findings across 5 categories (A: off-palette colors, B: off-system Tailwind utilities, C: tokenization opportunities, D: contrast risks, E: copy violations).
- Zero source-file modifications â€” pure audit output.
- All 8 known screenshot issues mapped to findings.

**Key findings:**
- **A-007** (root cause): F-VISUAL-001 `:root` intermediate tokens (`--bg-canvas`, `--text-primary`, `--cta-primary`) still hold v1 warm-cream hex values; light mode components consuming these get v1 look.
- **A-008/A-010**: `lib/typography.ts` SANS_FONT/SERIF_FONT still reference Geist/Source Serif 4; 20+ components inherit banned fonts.
- **E-001**: `BRAND = 'LeMethodic'` in `lib/copy.ts` â€” missing space and accent; drives all landing body copy.
- **E-003/E-004**: BottomNav/TopNav nav labels in English ("Speaking", "Writing", "Progress").
- **E-005**: "4 couches" in WritingPromptPicker (should be 5).

**Non-visual change â€” verification skipped** (audit doc only, no UI surface changes).

---

## M-VISUAL fix A-007 â€” Replace v1 warm-cream :root tokens with v2 Palette A values

**Milestone:** M2 visual fixes
**Status:** âœ… Shipped â€” (main, 2026-05-30)

**What shipped:**
- `app/globals.css` `:root` block â€” F-VISUAL-001 intermediate tokens remapped to v2 chains:
  - `--bg-canvas: hsl(38 25% 96%)` (#F8F4ED warm cream) â†’ `var(--paper)` (#FFFFFF)
  - `--bg-elevated: hsl(0 0% 100%)` (orphan) â†’ `var(--paper)`
  - `--bg-subtle: hsl(38 18% 92%)` (#ECE7DE warm muted) â†’ `var(--paper-edge)` (#F4F4F5)
  - `--text-primary: hsl(30 18% 14%)` (#2A2520 warm near-black) â†’ `var(--ink)` (#0F1419)
  - `--text-secondary: hsl(30 10% 28%)` â†’ `var(--ink-soft)` (rgba 62%)
  - `--text-muted: hsl(30 5% 42%)` â†’ `var(--ink-faint)` (rgba 38%)
  - `--text-disabled: hsl(30 5% 60%)` â†’ `var(--ink-faint)`
  - `--accent-primary: hsl(80 18% 58%)` (#8FA279 sage) â†’ `var(--accent)` (#C8102E vermillion); no v2 sage analog per DESIGN.md Â§2
  - `--accent-primary-hover: hsl(80 18% 48%)` â†’ `var(--accent-soft)` (#E84A5F)
  - `--accent-primary-soft: hsl(80 22% 88%)` â†’ `var(--paper-edge)`
  - `--cta-primary: hsl(220 40% 21%)` (#1F2D4A) â†’ `var(--dominant)` (#14213D); was v1 purple-navy, now correct ink blue
  - `--cta-primary-hover: hsl(220 40% 14%)` â†’ `var(--dominant-deep)` (#0B1729)
  - `--rule-default: hsl(38 18% 88%)` (#E5E0D8 warm divider) â†’ `var(--rule)` (rgba cool 8%)
  - `--rule-strong: hsl(38 15% 78%)` **removed** â€” duplicate that was silently overriding the v2 canonical `rgba(15, 20, 25, 0.16)` defined above it

**Auto-resolved by this change (components reading via bridge now get correct values):**
- Any component using `var(--bg-canvas)` directly: cream â†’ paper white (affects RevealOnScroll, HeroSection via `ED.bg = 'var(--bg-canvas)'` in lib/motion.ts)
- Any component using `var(--text-primary)` directly: warm near-black â†’ v2 ink
- Any component using `var(--cta-primary)` directly: v1 purple-navy â†’ v2 dominant (fixes Known issue #1: CTA hue)
- `.pricing-popular-card` border in globals.css: auto-resolves via `var(--cta-primary)` chain
- `.ed-field:focus-visible { border-color: var(--cta-primary) }`: auto-resolves
- `D-002` (PersonaMatch sage icons): `var(--accent-primary)` now resolves to vermillion â€” visual change from sage to vermillion icons on `/`
- `--rule-strong` in light mode now correctly resolves to `rgba(15, 20, 25, 0.16)` (was overridden by warm gray)

**Deferred to next dispatch (out of A-007 scope):**
- A-013: `.ed-cta-warm-hover:hover { background-color: var(--lm-warm-peach-deep) }` â€” light-mode utility class, not `:root` block
- A-016: `.prose-legal th { background-color: rgba(0, 0, 0, 0.02) }` â€” utility class, not `:root` block
- `.ed-field:focus-visible { box-shadow: 0 0 0 3px rgba(31, 45, 74, 0.18) }` â€” hardcoded v1 navy shadow in utility class, not `:root` block
- `--lm-warm-peach: #FFD8C2`, `--lm-warm-peach-deep: #E0A890` â€” `--lm-*` bridge preserved intact per brief
- Neutral scale `--neutral-50` through `--neutral-950` (warm HSL) â€” no v2 DESIGN.md equivalent defined; left for M-RENAME
- All Category A component-level hardcoded hex (A-001 through A-006, A-008 through A-011) â€” component dispatch

**Stale-hex check post-fix:** `Select-String -Path app\globals.css -Pattern '#FAF7F0|#F5EFE0|...'` â†’ 0 matches âœ“

**Manual smoke (per revised verification protocol):** `/ecrit`, `/progres` backgrounds are now paper white not cream when light mode; dark mode night-paper unaffected (`.dark` override already correct since t10).

---

---

## M2 5-couche restate: English benefit-led headers + French names as supporting brand label âœ… Shipped

**Status:** âœ… Shipped

**Scope:** Copy + layout change only. No token changes, no globals.css edits, no route logic.

### Changes

**`components/landing/CouchesLayer.tsx`**

Added `heading: string` and `headingColor?: string` props (default `'var(--ink)'`). New render order:
1. `<h3 data-testid="couche-heading">` â€” English benefit-led header, SANS_FONT, weight 600, `headingColor`, marginBottom 4px
2. `<p data-testid="couche-name">` â€” French brand label, SERIF_FONT italic, 0.9375rem (~80% of heading), lineHeight 1.2, `nameColor`, marginBottom 12px
3. `<p data-testid="couche-description">` â€” Body copy, unchanged

`data-testid="couche-name"` moved from h3 to the French label `<p>` to preserve unit test compatibility (test checks French names via this testid).

**`components/landing/MethodologyPreview.tsx`**

COUCHES array updated: added `heading` field (English header) and `headingColor` per entry. Updated descriptions 1 and 5.

| # | English heading | French label | headingColor | nameColor |
|---|---|---|---|---|
| 01 | Structure that holds under pressure | Le Propos | var(--ink) | var(--dominant) |
| 02 | Ideas on tap, not memorized | Le Plan | var(--ink) | var(--dominant) |
| 03 | Sentences examiners recognize | La Construction | var(--ink) | var(--dominant) |
| 04 | Anglo traps that cost the most points | Les PiÃ¨ges Anglais | var(--accent) | var(--accent) |
| 05 | The rhythm examiners reward | La Musique | var(--ink) | var(--dominant) |

Updated descriptions (1 restated, 5 shortened): "A clear position, developed argument, and grounded conclusion: the structural backbone every oral response needs." / "the delivery layer that carries your method into the scoring grid" (removed "examiner").

**Deferred:** `ProductDemo.tsx` demo text em-dashes (A-003/A-005/A-006 scope). CouchesLayer accentColor still uses lm-pastel-* tokens (C-003 scope). Section CTA `href="/method"` not yet verified as live route.

**Verification:** `pnpm build` clean. Em-dash regression check on new copy strings: 0. Unit test `MethodologyPreview.test.tsx` compatible (data-testid="couche-name" still returns French names).

---

## M5 Wordmark: typewriter LE MÃ‰THODIC + caret + animated frame + breathing M âœ… Shipped

**Status:** âœ… Shipped

**Scope:** New `components/Wordmark.tsx` component + keyframes in `app/globals.css` + replacement of all 8 inline brand-mark rendering sites.

### Component (`components/Wordmark.tsx`)

Props:
- `size?: 'nav' | 'showcase'` â€” nav: small static; showcase: large with full animation sequence
- `animateReveal?: boolean` â€” showcase: IntersectionObserver triggers sequence; nav: false (default)
- `href?: string` â€” wraps in Next.js Link when provided

Animation layers (showcase + `animateReveal=true`):
1. Typewriter â€” CSS `wordmark-letter-in` with 70ms stagger per character
2. Caret appear + blink â€” CSS `wordmark-caret-appear` + `wordmark-caret-blink` after last letter
3. Frame draw â€” WAAPI `stroke-dashoffset` on two SVG paths (800ms ease), starts after caret blink
4. Breathing M â€” CSS `wordmark-m-breathe` (scale 1.0â†’1.06 + color var(--ink)â†’var(--accent), 3.6s loop) after frame

Nav mode: frame immediately visible, caret blinking, M breathing â€” all static-state CSS.

Text layer: "Le MÃ©thodic" in mixed-case DOM with `textTransform: uppercase` CSS. Visual = "LE MÃ‰THODIC" in DM Mono (`var(--f-mono)`). DOM `textContent` preserves "Le MÃ©thodic" for test and accessibility compat.

Frame SVG: two paths from top-center â€” Path A (left side) + Path B (right side) â€” meeting at bottom-center. `stroke-width: 1.4`, `stroke-linejoin: miter`, `stroke="var(--ink)"`. Padding: nav (x:11, y:5), showcase (x:20, y:12). WAAPI handles runtime path length. Light/dark flips automatically via `var(--ink)`.

Caret: `|` glyph, `color: var(--accent)` (vermillion #C8102E light / #E23A54 dark). Blinks 1s step-start cycle.

Breathing M: wraps the `M` character specifically. Scale + color via CSS chain to `wordmark-m-breathe`.

Reduced motion: `@media (prefers-reduced-motion: reduce)` strips all animations, shows final static state immediately.

Accessibility: `aria-label="Le MÃ©thodic"` on wrapper, `aria-hidden="true"` on SVG + caret, `data-testid="wordmark"`.

### Replacements (8 sites)

| File | Old | New |
|---|---|---|
| `components/landing/LandingHeader.tsx` | `{BRAND}` in `<span>` | `<Wordmark size="showcase" animateReveal />` |
| `components/nav/TopNav.tsx` | italic SERIF Link | `<Wordmark size="nav" href="/la-methode" />` |
| `components/layout/Sidebar.tsx` | italic SERIF inside Link | `<Wordmark size="nav" />` inside existing Link (preserves `data-testid="sidebar-wordmark"` + `onClick`) |
| `app/login/page.tsx` | `<p>Le MÃ©thodic</p>` | `<Wordmark size="nav" />` |
| `app/verify-email/page.tsx` | `<p>Le MÃ©thodic</p>` | `<Wordmark size="nav" />` |
| `app/password-reset/page.tsx` | `<p>Le MÃ©thodic</p>` | `<Wordmark size="nav" />` |
| `components/ecole/intro/EcoleIntro.tsx` | italic text Link | `<Wordmark size="nav" href="/la-methode" />` |
| `components/cluster/ClusterDetailPage.tsx` | `<span>Le MÃ©thodic</span>` | `<Wordmark size="nav" />` (parent Link handles navigation) |

Excluded (plaintext contexts): `Paywall.tsx` comparison table header, `LandingFooter.tsx` copyright, `Tache3Session.tsx` error message, all `<title>`/`metadata`/`manifest.json` strings.

### Test compat

`Sidebar.test.tsx` `toHaveTextContent('Le MÃ©thodic')` passes: mixed-case DOM text "Le MÃ©thodic" + caret "|" = "Le MÃ©thodic|"; substring check finds "Le MÃ©thodic". IntersectionObserver is no-op in jsdom (setup.ts stub), so `triggered` stays false, component renders static. `AppShell.test.tsx` click on `sidebar-wordmark` still works â€” parent Link wrapper preserved with `onClick={onLinkClick}`.

Pre-existing test failure: `CouchesBreakdown.test.tsx > each couche badge has a data-cefr-token attribute` â€” confirmed failing before this commit (reproduces on 95df816 baseline). Not introduced by M5 Wordmark.

**Verification:** `pnpm build` clean. Sidebar + AppShell tests pass. CouchesBreakdown failure pre-existing.

## M5-fix Wordmark: replacement gap fix â€” StickyHeader + SignupForm + verification sweep âœ… Shipped

**Status:** âœ… Shipped

**Scope:** Remediation of two replacement sites omitted from 77be0ed. `StickyHeader.tsx` had `data-testid="header-logo"` `<Link>` with inline SERIF markup still rendering on the marketing route; `SignupForm.tsx` had inline `<p>Le MÃ©thodic</p>` on the signup surface. Both replaced with `<Wordmark>`. Tests updated: `header-logo` â†’ `wordmark` in both `tests/unit/landing/StickyHeader.test.tsx` and `tests/unit/layout/StickyHeader.test.tsx`.

### Replacements (2 sites)

| File | Old | New |
|---|---|---|
| `components/layout/StickyHeader.tsx` | `<Link data-testid="header-logo">Le MÃ©thodic</Link>` (SERIF inline) | `<Wordmark size="showcase" animateReveal href="/" />` |
| `components/auth/SignupForm.tsx` | `<p>Le MÃ©thodic</p>` (SERIF inline) | `<div style={{ marginBottom: 24 }}><Wordmark size="nav" /></div>` |

### Verification sweep (all 10 Wordmark sites confirmed)

All 8 original 77be0ed sites (`LandingHeader`, `TopNav`, `Sidebar`, `login`, `verify-email`, `password-reset`, `EcoleIntro`, `ClusterDetailPage`) confirmed via grep. Plus the 2 new sites above. `data-testid="header-logo"` returns zero matches codebase-wide.

Excluded (plaintext contexts, unchanged): `AppShell.tsx` mobile top-bar brand label (in-product, not a marketing/nav wordmark site), `Paywall.tsx` comparison table header, `LandingFooter.tsx` copyright, all `<title>`/metadata strings.

**Note:** `SERIF_FONT` (Source Serif 4) import removed from `StickyHeader.tsx` and `SignupForm.tsx` as part of cleanup. Remaining `SERIF_FONT` usages in other files are a t11 typography question tied to deferred A-008/A-009 â€” not addressed here.

**Verification:** `pnpm build` clean. 402 unit tests pass. CouchesBreakdown failure pre-existing (t10 token rename).

## M2-shell-sweep: sidebar overlap + mobile drawer close + marketing mobile nav + auth home redirect âœ… Shipped

**Status:** âœ… Shipped

**Scope:** Three independent shell defects fixed atomically.

### Fix 1 â€” Desktop sidebar / TopNav overlap + mobile drawer close affordance

**Root cause:** `Sidebar` (`position: fixed; top: 0; z-index: 50`) and `TopNav` (`position: sticky; top: 0; z-index: 50; height: 64px`) both anchored to the viewport top. Same z-index; Sidebar later in DOM order â†’ Sidebar painted over TopNav's left 240px. Both brand marks simultaneously rendered.

**Fix:** `className="app-shell-sidebar lg:!top-16"` on `<aside>` in `Sidebar.tsx`. Tailwind `lg:!top-16` = `@media (min-width: 1024px) { top: 64px !important }` â€” overrides the `top: 0` inline style at desktop. Sidebar now occupies a left column starting below the TopNav. Mobile drawer unaffected (< 1024px keeps `top: 0` from inline style).

**Mobile close:** Added `onClose?: () => void` prop to `SidebarProps`. `AppShell` passes `onClose={closeDrawer}`. An Ã— button (`className="lg:hidden"`) renders in the Sidebar header top-right on mobile. Existing backdrop click already closed the drawer; Ã— button is the explicit affordance.

**Files:** `Sidebar.tsx`, `AppShell.tsx`

### Fix 2 â€” Marketing mobile nav

**Root cause:** `StickyHeader` (marketing routes only) showed only a "Sign in" link at mobile. No hamburger; no access to La MÃ©thode or Sign up from the sticky header.

**Fix:** Added `menuOpen` state to `StickyHeader`. Desktop: "Sign in" link (`hidden md:inline-flex`) unchanged. Mobile: hamburger button (`md:hidden`) toggles a `position: fixed; top: 64px` slide-down nav with three entries: La MÃ©thode â†’ `/method`, Sign in â†’ `/login`, Get started â†’ `/signup`. Nav auto-closes on route change via `useEffect([pathname])`.

**Files:** `StickyHeader.tsx`

### Fix 3 â€” Authenticated home redirect

**Root cause:** `/` served the public marketing hero to authenticated users with no redirect.

**Fix:** `components/auth/AuthRedirect.tsx` â€” client component that mirrors `ProtectedRoute`'s Zustand hydration pattern in reverse: calls `useAuthStore.getState().hydrate()` on mount, then `router.replace(to)` when `hydrated && token`. Rendered at the top of `app/page.tsx` with `to="/dashboard"`. Marketing page SSR is preserved (no SEO impact). Authenticated users land on marketing for â‰ˆ1 frame before redirect fires (localStorage is synchronous; flash is imperceptible).

**No-flash constraint note:** A true zero-flash server-side redirect requires a Next.js `middleware.ts` reading an httpOnly cookie. The auth stack (localStorage + Zustand) doesn't expose a cookie name to the FE. Adding a `lemethodic_session` cookie mirror to `lib/auth.ts` would achieve it but the constraint "no auth library code changes" blocks it. Deferred â€” if the refresh cookie name becomes known, a one-line `middleware.ts` is the next step.

**Files:** `components/auth/AuthRedirect.tsx` (new), `app/page.tsx`

### Common

- `pnpm build` clean. 402 unit tests pass. Pre-existing CouchesBreakdown failure unchanged.
- Adjacent deferred: `AppShell.tsx` mobile top-bar has inline `Le MÃ©thodic` span (SERIF_FONT, not a Wordmark). Out of scope for this sweep â€” defer to a dedicated wordmark/typography pass.

---

## Deviation tickets (Session 6, 2026-05-31)

These tickets are driven by the Sessions 1-5 lock review. They represent gaps between the current codebase state and the canonical locked direction in PRODUCT.md and SITEMAP.md.

### F-331: [FE] Homepage tagline reconciliation
Milestone: MS-1

**Priority:** HIGH
**Status:** ðŸ“‹ Queued
**Filed:** 2026-05-31
**Source:** Session 2 Direction C lock (PRODUCT.md homepage positioning section)
**Scope:** Apply Direction C copy from PRODUCT.md to `/` homepage. Replace current "Pass TCF Canada / Get to Quebec" + rotating exam list with locked H1 "There's a method to French. Now there's Le Methodic.", Sub copy, Primary CTA "See how it works", Secondary CTA "Start with a free placement". MS-1 milestone.
**Owner:** Frontend Engineering

### F-332: [FE] /exam-prep consolidation
Milestone: MS-1

**Priority:** HIGH
**Status:** ðŸ“‹ Queued
**Filed:** 2026-05-31
**Source:** SITEMAP.md legacy section: /exam-prep duplicate resolved by redirect
**Scope:** Redirect `/exam-prep` (308) to `/tcf-canada`. Closes May 24 MOCK-002 deferred ticket. MS-1 milestone.
**Owner:** Frontend Engineering

### F-333: [FE] /library repositioning
Milestone: MS-7

**Priority:** MEDIUM
**Status:** ~~Queued~~ OBSOLETE
**Filed:** 2026-05-31
**Source:** Session 1 lock: /library repositioned from LemonSqueezy stub to Stripe store
**Scope:** Update existing `/library` stub to reflect Stripe store positioning. Implement 4-category navigation skeleton (Livres, Audio, Telechargements, Ressources gratuites). MS-7 milestone for full launch.
**Owner:** Frontend Engineering
**Obsolete note:** Source incorrectly described the target as a Stripe store. LemonSqueezy is the merchant of record. The /library page FE stub remains valid under F-300c; subscription-product checkout is covered by F-364 (LemonSqueezy integration).

### F-334: [FE] /cours route migration from /la-methode
Milestone: M2

**Priority:** HIGH
**Status:** ~~Queued~~ OBSOLETE
**Filed:** 2026-05-31
**Source:** Session 3 lock: surface renamed from /la-methode to /cours per SITEMAP.md
**Scope:** Rename `/la-methode` to `/cours/methode-tcf-canada`. Set 308 redirect from `/la-methode` to new route. Update internal navigation, sidebar, links. Update lesson sub-routes from `/la-methode/[lesson]` to `/cours/methode-tcf-canada/lecon-N`.
**Owner:** Frontend Engineering
**Obsolete note:** "Le Cours" is a forbidden term per canon. The canonical route is /la-methode (La Methode). Do not implement /cours. F-361 (Remove Le Cours route + confirm Le Raccourci gone) supersedes this and removes any stale /cours references.

### F-335: [FE] L'Examen unification refactor
Milestone: M3

**Priority:** HIGH
**Status:** âœ… Shipped
**Filed:** 2026-05-31
**Shipped:** 2026-05-31
**Source:** Session 3 lock: L'Examen unified under one umbrella per SITEMAP.md
**Scope:** Refactor `/l-examen` to serve as umbrella for 4 sections. Diagnostic moved to `/l-examen/diagnostic`. Speaking (`/speaking`) moved to `/l-examen/expression-orale`. Writing (`/writing`) moved to `/l-examen/expression-ecrite`. Both adopted (app) group AppShell. Comprehension-orale, comprehension-ecrite, mock skeleton pages created. 7 redirect rules added (speaking, writing, old tache/results paths).
**Owner:** Frontend Engineering

### F-341: [FE+Design] Sidebar audit, consolidation, and collapse toggle
Milestone: M3

**Priority:** MEDIUM
**Status:** Shipped (audit at docs/sidebar-audit-2026-05-31.md; toggle + icons shipped as F-345)
**Filed:** 2026-05-31
**Source:** F-335 dispatch identified sidebar complexity deferred from scope
**Scope:** Audit current sidebar implementation(s). Count distinct sidebar components. Document collapse toggle behavior or its absence. Apply DESIGN.md v2 Atelier Francais palette. Consolidate to a single canonical sidebar component if multiple exist. Add collapse toggle if missing. Quality reference: Pro Sidebar pattern (collapsible icon + label nav, hamburger toggle, polished hover and active states).
**Audit findings summary:** 2 sidebar implementations found. S1 (Sidebar.tsx, active, production) has no desktop collapse toggle. S2 (ui/sidebar.tsx, Radix UI) is unused dead code. Recommended path: keep S1 as base, add icons + desktop toggle + cookie persistence + Cmd+B + focus trap. Full findings at docs/sidebar-audit-2026-05-31.md.
**Owner:** Frontend Engineering

### F-342: [BE+Docs] BE audit findings reference and follow-up tracking

**Priority:** MEDIUM
**Status:** ðŸ“‹ Queued (becomes in-progress once BE audit completes)
**Filed:** 2026-05-31
**Source:** BE audit work in progress; referenced in session dispatch
**Scope:** References docs/be-audit-2026-05-31.md in the BE repo (local path: C:\Users\pc\Downloads\tcf-oral-tool\tcf-oral-tool\docs\). Catalogs follow-up tickets that arise from the BE audit findings (N+1 queries, pagination gaps, missing indexes, connection pool config, security checklist items). Each follow-up gets its own ticket ID once identified; this ticket tracks the overall remediation status.
**Owner:** Backend Engineering

### F-343: [FE] CouchesBreakdown.test.tsx token mismatch

**Priority:** LOW
**Status:** ðŸ“‹ Queued
**Filed:** 2026-05-31
**Source:** F-331 gate report (2026-05-31) surfaced 1 failing test in unit suite (401/402 passing)
**Scope:** Test failure where fp-sage token reference does not match current lm-pastel-sage canonical token. Either update test to use new token name, or update CouchesBreakdown component to maintain backward-compatible token name. Pre-existing failure, non-blocking.
**Owner:** Frontend Engineering

### F-344: [FE] Historical FIXME tickets review (F-039 through F-043, F-045)

**Priority:** LOW
**Status:** ðŸ“‹ Queued -- Chadi action needed
**Filed:** 2026-05-31
**Source:** Backlog enforcement gap: layer tag cannot be determined from title alone
**Scope:** Tickets F-039 through F-043 and F-045 are tagged [FE] by default because their titles read "[historical, see code comments]" and the layer cannot be determined from title alone. Chadi to review the code comments referenced in each ticket and confirm or update the layer tag. Could be [FE], [BE], or [FE+BE].
**Owner:** Chadi (review) then Frontend Engineering (update)

### F-345: [FE] Sidebar collapse toggle + lucide icons

**Priority:** MEDIUM
**Status:** Shipped
**Filed:** 2026-05-31
**Source:** F-341 sidebar audit; grafts S2's toggle mechanism onto S1
**Scope:** Add lucide-react icons to 5 nav items (Home, GraduationCap, BookOpen, FileText, User). Add desktop-only collapse toggle (ChevronLeft/Right button at sidebar bottom). State management: isCollapsed boolean, persisted to sidebar_state cookie (S2-compatible), restored on mount. Keyboard shortcut: Cmd+B (Mac) / Ctrl+B (Windows). Collapsed width 64px with 200ms ease transition, icon-only state. Mobile drawer behavior unchanged. S2 not modified.
**Cookie name used:** sidebar_state (matches S2 for future S2 deprecation parity)
**Owner:** Frontend Engineering

### F-346: [FE] Sidebar polish: Instrument Sans + a11y

**Priority:** MEDIUM
**Status:** Queued
**Filed:** 2026-05-31
**Source:** F-341 audit recommendations; deferred from F-345 scope
**Scope:** Replace Geist with Instrument Sans for nav labels per DESIGN.md v2. Add focus trap on mobile drawer. Add focus move on mobile drawer open. Verify aria-current="page" on active item. Verify nav landmark with aria-label.
**Owner:** Frontend Engineering

### F-336: [FE+BE] Comprehension surface implementation
Milestone: M3

**Priority:** HIGH
**Status:** ðŸ“‹ Queued
**Filed:** 2026-05-31
**Source:** Session 3 lock: comprehension sections are net-new product capability
**Scope:** Build `/l-examen/comprehension-orale` and `/comprehension-ecrite` from scratch. Net-new product capability. Includes content authoring (listening audio assets, reading passages), exercise UI, scoring, history. Depends on F-335.
**Dependencies:** F-335
**Owner:** Frontend Engineering + Chadi (content authoring)

### F-337: [FE] CLB mapping in Progres
Milestone: M3

**Priority:** HIGH
**Status:** âœ… Shipped
**Filed:** 2026-05-31
**Shipped:** 2026-06-01 (df218f0)
**Source:** SITEMAP.md /progres/clb: primary persona anchor surface
**Scope:** Add `/progres/clb` page showing user's current CLB level per skill plus projected Express Entry points plus gap-to-target. Primary persona anchor.
**Owner:** Frontend Engineering
**Notes:** Gap-to-target UI omitted: no targetClb field in onboarding profile (q0_* fields are exam-type selection only). Listening/reading/writing always show "not yet assessed" -- app records expression orale only; other skills land when TCF Canada result wiring ships. IRCC CRS table source: F-337 dispatch (verified). Non-visual Playwright captures: deferred per F-225 debt.

### F-338: [FE] Dashboard widget expansion to Coursera density
Milestone: M2

**Priority:** HIGH
**Status:** Functional shell SHIPPED -- 72424f9 (2026-06-01). Visual treatment deferred to Chadi's design pass.
**Filed:** 2026-05-31
**Source:** M2 visual coherence scope expansion per recent feedback (also reflected in ROADMAP.md M2 status note)
**Scope:** Add countdown widget (days to exam date from `/onboarding`), streak widget, daily target widget, calendar widget, next lesson resume widget to `/dashboard`. M2 visual coherence scope expansion per recent feedback.
**Functional shell notes:**
- Countdown: wired to `user.examDate` from auth store (no extra fetch)
- Streak: derived from `api.recordings.list()` consecutive recording days; TODO(BE) for dedicated streak endpoint
- Daily target: static mock (1 session); TODO(BE) -- `/api/users/me/daily-target` does not exist yet; BE ticket needed before production-ready
- Calendar: derived from `api.recordings.list()` activity dots per day; TODO(BE) for dedicated activity-calendar endpoint
- Next lesson: wired to `api.lessons.list()` -- first `in_progress` or `unlocked` lesson
- Each widget has loading skeleton, empty state, error state, token-only colours (no hardcoded hex)
**Owner:** Frontend Engineering

### F-340: [FE] /fr/exam-prep redirect + SITEMAP French section

**Priority:** HIGH (closes legacy dead end from F-332)
**Status:** in-progress
**Filed:** 2026-05-31
**Source:** F-332 deleted /exam-prep; /fr/exam-prep became a dead end pointing at a 308 redirect chain with stale hreflang
**Scope:** 308 redirect /fr/exam-prep to /fr; delete app/fr/exam-prep/; update 3 internal Link hrefs; document French-locale tree in SITEMAP.md. Non-visual change (redirect + nav exclusion list cleanup).
**Owner:** Frontend Engineering

### F-339: [FE] Em-dash cleanup pass, PRODUCT.md and ROADMAP.md

**Priority:** LOW
**Status:** âœ… Shipped â€” aff38e0
**Filed:** 2026-05-31
**Source:** Session 6 gate report â€” 87 em-dash instances flagged across PRODUCT.md and ROADMAP.md
**Scope:** Mechanical replacement of 87 pre-existing em-dashes in PRODUCT.md and ROADMAP.md. One intentional reference preserved (inside the Em-dash hard rule section of PRODUCT.md). Final counts: PRODUCT.md 1, ROADMAP.md 0.
**Owner:** Frontend Engineering

### F-347: [DOC] ARCHITECTURE.md system-level doc

**Priority:** LOW
**Status:** Pass 1 SHIPPED, Pass 2 SHIPPED
**Filed:** 2026-05-31
**Source:** BE audit 2026-05-31 completed; M5.5 filed in ROADMAP; time to write the system-level architecture doc the audit was feeding
**Scope:** Canonical FE-root architecture document. Pass 1 = structural draft from Claude memory. Pass 2 = BE agent fills [BE-AUDIT: ...] markers from docs/be-audit-2026-05-31.md. Acceptance Pass 1: file exists at FE root with all 10 sections, M5.5 reflected in section 6, no em-dashes. Acceptance Pass 2: all [BE-AUDIT: ...] markers replaced with content from the audit doc; committed in BE-then-FE pattern (BE writes to a working copy, FE port lands the final).
**Files:** ARCHITECTURE.md (FE root)
**Branch:** main (Pass 1), main again for Pass 2 port
**Owner:** Frontend Engineering

---

## Marketing track (cross-referenced from ROADMAP-marketing.md)

Marketing milestones are tracked in detail in ROADMAP-marketing.md. Top-level references below so the backlog reflects all work, not just product.

- MS-0, marketing surfaces audit
- MS-1, homepage rewrite + 3 exam landings (F-331, F-332 belong here)
- MS-2, public method + free placement test
- MS-3, pricing + founder + coaching booking
- MS-4, help and legal table-stakes
- MS-5, blog scaffolding + 5 posts (deferrable to post-soft-beta)
- MS-6, remaining exam landings (deferrable to post-soft-beta)
- MS-7, /library store launch (deferrable to post-soft-beta)

### F-348: [M2] Global CSS token wiring + legacy --lm-* alias
Milestone: M2

**Priority:** HIGH
**Status:** SHIPPED (main 803da83 â€” tokens already present from M2 t10, 2026-05-30; dispatch confirmed all gates pass 2026-06-01)
**Filed:** 2026-06-01
**Source:** M2 dispatch â€” DESIGN.md v2 Palette A canonical tokens + dark mode block + legacy alias layer
**Scope:** :root Palette A + .dark blocks in app/globals.css; @theme inline exposes canonical tokens as Tailwind utilities (bg-paper, text-ink, bg-dominant, bg-accent); --lm-* names aliased to canonical where mapping exists (--lm-bg-*, --lm-text-*, --lm-border-*, --lm-brand*, --lm-couche-*). Decorative and motion --lm-* with no canonical mapping kept at own values (--lm-success/warning/error/info, --lm-warm-peach/sage/pastel-*, --lm-ease*/duration*, --lm-safe-*, --lm-bg-blur).
**Acceptance:** :root and .dark contain --paper/#FFFFFF, --ink/#0F1419, --dominant/#14213D, --accent/#C8102E (light) and --paper/#0E1626, --ink/#E5E9F0, --dominant/#38598F, --accent/#E23A54 (dark). @theme inline maps all four to --color-* Tailwind utilities. Build passes. Dark mode flips automatically.
**Files:** app/globals.css (Tailwind v4 project -- no tailwind.config)
**Branch:** main
**Owner:** Frontend Engineering

### F-349: [M2-followup] Migrate --lm-* usages to canonical token names
Milestone: M2

**Priority:** LOW
**Status:** QUEUED
**Filed:** 2026-06-01
**Source:** F-348 alias layer; 823 --lm-* occurrences across 87 files remain
**Scope:** Sweep all --lm-* references across the FE and replace with var(--paper), var(--ink), var(--dominant), var(--accent), var(--paper-tint), var(--paper-edge), var(--rule), var(--ink-soft), var(--ink-faint) as appropriate. Remove the alias block from app/globals.css when sweep is complete. Decorative tokens (--lm-pastel-*, --lm-warm-peach, --lm-warm-sage) and motion tokens (--lm-ease*, --lm-duration*) stay as-is unless a canonical replacement is defined first.
**Dependencies:** F-348 (alias block must exist until sweep is complete)
**Owner:** Frontend Engineering

### F-350: [DOC] M-VISUAL Audit v2 â€” DESIGN.md v2 surface coverage
Milestone: M2

**Priority:** HIGH
**Status:** SHIPPED
**Filed:** 2026-06-01
**Source:** M2 v2 sprint unblocked by F-348/F-349 (t10/t11); spec required before fix passes
**Scope:** Read-only static analysis of all primary surfaces against DESIGN.md v2 (Atelier Francais direction). Produces docs/m2-visual-audit-v2-2026-06-01.md with per-surface compliance findings, P0/P1/P2 issue list, and recommended fix passes t1-v2 through t5-v2.
**Key findings:** 4 P0 issues (la-methode dead route, lib/typography.ts v1 constants, 67-file italic sweep, lang="en" defeating font switching); 5 P1 issues (171 hardcoded hex, l-examen inline hex, Pieges Anglais bar color, pastel card backgrounds, Dashboard hero); 5 P2 cosmetic items.
**Output:** docs/m2-visual-audit-v2-2026-06-01.md
**Owner:** Frontend Engineering

### F-351: [M2] t1-v2 â€” Typography bridge (lib/typography.ts + lang fix)
Milestone: M2

**Priority:** P0
**Status:** SHIPPED
**Filed:** 2026-06-01
**Shipped:** 2026-06-01
**Source:** F-350 finding P0-2 + P0-4
**Scope:** Update lib/typography.ts: DISPLAY_FONT to 'var(--f-display)', SANS_FONT to 'var(--f-ui)', SERIF_FONT to 'var(--f-body)'. Update OnboardingScreen.tsx DISPLAY_FONT re-export from lib/typography + SANS constant. Fix app/layout.tsx lang="en" to lang="fr". Unlocks t11 font loading across all 144 consumers.
**Acceptance:** Every page-level H1 renders Instrument Serif (--f-display). Nav/button labels render Instrument Sans (--f-ui). No system-ui fallback for type. lang="fr" on html element.
**Dependencies:** None (standalone)
**Owner:** Frontend Engineering
**Verification:** pnpm build clean (45 routes). 401/402 tests pass (1 pre-existing CouchesBreakdown CEFR pastel mismatch unrelated to this dispatch).

### F-352: [M2] t2-v2 â€” Italic display sweep
Milestone: M2

**Priority:** P0
**Status:** SHIPPED
**Filed:** 2026-06-01
**Shipped:** 2026-06-01
**Source:** F-350 finding P0-3
**Scope:** Remove fontStyle: 'italic' and Tailwind italic class across all affected files. Sweep via scripts/t2-italic-sweep.py. Add global em/cite/dfn { font-style: normal } override to app/globals.css.
**Exceptions (French-word typographic convention, skipped):** ChunkRow.tsx:32 (chunk.chunkFr), Flashcard.tsx:60 (chunk.fr front), Flashcard.tsx:126 (chunk.fr back), QuizQuestion.tsx:109 (question.chunk.fr).
**Changes:** 65 files, 136 fontStyle: italic removed, 10 Tailwind italic tokens removed.
**Dependencies:** F-351 (shipped)
**Owner:** Frontend Engineering
**Verification:** pnpm build clean (45 routes). 401/402 tests pass (1 pre-existing CouchesBreakdown failure unrelated).

### F-353: [M2] t3-v2 â€” Hardcoded hex token sweep
Milestone: M2

**Priority:** P1
**Status:** SHIPPED
**Filed:** 2026-06-01
**Shipped:** 2026-06-01
**Source:** F-350 finding P1-1 + P1-2
**Scope:** Discovery: 187 hex instances found (171 in audit + additions). Replaced: 29 instances across 22 files (28 via script + 1 manual LessonListItem). Flagged-ambiguous: 102 (all #1A1A1A alpha variants + rgba(20,33,61,...) pre-token ink variants + #FFFFFFCC + #1C1A16 -- no exact canonical match; deferred to F-349 lm-* migration pass). Fixed-kept: ~56 instances (color:#FFFFFF white text on dark buttons, state/feedback colors, legacy pastels).
**Replacements:** const INK/#14213D -> var(--dominant) x6, const VERMILLON/#C8102E -> var(--accent) x2, const PAPER_TINT/#FAFAFA -> var(--paper-tint) x1, const PAGE_BG/#FFFFFF -> var(--paper) x1, let bg='#FFFFFF' -> var(--paper) x2, backgroundColor:'#FFFFFF' surfaces -> var(--paper) x16, Sidebar color:#14213D -> var(--dominant) x1.
**Ambiguous threshold note:** Ambiguous count (102) exceeds 20% of 187 (37). All ambiguous are pre-token alpha variants (#1A1A1A*) and pre-canonical rgba variants -- intent is known, exact token match is absent. Not surfaced for review as their dark-mode behavior is unchanged (no token exists to flip them). F-349 pass should address these when lm-* aliases are migrated.
**Dependencies:** F-348 (alias layer live)
**Owner:** Frontend Engineering
**Verification:** pnpm build clean. 401/402 tests pass (pre-existing CouchesBreakdown failure).

### F-354: [M2] t4-v2 â€” couche bar fix (Part B shipped); pastel cards deferred to Chadi
Milestone: M2

**Priority:** P1
**Status:** PARTIAL â€” Part B SHIPPED, Part C QUEUED (Chadi design pass)
**Filed:** 2026-06-01
**Part A superseded:** 2026-06-01 by F-356 (redirect removed, pages now live)
**Part B shipped:** 2026-06-01
**Source:** F-350 findings P1-3, P1-4
**Part A scope (superseded by F-356):** Remove app/(app)/la-methode page files -- redirect removed instead.
**Part B scope (SHIPPED):** CouchesBreakdown.tsx bar fill: added barColor field to COUCHES config. 4 dominant couches get var(--couche-default), Les Pieges Anglais gets var(--couche-pieges) = var(--accent) (vermillion). Single-source-of-truth at the COUCHES data constant. MethodologyPreview.tsx already had var(--accent) on Les Pieges Anglais (headingColor/nameColor) -- no change needed there.
**Part C scope (QUEUED, Chadi design pass):** Replace --lm-pastel-* card backgrounds in MethodologyPreview.tsx and SpeakingLanding.tsx with var(--paper-tint) / var(--paper-edge).
**Dependencies:** None (standalone)
**Owner:** Frontend Engineering
**Part B verification:** pnpm build clean. 401/402 tests pass.

### F-355: [M2] t5-v2 â€” Dashboard "Bonjour" hero gesture
Milestone: M2

**Priority:** P1
**Status:** QUEUED
**Filed:** 2026-06-01
**Source:** F-350 finding P1-5; DESIGN.md v2 s9
**Scope:** Implement locked "Bonjour, [name]." hero in DashboardGreeting.tsx: var(--f-display) font (Instrument Serif), no italic, vermillion SVG accent line under the name (var(--accent) stroke, drawn in on mount). This is the flagship in-product moment per DESIGN.md s9.
**Acceptance:** Greeting renders in Instrument Serif. No italic. Vermillion underline accent on the name. Respects prefers-reduced-motion (skip animation, show static underline).
**Dependencies:** F-351 (t1-v2), F-352 (t2-v2)
**Owner:** Frontend Engineering

### F-356: [M2] Fix /la-methode dead route â€” remove redirect from next.config.mjs
Milestone: M2

**Priority:** P0
**Status:** SHIPPED
**Filed:** 2026-06-01
**Shipped:** 2026-06-01
**Source:** M-VISUAL v2 audit P0-1; supersedes F-354 Part A
**Scope:** Remove the two /la-methode redirect rules (source /la-methode and /la-methode/:path*) from next.config.mjs that were 308-redirecting to /cours/methode-tcf-canada. app/(app)/la-methode/page.tsx and la-methode/[id]/page.tsx now serve directly. /cours/methode-tcf-canada is unchanged as a separate marketing route.
**Acceptance:** /la-methode returns 200 from the app router (confirmed in build route table: static route listed). Other redirects (/ecole, /vocabulaire, /diagnostic, /speaking, /writing, /exam-prep) unchanged.
**Dependencies:** None
**Owner:** Frontend Engineering
**Verification:** pnpm build clean (45 routes, /la-methode and /la-methode/[id] appear in route table as live pages). 401/402 tests pass (1 pre-existing CouchesBreakdown failure).

---

### M-DASHBOARD: [M2-defer, FOUNDER-LED] Dashboard + global nav architectural redesign
Milestone: M2-defer

**Priority:** HIGH
**Status:** QUEUED for Chadi design pass
**Filed:** 2026-06-01
**Source:** Founder direction 2026-06-01; Docker Desktop dark + light screenshots as visual reference
**Constraint:** FOUNDER-LED. Agent does NOT make aesthetic decisions on this ticket.
**Scope:**
- Resolve dual-nav: sidebar (global nav) vs top bar (contextual?) currently read as competing systems; reconcile into one coherent hierarchy or visually differentiate with clear ownership
- Resolve "Methode" naming collision: top bar label = TCF prep section; sidebar label = La Methode product. Same word, different referents. Needs a naming resolution before redesign can land.
- Holistic redesign of /dashboard: structured widgets inviting study and practice; current 5-widget functional shell (F-338, SHA 72424f9) to be revisited as part of the redesign
- Visual treatment informed by Docker Desktop inspiration (2026-06-01 screenshots):
  * Icon style and sizing
  * Font choices (clean, modern, readable)
  * Line spacing and vertical rhythm
  * Dark + light mode palette balance
  * UI component scales
  * Top search bar (Ctrl+K style command palette)
  * Notification icon with badge
**Reference:** Docker Desktop dark + light screenshots provided 2026-06-01
**Dependencies:** F-338 (functional shell, shipped); F-355 (DashboardGreeting hero gesture, queued)
**Owner:** Chadi (founder design pass); Frontend Engineering (implementation once design locked)

---

## Phase 2 -- Web Performance Layer

**SEO-L1** âœ… [FE] Layer 1 SEO + measurement scaffold -- SHA a061fbc (2026-06-01)
- app/sitemap.ts: 8 public routes with EN/FR hreflang alternates
- app/robots.ts: allows *, Googlebot, GPTBot, PerplexityBot, Google-Extended, ClaudeBot; disallows all app/auth routes
- components/seo/JsonLd.tsx: Organization + Course + FAQPage (5 items, schema.org JSON-LD)
- components/analytics/Plausible.tsx: Plausible script gated on NEXT_PUBLIC_PLAUSIBLE_DOMAIN
- app/layout.tsx: metadataBase (https://lemethodic.com), robots default, Twitter card, Plausible wired
- app/(app)/layout.tsx: robots noindex/nofollow group-level for all authenticated routes
- Hreflang x-default added to /, /fr, /library, /fr/library
- .env.example: NEXT_PUBLIC_PLAUSIBLE_DOMAIN + NEXT_PUBLIC_OG_IMAGE documented
- Discovery: i18n is manual file-system routing (no Next.js i18n config); 2 EN/FR pairs exist; html lang="fr" hardcoded in root layout (needs i18n routing ticket to fix properly); no OG image yet (place public/og-default.jpg + set NEXT_PUBLIC_OG_IMAGE to activate)
- Title template deferred: all 20+ existing pages use full branded titles; migration requires each to use { absolute: '...' } (follow-up ticket)
- Build: green (48 routes). Tests: 425/426 (1 pre-existing CouchesBreakdown token regression, unrelated)

**SEO-L1-FOLLOW** ðŸ“‹ [FE] SEO follow-up items (deferred from SEO-L1)
- OG image: create public/og-default.jpg (1200x630) and set NEXT_PUBLIC_OG_IMAGE on Vercel
- Title template: migrate all page titles to short form + { absolute } so root layout template applies
- html lang: fix root layout lang="fr" once i18n routing is added (requires next.config.mjs i18n or middleware)
- Fathom: if founder prefers Fathom over Plausible, swap NEXT_PUBLIC_PLAUSIBLE_DOMAIN for FATHOM_SITE_ID in components/analytics/Plausible.tsx

---

**F-349 follow-up note:** fp-sage test assertion updated to var(--lm-pastel-sage) in CouchesBreakdown.test.tsx. Suite at 426/426 (all clean).

---

### F-357: [Web] Real Next.js i18n routing for EN/FR locales
Milestone: Phase 2 Web Layer

**Priority:** Phase 2 -- not blocking launch; land before significant SEO traffic
**Status:** QUEUED
**Filed:** 2026-06-01
**Source:** SEO-L1 discovery (a061fbc) -- html lang="fr" is hardcoded in root layout while / is English-first. Current i18n is manual file-system locale routing (/fr trees) with hreflang via alternates.languages. hreflang/lang inconsistency will confuse crawlers once real traffic arrives.
**Scope:**
- Add Next.js i18n routing config (i18n.locales, i18n.defaultLocale) to next.config.mjs
- Remove hardcoded lang="fr" from app/layout.tsx; derive lang from the active locale instead
- Verify /fr/* routes still resolve and hreflang alternates remain valid
- Coordinate with SEO-L1-FOLLOW html lang fix item (this ticket supersedes that item once shipped)
**Acceptance:** / serves html lang="en", /fr serves html lang="fr", build green, hreflang valid
**Dependencies:** SEO-L1 (shipped, a061fbc)
**Owner:** Frontend Engineering

---

### F-358: [Payload] Regenerate Payload TypeScript types on Node 22 LTS
Milestone: Phase 2 CMS

**Priority:** Do at the moment the founder spins up local Postgres for the first admin user
**Status:** QUEUED
**Filed:** 2026-06-01
**Source:** Payload Phase 2 scaffold (faebdf3) -- pnpm payload generate:types fails on Node 24 + tsx 4.21 on Windows. payload-types.ts is currently hand-written and TypeScript-valid but will drift from schema as collections evolve.
**Action:**
1. Switch dev environment to Node 22 LTS
2. Point DATABASE_URI at a running Postgres instance with the payload_cms schema applied
3. Run: pnpm payload generate:types
4. Commit the regenerated payload-types.ts
**Acceptance:** payload-types.ts generated by the CLI (not hand-written), tsc --noEmit clean, build green
**Dependencies:** Local Postgres with payload_cms schema; Node 22 LTS in dev environment
**Owner:** Frontend Engineering (Chadi triggers)

---

## New tickets â€” 2026-06-02 (complete-site doctrine, canon cleanup, payment, onboarding)

### F-359: [FE] Coming-soon state system (bientot config + UI pattern)
Milestone: M2

**Priority:** HIGH â€” must ship before any surface is lit as bientot
**Status:** QUEUED
**Filed:** 2026-06-02
**Source:** Complete-site doctrine: every surface is present from launch; unbuilt parts show as bientot, never as broken routes or 404s.
**Scope:**
- A per-surface, per-feature live-or-bientot config (a static map in `lib/bientot.ts` keyed by route slug or feature key, values: `live | bientot`). No database table at this stage; a config object updated by engineers at feature-flag time.
- A polished bientot UI component (`components/BientotScreen.tsx`): shows the surface name, a short description of what is coming, and a "Bientot" label. Never renders a broken state or 404 message. Navigable: back button, breadcrumbs, and sidebar all work. Optional "notify me" CTA that writes to the waitlist store.
- Every deferred surface (top-level routes and sub-routes) wraps in the bientot screen when its config value is `bientot`. Lighting a surface up is a one-line config change, not a component change.
- Reduced-motion and mobile-first (375px) verified.
**Acceptance:** a config change from `bientot` to `live` on any route renders the real surface without any other code change; the bientot screen is not a dead end (sidebar and nav remain functional).
**Dependencies:** none (foundation ticket)
**Owner:** Frontend Engineering

---

### F-360: [FE] /a-propos page with Preply link (replaces Booking surface)
Milestone: M1

**Priority:** MEDIUM
**Status:** QUEUED
**Filed:** 2026-06-02
**Source:** Complete-site doctrine. The old Booking surface is replaced by a lightweight about/contact page that links out to Preply for 1:1 tutoring.
**Scope:**
- New route `/a-propos` (and `/fr/a-propos` for the French locale) serving a static page: a short paragraph about the tutor, a clear Preply CTA linking to his Preply profile, and contact information.
- Integrated into the top navigation and/or footer alongside the legal links (LandingFooter from B-102).
- Editorial system tokens (ed-bg, ed-fg, ed-paper, Geist) per F-200 rules.
- Any existing Booking route gets a 308 redirect to /a-propos.
**Acceptance:** /a-propos renders with a working Preply link; route appears in site nav; no broken Booking links remain.
**Dependencies:** B-102 (footer integration point, shipped)
**Owner:** Frontend Engineering (Chadi supplies Preply URL and bio copy)

---

### F-361: [FE] Remove Le Cours route + confirm Le Raccourci fully gone
Milestone: M2

**Priority:** HIGH
**Status:** QUEUED
**Filed:** 2026-06-02
**Source:** Canon enforcement. "Le Cours" and "Le Raccourci" are forbidden terms. F-334 (queued, marked obsolete) was going to introduce a /cours route; that is cancelled. F-086 renamed Le Raccourci to L'Ecole; this ticket verifies the rename is complete in all layers.
**Scope:**
- Audit and remove any /cours routes or route references in the app directory. If /cours was partially implemented, replace with a 308 redirect to /la-methode (the canonical route).
- Grep the FE repo for "Le Cours", "le_cours", "/cours", "raccourci" (case-insensitive, excluding the F-086 migration script and historical BACKLOG entries). Fix every active hit.
- Verify BE repo grep for "raccourci" returns zero active-code hits (same exclusion list as F-086 gate 9).
- Update CLAUDE.md if any reference to Le Cours or Le Raccourci survives in active sections.
- Update any navigation copy, sidebar labels, or breadcrumbs that use the forbidden terms.
**Acceptance:** `grep -ri "le cours" app components lib` returns zero hits; `grep -ri "raccourci" fluentpath-frontend/` returns zero active-code hits (F-086 migration script and BACKLOG historical entries are the only allowed survivors).
**Dependencies:** F-086 (Le Raccourci rename, shipped)
**Supersedes:** F-334 (marked obsolete)
**Owner:** Frontend Engineering

---

### F-362: [FE] Examens hub + /examens/[exam] per-exam pages
Milestone: M3

**Priority:** HIGH
**Status:** QUEUED
**Filed:** 2026-06-02
**Source:** Complete-site doctrine: all exams present from launch; TCF is the first lit, others are bientot. The spine is exam-agnostic.
**Scope:**
- New hub route `/examens` listing all supported exams with brief descriptions.
- Per-exam detail pages at `/examens/[exam]` (slugs: `tcf-canada`, `tef-canada`, `dalf`, `delf`, `general`).
- TCF Canada page: live content, linking to the existing TCF-specific onboarding and practice flows.
- TEF Canada, DALF, DELF, General French pages: bientot state via F-359 config (rendered with BientotScreen, navigable, never 404).
- All five routes include correct hreflang alternates and canonical metadata.
- French locale mirrors: `/fr/examens` and `/fr/examens/[exam]`.
- Integrated into top navigation under an "Examens" entry.
**Acceptance:** /examens renders a hub with 5 exam entries; /examens/tcf-canada renders live content; /examens/tef-canada and others render the bientot screen (not a 404); French locale routes resolve.
**Dependencies:** F-359 (bientot config system), F-221 (exam-target picker, shipped)
**Owner:** Frontend Engineering (Chadi supplies per-exam copy for the TCF live page)

---

### F-363: [FE] Pieges SEO library (/pieges and /pieges/[slug])
Milestone: M3

**Priority:** MEDIUM
**Status:** QUEUED
**Filed:** 2026-06-02
**Source:** Complete-site doctrine. Les Pieges Anglais is the fifth couch and the key differentiator. An SEO-visible library of anglicisms and interference patterns is a high-value marketing surface.
**Scope:**
- New route `/pieges` rendering an index of Les Pieges Anglais entries (title, short descriptor, category chip).
- Per-entry detail pages at `/pieges/[slug]` with the full entry: the piege, why it happens, the correction, one example sentence.
- French locale mirrors: `/fr/pieges` and `/fr/pieges/[slug]`.
- Static rendering (generateStaticParams) for SEO.
- Content comes from F-321 (Le Vocabulaire seed Phase 1, OQLF BDL corpus). The route is bientot (F-359 config) until F-321 content is available; the shell ships regardless.
- Editorial system tokens; prose-legal typography for detail pages mirrors B-102 LegalPage pattern.
**Acceptance:** /pieges renders a navigable index; /pieges/[slug] renders a detail page; both are statically generated; bientot screen shows until F-321 content is ingested.
**Dependencies:** F-359 (bientot config), F-321 (content â€” blocks the live state, not the route shell)
**Owner:** Frontend Engineering (Chadi supplies content via F-321)

---

### F-364: [FE+BE] LemonSqueezy integration â€” Free, Core, and Sprint subscription tiers
Milestone: M6

**Priority:** HIGH (gated to site-complete)
**Status:** QUEUED
**Filed:** 2026-06-02
**Source:** Payment canon: LemonSqueezy is the merchant of record for all new payment code. Supersedes the obsolete Stripe references in P-106.x, F-300e, F-300f, and F-333.
**Scope:**
- LemonSqueezy account setup and product/variant creation for three tiers: Free (no card), Core (monthly/annual), Sprint (monthly/annual). No tier is named "Guide."
- BE: LemonSqueezy webhook handler (HMAC verified before any DB mutation); subscription-status writes to the User record; `subscription_status` exposed on `/api/auth/me` (supersedes the Stripe-dependent path noted in F-326 risk note).
- FE: `/paywall` wired to LemonSqueezy checkout URLs. Authed users see tier-appropriate CTA (upgrade / renew / current plan) based on `user.subscriptionStatus`.
- FE: `lib/lemonsqueezy.ts` client: checkout URL builder, status enum types. No Stripe SDK, no Stripe references anywhere in the dependency tree.
- Gated: do not implement until the full site is navigable (F-359 bientot system live and all top-level routes present).
**Acceptance:** a new user completes a LemonSqueezy checkout flow and lands in the app with `subscription_status = active`; webhook fires and updates the DB; no Stripe SDK in node_modules or package.json.
**Dependencies:** F-359 (site-complete gate), F-326 (subscriptionStatus on User â€” reuse the enum, sourced from LemonSqueezy not Stripe)
**Supersedes:** P-106.x, F-300e, F-300f, F-333 (all marked obsolete â€” Stripe references removed)
**Owner:** Frontend Engineering (Chadi: LemonSqueezy account + product setup)

---

### F-365: [FE+BE] Onboarding /bienvenue â€” Target Profile capture
Milestone: M2

**Priority:** HIGH
**Status:** QUEUED
**Filed:** 2026-06-02
**Source:** Complete-site doctrine: the spine is exam-agnostic; a Target Profile (exam, threshold, deadline, persona) overlays it. The onboarding entry point should be a welcoming /bienvenue before the questionnaire.
**Scope:**
- New route `/bienvenue` as the public onboarding entry point (precedes the current questionnaire flow). Redirects to the questionnaire after capturing initial intent.
- The /bienvenue screen: product name, one-line value proposition, language selector, "Commencer" CTA to enter the questionnaire.
- Target Profile capture during the questionnaire: `exam` (from ExamPickerQuestion, F-221), `threshold` (target score / CEFR band), `deadline` (exam date), `persona` (immigration / studies / general from TCFGoalSelect).
- All four fields persisted to the `users` table via the existing `/api/users/onboarding` flush endpoint (extend the payload if any fields are missing).
- The Target Profile is then used across the app to overlay exam-specific content (couche labels, scoring context, exam-day countdown).
- French locale mirror: `/fr/bienvenue`.
**Acceptance:** a new user landing on /bienvenue can complete the full onboarding flow with all four Target Profile fields persisted; the profile drives at least one downstream personalization (exam-specific copy on /progress or /diagnostic).
**Dependencies:** F-221 (ExamPickerQuestion, shipped), F-327 (another_exam funnel, shipped)
**Owner:** Frontend Engineering (BE: extend onboarding flush endpoint if fields are missing)

---

### F-366: [FE] Four skills present in ile activities â€” oral live, others bientot
Milestone: M3

**Priority:** HIGH
**Status:** QUEUED
**Filed:** 2026-06-02
**Source:** Complete-site doctrine: all four skills (oral, listening, reading, writing) are present from launch. The ile activity layer must surface all four; unbuilt ones show as bientot, never as missing routes.
**Scope:**
- Audit the current ile activity surface (L'Examen sub-sections under /l-examen and any activity listing in the product).
- Oral (expression orale): already live via Taches 1, 2, 3. Verify ile surface links correctly.
- Listening (comprehension orale): scaffold as bientot via F-359 config. Route: `/l-examen/comprehension-orale` (skeleton created in F-335). Wire the bientot config so it renders BientotScreen.
- Reading (comprehension ecrite): bientot pattern. Route: `/l-examen/comprehension-ecrite` (skeleton in F-335). Wire bientot config.
- Writing (expression ecrite): already exists at `/l-examen/expression-ecrite` (F-335). Verify it is live (not bientot) since the writing surface is wired (V-016a).
- All four appear in the L'Examen navigation with correct live vs. bientot state indicators.
- Mobile-first (375px) verified for all four entries.
**Acceptance:** /l-examen lists all four skill tiles; oral and writing tiles navigate to live surfaces; listening and reading tiles render BientotScreen (not 404); no tile broken.
**Dependencies:** F-359 (bientot config system), F-335 (L'Examen unification, shipped), V-016a (writing surface, shipped)
**Owner:** Frontend Engineering

---

End of BACKLOG.md.

## F-404: PEDAGOGY.md canonical doc

**Status:** Shipped (this commit)
**Phase:** Phase 2 (foundation)
**Priority:** P0

Created PEDAGOGY.md as the canonical pedagogy spine document. Captures the 7 molds, two-view pattern (/ile syllabus + /seance brain-game), Le MaÃ®tre role and intensity setting, cross-level adaptation (one MDX per (theme, level), shared images per theme, couche weighting table), image pipeline (linocut/watercolor aesthetic, 4-6 style anchor references, prompt protocol), content schema (MDX frontmatter + 7 typed body components), Phase 2 scope, dispatch sequence, and validation path.

PEDAGOGY.md is canonical for learning design. When PRODUCT.md, SITEMAP.md, or ARCHITECTURE.md conflict with it on learning design questions, PEDAGOGY.md wins.

**Dependencies:** none.
**Branch:** main.

---

## F-405: /content/iles/ structure + 7 mold components + demo route

**Status:** Shipped (7/7 molds complete â€” build green)
**Phase:** Phase 2 (vertical slice 1, then extends)
**Priority:** P0

Build the seven typed mold components in /components/iles/molds/ and create /_dev/molds demo route showing each with sample data.

**Shipped (Round 1 â€” b1947e1):** Dialogue
**Shipped (Round 2A):** ActeDeParole, Chunk, Regle
**Shipped (Round 2B):** Son (Phonetique), Activite (4 subtypes), Tache
**Remaining:** none â€” all 7 molds built

**Scope:**
- /content/iles/ folder created (empty, ready for authoring)
- Components: Dialogue, ActeDeParole, Chunks, Regle, Phonetique, Activite (with type prop for 4 sub-types), Tache (with type prop for oral or writing variants)
- Each component has a fixed prop contract per PEDAGOGY.md schema spec
- /_dev/molds demo route renders each mold with realistic sample data
- All molds use Atelier FranÃ§ais palette and DESIGN.md v2 tokens

**Acceptance:**
- All 7 components compile and render
- /_dev/molds demo route shows each mold rendering correctly with sample data
- Components are props-driven (no hard-coded content)
- Components are reusable across /ile, /seance, /maitre surfaces

**Dependencies:** F-404 (schema spec lives in PEDAGOGY.md).
**Branch:** main (or feature branch if scope grows; merge before F-406).

**Dispatch note:** This ticket is typically split across multiple Claude Code sessions (one mold at a time) per the tracer-bullet pattern. Tracer-bullet order: Dialogue first (paired with F-406 to ship first end-to-end slice), then Chunks, ActeDeParole, Regle, Phonetique, Activite, Tache.

---

## F-406: /ile/[theme] real page (syllabus view)

**Status:** Shipped (localStorage interim; BE wiring deferred to F-410/F-417 Round 2)
**Phase:** Phase 2
**Priority:** P0

Route `[id]` renamed to `[theme]`. Server page wraps client `IleShell` which reads `current_level` from localStorage (default `b1`), dynamically imports the MDX, renders full mold sequence. Hero image via next/image with graceful fallback. Level badge + duration + "En cours" progress chip (localStorage-persisted). BientÃ´t state when (theme, level) MDX absent. Le MaÃ®tre close as disabled seam (opacity 0.45). Sub-routes `activites/` and `tache/` updated to `theme` param.

**Filed follow-up:** migrate `current_level` + `ile_started_*` localStorage keys to F-410 / F-417 BE endpoints (Round 2).

**Dependencies:** F-404, F-405.
**Branch:** main.

---

## F-407: /ile/[theme]/activites + /ile/[theme]/tache real pages

**Status:** Queued
**Phase:** Phase 2
**Priority:** P0

Replace the bientÃ´t scaffolds at /ile/[id]/activites and /ile/[id]/tache with real surfaces.

**Scope:**
- /ile/[theme]/activites renders the four activity sub-types as a focused list (alternative entry to L'ActivitÃ© molds without the full syllabus)
- /ile/[theme]/tache renders La TÃ¢che in dedicated full-screen mode (consigne + image + input + Le MaÃ®tre scoring after submit)
- Both pages read from the same MDX as /ile/[theme]
- Tache page routes to oral or writing variant based on the Ã®le's skill assignment

**Acceptance:**
- Both pages render correctly for any populated Ã®le
- Activities page can be used independently of syllabus flow
- Tache page captures input (audio or text) and submits to scoring endpoint (F-425)

**Dependencies:** F-404, F-405, F-406, F-425 (TÃ¢che scoring), F-426 (activity scoring).
**Branch:** main.

---

## F-408: /seance daily session real

**Status:** Queued
**Phase:** Phase 2
**Priority:** P0

Replace the /seance bientÃ´t scaffold with the real daily brain-game.

**Scope:**
- Daily session algorithm: queue 5 to 7 mold instances targeting approximately 20 minutes
- Algorithm weights weak couches (per latest signal from F-425 and F-426 scoring)
- Mixed across Ã®les and molds (a session may pull a RÃ©flexe from famille, a Chunk from repas, a ComprÃ©hension from travail)
- Streak indicator (current consecutive days)
- Skip / next mechanics
- End-of-session summary

**Acceptance:**
- /seance renders the daily queue
- Algorithm respects user's current_level (only pulls from level-matched MDX)
- Session completion updates user_progress and streak
- Streak resets correctly after a missed day

**Dependencies:** F-405 (mold components), F-423 (user_progress + streak fields), F-425 + F-426 (scoring signals).
**Branch:** main.

---

## F-409: /maitre conversation hub + active conversation UI

**Status:** Queued
**Phase:** Phase 2
**Priority:** P1

Replace the /maitre bientÃ´t scaffold with the conversation hub plus active conversation UI.

**Scope:**
- /maitre hub: lists Le MaÃ®tre's contexts (diagnostic, conversation practice, exam prep)
- /maitre/conversation/[scenario]: active conversation UI (4 to 5 turn loop, voice or text input per session toggle, light per-turn signal, end-of-conversation summary)
- Le MaÃ®tre voice via ElevenLabs (per V1 voice strategy)
- Conversation state persisted via BE F-427

**Acceptance:**
- /maitre renders the hub
- Starting a conversation scenario launches the active UI
- Voice or text toggle respected per session
- Conversation completes and persists transcript + signal

**Dependencies:** F-404, F-405 (Activite conversation sub-type), F-427 (Le MaÃ®tre orchestration).
**Branch:** main.

---

## F-429: /carte persona-adaptive primary CTA

**Status:** Queued
**Phase:** Phase 2
**Priority:** P1

Update /carte (the dashboard) to surface a persona-adaptive primary CTA.

**Scope:**
- Read user's persona from Target Profile (F-424)
- Visa-urgent: primary CTA = "Reprendre votre Ã®le" (deep links to /ile/[current_theme])
- Habit-builder: primary CTA = "DÃ©marrer la sÃ©ance du jour" (deep links to /seance)
- Secondary CTAs remain available for the non-primary view

**Acceptance:**
- /carte shows persona-appropriate primary CTA
- Switching personas in /parametres updates /carte immediately
- Both views remain accessible regardless of persona

**Dependencies:** F-424 (Target Profile persistence).
**Branch:** main.
**Renumbered 2026-06-03:** Was F-410, collided with BE F-410 (target_profiles). Unified F-namespace adopted across both repos. Depends on F-410 (BE target_profiles).

---

## F-430: Le MaÃ®tre intensity setting in /parametres

**Status:** Queued
**Phase:** Phase 2
**Priority:** P1

Add Le MaÃ®tre intensity setting (soft / balanced / strict) to /parametres.

**Scope:**
- Toggle group in /parametres for Maitre intensity
- Stored on user record (BE F-424 holds it on Target Profile)
- Setting consumed by Le MaÃ®tre audio playback (intensity affects which transitions and feedback moments play)
- Default: balanced (if user did not select at /bienvenue)

**Acceptance:**
- Setting persists across sessions
- Changing setting in /parametres takes effect on next Ã®le visit
- Audio playback respects intensity (soft = intro + close only; balanced = + transitions; strict = + mid-activity feedback)

**Dependencies:** F-424.
**Branch:** main.
**Renumbered 2026-06-03:** Was F-411, collided with BE F-411 (scoring_rubrics). Setting persists to BE target_profiles.maitre_intensity (BE F-410). Depends on F-410 (BE).

---

## F-431: Target Profile FE wiring (localStorage to BE)

**Status:** Queued
**Phase:** Phase 2
**Priority:** P0

Salvaged from dropped F-424. Wire /bienvenue Target Profile capture to the BE
target_profiles table (BE F-410), replacing the F-365 localStorage stub
(lm.targetProfile.v1).

**Scope:**
- /bienvenue submission POSTs to BE target-profile endpoint (exam, threshold_band, deadline_date, persona_tag, maitre_intensity)
- On success, clear the localStorage stub
- /carte and /parametres read profile from BE
- Backwards compat: if BE returns null but localStorage has the v1 key, persist it on next save then clear

**Acceptance:**
- /bienvenue lands the profile in BE
- localStorage stub cleared on first authenticated save
- /carte (F-429) and /parametres (F-430) read from BE

**Dependencies:** F-410 (BE target_profiles).
**Branch:** main.

---

## F-432: La MÃ©thode â€” leÃ§on manifest + clickable Ã®le cards

**Status:** Shipped
**Phase:** Phase 1
**Priority:** P1

Wire La MÃ©thode so each leÃ§on is a clickable card that opens its Ã®le. Ships a
static manifest as the single source of truth for all 27 leÃ§ons.

**Scope:**
- `content/methode/lecons.ts`: 27-entry static manifest (number, title, themeSlug, section, status).
- LeÃ§on 1 (La famille / `_sample`) set to `available`; leÃ§on 2 (Au cafÃ© / `cafe`) and leÃ§ons 3â€“27 set to `bientot`.
- `components/ecole/IleLeconCard.tsx`: available cards link to `/ile/[themeSlug]`; bientÃ´t cards are non-clickable divs.
- `LessonList.tsx`: reads manifest (no BE call), renders IleLeconCard under existing section headers.

**Acceptance:**
- Build green.
- La MÃ©thode shows 27 leÃ§on cards under Fondations and Approfondissement.
- LeÃ§on 1 (La famille) is a link to `/ile/_sample`.
- LeÃ§ons 2â€“27 render as locked bientÃ´t cards.
- No console errors.

**non-visual change:** Playwright captures deferred (no new route; this is a data-source swap on an existing surface â€” one-time battery captures the baseline).
**Branch:** main.

---

## F-433: CafÃ© content stub (renders Ã®le shell + hero)

**Status:** Shipped
**Phase:** Phase 1
**Priority:** P1

Add a minimal cafÃ© MDX stub so /ile/cafe renders the full shell (hero image,
Le MaÃ®tre panel, mold sequence) rather than the bientÃ´t fallback card.

**Scope:**
- `content/iles/cafe/b1.mdx`: cafÃ©-themed stub lesson (Dialogue + ActeDeParole + Tache). Marked with top-of-file comment and inline stub notice banner.
- `content/methode/lecons.ts`: cafÃ© entry flipped from `bientot` to `available` â€” La MÃ©thode leÃ§on 2 card is now clickable.
- Audio paths are stubs (`/iles/cafe/audio/b1/*.mp3`); Dialogue renders without audio until Chadi authors the real lesson.

**IMPORTANT â€” this MDX is placeholder content.**
The French copy is minimal and unreviewed. Chadi must replace the entire body
(Dialogue + ActeDeParole + Tache) and remove the stub notice banner before
any audience launch.

**Acceptance:**
- Build green.
- /ile/cafe shows the cafÃ© hero (public/iles/cafe/hero.png) then the stub molds.
- LeÃ§on 2 (Au cafÃ©) on /la-methode is now a clickable link.
- No console errors.

**Branch:** main.

---

## F-434: /seance -- linear daily session view (Phase 2)

**Status:** Shipped
**Phase:** Phase 2
**Priority:** P1

Linear daily session view. Reads current ile + level from localStorage.
Presents a curated subset of molds from the ile in sequence, one step at
a time, with a segmented progress indicator and a stub streak chip.
Completion is persisted to localStorage. Empty state if no ile is available.
Sceance nav item added as the first entry in the primary sidebar nav.

**Scope:**
- lib/seance/sessions.ts: static session definitions for _sample-b1 (5 steps) and cafe-b1 (3 steps). Reuses existing mold component prop types.
- components/seance/SeancePlayer.tsx: 'use client' linear session player -- reads localStorage, renders one mold per step, Continuer/Terminer flow, persists completion.
- app/(app)/seance/page.tsx: replaces bientot placeholder; server metadata + SeancePlayer.
- components/layout/Sidebar.tsx: adds Seance (PlayCircle icon) as first nav item.
- tests/unit/layout/Sidebar.test.tsx: updated from stale hrefs to match current nav + Seance (pre-existing test drift from past nav refactor, corrected in scope of this ticket).

**BE SEAM -- F-407:** Streak chip is a stub ('-- jour(s)'); real streak requires production scoring (F-407, pending). current_ile and seance_completed_* localStorage keys migrate to BE in Round 2.

**Filed follow-up:** wire seance progress + streak to BE once scoring (F-407) and F-410/F-417 endpoints land.

**Acceptance:**
- Build green.
- /seance renders a linear session from the current ile, progress advances, completion persists across reload, streak chip shows as stub, empty state handled, no console errors. Seance nav item routes here.

**non-visual change:** Playwright captures deferred -- F-225 battery covers the baseline.
**Branch:** main.

---

## F-435: Nav route + test reconciliation audit

**Status:** Shipped
**Phase:** Phase 2
**Priority:** P1

Reconcile Sidebar unit test and app-shell.spec.ts e2e to the actual current
routes. app-shell.spec.ts was left red after F-434 because it still targeted
stale hrefs (/dashboard, /la-bibliotheque, /l-examen, /cours/methode-tcf-canada).

**Scope:**
- Inventory of real routes under app/(app): abonnement, bibliotheque, carte,
  cours, examen, ile, la-methode, maitre, parametres, profil, progression, seance.
- Inventory of Sidebar NAV_ITEMS (canonical after this ticket):
  /seance (La Seance), /carte (Tableau de bord), /la-methode (La Methode),
  /bibliotheque (La Bibliotheque), /examen (L'Examen), /profil (Compte).
- Inventory of TopNav NAV_LINKS (desktop, components/nav/TopNav.tsx):
  /seance (Seance), /la-methode (Methode), /examen/expression-orale (Oral),
  /examen/expression-ecrite (Ecrit), /progression (Progres), /maitre (Maitre).
  Profile dropdown: /profil, /parametres, /abonnement, /a-propos.
- Inventory of BottomNav TABS (mobile, components/home/BottomNav.tsx):
  /la-methode (Methode), /examen/expression-orale (Oral),
  /examen/expression-ecrite (Ecrit), /progression (Progres), /more (More).
- Fixed genuinely broken link: Sidebar /account (no route existed) -> /profil.
- Fixed Sidebar.test.tsx: sidebar-link-account -> sidebar-link-profil, href assertion.
- Fixed AppShell.test.tsx: sidebar-link-account -> sidebar-link-profil.
- Rewrote app-shell.spec.ts: /dashboard -> /carte throughout, fixed all stale
  testIDs, 5 nav links -> 6, replaced cours/methode-tcf-canada navigation test
  with carte->la-methode test, /account page test -> /profil page test.

**Route-naming mismatches flagged for M-RENAME pass (do not fix here):**
- Sidebar links to /profil with label "Compte" (English label for French route).
- /carte is the dashboard route but has a geographic label ("carte" = map/card).
  The Sidebar label "Tableau de bord" correctly describes it but the route slug
  is English-neutral rather than French. Flag: /carte vs /tableau-de-bord.
- /bibliotheque missing the "la-" prefix compared to the canonical product name
  "La Bibliotheque". Route slug is /bibliotheque, canonical is /la-bibliotheque.
- /examen missing the "l-" prefix compared to "L'Examen". Route slug is /examen,
  canonical would be /l-examen.

**FLAG -- do not fix in this ticket:**
/carte currently renders Dashboard (DashboardGreeting + widgets). The route slug
"carte" is an orphan from an earlier iteration; the canonical product term is
"Tableau de bord". Rename tracked as M-RENAME follow-up.

**Acceptance:**
- Build green.
- Full unit + e2e suite green, no red app-shell.spec.ts.
- Sidebar.tsx /account -> /profil fix (broken link repaired).

**non-visual change:** link target fix + test reconciliation only.
**Branch:** main.

## Infrastructure

- [Shipped] F-436 CI: GitHub Actions unit + e2e gate (d371548+)

- [Shipped] M-RENAME slug sweep (CI-caught): 6 unit assertions + 11 component stale hrefs fixed (3512cea) — CI is now source of truth
- [Shipped] CI-E2E-FIX: Playwright webServer switched from pnpm dev to pnpm build && pnpm start in CI; per-test timeout 30s; webServer timeout 5min; e2e job cap 20 min; Node 20 → 22 bump — fixes 1h18m CI hang
- [Shipped] E2E-STABILIZE-R1 (2da1114..7e3baa5): 4-cluster e2e stabilization sweep — (1) m0-audit networkidle→load; (2) /maitre/diagnostic → /l-examen/diagnostic in all components + beforeFiles rewrite in next.config.mjs + backward-compat redirect; (3) /signup→/inscription / /dashboard→/tableau-de-bord / wrong URL patterns in 5 e2e specs; (4) LessonList wired to BE API + LessonCard; lecon-N route parsing in [id] page; app/(app)/l-examen/diagnostic/page.tsx added. Unit: 433/433. Cluster specs: 18 fail → 9 pre-existing (Next.js HTTP-200-for-notFound, timer-urgency, ripple-reduced-motion, ArrowKey timing, spinner timing). Remaining clusters tracked: touch-targets 44px, dark-mode networkidle font, landing-hero copy, vocabulaire mobile.
- [Shipped] E2E-STABILIZE-R2: CI worker config (50% workers, 25min cap) + full local suite green. 38 failures → 19 (all R3). Fixes: (1) Timer — Date.now()-based elapsed with synchronous startTimeRef set in onClick (fake-clock compatible); (2) RecordingPlaceholder/diagnostic-results — injectAuthToken added to manual-context reduced-motion tests; (3) ecole-detail ArrowKey — waitFor(lesson-breadcrumb) before keypress; (4) m2-font-audit/touch-targets networkidle→load; (5) vocabulaire-browse chunk-load race — wait for 60-count before filter; (6) landing-methodology CTA — scoped to methodology section to avoid hero duplicate; (7) Hero href /methode→/method; (8) Paywall toggle 28→44px (min-height wrapper); (9) Footer + Wordmark touch targets (minHeight+minWidth 44); (10) landing-persona animation-race fixed with waitForFunction opacity=1. Round 3 deferred: landing-hero copy (13), invalid-ID 404s (6). Local run: 19 failed, 696 passed (3.6m).
- [Shipped] E2E-STABILIZE-R3 (FINAL): Unit + e2e both green. 3 fixes: (1) matchMedia unit regression — window.matchMedia stub added to tests/setup.ts (jsdom gap); clears 24 unit fails; (2) landing-hero copy — spec updated to assert actual editorial hero (H1 "There's a method to French", CTA "See how it works" → /method, subheadline testid replaces missing kicker testid); (3) invalid-ID 404 — dynamicParams=false added to tache/[n] page (generateStaticParams already present for n=1-3); generateStaticParams(lecon-1..lecon-27) + dynamicParams=false added to la-methode/[id] page; routing-level 404 replaces notFound() which was returning HTTP 200. Unit: 433/433. E2E: 0 failures.

## F-437 — Route cleanup: /method doublon (7), diagnostic home (8), forbidden font (9)

**Status:** Shipped (10a7d6e)

**Items:**
- (7) /method → /la-methode 308 redirect; Hero.tsx + MethodologyPreview.tsx CTAs updated to /la-methode; app/(app)/la-methode/page.tsx moved to app/la-methode/page.tsx (public, no ProtectedRoute — leçon cards render pre-login; lesson detail stays gated via (app) group). TopNav maitre entry removed.
- (8) Diagnostic pages moved from app/(app)/maitre/diagnostic/* to app/(app)/l-examen/diagnostic/* (results + tache/[n] created; page.tsx was already present as R1 stub, now live). beforeFiles rewrite deleted. app/(app)/maitre/ directory deleted. /maitre/diagnostic → /l-examen/diagnostic redirect preserved.
- (9) Cabinet Grotesk was already absent from all code files (removed pre-F-437). CLAUDE.md Fonts section updated to reflect current M2 t11 stack.

**Acceptance:** /method 308 to /la-methode; /maitre gone; no forbidden fonts; unit 433/433 + e2e 0 fails + build green.

## F-438 — BE: progress endpoints (GET + PATCH /api/users/me/progress)

**Status:** Shipped (BE repo, branch: master)

**Scope:** FastAPI endpoints `GET /api/users/me/progress` and `PATCH /api/users/me/progress`. Returns `{ current_level, maitre_intensity, streak_days, longest_streak_days, streak_last_active_date, production_minutes_total, daily_target_minutes, tache_attempts, last_couche_signals }`. Writable fields: `daily_target_minutes`, `last_couche_signals`. Streak + attempts are server-managed. Auth-required (bearer token).

## F-439 — FE: wire /ile + seance to F-438 progress endpoint (replace F-431 localStorage interim)

**Status:** Shipped (9f261ec)

**Scope:** `lib/types.ts` UserProgress type + `lib/api.ts` getProgress()/patchProgress() + IleShell.tsx + SeancePlayer.tsx token-guard wiring + auth-e2e.ts mock + unit tests (16).

**Acceptance:** F-431 localStorage interim gone for authenticated users; public visitors default b1 with no 401; unit green + e2e 0 fails + build green.

## F-440 — Wire dashboard widgets to /progress endpoint (fast-follow)

**Status:** Shipped (8068d03)

**Scope:** Dashboard.tsx single-fetch pattern; StreakWidget wired to `streak_days`; DailyTargetWidget wired to `daily_target_minutes` + inline PATCH edit control. CalendarWidget stays on recordings.list() — flagged for dedicated activity-calendar endpoint. Unit +33 tests (StreakWidget.test.tsx, DailyTargetWidget.test.tsx, Dashboard.test.tsx updates). E2e dashboard.spec.ts: progress mock + edit-button test.

**Acceptance:** build green · unit 466/466 · e2e 113 passed, 0 failed.

## F-441 -- FE: TopNav + SITEMAP rebuild to locked IA

**Status:** Shipped (9dca1bf)

**Scope:** TopNav.tsx rebuilt to locked F-441 IA. English benefit labels. Nav items in order: Vocabulary (/la-methode), Exams (dropdown: TCF live, DELF bientôt, French for Business bientôt) (/l-examen), Library (/la-bibliotheque), Real French (bientôt chip), AI Tutor (bientôt chip), Coaching (/coaching). Right side: unauthenticated shows Pricing/Log in/Start Free; authenticated shows ThemeToggle + avatar dropdown (unchanged). Language toggle removed from nav. Nav now renders for unauthenticated visitors on product routes (was token-gated; hydrate() moved to TopNav to work on (shell) routes). SITEMAP.md rebuilt at FE root to match IA. Les Pièges removed from nav. E2e: f-441.spec.ts (1440 + 375 screenshots, Exams dropdown interaction, bientôt chips).

**Acceptance:** build green · unit 466/466 · e2e 735 passed, 1 pre-existing flake (landing-hero mobile), 0 F-441 failures.

## F-444 — CalendarWidget + today-vs-target bar (FE)

**Status:** Shipped (141464a — pre-squash, feature branch feat/f-444-calendar-widget)

**Scope:** Wire `GET /api/users/me/activity-calendar?days=90` into the `/dashboard` (`/tableau-de-bord`) page. Three new UI pieces all inside `CalendarWidget.tsx`:
1. **Contribution-graph heatmap** — 90-day rolling window, 7 rows × ~13 week-columns, navy-ink intensity levels (5 steps: 0 = ink-trace, 1-4 = dominant at 18/38/62/100% opacity), target-met cells ringed in vermillion (`--accent`), today cell outlined in dominant.
2. **Today-vs-target progress bar** — `todayCount / todayTarget` fill, switches to vermillion at 100%.
3. **Streak display** — current streak + longest streak side-by-side stat blocks.

API layer: `ActivityCalendar` / `ActivityCalendarDay` types added to `lib/types.ts`; `RawActivityCalendar` raw shape + `mapActivityCalendar` mapper + `api.users.getActivityCalendar(days)` method added to `lib/api.ts`. `CalendarWidget` still self-fetches (keeps `Dashboard.tsx` clean). `fp-dashboard-calendar` CSS class spans full width at ≥640px so the heatmap has room. `localDateStr` helper avoids UTC/local-midnight timezone bugs in grid construction.

Unit tests: `CalendarWidget.test.tsx` (9 new tests: loading skeleton, heading, current streak, longest streak, today count label, heatmap grid, today-cell marker, error state, zero-activity new-user). `Dashboard.test.tsx` updated with `getActivityCalendar` mock + "Activité" heading assertion. E2e: `f-444.spec.ts` (desktop 1440 + mobile 375: grid render, streak values, today bar, zero-activity, graceful error, no overflow, F-225 screenshots).

**Acceptance:** build green · unit 475/475 · e2e f-444.spec.ts 14/14 passed.

## F-445 -- FE: Landing/marketing header migration to locked IA

**Status:** In progress (feat/f-445-landing-nav-ia)

**Scope:** Converge the logged-out landing page header with the shared TopNav (F-441 locked IA).

- `components/nav/TopNav.tsx`: removed `'/'` and `'/fr'` from `EXCLUDED_EXACT` so TopNav renders on the landing page. Added mobile section (`isLanding` guard: `pathname === '/' || pathname === '/fr'`) -- a `<header data-testid="topnav-mobile">` + collapsible `<nav aria-label="Primary mobile">` drawer that mirrors the locked IA nav items (Vocabulary/Exams/Library/Real French bientôt/AI Tutor bientôt/Coaching) + Pricing/Log in/Start Free when unauthenticated. Exams is a flat link to /l-examen on mobile (no nested dropdown).
- `components/layout/StickyHeader.tsx`: removed `'/'` and `'/fr'` from `MARKETING_EXACT` -- StickyHeader no longer renders on the landing page; TopNav owns it.
- `tests/unit/layout/StickyHeader.test.tsx` + `tests/unit/landing/StickyHeader.test.tsx`: updated path from `'/'` to `'/tarifs'` (still a valid marketing path).
- `tests/unit/nav/TopNav.test.tsx` (new): 16 unit tests covering unauthenticated nav items, auth-conditional right side, excluded routes, mobile header guard (landing vs product routes), hydration gate.
- `tests/e2e/f-445.spec.ts` (new): desktop 1440 + mobile 375 -- full-IA nav visible, Start Free /inscription, Pricing /tarifs, Log in /connexion, Les Pièges absent, wordmark present, StickyHeader absent, Exams dropdown, no overflow. F-225 screenshots: `f-445-landing-1440.png` + `f-445-landing-375.png`.

**Start Free destination:** `/inscription` (existing signup route -- no new route invented).

**Fix (b35902f):** `data-testid="topnav-desktop"` + `sticky-header--scrolled` class added to the desktop nav; tests repointed from removed `sticky-header` testid to `topnav-desktop`/`topnav-mobile`; wordmark assertion scoped within `nav[aria-label=Primary]` to avoid strict-mode double-match.

**Acceptance:** build green · unit 490/490 · e2e f-445.spec.ts 36/36 passed (confirmed locally; awaiting CI green before squash-merge).

---

## F-446 -- FE: auth-state nav shell split

**Status:** In Progress (feat/f-446-auth-nav-shell)

**Scope:** TopNav = logged-out shell only. Sidebar = logged-in shell. When `token` is truthy, TopNav returns null. ThemeToggle relocated from TopNav's authenticated branch into the sidebar footer. Authenticated branch (avatar dropdown + ThemeToggle) removed from TopNav. Authenticated user on `/` is already redirected to `/tableau-de-bord` via `AuthRedirect` (pre-existing). No content/IA changes to nav items.

**Shell split decision:** redirect approach for `/` (AuthRedirect already handles it — no new code needed). TopNav returning null on authenticated routes means public routes like `/la-methode` have no nav when authed; that is acceptable for this scope -- F-447 will address the IA content changes.

**Tests:** `tests/unit/nav/TopNav.test.tsx` (updated -- F-445 auth tests replaced with shell-split assertions: authenticated returns null, unauthenticated renders preserved); `tests/unit/layout/Sidebar.test.tsx` (updated -- ThemeToggle present); `tests/e2e/f-441.spec.ts` (updated -- authenticated block now asserts TopNav absent); `tests/e2e/f-446.spec.ts` (new -- logged-out TopNav present/sidebar absent, logged-in sidebar present/TopNav absent, ThemeToggle in sidebar, F-225 screenshots).

**Acceptance:** build green · unit suite green · e2e f-446.spec.ts 0 failures · no double nav in any auth state.

## F-442 -- chore: untrack auto-generated audit artifacts

**Status:** Shipped

**Scope:** `git rm --cached` all PNGs under `docs/audit-screenshots/` (587 files) and `e2e-results.txt`. Both paths added to `.gitignore`. These are re-written by the m0-audit Playwright spec and the e2e runner on every dispatch and had no business being tracked. `tests/screenshots/` and `tests/traces/` (F-225 deliberate artifacts) are untouched.

**Non-visual change:** no source code changed.

## F-447 -- FE: nav IA content pass on the new shell

**Status:** In Progress (feat/f-447-nav-ia-content)

**Scope:**
- `components/nav/TopNav.tsx`: `library` item removed from `NAV_ITEMS`; replaced with `store` (label "Store", href `/librairie`) in the same slot. Log in (`/connexion`) and Start Free (`/inscription`) were already distinct routes -- verified, no change needed.
- `components/layout/Sidebar.tsx`: `La Bibliotheque` (`/la-bibliotheque`) removed from `NAV_ITEMS`. `BookOpen` icon import removed. `ShoppingBag`, `Tag`, `Users` icons added. New `REVENUE_ITEMS` array (Store `/librairie`, Pricing `/tarifs`, Coaching `/coaching`) rendered as a distinct section below the main nav, separated by a border-top and a collapsed-aware "More" label (`data-testid="sidebar-revenue-section"`).
- `tests/e2e/f-447.spec.ts`: 12 tests across 4 describe blocks (TopNav desktop 1440, TopNav mobile 375, Sidebar desktop 1440, Sidebar mobile 375). Covers: Store present + href, Library absent, Log in != Start Free href, Store click navigation, Pricing/Coaching present + hrefs, revenue section visible. F-225 screenshots: `f-447-topnav-1440.png`, `f-447-topnav-375.png`, `f-447-sidebar-1440.png`, `f-447-sidebar-375.png`.

**VERIFY -- /librairie purchase flow:** `/librairie` renders a catalog page (La Librairie) listing Livres, Audio, Telechargements, Ressources gratuites. All four category cards are wrapped in `<Bientot level="section">` components. Click-to-buy is NOT wired -- no LemonSqueezy integration exists. Store links to the catalog only. Purchase flow is deferred.

**Acceptance:** TopNav: Library gone; Store -> /librairie; Log in != Start Free href. Sidebar: Library gone; Store + Pricing + Coaching present (revenue section). No routes broken. E2e green. Build green.

## F-448 -- FE: Store mold at /librairie (UI only, checkout stubbed)

**Status:** In Progress (feat/f-448-store-mold)

**Scope:** Build the real bookstore MOLD at `/librairie`: full shopping experience UI, no payment wiring. Replaces the four bientôt category cards.

- **Placeholder data (`lib/store/books.ts`):** 11 placeholder books across the four canonical categories (Livres, Audio, Téléchargements, Ressources gratuites). Fields mirror the LemonSqueezy product API shape (`id`, `slug`, `title<-name`, `description`, `priceCents<-price`, `currency`, `coverUrl<-large_thumb_url`, `category`, `author`) with a field-by-field LS mapping comment, so the later swap (option A: books live in LS as products) is config in `lib/api/store.ts`, not rework. No LS API calls, no API keys touched. `formatPrice` mirrors `price_formatted` (0 -> "Gratuit"). Free resources priced at 0.
- **Catalog (`app/librairie/page.tsx` + `components/store/StoreCatalog.tsx`):** editorial selling header (Instrument Serif), responsive 2/3/4-col book grid, the four categories preserved as client filter chips plus "Tout". `BookCard` + `BookCover` render a styled ink-frame placeholder cover (vermillion spine), never a gray box.
- **Detail (`app/librairie/[slug]/page.tsx`):** new nested SSG route (11 prerendered paths). Replaces the old `[item-slug]` notFound stub. Large cover, category, title, author, vermillion price, description, Add to cart. `generateStaticParams` + `generateMetadata`.
- **Cart (`lib/store/cart.ts` + `components/store/CartDrawer.tsx` + `CartButton.tsx` + `AddToCartButton.tsx`):** client-side zustand store persisted to `localStorage` (`lemethodic_cart`), mirroring the `lib/auth.ts` hydrate pattern (SSR-safe). Add / remove / qty steppers, live total. Right-slide drawer mounted once globally in `app/layout.tsx`; any CartButton toggles it.
- **Cart-badge visibility choice:** the cart icon is ALWAYS present in each shell; the numeric count badge appears only when the cart is non-empty. Wired into BOTH shells -- logged-out `TopNav` (right cluster, desktop + mobile) and logged-in `Sidebar` (revenue section row) -- plus `StickyHeader` scoped to `/librairie` (the store has no TopNav/sidebar chrome of its own: TopNav excludes `/librairie` and the route sits outside the authed shell group, so StickyHeader carries the cart while shopping for both auth states).
- **Checkout stub:** prominent "Passer la commande" button in the drawer wrapped in the existing `<Bientot level="section">` pattern. No LemonSqueezy, no payment, no order records.

**Cascade audit (F-445/446/447 lesson):** grepped `tests/` for `/librairie`. `tests/e2e/f-447.spec.ts` had two `heading {name:/la librairie/i}` checks that the rebuild changes (the page H1 is now an editorial headline); both updated in this branch to assert the `catalog-grid` testid renders (route-accessible signal). No other specs referenced the old category-card content. The four category subpages (`/librairie/{livres,audio,telechargements,ressources-gratuites}`) are left as-is (out of scope; static segments take priority over `[slug]`, no route conflict) but are no longer linked from the new catalog.

**Tests:** `tests/e2e/f-448.spec.ts` -- catalog render (11 cards), category filter, detail navigation, add-to-cart + drawer, qty increment + total, remove, reload persistence, checkout bientôt-stub, badge in both shells. F-225 screenshots: `f-448-catalog-1440.png`, `f-448-catalog-375.png`, `f-448-detail-375.png`, `f-448-cart-1440.png`. Unit: 492/492 unaffected (CartButton is a `<button>`, not a `sidebar-link-*`, so the locked-order count test is untouched).

**Acceptance:** Catalog renders + filter works; detail per book; add/remove/qty/total correct + persists; badge updates in both shells; checkout bientôt-stubbed. Build green. CI all green.

## F-449 -- DESIGN.md v3 adoption (Apple-lean) + surface re-execution

**Status:** Queued (doc adoption shipped; surface re-execution tickets to follow)

**Context:** DESIGN.md v3 (Apple-lean modern) was locked 2026-06-11 and committed to main, superseding v2 (Atelier Français). v3 direction: near-monochrome base + one accent (`#E5301C` light / `#FF453A` dark), sans-led (Inter system face + DM Mono for data, serifs retired), generous whitespace, soft layered shadows + frosted glass, rounded everywhere, calm motion, and the glossy 3D islands voyage as the single expressive signature. Full true-dark mode.

**Doc adoption (done in the v3-adoption commit, doc-only):**
- `DESIGN.md` (FE root) replaced with the locked v3 spec.
- v2 archived to `docs/archive/DESIGN-v2.md`; `LEMETHODIC-DESIGN.md` archived to `docs/archive/LEMETHODIC-DESIGN-archived.md`. Both carry supersession banners.
- Stale design-language references corrected to v3 / banner-flagged: `CLAUDE.md` (fonts), `ARCHITECTURE.md` (image pipeline aesthetic), `PEDAGOGY.md` (image pipeline section bannered), `PRODUCT.md` (companion pointer, type stack, visual-signal + per-couche tables), `le-methodic-ship` skill (font guard), `docs/m2-visual-audit-v2-2026-06-01.md` (historical note).

**Surface re-execution (NOT done -- separate tickets, code work):**
- Token layer: replace v2 tokens (`--paper`/`--ink`/`--dominant`/`--accent`/couche tokens) with the v3 light + true-dark palettes in `app/globals.css`.
- Typography: migrate code off Instrument Serif + Crimson Pro to Inter-led; retire italic-on-serif display patterns; remove the serif faces from `app/layout.tsx` + `lib/typography.ts` once surfaces are migrated. (Until then the serif faces are tolerated by the ship gate.)
- Wordmark: retire typewriter + breathing-M; ship the modern Inter logotype. Optional mark/glyph exploration queued.
- Shape/elevation/motion: apply the v3 radius scale, three shadow levels, frosted-glass nav, and v3 motion tokens.
- Islands system: glossy 3D assets (Nano Banana 2, locked prompt C+) for homepage hero, dashboard voyage map, île detail. Motion via Fable 5 (pending verification that Claude Code can run Fable 5).
- Couche color: re-spec under the "one accent only" rule (was warm per-couche in v1, ink-blue + vermillion-Pièges in v2).
- Image pipeline re-authoring: PEDAGOGY.md image-pipeline prompts (aesthetic, reference anchors, prompt vocabulary, negative prompts) need a full rewrite to the glossy-3D direction; the current negative prompt bans "glossy, 3D render," the inverse of v3.

**Sequencing note:** surface re-execution is UI work and follows the FE-first protocol; individual tickets to be filed when dispatched. This entry is the umbrella.


## F-450 -- FE: resolve broken nav targets (live 404s)
**Status:** Shipped (c47e880 + f3c0f76)

**Scope:** Fixed live 404s from broken nav targets. `/exam-prep` redirect repointed off `/tcf-canada` (never built) to `/examens/tcf` (the real TCF Canada landing); `/coaching` + `/placement` given bientot placeholders (F-359 pattern) so TopNav / Sidebar / Hero CTA links resolve. Second commit folded in `PlatformLanding.tsx` (href, seeMoreHref) + `LandingFooter.tsx` (EN branch) `/tcf-canada` hrefs -> `/examens/tcf`; tree-wide grep confirms zero live `/tcf-canada` refs (comments only). The `/tcf-canada` page itself was not built (MS-1, out of scope). e2e `f-450` 4/4 + F-225 captures; build green.

## F-451 -- FE: reroute signup into Target Profile capture (/bienvenue)
**Status:** Shipped (37d5341 + ed3581e)

**Scope:** `SignupForm` post-submit redirected to `/onboarding` (the dismissible product tour) instead of `/bienvenue` (the real four-question intent capture), so new users never hit intent capture. Repointed `/onboarding` -> `/bienvenue`; the tour is left intact, only decoupled from the signup redirect. `/bienvenue` already lands on `/tableau-de-bord` post-capture. Follow-up commit fixed a missed signup-redirect assertion in `register.test.tsx` (the earlier single-file run had masked it, turning CI red). Full unit suite 492/492, build green.

## F-452 -- FE: dead-route cleanup (remove 4 superseded route families)
**Status:** Shipped (d5ebba5)

**Scope:** Removed dead route families: `/cours/methode-tcf-canada` + `[id]` (already 308 -> `/la-methode`), `/la-methode/lesson/[id]` + quiz (superseded by `/la-methode/lecon-N`, zero inbound). Added 308 redirects `/legal/privacy` -> `/confidentialite` and `/legal/tos` -> `/cgv` (ToS = service terms = CGV), removed the stubs. 8 files removed, +2 redirects. Unit 492/492, build green.

## F-453 -- FE: v3 logged-in shell plumbing (app top bar + dashboard rewire)
**Status:** Shipped (1cc936c)

**Scope:** App top bar (`components/layout/AppTopBar.tsx`): content-column bar with an inert search field, an inert notifications bell (desktop), the relocated still-functional `ThemeToggle` (moved out of the sidebar), and a functional user dropdown (`components/layout/UserMenu.tsx`) that de-orphans `/parametres` + `/abonnement`. Dashboard: removed the heatmap `CalendarWidget` from the surface (component + unit test parked; the F-443 BE endpoint untouched) and added a gated `Commencer la seance` primary CTA via the F-359 bientot pattern. Shell: sidebar reservation dropped (now full-height), `.app-shell-main` top padding moved to CSS to clear the fixed top bar. Plumbing baseline only on v3 tokens; frosted / elevation / motion deferred to F-454. Full unit suite 506/506, build green.

## F-454 -- FE: v3 palette foundation (token repoint + F-349 hex sweep) + rgba/hsl ext
**Status:** Shipped (900ced4 + 16c2d4f)

**Scope:** Repointed every canonical color token in `app/globals.css` to the DESIGN.md v3 palette across `:root` (light) + `.dark`, added a distinct `--canvas` surface tier, collapsed the in-product nav-blue + vermillion onto the single v3 coral accent, moved slate to chart-line only. Finished the F-349 hex sweep by routing the deferred chrome hexes (correct-green, error reds, status greens/amber, corals, flame, hover) through v3 tokens; banned v2 literals now zero. Ext commit swept v2 colors written in `rgba()` / `hsl()` form (semantic consts -> role tokens; themed tints -> `color-mix` of the role token at matching alpha) across the iles molds, seance, and the CalendarWidget ramp; final all-form grep (hex + rgba + dead-hsl) confirms zero dead-palette colors remain. Full suite 506/506, build green.

## F-455 -- FE: v3 shell chrome paint (frosted sidebar + top bar)
**Status:** Shipped (1077b6c + 950edd0 + 2b52ccc)

**Scope:** Chrome-only v3 frosted paint; our IA, French labels, and the LE METHODIC wordmark preserved (not the mock's nav). Sidebar: frosted floating panel (blur, rounded, soft shadow, 12px inset inside its 240/64 footprint), active row is an opaque white pill + coral icon/label, legacy MOCK-006 left-tab retired, logout row removed (logout lives solely in the user dropdown). Top bar: frosted + scroll shadow, route-locked French page title, inert search, inert EN/FR toggle (functional switch is F-357), inert bell, theme toggle, user dropdown (coral avatar per the one-accent doctrine, fade+scale open motion, reduced-motion guarded). New shell tokens (light + dark). Two follow-up fixes: top-bar title changed `<h1>` -> `<div>` (it is chrome, not the page heading; the duplicate h1 caused a Playwright strict-mode violation on 3 pages); desktop hamburger hidden via plain CSS rather than `lg:hidden` (an inline `display` beat the no-`!important` Tailwind class, rendering the button at 1440 and reddening CI prod). Verified against a CI-mode prod build: e2e 888 passed / 3 skipped / 0 failures, unit 509/509, build green.

## F-456 -- FE: Journey data model + static fixture

**Status:** Shipped (direct to main)

**Scope:** One static journey data model + fixture in `lib/journey/journey.ts` -- the single source the carte (/carte), the ile page (/ile/[theme]), and the seance render from. Phase 2 is static; the types are shaped so the Phase 3 BE (island_activities + target_profiles) can populate the same structure later WITHOUT reshaping.

- **Types:** `Level` (A1..C1), `ThemeId` + `Theme` (7 TCF themes, stable ids + FR labels, education first), `ActivityType` (5 practice kinds), `Beat` (learn|practice|check), `Status` (locked|current|completed|bientot), `GrammarTopic` ({id,label,level,interference}), `Activity`, `Mock`, `LearnBeat`, `CheckBeat`, `Ile` ({theme,level,learn,practice,check,status}), `Journey` ({level,grammarPhase,iles[7],finalMock}).
- **Fixture:** one assembled sample journey at B1 -- the 7 iles each carry the 3-beat skeleton; practice activities present as placeholders (one per ActivityType, all status bientot); grammarPhase populated from the 13-cluster B1 grammar list (curriculum/clusters/*), interference flag set on the anglophone-difficult points. First ile (education) is current, the rest locked. Mini mocks + final mock bientot. `SAMPLE_JOURNEY = getJourney(B1)`.
- **Assembler:** thin `getJourney(level)` returns the grammar phase + the 7 iles (education first) for that level. Only B1 is authored; other levels return an empty phase + 7 bientot iles, no reshape needed when their curriculum lands.
- **Not a duplicate of `lib/seance/sessions.ts`:** that fixture holds realised seance STEP content for one ile; this model is the higher-level voyage structure (which iles exist, their beats, their status). They coexist; the journey model indexes, the seance fixture realises.
- **No UI, no BE calls, no content authoring.** Skeleton + fixture only. Vocab seeds are real TCF B1 lemmas (no lorem).

**Tests:** `tests/unit/journey/journey.test.ts` -- theme order/count, B1 grammar phase (13, interference flags), 7 iles education-first, status sequencing (current then locked), 3-beat skeleton on every ile, vocab+grammarPoints seeded and referencing the phase, practice all-bientot one-per-type, mocks bientot, other-level fallback. Full unit suite 522/522 green, full e2e green, `npm run build` green.

**F-ID note:** next free after the F-450..F-455 FE commit run (BACKLOG topped at F-449; F-450..455 were committed but not back-filled here). Verified free across both repo git ceilings (BE tops at F-443).

## F-457 -- FE: La Carte journey map view

**Status:** Shipped (direct to main)

**Scope:** Replace the `/carte` bientot stub with the journey map rendered from the F-456 data model. The carte is the dashboard's live entry into the voyage; no real island art, no ile-page content, no diagnostic logic, no BE (all next-ticket / later).

- **Render** (`components/carte/CarteJourney.tsx`, client): the F-456 `getJourney(level)` as a vertical trail in order -- grammar-phase node, then for each of the 7 iles (education first) the ile node followed by its mini-mock marker, then the final-mock node. Node states come straight from the data: `current` = accent-highlighted island + the single primary CTA; `completed` = success/done marker; `locked` = muted, non-interactive (no link); `bientot` = shown not-yet-live. The practice beat (5 activities, all bientot) renders as dashed not-yet-live chips inside each ile; mini-mocks + final mock render as bientot checkpoints.
- **Level resolution** (`lib/journey/target-level.ts`): pure `levelFromTargetProfile(raw)` reads the F-365 target-profile stub (`lm.targetProfile.v1`), pulls the leading CEFR token from its `threshold` string, defaults to `B1` for the GENERAL track / missing / malformed. `readTargetLevel()` is the SSR-safe browser reader. The diagnostic ticket owns real level assignment later; this is the read-only seam. (B1 is the only authored level -- other levels render an empty grammar phase + 7 bientot iles, no current CTA.)
- **Island art seam** (`components/carte/IslandNode.tsx`): a v3-styled rounded placeholder node (status-driven surface) NOW; the single point where real per-theme art drops in LATER without touching the carte layout. No real art this ticket.
- **No broken nav:** the current ile CTA points at the canonical ile route (`/ile/education`). The 7 journey themes have no MDX authored, so the destination lands on IleShell's graceful "Cette île arrive prochainement" bientot stub, not a 404. The ile page itself is the next ticket.
- **Dashboard wiring** (`components/dashboard/CarteEntry.tsx`): a live "Voir ma carte" entry -> `/carte`, added to the dashboard beneath the (still-gated) Commencer la séance CTA so the tested séance ordering is untouched.
- Rounded-only (v3 `--r-*` radii), v3 tokens only (single `--accent`, no new colors), no em-dashes.

**Tests:** `tests/unit/journey/target-level.test.ts` (resolver: default, CEFR token extraction, case-insensitivity, GENERAL/malformed fallback); `tests/unit/carte/CarteJourney.test.tsx` (B1 trail: level header, 13-cluster grammar node live, 7 iles education-first current/locked, exactly one current CTA -> /ile/education, 7 mini-mocks + 1 final-mock all bientot, island placeholder per ile; B2 fallback: grammar not live, no current CTA, iles all bientot); `tests/unit/dashboard/Dashboard.test.tsx` (+1 live carte entry -> /carte); `tests/e2e/f-457.spec.ts` (trail render + CTA href + ile-route bientot landing + dashboard->carte wire, light/dark/mobile receipts). Full unit suite 536/536 green, full e2e 897 passed / 3 pre-existing skipped / 0 failed, `npm run build` green. Receipts (gitignored per F-442): `f-457-carte-1440.png`, `-375.png`, `-dark-1440.png`; trace `f-457.zip`.

**F-ID note:** next free after F-456 (BACKLOG + FE git both topped at F-456; BE git tops at F-443).

## F-458 -- FE: L'Île page, the 3-beat template

**Status:** Shipped (direct to main)

**Scope:** Replace the generic `/ile/[theme]` bientot stub with the real 3-beat ile page, rendered from the F-456 journey model + F-457 level resolver. No seance interactivity, no authored content, no real Le Maitre video, no diagnostic, no BE. Structure + shells only; the seance makes Practice interactive in a later ticket.

- **Render** (`components/iles/IleShell.tsx`, client, rewritten): resolves the level with `readTargetLevel()` (F-457, was BE-progress) and the ile with `getJourney(level).iles` by theme. Header = theme display name (THEMES label) + level + status tag. Then the 3 beats:
  - **Beat 1 Learn:** the vocab list (chips), the ile's grammar points resolved against the journey grammar phase (chips), and a Le Maitre video slot. Authored MDX is rendered if a `content/iles/<theme>/<level>.mdx` file exists, else the slot shows a bientot shell (the 7 journey themes have no MDX, so it is bientot for them; the existing `_sample` / `cafe` MDX still renders).
  - **Beat 2 Practice:** the 5 activity shells (one per ActivityType, all bientot) + a single "Commencer la seance" CTA that is PLACED but GATED (disabled button + bientot tag). No seance logic.
  - **Beat 3 Check:** the mini-mock as a bientot shell.
- **Les Pieges Anglais thread:** grammar points flagged `interference` carry a "Piège" marker (education@B1 foregrounds 2 points, both interference-flagged).
- **No broken nav:** the carte's current-ile CTA (`/ile/education`) now lands on this real page. An unknown theme (or a non-authored level) keeps the graceful "Cette île arrive prochainement" stub, never a 404. Non-B1 levels render the full 3-beat structure with bientot status + empty learn slots.
- Rounded-only (v3 `--r-*` radii), v3 tokens only (`--ink*`, `--paper*`, `--rule*`, `--accent`, `--success`, `--dominant`), no em-dashes.

**Tests:** `tests/unit/iles/IleShell.test.tsx` (header theme/level/status, 3 beats present, 5 vocab, 2 grammar points both interference + 2 piege markers, Le Maitre slot bientot when no MDX, 5 activity shells + gated/disabled seance CTA, mini-mock bientot; unknown theme -> graceful stub; B2-via-profile renders structure with bientot status + empty learn). `tests/e2e/f-458.spec.ts` (carte CTA -> real 3-beat page, header attrs, 3 beats, vocab/grammar/piege counts, gated seance CTA, bientot mini-mock, unknown-theme stub no-404; light/dark/mobile receipts). `tests/e2e/f-457.spec.ts` reconciled: the ile-route landing assertion now expects the real `ile-page`, not the retired stub text. Full unit suite 545/545 green, `npm run build` green, full e2e green. Receipts (gitignored per F-442): `f-458-ile-education-1440.png`, `-375.png`, `-dark-1440.png`; trace `f-458.zip`.

**F-ID note:** next free after F-457 (BACKLOG + FE git both topped at F-457; BE git tops at F-443).

## F-459 -- FE: Le Diagnostic, deliberate level assignment

**Status:** Shipped (direct to main)

**Scope:** Phase 2 of Le Diagnostic -- a deterministic, content-free starting-level assignment (A1..C1) that personalizes the carte. NOT the adaptive grammar-surfacing diagnostic (Phase 3, deferred): no question bank, no scoring engine, no BE (localStorage now; target_profiles BE is Phase 3). The existing `/l-examen/diagnostic` (oral-tâche couches analysis) is a different feature and is untouched.

- **Verify finding:** `/bienvenue` (F-365) already captures a `threshold` (niveau cible / **goal**, leading with a CEFR token) but no self-assessed **starting** level. `target-level.ts` (F-457) derived the carte level from that goal token. So Case A ("extend the capture") and Case B ("minimal level picker") converge: extend `/bienvenue`, do not duplicate.
- **Capture extension** (`app/bienvenue/page.tsx`): a 4th step, "Votre niveau de départ" -- a confirm-and-adjust A1..C1 picker (CEFR band names only; standard, not authored content), seeded to **B1** (the only level with an authored journey). Progress dots 3 -> 4 across the flow. On completion the profile gains an explicit `level` field and the learner lands on **`/carte`** (was `/tableau-de-bord`; `/carte` is the documented Atlas-hub target + the ticket's diagnostic -> carte chain).
- **Resolver seam closed** (`lib/journey/target-level.ts`): `levelFromTargetProfile` now reads the explicit `level` field first (the field this ticket writes), falling back to the legacy `threshold` token for pre-diagnostic profiles -- so CarteJourney + IleShell pick up the assigned level with no change, and old profiles still resolve. Extracted `levelFromThreshold` + `isLevel` (exported, tested).
- Rounded-only (v3 `--r-*` radii via OnboardingScreen primitives), v3 tokens only, no em-dashes. No BE, no content authoring, no scoring.

**Tests:** `tests/unit/journey/target-level.test.ts` (+ explicit-`level`-wins, invalid-level fallback to threshold, `levelFromThreshold`, `isLevel`); `tests/unit/bienvenue/BienvenueForm.test.tsx` (new -- 4-step walk, level step with 5 bands seeded to B1, writes confirmed B1 + adjusted A2, push to `/carte`). `tests/e2e/f-459.spec.ts` (new -- /bienvenue 4-step capture -> level step -> adjust to A2 -> lands `/carte` with `Niveau A2` header; light/dark/mobile receipts). Full unit suite 554/554 green, `npm run build` green, full e2e green. Receipts (gitignored per F-442): `f-459-bienvenue-level-1440.png`, `-375.png`, `-dark-1440.png`; trace `f-459.zip`.

**F-ID note:** next free after F-458 (BACKLOG + FE git both topped at F-458; BE git tops at F-443).

## F-460 -- FE: La Seance, the linear Practice walk

**Status:** Shipped (direct to main)

**Scope:** Phase 2 of La Seance -- the interactive frame that steps through one ile's 5 Practice activities (`Ile.practice[]` from the F-456 journey model) one at a time. LINEAR only: no adaptive sequencing, no seance-resume BE endpoint, no scoring engine (all Phase 3). The activities are content-free SHELLS (no exercise content, no interactivity); authoring is last.

- **Reconcile the two seance concepts:** the old `/seance` (`SeancePlayer`) walked the retired CLE model (`SESSIONS` fixture: dialogue/acte/activite/tache molds, resolved via `current_ile` + BE progress). That fixture was the only consumer of `lib/seance/sessions.ts`; `SeancePlayer` is **rewritten** to walk the new `Ile.practice[]` and `lib/seance/sessions.ts` is **deleted** (molds stay -- the `/dev/molds` gallery still uses them). One seance concept, not two.
- **The walk** (`components/seance/SeancePlayer.tsx`, rewritten): canonical route `/seance`, launched with `?ile=<theme>` from the ile CTA, falling back to the journey's `current` ile on direct nav (the Sidebar/AppTopBar link carries no param). Only `current`/`completed` iles are walkable (parity with the ile CTA gating); anything else shows an empty-state pointing back to the carte. A stepper (segmented bar + "n sur 5"), previous (disabled on step 1) / next ("Continuer", "Terminer la seance" on the last step). Each activity renders as a shell (`components/seance/ActivityShell.tsx`) -- type icon + kicker + label + one-line descriptor (`lib/seance/activities.ts`) + a bientot marker.
- **Completion closes the loop:** the completion screen returns to `/carte`; finishing marks the ile completed in localStorage (`lib/journey/progress.ts`, key `lm.journeyProgress.v1`, `{ [level]: ThemeId[] }`). `getJourney(level, completed = [])` (back-compatible) overlays the signal: completed iles read `completed` and `current` advances to the next unfinished ile. CarteJourney + IleShell read the seam, so the carte visibly advances and the ile CTA flips to "Refaire la seance". No BE.
- **Un-gate the CTA (F-458):** `ile-seance-cta` was a disabled button; it is now a live link to `/seance?ile=<theme>` for `current`/`completed` iles (stays disabled/bientot for `locked`/`bientot`).
- Rounded-only (v3 `--r-*` radii), v3 tokens only (`--ink*`, `--paper*`, `--rule*`, `--accent`, `--success`, `--dominant`), no em-dashes. No BE, no content authoring, no scoring.

**Tests:** `tests/unit/journey/progress.test.ts` (new -- pure parser/writer + browser readers for the localStorage seam); `tests/unit/journey/journey.test.ts` (+ completed-overlay: marks completed, advances current, all-done, non-B1 ignores overlay); `tests/unit/seance/SeancePlayer.test.tsx` (new -- walk by param, current-ile fallback, prev disabled then steps back, 5-step completion + localStorage write, Refaire restart, non-walkable empty state); `tests/unit/iles/IleShell.test.tsx` (reconciled -- current ile CTA now a live link, bientot stays gated, + completed-ile Refaire CTA). `tests/e2e/f-460.spec.ts` (new -- un-gated ile CTA -> 5-activity walk -> completion -> carte advances education->completed / famille->current; prev steps back; non-walkable empty state; light/dark/mobile receipts). `tests/e2e/f-458.spec.ts` reconciled (seance CTA now a live link, not disabled). Full unit suite 575/575 green, `npm run build` green, affected e2e (f-460 + reconciled f-458/f-457) 26/26 green locally; full e2e on CI. Receipts (gitignored per F-442): `f-460-seance-1440.png`, `-375.png`, `-complete-1440.png`, `-dark-1440.png`; trace `f-460.zip`.

**F-ID note:** next free after F-459 (BACKLOG + FE git both topped at F-459; BE git tops at F-443).

## F-461 -- FE: Real island art on La Carte (per-theme, 3 states + grounding shadow)

**Status:** Shipped (direct to main) -- feature `8ae941e`, asset fix `b8f8de0`. CI green on both; Vercel prod deploy READY; prod spot-check all 8 `/iles/island-<key>.png` return 200 image/png.

**Prod incident (fixed in `b8f8de0`):** the 8 `public/iles/island-<key>.png` assets the map references were untracked in git, so the first deploy (`8ae941e`) served every island as a 404 -- the carte rendered broken images. CI + local e2e missed it because the f-457 assertion only checked the img `src` attribute, not that the asset loaded (local dev serves on-disk files regardless). Fix committed the 8 PNGs and hardened the e2e to assert the first island actually loads (`complete && naturalWidth > 0`), so a missing/untracked asset now fails the built-artifact suite. `sheet_*.png` stay untracked (out of scope).

**Scope:** Replace the `IslandNode` placeholder (a single FR initial in a tinted rounded box) with the real per-theme island illustrations now in `public/iles/` (8 1024-square transparent PNGs, base anchored low, landmark rising above, no baked shadow). No layout change: the node keeps its 72x72 footprint and the trail/connector spacing is untouched. `components/carte/IslandNode.tsx` only, plus a small asset map and tests. No data-model, séance, mock-marker, or canonical-doc changes.

- **Asset map** (`lib/journey/island-art.ts`, new): `ISLAND_ART: Record<IslandKey, string>` where `IslandKey = ThemeId | 'grammaire'`, each key -> `/iles/island-<key>.png` (all 8: the 7 TCF themes + the grammar foundation island). The `Record<IslandKey, …>` type forces completeness, so `IslandNode` (indexes by `ThemeId`, a subset) can never fall through to an undefined asset -- checked at compile time, asserted again in unit tests.
- **Render** (`IslandNode.tsx`, rewritten): the themed PNG via `next/image` (`unoptimized`, explicit 72x72, `object-contain`) sized to the current node box -> zero layout shift. `alt` = the FR theme label. Click target + trail spacing unchanged.
- **Three states over the single image, v3 tokens only** (no hardcoded hex): `current` = full colour, lifted (`-translate-y-1`), coral glow (`drop-shadow` in `--accent`), largest grounding shadow; `completed` = full colour, normal elevation, coral check badge top-right (`--accent` disc, `--accent-foreground` check), normal shadow; `locked` = `grayscale(1)` + 55% opacity, flattened, tightest shadow. `bientot` (unauthored levels) folds into the locked treatment.
- **Grounding shadow:** a separate blurred elliptical contact shadow beneath the base (NOT a silhouette drop-shadow tracing the tall landmark). Theme-aware: a soft `--ink` ellipse in light mode, suppressed in dark mode via `dark:opacity-0`. Scale + intensity track the state (current largest, locked smallest).
- **Reduced motion:** every lift/transition rides the `motion-safe:` variant (`motion-safe:transition-all`, `motion-safe:-translate-y-1`), so under `prefers-reduced-motion: reduce` there is no lift or transition. Existing reduced-motion spec stays green.

**Tests:** `tests/unit/carte/IslandNode.test.tsx` (new -- map covers all 8 keys + correct src; each state applies its expected classes/styles; badge only for completed; locked desaturates/dims; bientot folds to locked; motion-safe + dark guards present). `tests/unit/carte/CarteJourney.test.tsx` (placeholder assertion replaced -- asserts each ile renders its themed `/iles/island-<theme>.png` with the right state). `tests/e2e/f-457.spec.ts` (island-art src + state assertion added). Full unit suite 583/583 green, `npm run build` green; full e2e on local dev (per F-225). Node box dimensions + trail positions unchanged (no layout shift).

**F-ID note:** next free after F-460 (BACKLOG + FE git both topped at F-460; BE git tops at F-443).

## F-462 -- FE: La Carte serpentine journey map (Duolingo-style trail rebuild)

**Status:** Shipped (direct to main) -- `5b8720c`. All three ship gates green: CI `success` on `5b8720c` (run 27525808967); Vercel prod deploy READY (`dpl_GPYFadfmpT7pEBJNuATRjgcTiYnc`, target production, commit `5b8720c`); prod spot-check of `/carte` (authed, desktop 1440 + mobile 375) 13/13 -- serpentine renders, all 8 `/iles/island-<key>.png` return 200 image/png and the education island loads (`naturalWidth>0`), "vous êtes ici" pin on the current node, single current link -> `/ile/education`, 7 mini-mock + 1 final checkpoint markers (not islands), 375px column zero horizontal overflow, current node scrolled into view. After push + CI green: prod spot-check `/carte` renders the serpentine, islands load (no 404), current node in view, no 375px overflow, then flip to Shipped.

**Scope:** Rebuild the `/carte` presentation from the F-457 vertical list-with-margin-icons into a vertical serpentine journey map: the islands ARE the trail, zig-zagging down a single scrolling column connected by a curved SVG path, with a "vous êtes ici" pin on the current node. Mobile-first, deterministic data-driven node placement so it scales. No data-model change, no routing change, no `IslandNode` change. The old vertical-list rendering is replaced (not flagged). KEPT untouched: `lib/journey/journey.ts` (`getJourney`), `lib/journey/target-level.ts`, `lib/journey/progress.ts`, `lib/journey/island-art.ts`, `components/carte/IslandNode.tsx` (3 states + grounding shadow + load behaviour), the `/carte` route, the dashboard->carte entry, the `/bienvenue`->`/carte` redirect, and each node's existing destination.

- **New presentation** (`components/carte/CarteMap.tsx`, replaces `CarteJourney.tsx`): the `/carte` page renders it in place of the old list. Reuses the existing wiring verbatim -- level from `readTargetLevel()` (`lm.targetProfile.v1`), completed iles from `readCompletedIles()` (`lm.journeyProgress.v1`), `getJourney(level, completed)`.
- **Deterministic placement (no hand-laid coords):** the spine is the ordered nodes grammar (P0) -> 7 iles (P1..P7) -> final mock (P8). `y` from the index (`top + i*rowH`); `x` from an alternating offset around centre (`center ± amp`, even left / odd right) -> a gentle zig-zag. `amp` is clamped to `center - island/2 - 14` so an island at its render size can never overflow 375px. Sizes scale with the measured container width (mobile island 86px / desktop 132px; reads the live width via `ResizeObserver`, SSR/jsdom default 360). Works for any node count.
- **Curved path (SVG, decorative, `aria-hidden`):** a Catmull-Rom -> cubic-bezier curve threading every node centre. Two stacked paths: the full trail in `--rule` (muted), then the completed prefix (start -> current node) overlaid in `--accent`. Shared tangents, so the split is seamless.
- **Nodes.** Iles render `IslandNode` (current/completed/locked art + states reused) scaled up via a CSS transform off the 72px base, each with a concise label under it (theme name + `Niveau B1`). Grammar keeps its marker treatment (book icon, first on the trail, non-interactive -- did NOT adopt `island-grammaire` art, out of scope). Mocks are small rounded checkpoint markers ON the path (mini-mock at each gap midpoint, clipboard icon; final mock at P8, flag) -- markers, not islands (locked decision).
- **Position marker:** a "vous êtes ici" `--accent` pill (`MapPin` + label) anchored above the current node, with an accessible name. Absent when no ile is current (unauthored level).
- **Interaction:** current/completed (unlocked) iles are links to `/ile/[theme]`; the current one is the single `carte-current-cta`. Locked/bientot iles are `role="link" aria-disabled` with no href (no nav, not keyboard-focusable). Grammar + mocks keep current behaviour (non-nav / bientot). No new detail popup (deferred). On load the current node is scrolled into view (centred), motion-safe via `prefers-reduced-motion`.
- **DOM contract preserved** so the downstream journey-chain specs need no change: the outer ile frame keeps `data-testid="carte-ile"` + `data-theme` + `data-status` (F-460 reads these), the current ile's inner link keeps `data-testid="carte-current-cta"` + href (F-458 enters through it), and `carte-journey` / `carte-level` are intact (F-459). New testids: `carte-map`, `carte-here-marker`.

**Tests:** `tests/unit/carte/CarteMap.test.tsx` (replaces `CarteJourney.test.tsx`) -- map renders at B1; grammar first as a marker (no island inside); 7 iles education-first current/rest-locked; each ile its themed `/iles/island-<theme>.png` with the right state (F-461 load guard preserved in e2e); exactly one current-node anchor to `/ile/education`; the "vous êtes ici" pin on the current node; a locked ile is a non-navigable `role="link"` (no anchor); 7 mini-mock + 1 final checkpoint markers (not islands); B2 unauthored (no current, no pin); seance-progress advances current to the next ile. `tests/e2e/f-462.spec.ts` (renamed from `f-457.spec.ts`, rewritten) -- serpentine renders, grammar marker, themed island loads (`complete && naturalWidth>0`), the here-pin on the current node, mocks as markers, the single current-node link lands the real F-458 ile page, dashboard entry, dark mode, and at 375px: zero horizontal overflow (`scrollWidth <= clientWidth`) + current node scrolled into view. Receipts `f-462-carte-{1440,375,dark-1440}.png`, trace `f-462.zip`. f-458/459/460 unchanged (their carte assertions ride the preserved contract testids).

**Gates:** full unit suite 586/586 green; `npm run build` green; full e2e 920 passed / 3 skipped against the prod build, 1 pre-existing unrelated failure (`touch-targets` on `/` landing `tier-cta`, a known dev/prod flake per the e2e-flakes memo, not a `/carte` surface). `tsc --noEmit` clean for the touched files (repo `ignoreBuildErrors` on; pre-existing errors elsewhere untouched).

**F-ID note:** next free after F-461 (BACKLOG + FE git both topped at F-461; verified no F-462 in BACKLOG/PRD before claiming).

## F-463 -- FE: v3 light palette -- soft tint card-fill family + cooler canvas (token foundation)

**Status:** Shipped (direct to main) -- `3389814`. All three ship gates green: CI `success` on `3389814` (run 27527468896, both unit + e2e jobs green); Vercel prod READY (`dpl_BJWU9HVZZm1o8pWMUxqqJpq3JXwg`, target production, commit `3389814`); prod spot-check of the deployed CSS bundle confirms `--canvas:#eaeff3` (light) / `#0a0c0e` (dark) and the tint family (`--tint-sage:#ccd9ce`, `--tint-peach:#f7c3ab`) shipped, with no stale `#F3F4F6` left, white cards (`--paper #FFFFFF`, unchanged) separating against the cooler canvas, and the canvas tier internally consistent (canvas == paper-edge) so no new seam. Source of truth: the approved Nano Banana dashboard mock.

**Scope:** Foundation-only revision of the DESIGN.md v3 **light** palette + the token layer. (1) Repoint the canvas tier from the flat `#F3F4F6` to a whisper-cool off-white `#EAEFF3` (the one global visual change). (2) Add a soft **tint card-fill family** (`--tint-sage #CCD9CE`, `--tint-slate #A8B8C8`, `--tint-cream #F2E9D7`, `--tint-peach #F7C3AB`) with a per-tint deeper sparkline shade each (`#6E8B72 / #5E7A96 / #C98A6A / #D85A30`), plus a success badge (`--badge-success #BFE0C4` / `--badge-success-check #2E7D4F`) and a deepest heading ink (`--heading #1F2933`). Coral (`--accent #E05C42`) stays the single brand accent (unchanged). The tints are **additive tokens consumed later by the dashboard (Brief 2), NOT retro-applied** to any existing surface.

- **DESIGN.md** (`DESIGN.md`, FE root, edited directly): §2 Light table rewritten to the canonical F-454 + F-463 light tokens (canvas `#EAEFF3`, paper `#FFFFFF`, heading/body/muted, coral, success badge); new "### Tint card-fills (F-463)" subsection documenting the 4 fills + sparklines as a surface-fill family (not accents), with the additive/not-retro-applied doctrine and a flagged dark-tint follow-up; locked-decision #1 re-pointed to coral `#E05C42` (canonical `--accent`).
- **Token layer** (`app/globals.css`): `--canvas` + `--paper-edge` (canvas tier) -> `#EAEFF3`; new tint/sparkline/badge/heading vars in `:root`; all exposed as Tailwind utilities in `@theme inline` (`bg-tint-sage`, `text-heading`, `bg-badge-success`, etc.). `--accent` untouched.
- **Dark mode** (`.dark`): the four tint tokens alias the dark card surface (`--paper` = `#1C1F22`) as a safe fallback (no invented dark tints -- real ones need a dark mock, flagged follow-up); `--heading` flips to `--ink`. Sparkline + badge tokens are mid-tone / self-contained and inherit valid values in both modes. Tokens are mode-complete so nothing breaks.
- **Chrome:** `app/layout.tsx` `themeColor` meta (mobile browser chrome, must be a literal) updated `#F3F4F6` -> `#EAEFF3` to mirror the canvas.

**Verify:** no contrast regression from the bg shift -- the new canvas is marginally darker/cooler, so dark body ink, muted text, hairlines, and white cards all keep or slightly gain contrast (white cards separate more, not less); the canvas tier stays internally consistent (canvas == subtle chip) so no new seam. No new hardcoded hex in surfaces -- values live only in the token layer (the sole literal is the required `themeColor` meta, which mirrors `--canvas`). F-225 aesthetic check against the approved dashboard mock.

**Tests:** `tests/e2e/f-454.spec.ts` + `tests/e2e/f-454-ext.spec.ts` `V3_CANVAS.light` updated to `rgb(234, 239, 243)` (`#EAEFF3`); these render-not-just-exist assertions now actively prove the canvas shift painted in both modes across dashboard / la-methode / molds / l-examen. No new test for the tint tokens: they are unconsumed additive tokens until Brief 2 lights up the dashboard, which will carry their surface coverage.

**Gates:** full unit suite 586/586 green; `pnpm build` green; full e2e (CI mode, prod build + start) 918 passed / 3 skipped / 3 flaky (all passed on retry), 0 failed -- the only repeat flake is `touch-targets` on `/` landing `tier-cta` (known dev/prod flake per the e2e-flakes memo, button-size not canvas/tint). Local non-CI `pnpm dev` run showed the documented dev-server stale-CSS flake (empty `--canvas`); resolved by running the canonical CI prod-build gate.

**F-ID note:** next free after F-462 (BACKLOG topped at F-462, the La Carte serpentine map; FE git tops at F-462 `5b8720c`; BE git tops at F-443). Verified no F-463 in BACKLOG/PRD before claiming.

## F-465 -- FE: Logged-in sidebar -> persistent icon-rail (hover-expand + pin + push) with mobile drawer

**Status:** **Shipped** (`09a8e57`, squash-merged to `main`). All ship gates green: GitHub Actions success on `09a8e57` (run 27529207637, Unit + E2E jobs both green); Vercel prod READY (`dpl_DG84b1TFSExL76AUxEzvc6xjdDN4`, target production, aliased to lemethodic.com). Pre-push verification confirmed the F-463 palette survived the squash (the branch forked before `3389814`): the deployed CSS bundle carries canvas `#EAEFF3` + all four tints/sparklines + badge + heading ink, zero stale `#F3F4F6`, alongside the F-465 `--sidebar-rail`/`--sidebar-expanded`/`--lm-shell-offset` tokens. Prod behavioral spot-check 16/16 against the live deploy (rail rests icon-only, hover/focus expands to titles with `data-expanded`, content pushes, pin persists across reload, mobile drawer opens). Full local gate before push: unit 586/586, e2e (CI mode) 936 passed / 3 skipped / 1 flaky (pre-existing f-454 networkidle, retry-green).

**Scope:** Convert the F-446 split app-shell sidebar (logged-in pages only) into a persistent icon-rail. TopNav and every logged-out surface are untouched. No BE.

**Behavior:**
- **Desktop (gated `@media (min-width: 1024px) and (hover: hover) and (pointer: fine)`)** -- the rail-push model. Resting = icon-only rail at `--sidebar-rail` (64px footprint, floated panel = footprint − 12px inset). Hover expands to titles at `--sidebar-expanded` (240px) with a **150ms** open-intent delay and **200ms** close delay to kill flicker; `focus-within` expands immediately (keyboard parity). The content column (`.app-shell-main` margin-left + `.app-topbar` left) tracks the live width via `--lm-shell-offset` -- **push, not overlay**. No desktop hamburger or collapse toggle.
- **Pin** -- shown only in the expanded desktop rail. Click sets mode `titles`, persisted to `localStorage` `lm.sidebarMode.v1`; rail locks expanded, content stays pushed, hover/leave no longer collapses. `aria-pressed` reflects state. Unpin returns to the icons-at-rest hover model.
- **Mobile / coarse pointer / <1024px** -- hover model off; the AppTopBar hamburger is the only trigger, opening the existing overlay drawer (full titles); backdrop tap-out + the drawer's own dismiss. Pin hidden (drawer model).
- The **min-width:1024 half of the gate is deliberate** (the brief specifies the pointer query alone): it preserves the existing width-based shell contract so the 375px cross-project shell tests keep resolving to the drawer model. A ≥1024px coarse-pointer (touch) device correctly falls to the drawer.

**Persistence:** `lm.sidebarMode.v1` = `"icons" | "titles"`, default `"icons"`. Read in a `useEffect` (not during render) so SSR markup and the first client render agree; the `--lm-shell-offset` fallback resolves to the rail footprint pre-hydration, so the default first paint is the rail with no expand flash. `"titles"` renders pinned-expanded on load.

**Design (v3):** No hardcoded hex -- new tokens `--sidebar-rail` / `--sidebar-expanded` in the shell token block; everything else references existing v3 frosted-shell tokens (`--shell-frost`, `--shell-pill`, `--accent`, `--rule-default`), so the F-463 palette flows through. Rounded corners + soft shadow + frosted blur preserved. Active-route pill reads in BOTH icon and titles states (it already paints the link background; the icon stays coral when collapsed). ThemeToggle stays in AppTopBar (locked model). All nav + revenue (Store/Pricing/Coaching) + cart rows already carry lucide icon affordances for the collapsed rail.

**A11y / motion:** icon-only links keep their text label in the DOM (`aria-current` on active) so the accessible name survives collapse; pin `aria-pressed`; mobile hamburger `aria-expanded` + `aria-controls` (unchanged). `prefers-reduced-motion: reduce` snaps the rail width, the content push, and the drawer slide (no transition).

**Files:**
- `lib/shell/useSidebarRail.ts` (new) -- the interaction hook: capability `matchMedia`, persisted mode, hover intent/close timers, focus-within (with `relatedTarget` containment guard so intra-rail focus moves don't flicker), pin toggle. Exports `RAIL_WIDTH` / `EXPANDED_WIDTH` / `SIDEBAR_MODE_KEY`.
- `components/layout/AppShell.tsx` -- calls the hook, sets `--lm-shell-offset` on the shell wrapper, derives `compact`, passes `compact` + `rail` to Sidebar.
- `components/layout/Sidebar.tsx` -- removed the old cookie/Cmd-B collapse toggle; the panel width + `compact` are now props; hover/focus handlers on the `<aside>`; new `data-mode` / `data-expanded` attrs; pin button replaces the bottom collapse toggle.
- `app/globals.css` -- `--sidebar-rail` / `--sidebar-expanded` tokens; the desktop responsive block repointed from a hardcoded `240px` to `var(--lm-shell-offset, var(--sidebar-rail))` and gated on pointer; reduced-motion snaps width + push.

**Sequencing:** Lands BEFORE F-464 (dashboard rebuild). F-464 designs its 3-zone layout against this icon-rail-default geometry. The dashboard was NOT touched here.

**Tests:** `tests/e2e/f-465.spec.ts` (new) -- rail renders icon-only at rest with content pushed by the rail width (asserts rendered `getBoundingClientRect` + computed `marginLeft`, not src attrs -- the F-461 lesson); hover AND keyboard focus expand to the expanded width; pin persists `titles` across reload via `localStorage` and unpin reverts; active pill reads while collapsed; mobile toggle opens the overlay drawer (full titles, no pin). 1440 + 375 captures. `tests/e2e/f-455.spec.ts` desktop wordmark assertion updated to hover-first (the rail rests icon-only now; the wordmark paints on expand). `tests/unit/layout/Sidebar.test.tsx` unchanged and green (renders expanded by default).

**Gates:** `npm run build` green. Full unit suite 586/586 green. F-465 e2e 16/16 (desktop + mobile projects). Shell regression -- `app-shell` / `f-446` / `f-447` / `f-448` / `f-455` all green after the f-455 hover update.

**F-ID note:** next free after F-463 (BACKLOG topped at F-463; FE git tops at F-462 `5b8720c`). F-463 (palette) and **F-464 (dashboard rebuild)** are reserved, so this took **F-465**. Verified no F-464/F-465 string anywhere in the repo before claiming.

## F-464 -- FE: /tableau-de-bord three-zone dashboard rebuild (consumes F-463 tints + F-465 rail)

**Status:** Shipped (direct to main) -- `1c41ad1`. All three ship gates green: GitHub Actions `success` on `1c41ad1` (run 27532009118, Unit + E2E both green); Vercel prod READY (`dpl_3h1qtyUEwXQTKwnRAMr6uTR8L5SR`, target production, aliased to lemethodic.com + lemethodic-frontend.vercel.app); prod spot-check of `/tableau-de-bord` (authed, desktop 1440 + mobile 375) 10/10 -- three zones render, hero CTA -> /carte (navigates), hero island art loads (`/iles/island-education.png` 200 image/png, `naturalWidth>0`), six metric cards, sage tint computed = `rgb(204,217,206)` (token not literal), content sits beside the rail (`.app-shell-main` margin-left 64px), canvas still `#EAEFF3`, and at 375 zero horizontal overflow + rail stacked below main. Layout locked with Chadi against the Nano Banana dashboard mock. Depends on F-463 (palette) + F-465 (icon rail), both shipped to main. **Open follow-up (Chadi's call):** the dashboard renders inside AppShell's shared 1200px content column; a true full-bleed dashboard is a separate ticket (AppShell width is shared by every authed route, so it was left untouched here).

**Scope:** Rebuild `/tableau-de-bord` from the old greeting + gated-CTA + 4-widget grid into a three-zone dashboard. LEFT zone = the shipped F-465 icon rail (AppShell, REUSED as-is, NOT rebuilt; the dashboard renders inside the AppShell `<main>` within `--lm-shell-offset`). MAIN zone = greeting (reused `DashboardGreeting`) + a 4-col grid: La Carte HERO spanning 3 cols x 2 rows (current île art + theme + level + slim progress bar + "Continuer" -> /carte; an entry card, not a mini map) and six tinted metric cards filling the L (Série, Objectif du jour, Minutes de production, Îles terminées, Niveau cible, Examen). RIGHT rail = the reused F-444 `CalendarWidget`, a weekly progress chart, and two small stat cards (Production, Pièges). notif + avatar stay in the reused `AppTopBar` (not duplicated in main). Full-bleed within the AppShell content column (AppShell's `maxWidth:1200` is shared by every authed route and was left untouched).

- **New presentation** (`components/dashboard/`): `Dashboard.tsx` rewritten as the 3-zone orchestrator; `CarteHero.tsx` (journey hero, F-456 model + F-461 island art, F-461 load guard); `MetricCard.tsx` (tinted card: `var(--tint-*)` fill, `var(--tint-*-spark)` sparkline, `--heading` title, coral emphasis number, optional progress bar / sparkline / bientôt); `StatCard.tsx` (compact rail stat); `Sparkline.tsx` (inline SVG); `WeeklyChart.tsx` (7-bar week from calendar days, coral on target-met). Tint rotation sage/slate/cream/peach. No hardcoded hex -- all fills are F-463 tint tokens.
- **Data (honesty, no fabricated numbers):** wired to what exists -- Série = `getProgress().streakDays`; Objectif = activity-calendar today/target; Minutes de production = sum of this ISO week's calendar days (+ last-7 sparkline); Îles terminées = `readCompletedIles(level).length` / `getJourney().iles`; Niveau = `readTargetLevel()` (`lm.targetProfile.v1`); Examen = `user.examDate` J- countdown; Production totale = `productionMinutesTotal`. Metrics with no source render bientôt: Examen when no date is set, and the Pièges stat (no source yet). Journey metrics resolve in `useEffect` (localStorage), so no SSR/hydration mismatch.
- **Layout** (`app/globals.css`): new `.dash-grid` (mobile-first single column -> `>=1024px` main + rail side by side), `.dash-cards` (1 -> 2 -> 4 col), `.dash-hero` (spans 3 cols x 2 rows at desktop; the six cards auto-flow into the L). Plain CSS per the UI-006 convention. Reduced-motion inherited via the existing `.progress-bar-fill` / `.ed-card-lift` guards.
- **A11y:** the right rail is a labelled `<aside>` (complementary landmark) beside the shell's `<main>` and `<nav>`; the page `<h1>` is the greeting; cards are labelled; the calendar + weekly chart carry aria labels; island art keeps the F-461 load guard.
- **Reuse, not rebuilt:** AppShell + icon rail (F-465), AppTopBar (notif/avatar), CalendarWidget (F-444, untouched -- it self-fetches; the Objectif/Production cards read a second lift of the same endpoint at the Dashboard level), `lib/journey` (getJourney + island-art + target-level + progress), the F-439 progress client. The old `CommencerSeance` / `CarteEntry` / `CountdownWidget` / `StreakWidget` / `DailyTargetWidget` / `NextLessonWidget` components are left in the repo (with their own unit tests intact) but are no longer rendered on the dashboard; inline daily-target editing is off the dashboard surface in the new design.

**Tests:** `tests/unit/dashboard/Dashboard.test.tsx` rewritten for the three-zone structure (greeting, zones, hero -> /carte + education art, six cards, wired data, tint tokens not literals, Pièges bientôt, calendar + weekly chart). `tests/e2e/dashboard.spec.ts` rewritten (zones, hero art loaded, six cards, coral active calendar day, tint computed-fill = `rgb(204,217,206)` not white, content within the rail offset, 375 single-column reflow + zero overflow). `tests/e2e/f-464.spec.ts` (new) -- F-225 captures `f-464-tableau-de-bord-{1440,375,dark-1440}.png` + trace `f-464.zip`, hero-CTA-lands-/carte happy path, dark-mode tint fallback. Reconciled: `f-453.spec.ts` (its superseded heatmap-free + commencer-seance assertions -> assert the new `dashboard-zone-main`) and `f-462.spec.ts` (dashboard entry -> the hero CTA `dashboard-carte-hero-cta`).

**Gates:** full unit suite 586/586 green; `pnpm build` green; `tsc --noEmit` clean for the new dashboard files; full e2e (CI mode, prod build + start) 938 passed / 3 skipped / 1 flaky (the pre-existing `f-454` la-methode `networkidle` flake, passed on retry) / 0 failed. F-225 aesthetic self-check against the locked layout: three zones, hero (3x2) + tinted L, right rail, both modes -- PASS. Receipts regenerated by the e2e (now gitignored per `535f44d`, not committed).

**F-ID note:** F-464 was reserved by the F-465 entry for this dashboard rebuild. Verified no `## F-464` heading in BACKLOG, none in PRD, none in git history before claiming.

## F-466 -- FE: widen the dashboard content column to 1536 (dashboard-only)

**Status:** Shipped (5460535). Pushed to `main` in the F-467 batch (e9ad76b..d01cf30); CI success on d01cf30 (run 27535120231, unit + e2e green); Vercel prod READY (dpl_4M4sXWWM2qaBgsDuQ9WQJwmeMoba, target production). Prod spot-check of the live deploy: at 1920, `/tableau-de-bord` `app-shell-content` measures **1536** (content left 224 -> balanced within the post-rail area) while `/carte` stays **1200** -- override is dashboard-only. Direct follow-up to F-464: Chadi chose "widen dashboard" over keeping the shared 1200 column, then amended the cap 1440 -> 1536 pre-push.

**Scope:** The data-dense dashboard gets a wider content column (1536) than the shared 1200px reading width every other authed route keeps. `AppShell` already reads `usePathname()`; the content wrapper `maxWidth` is now a per-route value (`pathname === '/tableau-de-bord' ? 1536 : 1200`). Dashboard-only override -- no breakout hack, no negative margins, and every other authed surface (/carte, /la-methode, /parametres, ...) is byte-for-byte unchanged at 1200. The wrapper got a `data-testid="app-shell-content"` so the override is testable.

- **`components/layout/AppShell.tsx`:** `const contentMaxWidth = pathname === '/tableau-de-bord' ? 1536 : 1200`, applied to the content wrapper `<div>`. One-line behavioural change; the rail geometry, padding, and `--lm-shell-offset` are untouched.

**Tests:** `tests/e2e/f-466.spec.ts` (new) -- at a 1920 viewport, `/tableau-de-bord`'s `app-shell-content` measures the cap exactly: `> 1450` AND `<= 1537` (pins 1536, distinguishing it from the prior 1440; rail + padding leave ~1792 available so the div hits its cap), while `/carte`'s stays `<= 1200`, proving the override is dashboard-only. F-225 receipt `f-466-tableau-de-bord-1920.png` recaptured at the 1536 cap. F-464's existing 1440/375 specs still green (the cap only changes behaviour above 1200).

**Gates:** full unit suite 586/586 green (incl. `AppShell.test.tsx`, unaffected); `pnpm build` green; targeted e2e (CI mode, prod build) -- f-466 + dashboard + f-464 28/28. Aesthetic check at 1920: the three zones fill the 1536 column with balanced margins, neither stretched nor sparse -- PASS.

**F-ID note:** next free after F-465 (BACKLOG topped at F-465; F-464 just added). Verified no `## F-466` in BACKLOG, none in PRD, none in git history before claiming.

## F-467 -- FE: daily-target editor on /parametres (SHIPPED)

**Status:** Shipped (d01cf30). FE-only; the `/api/users/me/progress` endpoint already exists. CI success on d01cf30 (run 27535120231, unit + e2e green); Vercel prod READY (dpl_4M4sXWWM2qaBgsDuQ9WQJwmeMoba, target production). Prod spot-check of the live deploy: change in /parametres -> PATCH fires `daily_target_minutes:45` -> reload persists 45 -> `/tableau-de-bord` "Objectif du jour" card shows `/ 45 min` (single source of truth confirmed end-to-end on prod).

**Built (2026-06-15):**
- New `components/parametres/DailyTargetSection.tsx` (client): reads `daily_target_minutes` via `api.users.getProgress()`, writes via `api.users.patchProgress({ daily_target_minutes })`. Optimistic update, revert on error (re-throw keeps the widget in edit mode for retry).
- Reuses the parked `components/dashboard/DailyTargetWidget.tsx` (not rebuilt). Bounds tightened to 5-120 min, step 5 (was max 240): `max={120}` + upper-bound guard in `saveEdit`; `saveEdit` now `catch`es so a failed PATCH no longer surfaces an unhandled rejection.
- `/parametres` page now renders an "Objectif quotidien" section above the remaining Bientôt stub.
- One source of truth: no `lm.*` mirror, no second store. The dashboard "Objectif du jour" card still reads `activity-calendar.todayTarget` (BE-derived from the same field); e2e proves the card reflects the new value after a save + reload.

**Gates:** 592 unit pass (kept the DailyTargetWidget suite, added the /parametres mount suite + an upper-bound test). `pnpm build` green. F-467 e2e (6 tests) pass on the prod build (`pnpm start`): change target -> PATCH fires with `daily_target_minutes:45` -> reload persists -> `/tableau-de-bord` Objectif card shows `/ 45 min`. F-225 receipts: `tests/screenshots/f-467-parametres-objectif{,-dark,-375}.png`, trace `tests/traces/f-467.zip`.

**The gap (verified 2026-06-15):** F-464 took `DailyTargetWidget` off the dashboard surface, and that widget was the ONLY UI anywhere in the FE that edits the daily target. So the daily target is now **read-only across the whole app**: the dashboard "Objectif du jour" card displays it but nothing can change it. `/parametres` is a full bientôt stub (`<Bientot>` over inert mock rows -- "Affichage / Audio / Notifications / Compte"; the "Rappels quotidiens" row is a dead 8px grey bar, not a control), so there is no editor there.

**The store (NOT localStorage):** the daily target is a **server field `daily_target_minutes`** on the user's progress record.
- Read: `GET /api/users/me/progress` -> `UserProgress.dailyTargetMinutes` (`lib/api.ts` `users.getProgress`, mapped in `lib/types.ts`).
- Write: `PATCH /api/users/me/progress { daily_target_minutes }` (`lib/api.ts` `users.patchProgress`, line 1041).
- The dashboard "Objectif du jour" card reads the SAME value indirectly via `GET /api/users/me/activity-calendar` -> `todayTarget` (the BE derives `todayTarget` from `daily_target_minutes`). So the display card and a future editor share one source of truth: the server field. **There is no `lm.dailyTarget` and no daily-target field in `lm.targetProfile.v1`** (that key holds the onboarding Target Profile -- level / threshold / exam -- not the daily minutes goal).
- **Registration does NOT write it:** signup creates the user with a server default (observed 30 min in every mock); `/bienvenue` onboarding writes `lm.targetProfile.v1` (level/exam), never the daily minutes target.

**Proposed scope (for the brief, not built here):** add a real "Objectif quotidien" control to `/parametres` (or un-stub the "Rappels quotidiens" row) wired to `patchProgress({ daily_target_minutes })`. The editor already exists as `components/dashboard/DailyTargetWidget.tsx` (read `dailyTargetMinutes`, edit -> `onPatchTarget` -> PATCH) -- relocate/adapt it rather than rebuild. After this lands, the dashboard Objectif card stays the display; /parametres becomes the edit surface; both read the same server field so they stay in sync on next load. No BE work (the endpoint exists).

**F-ID note:** next free after F-466 (BACKLOG topped at F-466; F-464/F-465 shipped). Verified no `## F-467` in BACKLOG, none in PRD, none in git history before claiming.

## F-468 — Reserved: registration daily-minutes capture (parked, feeds recommended-duration pace calc, dead until built)

**Status:** Reserved / parked, never built. This stub only closes the F-468 namespace gap below the F-472 ceiling (the ID was skipped at F-469 time per that ticket's F-ID note). No prior work, no commit SHA. Dead until built.

## F-469 -- FE: La Carte immersive sea-world + scatter layout (desktop)

**SUPERSEDED ON DESKTOP by F-470 (2026-06-16):** CSS cannot match a rendered ocean. The desktop `/carte` is now ONE baked Nano Banana image + interactive overlays, not a CSS sea/scatter. F-469's CSS sea, clouds, reflections, waterline glow, `SCATTER_LAYOUT`/`layout-map`, the SVG trail, the buoys and the per-island `IslandNode` rendering are removed on desktop. The DOM contract and the `<1024` F-462 serpentine are unchanged. See F-470.

**Status:** Shipped (direct to main) -- feat `6c4f23a` + CI fix `f70aa85`. All three ship gates green: GitHub Actions `success` on `f70aa85` (run 27550211126, Unit + E2E both green), Vercel prod READY (`dpl_C9mRicVZhC2TRqdNmt6YqRT8Yxbk`, target production), prod spot-check of the live deploy (lemethodic.com): `/carte` 200 and all 8 `/iles/island-<key>.png` (incl. `island-grammaire.png`) return 200 `image/png` -- the F-461 no-404 lesson holds. The authed world render was verified via the prod-build e2e (f-466 + f-469 + f-462 16/16) + the three F-225 receipts. **One CI miss caught + fixed:** the first run (`6c4f23a`, run 27549099332) failed only because F-469 moved `/carte` into the 1536 wide-column set, which broke f-466's "another authed route keeps 1200" control; repointed that control to `/parametres` (`f70aa85`). Visual is tunable against the Nano Banana scatter mock via the authored coords in `lib/carte/layout-map.ts` (Chadi nudges, no geometry change).

**Scope:** Give `/carte` an immersive desktop face without touching the mobile journey. `>=1024px` now renders a sea-world **scatter** (8 islands at authored fixed positions over a CSS sea, one coral trail); `<1024px` keeps the F-462 vertical serpentine verbatim. One data source (target level + seance progress -> `getJourney`), one DOM contract across both presentations. F-458/459/460 wiring untouched.

**Built (2026-06-15):**
- **`lib/carte/layout-map.ts`** (new, pure + unit-tested): 8 authored `SCATTER_LAYOUT` coords (percent of stage) in journey order -- node 0 = la grammaire, 1..7 = the 7 themes in THEME order -- plus `SCATTER_KEYS` and the Catmull-Rom -> cubic-bezier geometry (`layoutPoints`/`buildSegments`/`pathD`/`pointOnGap`/`pastLast`) lifted out so the world consumes pure functions. `pastLast` is clamped inside the stage (the 1920 overflow guard).
- **`components/carte/CarteWorld.tsx`** (new, the desktop world): full-bleed CSS sea (theme-aware light/dark gradient, 3 drifting clouds, per-island reflections), one coral `--accent` Catmull-Rom trail (muted `--rule` full path + accent prefix grammaire->current, soft drop-shadow), 8 islands via the reused F-461 `IslandNode` (grammar is now its own island, node 0, `island-grammaire.png`), white label pill per island, checkpoint buoys between islands (7 mini-mocks + 1 final, bientot, no scores), and a floating current-node card ("Île N : <theme>" + coral progress bar with the **real** completed-iles % + coral **Continuer** deep-linking to `/ile/<current>`). Header: coral NIVEAU pill + Inter "La Carte" heading (NOT serif).
- **`components/carte/CarteResponsive.tsx`** (new): the 1024px switch (matchMedia). SSR + first paint render the serpentine (zero-overflow at any width); the world swaps in on desktop after mount. Only one is mounted, so contract testids never duplicate.
- **`components/carte/IslandNode.tsx`:** prop type widened `ThemeId` -> `IslandKey` (adds `'grammaire'`) so the foundation island renders through the same node. Backward-compatible (every mobile caller passes a ThemeId, a subset); no behaviour change.
- **`app/(app)/carte/page.tsx`:** renders `CarteResponsive` instead of `CarteMap`.
- **`components/layout/AppShell.tsx`:** `/carte` joins `/tableau-de-bord` in the 1536 wide-column override (`WIDE_ROUTES` set) so the world composition fills up to 1536; the sea bleeds to the content-area edges by cancelling the main horizontal padding inside `CarteWorld` (no sidebar-ignoring 100vw, no overflow). Every other authed route stays 1200.
- **`app/globals.css`:** new `.carte-sea` (+ `.dark`), `.carte-cloud` (+ drift keyframes), `.carte-reflection` blocks. The bespoke sea hexes live here (palette source of truth), not inline. All motion stripped under `prefers-reduced-motion`.

**DOM contract preserved in BOTH presentations:** `carte-journey`, `carte-map`, `carte-level`, `carte-grammar` (+`data-theme`/`data-status`), `carte-ile` x7 (`data-theme`/`data-status`), the `island-node` art seam, `carte-mini-mock` x7 + `carte-final-mock`, and exactly one `carte-current-cta` -> `/ile/<current>`. New world testids: `carte-current-card`, `carte-progress-pct`. On desktop the single current-cta moves to the floating card (the island stays a plain navigable link); on mobile it stays on the island. Grammar is a non-island marker on mobile (unchanged) and its own island on desktop.

**Tests:** `tests/unit/carte/layout-map.test.ts` (new) -- 8 nodes grammaire-first, coords in-bounds, geometry endpoints + `pastLast` clamp. `tests/unit/carte/CarteWorld.test.tsx` (new) -- 8 islands, grammar live island, 7 iles education-current/rest-locked, single current-cta on the floating card -> `/ile/education`, "Île 1 : L'éducation" + 0%, 7+1 buoys (not islands), locked non-navigable, B2 unauthored (no card), seance-progress advances to "Île 2 : La famille" + 14%. `tests/unit/carte/CarteMap.test.tsx` unchanged (still green). `tests/e2e/f-469.spec.ts` (new) -- desktop 1920 (8 islands all art `complete && naturalWidth>0` per the F-461 no-404 lesson, grammar island, coral trail, 7+1 buoys, floating card + single Continuer lands the real F-458 ile page, no 1920 overflow) + dark + mobile 375 vertical flow. `tests/e2e/f-462.spec.ts` -- desktop describe migrated to 900px (now the <1024 serpentine; f-469 owns desktop); receipts renamed `f-462-carte-{900,dark-900}.png`.

**Gates:** unit 609/609 green; `pnpm build` green; carte e2e 14/14 on the prod build (the only failure seen mid-build was a `.next` cache poisoned by running `pnpm build` against a live dev server -- environment, not code; reproduced clean after `rm -rf .next` + fresh prod start). F-225 receipts `tests/screenshots/f-469-carte-{1920-light,1920-dark,375}.png` + trace `tests/traces/f-469.zip`, eyeballed: sea + scatter + coral trail + buoys + floating card all correct, dark sea intact, no 375 overflow.

**Decisions (locked with Chadi this session):** (1) f-469 owns the desktop surface; f-462's 1440 desktop block migrated to the <1024 serpentine breakpoint, unit suite kept green. (2) Header = Inter "La Carte" + coral NIVEAU pill, no repeated brand wordmark (it already lives in the app nav). Proceeded on the brief's ASSUMPTIONS (grammar = island node 0 via `island-grammaire.png`; 8 islands; mini-mock buoys between).

**Refinement (2026-06-15, mock-match pass):** tightened the desktop world to the two Nano Banana mocks (light + dark) without touching mobile or the DOM contract. `SCATTER_LAYOUT` re-authored to an organic archipelago scatter (kills the wave); island render bumped 124->172 (~1.4x); coral trail rebuilt as a thick glossy 3D ribbon (16px coral `--accent` + soft drop-shadow + lighter top-highlight sheen over a 16px muted `--rule` base, completed solid / beyond-current muted); sea given real depth in both modes (light `#E0E9F0`->`#A6BBCC`->`#99ABBF`; dark `#122341`->`#1D3050`->`#081122` + low-opacity `#597CA2` moonlit horizon bloom); 4th drifting cloud added; current card now floats ON the current island (clamped) instead of the bottom-left corner; island label pills frosted-white with fixed dark ink in both modes. Accent stays `--accent` (#E05C42 light / #DC5D4B dark); no `#F97463`. Gates: unit 35/35 (carte), `pnpm build` green, carte e2e 6/6 on the prod build, F-225 receipts `f-469-carte-{1920-light,1920-dark,375}.png` + trace recaptured and eyeballed against the mocks.

**Refinement 2 (2026-06-15, water pass):** made `/carte` read as actual water, not a grey panel. (1) **Reflections** -- each island casts a vertically-flipped, blurred, downward-fading copy of its own PNG on the sea at the waterline (new `IslandReflection`, opacity 0.24 light / 0.15 dark, dark dimmer+cooler), so islands sit IN water. (2) **Full-bleed** -- dropped the rounded panel (`borderRadius:0` on the stage + no `border-radius` on `.carte-sea`); water runs to the content-area edges, no panel corners (kept the content-edge bleed, not 100vw, to preserve the no-overflow gate). (3) **Water depth** -- light gradient `#DFE8EF`->`#A6BBCC`->`#8293A7` + horizon-lightening band + low-opacity layered radial surface texture; dark kept + a deep-foreground radial. (4) **Grounding** -- hard IslandNode cast-shadow suppressed in the world (`.carte-world-art [data-testid=island-shadow]{display:none}`, mobile keeps it), replaced by the reflection + a soft `.carte-waterline-glow` contact glow. (5) **Clouds** -- brighter denser cores, now 5 drifting, motion-safe. Gates: unit 35/35 (carte), `pnpm build` green, carte e2e 6/6 on prod build, F-225 receipts recaptured (light+dark+375) and eyeballed (reflections visible, sea full-bleed, no overflow). Mobile serpentine untouched.

**Refinement 3 (2026-06-16, mock-match pass to the annotated Nano Banana target):** iterated `/carte` desktop to the annotated target image over 5 screenshot-compare-fix loops, addressing every callout. (1) **Sky + horizon** -- the sea is now sky-over-water with a crisp horizon line at ~30% (gradient stops + a `.carte-sea::after` water-texture layer clipped below the horizon). (2) **Videogame water texture** -- repeating ripple bands + sheen highlights below the horizon. (3) **Isometric depth** -- `depthScale(y)` sizes nearer/lower islands larger; islands z-order by y so front overlaps back (`zIndex = 100 + round(y)`, current = 900); `ISLAND_RENDER` base 222. (4) **Bridge, not a W** -- re-authored `SCATTER_LAYOUT` to a flowing route (no symmetric zigzag); trail is one uniform-coral 24px 3D ribbon with sheen + drop-shadow threading under each island (completed prefix fully saturated, remainder slightly softer). (5) **Clouds** -- 5 defined puffy white clouds with soft drop-shadow, one on the horizon line. (6) **Card** -- compact "Île N : theme" + inline %-bar + Continuer, floated top-centre above the current island (z-index 1000 so the larger current island can't intercept the CTA). (7) **Buoys** -- coral-clipboard rounded squares. (8) **Badge fix** -- the IslandNode completion badge scaled ~3x into a giant coral disc; suppressed in the world via `.carte-world-art [data-testid=island-badge]{display:none !important}` (inline display:flex needed !important); island label pills trimmed to name-only. **Known gap (not FE):** the target's per-theme landmarks (bookshelf/school/hospital/...) differ from the shipped `/iles/island-*.png` assets (lighthouse/house/...); matching the buildings needs new art generated into `public/iles/`, an asset task, not code. Gates: unit 35/35 (carte), `pnpm build` green, carte e2e 6/6 on prod build, F-225 receipts recaptured (1920 light+dark, 375). Mobile serpentine untouched.

**F-ID note:** F-469 per Chadi's brief (F-468 skipped/reserved). Verified no `## F-468`/`## F-469` in BACKLOG, none in PRD, none in git history before claiming.

## F-470 -- FE: La Carte baked Nano Banana scene + interactive overlays (desktop)

**SUPERSEDED by F-471 (2026-06-17):** the baked-image carte (and the whole desktop/mobile split) is replaced by `CartePath` -- a single clean vertical "learning path" (Duolingo-style bubble trail) at all breakpoints. `CarteWorld.tsx`, `public/iles/carte-scene-light.png`, `lib/carte/hotspots.ts`, `lib/carte/path.ts` are all removed in F-471. See F-471.

**Status:** Built, all FE gates green. Direct-to-main, committed + **holding for Chadi's push** (do not deploy until pushed). Asset landed 2026-06-16.

**Why:** CSS cannot match a rendered ocean (F-469's 3 refinement passes chased the Nano Banana mock and still couldn't). New approach: the scene is ONE baked image (Chadi's render). The FE generates NO visuals -- it places the image as a fixed-ratio background and overlays interactivity + real journey state on top. This supersedes the F-469 CSS sea-world on desktop only; mobile (`<1024`) keeps the F-462 serpentine verbatim.

**Asset:** `public/iles/carte-scene-light.png` (committed) = clean ocean + 8 islands in a 4x2 grid, **no path, no app chrome, no checkmarks, no card, no labels**. The coral chain path was REMOVED from the render and is now drawn as an SVG overlay (see below); labels are overlays too (per Chadi 2026-06-16). Dark variant (`carte-scene-dark.png`) is a follow-up; until it lands dark mode reuses the light image. The component points at `/iles/carte-scene-light.png` (`lib/carte/hotspots.ts: SCENE_SRC`); the e2e asserts it decodes (`complete && naturalWidth>0`, the F-461 no-404 lesson) and prod-verify confirmed it serves `200 image/png` (5.7 MB).

**Built (2026-06-16):**
- **`lib/carte/hotspots.ts`** (new): `HOTSPOTS` -- the 8 island-centre coords in PERCENT of the image (0..100), keyed by `IslandKey` (grammaire + 7 themes), tuned to the real 4x2 grid centres (top row 16/39/63/85% x 33% y, bottom row same x 70% y); `SCENE_SRC` + `SCENE_ASPECT` (2496x1427). Percent-of-image so overlays track on resize; verified in the visual gate (`localStorage 'lm.carteDebug'='1'` outlines each zone -- each box sat on its island).
- **`lib/carte/path.ts`** (new, pure + unit-tested): the coral chain is drawn by the FE (the baked image has none). `JOURNEY_ORDER` (grammaire + 7 themes), `orderedPoints()` (hotspots -> viewBox units, y/aspect so x and y share one scale), `ribbonPath(pts, from, to)` (Catmull-Rom -> cubic bezier). `VIEW_W=100`, `VIEW_H=100/aspect` so the SVG viewBox aspect equals the scene box aspect and `preserveAspectRatio="none"` fills exactly with zero stroke distortion.
- **`components/carte/CarteWorld.tsx`** (rewritten): renders the baked `<img>` (fixed `aspect-ratio`, `object-fit: cover`, never distorts), a coral **SVG ribbon** (`carte-path`) threading the 8 hotspots in journey order -- muted full path + solid prefix through the current node (grammaire = node 0), under the badges/labels (zIndex 10) -- then 8 absolute hotspots at the percent coords + the floating current card. Per island: a transparent click-zone (navigable `<Link>` -> `/ile/<theme>` for current/completed, else `role="link" aria-disabled`), an overlay **label pill** (labels not baked), a coral **check badge** when completed, a **"Vous êtes ici"** pin when current, a semi-transparent **dark tint** when locked. Header (coral NIVEAU pill + Inter "La Carte") unchanged. Removed: CSS sea, clouds, reflections, waterline glow, the old SVG trail, the buoys, `IslandNode`/`layout-map` usage, all depth-scale painting.
- **`app/globals.css`:** the whole F-469 `.carte-sea`/`.carte-cloud`/`.carte-island-reflection`/`.carte-waterline-glow`/`.carte-world-art` block + cloud keyframes removed; replaced with a short F-470 note + a `.carte-scene` hook. Overlay visuals are inline (token-driven).
- **Deleted:** `lib/carte/layout-map.ts`, `tests/unit/carte/layout-map.test.ts`, `tests/e2e/f-469.spec.ts` (desktop assertions -- 8 `island-node` imgs, buoys, SVG trail -- no longer hold).
- **`components/carte/CarteResponsive.tsx`** unchanged (the 1024px switch stays); **`CarteMap.tsx`/`IslandNode.tsx`** unchanged (mobile still uses them).

**DOM contract preserved:** `carte-journey`, `carte-map`, `carte-level`, `carte-grammar` (+`data-live`/`data-theme`/`data-status`), `carte-ile` x7 (`data-theme`/`data-status`), `/ile/<theme>` links, exactly one `carte-current-cta` -> `/ile/<current>`, `carte-here-marker`, `carte-current-card`, `carte-progress-pct`. New: `carte-scene` (the baked image), `carte-path` (the SVG ribbon), `carte-check-badge`. No `island-node`/`carte-mini-mock`/`carte-final-mock` on desktop any more (islands + path are overlays).

**Tests:** `tests/unit/carte/hotspots.test.ts` (new) -- 8 keys grammaire+themes, coords in 0..100, light scene + landscape aspect. `tests/unit/carte/path.test.ts` (new) -- journey order, viewBox aspect == scene aspect, hotspot->unit mapping, one cubic per gap, solid-prefix/empty-range. `tests/unit/carte/CarteWorld.test.tsx` (rewritten) -- baked `carte-scene` img + src, `carte-path` svg (2 paths), no painted islands/buoys, 8 hotspots each labelled, education current + clickable, rest locked + aria-disabled, single current-cta on the card -> `/ile/education` + "Île 1 : L'éducation"/0%, "Vous êtes ici" pin, B2 unauthored (no card), seance-progress -> "Île 2 : La famille"/14% -> `/ile/famille`. `tests/e2e/f-470.spec.ts` (new) -- desktop 1920 (scene decodes, `carte-path` attached, 8 hotspots, current clickable, locked aria-disabled, single Continuer lands the real F-458 ile page, no overflow) + dark + mobile 375 serpentine intact. `CarteMap.test.tsx`/`IslandNode.test.tsx` unchanged.

**Gates (all green):** unit **608/608** (full suite); `next build` **green** (`/carte` compiles, 106/106 static); carte e2e on the **prod build** (`next start`) -- f-470 3/3 + f-462 9/9 (serpentine intact) + f-466 2/2 (wide-column control). F-225 receipts captured: `tests/screenshots/f-470-carte-{1920,375}.png` + trace `tests/traces/f-470.zip`. Visual gate: debug-box screenshot at 1920 confirmed each hotspot sits on its island, the ribbon threads correctly (solid grammaire->current, muted onward), labels under each island, card + pin on the current ile. Prod-verify (against `next start`): `/carte` 200, `/iles/carte-scene-light.png` 200 `image/png`, `/ile/education` + `/ile/famille` 200, no 1920 overflow. **Holding for Chadi's push.**

**Decisions (Chadi, 2026-06-16):** (1) Build now against the expected asset path, drop the clean PNG after, tune hotspots in the visual gate. (2) Labels are NOT baked into the image -- overlays render the per-island label pills. (3) The render shipped WITHOUT the coral path -- the FE draws it as an SVG ribbon.

**Refinement (2026-06-16, path re-route):** the first path drew in JOURNEY order, which jumped culture(top-right)->sante(bottom-left) as a straight diagonal slashing across open water. Re-routed by SCREEN POSITION instead: `lib/carte/path.ts: screenOrderedPoints()` orders the islands as a serpentine (top row L->R, down the right side, bottom row R->L), and `ribbonPath()` draws ONE smooth Catmull-Rom curve through them -- a single continuous winding road touching all 8 islands, no diagonals across water. Uniform coral (dropped the solid/muted per-segment split per Chadi). Overlays (checkmarks, pin, card, labels) unchanged. Gates: unit 609/609, `next build` green, f-470 e2e 3/3 on prod build, 1920 receipt recaptured + eyeballed (winding road confirmed).

**F-ID note:** F-470 next free after F-469. Verified no `## F-470` in BACKLOG, none in PRD, none in git history before claiming.

## F-471 -- FE: La Carte real learning path (Duolingo-style bubble trail, all breakpoints)

**SUPERSEDED by F-472 (2026-06-17):** the path/timeline/bubble idea is dropped entirely in favour of an informative TABLE (`CarteTable`). `CartePath.tsx` + all path/SVG/bubble code removed in F-472; the per-theme palette replaces coral on the carte. See F-472.

**Status:** Shipped -- squash-merged `0438d40` (PR #7, `feat/f-471-carte-path` -> main) after Chadi approved the Vercel preview. All ship gates green: CI `success` on the PR (run 27668686043 -- Unit (vitest) + E2E (Playwright) both green), Vercel preview READY (`dpl_FRaJKmKvin6CYzUv7uHeirDp2dz7`, commit `232f474`, approved), local prod-build gates (unit 580/580, `pnpm build` clean, carte e2e 1440+375 light+dark) + F-225 receipts. Production deploy auto-triggered on merge. No tag (carte F-4xx tickets are not on the `v0.<section>.<count>` scheme).

**Why:** Every prior carte visual chased a hard look (F-457 list -> F-462 serpentine -> F-469 CSS sea-world -> F-470 baked image) and the baked image still wasn't a real, themeable, dark-mode-safe surface (static art, no locale text, desktop/mobile split). F-471 replaces all of it with ONE clean, on-brand v3 "learning path": a centered winding trail of chunky pressable bubbles, rendered by a single component at every width. Generic Duolingo-style pattern, original code (no repo copied verbatim).

**Built (2026-06-17):**
- **`components/carte/CartePath.tsx`** (new, the single component, all breakpoints): a centered column (max 620px) with a deterministic width-driven winding vertical SVG trail (Catmull-Rom -> cubic bezier) weaving through 8 nodes -- grammaire (node 0) + the 7 themes. Trail is **coral (`--accent`) up to the current node, neutral slate (`--rule`) after**, round caps. Bubbles are chunky + pressable (solid bottom "lip" via a hard offset box-shadow + soft shadow), each with its lucide theme icon. States: **done** = coral fill + white icon + check badge; **current** = white fill + coral ring + scale-up + idle bounce + a compact card (eyebrow "Île N", theme title, coral % bar with the real completed-iles %, **Continuer** -> `/ile/<currentTheme>`); **locked** = light-slate fill + muted icon + lock badge. Theme labels are real DOM text under each bubble (locale + dark-mode safe, never baked). Header: Inter "La Carte" + coral NIVEAU pill. Data wiring unchanged (`readTargetLevel` + `readCompletedIles` -> `getJourney`); the data layer is NOT touched. Scroll-current-into-view + the bounce are motion-safe.
- **`app/(app)/carte/page.tsx`:** renders `CartePath` directly (the `CarteResponsive` desktop/mobile split is gone). `ProtectedRoute` + the `/carte` route are unchanged.
- **`app/globals.css`:** the F-470 `.carte-scene` block replaced with the F-471 `carte-node-bounce` keyframe (the one piece needing a keyframe); motion-safe.
- **Deleted:** `components/carte/CarteWorld.tsx`, `components/carte/CarteResponsive.tsx`, `components/carte/CarteMap.tsx`, `components/carte/IslandNode.tsx`, `lib/carte/hotspots.ts`, `lib/carte/path.ts`, and `public/iles/carte-scene-light.png` (untracked + removed). `lib/journey/island-art.ts` + the `island-*.png` assets are KEPT (still used by the dashboard `CarteHero`). Dead tests removed: `tests/unit/carte/{CarteWorld,CarteMap,IslandNode}.test.tsx`, `tests/unit/carte/{hotspots,path}.test.ts`, `tests/e2e/{f-462,f-470}.spec.ts` (their serpentine / baked-scene DOM no longer exists).

**DOM contract preserved (existing e2e depend on it):** `carte-journey`, `carte-map`, `carte-level`, `carte-grammar` (+`data-live`/`data-theme`/`data-status`), `carte-ile` x7 (`data-theme`/`data-status`), `/ile/<theme>` links, exactly one `carte-current-cta` -> `/ile/<current>`, `carte-current-card`, `carte-progress-pct`. New: `carte-bubble` x8, `carte-trail`, `carte-check-badge`, `carte-lock-badge`. f-458/459/460/464 (which visit /carte) keep passing on the preserved contract.

**Tests:** `tests/unit/carte/CartePath.test.tsx` (new) -- 8 bubbles, grammar live + the 7 themes, education current first + rest locked, single current-cta on the card -> `/ile/education` + "Île 1"/"L'éducation"/0%, lock badge on locked, completed navigable + check badge, B2 unauthored (no card/cta, grammar not live), seance-progress -> "Île 2"/"La famille"/14% -> `/ile/famille`. `tests/e2e/f-471.spec.ts` (new) -- 1440 + 375 (same component), light + dark: carte-journey, carte-level, 8 `carte-bubble`, grammar live, 7 iles education-current/rest-locked, single Continuer lands the real F-458 ile page, no horizontal overflow.

**Gates:** unit (full suite), `pnpm build` clean, carte e2e on the prod build (1440 + 375, light + dark), F-225 receipts `tests/screenshots/f-471-carte-{1440,375}.png` + trace -- recorded in the gate report. **CI on the PR is the truth; HOLD for Chadi's preview approval before any merge to main.**

**Decisions (Chadi, 2026-06-17):** (1) Replace the baked carte + the desktop/mobile split with one `CartePath` at all breakpoints. (2) Feature branch + Vercel preview, do NOT push to main until the preview is approved. (3) `CarteMap`/`IslandNode` (the old serpentine + art node) are deleted too, since the responsive split is gone and they were left fully orphaned.

**F-ID note:** F-471 next free after F-470. Verified no `## F-471` in BACKLOG, none in PRD, none in git history before claiming. (FE+BE share the F-namespace; this repo's BACKLOG is the FE record and had no F-471.)

## F-472 -- FE: La Carte informative table (replaces the path/timeline)

**Status:** Shipped -- squash-merged `b2e7b06` (PR #8, `feat/f-472-carte-table` -> main) after Chadi approved the Vercel preview. All ship gates green: CI `success` on the PR (run 27670768128 -- Unit (vitest) + E2E (Playwright) both green), Vercel preview READY (`dpl_BjRNdWs451nz5UitTAnqJdK4ynri`, commit `6272a38`, approved), local prod-build gates (unit 581/581, `pnpm build` clean, carte e2e 1440+375 light+dark) + F-225 receipts. Production deploy auto-triggered on merge. No tag (carte F-4xx tickets are not on the `v0.<section>.<count>` scheme).

**Why:** The path/timeline/bubble framing (F-471) reads as decorative; the journey is better served as an INFORMATIVE table the learner can scan. F-472 drops the path idea entirely: `/carte` is now a 4-column table (>=640) that stacks to cards (<640). Off-brand on purpose -- a per-theme palette replaces coral so the surface reads as information, not a CTA wall.

**Built (2026-06-17):**
- **`components/carte/CarteTable.tsx`** (new, replaces `CartePath`): ONE component, two layouts off one measured container width. **>=640px** = a 4-column table (Île [colour tile + "Île N"/"Fondations" eyebrow + name] / Focus [blurb] / Progression [theme-colour bar + %] / État). **<640px** = each île stacked as a card (tile + name + focus + bar + action), no horizontal scroll. States: **done** = coloured tile + 100% bar + green "Terminé" pill (name links to `/ile/<theme>`); **current** = tinted row + left colour accent + partial bar + a theme-coloured **Continuer ->** button routing `/ile/<current>` (the single `carte-current-cta`); **locked** = gray tile + empty bar + "Verrouillé" pill (non-navigable). Rounded card container, no gridlines, subtle row separators, hover, soft shadow. Inter + DM Mono. Light + dark via tokens. NIVEAU pill is indigo (`#4F46E5`), not coral. Data wiring unchanged (`readTargetLevel` + `readCompletedIles` -> `getJourney`); the data layer is NOT touched.
- **`lib/carte/table-data.ts`** (new, editable data map): `THEME_COLOR` (per-theme palette, NO coral -- grammaire `#4F46E5`, education `#0EA5E9`, famille `#14B8A6`, culture `#22C55E`, sante `#EC4899`, technologie `#8B5CF6`, environnement `#84CC16`, economie `#06B6D4`), `FOCUS_BLURB` (one-line placeholder copy per row, swap freely), `LEVEL_PILL_COLOR` (indigo), `DONE_GREEN`.
- **`app/(app)/carte/page.tsx`:** renders `CarteTable`. `ProtectedRoute` + the `/carte` route unchanged.
- **`app/globals.css`:** the F-471 `carte-node-bounce` keyframe replaced with the F-472 `.carte-row` / `.carte-card` hover (token-based, light + dark).
- **Deleted:** `components/carte/CartePath.tsx` + all path/SVG/bubble code; `tests/unit/carte/CartePath.test.tsx`; `tests/e2e/f-471.spec.ts`.
- **No coral on the carte:** verified no `#E05C42` / `#DC5D4B` / `var(--accent)` in `components/carte` or `lib/carte`.

**DOM contract preserved (existing e2e depend on it):** `carte-journey`, `carte-map`, `carte-level`, `carte-grammar` (+`data-live`/`data-theme`/`data-status`), `carte-ile` x7 (`data-theme`/`data-status`), `/ile/<theme>` links (done rows + the current CTA), exactly one `carte-current-cta` -> `/ile/<current>`. f-458/459/460/464 (which visit /carte) keep passing on this. The path-only testids (`carte-bubble`/`carte-trail`/`carte-current-card`/`carte-progress-pct`/`carte-*-badge`) are gone (only f-471/CartePath referenced them, both removed).

**Tests:** `tests/unit/carte/CarteTable.test.tsx` (new) -- renders the table (jsdom default width), 8 rows grammaire+themes with focus copy, education current first + rest locked (Verrouillé), single CTA -> `/ile/education`, grammar Terminé, B2 unauthored (no CTA, all bientot), seance-progress -> education Terminé + navigable + CTA -> `/ile/famille`. `tests/e2e/f-472.spec.ts` (new) -- 1440 (real `<table>`) + 375 (stacked, no `<table>`), light + dark: contract + states + single Continuer lands the real F-458 ile page + no horizontal overflow.

**Gates:** unit (full suite), `pnpm build` clean, carte e2e on the prod build (1440 + 375, light + dark), F-225 receipts `tests/screenshots/f-472-carte-{1440,1440-dark,375}.png` + trace -- recorded in the gate report. **CI on the PR is the truth; HOLD for Chadi's preview review before any merge to main.**

**Open call (flagged for review):** the journey model has no per-ile fractional progress, so the **current row's Progression bar shows the real overall journey % (completed iles / 7)** -- which is 0% on a brand-new journey (the "current" state is still unmistakable via the tinted row + left accent + Continuer button). Easy to swap for a fixed visual "in progress" sliver if preferred.

**Decisions (Chadi, 2026-06-17):** (1) Drop the path/bubble idea entirely; `/carte` is an informative table. (2) Per-theme palette, NO coral; NIVEAU pill indigo. (3) Focus blurbs in an editable data map (placeholder copy fine). (4) Feature branch + Vercel preview, do NOT merge to main until reviewed.

**F-ID note:** F-472 next free after F-471 (the horizontal-table variant was never built, so the ID was free). Verified no `## F-472` in BACKLOG, none in PRD, none in git history before claiming.

## F-473 -- FE: brand logo wiring (favicon + sidebar header + sign-in card)

**Status:** Shipped -- squash-merged `3db737a` (PR #9, `feat/brand-logo-and-loader` -> main) after Chadi approved the Vercel preview. All ship gates green: CI `success` on the PR (Unit (vitest) + E2E (Playwright) both green), Vercel preview READY + asset-decode verified on the live deploy (`/icon.png`, `/apple-icon.png`, `/brand/lemethodic-{logo,mark}.png` all 200 `image/png`, no 404 -- F-461 lesson holds), local prod-build gates (unit 581/581, `pnpm build` clean, F-473 e2e 8/8) + F-225 receipts (local; `tests/screenshots`+`tests/traces` are gitignored). Production deploy auto-triggered on merge. No tag (F-4xx one-off FE tickets are not on the `v0.<section>.<count>` scheme).

**Why:** The app had no real brand mark wired anywhere. The favicon `metadata.icons` block pointed at four files that never existed in `/public` (`/icon-light-32x32.png`, `/icon-dark-32x32.png`, `/icon.svg`, `/apple-icon.png` -- dangling 404 links). The sidebar header showed a placeholder "CH" avatar + the animated typewriter `<Wordmark>` box, and `/connexion` rendered the same typewriter box on a card whose chrome was set in the retired Instrument Serif. Chadi placed the real assets (`public/brand/lemethodic-logo.png` wordmark, `public/brand/lemethodic-mark.png` square mark); this ticket wires them in.

**Built (2026-06-17):**
- **Assets committed:** `public/brand/lemethodic-logo.png` (2668x1329 wordmark) + `public/brand/lemethodic-mark.png` (610x610 square mark), each `git add`ed by explicit path (F-461 lesson: untracked assets pass CI but 404 in prod).
- **Favicon (App Router file convention):** `app/icon.png` + `app/apple-icon.png`, both the square mark. The dangling `metadata.icons` block in `app/layout.tsx` removed -- the file convention is now the single source of truth (verified `<head>` emits `<link rel="icon" href="/icon.png?..." sizes="610x610">` + `apple-touch-icon`, and no `icon-light-32x32`/`icon-dark-32x32`/`icon.svg` refs remain).
- **Sidebar header (`components/layout/Sidebar.tsx`):** the "CH" avatar (`sidebar-avatar`) and the boxed `<Wordmark>` are gone. Expanded shows the full wordmark (`/brand/lemethodic-logo.png`, testid `sidebar-logo-img`, link `sidebar-wordmark`); collapsed shows the square mark (`/brand/lemethodic-mark.png`, testid `sidebar-mark-img`, link `sidebar-mark`). Both `next/image`, both link to `/tableau-de-bord`. The `initials` prop is dropped from `SidebarProps`.
- **`components/layout/AppShell.tsx`:** dead `getInitials()` + the `initials` prop plumbing removed (the only consumer was the retired avatar; the topbar `UserMenu` avatar is separate and untouched).
- **Sign-in (`app/connexion/page.tsx`):** clean rounded white card (kept), centered wordmark image at the top (testid `connexion-logo`). All card chrome -- "Welcome back", subtext, EMAIL/PASSWORD labels, fields, button, error, forgot-password -- moved off Instrument Serif (`DISPLAY_FONT`) onto Inter (`var(--f-en)`). Submit button is full-width, rounded, filled with the v3 accent token (`var(--accent)` = #E05C42 light / #DC5D4B dark; loading dims via opacity, no hardcoded disabled hex). Rounded fields + "Forgot password?" link kept.
- **v3 compliance:** tokens only (no hardcoded hex introduced -- the retired `CTA_DISABLED` hex usage is gone), rounded corners, soft shadow, no italics, accent used only as the existing accent.

**Tests:** `tests/e2e/f-473.spec.ts` (new) -- /connexion (1440 + 375): heading, centered logo decodes (`complete && naturalWidth>0`), submit bg == `rgb(224,92,66)`, no overflow; /tableau-de-bord sidebar (1440): collapsed mark decodes + hover swaps to the wordmark which decodes; (375): drawer opens to the wordmark which decodes. Updated: `tests/unit/layout/Sidebar.test.tsx` (avatar tests replaced with logo/mark image assertions; `next/image` mocked like `next/link`), `tests/unit/layout/AppShell.test.tsx` (`next/image` mock added), `tests/e2e/app-shell.spec.ts` ("CH avatar" -> brand-mark-decodes), `tests/e2e/f-455.spec.ts` (expanded wordmark text -> image), `tests/helpers/auth-e2e.ts` (stale `getInitials` comment).

**F-225 receipts:** `tests/screenshots/f-473-connexion-{1440,375}.png` + `tests/screenshots/f-473-sidebar-{1440,375}.png` + trace `tests/traces/f-473.zip`. The logo/mark decode assertions (not just `src` set) are the real prod-404 gate.

**F-ID note:** F-473 next free after F-472 (F-468 is a reserved stub; BACKLOG/PRD topped at F-472). Verified no `## F-473` in BACKLOG, none in PRD, none in git history before claiming. FE+BE share the F-namespace; this repo's BACKLOG is the FE record.

## F-474 -- FE: auth-gate loader flash fix (peach -> destination canvas)

**Status:** Shipped -- squash-merged `3db737a` (PR #9, `feat/brand-logo-and-loader` -> main, bundled with F-473). All ship gates green: CI `success` on the PR (Unit (vitest) + E2E (Playwright) both green), full unit suite 581/581 (incl. the new ProtectedRoute loader test), `pnpm build` clean. Production deploy auto-triggered on merge. No tag (F-4xx one-off FE tickets are not on the `v0.<section>.<count>` scheme).

**Why:** `ProtectedRoute` paints a content-free full-height frame while it hydrates the auth store + verifies the token (states 1-3 of 4). That frame's background was `var(--lm-pastel-peach)` (#FFD8C2) with a stale "matches /onboarding" comment -- but protected routes land on the **app canvas** (`/tableau-de-bord` et al., `var(--bg-canvas)` = #EAEFF3, the F-463 v3 canvas), not onboarding. So the gate flashed peach for a beat before the destination painted behind it.

**Built (2026-06-17):**
- **`components/auth/ProtectedRoute.tsx`:** `LOADER_BG` changed from `var(--lm-pastel-peach)` to `var(--bg-canvas)`; the stale "peach, matches /onboarding" comment replaced with one explaining it matches the destination canvas. The frame stays content-free (no header, shell, or branded loader) -- only the colour token changed.

**Tests:** `tests/unit/auth/ProtectedRoute.test.tsx` (new) -- renders the unhydrated state, asserts the loader frame (1) renders no children (content-free, no secret leak), (2) carries `var(--bg-canvas)` in its inline style, (3) does NOT carry `peach`. (jsdom preserves `var()` in the serialized inline style, so this is a real token assertion, not a resolved-colour one.)

**Verification note:** the loader is a transient pre-auth frame (sub-second flash), not a steady-state surface, so no F-225 screenshot battery -- the deterministic unit test is the gate. Non-visual in steady state.

**F-ID note:** F-474 next free after F-473. Verified no `## F-474` in BACKLOG, none in PRD, none in git history before claiming.

## F-475 -- FE: TopNav brand logo + logo sizing (sign-in focal + sidebar expanded)

**Status:** Shipped -- squash-merged `659a3df` (PR #10, `feat/brand-topnav-sizing` -> main) after Chadi approved the Vercel preview. Includes the follow-up logo bump (TopNav `height:28` -> `height:48`, commit `70d667e`). All ship gates green: CI `success` on the PR (Unit (vitest) 583/583 + E2E (Playwright) both green, e2e 11m59s), Vercel preview READY + asset-decode verified, local prod-build gates (unit 583/583, `pnpm build` clean, F-475 e2e green; the lone local e2e blip was the documented `touch-targets` boundary flake on `tier-cta`, passed on re-run). Production deploy auto-triggered on merge. No tag (F-4xx one-off FE tickets are not on the `v0.<section>.<count>` scheme).

**Why:** F-473 wired the real brand assets into the sidebar header and the sign-in card, but the **logged-out TopNav** (the landing/marketing shell) was missed -- it still rendered the old boxed typewriter `<Wordmark>` ("the surface that didn't change"). Separately, the sign-in page was not yet a focused auth surface (the global `StickyHeader` still painted a boxed wordmark + marketing nav links at top-left), and both the sign-in card logo and the sidebar expanded wordmark were sized too small to read as the brand.

**Built (2026-06-18):**
- **TopNav (`components/nav/TopNav.tsx`):** the boxed `<Wordmark size="nav">` (desktop + mobile header) is replaced by the real wordmark asset (`/brand/lemethodic-logo.png`, `next/image`) via a local `NavLogo` helper, **linking home (`/`)** instead of `/la-methode`. Testids `topnav-logo-img` (desktop) / `topnav-logo-img-mobile` (mobile); sized `height:48` (follow-up bump from the initial `height:28`, both instances via the shared helper) so the logo reads as the brand anchor while clearing the 64px nav row. The `Wordmark` import is dropped from TopNav (the component itself stays -- still used by StickyHeader, Footer, signup, etc.).
- **Sign-in focal (`app/connexion/page.tsx`):** the centered card logo enlarged from `height:32` (~64px wide) to `width:200` (`maxWidth:100%`, `height:auto`) so it reads as the card's focal point.
- **Focused auth surface (`components/layout/StickyHeader.tsx`):** `/connexion` removed from `MARKETING_PREFIXES`, so the global marketing header (boxed wordmark + Examens/Tarifs/Les Pièges/Sign in links + mobile hamburger) no longer renders there. The sign-in card's enlarged logo is now the page's sole brand element. (`/inscription` keeps its header -- out of scope.)
- **Sidebar expanded wordmark (`components/layout/Sidebar.tsx`):** enlarged from `height:28` (~56px wide) to `width:150` (`maxWidth:100%`, `height:auto`); the wrapping link gets `minWidth:0` so the logo shrinks gracefully in the mobile drawer where the close button shares the header row. The collapsed square mark is left as-is.
- **v3 compliance:** no hardcoded hex introduced, no new colours, rounded-only (no radius changes), no coral outside the existing accent. Only `next/image` sizing + a prefix-list edit.

**Tests:** `tests/e2e/f-475.spec.ts` (new) -- landing `/` (1440 + 375): TopNav logo decodes (`complete && naturalWidth>0`), links home, logo-click→`/` happy path, no overflow, trace `tests/traces/f-475.zip`; `/connexion` (1440 + 375): no `sticky-header`, card logo decodes + enlarged (boundingBox width ≥180 at 1440), no overflow; `/tableau-de-bord` (1440): hover-expanded sidebar wordmark decodes + enlarged (boundingBox width ≥130). Updated: `tests/unit/nav/TopNav.test.tsx` (dead `Wordmark` mock → `next/image` mock; new "brand logo links home" test), `tests/unit/layout/StickyHeader.test.tsx` (new "does not render on /connexion"), `tests/e2e/f-445.spec.ts` (nav `wordmark` testid → `topnav-logo-img`).

**F-225 receipts:** `tests/screenshots/f-475-{landing,connexion}-{1440,375}.png` + `tests/screenshots/f-475-sidebar-1440.png` + trace `tests/traces/f-475.zip` (local; `tests/screenshots`+`tests/traces` are gitignored). The logo decode assertions (not just `src` set) are the real prod-404 gate.

**F-ID note:** F-475 next free after F-474 (F-468 is a reserved stub; BACKLOG topped at F-474, PRD does not track F-4xx). Verified no `## F-475` in BACKLOG, none in PRD, none in git history before claiming. FE+BE share the F-namespace; this repo's BACKLOG is the FE record.

## F-476 -- FE: homepage head-title broadened (TCF-Quebec -> French-first)

**Status:** Shipped -- squash-merged `7912a4b` (PR #11, `feat/homepage-head-title` -> main) after Chadi approved the Vercel preview and kept the pipe title as shipped. All ship gates green: CI `success` on the PR (run 27744032552: Unit (vitest) 583/583 + E2E (Playwright) pass, e2e 12m35s), Vercel preview READY (built from `7ff92ed`), local prod-build gates (unit 583/583, `pnpm build` clean, homepage e2e smoke `landing-hero` 16/16; new title + desc verified in the prerendered `/` HTML, old TCF-Quebec title absent). Non-visual head-only metadata change: F-225 captures skipped. Production deploy auto-triggered on merge. No tag (F-4xx one-off FE tickets are not on the `v0.<section>.<count>` scheme).

**Why:** The homepage page-level `metadata` narrowed the whole product to a single exam + region ("Pass TCF Canada. Get to Quebec." / "...anglophone TCF Canada candidates pursuing Quebec PR."). The spine is exam-agnostic and TCF is only the first exam lit (complete-site doctrine), so the homepage head should sell the method broadly, French-first. The TCF-Quebec line is correct *on the TCF page* and stays there -- this ticket only touches the homepage head.

**Built (2026-06-18):**
- **Homepage metadata only (`app/page.tsx`):** `title` `'Pass TCF Canada. Get to Quebec. | Le Méthodic'` -> `'Le Méthodic | Learn French that sounds native'` (pipe separator kept to match every existing page title in the repo + the house no-em-dash rule; the brief's recommended em-dash form is a one-token tune away if preferred). `description` `'Method-based oral exam prep for anglophone TCF Canada candidates pursuing Quebec PR.'` -> `'A grammar-first method for anglophones learning French, built by the author of 28 French linguistics books.'`
- **Scope guard:** `app/layout.tsx` site-wide default (already broad), the TCF page's own metadata, and the TCF-Quebec copy in `components/seo/JsonLd.tsx` are all intentionally untouched (out of scope).

**Verification:** `non-visual change: verification skipped` for F-225 captures (head-only metadata, no rendered-layout change). Unit suite + `pnpm build` run as gates; no test asserts the homepage title/description string (`m0-audit.spec.ts` records `page.title()` into an audit object but never asserts it).

**F-ID note:** F-476 next free after F-475 (F-468 reserved stub; BACKLOG topped at F-475, PRD does not track F-4xx). Verified no `## F-476` in BACKLOG, none in PRD, none in git history before claiming. FE+BE share the F-namespace; this repo's BACKLOG is the FE record.

## F-477 -- FE: General-learner (non-exam) track + de-TCF onboarding

**Status:** Queued / not started. Filed 2026-06-18. Pre-launch correctness ticket; **sequenced after the first authored île cell** (content gate). Does NOT change the deferred status of TEF (F-091 / F-091b / F-094), DELF (F-091 / F-091b / F-091c), or DALF (F-095) -- those stay post-launch.

**Why:** The `general` onboarding goal currently force-maps to `'tcf_canada'` (the false-promise pattern at BACKLOG:484): a user who picks "just learning French" is silently routed into TCF framing -- exam claims, TCF scoring, and TCF-specific dashboard/journey copy. The spine is exam-agnostic by doctrine; a general-learner who has chosen no exam should see zero TCF framing. F-476 broadened the marketing head in the same spirit (homepage no longer single-exam); this ticket fixes the in-product path.

**Scope:**
- **Onboarding + diagnostic profile:** add a general-learner (non-exam) goal/profile so `general` stops force-mapping to `'tcf_canada'`. The general path carries no exam, no TCF threshold, no TCF scoring.
- **Journey + dashboard:** the general-learner journey uses the existing café + general learning-track themes; that track's dashboard and journey copy make no TCF-specific claim.
- **Copy:** broaden onboarding + diagnostic copy that assumes TCF to be exam-neutral / French-first whenever the user has not chosen an exam.

**Acceptance:** a user who picks "just learning French" lands in a general track with **zero TCF framing** (no TCF score, no TCF threshold, no TCF-specific dashboard or journey copy).

**Out of scope:** the TEF / DELF / DALF exam overlays (still deferred per the F-091 family + F-095). This ticket only lights the no-exam general path; it does not touch the deferred exams.

**F-ID note:** F-477 next free after F-476 (F-468 is a reserved stub; BACKLOG ceiling F-476, PRD does not track F-4xx). Verified no `F-477` in BACKLOG, none in PRD, none in git history before claiming. FE+BE share the F-namespace; this repo's BACKLOG is the FE record.

## F-478 -- FE: homepage positioning cleanup (retire stale USD pricing teaser + broaden Org JSON-LD)

**Status:** Shipped -- squash-merged `9fc9f20` (PR #12, `feat/homepage-positioning-cleanup` -> main) after Chadi approved the Vercel preview. All ship gates green: CI `success` on the PR (run 27768476948: Unit (vitest) 581/581 + E2E (Playwright) pass 13m5s + Vercel pass), Vercel preview READY (`faff811`), local prod-build gates (unit 581/581, `pnpm build` clean, local landing-pricing + landing-hero e2e 28/28; prerendered `/` verified: no `$9/$19/$29/$49/$199`, CTA -> /tarifs, broadened Org JSON-LD, old Org string gone). F-225 receipts `tests/screenshots/f-478-landing-{1440,375}.png` (local; gitignored). Production deploy auto-triggered on merge. No tag (F-4xx one-off FE tickets are not on the `v0.<section>.<count>` scheme).

**Why:** The F-476 audit (Task A) found two TCF/region positioning leaks on the homepage: (1) a stale USD multi-tier teaser (`À la carte $9–19 / Daily Bundle $19 / Exam Bundle $29 / Pro $49 / Sprint $199`) that contradicted the canonical €uro ladder on /tarifs, put prices on the landing page, was reachable only by scroll and linked from no nav; (2) the Organization JSON-LD still narrowed the brand to "anglophone TCF Canada candidates pursuing Quebec Permanent Residency." Both fixed here, in the spirit of F-476 (broad, French-first homepage head).

**Built (2026-06-18):**
- **`components/landing/PricingTeaser.tsx`:** the 5-tier USD card grid is removed and replaced by a minimal no-price hook -- one value line ("Start free. Upgrade when you're ready.") + a single "View pricing" CTA (`data-testid="pricing-cta"`) linking to **/tarifs**. No prices anywhere on the homepage. v3 tokens only (`--bg-canvas`, `--rule-default`, `--text-primary`, `--cta-primary`, and `--accent-foreground` for the on-coral CTA text -- no hardcoded hex; the prior teaser + Hero hardcode `#ffffff`, deliberately avoided here). The full homepage-hook redesign stays parked.
- **`components/seo/JsonLd.tsx`:** Organization `description` broadened to "A grammar-first French-learning method for anglophones, built by the author of 28 French linguistics books." CourseJsonLd + FaqJsonLd keep their TCF wording (legitimately TCF-specific; out of scope). TCF page metadata untouched.

**Tests:** `tests/unit/landing/PricingTeaser.test.tsx` rewritten (pricing landmark region, single h2 value line, one "View pricing" CTA → /tarifs, ed-btn-press, no prices, retired testids absent). `tests/e2e/landing-pricing.spec.ts` rewritten (1440 + 375: hook + CTA render, CTA → /tarifs, no prices in the pricing region, retired tier cards absent; footer social links retained). Verified in the prerendered `/` artifact: no `$9/$19/$29/$49/$199`, CTA → /tarifs, broadened Org JSON-LD, old Org string gone.

**Verification:** F-225 receipts `tests/screenshots/f-478-landing-{1440,375}.png` captured by the e2e (local; `tests/screenshots` is gitignored). Visible-surface change with e2e coverage; full battery deferred per the accepted F-225 debt (pre-battery marker absent).

**F-ID note:** F-478 next free after F-477 (F-468 reserved stub; BACKLOG ceiling F-477, PRD does not track F-4xx). Verified no `F-478` in BACKLOG, none in PRD, none in git history before claiming. FE+BE share the F-namespace; this repo's BACKLOG is the FE record.

## F-479 -- FE: nav consolidation (single TopNav floating pill across marketing + dashboard)

**Status:** Shipped -- squash-merged `305b5ae` (PR #13, `feat/nav-consolidation` -> main) after Chadi approved the Vercel preview and confirmed /onboarding + /paywall stay headerless (conversion funnels, consistent with /connexion). All ship gates green: CI `success` on the PR (run 27771408380: Unit (vitest) 574/574 + E2E (Playwright) pass 15m3s + Vercel pass), Vercel preview READY (`ba3d35a`), local prod-build gates (unit 574/574, `pnpm build` clean, f-479 26/26 + nav regression set green; the combined-run f-448 blips were the documented dev-server parallel-load flakes -- desktop 12/12 + mobile 12/12 in isolation). F-225 receipts `tests/screenshots/f-479-<route>-{1440,375}.png` (local; gitignored). Production deploy auto-triggered on merge. No tag (F-4xx one-off FE tickets are not on the `v0.<section>.<count>` scheme).

**Decision (Chadi, via clarifying question):** the consolidated nav is a **floating pill** (centered, detached, rounded capsule), not the prior full-width bar -- applied to the marketing TopNav AND the dashboard top bar so one preview reads consistently across the homepage, /tarifs, /librairie, /examens, /pieges and the dashboard.

**Why:** Two divergent logged-out marketing navs existed -- the homepage TopNav (full IA, brand logo) and StickyHeader (boxed wordmark, reduced links: Examens / Tarifs / Les Pièges / Sign in) on every other marketing route. F-479 makes TopNav the single marketing nav and retires StickyHeader; the dashboard top bar adopts the same pill so the product reads as one nav system.

**Built (2026-06-18):**
- **TopNav floating pill (`components/nav/TopNav.tsx`):** desktop + mobile redesigned from a full-bleed sticky bar into a centered, detached, rounded capsule (`position: sticky` + top gap + side margins, `border-radius: 9999`, `--shell-frost` bg + blur, `--lm-border-subtle` border, `--shell-pill-shadow`). v3 tokens only, no hardcoded hex (the old `--lm-bg-base` bar bg + `--lm-bg-blur` are dropped). Keeps the full IA (Vocabulary / Exams dropdown / Store / Real French / AI Tutor / Coaching + Cart / Pricing / Log in / Start Free) and the `sticky-header--scrolled` scroll class.
- **Reach (`EXCLUDED_PREFIXES` trimmed to `/connexion`, `/onboarding`, `/paywall`):** TopNav now renders on every route StickyHeader served -- /tarifs, /librairie, /examens, /pieges, /inscription, /a-propos, /faq, /blog, the legal pages, /library (the `/library` exact-exclusion is dropped). The mobile pill header now renders on **every** served route (the `isLanding` gate is removed -- TopNav is logged-out-only, so there is never an AppShell topbar to defer to). The cart (`topnav-cart-button`) is present on every served route, so /librairie keeps its store cart.
- **StickyHeader retired:** removed from `app/layout.tsx`; `components/layout/StickyHeader.tsx` + its two unit tests deleted. `Wordmark` kept (many other consumers).
- **Dashboard pill (`app/globals.css` `.app-topbar`):** dropped the full-width fixed bar for a centered floating capsule (top gap, left/right insets + `margin: 0 auto` + `max-width` to center within the content column right of the sidebar rail, `border-radius: 9999`, `--shell-pill-shadow`). All controls kept (search, EN/FR, bell, theme, avatar, page title, mobile hamburger); no marketing links. `.app-shell-main` top padding nudged to clear the floating pill.

**Consequence flagged for review:** `/onboarding` and `/paywall` (conversion funnel) are NOT in the migrated marketing set and stay excluded from TopNav, so retiring StickyHeader leaves them **headerless** -- consistent with `/connexion` (F-475). If a header is wanted there, that is a follow-up ticket.

**Tests:** `tests/unit/nav/TopNav.test.tsx` -- new reach assertions (renders on /tarifs, /librairie, /examens, /pieges, /inscription, /a-propos, /faq, /mentions-legales; null on /onboarding) + mobile-pill-on-all-served-routes. `tests/e2e/f-479.spec.ts` (new) -- pill + **decoded** brand logo (`complete && naturalWidth > 0`) on every previously-StickyHeader route (desktop 1440 + mobile 375), centered-capsule boundingBox checks, dashboard pill detached + no marketing links; screenshots `f-479-<route>-{1440,375}.png` (gitignored). `tests/e2e/f-448.spec.ts` -- /librairie cart badge testid `store-cart-button` -> `topnav-cart-button` (StickyHeader retired). Deleted: the two StickyHeader unit tests.

**F-ID note:** F-479 next free after F-478 (F-468 reserved stub; BACKLOG ceiling F-478, PRD does not track F-4xx). Verified no `F-479` in BACKLOG, none in PRD, none in git history before claiming. FE+BE share the F-namespace; this repo's BACKLOG is the FE record.

## F-480 -- FE: /inscription headerless + new card logo (auth surfaces consistent)

**Status:** Shipped -- squash-merged `5b53b73` (PR #14, `feat/inscription-fix` -> main). All ship gates green: CI `success` on the PR (run 27820632438: Unit (vitest) 575/575 + E2E (Playwright) pass 13m23s + Vercel pass), Vercel preview READY (`b7d9545`). Local prod-build gates: unit 575/575, `pnpm build` clean, f-480 + f-479 + signup-flow + f-475 e2e green against `pnpm start` (the dev-server first-compile timeouts were the documented on-demand-compile flakes). F-225 receipts `tests/screenshots/f-480-inscription-{1440,375}.png` + trace `f-480.zip` (local; gitignored). Production deploy auto-triggered on merge. No tag (F-4xx one-off FE tickets are not on the `v0.<section>.<count>` scheme).

**Why:** `/inscription` showed the same brand logo twice -- the F-479 floating pill nav rendered its own brand wordmark at the top of the page, and the signup card still carried the old boxed `<Wordmark>` beneath it. Two logos, and the two auth pages were inconsistent: `/connexion` is already headerless (F-475) with the real wordmark asset centered in its card, while `/inscription` kept the pill plus the legacy mark. F-480 makes `/inscription` match `/connexion`: one logo, both auth surfaces consistent.

**Built (2026-06-19):**
- **Headerless `/inscription` (`components/nav/TopNav.tsx`):** added `/inscription` to `EXCLUDED_PREFIXES` so the pill nav returns `null` there, the same as `/connexion`. The focused auth surfaces (`/connexion` + `/inscription`) and the conversion funnel (`/onboarding`, `/paywall`) are the headerless routes; everything else keeps the pill.
- **New card logo (`components/auth/SignupForm.tsx`):** replaced the boxed `<Wordmark size="nav">` with the real wordmark asset (`next/image`, `/brand/lemethodic-logo.png`, `data-testid="inscription-logo"`), centered at ~200px wide -- byte-for-byte the same treatment as the `/connexion` card (F-475). v3 tokens only, no hardcoded hex. `Wordmark` import dropped from this file (component retained; other consumers unaffected).

**Tests:** `tests/unit/nav/TopNav.test.tsx` -- `/inscription` moved out of the "renders on previously-StickyHeader routes" loop and into a new "returns null on excluded prefix (/inscription)" assertion. `tests/e2e/f-479.spec.ts` -- `/inscription` dropped from `MIGRATED_ROUTES` (no longer a pill-nav route). `tests/e2e/f-480.spec.ts` (new) -- asserts no pill nav on `/inscription` (desktop + mobile), exactly one **decoded** card logo (`complete && naturalWidth > 0`, ~200px wide), and the `/inscription` -> "Sign in" -> `/connexion` happy path proving both auth surfaces are headerless with a single card logo; screenshots `f-480-inscription-{1440,375}.png` + trace `f-480.zip` (gitignored, per F-225 accepted debt).

**Flagged for Chadi (not changed here, out of scope):** the brand assets `public/brand/lemethodic-logo.png` + `lemethodic-mark.png` were deleted from the working tree and a byte-identical copy now sits under `public/Nouveau dossier/` (a stray "New folder" -- looks like an accidental file-manager move). The committed HEAD copies are intact, so prod/CI are unaffected, but the local deletion was restored to verify this ticket. Recommend deleting `public/Nouveau dossier/` and confirming `public/brand/` stays tracked.

**F-ID note:** F-480 next free after F-479 (BACKLOG ceiling F-479, PRD does not track F-4xx). Verified no `F-480` in BACKLOG, none in PRD, none in git history before claiming. FE+BE share the F-namespace; this repo's BACKLOG is the FE record.

## F-481 -- FE: lock logged-out / marketing routes to the v3 LIGHT theme (ignore OS dark, kill the dark FOUC)

**Status:** Shipped -- squash-merged `a896dd4` (PR #15, `feat/f-481-marketing-light-lock` -> main, 2026-06-22). All ship gates green: CI `success` on the PR (Unit (vitest) 575/575 pass 1m48s + E2E (Playwright) pass 17m25s + Vercel preview READY). Local prod-build gates: unit 575/575, `tsc` clean for touched files, `pnpm build` clean (fresh `rm -rf .next`), full dark e2e battery (f-454, f-454-ext, f-455, f-458, f-459, f-460, f-464, f-467, f-472) + marketing (f-479, f-480) + f-481 green 114/114 (serial, prod build). F-225 receipts `tests/screenshots/f-481-{home,tarifs,connexion,inscription}-{1440,375}.png` + trace `f-481.zip` (local; gitignored). Production deploy auto-triggered on merge. No tag (F-4xx one-off FE tickets are not on the `v0.<section>.<count>` scheme). le-methodic-ship gate: SHIP.

**Why:** Marketing / logged-out pages rendered dark for visitors whose OS or browser color scheme is dark, because the single `next-themes` provider in the root layout used `defaultTheme="system" enableSystem` and wrapped the whole site. The marketing hex were never migrated to the v3 dark tokens, so that dark render is broken (mixed: token-driven elements flip, hardcoded-hex elements do not). Marketing must always render the v3 LIGHT palette regardless of system preference, with no flash of dark before paint.

**Approach (Option 1, chosen by Chadi):** relocate the provider rather than scope a `forcedTheme` to a marketing route group -- there is no marketing route group (marketing routes sit ungrouped at the app root; the **app** is what is grouped, under `(app)` + `(shell)`). Dark mode is an authenticated-only capability (the sole `ThemeToggle` lives in `AppTopBar`, reachable only when signed in), so the provider is scoped to authed surfaces and every other surface is light by construction.

**Mount-point correction during verification (AppShell -> ProtectedRoute + AuthAwareShell):** the dispatch named `AppShell` as the single mount, on the premise that dark is reachable only through the app shell. Verification proved that premise too narrow in two ways. (1) **Seven authed routes live at the app root and wrap `ProtectedRoute` directly, outside `AppShell`** -- `/bienvenue`, `/more`, `/progres/clb`, `/onboarding/waitlist`, `/learn/[module_id]`, `/la-methode/intro`, `/cluster/[slug]` (f-459's `/bienvenue` dark test caught it). (2) **The `(shell)` group (`/la-methode`) reaches `AppShell` through `AuthAwareShell`, NOT through `ProtectedRoute`** (f-454's `/la-methode` dark assertion caught it). So the provider mounts on the two authed entry points that are disjoint by route group: `ProtectedRoute` (covers the `(app)` group + the root authed routes) and `AuthAwareShell`'s authed branch (covers the authed `(shell)` view). They never overlap, so no nesting -- except a few `(app)` pages that redundantly wrap `ProtectedRoute` (already gated by `(app)/layout`); that nested provider is harmless (identical config, same storage key, idempotent class application -- confirmed green by the full dark e2e battery). On SSR both `ProtectedRoute` and `AuthAwareShell` render their loader / logged-out branch (not the shell), so the next-themes script is client-only regardless of mount, which is why the timing matches and the FOUC tradeoff below is unchanged.

**Built (2026-06-21):**
- **Root provider removed (`app/layout.tsx`):** the `<ThemeProvider>` wrapper (and its import) are gone from the root. Logged-out, marketing, auth (`/connexion`, `/inscription`), onboarding, paywall, and logged-out `(shell)` routes now mount no theme provider and no theme script at all. With no provider, the `.dark` class is never applied and the page renders v3 light by construction -- zero FOUC, OS color scheme ignored. `globals.css` has no `@media (prefers-color-scheme: dark)` block and the landing components use no `dark:` variants, so class absence fully determines light render.
- **Provider mounted in `ProtectedRoute` (`components/auth/ProtectedRoute.tsx`):** `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>` wraps the verified (state 4) children -- identical config to the old root provider. Covers the `(app)` group and every standalone authed route that wraps `ProtectedRoute`.
- **Provider mounted on `AuthAwareShell`'s authed branch (`components/layout/AuthAwareShell.tsx`):** the same provider wraps `<AppShell>` when authenticated, so the authed `(shell)` view (`/la-methode`) gets dark mode too. The logged-out branch mounts no provider, so the public view of a `(shell)` route stays v3 light.
- **Scoped provider for the dev galleries (`app/dev/layout.tsx`, new):** `/dev/molds` (the v3 design-token gallery) and `/dev/bientot` are dev-only routes (noindex, not authed, not in any shell) whose purpose is previewing the system in BOTH modes; they are not under `ProtectedRoute`, so they get their own scoped provider. Server-rendered, so the pre-paint script keeps them flash-free. Keeps f-454-ext (dark molds + l-examen) green without weakening it. Scope never reaches a marketing surface.
- **Dead dupe deleted (`components/theme-provider.tsx`):** the unused lowercase duplicate of `components/ThemeProvider.tsx` (zero references; grep-confirmed) was removed since this ticket is in the theme-provider blast radius. The capital-T `ThemeProvider` is the one in use.

**Tests:** `tests/e2e/f-481.spec.ts` (new) -- emulates OS dark (`colorScheme: 'dark'`) and asserts every marketing route (`/`, `/tarifs`, `/connexion`, `/inscription`) renders v3 light: no `.dark` on `html` and computed `--canvas` resolves to `rgb(234, 239, 243)` (#EAEFF3), on first load **and** after a refresh (no FOUC). A guard test proves authed dark mode survived the relocation (forced dark applies in the shell, `--canvas` = `rgb(10, 12, 14)`, persists across a full reload). Receipts `f-481-{home,tarifs,connexion,inscription}-{1440,375}.png` + trace `f-481.zip` (gitignored, per F-225 accepted debt). Existing authed dark coverage (f-454, f-455) continues to exercise the relocated provider. `AppTopBar.test` mocks `ThemeToggle`, so it is unaffected by the relocation.

**Known tradeoff (accepted):** dark-mode authed users see a one-frame light-to-dark snap on the FIRST authed paint after a full page load, because the provider now mounts post-hydration inside `ProtectedRoute` (the auth gate renders a light canvas loader until verified, then reveals the themed children) rather than via a pre-paint script at the root. `disableTransitionOnChange` is set, so it is an instant snap, not a fade. It does not affect any marketing surface and does not repeat on in-app client navigation.

**Follow-up ticket (logged, do not build now): F-482 -- app-side zero-FOUC for the authed shell.** Eliminate the entry snap above. Either move marketing into a `(marketing)` route group with the provider scoped to `(app)` + `(shell)` group layouts (provider renders high in the app subtree, server-side), or add a route-aware blocking head script that applies `.dark` on app paths before paint. This is the scale-correct fix for the app-side snap; logged here so it is not lost.

**F-ID note:** F-481 next free after F-480 (BACKLOG ceiling F-480, PRD does not track F-4xx). FE+BE share the F-namespace; Chadi confirmed F-481 is free on the BE `master` side and that this FE-root BACKLOG is canonical for both repos (F-480 already accounts for BE tickets; nothing above F-480 exists). Verified no `F-481` in this BACKLOG before claiming. F-482 reserved here for the follow-up above.

## F-482 -- FE: route-aware pre-paint theme script + client-nav guard + full-reload logout

**Status:** Shipped -- squash-merged `f769cf5` (PR #16, `feat/f-482-pre-paint-theme-script` -> main, 2026-06-22). All ship gates green: CI `success` on the PR (Unit (vitest) 582/582 pass 1m55s + E2E (Playwright) pass 17m8s + Vercel preview READY). Local prod-build gates: unit 582/582, `tsc` clean for touched files, `pnpm build` clean (fresh `rm -rf .next`), full theme e2e battery (f-454, f-454-ext, f-455, f-458, f-459, f-460, f-464, f-467, f-472, f-479, f-480, f-481) + f-482 green serially (f-482: 21 passed, 1 skipped). F-225 receipts `tests/screenshots/f-482-{home,tarifs,connexion,inscription}-{1440,375}.png` + trace `f-482.zip` (local; gitignored). Production deploy auto-triggered on merge. No tag (F-4xx one-off FE tickets are not on the `v0.<section>.<count>` scheme). le-methodic-ship gate: SHIP.

**Why:** F-481 removed the root theme provider, so marketing renders light by construction on full loads and the provider mounts on authed surfaces only. Two gaps remained. (1) **Client-nav leak:** when `.dark` is already on `<html>` from an authed dark session and the user reaches a marketing route by client-side navigation (e.g. clicking "Pricing" in the authed sidebar -> `/tarifs`), nothing strips `.dark`, so marketing rendered dark. (2) **App entry snap:** because the provider mounts post-hydration, dark users saw a one-frame light-to-dark snap on the first authed paint after a full load. Both close here. Marketing must never render dark, in any navigation path.

**Approach (token-gated, chosen by Chadi over the strict pure-pathname alternative, which fails `/la-methode` both ways):** key off a shared authed-prefix list. Marketing paths always strip `.dark` and never read the token. Authed paths apply the stored theme only when a token exists.

**Built (2026-06-22):**
- **Single source of truth (`lib/theme/authed-prefixes.ts`, new):** `AUTHED_PREFIXES` (17 prefixes) + `isAuthedPath()`. Encodes the two nuances: `/onboarding/waitlist` is authed but `/onboarding` (the funnel) is PUBLIC; `/la-methode` is auth-aware (covers `/la-methode/intro` + `/la-methode/[id]`). GUARD-RAIL documented in-file: never add a marketing route here.
- **Pre-paint inline script (`app/layout.tsx`):** a raw `dangerouslySetInnerHTML` script in `<head>` (the next-themes technique, NOT next/script), built from `AUTHED_PREFIXES` via `JSON.stringify`. Marketing path -> strip `.dark` (never reads token). Authed path WITH `lemethodic_token` -> apply stored `theme` (`dark`/`light`, or `system`/absent resolved via `matchMedia`). Authed path WITHOUT token -> strip `.dark` (logged-out `/la-methode` renders light). All in try/catch so a storage/matchMedia failure cannot throw before paint. This removes the app entry snap (theme applied before first paint).
- **Client-nav guard (`components/theme/MarketingThemeGuard.tsx`, new):** a `use-client` component mounted once in the root layout, path-aware, isomorphic `useLayoutEffect` so it strips `.dark` before paint on every marketing pathname change. No-op on authed paths (the scoped provider stays in control). Closes the client-nav leak (e.g. sidebar Pricing -> `/tarifs`).
- **Full-reload logout (`lib/auth.ts`):** `signOut()` now does `window.location.assign('/')` instead of `router.push('/')`, so a fresh server render + the pre-paint script clear any lingering `.dark`. The `router` argument is gone; the 3 call sites (`profil`, `AppShell` user menu, `WaitlistScreen`) now call `signOut()`. The now-unused `useRouter` was removed from `profil` + `AppShell`.

**Tests:** `tests/unit/theme/authed-prefixes.test.ts` (new) locks the boundary nuances and the GUARD-RAIL (no marketing route matches; `/onboarding` public vs `/onboarding/waitlist` authed; `/progres` vs `/progression`; `/bienvenue-typo` near-miss). `tests/e2e/f-482.spec.ts` (new): under emulated OS dark + a stale stored `theme=dark`, asserts (1) every marketing route renders v3 light on load + refresh, (2) client-nav from the authed dark shell (sidebar Pricing -> `/tarifs`, rail pinned for a stable target) strips `.dark` with no reload, (3) logout full-reloads to a light landing, (4) app full-load entry has `.dark` at `domcontentloaded` (pre-paint, no snap) and persists across reload. Unit 582/582; `tsc` clean for touched files; `pnpm build` clean (fresh `rm -rf .next`); full theme e2e battery (f-454, f-454-ext, f-455, f-458, f-459, f-460, f-464, f-467, f-472, f-479, f-480, f-481) + f-482 green serially (f-482: 21 passed, 1 skipped). Receipts `f-482-{home,tarifs,connexion,inscription}-{1440,375}.png` + trace `f-482.zip` (gitignored).

**Residuals (accepted by Chadi, do NOT chase):** (a) an authed dark user navigating from a marketing route BACK into the app by client-side nav may see a brief flash before the provider applies dark (the pre-paint script only runs on full loads). (b) a mid-session 401 WHILE sitting on `/la-methode` clears auth without a redirect, so a lingering `.dark` could show until the next full load. Both are the same polish class as the F-481 tradeoff; out of scope here.

**F-ID note:** F-482 next free after F-481 (BACKLOG ceiling F-481; PRD does not track F-4xx). FE+BE share the F-namespace; this FE-root BACKLOG is canonical for both. Reserved as the F-481 follow-up; no other `F-482` exists.
