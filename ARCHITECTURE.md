# Architecture

Le Méthodic is a French oral exam prep and linguistic infrastructure
platform for English speakers pursuing TCF Canada (primary, 90%) and
DALF C1 (secondary, 10%). The architecture is exam-agnostic: a Target
Profile (exam, threshold, deadline, persona) overlays a shared spine.
Multi-persona and multi-exam support are present from day one; TCF Canada
is the first exam lit, not the only one. This document describes how the
system is built. Current state and target state are tracked together,
with audit gaps in section 11.

## 1. Product surfaces

One complete website. Every surface exists from launch; unbuilt content
and features show as "bientôt" (coming soon) via a config flag. Lighting
one up is content plus a flag, not a release event.

The five-couche methodology (Le Propos, Le Plan, La Construction, Les
Pièges Anglais, La Musique) is the lens applied across all surfaces.
Les Pièges Anglais (L1-interference traps for anglophones) is the
product differentiator.

| Surface | Route | What it does | State |
|---|---|---|---|
| Atlas | /carte | Hub home. The learner's map: all islands, progress, Target Profile, next action. | Bientôt |
| La Méthode | /la-methode | 27 islands. Fondations 1 to 16, Approfondissement 17 to 27. Island-based curriculum for the five-couche methodology. | Shell shipped; islands bientôt |
| La Bibliothèque | /la-bibliotheque | Chunk-based French vocabulary. Modes: browse, practice, test, tutor. Source for the 945K chunk data layer. | MVP shipped; content pipeline in progress (F-321) |
| L'Examen | /l-examen | Exam simulation. Four skill sections: comprehension orale, comprehension ecrite, expression orale, expression ecrite. Tâche 1, 2, 3 with AI examiner. Five-couche live scoring. | In progress |
| Le Maître | unified across surfaces | ElevenLabs Chadi voice clone. Tutor persona for onboarding, La Méthode islands, La Bibliothèque coaching. Not the examiner. | M5 target |

## 2. Stack

Two repos, separate deploys.

**Frontend.** Next.js 16, App Router. Cloned from v0 by Vercel, edited
locally. Fonts: Cabinet Grotesk (display), Geist (body), Source Serif 4
(FR-UI), DM Mono. Inter for English. Tailwind. Deployed on Vercel at
lemethodic.com. Repo: chadovsky/lemethodic-frontend, branch main.

**Backend.** FastAPI + SQLAlchemy. Postgres 16 (DigitalOcean managed)
with the pgvector extension. Spaces FRA1 for object storage. Deployed
on DigitalOcean App Platform (FRA1) at seal-app-75fiu.ondigitalocean.app.
Repo: chadovsky/lemethodic-backend, branch master.

**AI services.** AssemblyAI (streaming STT). OpenAI (TTS-1-HD examiner
voice, embeddings). Mistral Large (French-critical generation). Groq
Llama (bulk generation). ElevenLabs (Le Maître voice clone, M5).
Claude API (orchestration and scoring).

**Auth and payments.** Email + passwordless auth on BE. LemonSqueezy for
subscription billing (M6). The LemonSqueezy webhook handler writes
subscription_tier on subscription events; enforcement is handled by
P-105 (M5.5, shipped), independent of billing activation.

## 3. Data model

The database is the moat. The architecture is what compounds, not the
corpus size.

### Corpus

945K French chunks across 9 sources: DBnary (487K), Wikipedia AdQ (296K),
Lexique3 (126K), Gutenberg (67K), PARSEME (8K), CollFrEn (7K), Anki (5K),
UniversalCEFR (4K), WikipediaFR (2K). Plus 1.56M Tatoeba sentence pairs.

9,249 native CEFR-labeled chunks: A1 (140), A2 (363), B1 (5,431), B2 (250),
C1 (2,500), C2 (565). B2 native scarcity is the active gap for the TCF
Canada primary persona, tracked by D-034 (Mistral-driven enrichment of
Lexique3 rank 5K to 30K + Wikipedia AdQ, target 5K to 10K validated
B2 chunks).

Phase 1 ingestion closed. Phase 1 review (F-321, ~1,684 rows) is
Chadi-bottlenecked and remains the highest-leverage curation work.

Active data tickets: D-032 (quality_tier column: academic, useful,
reserve, example), D-033 (scoring_rubrics table for TCF Canada 3 axes
+ DELF B2 + DALF C1), D-034 (B2 enrichment), D-035 (lang-aware schema),
D-036 (free CEFR sourcing via CoE Companion 2020 + FEI rubric, replaces
canceled D-026 Beacco).

