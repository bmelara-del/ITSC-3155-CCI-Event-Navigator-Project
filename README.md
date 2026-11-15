# CCI Career Navigator

ITSC 3155 · UNC Charlotte · Sprint 2 in progress

> **Source review:** November 14–15, 2026, based on uploaded project archive (5). “Implemented” means code exists; live PostgreSQL, cloud access, browser behavior, and GitHub board status were not independently verified during this review. Earlier local checks were reported in conversation.

## Purpose
Help CCI students explore companies and roles, record career interests and skills, view recommendations, and prepare for employer conversations. Current sample company/recommendation data is illustrative, not verified employer information.

## Current implementation
- React 19 + Vite 8, React Router 8, responsive green-and-white Figma-derived UI.
- Pages: Home, Explore Companies, Company Details, Matching Profile, Recommendations, Match Details & Prep, Student Profile.
- **Saved Matching Profile** is rendered inside `MatchingProfile.jsx` when `GET /api/matching-profile` finds a saved profile. Students can edit and save using `PUT /api/matching-profile`.
- Recommendations independently retrieves the saved profile and handles loading, missing-profile, and API-error states. **Recommendation cards are still sample fixtures, not calculated rankings.**
- Match Details retrieves company information through the API by slug-to-UUID lookup and includes demo preparation content; calculated match scores are unavailable.
- Explore Companies and Company Details still use `frontend/src/data/companies.js`, so database edits do not update those pages yet.
- Express 5 + Prisma 7 + PostgreSQL driver adapter, company endpoints, matching-profile endpoints, initial and matching-profile migrations, seed script, API tests.
- Student Profile is separate and uses browser localStorage; there is no production authentication.

## API routes
| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Server liveness only |
| GET | `/api/companies` | Database-backed company list |
| GET | `/api/companies/:id` | Database-backed company and role details by UUID |
| GET | `/api/matching-profile` | Saved development-student profile; 404 when absent |
| PUT | `/api/matching-profile` | Create/update saved development-student questionnaire |

There is **no implemented match-scoring API**. Matching profile identity is a hard-coded development-only UUID; all users of the same backend share that test profile. Do not use with real student data.

## Local setup
Requires Node.js 24+, npm, PostgreSQL and a locally configured `backend/.env` copied from `.env.example`.

```bash
cd backend
npm ci
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run db:test
npm run dev
```

In another terminal, from repository root:

```bash
cd frontend
npm ci
npm run dev
```

Default backend: `http://localhost:3001`; Vite usually: `http://localhost:5173`. Frontend API URL can be overridden with `VITE_API_BASE_URL`. Never put database credentials in frontend variables.

## Verification commands
Backend: `npm test`, `npm run typecheck`, `npm run db:validate`, `npm run db:test` (requires seeded local DB). Frontend: `npm run test:run`, `npm run lint`, `npm run build`.

## Remaining Sprint 2 work
1. Verify saved profile create/retrieve/update end-to-end, including browser restart.
2. Connect Explore Companies and Company Details to real company API data.
3. Agree on and implement match scoring/request-response contract, and use it in Recommendations and Match Details.
4. Verify teammates' local setup and a shared cloud development database.
5. Record fresh tests, PR/commit evidence, UML and release evidence.

See `ARCHITECTURE.md`, `SPRINT_2.md`, `TEAM_DATABASE_SETUP.md`, and the backend/frontend READMEs.
