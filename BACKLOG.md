# FluentPath Backlog

**Source of truth** for FluentPath sprint work. Maintained in the frontend repo because most active work is here, but covers both frontend and backend.

**Last updated:** 2026-04-24 (F-062 ship)
**Sprint window:** April 21 – May 4, 2026

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

## In progress

_(none — F-062 + F-062.1 + F-062.2 closed. F-063 (T1), F-061.1 (picker), F-062.3 (T2 re-record) open.)_

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

## Queued — follow-ups

_(none — F-062.3 closed; T2 loop is now re-record-capable.)_

---

## Queued — core product wiring (continued)

**F-063** 📋 Tâche 1 real recording (AI examiner conversation)
- Reuse useAudioRecorder + VuMeter primitives
- Wire Tache1Session.tsx with examiner turn playback (TTS audio)
- POST /api/conversations with tache_mode=1
- Handle 4-turn examiner-user-examiner-user flow
- Depends on: F-061, F-062

**F-064** 📋 Lesson detail + quiz real data
- `app/raccourci/lesson/[id]/page.tsx` fetches GET /api/raccourci/lessons/{id}
- Quiz component submits to POST /api/raccourci/lessons/{id}/complete
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
- Backend: new endpoint GET /api/raccourci/recommended-practice
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
- Update seed_topics.py or raccourci seeder
- Lesson titles must be French ("Conjugaison" not "Conjugation", "Prépositions" not "Prepositions")
- Lesson short_descriptions stay in interface language (English for EN users)
- Reseed the raccourci_lessons table on dev DB before launch

**F-070** 📋 CEFR → TCF /699 score mapping
- Backend analysis engine must emit tcfScore (0-699) alongside noteGlobale (0-20) and cefrBand
- Map internal score → TCF band using official TCF Oral rubric (0-699)
- Frontend diagnostic page hero switches from {noteGlobale}/20 to {tcfScore} / 699 {cefrBand}
- Paywall radar already shows this; make sure diagnostic matches

---

## Queued — launch prep (F-071 to F-079)

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

⏸ **Stripe integration** — deferred per explicit decision. Backend first, revenue later.
⏸ **Test-drive recording before paywall** — post-launch A/B test for conversion optimization
⏸ **Writing module (Expression Écrite)** — full TCF coverage beyond Expression Orale
⏸ **Exam Simulation mode** — distinct from Learning Mode (current default)
⏸ **Mock Exam mode** — separate scoring mode recommended after completing Le Raccourci
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
