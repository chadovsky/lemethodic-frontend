# Architecture

Le Méthodic is a French oral exam prep and linguistic infrastructure
platform for English speakers pursuing TCF Canada (primary, 90%) and
DALF C1 (secondary, 10%). This document describes how the system is
built. Current state and target state are tracked together, with audit
gaps in section 9.

## 1. Product surfaces

Three product systems plus the tutor persona share a single accent stack.

| Surface | Route | What it does | State |
|---|---|---|---|
| La Methode | /la-methode | 27 lessons. Fondations 1 to 16 + Approfondissement 17 to 27. Curriculum for the 5-couche methodology. | Shipped |
| La Bibliotheque | /la-bibliotheque | Chunk-based French vocab. Modes: browse, practice, test, tutor. Source for the 945K chunk data layer. | MVP shipped, content pipeline in progress (F-321) |
| L'Examen | /l-examen | TCF Canada simulation. Four sections under /l-examen/*: comprehension orale, comprehension ecrite, expression orale, expression ecrite. Tache 1, 2, 3 with AI examiner. 4-couche live scoring + La Musique. | In progress |
| Le Maitre | unified across surfaces | ElevenLabs Chadi voice clone. Tutor persona for onboarding, La Methode lessons, La Bibliotheque coaching. Not the examiner. | M5 target |

The 5-couche methodology (Le Propos, Le Plan, La Construction, Les Pieges
Anglais, La Musique) is the lens applied across all three surfaces.
Les Pieges Anglais (L1-interference traps for anglophones) is the
product's key differentiator.

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
Llama (bulk generation). ElevenLabs (Le Maitre voice clone, M5).
Claude API (orchestration and scoring).

**Auth and payments.** Email + passwordless auth on BE. Stripe via US
LLC (Stripe Atlas, Delaware) with Mercury bank. Stripe is live for M6,
not before.

## 3. Data layer

The database is the moat. The architecture is what compounds, not the
corpus size.

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

**Retrieval.** Multi-mode RAG (Q1, locked May 17): 6 retrieval modes via
pgvector. Used by La Bibliotheque tutor mode, L'Examen scoring, and the
Diagnostic 2-pass system. Pass 2 ships V1, Pass 1 ships V1.5+ (Q3).

**Active data tickets.** D-032 (quality_tier column: academic, useful,
reserve, example), D-033 (scoring_rubrics table for TCF Canada 3 axes
+ DELF B2 + DALF C1), D-034 (B2 enrichment), D-035 (lang-aware schema),
D-036 (free CEFR sourcing via CoE Companion 2020 + FEI rubric, replaces
canceled D-026 Beacco).

## 4. Multi-model routing

No single model does everything. Each surface routes to the model with
the best price-to-quality fit for its task.

| Task | Model | Why |
|---|---|---|
| French-critical generation (Diagnostic scoring, enrichment, couche tagging) | Mistral Large | Best French fluency at usable cost |
| Bulk generation (vocab variants, drill content) | Groq Llama | Cheap throughput, French quality acceptable for non-critical paths |
| Examiner voice (Tache 1, 2, 3) | OpenAI TTS-1-HD | Brand-critical. Locked. Not swappable to Piper or Supertonic |
| Tutor voice (Le Maitre) | ElevenLabs | Chadi voice clone, unified tutor persona |
| Embeddings | OpenAI | Pairs cleanly with pgvector, mature ecosystem |
| Orchestration and reasoning | Claude API | Scoring, structured output, complex prompts |

## 5. Audio pipeline

Two pipelines, split by latency requirement.

**Streaming (Tache 1 and 2).** AssemblyAI. Sub-1s latency required for
live examiner turn-taking. Stays on AssemblyAI for V1. Whisper streaming
would need GPU ($300 to $1,000 per month) that does not pencil pre-volume.
V1.1+ contingency: GPT-4o-transcribe (March 2025) if Whisper FR accent
quality is insufficient when we revisit.

**Async (Tache 3, vocab, batch scoring).** Currently AssemblyAI. Target:
Whisper post-soft-beta, via Groq (approximately $0.04/hr) or CPU
self-host (S-001, S-002). Cost cascade is the lever for the 95-98%
margin target.

Do not churn audio pre-launch. The AssemblyAI auto-correction layer may
smooth out exactly the L1-interference signal Les Pieges Anglais
detection depends on, so the swap is monitored, not assumed.