### Three domains

**Content.** Core curriculum and assessment resources.

- `islands`: one row per island (topic), with a `status` flag (live or
  bientôt) that controls whether the surface renders or shows a coming-soon
  placeholder.
- `island_activities`: typed by `type` (comprehension, reflexe,
  conversation, reemploi, tache) and by `skill` (oral, listening, reading,
  writing). Reading and writing skill values are reserved from day one; no
  migration is needed to light them up later.
- `pieges_catalog`: L1-interference entries, each with a `seo_slug`. Seeds
  200 to 500 items; grows via the 6-factor promotion gate.
- `scoring_rubrics`: per-exam scoring configs with `couche_weights` and
  `score_mapping`. Covers TCF Canada 3 axes, DELF B2, and DALF C1.
- `corpus_chunks`: the 945K corpus rows, each with a `quality_tier`
  (academic, useful, reserve, example) and a CEFR tag.

**Learner.** User state and progression.

- `users`: core user record with `subscription_tier`,
  `specific_intended_exam`, and `accept_fallback` (whether the learner
  accepts a different exam if their target is not yet lit).
- `target_profiles`: one per user per exam cycle. Stores exam, threshold,
  deadline, and persona. The spine is exam-agnostic; this table overlays it.
- `user_progress`: streak, production_minutes, daily_target. Progress is
  measured in production minutes, not lesson completions.
- `sessions`: session log with timestamps and surface context.

**Assessment.** Evidence the learner produces.

- `tache_attempts`: one row per Tâche attempt, with cost telemetry:
  `model_used`, `tokens`. Supports the 95-98% margin target via usage
  monitoring.
- `island_crossings`: records when a learner achieves mastery on an island.
  The basis for island sequencing.
- `interference_log`: the moat. Every matched Les Pièges Anglais slip is
  logged here with the catalog entry, the surface context, and the error
  signal. Compounds into the learner's L1-interference profile over time.
- `item_exposures`: spaced-review log per chunk per user. Reserved from
  day one; no migration needed to activate.

## 4. RAG per student

Multi-mode RAG, locked Q1 (May 17). Retrieval is not cosine-similarity
ranking of a single query against the corpus. Each mode fuses two sources
with a purpose-specific query strategy.

**Two sources fused on every retrieval.**

- Shared corpus: CEFR-tagged chunks, native exemplars, scoring rubrics,
  the Pièges catalog. Indexed in pgvector.
- Personal memory: the learner's error profile (interference_log),
  progress (island_crossings, user_progress), and Target Profile (exam,
  threshold, deadline, persona).

**Six retrieval modes.**

| Mode | What it does | Model |
|---|---|---|
| Grade a Tâche | Pulls the relevant scoring rubric couche_weights plus native B2/C1 exemplars at the declared CEFR band. Grounds the grader in what a target-band response actually sounds like. | Mistral |
| Match interference | Queries the Pièges catalog for the closest phonological or grammatical slip in the learner's transcript. Logs the match to interference_log. | Mistral |
| Sequence next island | Reads island_crossings and user_progress to find the gap with the highest expected gain given the learner's Target Profile. Returns the recommended next island. | Groq |
| Personalise examples | Fetches corpus_chunks matching the current island's topic and the learner's CEFR band, filtered by quality_tier. Replaces the island's default examples with chunks drawn from the learner's vocabulary exposure history. | Groq |
| Ground Le Maître conversation | Combines the learner's error profile and session history with relevant corpus fragments to keep the tutor's turn contextually accurate and pedagogically targeted. | Groq |
| Post-Tâche remediation | After grading, retrieves the lowest-scoring couche and the learner's interference history. Assembles a targeted remediation bundle: one native exemplar, one Pièges entry, one réflexe prompt. | Mistral |

Routing rationale: Mistral for French-critical modes (grading accuracy
and interference detection require superior FR fluency). Groq for bulk
modes (sequencing and personalisation tolerate a lower FR quality bar
and benefit from throughput cost).

## 5. Multi-model routing

No single model does everything. Each surface routes to the model with
the best price-to-quality fit for its task.

