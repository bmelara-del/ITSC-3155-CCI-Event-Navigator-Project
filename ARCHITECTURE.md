# Architecture — Current Implementation

> **Source review:** November 14–15, 2026, based on uploaded project archive (5). “Implemented” means code exists; live PostgreSQL, cloud access, browser behavior, and GitHub board status were not independently verified during this review. Earlier local checks were reported in conversation.

## Data flow

```text
React + Vite
  |-- Explore Companies / Company Details --> local company fixtures (NOT API yet)
  |-- Recommendations --> GET /api/matching-profile + sampleRecommendations
  |-- MatchingProfile --> GET/PUT /api/matching-profile
  |-- MatchDetails --> GET /api/companies then GET /api/companies/:id
  |-- StudentProfile --> browser localStorage (separate)
           |
       Express 5 API
           |
     Repository functions
           |
   Prisma 7 / @prisma/adapter-pg
           |
       PostgreSQL
```

## Backend
- `backend/src/server.ts`: loads dotenv, constructs PostgreSQL pool and Prisma Client, starts Express on `PORT` (default 3001).
- `backend/src/app.ts`: CORS, JSON middleware, `/api/health`, company routes, matching profile routes, generic 500 handling.
- `backend/src/repositories/companyRepository.ts`: Prisma company queries and related roles/requirements.
- `backend/src/repositories/matchingProfileRepository.ts`: save/read matching profile, normalized skills/coursework relationships.
- `backend/src/routes/companyRoutes.ts`: GET list and GET UUID detail; unknown/malformed IDs return 404.
- `backend/src/routes/matchingProfileRoutes.ts`: GET profile; PUT validated questionnaire payload; 400/404/error handling.
- `backend/prisma/schema.prisma`: UUID-based companies, roles, skills, coursework, career interests, experience levels, matching profiles, join tables.
- `backend/prisma/migrations/`: initial migration and `20261114010000_saved_matching_profiles`.
- `backend/prisma/seed.ts`: illustrative development records.

## Matching profile contract
`PUT /api/matching-profile` accepts:

```json
{"careerInterest":"Software Engineering","skills":["SQL","Git"],"coursework":["Database Design"],"experienceLevel":"Beginner / No internship"}
```

GET/PUT responses include those fields plus `profileId`, `createdAt`, `updatedAt`. GET returns 404 if none exists. The frontend treats 404 as no profile; other failures display an error/retry state. A single fixed development student ID is configured in `backend/src/config/developmentStudent.ts`. **This is not authentication or multi-user isolation.**

## Frontend routing
`App.jsx` routes `/`, `/companies`, `/companies/:companyId`, `/matching-profile`, `/recommendations`, `/recommendations/:companySlug/details`, `/student-profile`. `SavedMatchingProfile.jsx` is a child view within `/matching-profile` rather than a standalone route.

## Known gaps and design decisions
- Recommendations use local sample fixtures; no algorithm, score calculation, or `/api/matches` route.
- Match Details combines API company records with sample/prep UI; scores and skill alignment are not computed.
- Explore Companies and Company Details still import local fixtures.
- Work preferences are not collected or stored in the matching questionnaire.
- Prep checklist completion is not stored in PostgreSQL.
- Production authentication, per-student authorization, cloud database proof, and deployed environment are absent/unverified.
- Coordinate score weights, normalization, explainability, selected role ID, and shared match API response with owners of matching and recommendations issues.

## Security
Keep `backend/.env` out of Git and shared ZIPs. Use `.env.example` placeholders. Do not expose database connection strings in Vite or browser code. Rotate credentials if any were committed or shared. Audit Git history, not only `.gitignore`.