## 6. Authentication and tier enforcement

**Current state.** The tier resolver on BE returns "free" for all users,
regardless of DB state. This was surfaced by the BE audit on 2026-05-31
and is logged as P-105. Until P-105 ships, server-side tier gating is a
no-op and any paywall behavior would be cosmetic.

**Target state.**
- M5.5 (P-105): tier resolver reads real subscription state from DB and
  enforces on every gated endpoint. 402/403 on tier violation. Tested
  with a free-tier token rejected from a paid endpoint.
- M5.5 (F-401): per-user rate limits on AI endpoints, Redis-backed,
  429 on breach.
- M6: Stripe webhook handler writes the correct subscription_tier value
  into the DB on subscription events. The webhook does not enforce; it
  populates. Enforcement is M5.5.
- B-100: LLC formation + EIN + Mercury + Stripe activation. Now unblocks
  P-106 (Stripe trial mechanics) only. P-105 is independent of Stripe.

This split exists because enforcement and population are different
problems, and bundling them hides the dependency.

## 7. External integrations

| Integration | Purpose | State |
|---|---|---|
| Stripe (via Atlas LLC) | Subscription billing | M6 |
| Mercury | Bank account for Stripe payouts | Pending B-100 |
| AssemblyAI | Streaming STT | Live |
| OpenAI | TTS-1-HD examiner, embeddings | Live |
| ElevenLabs | Le Maitre voice clone | M5 (+$1.2K/yr) |
| Mistral, Groq | LLM routing | Live |
| Anthropic Claude API | Orchestration | Live |

## 8. Production infrastructure

**Frontend.** Vercel. Domain lemethodic.com. Edge-deployed.

**Backend.** DigitalOcean App Platform, FRA1. URL
seal-app-75fiu.ondigitalocean.app. CORS posture: CORS is locked to specific origins: localhost:3000 and localhost:3001
for local dev, https://lemethodic.com, https://www.lemethodic.com (apex
and www), https://lemethodic-frontend.vercel.app (Vercel canonical), and
a FRONTEND_ORIGIN env var for overflow. Credentials are allowed. Methods
and headers use wildcards, which is acceptable given the origin
whitelist. Not open to all origins. Status: PASS.

**Database.** DigitalOcean managed Postgres 16, FRA1. pgvector extension
enabled. Connection pool config: SQLAlchemy defaults in effect: pool_size=5, max_overflow=10 (neither
explicitly set in app/database.py). pool_pre_ping=True (explicitly set).
pool_recycle is not set, which is a low-grade risk on long-lived
single-worker deploys where TCP-level timeouts on the DO managed
Postgres side can strand connections. Recommended fix: pool_recycle=1800.
Single Uvicorn worker, no Gunicorn, instance size basic-xxs on DO App
Platform. Max simultaneous DB connections at current config: 1 worker x
(5 + 10) = 15. DO Hobby Postgres tier (production: false in .do/app.yaml,
approx $7/mo) typically allows 22 to 25 connections; founder should
confirm via DO console or "SHOW max_connections;" in psql. At one
instance, headroom is comfortable. At two instances (30 connections),
the Hobby tier limit is likely exceeded. Planned trigger for upgrading
to DO Basic (approx $15/mo, approx 97 connections) is adding a second
instance.

**Object storage.** Spaces FRA1. Used for audio uploads and generated
TTS artifacts. Audio tiering policy (Q6): 50K eager + predictive for
Premium, lazy otherwise.

**Backups.** pg_dump backup retained at
tache2_scenarios_pre_content_20260514_023212.sql on the prod BE
container. Backup cadence: UNKNOWN, founder confirms. The audit did not cover DO Postgres backup
cadence. CLAUDE.md references DO daily auto-backup as a migration
rollback fallback but the backup schedule, retention period, and restore
procedure are not documented in the codebase or the audit.

## 9. Current state vs target state

The BE audit on 2026-05-31 (docs/be-audit-2026-05-31.md, BE repo)
surfaced the gaps between the BE we run and the BE we need for soft-beta.
M5.5 closes them.

**Audit scorecard.** From audit Section 6 (2026-05-31 static code analysis):

