# EduDocs AI — Codex handoff

> Snapshot: 2026-09-09. This document records the repository's current state only; it is not a new implementation plan.

## Project objective

EduDocs AI is a personal learning portal: users organise subjects and learning documents, extract and search document content, obtain grounded AI assistance (summary, topics, Q&A, and generated questions), build question banks/tests, and take/grade attempts. All user-owned resources are isolated by the authenticated owner.

## Stack and monorepo

- Package manager/runtime: pnpm 10.18.3 through Corepack; Node.js 22+ (the latest verification used Node 24.11.1).
- Web: Next.js 15.5, React 19, TypeScript, Tailwind CSS 4.
- API/worker: NestJS 11, TypeScript, Zod contracts, JWT + refresh-cookie auth.
- Data: PostgreSQL and Prisma 6.16; generated Prisma client lives in `apps/api/src/generated/prisma`.
- AI: local Hugging Face Transformers embeddings; OpenRouter for structured LLM generation.
- Storage: `StorageAdapter`, currently implemented by local filesystem storage. S3 variables exist, but no S3 adapter is registered.
- CI: GitHub Actions runs install, Prisma generation, lint, typecheck, test, and build on PRs and `main`.

```text
apps/
  web/                 Next.js app-router frontend
  api/                 NestJS API, workers, commands, generated Prisma client
packages/
  contracts/           shared Zod schemas and TypeScript types
prisma/
  schema.prisma        canonical data model
  migrations/          9 SQL migrations
docs/
  design-reference/    reference screenshots
```

## Delivered milestones

- **M0 — Foundation:** pnpm monorepo, Next.js/NestJS, Prisma/PostgreSQL, shared contracts, auth lifecycle, health endpoint, baseline CI.
- **M1 — Documents + standard UI:** authenticated app shell, subjects CRUD, upload/list/detail/download/update/delete/retry documents, local storage, text extraction for PDF/DOCX/TXT, and document worker.
- **M2 — RAG + AI:** text chunking and local embeddings, semantic retrieval, grounded document Q&A with citations, document-analysis jobs for summaries/topics, OpenRouter fallback router, and re-index command.
- **M3 — Question Bank + Import:** AI question-generation job, manual question CRUD/approval, citations/options, and DOCX/TXT import preview/edit/commit.
- **M4 — Tests + Attempts:** test creation/configuration/question ordering/publishing, immutable question snapshots, attempts, answer autosave, submission, grading, result and result-list APIs.

M5 hardening is not started.

## Current API surface

All paths below are prefixed with `/api/v1`. Except `/health` and `/auth/*`, endpoints require a JWT access token.

- `GET /health`
- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password`.
- Subjects: `GET|POST /subjects`, `PATCH|DELETE /subjects/:id`.
- Documents: `GET|POST /documents`, `GET|PATCH|DELETE /documents/:id`, `GET /documents/:id/content`, `GET /documents/:id/download`, `POST /documents/:id/retry`, `GET /documents/:id/summary`, `GET /documents/:id/topics`, `POST /documents/:id/ask`.
- Search and AI jobs: `POST /search/semantic`; `GET|POST /ai/jobs`, `GET /ai/jobs/:id`; `POST /question-generations`.
- Questions: `GET|POST /questions`, `GET|PATCH|DELETE /questions/:id`, `POST /questions/:id/approve`.
- Question imports: `POST /question-imports`, `GET /question-imports/:id`, `PATCH /question-imports/:id/items/:itemId`, `POST /question-imports/:id/commit`.
- Tests: `GET|POST /tests`, `GET|PATCH|DELETE /tests/:id`, `POST /tests/:id/questions`, `DELETE /tests/:id/questions/:questionId`, `PATCH /tests/:id/questions/reorder`, `POST /tests/:id/publish`.
- Attempts/results: `POST /tests/:id/attempts`, `GET /attempts/:id`, `PATCH /attempts/:id/answers/:testQuestionId`, `POST /attempts/:id/submit`, `GET /attempts/:id/result`, `GET /results`.

## Prisma state

The current schema has these models:

`User`, `RefreshSession`, `PasswordResetToken`, `AiJob`, `Subject`, `Document`, `DocumentSection`, `DocumentChunk`, `DocumentAnalysis`, `Question`, `QuestionOption`, `QuestionCitation`, `QuestionImport`, `QuestionImportItem`, `Test`, `TestQuestion`, `Attempt`, and `AttemptAnswer`.

Important enums: `UserRole`, `UserStatus`, `AiJobStatus`, `DocumentStatus`, `DocumentAnalysisStatus`, `QuestionSourceType`, `QuestionStatus`, `Difficulty`, `QuestionImportStatus`, `TestStatus`, and `AttemptStatus`.

The nine applied migrations are:

1. `20260907000000_m0_foundation`
2. `20260908000000_m1_documents`
3. `20260909000000_m2_rag`
4. `20260910000000_m2_analysis`
5. `20260911000000_m3_question_bank`
6. `20260912000000_m3_question_management`
7. `20260913000000_m3_tests`
8. `20260914000000_m4_attempts`
9. `20260915000000_m4_attempt_totals`

## Frontend — Phase 1 status

Phase 1 is implemented for the existing app shell, auth screens, subject management, and document library/detail flow. Current routes are `/`, `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/subjects`, `/documents`, and `/documents/[documentId]`.

The document views call the live API for upload, filtering, pagination, metadata editing, retry/download/delete, content search, summary/topics display, and grounded Q&A. The detail screen gracefully presents AI-not-configured, pending, failed, and succeeded states.

The sidebar entries for overview, question bank, tests, results, and settings still point to `#`; their M3/M4 backend APIs exist but their product UI does not. Global search, notifications, account/usage display, and password-reset delivery are also UI/placeholders rather than finished end-to-end experiences.