| Task | Model | Why |
|---|---|---|
| French-critical generation (Diagnostic scoring, enrichment, couche tagging) | Mistral Large | Best French fluency at usable cost |
| Bulk generation (vocab variants, drill content) | Groq Llama | Cheap throughput, French quality acceptable for non-critical paths |
| Examiner voice (Tâche 1, 2, 3) | OpenAI TTS-1-HD | Brand-critical. Locked. Not swappable to Piper or Supertonic |
| Tutor voice (Le Maître) | ElevenLabs | Chadi voice clone, unified tutor persona |
| Embeddings | OpenAI | Pairs cleanly with pgvector, mature ecosystem |
| Orchestration and reasoning | Claude API | Scoring, structured output, complex prompts |

## 6. Audio pipeline

Chained, not interchangeable. Realtime speech-to-speech is not used: the
graded gate needs a transcript before scoring can run, and the brand voice
requires the Chadi clone.

**Streaming (Tâche 1 and 2).** AssemblyAI. Sub-1s latency required for
live examiner turn-taking. Stays on AssemblyAI. A contingency to
GPT-4o-transcribe exists if Whisper FR accent quality proves insufficient
when the async swap is revisited.

**Async (Tâche 3, vocab, batch scoring).** Currently AssemblyAI. Target
swap to Whisper after the site is complete, via Groq (approximately
$0.04/hr) or CPU self-host (S-001, S-002). Cost cascade is the lever for
the 95-98% margin target.

**Grading.** Mistral Large. Receives the transcript and the scoring rubric
retrieved via RAG. Returns per-couche scores. This is the FR-critical path;
Mistral is not swappable here.

**Tutor voice.** ElevenLabs. The Le Maître Chadi-clone voice. Brand-critical.
All Le Maître speech output routes here.

**Examiner voice.** OpenAI TTS-1-HD. Examiner role only (Tâche 1, 2, 3).
Locked, not swappable.

Note on the AssemblyAI auto-correction layer: it may smooth L1-interference
signal that Les Pièges Anglais detection depends on, so the async swap is
monitored, not assumed.

## 7. Authentication and tier enforcement

**Current state (M5.5 shipped).** The tier resolver on BE reads real
subscription state from the DB and enforces on every gated endpoint.
402/403 on tier violation. Per-user rate limits on AI endpoints are
Redis-backed with 429 on breach.

**Target state (M6 and beyond).**
- M6: LemonSqueezy webhook handler writes the correct subscription_tier
  value into the DB on subscription events. The webhook populates;
  enforcement (M5.5) is already live.
- B-100: LLC formation + EIN + Mercury + LemonSqueezy activation. Unblocks
  P-106 (trial mechanics).

This split exists because enforcement and population are different
problems, and bundling them hides the dependency.

## 8. Coming-soon mechanism

The site renders fully at all times. Every surface and every feature has a
status: live or bientôt. That status is driven by a simple per-row config
flag on the `islands` table and an analogous flag on other surface config
tables. When a surface or feature is bientôt, the UI renders a
complete-feeling placeholder with the "bientôt" label rather than content.

Lighting up a surface or feature is a two-step operation: upload content,
flip the flag to live. No code deploy is required for standard content
lighting. This is the bientôt doctrine: the product is one complete website
from the first day it is live; unbuilt parts are not hidden, they are labeled.

The reading and writing skill values on `island_activities` and the
`item_exposures` table exist in the schema from day one for exactly this
reason: adding them later would require a migration. Adding content is not
a migration.

## 9. External integrations

| Integration | Purpose | State |
|---|---|---|
| LemonSqueezy | Subscription billing | M6 |
| Mercury | Bank account for payouts | Pending B-100 |
| AssemblyAI | Streaming STT | Live |
| OpenAI | TTS-1-HD examiner, embeddings | Live |
| ElevenLabs | Le Maître voice clone | M5 target |
| Mistral, Groq | LLM routing | Live |
| Anthropic Claude API | Orchestration | Live |

## 10. Production infrastructure

**Frontend.** Vercel. Domain lemethodic.com. Edge-deployed.

**Backend.** DigitalOcean App Platform, FRA1. URL
seal-app-75fiu.ondigitalocean.app. CORS posture: CORS is locked to specific
origins: localhost:3000 and localhost:3001 for local dev,
https://lemethodic.com, https://www.lemethodic.com (apex and www),
https://lemethodic-frontend.vercel.app (Vercel canonical), and a
FRONTEND_ORIGIN env var for overflow. Credentials are allowed. Methods
and headers use wildcards, which is acceptable given the origin whitelist.
Not open to all origins. Status: PASS.