| Area | Score (0-10) | Top risk |
|---|---|---|
| N+1 queries | 4 | Analytics dashboard triggers N feedback queries per recording load |
| Pagination | 6 | GET /api/admin/users has no limit; analytics dashboard is unbounded per user |
| Indexes | 3 | recordings.user_id and feedbacks.recording_id have no indexes; both are the hottest columns in the system |
| Connection pool | 7 | pool_recycle not set; single Uvicorn worker; within DO limits at MVP traffic |
| Security | 6 | Tier gate returns "free" for all users; AI endpoints have no per-user rate limits |

**Top 5 to fix before soft-beta.**
1. Add indexes on recordings.user_id and feedbacks.recording_id. Every
   analytics request is currently a full table scan compounded by N+1
   full scans on feedbacks.
2. Add selectinload to all analytics and recording-history endpoints.
   Eight endpoints access r.feedback in a Python loop with no eager
   loading; fix is one import and one .options() call per endpoint.
3. Rate-limit AI-calling endpoints per user.
   POST /api/recordings/{id}/transcribe,
   POST /api/conversations/{id}/turns, and
   POST /api/writing/submit have no per-user rate limits; a single user
   can drain Claude and AssemblyAI budgets in minutes.
4. Wire P-105: _resolve_user_tier() returns "free" for all users
   unconditionally. All tier gates on protected routes are currently
   no-ops; any registered user has full access to premium endpoints.
   Must be resolved before charging users.
5. Paginate GET /api/admin/users. No limit clause today; will become a
   full-table scan plus 2N subqueries as user count grows.

**Per-area state.**

- Tier enforcement. No-op (P-105). M5.5 closes.
- Rate limiting on AI endpoints. Missing (F-401). M5.5 closes.
- FK indexes. Missing on recordings.user_id and feedbacks.recording_id,
  plus any others the audit named (F-402, M5.5 closes). The following FK
  columns have no confirmed index in any Alembic migration (all marked
  "needs verification" in the audit, derived from ORM model definitions):
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
- N+1 queries. Present on 8 of 14 audited endpoints (F-403, M5.5 closes).
  Audit Section 1 identifies 8 of 14 audited list endpoints with N+1 or
  compound-subquery-per-row patterns. Only GET /api/recordings uses eager
  loading correctly.
  - GET /api/analytics/dashboard (HIGH: 1 recording query + N feedback lazy-loads, up to 51 queries per page load for a user with 50 recordings)
  - GET /api/analytics/progress (HIGH: up to 100 feedback lazy-loads per call, limit=100 applies but no eager loading)
  - GET /api/analytics/pass (HIGH: unbounded feedback lazy-load loop, no limit)
  - GET /api/admin/dashboard (MEDIUM: up to 20 feedback lazy-loads, admin-only endpoint)
  - GET /api/admin/users (HIGH plus compound subqueries: N recording lazy-loads plus N avg aggregate subqueries per user row; 201 queries at 100 users, 2001 at 1000 users)
  - GET /api/recordings/history (HIGH: up to 50 feedback lazy-loads per call, despite being in the same file as the correctly-eager GET /api/recordings)
  - GET /api/writing/history (HIGH: up to 50 explicit WritingPrompt subqueries inside the result loop, not relationship lazy-loading but same cost pattern)
  Note: the audit summary states 8 of 14; the 7 above are the MEDIUM/HIGH
  classified endpoints. One LOW-risk entry (analytics/coverage or
  analytics/recurring) accounts for the 8th in the summary count.
- Pagination. Paginated correctly: GET /api/recordings (limit required, max 100, with
  eager loading), GET /api/vocab/topics/{slug}/chunks (limit+offset,
  max 100, on the 945K-row chunks table). Partially paginated with
  hardcoded limits: GET /api/recordings/history (50 hardcoded),
  GET /api/writing/history (50 hardcoded). Paginated via query param:
  GET /api/analytics/progress (limit param, max 100),
  GET /api/analytics/recurring (limit, max 50). Unbounded and
  highest-risk: GET /api/analytics/dashboard (all done recordings per
  user, no limit), GET /api/analytics/pass (all done recordings, no
  limit), GET /api/admin/users (no limit clause, full table scan plus 2N
  subqueries per row). Bounded catalogs with no pagination but LOW risk
  (small stable tables): admin/topics, admin/themes, ecole/lessons,
  modules, writing/prompts, vocab/topics, conversations/scenarios. No
  endpoint reaches the 945K vocab_chunks table without pagination.