## Important technical decisions

- Store embeddings as PostgreSQL `DOUBLE PRECISION[]` (`Float[]` in Prisma) on `DocumentChunk`.
- Calculate cosine similarity in NestJS (`VectorRepository`), after reading a bounded candidate set from PostgreSQL. Embeddings are fixed to the current 384 dimensions.
- Use the local embedding model `Xenova/paraphrase-multilingual-MiniLM-L12-v2` by default.
- Use OpenRouter with free models only: models must end in `:free` or equal `openrouter/free` unless `ALLOW_PAID_MODELS=true`. The intended default is false; do not silently enable paid models.
- Do not introduce Docker or pgvector for the active implementation. PostgreSQL is used directly and vector search is application-side. The checked-in `docker-compose.yml` and parts of the older README still describe a Docker/pgvector setup; treat them as stale documentation, not the target architecture.
- Workers are separate processes but use the same Nest application context and PostgreSQL-backed jobs: document extraction, document analysis, and question generation are started by `src/worker.ts`.

## Environment variables

Copy `.env.example` to `.env`; provide values out of band. Never commit `.env` or secret values.

```text
# Shared/runtime
NODE_ENV
PORT
DATABASE_URL
APP_URL
API_URL
NEXT_PUBLIC_API_URL
CORS_ORIGIN

# Authentication
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_TTL_SECONDS
JWT_REFRESH_TTL_DAYS

# Storage and quotas
STORAGE_DRIVER
STORAGE_LOCAL_PATH
S3_ENDPOINT
S3_BUCKET
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
MAX_UPLOAD_BYTES
DEFAULT_USER_QUOTA_BYTES

# AI, embeddings, and semantic search
AI_PROVIDER_ORDER
OPENROUTER_API_KEY
AI_MODEL_PRIMARY
AI_MODEL_FALLBACKS
ALLOW_PAID_MODELS
AI_MAX_RETRIES_PER_MODEL
EMBEDDING_PROVIDER
EMBEDDING_MODEL
EMBEDDING_DIMENSION
HF_CACHE_DIR
SEMANTIC_SEARCH_CANDIDATE_LIMIT
SEMANTIC_SEARCH_TOP_K
SEMANTIC_SEARCH_THRESHOLD
```

`DATABASE_URL`, `APP_URL`, `API_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `DEFAULT_USER_QUOTA_BYTES` are required by API environment validation. `OPENROUTER_API_KEY` is needed to use LLM features; without it, the API reports `AI_NOT_CONFIGURED`.

## Commands

Run from the repository root:

```powershell
# One-time setup after configuring .env
corepack enable
corepack pnpm install
corepack pnpm db:generate
corepack pnpm db:migrate

# Development servers (or use `corepack pnpm dev` for both)
corepack pnpm --filter @edudocs/web dev
corepack pnpm --filter @edudocs/api dev

# Worker: build API first, then use a second terminal
corepack pnpm --filter @edudocs/api build
corepack pnpm --filter @edudocs/api start:worker

# Optional M2 re-indexing
corepack pnpm reindex -- --document-id <uuid>
corepack pnpm reindex -- --missing --dry-run
corepack pnpm reindex -- --missing
```

Default local URLs: web `http://localhost:3000`; API health `http://localhost:3001/api/v1/health`.

## Deferred technical debt / hardening

- No pgvector/indexed nearest-neighbour search; the NestJS cosine implementation has a configurable bounded candidate scan and will need a scalability review as data grows.
- Storage currently resolves only the local adapter; S3 configuration is not a working adapter yet.
- Password-reset tokens are created securely but no mail/delivery adapter sends the raw token, so a user cannot complete the real forgot-password flow.
- M5 work remains: admin/security hardening, quota UX/enforcement review, accessibility, E2E coverage, visual regression, and deployment/runbook work.
- README is stale in its M1-only/Docker/pgvector wording and should be reconciled later; do not use it as the sole status source.

## Known issue / work in progress

There is no active code change in progress. The immediate known defect is lint:

- `apps/api/src/modules/questions/question-import.parser.ts:14` violates ESLint rule `no-control-regex` for the control-character cleanup regex. This is the only current lint error. Do not change behavior in a handoff-only pass; address it before declaring the quality gate green.

The next planned product task is **Frontend Phase 2**: build the UI for Question Bank, question import/review, test builder/publishing, taking attempts/autosave/submission, and results, wiring it to the completed M3/M4 APIs.

## Latest verification

Executed on 2026-09-09 from the repository root:

| Check | Result |
| --- | --- |
| `corepack pnpm lint` | **Fail** — 1 error, `no-control-regex` at `question-import.parser.ts:14`; no warnings. |
| `corepack pnpm typecheck` | **Pass** — contracts, web, API. |
| `corepack pnpm test` | **Pass when completed per package** — contracts: 1 test; web: 1 test; API: 13 suites / 33 tests; total 15 suites / 35 tests. |
| `corepack pnpm build` | **Pass** — contracts TypeScript build, Nest build, and Next production build. |

The first aggregate test invocation stopped emitting output after the API test started, so the API suite was immediately rerun separately and passed in full. This is an execution/output observation, not a test failure.
