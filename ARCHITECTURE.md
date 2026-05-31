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
seal-app-75fiu.ondigitalocean.app. CORS posture: [BE-AUDIT: fill from
be-audit-2026-05-31.md security section].

**Database.** DigitalOcean managed Postgres 16, FRA1. pgvector extension
enabled. Connection pool config: [BE-AUDIT: fill from
be-audit-2026-05-31.md connection pool section, including SQLAlchemy
pool size, worker count, DO Postgres tier, and headroom at 100+
concurrent].

**Object storage.** Spaces FRA1. Used for audio uploads and generated
TTS artifacts. Audio tiering policy (Q6): 50K eager + predictive for
Premium, lazy otherwise.

**Backups.** pg_dump backup retained at
tache2_scenarios_pre_content_20260514_023212.sql on the prod BE
container. Backup cadence: [BE-AUDIT: confirm or fill].

## 9. Current state vs target state

The BE audit on 2026-05-31 (docs/be-audit-2026-05-31.md, BE repo)
surfaced the gaps between the BE we run and the BE we need for soft-beta.
M5.5 closes them.

**Audit scorecard.** [BE-AUDIT: paste the area-by-area scores and top
risk lines from Section 6 of the audit doc].

**Top 5 to fix before soft-beta.** [BE-AUDIT: paste the prioritized
list from the audit scorecard].

**Per-area state.**

- Tier enforcement. No-op (P-105). M5.5 closes.
- Rate limiting on AI endpoints. Missing (F-401). M5.5 closes.
- FK indexes. Missing on recordings.user_id and feedbacks.recording_id,
  plus any others the audit named (F-402). M5.5 closes.
  [BE-AUDIT: list any additional FK indexes from audit Section 3].
- N+1 queries. Present on 8 of 14 audited endpoints (F-403).
  [BE-AUDIT: list the 8 endpoints from audit Section 1]. M5.5 closes.
- Pagination. [BE-AUDIT: fill from audit Section 2. Which endpoints
  paginate, which do not, where is the highest risk].
- Connection pool. [BE-AUDIT: fill from audit Section 4. SQLAlchemy
  pool config, worker count, DO Postgres tier, headroom at 100+
  concurrent].
- Security. Stripe webhook signature verification: in place (audit
  confirmed). [BE-AUDIT: fill the rest from audit Section 5, including
  auth posture on admin endpoints, CORS, secret handling].

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