**Database.** DigitalOcean managed Postgres 16, FRA1. pgvector extension
enabled. Connection pool config: SQLAlchemy defaults in effect:
pool_size=5, max_overflow=10 (neither explicitly set in app/database.py).
pool_pre_ping=True (explicitly set). pool_recycle is not set, which is a
low-grade risk on long-lived single-worker deploys where TCP-level timeouts
on the DO managed Postgres side can strand connections. Recommended fix:
pool_recycle=1800. Single Uvicorn worker, no Gunicorn, instance size
basic-xxs on DO App Platform. Max simultaneous DB connections at current
config: 1 worker x (5 + 10) = 15. DO Hobby Postgres tier (production:
false in .do/app.yaml, approx $7/mo) typically allows 22 to 25 connections;
founder should confirm via DO console or "SHOW max_connections;" in psql.
At one instance, headroom is comfortable. At two instances (30 connections),
the Hobby tier limit is likely exceeded. Planned trigger for upgrading to DO
Basic (approx $15/mo, approx 97 connections) is adding a second instance.

**Object storage.** Spaces FRA1. Used for audio uploads and generated TTS
artifacts. Audio tiering policy (Q6): 50K eager + predictive for Premium,
lazy otherwise.

**Backups.** pg_dump backup retained at
tache2_scenarios_pre_content_20260514_023212.sql on the prod BE
container. Backup cadence: UNKNOWN, founder confirms. The audit did not
cover DO Postgres backup cadence. CLAUDE.md references DO daily auto-backup
as a migration rollback fallback but the backup schedule, retention period,
and restore procedure are not documented in the codebase or the audit.

## 11. Current state vs target state

**Shipped milestones.**

- M2: Design token foundation. t10 color palette (CSS variables, Tailwind
  utilities via `@theme inline`) and t11 typography (Cabinet Grotesk
  display, Geist body, Source Serif 4 FR-UI). On main.
- M3: Diagnostic fifth couche. BE wires la_voix scoring. V-009 shipped
  on main.
- M5.5: BE pre-monetization hardening. P-105 (tier resolver reads real
  subscription state from DB, enforces on all gated endpoints), F-401
  (Redis-backed per-user rate limits on AI endpoints, 429 on breach),
  F-402 (FK indexes), F-403 (N+1 query fixes). All closed.

The BE audit on 2026-05-31 (docs/be-audit-2026-05-31.md, BE repo)
surfaced the gaps between the BE in production and the BE needed for a
monetized launch. M5.5 closed them.

**Audit scorecard.** From audit Section 6 (2026-05-31 static code analysis):

| Area | Score (0-10) | Top risk |
|---|---|---|
| N+1 queries | 4 | Analytics dashboard triggered N feedback queries per recording load |
| Pagination | 6 | GET /api/admin/users had no limit; analytics dashboard unbounded per user |
| Indexes | 3 | recordings.user_id and feedbacks.recording_id had no indexes; both are the hottest columns in the system |
| Connection pool | 7 | pool_recycle not set; single Uvicorn worker; within DO limits at current traffic |
| Security | 6 | Tier gate returned "free" for all users; AI endpoints had no per-user rate limits |

**M5.5 closed (all items below were open at audit time, now resolved).**

1. Indexes on recordings.user_id and feedbacks.recording_id. Every
   analytics request was a full table scan compounded by N+1 full scans
   on feedbacks.
2. selectinload on all analytics and recording-history endpoints. Eight
   endpoints accessed r.feedback in a Python loop with no eager loading;
   fix was one import and one .options() call per endpoint.
3. Rate limits on AI-calling endpoints per user.
   POST /api/recordings/{id}/transcribe,
   POST /api/conversations/{id}/turns, and
   POST /api/writing/submit are now rate-limited.
4. P-105: _resolve_user_tier() now reads real subscription state. All tier
   gates on protected routes are active. Was required before charging users.
5. Paginated GET /api/admin/users.

**Per-area residual state (post-M5.5).**

- Tier enforcement: live (P-105 shipped M5.5).
- Rate limiting on AI endpoints: live (F-401 shipped M5.5).
- FK indexes: shipped (F-402, M5.5). The following FK columns had no
  confirmed index in any Alembic migration at audit time (all shipped
  with M5.5):
  - writing_submissions.user_id (MEDIUM impact, writing history filter column)
  - writing_submissions.prompt_id (LOW-MEDIUM impact, used in explicit N+1 subquery loop)
  - recordings.topic_id (LOW-MEDIUM impact, analytics/coverage JOIN)
  - remediation_modules.ecole_lesson_id (LOW impact, FK lookup)
  - clusters.vocabulary_theme_id (LOW impact, FK lookup)
  - clusters.parent_cluster_id (LOW impact, self-referential FK)
  - user_path_enrollments.current_phase_id and current_cluster_id (LOW impact, not in hot paths)
  - user_cluster_statuses.last_evaluated_recording_id (LOW impact, FK only)
  - user_cluster_events.triggered_by_recording_id (LOW impact, FK only)
  - user_level_assessments.triggered_by_recording_id (LOW impact, FK only)
  - writing_submission_jobs.submission_id (LOW impact, async job lookup)
