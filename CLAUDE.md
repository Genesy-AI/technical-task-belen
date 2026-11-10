# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

TinyEnginy take-home: a lead-management app. It has two independent pnpm packages, `backend/` (Express + Prisma/SQLite + Temporal) and `frontend/` (React 18 + Vite + TanStack Query + Tailwind v4). There is no root package.json, so run every command from inside the package directory. Node version comes from `.nvmrc` (v22). The task list (bugs, features, provider API specs for the enrich-phone workflow) is in README.md.

## Commands

Backend (`cd backend`):
- `pnpm install && pnpm migrate:dev && pnpm gen:prisma`: one-time setup
- `temporal server start-dev`: Temporal dev server on localhost:7233. It must be running before the API starts, because the worker connects at boot and the process exits if that fails.
- `pnpm dev`: API on :4000 (nodemon + ts-node). The Temporal worker also runs in this process.
- `pnpm migrate:dev`: run after editing `prisma/schema.prisma` (it also regenerates the client)
- `pnpm build`, `pnpm format`. There is no lint script.

Frontend (`cd frontend`):
- `pnpm dev`: Vite dev server. The API base URL comes from `VITE_API_URL` in `frontend/.env` (http://localhost:4000).
- `pnpm build` (tsc -b + vite build), `pnpm lint` (ESLint, max-warnings 0), `pnpm format`

Tests (Vitest in both packages; `pnpm test` runs in watch mode when interactive):
- All tests once: `pnpm vitest run`
- Single file: `pnpm vitest run src/utils/csvParser.test.ts`
- Single test by name: `pnpm vitest run -t "test name"`
- Backend tests use the `node` environment. Frontend tests use `jsdom` with `src/test/setup.ts` (jest-dom). Both packages alias `@` to `./src`.

## Architecture

Backend
- `src/index.ts` holds every Express route inline, with no router or service layer: lead CRUD, `POST /leads/bulk` (CSV import, dedups on firstName+lastName), `POST /leads/generate-messages`, and `POST /leads/verify-emails`. It uses one module-level `PrismaClient`, and CORS is hand-rolled middleware.
- Temporal: `src/worker.ts` starts a worker on task queue `myQueue`, namespace `default`. `workflowsPath` points at `src/workflows/index.ts`, and activities come from `src/workflows/activities/`. Workflow code runs in Temporal's deterministic sandbox, so it may only import activity *types* and call them through `proxyActivities` (timeouts and retry policy are set there). I/O belongs in activities.
- `verify-emails` opens a new Temporal client connection per request and calls `client.workflow.execute` once per lead, sequentially and synchronously, inside the HTTP request.
- `src/utils/messageGenerator.ts` replaces `{fieldName}` placeholders using an explicit `availableFields` whitelist. It throws on unknown or empty fields.
- DB: SQLite at `prisma/dev.db`, which is committed. The single `lead` model is in `prisma/schema.prisma`.

Frontend
- Typed API layer in `src/api/`: `utils.ts#endpoint<Output, Input>(method, pathOrBuilder)` builds axios callers, `modules/leads.ts` declares the endpoints, and `types/leads/*.ts` holds hand-written request/response types. Nothing generates these types from Prisma, so a new lead field has to be added to the Prisma schema, the backend route(s), `messageGenerator.ts`, and the frontend types by hand.
- `mutations/useApiMutation.ts` is a typed mutation registry (currently only `leads.create`). Components mostly call `useQuery`/`useMutation` directly with `api.leads.*` and invalidate the `['leads', 'getMany']` query key.
- UI: `App.tsx` renders `components/LeadsList.tsx` (table, selection, delete, verify emails), `CsvImportModal.tsx` (parses with `utils/csvParser.ts`, then calls `bulkImport`), and `MessageTemplateModal.tsx`. Toasts use react-hot-toast, configured in `Providers.tsx`.
- Sample CSVs for manual testing are in `docs/`, and UI wireframes are in `docs/ui-wireframes.png`.

## Gotchas
- The frontend `leads.update` sends `PUT /leads/:id`, but the backend only defines `PATCH /leads/:id`.
- The frontend and backend lead types are maintained separately and have drifted (for example, `lastName` and `email` are nullable in the frontend types but required in the schema).
- Formatting: Prettier configs live in each package. Code style is no semicolons, single quotes, 2-space indent, 110-char print width.

## Working agreement
- Follow the existing code style, patterns and libraries. Don't add new dependencies without asking.
- Keep changes scoped to the current task. If you notice something unrelated worth improving, tell me instead of changing it.
- If a decision affects product behavior or UX, ask instead of assuming.
- For every task, include in the plan which existing tests are affected and which new tests are needed. After implementing, run the tests (and lint/typecheck if available) and make sure nothing is broken.
