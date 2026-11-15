# CCI Career Navigator — Frontend

React + Vite single-page application for the ITSC 3155 project. This folder is the **frontend only**; the Sprint 2 backend and database are planned, not confirmed implemented in the uploaded source.

## Setup

From this directory:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite (often `http://localhost:5173`). Use `npm run build` for a production build and `npm run preview` to preview it.

## Checks

```bash
npm run test:run
npm run lint
npm run build
```

See [`TESTING.md`](TESTING.md) for historical verification evidence. This documentation update did not obtain a fresh passing test run.

## Routes

| Route | Component | Notes |
| --- | --- | --- |
| `/` | `Home.jsx` | Homepage; click navbar brand to return |
| `/companies` | `ExploreCompanies.jsx` | Local sample companies |
| `/companies/:companyId` | `CompanyDetails.jsx` | Company detail route |
| `/matching-profile` | `MatchingProfile.jsx` | Questionnaire |
| `/recommendations` | `Recommendations.jsx` | Sample companies; requires router state |
| `/recommendations/:companySlug/details` | `MatchDetails.jsx` | Selected recommendation or API company details |
| `/student-profile` | `StudentProfile.jsx` | Separate profile in localStorage |

Questionnaire inputs are passed using `navigate('/recommendations', { state: { matchingProfile } })`. They are not saved as a server account; reloading or directly opening the Recommendations route may lose the state and show the questionnaire prompt. The student profile's localStorage is independent.

Sample data is in `src/data/companies.js` and `src/data/recommendations.js`. Matching scores and explanations are unavailable; the app does not calculate them. See the root `ARCHITECTURE.md` and `SPRINT_2.md` for proposed integration work.

The Match Details route keeps a stable company slug in the URL. It uses the selected recommendation passed by React Router when available. When opened directly or refreshed, it looks up the slug through `GET /api/companies` followed by `GET /api/companies/:id`, then uses local sample data for a demo company if the API has no matching record or is unavailable. Set `VITE_API_BASE_URL` to override the default API base URL (`http://localhost:3001/api`).