- N+1 queries: shipped (F-403, M5.5). Eight of 14 audited endpoints had
  N+1 or compound-subquery-per-row patterns. Only GET /api/recordings used
  eager loading correctly at audit time.
  - GET /api/analytics/dashboard (HIGH: 1 recording query + N feedback lazy-loads, up to 51 queries per page load for a user with 50 recordings)
  - GET /api/analytics/progress (HIGH: up to 100 feedback lazy-loads per call, limit=100 applies but no eager loading)
  - GET /api/analytics/pass (HIGH: unbounded feedback lazy-load loop, no limit)
  - GET /api/admin/dashboard (MEDIUM: up to 20 feedback lazy-loads, admin-only endpoint)
  - GET /api/admin/users (HIGH plus compound subqueries: N recording lazy-loads plus N avg aggregate subqueries per user row; 201 queries at 100 users, 2001 at 1000 users)
  - GET /api/recordings/history (HIGH: up to 50 feedback lazy-loads per call, despite being in the same file as the correctly-eager GET /api/recordings)
  - GET /api/writing/history (HIGH: up to 50 explicit WritingPrompt subqueries inside the result loop, not relationship lazy-loading but same cost pattern)
  Note: the audit summary states 8 of 14; the 7 above are the MEDIUM/HIGH
  classified endpoints. One LOW-risk entry (analytics/coverage or
  analytics/recurring) accounts for the 8th.
- Pagination: post-M5.5 state. Paginated correctly: GET /api/recordings
  (limit required, max 100, with eager loading), GET /api/vocab/topics/{slug}/chunks
  (limit+offset, max 100, on the 945K-row chunks table). Partially paginated
  with hardcoded limits: GET /api/recordings/history (50 hardcoded),
  GET /api/writing/history (50 hardcoded). Paginated via query param:
  GET /api/analytics/progress (limit param, max 100),
  GET /api/analytics/recurring (limit, max 50). Unbounded endpoints fixed
  by M5.5: GET /api/analytics/dashboard, GET /api/analytics/pass,
  GET /api/admin/users. Bounded catalogs with no pagination but LOW risk
  (small stable tables): admin/topics, admin/themes, ecole/lessons,
  modules, writing/prompts, vocab/topics, conversations/scenarios. No
  endpoint reaches the 945K vocab_chunks table without pagination.
- Connection pool: unchanged at audit findings. See section 10 (Database)
  for the full pool config (pool_size=5, max_overflow=10,
  pool_pre_ping=True, pool_recycle not set). Single Uvicorn worker,
  instance size basic-xxs, request_timeout_seconds=180. Max simultaneous
  DB connections: 15. DO Hobby Postgres ceiling: approx 22 to 25 (needs
  founder to verify). FastAPI sync endpoints (def, not async def) run in
  a shared thread pool defaulting to 40 threads; under high concurrent
  load up to 25 threads can block waiting for a pool slot. Risk is low at
  current traffic and materializes around 50+ concurrent users. pgbouncer
  is not present; acceptable at current scale, to be revisited before
  multi-instance scaling.
- Security: all audit passes remain current. Webhook signature
  verification: in place (audit confirmed, pattern now applies to
  LemonSqueezy). JWT HS256 access tokens (15-min TTL) plus refresh tokens
  with jti stored in DB, 7-day TTL, token chain invalidation on replay of
  a rotated token. Email verification and password reset use hashed random
  32-byte tokens (SHA-256 hash stored, 24h and 1h TTL respectively).
  Cookie flags: httponly=True, samesite=lax, secure=True in prod.
  Status: PASS. Admin endpoints use the same JWT auth as all other
  endpoints; no separate admin RBAC layer was audited beyond standard auth
  guards. CORS: locked to specific origins only (see section 10). Wildcard
  methods/headers acceptable given origin lock. Status: PASS. Secret
  handling: no hardcoded API keys or secrets found in any source file; all
  secrets sourced via app/config.py settings object from environment
  variables; .env.example and .env.production.example use placeholder
  values only. Status: PASS.

