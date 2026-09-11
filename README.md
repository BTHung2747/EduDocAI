# EduDocs AI

M1 document library for EduDocs AI. It contains the Next.js web app, NestJS API,
Prisma/PostgreSQL setup with pgvector, shared contracts, authentication, subject CRUD,
document upload/extraction, and a PostgreSQL-backed document worker. AI generation remains out of scope until M2.

## Prerequisites

- Node.js 22+ (Node 24 is supported)
- Docker Desktop
- Corepack (`corepack enable`)

## Run locally

```bash
corepack enable
corepack pnpm install
Copy-Item .env.example .env
docker compose up -d postgres
corepack pnpm db:generate
corepack pnpm db:migrate
corepack pnpm dev
```

Run the document worker in a second terminal after building it:

```bash
corepack pnpm --filter @edudocs/api build
corepack pnpm --filter @edudocs/api start:worker
```

- Web: http://localhost:3000
- API health: http://localhost:3001/api/v1/health

The API reads the root `.env`. The web uses `NEXT_PUBLIC_API_URL` when set, and otherwise
uses `http://localhost:3001/api/v1` during local development.

## Verification

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
```

## M1 flow and boundaries

1. Register then sign in at `http://localhost:3000/auth/register` and `/auth/login`.
2. Create subjects at `/subjects`, then upload a PDF with a text layer, DOCX, or UTF-8 TXT at `/documents`.
3. The API stores the original through `StorageAdapter`, creates `PROCESSING`, and enqueues a job.
4. The worker extracts text and transitions the document to `READY`; scanned PDFs and files without text become `FAILED` with `NO_EXTRACTABLE_TEXT` and can be retried.

M1 deliberately does not generate embeddings, summaries, topics, answers, citations, or questions. The AI panel is an explicit M2 placeholder.

## M2B-1 re-index

```powershell
corepack pnpm reindex -- --document-id <uuid>
corepack pnpm reindex -- --missing --dry-run
corepack pnpm reindex -- --missing
```

`--missing` only targets READY, non-deleted documents without chunks. `--dry-run` does not enqueue jobs.
