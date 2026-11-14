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
| `/recommendations` | `Recommendations.jsx` | Illustrative scores; requires router state |
| `/student-profile` | `StudentProfile.jsx` | Separate profile in localStorage |

Questionnaire inputs are passed using `navigate('/recommendations', { state: { matchingProfile } })`. They are not saved as a server account; reloading or directly opening the Recommendations route may lose the state and show the questionnaire prompt. The student profile's localStorage is independent.

Sample data is in `src/data/companies.js` and `src/data/recommendations.js`. The current recommendation percentages are demo values, **not** output from a real matching algorithm. See the root `ARCHITECTURE.md` and `SPRINT_2.md` for proposed integration work.