## 13. Telemetry infrastructure

**Page analytics.** Plausible (or equivalent privacy-first analytics) for page-level traffic. EU data residency. No cookies required; no GDPR consent gate for page analytics.

**Product event tracking.** PostHog (or equivalent) for structured product events. EU-hosted instance or EU data residency mode. Events fire client-side (FE) and are optionally proxied through the BE to prevent adblocker interference.

**Canonical event taxonomy (seed list).**

| Event | When fired |
|---|---|
| signup_completed | User completes registration |
| bienvenue_started | User opens /bienvenue |
| bienvenue_completed | User submits Target Profile |
| first_ile_opened | User opens their first île |
| first_tache_submitted | User submits their first oral Tâche |
| first_score_received | Le Maître returns per-couche scores |
| day7_active | User has a session on day 7 after signup |
| day30_active | User has a session on day 30 after signup |
| subscription_started | User purchases a paid tier |
| dispute_submitted | User files a score dispute |
| account_deleted | User deletes their account |

**Audit log (BE).** Schema: `user_action_log` table with columns: `user_id`, `action_type`, `target_id`, `metadata` (jsonb), `timestamp`. Middleware captures key server-side actions (login, île opened, Tâche submitted, dispute filed, account changes). Retention: 90 days by default. The audit log is the support debugging layer, not the BI layer; PostHog is BI.

---

## 14. Error monitoring

**Sentry.** Browser SDK on FE (Next.js integration), server SDK on BE (FastAPI integration). EU data residency (Sentry EU endpoint). Source maps for FE are uploaded at deploy time so stack traces resolve to source.

**Alerting policy.** Critical errors (unhandled exceptions affecting user data or payment flow): immediate email to founder. Non-critical errors (UI exceptions, non-fatal 5xx): daily digest email.

**Scope.** All unhandled exceptions and 5xx responses are captured automatically. Selected 4xx errors (429 rate limit, 403 tier mismatch) are tracked as performance signals, not error alerts.

---

## 15. Email infrastructure

**Transactional provider.** Postmark (or equivalent). EU data residency for GDPR compliance. All transactional email routes through a single provider with a single verified domain (lemethodic.com).

**Transactional templates.**
- signup_verification: email verification link on new account creation
- password_reset: password reset link (1h TTL)
- payment_receipt: LemonSqueezy order confirmation mirror
- dispute_response: auto-response on dispute submission confirming 5 business day SLA
- account_deletion_confirmation: confirmation after self-serve account deletion

**Lifecycle series.**
- Welcome D0: sent immediately on signup_completed; introduces La Méthode and first action
- Welcome D3: re-engagement if no Tâche submitted; surfaces the free tier value
- Welcome D7: progress check-in; shows score prediction if available
- D14 inactive: re-engagement for users with no session in 14 days
- D30 inactive: save offer or escalation for users with no session in 30 days
- Pre-cancel save: triggered by cancel intent event from LemonSqueezy
- Post-cancel feedback: triggered by subscription_cancelled event; short survey

---

## 16. Cookie consent

**In-house banner.** No third-party consent management platform (CMP). The banner is built and owned by Le Méthodic. Granular categories: necessary, analytics, marketing. EU-compliant posture: explicit opt-in required for non-necessary cookies; deny-equivalent option; granular preferences page accessible from footer.

**Persistence.** Consent choices are stored in localStorage keyed by consent version. When the consent schema changes, the version increments and the banner re-presents.

**Telemetry integration.** PostHog and any marketing pixels fire only after analytics consent is granted. Plausible (cookieless) fires regardless of consent state.

**Position and treatment.** AESTHETIC INPUT NEEDED (F-381): founder decides position (top bar or bottom bar), copy tone, and color treatment.

---

## 17. Accessibility posture

**Target standard.** WCAG 2.1 Level AA across every shipped surface.

**Tooling.** Axe DevTools (browser extension + CI integration) for automated checks. Lighthouse accessibility audit in CI. Manual keyboard navigation walkthrough per new surface.

**Known risks from current implementation.**
- The 60% opacity bientôt pattern likely fails WCAG 1.4.3 (contrast minimum). Replacement treatment needed before Phase 2.5 closes.
- Focus management on modal and sheet components (LearnModuleSheet, TurnReviewSheet) needs `inert` attribute or equivalent on background content.
- Alt text audit across all public-zone images (blog posts, exam landings, /a-propos illustrations).
- ARIA labels on all interactive components (recording controls, progress indicators, couche score bars).

