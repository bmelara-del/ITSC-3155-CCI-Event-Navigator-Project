# Contributing to CCI Career Navigator

> **Source review:** November 14–15, 2026, based on uploaded project archive (5). “Implemented” means code exists; live PostgreSQL, cloud access, browser behavior, and GitHub board status were not independently verified during this review. Earlier local checks were reported in conversation.

## Branch and pull request workflow
1. Pull latest `main`; create a feature branch named for your issue.
2. Keep changes focused. Add/update tests and documentation.
3. Run the relevant checks before committing.
4. Inspect `git status`, `git diff --cached --name-only`, and `git diff --cached` to avoid credentials or unrelated changes.
5. Commit with a descriptive message, push your branch, open a PR, and link the corresponding GitHub Issue.
6. Ask a teammate to review and merge through the team's agreed process; update GitHub Projects status.

## Checks
Backend (`backend/`): `npm test`, `npm run typecheck`, `npm run db:validate`, `npm run db:test` (requires local DB).
Frontend (`frontend/`): `npm run test:run`, `npm run lint`, `npm run build`.

## Database changes
- Propose schema changes and review migration SQL before applying.
- Never run destructive migrations, resets, truncation, or data-overwriting seeds against shared environments without explicit team approval.
- Commit schema, migrations, and safe idempotent seed changes; never commit `backend/.env`.
- Each teammate uses their own local `DATABASE_URL`; cloud credentials must be distributed securely, not in Git.

## Current architecture caution
The matching profile uses a shared development-only student ID. Do not enter actual personal student data. Recommendations and company-directory pages still use fixtures; do not claim production matching or complete live-data integration.

## Sprint 2 collaboration evidence
Every teammate should make a meaningful commit and document their issue, PR, review, testing, and database operation. Confirm live board statuses before reporting completion.