- Connection pool. See section 8 (Database, Connection pool config) for
  the full pool config (pool_size=5, max_overflow=10, pool_pre_ping=True,
  pool_recycle not set). Reproducing the key deployment numbers here for
  the architecture section: single Uvicorn worker, instance size
  basic-xxs, request_timeout_seconds=180. Max simultaneous DB
  connections: 15. DO Hobby Postgres connection ceiling: approx 22 to 25
  (needs founder to verify). At one instance the gap is about 7 to 10
  connections. FastAPI sync endpoints (def, not async def) run in a
  shared thread pool defaulting to 40 threads; under high concurrent load
  up to 25 threads can block waiting for a pool slot, which is the
  materialization point for connection exhaustion. Risk is low at MVP
  traffic and materializes around 50+ concurrent users. pgbouncer is not
  present; acceptable at MVP, to be revisited before multi-instance
  scaling.
- Security. Stripe webhook signature verification: in place (audit
  confirmed). Auth: JWT HS256 access tokens (15-min TTL) plus refresh
  tokens with jti stored in DB, 7-day TTL, token chain invalidation on
  replay of a rotated token. Email verification and password reset use
  hashed random 32-byte tokens (SHA-256 hash stored, 24h and 1h TTL
  respectively). Cookie flags are correct (httponly=True, samesite=lax,
  secure=True in prod). Status: PASS. Admin endpoints use the same JWT
  auth as all other endpoints; no separate admin RBAC layer was audited
  beyond standard auth guards. CORS: locked to specific origins only (see
  section 8 / Backend / CORS posture). Wildcard methods/headers are
  acceptable given origin lock. Status: PASS. Secret handling: no
  hardcoded API keys or secrets found in any source file; all secrets
  sourced via app/config.py settings object from environment variables;
  .env.example and .env.production.example use placeholder values only.
  Status: PASS. Critical pre-launch risk: _resolve_user_tier() in
  app/services/tiers.py returns the string "free" for all users
  unconditionally (P-105 Phase A stub). All subscription tier gates and
  enforce_min_tier() calls throughout the codebase are currently no-ops;
  any registered user has full access to every premium endpoint regardless
  of subscription_tier stored in the DB. Fix is a one-line change to
  return getattr(user, "subscription_tier", "free"). Must be resolved
  before charging users. Cost risk: rate limiting (Redis-backed
  dual-window limiter) is applied to 5 auth endpoints only.
  POST /api/recordings/{id}/transcribe, POST /api/recordings/{id}/analyze,
  POST /api/conversations/{id}/turns, POST /api/writing/submit, and all
  ElevenLabs TTS endpoints have no per-user rate limits.

## 10. Architectural decisions log

Locked decisions, with the date and the reason.

**May 17, Q1 to Q8 (architecture).**
1. Multi-mode RAG, 6 retrieval modes.
2. Validator 3 tiers (auto-accept, eager sample, manual). Web admin +
   Slack + CSV. Eager-sample Tier B.
3. Diagnostic is 2-pass. Pass 2 ships V1, Pass 1 ships V1.5+.
4. PII handling: pseudonym + NER + retention policy. Legal budget
   $3K to $5K CAD.
5. Maturity is computed, not stored. Cache tiers: 5s + 20m warm; 30
   days for Premium, full Sprint + 14 days for Sprint.
6. Audio tiering: 50K eager + predictive for Premium, lazy otherwise.
7. L1-interference catalog: 6-factor promotion gate. Seed 200 to 500
   items.
8. Free funnel deferred to V1.1.

**May 18, Linguistic Infrastructure Platform.** Druide trinity pattern:
one engine (the data layer + multi-model routing), multiple services
(the three product surfaces + Le Maitre), many clients (TCF Canada,
DALF C1, future white-label channels). 95-98% margin target via the
cost cascade in section 5. LTV $1,500+. Y1 $500K, Y2 $1.5M to $2M,
Y3 $4M+.

**May 19, V2-or-nothing.** Soft-beta launches with the full moat
(Le Maitre unified tutor, unified data layer, all Q1-Q8 architecture
decisions implemented) or it does not launch. No partial launches.
The locked criteria are quality-gated, not date-gated.

**May 25, Whisper STT scope.** Partial swap only. Async paths to
Whisper post-soft-beta. Streaming paths stay on AssemblyAI for V1.

**May 31, M5.5 inserted.** BE pre-monetization hardening between M5
and M6. P-105, F-401, F-402, F-403. Documented in section 6 above.