**CI gate.** Lighthouse accessibility score must not regress below 90 on primary routes. Axe must report zero violations of impact level "critical" or "serious" on every route in the Playwright e2e suite.

---

## 18. Content versioning

**Model.** Each row in `islands`, `island_activities`, `pieges_catalog`, and related content tables carries a `content_version` integer (default 1) and a `published_at` timestamp. A user's active session binds to the `content_version` that was current when they opened the île or activity. Version bumps are explicit author actions, not automatic on edit.

**In-progress user policy.** If an author updates content while a user has an open session bound to the prior version, the user finishes their session on the old version. On their next session open, the platform detects the version delta and prompts: "This content has been updated. Start fresh with the new version?" The user can accept (rebind) or continue with their current version (carry forward). The system never silently changes in-progress experience.

**Migration policy.** If a content change is purely additive (new examples added, typos fixed), no version bump is required. If a change alters the scoring rubric, the island structure, or the Tâche prompt, a version bump is required and the in-progress prompt fires.

---

## 19. Performance budget

**Targets by surface category.**

| Category | LCP target | TTFB target | INP target |
|---|---|---|---|
| Public landing (/) | under 2.5s | under 800ms | under 200ms |
| SEO content (/pieges/[slug], /blog/[slug]) | under 2.5s | under 600ms | under 200ms |
| Authenticated app (/carte, /ile/[id]) | under 3s | under 1s | under 200ms |
| Tâche recording flow (/ile/[id]/tache) | under 2s | under 800ms | under 100ms (recording path is latency-critical) |

**CI gate.** Lighthouse CI is integrated into the Vercel preview deploy workflow. A budget regression on any of the three metrics above on a primary route fails the check and surfaces in the PR.

**Image optimization.** `next.config.mjs` currently sets `images.unoptimized: true`. Before Phase 3 (SEO growth), this must be re-evaluated: unoptimized images on SEO content pages will hurt LCP scores. Plan: enable Next.js image optimization selectively on public-zone routes.

---

## 20. PWA configuration

**Manifest.** `public/manifest.json` with name, short_name, icons (192px and 512px), theme_color, background_color, display: standalone, start_url: /carte (authenticated entry point after install).

**Service worker.** Offline shell: the app chrome (nav, layout) is cached. Content routes (/carte, /ile, /bibliotheque) show a "You are offline" state that links back to cached content where available. Recording and Tâche flows require connectivity; they show a clear offline message rather than failing silently.

**Install prompt.** The browser's `beforeinstallprompt` event is deferred and surfaced at an appropriate engagement moment (after first completed Tâche, or after day 3 active). The prompt fires once per user. AESTHETIC INPUT NEEDED (F-398): founder decides timing and visual treatment.

---

## 21. GDPR posture (consolidated)

Le Méthodic processes personal data as a controller. The product's GDPR posture:

**Data minimization.** Only the data needed for the product to function is collected. No third-party advertising pixels. No cross-site tracking.

**Data residency.** All first-party data (Postgres, Redis, Spaces) is hosted in DigitalOcean FRA1 (Frankfurt, EU). All third-party services used must offer EU data residency: Sentry EU endpoint, PostHog EU cloud or self-hosted, Postmark EU data processing agreement, ElevenLabs EU data processing agreement.

**Data export (right to portability).** Authenticated users can download a JSON archive of all their data from /profil: account fields, Target Profile, all Tâche attempts with transcripts and scores, recording metadata, subscription history, detected modules per session.

**Data deletion (right to be forgotten).** Authenticated users can delete their account self-serve from /profil. Deletion is a cascade: all user data is removed or anonymized within 30 days. Audio files on DO Spaces are deleted. Recordings are anonymized (user_id set to NULL, audio_url deleted, transcript_text deleted). The account row is soft-deleted with a `deleted_at` timestamp, then hard-deleted after 30 days.

**Cookie consent.** See section 16.

**Data processing agreements.** DPAs in place with: DigitalOcean, Vercel, Postmark, PostHog, Sentry, ElevenLabs, OpenAI, Anthropic, AssemblyAI, Mistral, LemonSqueezy.

---

## 22. Bill 96 posture (Quebec French primacy)

Quebec's An Act Respecting French, the Official and Common Language of Quebec (Bill 96) imposes French primacy in commercial dealings with Quebec consumers. Le Méthodic's compliance posture:

**Customer-facing documents.** All contracts (CGV, subscription terms) are authored in French. English translations are provided as accommodation. The French version governs.

