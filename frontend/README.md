# Frontend — React + Vite

> **Source review:** November 14–15, 2026, based on uploaded project archive (5). “Implemented” means code exists; live PostgreSQL, cloud access, browser behavior, and GitHub board status were not independently verified during this review. Earlier local checks were reported in conversation.

## Setup and checks
```bash
npm ci
npm run dev
npm run test:run
npm run lint
npm run build
```

Start the backend separately; API base URL defaults to `http://localhost:3001/api` and may be overridden by `VITE_API_BASE_URL`.

## Routes and data sources
| Route | Page | Data source |
|---|---|---|
| `/` | Home | Static UI |
| `/companies` | ExploreCompanies | `src/data/companies.js` local fixtures |
| `/companies/:companyId` | CompanyDetails | Local fixtures |
| `/matching-profile` | MatchingProfile / SavedMatchingProfile | GET/PUT `/api/matching-profile` |
| `/recommendations` | Recommendations | Saved profile API + `sampleRecommendations` |
| `/recommendations/:companySlug/details` | MatchDetails | Company API lookup, selected navigation data, demo prep content |
| `/student-profile` | StudentProfile | Browser localStorage, separate from matching profile |

## Saved matching profile
On `/matching-profile`, frontend loads `GET /api/matching-profile`. A 404 opens questionnaire; existing record opens `SavedMatchingProfile.jsx` with timestamp and Edit action; errors show retry instead of falsely treating a profile as absent. Saving uses `PUT /api/matching-profile`. Recommendations independently loads the profile so direct navbar access works when the API returns a saved profile.

## Important limits
- Recommendation cards are **sample recommendations**, not computed matches; score unavailable is shown.
- Explore Companies and Company Details are **not** database-connected yet.
- Match Details uses company API where possible; sample prep/checklist content does not imply computed explanations or persisted progress.
- Work preferences are not collected; saved profile UI states this explicitly.
- The backend uses one development-only student ID for all visitors; not a production login.

See `TESTING.md` for how to record new evidence.
