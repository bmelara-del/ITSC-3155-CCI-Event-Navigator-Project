# Backend — Express, Prisma 7, PostgreSQL

> **Source review:** November 14–15, 2026, based on uploaded project archive (5). “Implemented” means code exists; live PostgreSQL, cloud access, browser behavior, and GitHub board status were not independently verified during this review. Earlier local checks were reported in conversation.

## Implemented API
| Method | Route | Response |
|---|---|---|
| GET | `/api/health` | `{ "status": "ok", "message": "Server is running" }` (does not check DB) |
| GET | `/api/companies` | Array of company records from PostgreSQL |
| GET | `/api/companies/:id` | Company and related roles/requirements by UUID; 404 if missing |
| GET | `/api/matching-profile` | Saved dev-student matching profile; 404 if absent |
| PUT | `/api/matching-profile` | Create/update dev-student matching profile; 400 invalid input |

## Development
Requires Node.js >=24 and PostgreSQL. Copy `.env.example` to `.env` and configure private `DATABASE_URL`.

```bash
npm ci
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run db:test
npm run dev
```

Other commands: `npm test`, `npm run typecheck`, `npm run db:validate`, `npm run db:format`, `npm run db:migrate:dev` (only for approved schema development).

## Matching profile payload
```json
{"careerInterest":"Software Engineering","skills":["SQL","Git"],"coursework":["Database Design"],"experienceLevel":"Beginner / No internship"}
```

Response adds `profileId`, `createdAt`, `updatedAt`. Profile storage uses normalized catalog/join records and an upsert-style create/update operation. `backend/src/config/developmentStudent.ts` defines a **single hard-coded development student UUID**; there is no authentication or per-user authorization. Do not use for real student data or production.

## Files
- `src/server.ts`: PostgreSQL pool + Prisma adapter + HTTP server
- `src/app.ts`: routes, CORS, JSON and error middleware
- `src/routes/`: company and matching profile endpoints and tests
- `src/repositories/`: Prisma queries
- `prisma/schema.prisma`: database models and relations
- `prisma/migrations/`: initial and saved-matching-profile migrations
- `prisma/seed.ts`: illustrative seed data
- `scripts/test-db.ts`: company query connectivity check

## Limitations
No `/api/matches` scoring endpoint. Company details route takes UUID, not slug. Frontend Match Details translates slug using list lookup. Frontend Explore Companies/Company Details still use local fixtures. No deployed or shared-cloud environment verified in this review.