**Customer support.** All support correspondence templates exist in French. Quebec-identified users receive French-first responses. English is offered only on explicit user request.

**Refund responses.** Refund response templates are authored in French.

**Marketing emails.** Quebec-segmented lists receive French-first emails.

**Product UI.** The product offers a French UI from onboarding. The adaptive bilingual rule (PRODUCT.md section 10) ensures French-primary interaction at B2 and above.

**Audit checklist (maintained alongside support templates).**
- All CGV sections authored in French: Y/N
- Subscription cancellation flow available in French: Y/N
- All auto-response emails have French version: Y/N
- All support macros have French version: Y/N
- Marketing list Quebec segment receives French-first: Y/N

Acceptance (F-386): documented audit with all checklist items Y, verified by Chadi before Phase 2.5 closes.

---

## 12. Architectural decisions log

Locked decisions, with the date and the reason.

**May 17, Q1 to Q8 (architecture).**
1. Multi-mode RAG, 6 retrieval modes.
2. Validator 3 tiers (auto-accept, eager sample, manual). Web admin +
   Slack + CSV. Eager-sample Tier B.
3. Diagnostic is 2-pass. Pass 2 ships at launch, Pass 1 ships post-launch.
4. PII handling: pseudonym + NER + retention policy. Legal budget
   $3K to $5K CAD.
5. Maturity is computed, not stored. Cache tiers: 5s + 20m warm; 30
   days for Premium, full Sprint + 14 days for Sprint.
6. Audio tiering: 50K eager + predictive for Premium, lazy otherwise.
7. L1-interference catalog: 6-factor promotion gate. Seed 200 to 500
   items.
8. Free funnel deferred post-launch.

**May 18, Linguistic Infrastructure Platform.** Druide trinity pattern:
one engine (the data layer + multi-model routing), multiple services
(the three product surfaces + Le Maître), many clients (TCF Canada,
DALF C1, future white-label channels). 95-98% margin target via the
cost cascade in section 6. LTV $1,500+. Y1 $500K, Y2 $1.5M to $2M,
Y3 $4M+.

**May 19, complete-site-or-nothing.** The site launches with the full
moat (Le Maître unified tutor, unified data layer, all Q1-Q8 architecture
decisions implemented) or it does not launch. No partial launches. The
locked criteria are quality-gated, not date-gated.

**May 25, Whisper STT scope.** Partial swap only. Async paths to Whisper
after the site is complete. Streaming paths stay on AssemblyAI.

**May 31, M5.5 inserted.** BE pre-monetization hardening between M5 and
M6. P-105, F-401, F-402, F-403. Documented in section 11 above. Shipped
June 2026.

## Content Layer

Le Méthodic uses MDX for île content in Phase 2. Content files live at /content/iles/[theme]/[level].mdx and ship with the FE bundle. Pages import MDX directly via Next.js MDX support.

The BE does not read île content. The BE only tracks state (user_progress, scoring, conversations, recordings). This architectural simplification removes the need for a content loader endpoint and keeps content edits in the git/deploy workflow.

The seven mold components (Dialogue, ActeDeParole, Chunks, Regle, Phonetique, Activite, Tache) live in /components/iles/molds/ and are imported into MDX files. Each mold has a fixed prop contract per PEDAGOGY.md.

Shared assets (images, audio) live at /public/iles/[theme]/ and are theme-keyed (not level-keyed; images shared across A2, B1, and C1 of the same theme).

The feat/payload-cms branch remains scaffolded for Phase 5 migration if content help joins. MDX-to-Payload migration is a planned future move, not a Phase 2 concern.

## Image Pipeline

Image generation uses Nano Banana Pro with the protocol locked in PEDAGOGY.md:

- Aesthetic: glossy, dimensional, rim-lit 3D renders per DESIGN.md v3 (the islands signature). The prior linocut/watercolor direction is retired; the PEDAGOGY.md image-pipeline prompts are pending re-authoring to v3 (see BACKLOG F-449).
- 4 to 6 style anchor references locked at Phase 2 start.
- Style plus content reference split prompting per generation.
- Variable-token prompting and trait locking for consistency.
- Required prompt vocabulary and required negative prompt baked into the master template.
- Storage: /public/iles/[theme]/ in FE repo for Phase 2; migrate to DigitalOcean Spaces with CDN at Phase 5.

Per-île image density: 6 to 8 images (5 essential plus 2 to 3 supplementary). Phase 2 (3 îles) totals approximately 18 to 24 images.
