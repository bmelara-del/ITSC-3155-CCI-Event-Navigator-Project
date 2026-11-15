# Sprint 2 — Implementation Status and Remaining Work

> **Source review:** November 14–15, 2026, based on uploaded project archive (5). “Implemented” means code exists; live PostgreSQL, cloud access, browser behavior, and GitHub board status were not independently verified during this review. Earlier local checks were reported in conversation.

## Current status summary
**Issue #10 — Create Express API and PostgreSQL Database:** estimated **~85% of implementation effort**. This is not an official GitHub board percentage. API and database code are present; matching profile persistence API is implemented; matching score request/response contract and complete verification remain.

## Issue #10 acceptance criteria
| Criterion | Source review |
|---|---|
| Express server starts locally | Implemented in `backend/src/server.ts`; rerun to verify |
| PostgreSQL via environment variables | Implemented; earlier user-reported successful connection |
| Companies, roles, requirements stored | Schema, migrations, and seed present; confirm actual rows |
| List companies endpoint | GET `/api/companies` implemented |
| Company details endpoint | GET `/api/companies/:id` implemented |
| Agreed matching request/response contract | **Incomplete**: matching-profile GET/PUT is not a match-scoring endpoint |
| Development sample data | Seed script present; run against approved dev DB |
| API errors handled/documented | 400/404/500 paths and tests present; full coverage not established |
| Secrets excluded from Git | Ignore rules must be checked against tracked files and history |

## Assignment work: implemented vs evidence still required
| Workstream | Code/artifact present | Still needed |
|---|---|---|
| Database/ORM | Prisma schema, two migrations, seed, test script | Validate applied migrations and seed on each machine |
| Backend/API | Express, company GET routes, matching-profile GET/PUT | Confirm live requests, contract ownership, scoring API |
| UML | `docs/uml/*.puml` and SVGs | Verify diagrams match current code; capture required evidence |
| Database-integrated user story | Matching-profile read/create/update code | Demonstrate save → refresh/restart → retrieve → edit against PostgreSQL |
| Frontend integration | Saved profile and Match Details API lookup | Company directory/detail still fixture-based; match recommendations still samples |
| Team database | Setup guide | Shared cloud DB, teammate CRUD checks and screenshots |
| Security | `.env.example` / ignore configuration | Git tracking/history audit, avoid sharing `.env` |
| Tests | Backend route tests, frontend tests | Run fresh tests/lint/build/typecheck, record dated output |
| Scrum / collaboration | Git files and project documentation | Verify issue statuses, PRs, meaningful commits per teammate, board evidence |
| Release | No release established by source review | Create required Sprint 2 GitHub release and submit URLs |

## Recommended next sequence
1. Run `npm run db:migrate:deploy`, `npm run db:seed`, `npm run db:test` in approved local development DB; run backend tests and typecheck.
2. Manually save matching profile, reload page, restart browser/backend, retrieve and edit; inspect PostgreSQL records.
3. Wire Explore Companies and Company Details to existing company API.
4. Agree with team whether scoring endpoint belongs to #10 or #6; implement and test the chosen contract.
5. Complete shared cloud database and teammate operations; collect evidence.
6. Refresh UML, document test results, reconcile GitHub Projects and issue checklist, merge reviewed PRs, tag and publish Sprint 2 release.

## Evidence checklist
Record actual date, tester, branch/commit, test command and result, endpoint screenshots (without secrets), database operations, GitHub issue/PR links, and release link. Do not mark requirements complete from file presence alone.
