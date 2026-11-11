# TinyEnginy: Codebase Improvements

Improvements found while working on the take-home tasks and reviewing the codebase. They are grouped in the order I would tackle them, from quick wins to bigger changes.

---

## 1. Quick wins

### Setup fails with pnpm 10+

**Problem:** Newer pnpm versions block dependency build scripts unless they are approved. On a fresh clone, Prisma and Temporal are not built and the app fails with confusing errors.

**Proposal:** Commit the `allowBuilds` config (`pnpm-workspace.yaml`) in both packages, pin the pnpm version with `packageManager` in `package.json`, and mention it in the README.

### `.env.sample` is outdated

**Problem:** It points `DATABASE_URL` to MySQL, but the project uses SQLite, and no real environment variable is documented.

**Proposal:** List the variables the backend actually uses, and read the database URL and Temporal address from the environment instead of hard-coding them.

### `dev.db` is committed to git

**Problem:** Every local test changes a binary file that shows up in `git status`, can end up in PRs, and causes merge conflicts that can't be resolved by hand.

**Proposal:** Add it to `.gitignore` and provide a seed script to recreate the sample data.

### API contract mismatches and dead code

**Problem:** `leads.update` sends `PUT` but the backend only has `PATCH`, and `create`/`update` send `firstName` while the backend reads `name`. Nothing breaks today because no screen uses them (including `useApiMutation`), but the first "create" or "edit lead" feature will hit these bugs.

**Proposal:** Fix the contract or remove the unused endpoints and `useApiMutation`.

### Email verification rejects valid emails with `+`

**Problem:** The `verifyEmail` activity marks any email with `+` as invalid, but addresses like `ana+work@gmail.com` are valid and common.

**Proposal:** Remove that rule (or replace the mock with a real provider) and add a test for it.

---

## 2. Data quality

### Import deduplication

**Problem:**

- Duplicates are detected by first name + last name instead of email.
- Duplicated rows inside the same file are all imported. The backend only compares against the database.
- The same email can be imported for two different people.

**Proposal:** Agree with Product on the identity key (email is the natural choice), deduplicate within the file and against the database, and show the skipped rows in the import summary.

### Import is not transactional

**Problem:** `/leads/bulk` creates leads one by one. It's slow for large files, and if it fails halfway, the import is partially applied.

**Proposal:** Use `createMany` or a transaction, and decide between "all or nothing" and "partial import with a detailed report".

### Unknown CSV columns are dropped silently

**Problem:** Columns the parser doesn't recognize (a typo in a header, an unsupported field) are ignored without telling the user.

**Proposal:** Show a warning in the import preview with the columns that will be ignored.

### Validation rules are duplicated between frontend and backend

**Problem:** Country codes, field normalizers (phone, years in role, LinkedIn) and the list of message template fields are written twice, with "keep in sync" comments. If one side changes and the other doesn't, the preview and the backend disagree.

**Proposal:** Keep the backend as the single source of truth: either a small shared package, or expose what the frontend needs from the API (e.g. `GET /leads/fields` with each field's key, label and group).

---

## 3. Workflows

### Temporal: timeouts, retries and idempotency

**Problem:**

- An activity without an explicit retry policy retries forever, which is what caused the email verification hang.
- Workflow IDs include `Date.now()`, so the same lead can have several workflows running at once (e.g. double click).
- `verify-emails` opens a new Temporal connection per request.
- Workflows still run inside the HTTP request, and a large selection starts all of them at once.

**Proposal:**

- Define timeouts and retry policies explicitly for every activity, including the upcoming enrichment providers.
- Use stable workflow IDs per lead and action (e.g. `verify-email-<leadId>`).
- Reuse a single Temporal client.
- Start workflows asynchronously and show progress in the UI.

### Clearer verification results

**Problem:** The toast says "Verified N emails" even when some of them are invalid, and "verified" reads as "valid".

**Proposal:** Show the outcome, e.g. "Checked 3 emails: 2 valid, 1 invalid". The backend already returns per-lead results, so it's a frontend-only change.

---

## 4. Scalability

### Shared or generated API types

**Problem:** Request and response types are written by hand on both sides and have already drifted. Adding a lead field means updating the schema, the routes, the message generator and the frontend types by hand.

**Proposal:** Generate the frontend types from the backend or share them through a common package, so TypeScript catches mismatches.

### Test coverage

**Problem:** Tests only cover pure utilities. There are no tests for the API routes, the Temporal workflows or the React components, which is where the bugs fixed in this task were.

**Proposal:** Add route tests for the main endpoints, workflow tests with mocked activities, and component tests for the import and message modals.

---

## Ideas for later

- **Template autocomplete:** suggest fields when the user types `{` in the message editor.
- **Field labels and groups:** show "Job title" instead of `jobTitle` in the message composer, grouped by Contact / Company / Social.
